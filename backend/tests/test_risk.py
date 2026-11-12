"""Self-running tests for the deterministic risk engine.

Run with:  python -m backend.tests.test_risk
"""

from backend.config import RiskConfig
from backend.risk.engine import (
    AccountSnapshot,
    ProposedEntry,
    assess_entry,
)


def make_account(**kw) -> AccountSnapshot:
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


def make_entry(**kw) -> ProposedEntry:
    defaults = dict(
        mint_address="mintA",
        token_symbol="TOK",
        entry_price=1.0,
        stop_loss_price=0.93,
        take_profit_price=1.35,
        size_usd=5.0,
        liquidity_usd=200_000.0,
        estimated_slippage_pct=0.002,
    )
    defaults.update(kw)
    return ProposedEntry(**defaults)


def main() -> None:
    cfg = RiskConfig()
    acct = make_account()

    # 1. valid proposal is approved
    assert assess_entry(make_entry(), acct, cfg).approved

    # 2. position below the $5 minimum
    assert not assess_entry(make_entry(size_usd=3.0), acct, cfg).approved

    # 3. daily trade cap
    assert not assess_entry(make_entry(), make_account(daily_trades=10), cfg).approved

    # 4. insufficient cash
    assert not assess_entry(make_entry(size_usd=5.0), make_account(available_cash=2.0), cfg).approved

    # 5. duplicate entry
    assert not assess_entry(make_entry(), make_account(open_mints=frozenset(["mintA"])), cfg).approved

    # 6. stop-loss above entry
    assert not assess_entry(make_entry(stop_loss_price=1.1), acct, cfg).approved

    # 7. take-profit below entry
    assert not assess_entry(make_entry(take_profit_price=0.9), acct, cfg).approved

    # 8. stop-loss too tight (1% < 3% minimum)
    assert not assess_entry(make_entry(stop_loss_price=0.99), acct, cfg).approved

    # 9. take-profit too far (250% > 200% maximum)
    assert not assess_entry(make_entry(take_profit_price=3.5), acct, cfg).approved

    # 10. reward-to-risk below minimum (R:R 0.4 < 1.0)
    assert not assess_entry(
        make_entry(entry_price=1.0, stop_loss_price=0.50, take_profit_price=1.20),
        acct,
        cfg,
    ).approved

    # 11. liquidity too low
    assert not assess_entry(make_entry(liquidity_usd=1_000.0), acct, cfg).approved

    # 12. slippage too high
    assert not assess_entry(make_entry(estimated_slippage_pct=0.05), acct, cfg).approved

    # 13. portfolio exposure (58 + 5 > 60% of 100)
    assert not assess_entry(make_entry(size_usd=5.0), make_account(total_open_exposure_usd=58.0), cfg).approved

    # 14. paused
    assert not assess_entry(make_entry(), acct, RiskConfig(paused=True)).approved

    # 15. daily loss limit (-15 <= -10% of 100)
    assert not assess_entry(make_entry(), make_account(daily_realized_pnl=-15.0), cfg).approved

    # config validation
    assert RiskConfig().validate() == []
    assert RiskConfig(min_position_usd=10.0, max_position_usd=5.0).validate() != []

    print("test_risk: all 15 checks passed")


if __name__ == "__main__":
    main()
