"""The always-on daemon — runs the paper-trading squad continuously.

Usage:
  python -m backend.daemon                 # a cycle every 5 minutes
  python -m backend.daemon --interval 180   # every 3 minutes
  python -m backend.daemon --once           # run one cycle and exit

Every cycle persists to Supabase (blackboard, telemetry, positions), so the
dashboard updates live via Realtime. Agent/network failures inside a cycle are
caught and reported; the daemon keeps going.
"""

from __future__ import annotations

import argparse
import sys
import time
from collections import deque
from datetime import datetime


def main() -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

    parser = argparse.ArgumentParser(description="Run V.2.0 paper-trading cycles continuously")
    parser.add_argument("--interval", type=int, default=300, help="seconds between cycles")
    parser.add_argument("--limit", type=int, default=20, help="max candidates per scan")
    parser.add_argument("--once", action="store_true", help="run one cycle and exit")
    args = parser.parse_args()

    from backend.orchestrator import run_cycle
    from backend.monitor import manage_open_positions, review_positions, reflect_on_new_trades

    # Fast price monitoring (live PnL) runs every MONITOR_EVERY seconds; the
    # slower agent scan (new trades + position review) every args.interval.
    MONITOR_EVERY = 40
    TICK = 10

    print(f"V.2.0 daemon: price monitor every {MONITOR_EVERY}s, agent scan every {args.interval}s.")
    print("Press Ctrl+C to stop.\n")

    # Remember the last few mints so the squad keeps finding NEW coins instead of
    # re-analyzing the same top-boosted token every cycle.
    recent: deque[str] = deque(maxlen=12)

    # Trade ids the squad has already audited/reflected on, so the debate loop
    # fires only when a NEW trade closes.
    seen_trade_ids: set[str] = set()

    last_monitor = 0.0
    last_scan = 0.0

    while True:
        now = time.monotonic()
        stamp = datetime.now().strftime("%H:%M:%S")

        # Fast loop: update open-position prices + auto-close on SL/TP + equity.
        if now - last_monitor >= MONITOR_EVERY:
            last_monitor = now
            try:
                closed = manage_open_positions()
                if closed:
                    print(f"[{stamp}] closed {closed} position(s)")
            except Exception as exc:
                print(f"[{stamp}] MONITOR ERROR: {exc}")

        # Slow loop: agents review positions, then scan for a new trade.
        if now - last_scan >= args.interval:
            last_scan = now
            try:
                review_positions()
                seen_trade_ids = reflect_on_new_trades(seen_trade_ids)
                result = run_cycle(limit=args.limit, exclude_mints=set(recent))
                token = result.token_symbol or "no token"
                print(f"[{stamp}] {result.decision} | {token} | executed={result.executed}")
                if result.reasons:
                    print(f"          reasons: {', '.join(result.reasons)}")
                if result.mint_address:
                    recent.append(result.mint_address)
            except Exception as exc:  # never let one cycle kill the daemon
                print(f"[{stamp}] CYCLE ERROR: {exc}")

        if args.once:
            break
        time.sleep(TICK)


if __name__ == "__main__":
    main()
