"""Deterministic paper-execution engine.

Never let an LLM calculate or mutate the authoritative account ledger. This
engine applies fees, slippage, and PnL with pure, documented formulas, keeps the
ledger consistent, and prevents duplicate entries.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class ExecutionConfig:
    fee_pct: float = 0.001      # 0.1% per side
    slippage_pct: float = 0.005  # conservative 0.5% default assumption


@dataclass
class Position:
    position_id: str
    mint_address: str
    token_symbol: str
    entry_price: float      # reference market price at entry
    fill_price: float       # actual fill after slippage
    token_quantity: float
    cost_basis_usd: float   # cash committed (including entry fee)
    stop_loss_price: float
    take_profit_price: float
    opened_at: str


@dataclass
class ClosedTrade:
    position_id: str
    token_symbol: str
    entry_price: float
    exit_price: float
    net_pnl_usd: float
    pnl_pct: float
    result: str
    rationale: str
    closed_at: str


def buy_fill(size_usd: float, price: float, config: ExecutionConfig):
    """Fill a buy: you pay a higher price (slippage) and a fee. Returns
    (fill_price, token_quantity, fee_usd)."""
    fill_price = price * (1 + config.slippage_pct)
    fee = size_usd * config.fee_pct
    net = size_usd - fee
    quantity = net / fill_price
    return fill_price, quantity, fee


def sell_proceeds(quantity: float, price: float, config: ExecutionConfig):
    """Sell quantity: you receive a lower price (slippage) minus a fee. Returns
    (proceeds_usd, fill_price, fee_usd)."""
    fill_price = price * (1 - config.slippage_pct)
    gross = quantity * fill_price
    fee = gross * config.fee_pct
    return gross - fee, fill_price, fee


def check_exit(position: Position, current_price: float):
    """Return 'STOP_LOSS', 'TAKE_PROFIT', or None for a long position."""
    if current_price <= position.stop_loss_price:
        return "STOP_LOSS"
    if current_price >= position.take_profit_price:
        return "TAKE_PROFIT"
    return None


class PaperLedger:
    """In-memory paper ledger with deterministic accounting. The authoritative
    on-disk state lives in Supabase; this class is the reusable core."""

    def __init__(self, starting_balance: float = 100.0, config: ExecutionConfig | None = None):
        self.config = config or ExecutionConfig()
        self.starting_balance = starting_balance
        self.cash = starting_balance
        self.positions: dict[str, Position] = {}
        self.closed_trades: list[ClosedTrade] = []

    def open_position(
        self,
        position_id: str,
        mint: str,
        symbol: str,
        entry_price: float,
        size_usd: float,
        stop_loss: float,
        take_profit: float,
        opened_at: str,
    ) -> Position:
        if position_id in self.positions:
            raise ValueError("duplicate position id")
        if size_usd > self.cash:
            raise ValueError("insufficient cash")

        fill_price, quantity, _fee = buy_fill(size_usd, entry_price, self.config)
        position = Position(
            position_id=position_id,
            mint_address=mint,
            token_symbol=symbol,
            entry_price=entry_price,
            fill_price=fill_price,
            token_quantity=quantity,
            cost_basis_usd=size_usd,
            stop_loss_price=stop_loss,
            take_profit_price=take_profit,
            opened_at=opened_at,
        )
        self.positions[position_id] = position
        self.cash -= size_usd
        return position

    def close_position(
        self,
        position_id: str,
        exit_price: float,
        rationale: str,
        closed_at: str,
    ) -> ClosedTrade:
        position = self.positions.pop(position_id)
        proceeds, _fill_exit, _fee = sell_proceeds(
            position.token_quantity, exit_price, self.config
        )
        net_pnl = proceeds - position.cost_basis_usd
        pnl_pct = (net_pnl / position.cost_basis_usd * 100) if position.cost_basis_usd else 0.0
        # Keep full precision internally so the ledger reconciles exactly.
        # Rounding to 2 decimals happens at the persistence/display layer.
        trade = ClosedTrade(
            position_id=position_id,
            token_symbol=position.token_symbol,
            entry_price=position.entry_price,
            exit_price=exit_price,
            net_pnl_usd=net_pnl,
            pnl_pct=round(pnl_pct, 2),
            result="WIN" if net_pnl >= 0 else "LOSS",
            rationale=rationale,
            closed_at=closed_at,
        )
        self.closed_trades.append(trade)
        self.cash += proceeds
        return trade

    def equity(self, current_prices: dict[str, float]) -> float:
        position_value = sum(
            p.token_quantity * current_prices.get(p.position_id, p.entry_price)
            for p in self.positions.values()
        )
        return self.cash + position_value

    def realized_pnl(self) -> float:
        return sum(t.net_pnl_usd for t in self.closed_trades)
