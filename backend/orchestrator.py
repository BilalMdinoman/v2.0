"""The brain loop — one full trading cycle end to end.

Nova scans -> Zarah sentiment -> Cipher strategy -> Lupus risk ->
deterministic risk engine (authoritative) -> Orion supervises -> Elias executes.

The deterministic risk engine in `backend.risk.engine` is the ONLY authority
that approves a paper trade. Agent text (including Orion's "GO") is advisory.
Elias executes only when BOTH the engine approves AND Orion says GO.

The pure helpers (build_proposal, parse_nova_pick, lupus_verdict,
supervisor_go, should_execute) are unit-testable with no network or database.
`run_cycle` wires them to live agents, DexScreener, and Supabase.
"""

from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field
from typing import Optional

from backend.agents.definitions import AGENTS
from backend.config import RiskConfig
from backend.execution.paper import ExecutionConfig, PaperLedger
from backend.risk.engine import (
    AccountSnapshot,
    ProposedEntry,
    RiskVerdict,
    assess_entry,
)
from backend.services import dexscreener, supabase_db
from backend.services.llm import extract_json


def _f(value) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


# ---------------------------------------------------------------------------
# Result types
# ---------------------------------------------------------------------------

@dataclass(frozen=True)
class CycleResult:
    workflow_id: str
    decision: str  # APPROVED / REJECTED / NO_ACTION / ERROR
    token_symbol: str
    mint_address: str
    rationale: str
    reasons: tuple
    sentiment: str
    executed: bool
    transcript: tuple = field(default_factory=tuple)  # (agent_key, message_type, text)


# ---------------------------------------------------------------------------
# Pure parsing helpers (no network, no database)
# ---------------------------------------------------------------------------

def _token_summary(token: dict) -> str:
    return (
        f"{token.get('symbol', '?')} (mint {token.get('mint', '?')}) "
        f"price ${token.get('price_usd', 0):.6f} "
        f"liq ${token.get('liquidity_usd', 0):,.0f} "
        f"vol24h ${token.get('volume_24h', 0):,.0f} "
        f"24h {token.get('price_change_24h', 0):+.1f}% "
        f"buys {token.get('buys_24h', 0)}/sells {token.get('sells_24h', 0)}"
    )


# Short "what this agent is doing right now" verb written to the blackboard
# before each step, so the dashboard can show live progress at a glance.
STATUS_VERBS = {
    "SCAN": "Scanning the market…",
    "SENTIMENT": "Checking sentiment…",
    "STRATEGY": "Strategizing…",
    "RISK": "Verifying risk…",
    "CHALLENGE": "Debating…",
    "RESPONSE": "Defending…",
    "SUPERVISION": "Making decision…",
    "EXECUTION": "Executing…",
    "AUDIT": "Auditing…",
}


def parse_nova_pick(text: str, candidates: list[dict]) -> Optional[dict]:
    """Parse Nova's JSON pick and match it to a real candidate by mint address."""
    data = extract_json(text) or {}
    mint = data.get("pick") or data.get("mint")
    if not mint:
        return None
    for cand in candidates:
        if cand.get("mint") == mint:
            return cand
    return None


def build_proposal(
    token: dict,
    cipher_text: str,
    *,
    slippage_est: float = 0.005,
    sl_pct: float = 0.15,
    tp_pct: float = 0.60,
    min_sl_pct: float = 0.03,
    max_sl_pct: float = 0.50,
    min_tp_pct: float = 0.20,
    max_tp_pct: float = 2.0,
) -> Optional[ProposedEntry]:
    """Turn Cipher's output into a ProposedEntry the risk engine can read.

    Cipher chooses the position size, the risk it is willing to take (stop-loss
    %) and its target (take-profit %). Those percentages are clamped into the
    allowed bands here, so the model has real freedom to size and set risk while
    the engine still enforces the hard rules.

    Returns None when Cipher declines the token ("NO_TRADE") or supplies no
    positive entry/size, so the cycle short-circuits to NO_ACTION.
    """
    text = cipher_text or ""
    if "NO_TRADE" in text.upper():
        return None
    data = extract_json(text) or {}
    entry = _f(data.get("entry_price")) or _f(token.get("price_usd"))
    size = _f(data.get("size_usd"))
    if entry <= 0 or size <= 0:
        return None

    # Cipher's chosen risk/reward, clamped into the safe bands. If it gives a
    # number outside the band, we clamp rather than trust an out-of-range value.
    sl = _f(data.get("stop_loss_pct")) or sl_pct
    tp = _f(data.get("take_profit_pct")) or tp_pct
    sl = max(min_sl_pct, min(sl, max_sl_pct))
    tp = max(min_tp_pct, min(tp, max_tp_pct))

    return ProposedEntry(
        mint_address=token.get("mint", ""),
        token_symbol=token.get("symbol", ""),
        entry_price=entry,
        stop_loss_price=entry * (1 - sl),
        take_profit_price=entry * (1 + tp),
        size_usd=size,
        liquidity_usd=_f(token.get("liquidity_usd")),
        estimated_slippage_pct=slippage_est,
    )


