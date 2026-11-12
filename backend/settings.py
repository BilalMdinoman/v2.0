"""Load environment configuration (Supabase, OpenRouter) from a .env file.

Keeps the backend dependency-free by parsing KEY=VALUE lines directly, so it
runs without python-dotenv.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent


@dataclass
class Settings:
    supabase_url: str = ""
    supabase_service_role_key: str = ""
    openrouter_api_key: str = ""
    xai_api_key: str = ""
    groq_api_key: str = ""
    deepseek_api_key: str = ""
    gemini_api_key: str = ""


def load_env(path: Path | None = None) -> None:
    """Parse a .env file into os.environ (never overrides existing vars)."""
    target = path or (BACKEND_DIR / ".env")
    if not target.exists():
        return
    for line in target.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        os.environ.setdefault(key, value)


def get_settings() -> Settings:
    load_env()
    return Settings(
        supabase_url=os.environ.get("SUPABASE_URL", ""),
        supabase_service_role_key=os.environ.get("SUPABASE_SERVICE_ROLE_KEY", ""),
        openrouter_api_key=os.environ.get("OPENROUTER_API_KEY", ""),
        xai_api_key=os.environ.get("XAI_API_KEY", ""),
        groq_api_key=os.environ.get("GROQ_API_KEY", ""),
        deepseek_api_key=os.environ.get("DEEPSEEK_API_KEY", ""),
        gemini_api_key=os.environ.get("GEMINI_API_KEY", ""),
    )
