"""System 01 — API performance & control.

A small per-provider call spacer (so we stay under the free tiers' rate limits,
especially Groq's tight token-per-minute ceiling) plus a stats recorder. System
03 observability will build tracing on top of these numbers.
"""

from __future__ import annotations

import threading
import time
from collections import defaultdict

# Minimum seconds between calls per provider.
MIN_INTERVAL = {"groq": 2.0, "openrouter": 0.5, "xai": 0.5}

_lock = threading.Lock()
_last: dict[str, float] = {}
_stats = defaultdict(lambda: {"calls": 0, "errors": 0, "total_ms": 0.0})


def wait_for_slot(provider: str) -> None:
    """Block until the provider is clear for another call (a simple rate limiter)."""
    interval = MIN_INTERVAL.get(provider, 0.0)
    if interval <= 0:
        return
    with _lock:
        now = time.monotonic()
        wait = _last.get(provider, 0.0) + interval - now
    if wait > 0:
        time.sleep(wait)
    with _lock:
        _last[provider] = time.monotonic()


def record(provider: str, ok: bool, latency_ms: float) -> None:
    with _lock:
        s = _stats[provider]
        s["calls"] += 1
        if not ok:
            s["errors"] += 1
        s["total_ms"] += latency_ms


def get_stats() -> dict:
    with _lock:
        return {p: dict(s) for p, s in _stats.items()}