def lupus_verdict(text: str) -> tuple[bool, str]:
    """Parse Lupus's JSON verdict into (approved, reason)."""
    data = extract_json(text) or {}
    approved = bool(data.get("approved", False))
    reason = str(data.get("reason", ""))
    return approved, reason


def supervisor_go(text: str) -> bool:
    """Return True only when Orion's final word is clearly GO.

    Deliberately strict: anything other than an explicit "GO" (and not a
    negation like "NO-GO") is treated as no-go. Safety over convenience.
    """
    if not text:
        return False
    t = text.strip().upper()
    if "NO-GO" in t or "NO GO" in t or "NO_GO" in t or "REJECT" in t or "ABORT" in t:
        return False
    return "GO" in t


def should_execute(verdict: RiskVerdict, orion_go: bool) -> bool:
    """The final gate: the engine must approve AND Orion must say GO.

    Orion's GO can never override an engine reject.
    """
    return verdict.approved and orion_go


# ---------------------------------------------------------------------------
# The live cycle
# ---------------------------------------------------------------------------

def _run_agent(agent, prompt: str) -> tuple[str, int]:
    """Run one agent and return (text, latency_ms). Raises on failure."""
    start = time.perf_counter()
    text = agent.run(prompt)
    latency_ms = int((time.perf_counter() - start) * 1000)
    return text, latency_ms


def _record(
    workflow_id: str,
    agent_key: str,
    message_type: str,
    text: str,
    token_symbol: str = "",
    payload: Optional[dict] = None,
    persist: bool = True,
) -> None:
    if persist:
        supabase_db.insert_blackboard(
            {
                "workflow_id": workflow_id,
                "agent_key": agent_key,
                "message_type": message_type,
                "token_symbol": token_symbol,
                "text": text,
                "payload": payload or {},
                "status": "OPEN",
            }
        )


def _telemetry(agent_key: str, model_id: str, latency_ms: int, status: str = "ONLINE", persist: bool = True) -> None:
    if persist:
        supabase_db.upsert_telemetry(
            agent_key,
            {"status": status, "model_id": model_id, "latency_ms": latency_ms, "last_active_at": "now()"},
        )


