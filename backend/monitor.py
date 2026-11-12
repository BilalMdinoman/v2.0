"""Position monitoring, auto-close, and agent-driven management.

- manage_open_positions() runs FAST (every ~40s): fetch the live price of every
  open position, update it, auto-close on stop-loss/take-profit (the hard
  deterministic safety floor), and refresh the account's unrealized PnL + equity.
- review_positions() runs on the slower scan loop: the squad (Orion) reviews
  open positions against live data and may CLOSE early or ADJUST stops/targets.
"""

from __future__ import annotations

import json
import uuid

from backend.execution.paper import ExecutionConfig, sell_proceeds
from backend.services import dexscreener, supabase_db
from backend.services.llm import extract_json


def _f(value) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def _close_position(position: dict, exit_price: float, config: ExecutionConfig, rationale: str) -> None:
    quantity = _f(position.get("token_quantity"))
    cost_basis = _f(position.get("amount_usd"))
    proceeds, _fill, _fee = sell_proceeds(quantity, exit_price, config)
    net_pnl = proceeds - cost_basis
    pnl_pct = (net_pnl / cost_basis * 100) if cost_basis else 0.0

    supabase_db.insert_trade(
        {
            "mint_address": position.get("mint_address", ""),
            "token_symbol": position.get("token_symbol", ""),
            "entry_price": _f(position.get("entry_price")),
            "exit_price": exit_price,
            "net_pnl_usd": round(net_pnl, 2),
            "pnl_pct": round(pnl_pct, 2),
            "result": "WIN" if net_pnl >= 0 else "LOSS",
            "rationale": rationale,
            "workflow_id": position.get("workflow_id", ""),
        }
    )
    supabase_db.delete_position(position["id"])

    state = supabase_db.get_account_state() or {}
    new_cash = _f(state.get("available_cash_usd")) + proceeds
    new_realized = _f(state.get("realized_pnl_usd")) + net_pnl
    new_daily = _f(state.get("daily_realized_pnl_usd")) + net_pnl
    supabase_db.update_account_state(
        {
            "available_cash_usd": round(new_cash, 2),
            "realized_pnl_usd": round(new_realized, 2),
            "daily_realized_pnl_usd": round(new_daily, 2),
        }
    )

    sign = "+" if net_pnl >= 0 else ""
    supabase_db.insert_blackboard(
        {
            "workflow_id": f"close-{uuid.uuid4().hex[:8]}",
            "agent_key": "elias",
            "message_type": "EXECUTION",
            "token_symbol": position.get("token_symbol", ""),
            "text": (
                f"Closed {position.get('token_symbol', '')} at {exit_price:.8g}: "
                f"{sign}{net_pnl:.2f} ({pnl_pct:+.1f}%) — {rationale}"
            ),
            "payload": {},
            "status": "OPEN",
        }
    )


def _refresh_account_equity() -> None:
    """Recompute unrealized PnL and equity from open positions."""
    positions = supabase_db.list_open_positions()
    unrealized = 0.0
    position_value = 0.0
    for p in positions:
        current = _f(p.get("current_price")) or _f(p.get("entry_price"))
        qty = _f(p.get("token_quantity"))
        cost = _f(p.get("amount_usd"))
        unrealized += (current * qty) - cost
        position_value += current * qty

    state = supabase_db.get_account_state() or {}
    cash = _f(state.get("available_cash_usd"))
    supabase_db.update_account_state(
        {
            "unrealized_pnl_usd": round(unrealized, 2),
            "equity_usd": round(cash + position_value, 2),
        }
    )


def manage_open_positions() -> int:
    """Fast deterministic pass: update prices, close on SL/TP, refresh equity."""
    positions = supabase_db.list_open_positions()
    config = ExecutionConfig()
    closed = 0
    for p in positions:
        mint = p.get("mint_address")
        if not mint:
            continue
        token = dexscreener.fetch_token(mint)
        if token is None or token["price_usd"] <= 0:
            continue
        current = token["price_usd"]
        supabase_db.update_position_price(p["id"], current)

        sl = _f(p.get("stop_loss_price"))
        tp = _f(p.get("take_profit_price"))
        if (sl and current <= sl) or (tp and current >= tp):
            _close_position(p, current, config, "hit stop-loss / take-profit")
            closed += 1

    _refresh_account_equity()
    return closed


