"""System 02 — Intelligent routing & fallback for LLM calls.

Maps each locked agent to its intended provider+model, then resolves the actual
route at call time: if the intended provider's key is configured (and supported
by our OpenAI-compatible client), use it; otherwise fall back to Groq, which is
the free tier we reliably have today.

The locked primary routes are authoritative per the spec. As soon as a working
paid OpenRouter key, a real Gemini API key, or a working xAI key is added to
backend/.env, the router starts using the intended model automatically — no
agent code needs to change.
"""

from __future__ import annotations

import os

from backend.settings import get_settings

# Locked primary route per agent: (provider, model).
PRIMARY_ROUTES = {
    "orion": ("openrouter", "deepseek/deepseek-r1-0528"),
    "cipher": ("openrouter", "deepseek/deepseek-r1-0528"),
    "lupus": ("openrouter", "deepseek/deepseek-chat"),
    "argus": ("openrouter", "deepseek/deepseek-chat"),
    "nova": ("gemini", "google/gemini-2.5-flash"),
    "zarah": ("gemini", "google/gemini-2.5-flash"),
    "elias": ("xai", "x-ai/grok-4.6"),
}

# Fallback when the primary key is missing or unsupported.
FALLBACK_ROUTE = ("groq", "qwen/qwen3.8-27b")

# Providers our OpenAI-compatible client (backend.services.llm) can actually
# call today. Gemini needs a separate Google SDK, so it is not in this set yet.
SUPPORTED_PROVIDERS = {"openrouter", "xai", "groq"}


def _key_for(provider: str) -> str:
    s = get_settings()
    return {
        "openrouter": s.openrouter_api_key,
        "gemini": s.gemini_api_key,
        "xai": s.xai_api_key,
        "groq": s.groq_api_key,
    }.get(provider, "")


def resolve(agent_key: str) -> tuple[str, str]:
    """Return the (provider, model) an agent should use this call.

    By default everything routes to Groq, because that is the only free key that
    works today (the xAI key returns 403, the Gemini key is the wrong format,
    and the free OpenRouter key cannot reach the locked DeepSeek models). Set
    V20_USE_PRIMARY_ROUTES=1 in backend/.env once a working paid OpenRouter key
    or real Gemini/xAI keys are added, and the locked routes take over.
    """
    provider, model = PRIMARY_ROUTES.get(agent_key, FALLBACK_ROUTE)
    use_primary = os.environ.get("V20_USE_PRIMARY_ROUTES") == "1"
    if use_primary and provider in SUPPORTED_PROVIDERS and _key_for(provider):
        return (provider, model)
    return FALLBACK_ROUTE


def primary_route(agent_key: str) -> tuple[str, str]:
    """The locked intended route (for display/telemetry), regardless of fallback."""
    return PRIMARY_ROUTES.get(agent_key, FALLBACK_ROUTE)
