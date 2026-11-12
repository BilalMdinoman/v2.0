"""Deterministic risk engine — the authoritative safety core.

LLM approvals are recommendations only. A paper trade is permitted ONLY if this
engine approves it. It is pure, deterministic Python with no I/O, so it is fully
unit-testable and cannot be influenced by any model output.
"""

from __future__ import annotations

from dataclasses import dataclass

from backend.config import RiskConfig


@dataclass(frozen=True)
class ProposedEntry:
    mint_address: str
    token_symbol: str
    entry_price: float
    stop_loss_price: float
    take_profit_price: float
    size_usd: float
    liquidity_usd: float
    estimated_slippage_pct: float  # 0.0 .. 1.0


@dataclass(frozen=True)
class AccountSnapshot:
    equity: float
    available_cash: float
    daily_trades: int
    daily_realized_pnl: float
    open_mints: frozenset  # mints with an open position (duplicate-entry check)
    total_open_exposure_usd: float


@dataclass(frozen=True)
class RiskVerdict:
    approved: bool
    reasons: tuple = ()


def sl_pct(entry: float, sl: float) -> float:
    return (entry - sl) / entry if entry else 0.0


def tp_pct(entry: float, tp: float) -> float:
    return (tp - entry) / entry if entry else 0.0


def reward_risk(entry: float, sl: float, tp: float) -> float:
    risk = entry - sl
    reward = tp - entry
    return reward / risk if risk > 0 else 0.0


def assess_entry(
    proposal: ProposedEntry,
    account: AccountSnapshot,
    config: RiskConfig,
) -> RiskVerdict:
    """Independently validate a proposed entry. Approve only if every rule passes."""
    reasons: list[str] = []

    if config.paused:
        reasons.append("system paused")
    if proposal.mint_address in account.open_mints:
        reasons.append("duplicate entry: mint already held")
    if account.daily_trades >= config.daily_trade_cap:
        reasons.append("daily trade cap reached")

    # Position size: agents choose freely between $5 and $25. $5 is the hard
    # floor; $25 is a soft ceiling (guidance only). Real cash is the hard cap.
    if proposal.size_usd < config.min_position_usd:
        reasons.append("position below $5 minimum")
    if proposal.size_usd > account.available_cash:
        reasons.append("insufficient cash")

    if proposal.entry_price <= 0:
        reasons.append("invalid entry price")
    if proposal.stop_loss_price >= proposal.entry_price:
        reasons.append("stop-loss must be below entry")
    if proposal.take_profit_price <= proposal.entry_price:
        reasons.append("take-profit must be above entry")

    sl = sl_pct(proposal.entry_price, proposal.stop_loss_price)
    tp = tp_pct(proposal.entry_price, proposal.take_profit_price)
    if not (config.min_sl_pct <= sl <= config.max_sl_pct):
        reasons.append("stop-loss outside allowed range")
    if not (config.min_tp_pct <= tp <= config.max_tp_pct):
        reasons.append("take-profit outside allowed range")
    if reward_risk(proposal.entry_price, proposal.stop_loss_price, proposal.take_profit_price) < config.min_reward_risk:
        reasons.append("reward-to-risk below minimum")

    if proposal.liquidity_usd < config.min_liquidity_usd:
        reasons.append("liquidity too low")
    if proposal.estimated_slippage_pct > config.max_slippage_pct:
        reasons.append("estimated slippage too high")

    if account.total_open_exposure_usd + proposal.size_usd > config.max_portfolio_exposure_pct * account.equity:
        reasons.append("portfolio exposure limit reached")

    daily_loss_limit = config.daily_loss_limit_pct * config.starting_balance_usd
    if account.daily_realized_pnl <= -daily_loss_limit:
        reasons.append("daily loss limit reached")

    return RiskVerdict(approved=len(reasons) == 0, reasons=tuple(reasons))
