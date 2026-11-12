"""Generic OpenAI-compatible chat. Works with Groq (free), OpenRouter, and xAI.

All three expose an OpenAI-style /chat/completions endpoint, so one small client
covers them. System 01 (rate limits) and System 02 (routing) will wrap this later.
"""

from __future__ import annotations

import json
import time
import urllib.request

from backend.settings import get_settings
from backend.systems import perf


def extract_json(text: str) -> dict | None:
    """Pull the first balanced { ... } JSON object out of an LLM reply.

    Tolerates markdown fences, leading prose, and trailing commentary. Returns
    None when no valid object is found, so callers can fall back safely.
    """
    if not text:
        return None
    start = text.find("{")
    if start == -1:
        return None
    # Walk forward counting braces/strings to find the matching close brace.
    depth = 0
    in_string = False
    escaped = False
    for i in range(start, len(text)):
        ch = text[i]
        if in_string:
            if escaped:
                escaped = False
            elif ch == "\\":
                escaped = True
            elif ch == '"':
                in_string = False
            continue
        if ch == '"':
            in_string = True
        elif ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                candidate = text[start : i + 1]
                try:
                    obj = json.loads(candidate)
                except (json.JSONDecodeError, ValueError):
                    return None
                return obj if isinstance(obj, dict) else None
    return None


def _post(
    base_url: str,
    api_key: str,
    model: str,
    messages: list[dict],
    temperature: float,
    max_tokens: int,
) -> str:
    if not api_key:
        raise RuntimeError(f"missing API key for {base_url}")
    url = base_url.rstrip("/") + "/chat/completions"
    body = json.dumps(
        {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            # Cloudflare in front of Groq blocks the default Python-urllib UA (error 1010).
            "User-Agent": "V2.0-agent/1.0",
        },
        method="POST",
    )
    # Retry transient failures (rate limits / 5xx) with a short backoff so a
    # single 429 does not kill a cycle. System 01 will replace this with a
    # proper token-bucket + queue, but this keeps the daemon alive now.
    last_detail = ""
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=90) as resp:
                data = json.loads(resp.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"]
        except urllib.error.HTTPError as e:
            last_detail = e.read().decode("utf-8", "replace")
            if e.code not in (429, 500, 502, 503, 504) or attempt == 2:
                raise RuntimeError(f"{e.code} from {url}: {last_detail}") from e
            time.sleep(4 * (attempt + 1))
    raise RuntimeError(f"failed from {url}: {last_detail}")


def groq_chat(model: str, messages: list[dict], *, temperature: float = 0.2, max_tokens: int = 800) -> str:
    s = get_settings()
    perf.wait_for_slot("groq")
    return _post("https://api.groq.com/openai/v1", s.groq_api_key, model, messages, temperature, max_tokens)


def openrouter_chat(model: str, messages: list[dict], *, temperature: float = 0.2, max_tokens: int = 800) -> str:
    s = get_settings()
    perf.wait_for_slot("openrouter")
    return _post("https://openrouter.ai/api/v1", s.openrouter_api_key, model, messages, temperature, max_tokens)


def xai_chat(model: str, messages: list[dict], *, temperature: float = 0.2, max_tokens: int = 800) -> str:
    s = get_settings()
    perf.wait_for_slot("xai")
    return _post("https://api.x.ai/v1", s.xai_api_key, model, messages, temperature, max_tokens)


def deepseek_chat(model: str, messages: list[dict], *, temperature: float = 0.2, max_tokens: int = 800) -> str:
    s = get_settings()
    perf.wait_for_slot("deepseek")
    return _post("https://api.deepseek.com/v1", s.deepseek_api_key, model, messages, temperature, max_tokens)
