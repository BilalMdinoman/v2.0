"""Self-running tests for the paper-execution engine.

Run with:  python -m backend.tests.test_execution
"""

from backend.execution.paper import (
    ExecutionConfig,
    PaperLedger,
    buy_fill,
    check_exit,
    sell_proceeds,
)


def main() -> None:
    cfg = ExecutionConfig()

    # buy fill: slippage + fee
    fill, qty, fee = buy_fill(100.0, 1.0, cfg)
    assert abs(fill - 1.005) < 1e-9
    assert abs(fee - 0.1) < 1e-9
    assert abs(qty - (99.9 / 1.005)) < 1e-9

    # sell proceeds: slippage + fee
    proceeds, fill_exit, _fee = sell_proceeds(100.0, 1.0, cfg)
    assert abs(fill_exit - 0.995) < 1e-9
    gross = 100.0 * 0.995
    assert abs(proceeds - (gross - gross * 0.001)) < 1e-9

    # open a position, verify cash movement and cost basis
    ledger = PaperLedger(starting_balance=100.0, config=cfg)
    pos = ledger.open_position("p1", "mintA", "TOK", 1.0, 5.0, 0.93, 1.35, "2026-11-04T00:00:00Z")
    assert abs(ledger.cash - 95.0) < 1e-9
    assert pos.cost_basis_usd == 5.0

    # exit triggers
    assert check_exit(pos, 0.90) == "STOP_LOSS"
    assert check_exit(pos, 1.40) == "TAKE_PROFIT"
    assert check_exit(pos, 1.10) is None

    # close with profit
    trade = ledger.close_position("p1", 1.35, "TP hit", "2026-11-04T01:00:00Z")
    assert trade.result == "WIN"
    assert trade.net_pnl_usd > 0

    # reconciliation: with no open positions, equity == starting + realized
    assert abs(ledger.equity({}) - (100.0 + ledger.realized_pnl())) < 1e-6

    # duplicate id raises
    l2 = PaperLedger(starting_balance=100.0, config=cfg)
    l2.open_position("p1", "mintA", "TOK", 1.0, 5.0, 0.93, 1.35, "t")
    try:
        l2.open_position("p1", "mintB", "TOK2", 1.0, 5.0, 0.9, 1.2, "t")
        raise AssertionError("expected duplicate position id error")
    except ValueError:
        pass

    # insufficient cash raises
    try:
        PaperLedger(starting_balance=100.0, config=cfg).open_position(
            "p1", "mintA", "TOK", 1.0, 200.0, 0.9, 1.2, "t"
        )
        raise AssertionError("expected insufficient cash error")
    except ValueError:
        pass

    print("test_execution: all checks passed")


if __name__ == "__main__":
    main()
