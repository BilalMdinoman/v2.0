"""Supabase persistence layer for the backend.

Wraps the Supabase client with typed helpers for the authoritative tables. The
frontend uses the publishable key; the backend uses the secret (service-role)
key so it can write.
"""

from __future__ import annotations

from typing import Optional

from backend.settings import get_settings

_client = None


def _get_client():
    global _client
    if _client is None:
        from supabase import create_client

        settings = get_settings()
        _client = create_client(settings.supabase_url, settings.supabase_service_role_key)
    return _client


def get_account_state() -> Optional[dict]:
    resp = _get_client().table("account_state").select("*").eq("id", 1).maybe_single().execute()
    return resp.data


def update_account_state(patch: dict) -> None:
    _get_client().table("account_state").update(patch).eq("id", 1).execute()


def list_open_positions() -> list[dict]:
    resp = _get_client().table("active_positions").select("*").eq("status", "OPEN").execute()
    return resp.data or []


def insert_position(record: dict) -> None:
    _get_client().table("active_positions").insert(record).execute()


def update_position_price(position_id: str, current_price: float) -> None:
    _get_client().table("active_positions").update({"current_price": current_price}).eq("id", position_id).execute()


def update_position(position_id: str, patch: dict) -> None:
    _get_client().table("active_positions").update(patch).eq("id", position_id).execute()


def delete_position(position_id: str) -> None:
    _get_client().table("active_positions").delete().eq("id", position_id).execute()


def insert_trade(record: dict) -> None:
    _get_client().table("trade_history").insert(record).execute()


def list_recent_trades(limit: int = 5) -> list[dict]:
    resp = _get_client().table("trade_history").select("*").order("closed_at", desc=True).limit(limit).execute()
    return resp.data or []


def insert_blackboard(record: dict) -> None:
    _get_client().table("agent_blackboard").insert(record).execute()


def insert_order(record: dict) -> None:
    _get_client().table("paper_orders").insert(record).execute()


def insert_fill(record: dict) -> None:
    _get_client().table("paper_fills").insert(record).execute()


def upsert_telemetry(agent_key: str, record: dict) -> None:
    _get_client().table("agent_telemetry").upsert({**record, "agent_key": agent_key}).execute()


def list_active_guidelines() -> list[dict]:
    resp = _get_client().table("system_guidelines").select("*").eq("state", "ACTIVE").execute()
    return resp.data or []


def insert_guideline(rule_key: str, rule_value: str) -> None:
    _get_client().table("system_guidelines").insert(
        {"rule_key": rule_key, "rule_value": {"text": rule_value}, "state": "ACTIVE"}
    ).execute()


def _f(value) -> float:
    """Coerce a Supabase numeric (Decimal/str/int/None) to float safely."""
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def build_account_snapshot():
    """Build an AccountSnapshot from Supabase state.

    Reads the single account_state row (id = 1) and all OPEN positions, then
    returns the dataclass the deterministic risk engine consumes. Kept in this
    layer so the orchestrator stays thin.
    """
    from backend.risk.engine import AccountSnapshot

    state = get_account_state() or {}
    positions = list_open_positions()

    equity = _f(state.get("equity_usd")) or 100.0
    available_cash = _f(state.get("available_cash_usd"))
    daily_trades = int(_f(state.get("daily_trades")))
    daily_realized_pnl = _f(state.get("daily_realized_pnl_usd"))

    open_mints = frozenset(p.get("mint_address") for p in positions if p.get("mint_address"))
    total_open_exposure = sum(_f(p.get("amount_usd")) for p in positions)

    return AccountSnapshot(
        equity=equity,
        available_cash=available_cash,
        daily_trades=daily_trades,
        daily_realized_pnl=daily_realized_pnl,
        open_mints=open_mints,
        total_open_exposure_usd=total_open_exposure,
    )
