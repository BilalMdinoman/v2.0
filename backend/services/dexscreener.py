"""DexScreener adapter (Phase 3).

Fetches real Solana token/pair data and normalizes it into a single stable
shape for the agents. The normalizer is a pure function so it is unit-testable
without any network access.
"""

from __future__ import annotations

from typing import Any, Optional

BASE_URL = "https://api.dexscreener.com/latest/dex/tokens"
PROFILES_URL = "https://api.dexscreener.com/token-profiles/latest/v1"
BOOSTS_TOP_URL = "https://api.dexscreener.com/token-boosts/top/v1"
# Candidate sources. These are freshly-listed and recently-boosted Solana meme
# tokens (Raydium / pump.fun / pump-swap) — the low/mid-cap coins the squad is
# meant to trade, not old large caps.
DISCOVERY_SOURCES = (BOOSTS_TOP_URL, PROFILES_URL)
QUOTE_PREFERENCE = ("USDC", "USDT", "SOL")


def _num(value: Any) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        return 0.0


def normalize_token(data: dict, mint: str) -> Optional[dict]:
    """Pick the most liquid relevant pair and return a normalized dict.

    Returns None when there is no usable data (e.g. token not found).
    """
    pairs = data.get("pairs") or []
    if not pairs:
        return None

    solana_pairs = [p for p in pairs if p.get("chainId") == "solana"]
    pool = solana_pairs or pairs

    def quote_rank(p: dict) -> int:
        quote = (p.get("quoteToken") or {}).get("symbol", "")
        try:
            return QUOTE_PREFERENCE.index(quote)
        except ValueError:
            return len(QUOTE_PREFERENCE)

    # Prefer a USDC/USDT/SOL quote, then the highest liquidity.
    best = max(
        pool,
        key=lambda p: (-quote_rank(p), _num((p.get("liquidity") or {}).get("usd"))),
    )

    base = best.get("baseToken") or {}
    return {
        "mint": mint,
        "symbol": base.get("symbol", ""),
        "name": base.get("name", ""),
        "price_usd": _num(best.get("priceUsd")),
        "price_change_24h": _num((best.get("priceChange") or {}).get("h24")),
        "liquidity_usd": _num((best.get("liquidity") or {}).get("usd")),
        "volume_24h": _num((best.get("volume") or {}).get("h24")),
        "fdv": _num(best.get("fdv")),
        "buys_24h": _num(((best.get("txns") or {}).get("h24") or {}).get("buys")),
        "sells_24h": _num(((best.get("txns") or {}).get("h24") or {}).get("sells")),
        "pair_address": best.get("pairAddress", ""),
        "pair_created_at": best.get("pairCreatedAt"),
    }


def fetch_token(mint: str, *, timeout: float = 10.0) -> Optional[dict]:
    """Fetch and normalize a token by mint address. Returns None on any failure.

    The real daemon wraps this with tenacity retries and a rate limiter.
    """
    import httpx  # deferred import so the pure normalizer stays dependency-free

    url = f"{BASE_URL}/{mint}"
    try:
        with httpx.Client(timeout=timeout, follow_redirects=True) as client:
            resp = client.get(url)
            resp.raise_for_status()
            return normalize_token(resp.json(), mint)
    except Exception:
        return None


def parse_profiles(payload: list) -> list[str]:
    """Extract Solana mint addresses from a token-profiles/boosts response.

    Pure and unit-testable: returns the mint addresses (tokenAddress) of every
    entry whose chainId is solana, preserving order. Works for both the
    token-profiles and token-boosts endpoints (same shape).
    """
    mints: list[str] = []
    for item in payload or []:
        if not isinstance(item, dict):
            continue
        if item.get("chainId") != "solana":
            continue
        mint = item.get("tokenAddress")
        if mint:
            mints.append(mint)
    return mints


def discover_candidates(
    limit: int = 20,
    *,
    min_liquidity_usd: float = 5_000.0,
    max_vol_liq_ratio: float = 50.0,
    max_price_change_24h: float = 200.0,
    timeout: float = 10.0,
    exclude: set | frozenset = frozenset(),
) -> list[dict]:
    """Discover Solana meme tokens that clear the quality gates.

    Gathers mints from the free discovery endpoints (top-boosted + newest
    profiles — i.e. fresh Raydium / pump.fun / pump-swap tokens), dedupes,
    fetches each token's pair data, and returns those with a positive price,
    liquidity >= min_liquidity_usd, a sane volume-to-liquidity ratio, and a 24h
    move that is not an extreme pump (>max_price_change_24h is skipped so we
    enter early rather than chase a top). Network failure returns an empty list.

    Results are sorted by 24h momentum (descending) so the squad sees the coins
    that are moving now.

    `limit` is the max number of mints to scan, not the number returned.
    `exclude` is a set of mint addresses to skip (already-held or recently
    scanned), so the squad does not re-analyze the same coin.
    """
    import httpx  # deferred import so the pure helpers stay dependency-free

    mints: list[str] = []
    with httpx.Client(timeout=timeout, follow_redirects=True) as client:
        for url in DISCOVERY_SOURCES:
            try:
                resp = client.get(url)
                resp.raise_for_status()
                mints.extend(parse_profiles(resp.json()))
            except Exception:
                continue

    seen: set[str] = set()
    unique: list[str] = []
    for mint in mints:
        if mint not in seen and mint not in exclude:
            seen.add(mint)
            unique.append(mint)

    candidates: list[dict] = []
    for mint in unique[:limit]:
        token = fetch_token(mint, timeout=timeout)
        if token is None:
            continue
        if token["price_usd"] <= 0:
            continue
        if token["liquidity_usd"] < min_liquidity_usd:
            continue
        liq = token["liquidity_usd"]
        if liq > 0 and (token["volume_24h"] / liq) > max_vol_liq_ratio:
            continue
        if token["price_change_24h"] > max_price_change_24h:
            continue
        candidates.append(token)

    # Prefer positive 24h momentum (the coins moving now).
    candidates.sort(key=lambda t: -t["price_change_24h"])
    return candidates
