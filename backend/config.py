"""Authoritative risk limits and execution parameters.

These are the protected, versioned safety settings. Agents (LLMs) may propose
changes, but changes only take effect through the controlled strategy/config
workflow — never by an LLM writing directly here.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class RiskConfig:
    # Account
    starting_balance_usd: float = 100.0

    # Position sizing — agents choose freely within these dollar bounds.
    min_position_usd: float = 5.0             # hard floor: never below $5
    max_position_usd: float = 25.0            # soft ceiling: guidance, not a hard cap
    max_portfolio_exposure_pct: float = 0.60  # max 60% of equity across open positions

    # Daily limits
    daily_trade_cap: int = 10
    daily_loss_limit_pct: float = 0.10        # stop new entries at -10% of starting balance

    # Stop-loss / take-profit bounds (magnitude as a fraction of entry price).
    # The stop-loss is the max risk the agent can take on a position: up to 50%
    # of the position's value. Take-profit can run up to 2x (200%).
    min_sl_pct: float = 0.03
    max_sl_pct: float = 0.50
    min_tp_pct: float = 0.20
    max_tp_pct: float = 2.0

    # Default stop-loss / take-profit the engine applies when an agent does not
    # supply its own. 15% risk vs 60% reward is a sensible middle default.
    default_sl_pct: float = 0.15
    default_tp_pct: float = 0.60

    # Quality gates
    min_reward_risk: float = 1.0
    min_liquidity_usd: float = 5_000.0        # reject if liquidity is under $5k (meme coins are thin)
    max_slippage_pct: float = 0.01           # reject if estimated slippage > 1%

    # Safety switch (persisted elsewhere; this is the in-memory authoritative copy)
    paused: bool = False

    def validate(self) -> list[str]:
        """Return a list of config errors (empty means valid)."""
        errors: list[str] = []
        if not (0 < self.min_position_usd <= self.max_position_usd):
            errors.append("position bounds must satisfy 0 < min_position <= max_position")
        if not (0 < self.max_portfolio_exposure_pct <= 1):
            errors.append("max_portfolio_exposure_pct must be in (0, 1]")
        if self.daily_trade_cap < 0:
            errors.append("daily_trade_cap must be >= 0")
        if not (0 < self.min_sl_pct <= self.max_sl_pct):
            errors.append("SL bounds must satisfy 0 < min_sl <= max_sl")
        if not (0 < self.min_tp_pct <= self.max_tp_pct):
            errors.append("TP bounds must satisfy 0 < min_tp <= max_tp")
        if self.min_reward_risk <= 0:
            errors.append("min_reward_risk must be > 0")
        if self.min_liquidity_usd < 0:
            errors.append("min_liquidity_usd must be >= 0")
        if not (0 <= self.max_slippage_pct < 1):
            errors.append("max_slippage_pct must be in [0, 1)")
        if self.daily_loss_limit_pct <= 0:
            errors.append("daily_loss_limit_pct must be > 0")
        return errors