def review_positions() -> int:
    """Agent-driven management: Orion reviews open positions and may close them early.

    We ask for a plain "CLOSE <symbol>" / "HOLD <symbol>" answer (not JSON, which
    the model was not following), then act on the words it actually wrote.
    """
    positions = supabase_db.list_open_positions()
    if not positions:
        return 0

    lines = []
    for p in positions:
        mint = p.get("mint_address")
        token = dexscreener.fetch_token(mint) if mint else None
        if token is None:
            continue
        entry = _f(p.get("entry_price"))
        current = token["price_usd"]
        change = ((current - entry) / entry * 100) if entry else 0.0
        symbol = str(p.get("token_symbol", "")).strip()
        lines.append(
            f"{symbol}: entry {entry:.8g}, now {current:.8g} ({change:+.1f}%), "
            f"stop {_f(p.get('stop_loss_price')):.8g}, target {_f(p.get('take_profit_price')):.8g}"
        )
    if not lines:
        return 0

    prompt = (
        "You are Orion managing these open paper positions. For EACH position reply on its own line "
        "exactly one of: 'CLOSE <symbol>' or 'HOLD <symbol>'. Only CLOSE if there is a real reason "
        "(momentum clearly reversed, drifting into the stop, or capital is better used elsewhere). "
        "Be decisive.\n" + "\n".join(lines)
    )

    from backend.agents.definitions import AGENTS

    text = AGENTS["orion"].run(prompt)
    supabase_db.insert_blackboard(
        {
            "workflow_id": f"review-{uuid.uuid4().hex[:8]}",
            "agent_key": "orion",
            "message_type": "SUPERVISION",
            "token_symbol": "",
            "text": text,
            "payload": {},
            "status": "OPEN",
        }
    )

    config = ExecutionConfig()
    upper = text.upper()
    changed = 0
    for p in positions:
        symbol = str(p.get("token_symbol", "")).strip().upper()
        if not symbol:
            continue
        if f"CLOSE {symbol}" in upper:
            mint = p.get("mint_address")
            token = dexscreener.fetch_token(mint) if mint else None
            if token and token["price_usd"] > 0:
                _close_position(p, token["price_usd"], config, "Orion closed it early")
                changed += 1

    _refresh_account_equity()
    return changed


def _post(agent_key: str, message_type: str, text: str, workflow_id: str) -> None:
    supabase_db.insert_blackboard(
        {
            "workflow_id": workflow_id,
            "agent_key": agent_key,
            "message_type": message_type,
            "token_symbol": "",
            "text": text,
            "payload": {},
            "status": "OPEN",
        }
    )


def reflect_on_new_trades(seen_trade_ids: set) -> set:
    """Post-trade reflection loop.

    When a new trade has closed, Argus audits it and proposes a concrete fix,
    Orion (master) reviews that fix, Cipher may counter-propose, and Orion makes
    the final call. The whole conversation is written to the blackboard so Bilal
    can watch the squad reason and improve. Runs automatically on new closed
    trades only — `seen_trade_ids` remembers which trades were already debated.
    """
    from backend.agents.definitions import AGENTS

    trades = supabase_db.list_recent_trades(limit=5)
    new_trades = [t for t in trades if t["id"] not in seen_trade_ids]
    if not new_trades:
        return seen_trade_ids

    wf = f"reflect-{uuid.uuid4().hex[:8]}"
    summary = json.dumps(
        [
            {
                "symbol": t.get("token_symbol", ""),
                "net_pnl": _f(t.get("net_pnl_usd")),
                "pnl_pct": _f(t.get("pnl_pct")),
                "result": t.get("result", ""),
            }
            for t in new_trades
        ]
    )

    # 1. Argus audits and proposes a concrete fix.
    argus_text = AGENTS["argus"].run(
        "Audit these closed paper trades. Give a short finding AND propose ONE concrete "
        "rule or behavior change to improve future results. Reply JSON only: "
        '{"finding": "...", "solution": "..."}\n' + summary
    )
    _post("argus", "AUDIT", argus_text, wf)
    data = extract_json(argus_text) or {}
    solution = str(data.get("solution") or argus_text)

    # 2. Orion (master) analyzes the proposal.
    orion_text = AGENTS["orion"].run(
        f"Argus proposes this change:\n\"{solution}\"\n\n"
        "As master, analyze it deeply. If it is sound, reply exactly ACCEPT. "
        "If not, reply CHALLENGE: <one specific reason>."
    )
    _post("orion", "SUPERVISION", orion_text, wf)

    if "ACCEPT" in orion_text.upper() and "CHALLENGE" not in orion_text.upper():
        _post("orion", "DECISION", f"Accepted Argus's proposal: {solution}", wf)
        supabase_db.insert_guideline(f"reflect-{uuid.uuid4().hex[:6]}", solution)
    else:
        # 3. Cipher counter-proposes.
        cipher_text = AGENTS["cipher"].run(
            f"Orion challenged Argus's proposal:\n\"{orion_text}\"\n\n"
            "Propose a better, concrete fix in one or two sentences."
        )
        _post("cipher", "RESPONSE", cipher_text, wf)

        # 4. Orion makes the final call.
        final_text = AGENTS["orion"].run(
            f"Argus proposed:\n\"{solution}\"\n\nCipher counter-proposed:\n\"{cipher_text}\"\n\n"
            "Decide which to adopt, or merge them. Give one short final decision."
        )
        _post("orion", "DECISION", final_text, wf)
        # Persist the agreed fix as an active guideline so future cycles follow it.
        supabase_db.insert_guideline(f"reflect-{uuid.uuid4().hex[:6]}", final_text)

    for t in new_trades:
        seen_trade_ids.add(t["id"])
    return seen_trade_ids
