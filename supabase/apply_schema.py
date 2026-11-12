"""Apply supabase/schema.sql to the live Supabase project via the Management API.

Usage:
  SUPABASE_PROJECT_REF=<ref> SUPABASE_PAT=<sbp_...> python supabase/apply_schema.py

This uses the personal access token (sbp_...) to run each SQL statement in the
schema against the project's Postgres. It is idempotent (IF NOT EXISTS / DROP
... IF EXISTS guards) so it is safe to re-run.

Required environment variables:
  SUPABASE_PROJECT_REF  — your Supabase project reference ID
  SUPABASE_PAT          — your Supabase personal access token (sbp_...)
"""

import json
import os
import sys
import urllib.error
import urllib.request

PROJECT_REF = os.environ["SUPABASE_PROJECT_REF"]
PAT = os.environ["SUPABASE_PAT"]
API = f"https://api.supabase.com/v1/projects/{PROJECT_REF}/database/query"


def split_sql(sql: str):
    """Split on ';' at the top level, respecting -- comments, /* block */,
    single-quoted strings (with '' escapes), and $$ ... $$ dollar bodies."""
    statements: list[str] = []
    current: list[str] = []
    i = 0
    n = len(sql)

    def at(j: int, token: str) -> bool:
        return sql[j : j + len(token)] == token

    while i < n:
        ch = sql[i]

        # line comment -- ... to end of line
        if at(i, "--"):
            while i < n and sql[i] != "\n":
                current.append(sql[i])
                i += 1
            continue

        # block comment /* ... */
        if at(i, "/*"):
            current.append("/*")
            i += 2
            while i + 1 < n and not at(i, "*/"):
                current.append(sql[i])
                i += 1
            if i + 1 < n:
                current.append("*/")
                i += 2
            continue

        # dollar-quoted body $$ ... $$
        if at(i, "$$"):
            current.append("$$")
            i += 2
            while i + 1 < n and not at(i, "$$"):
                current.append(sql[i])
                i += 1
            if i + 1 < n:
                current.append("$$")
                i += 2
            continue

        # single-quoted string '...' with '' escape
        if ch == "'":
            current.append(ch)
            i += 1
            while i < n:
                current.append(sql[i])
                if sql[i] == "'":
                    if i + 1 < n and sql[i + 1] == "'":
                        current.append("'")
                        i += 1
                    else:
                        i += 1
                        break
                i += 1
            continue

        # statement terminator
        if ch == ";":
            stmt = "".join(current).strip()
            if stmt:
                statements.append(stmt)
            current = []
            i += 1
            continue

        current.append(ch)
        i += 1

    stmt = "".join(current).strip()
    if stmt:
        statements.append(stmt)
    return statements


def run_query(query: str):
    req = urllib.request.Request(
        API,
        data=json.dumps({"query": query}).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {PAT}",
            "Content-Type": "application/json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            return resp.status, resp.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()


def main() -> None:
    with open("supabase/schema.sql", "r", encoding="utf-8") as f:
        sql = f.read()

    statements = [s for s in split_sql(sql) if s]
    ok = 0
    failed = 0
    for s in statements:
        status, body = run_query(s)
        if 200 <= status < 300:
            ok += 1
        else:
            failed += 1
            first_line = s.splitlines()[0] if s.splitlines() else s
            print(f"FAILED ({status}): {first_line[:90]}")
            print(f"  {body[:300]}")
    print(f"applied {ok} statements, {failed} failed")
    if failed:
        sys.exit(1)


if __name__ == "__main__":
    main()