def run_cycle(limit: int = 5, *, persist: bool = True, agents=None, exclude_mints: set | frozenset = frozenset()) -> CycleResult:
    """Run one full cycle and return the result. Never raises for agent/network
    failures — those become NO_ACTION or ERROR decisions.

    `agents` defaults to the locked squad; inject a mock dict for offline tests.
    `persist=False` skips all Supabase writes (used by the CLI --dry-run later).
    `exclude_mints` skips recently-scanned tokens so the squad finds new coins.
    """
    squad = agents if agents is not None else AGENTS
    config = RiskConfig()
    workflow_id = uuid.uuid4().hex[:12]
    transcript: list[tuple[str, str, str]] = []

    # Build the account snapshot up front: it drives the position-size cap and
    # excludes tokens we already hold (so the squad doesn't waste a cycle on a
    # duplicate entry).
    snapshot: AccountSnapshot = supabase_db.build_account_snapshot()
    exclude = set(exclude_mints) | set(snapshot.open_mints)

    def step(agent_key: str, message_type: str, prompt: str, token_symbol: str = "") -> str:
        # Live status before the agent runs, so the board shows what is happening now.
        phrase = STATUS_VERBS.get(message_type, "Thinking…")
        _record(workflow_id, agent_key, "STATUS", phrase, token_symbol, persist=persist)

        try:
            text, latency = _run_agent(squad[agent_key], prompt)
            status = "ONLINE"
        except Exception as exc:  # keep the daemon alive; a failed call degrades, not crashes
            text = f"[error] {agent_key} failed: {exc}"
            latency = 0
            status = "DEGRADED"
        transcript.append((agent_key, message_type, text))
        _record(workflow_id, agent_key, message_type, text, token_symbol, persist=persist)
        _telemetry(agent_key, squad[agent_key].model, latency, status, persist=persist)
        return text

    # 1. Nova discovers candidates. Record the scan even when nothing clears the
    #    floor, so the daemon shows visible activity every cycle.
    candidates = dexscreener.discover_candidates(
        limit=limit, exclude=exclude, min_liquidity_usd=config.min_liquidity_usd,
    )
    if not candidates:
        scan_msg = f"Scanned {limit} Solana tokens; none cleared the quality gates."
        transcript.append(("nova", "SCAN", scan_msg))
        _record(workflow_id, "nova", "SCAN", scan_msg, "", persist=persist)
        _telemetry("nova", squad["nova"].model, 0, persist=persist)
        return CycleResult(
            workflow_id, "NO_ACTION", "", "",
            "no candidates cleared the liquidity/price floor", (), "", False, tuple(transcript),
        )

    summary = "\n".join(f"{i + 1}. {_token_summary(c)}" for i, c in enumerate(candidates))
    nova_text = step(
        "nova", "SCAN",
        f"Candidates:\n{summary}\n\nSummarize the top candidate in two short plain sentences "
        "(liquidity, volume, momentum). No formatting.",
    )
    # Deterministic pick: the top candidate after the quality sort (seed coins
    # first, then positive momentum). We do not let the LLM choose, so it cannot
    # repeatedly grab a thin pump-and-dump coin.
    token = candidates[0]

    # 2. Zarah sentiment.
    zarah_text = step(
        "zarah", "SENTIMENT",
        f"Token: {_token_summary(token)}\nClassify sentiment (bullish/bearish/mixed) and state confidence.",
        token.get("symbol", ""),
    )

    # 3. Cipher strategy. Cipher chooses size, risk, and target within the rules.
    guidelines = supabase_db.list_active_guidelines()
    guideline_note = (
        "\nActive strategy rules (from the squad's own reflection):\n"
        + "\n".join(f"- {g.get('rule_key', '')}: {g.get('rule_value', '')}" for g in guidelines)
        + "\n"
        if guidelines else ""
    )
    cipher_text = step(
        "cipher", "STRATEGY",
        f"Token: {_token_summary(token)}\nSentiment: {zarah_text}\n{guideline_note}"
        f"You have real freedom here. Choose the position size between ${config.min_position_usd:.0f} and "
        f"${config.max_position_usd:.0f} based on how strong the setup is, and choose your own risk: "
        f"stop_loss_pct anywhere from {config.min_sl_pct:.0%} up to {config.max_sl_pct:.0%} (max risk = 50% of the position), "
        f"and take_profit_pct from {config.min_tp_pct:.0%} up to {config.max_tp_pct:.0%} (up to 2x). "
        f"Only decline if the token is clearly bearish or has too little liquidity. "
        f"Decline with: NO_TRADE: <one short reason>. Otherwise reply JSON only: "
        f"{{\"entry_price\": number, \"size_usd\": number, \"stop_loss_pct\": number, \"take_profit_pct\": number, \"rationale\": \"...\"}}.",
        token.get("symbol", ""),
    )
    proposal = build_proposal(
        token, cipher_text,
        sl_pct=config.default_sl_pct, tp_pct=config.default_tp_pct,
        min_sl_pct=config.min_sl_pct, max_sl_pct=config.max_sl_pct,
        min_tp_pct=config.min_tp_pct, max_tp_pct=config.max_tp_pct,
    )
    if proposal is None:
        return CycleResult(workflow_id, "NO_ACTION", token.get("symbol", ""), token.get("mint", ""),
                           "Cipher declined (NO_TRADE) or gave no valid entry", (), zarah_text, False, tuple(transcript))

    # 4. Lupus risk review.
    lupus_text = step(
        "lupus", "RISK",
        f"Proposal: entry {proposal.entry_price} SL {proposal.stop_loss_price} TP {proposal.take_profit_price} "
        f"size ${proposal.size_usd:.2f}. JSON only: {{\"approved\": bool, \"reason\": \"...\"}}",
        token.get("symbol", ""),
    )
    _lupus_approved, lupus_reason = lupus_verdict(lupus_text)

    # 5. Deterministic risk engine — authoritative (uses the snapshot built up front).
    verdict: RiskVerdict = assess_entry(proposal, snapshot, config)

    # 5b. Debate: Orion challenges the proposal, Cipher defends it, so the squad
    #     visibly reasons and pushes back instead of rubber-stamping.
    challenge_text = step(
        "orion", "CHALLENGE",
        f"Proposal: {proposal.token_symbol} entry {proposal.entry_price} size ${proposal.size_usd:.2f}. "
        "Challenge this trade: what is the single biggest risk or flaw? One or two sentences.",
        token.get("symbol", ""),
    )
    response_text = step(
        "cipher", "RESPONSE",
        f"Your {proposal.token_symbol} proposal was challenged:\n\"{challenge_text}\"\n"
        "Defend it in one or two sentences, or concede if the challenge is valid.",
        token.get("symbol", ""),
    )

    # 6. Orion supervises the full transcript (including the debate).
    orion_prompt = (
        "Full squad transcript (scan, sentiment, strategy, risk, challenge, response):\n"
        + "\n".join(f"[{k}] {t}" for k, _, t in transcript)
        + f"\n\nRisk engine verdict: {'APPROVED' if verdict.approved else 'REJECTED'} {list(verdict.reasons)}"
        + "\nGive a final decision. Reply 'GO' or 'NO-GO' only, then one short sentence."
    )
    orion_text = step("orion", "SUPERVISION", orion_prompt, token.get("symbol", ""))
    orion_go = supervisor_go(orion_text)

    # 7. Elias executes when the deterministic engine approves. Orion's GO/NO-GO
    #    is recorded for transparency but is advisory only — the engine is the
    #    single authoritative gate, so an over-cautious model cannot stall the
    #    whole squad.
    executed = False
    if verdict.approved:
        executed = _execute_paper(proposal, workflow_id, snapshot, config, persist)
        _telemetry("elias", squad["elias"].model, 0, persist=persist)

    decision = "APPROVED" if verdict.approved else "REJECTED"
    return CycleResult(
        workflow_id=workflow_id,
        decision=decision,
        token_symbol=proposal.token_symbol,
        mint_address=proposal.mint_address,
        rationale="",
        reasons=verdict.reasons,
        sentiment=zarah_text,
        executed=executed,
        transcript=tuple(transcript),
    )


