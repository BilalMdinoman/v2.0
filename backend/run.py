"""Run one full V.2.0 trading cycle.

Usage:
  python -m backend.run            # scan up to 5 candidates
  python -m backend.run --limit 8  # scan up to 8 candidates

Prints the decision and a short transcript. Persists to Supabase unless the
Groq/DexScreener calls fail, in which case it reports an error.
"""

from __future__ import annotations

import argparse
import sys


def main() -> None:
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

    parser = argparse.ArgumentParser(description="Run one V.2.0 trading cycle")
    parser.add_argument("--limit", type=int, default=5, help="max candidates to scan")
    args = parser.parse_args()

    from backend.orchestrator import run_cycle

    result = run_cycle(limit=args.limit)

    print(f"workflow  : {result.workflow_id}")
    print(f"decision  : {result.decision}")
    print(f"token     : {result.token_symbol or '-'} ({result.mint_address or '-'})")
    print(f"executed  : {result.executed}")
    if result.reasons:
        print(f"reasons   : {', '.join(result.reasons)}")
    print("transcript:")
    for agent_key, message_type, text in result.transcript:
        clipped = text.replace("\n", " ")[:140]
        print(f"  [{agent_key:<6} {message_type:<12}] {clipped}")


if __name__ == "__main__":
    main()
