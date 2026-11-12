"""Quick CLI to smoke-test one agent via OpenRouter.

Usage:
  python -m backend.main <agent> <prompt>
  python -m backend.main nova "scan WOOF on Solana"
"""

from __future__ import annotations

import sys

from backend.agents.definitions import AGENTS


def main() -> None:
    # Print full UTF-8 so emoji in agent replies don't crash the Windows console.
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

    if len(sys.argv) < 3:
        print("usage: python -m backend.main <agent> <prompt>")
        print("agents:", ", ".join(AGENTS))
        return
    key = sys.argv[1].lower()
    prompt = " ".join(sys.argv[2:])
    if key not in AGENTS:
        print(f"unknown agent '{key}'. agents: {', '.join(AGENTS)}")
        return
    agent = AGENTS[key]
    print(f"== {agent.name} ({agent.role}) — {agent.model} ==")
    print(agent.run(prompt))


if __name__ == "__main__":
    main()