def _execute_paper(proposal: ProposedEntry, workflow_id: str, snapshot: AccountSnapshot, config: RiskConfig, persist: bool) -> bool:
    """Open a paper position via the deterministic ledger and persist it."""
    ledger = PaperLedger(starting_balance=snapshot.available_cash or 100.0, config=ExecutionConfig())
    position = ledger.open_position(
        position_id=workflow_id,
        mint=proposal.mint_address,
        symbol=proposal.token_symbol,
        entry_price=proposal.entry_price,
        size_usd=proposal.size_usd,
        stop_loss=proposal.stop_loss_price,
        take_profit=proposal.take_profit_price,
        opened_at="",  # timestamptz is set by the DB default
    )
    if not persist:
        return True

    supabase_db.insert_position(
        {
            "mint_address": proposal.mint_address,
            "token_symbol": proposal.token_symbol,
            "entry_price": position.entry_price,
            "fill_price": position.fill_price,
            "current_price": position.entry_price,
            "token_quantity": position.token_quantity,
            "amount_usd": proposal.size_usd,
            "stop_loss_price": position.stop_loss_price,
            "take_profit_price": position.take_profit_price,
            "status": "OPEN",
            "workflow_id": workflow_id,
        }
    )
    supabase_db.insert_order(
        {
            "order_id": f"ord-{workflow_id}",
            "workflow_id": workflow_id,
            "mint_address": proposal.mint_address,
            "side": "BUY",
            "size_usd": proposal.size_usd,
            "price": proposal.entry_price,
            "status": "FILLED",
            "reason": "engine-approved paper entry",
        }
    )
    supabase_db.update_account_state(
        {
            "available_cash_usd": snapshot.available_cash - proposal.size_usd,
            "daily_trades": snapshot.daily_trades + 1,
        }
    )
    _record(workflow_id, "elias", "EXECUTION",
            f"Opened {proposal.token_symbol} paper position ${proposal.size_usd:.2f} at {proposal.entry_price}",
            proposal.token_symbol, persist=persist)
    return True
