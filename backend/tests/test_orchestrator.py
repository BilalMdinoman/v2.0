"""Self-running tests for the orchestrator's pure logic (no network, no DB).

Run with:  python -m backend.tests.test_orchestrator
"""

from backend.config import RiskConfig
from backend.orchestrator import (
    build_proposal,
    lupus_verdict,
    parse_nova_pick,
    should_execute,
    supervisor_go,
)
from backend.risk.engine import AccountSnapshot, ProposedEntry, assess_entry
from backend.services.llm import extract_json

TOKEN = {
    "mint": "MINT",
    "symbol": "WOOF",
    "price_usd": 0.04,
    "liquidity_usd": 500000,
    "volume_24h": 900000,
    "price_change_24h": 12.5,
    "buys_24h": 200,
    "sells_24h": 100,
}


def _snapshot(**kw) -> AccountSnapshot:
    defaults = dict(
        equity=100.0,
        available_cash=100.0,
        daily_trades=0,
        daily_realized_pnl=0.0,
        open_mints=frozenset(),
        total_open_exposure_usd=0.0,
    )
    defaults.update(kw)
    return AccountSnapshot(**defaults)


def main() -> None:
    # extract_json tolerates markdown fences and leading prose.
    assert extract_json('```json\n{"a": 1}\n```') == {"a": 1}
    assert extract_json('here is the answer: {"approved": true}') == {"approved": True}
    assert extract_json("no json here") is None

    # build_proposal parses entry+size and computes SL/TP from chosen percentages
    # (default 15% risk / 60% reward when Cipher omits them).
    cipher = '{"entry_price": 0.04, "size_usd": 5.0, "rationale": "momentum"}'
    p = build_proposal(TOKEN, cipher)
    assert p is not None
    assert p.mint_address == "MINT"
    assert p.token_symbol == "WOOF"
    assert p.entry_price == 0.04
    assert abs(p.stop_loss_price - 0.04 * 0.85) < 1e-9  # default 15% below entry
    assert abs(p.take_profit_price - 0.04 * 1.60) < 1e-9  # default 60% above entry
    assert p.size_usd == 5.0
    assert p.liquidity_usd == 500000

    # Cipher's chosen risk is clamped into the allowed band (50% max risk).
    c2 = '{"entry_price": 0.04, "size_usd": 10.0, "stop_loss_pct": 0.60, "take_profit_pct": 1.5}'
    p2 = build_proposal(TOKEN, c2)
    assert abs(p2.stop_loss_price - 0.04 * 0.50) < 1e-9  # 60% clamped to 50%
    assert abs(p2.take_profit_price - 0.04 * 2.5) < 1e-9  # 150% target kept

    # Cipher can decline the token outright.
    assert build_proposal(TOKEN, "NO_TRADE — no edge here") is None

    # Missing / non-positive numbers -> None (short-circuits the cycle).
    assert build_proposal(TOKEN, '{"size_usd": 5.0}') is not None  # entry falls back to token price
    assert build_proposal(TOKEN, '{"entry_price": 0.04}') is None  # no size
    assert build_proposal(TOKEN, "not json") is None

    # parse_nova_pick matches by mint, returns None on no match.
    cands = [TOKEN, {"mint": "OTHER", "symbol": "MEOW", "price_usd": 1.0}]
    assert parse_nova_pick('{"pick": "MINT"}', cands) == TOKEN
    assert parse_nova_pick('{"pick": "NOPE"}', cands) is None
    assert parse_nova_pick("garbage", cands) is None

    # lupus_verdict parses the bool and reason.
    assert lupus_verdict('{"approved": true, "reason": "safe"}') == (True, "safe")
    assert lupus_verdict('{"approved": false}') == (False, "")

    # supervisor_go is strict: explicit GO only, never a negation.
    assert supervisor_go("GO — approved") is True
    assert supervisor_go("NO-GO, too risky") is False
    assert supervisor_go("I reject this") is False
    assert supervisor_go("") is False

    # The authoritative gate: engine approved AND Orion GO.
    config = RiskConfig()
    good = ProposedEntry(
        mint_address="MINT", token_symbol="WOOF",
        entry_price=0.04, stop_loss_price=0.038, take_profit_price=0.048,
        size_usd=5.0, liquidity_usd=500000, estimated_slippage_pct=0.005,
    )
    ok_verdict = assess_entry(good, _snapshot(), config)
    assert ok_verdict.approved, ok_verdict.reasons
    assert should_execute(ok_verdict, True) is True
    assert should_execute(ok_verdict, False) is False

    # A position below the $5 minimum is rejected, and Orion's GO cannot override.
    tiny = ProposedEntry(
        mint_address="MINT", token_symbol="WOOF",
        entry_price=0.04, stop_loss_price=0.038, take_profit_price=0.048,
        size_usd=3.0, liquidity_usd=500000, estimated_slippage_pct=0.005,
    )
    reject = assess_entry(tiny, _snapshot(), config)
    assert reject.approved is False
    assert any("below $5" in r for r in reject.reasons)
    assert should_execute(reject, True) is False  # the key safety invariant

    print("test_orchestrator: all checks passed")


if __name__ == "__main__":
    main()
