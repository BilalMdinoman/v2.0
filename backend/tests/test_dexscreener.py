"""Self-running tests for the DexScreener normalizer (pure, no network).

Run with:  python -m backend.tests.test_dexscreener
"""

from backend.services.dexscreener import normalize_token, parse_profiles

MOCK = {
    "pairs": [
        {
            "chainId": "solana",
            "dexId": "raydium",
            "pairAddress": "pairA",
            "baseToken": {"address": "MINT", "symbol": "WOOF", "name": "Woof"},
            "quoteToken": {"symbol": "USDC"},
            "priceUsd": "0.0412",
            "priceChange": {"h24": 12.5},
            "liquidity": {"usd": 250000},
            "volume": {"h24": 900000},
            "fdv": 4120000,
            "txns": {"h24": {"buys": 200, "sells": 100}},
            "pairCreatedAt": 1700000000,
        },
        {
            "chainId": "solana",
            "dexId": "orca",
            "pairAddress": "pairB",
            "baseToken": {"address": "MINT", "symbol": "WOOF", "name": "Woof"},
            "quoteToken": {"symbol": "SOL"},
            "priceUsd": "0.0410",
            "priceChange": {"h24": 12.0},
            "liquidity": {"usd": 50000},
            "volume": {"h24": 100000},
            "fdv": 4100000,
            "txns": {"h24": {"buys": 50, "sells": 40}},
            "pairCreatedAt": 1700000000,
        },
    ]
}


def main() -> None:
    out = normalize_token(MOCK, "MINT")
    assert out is not None
    assert out["symbol"] == "WOOF"
    assert out["price_usd"] == 0.0412
    # The USDC pair (250k liquidity) must win over the SOL pair (50k).
    assert out["pair_address"] == "pairA"
    assert out["liquidity_usd"] == 250000
    assert out["volume_24h"] == 900000
    assert out["buys_24h"] == 200
    assert out["sells_24h"] == 100
    assert out["price_change_24h"] == 12.5
    assert out["fdv"] == 4120000

    # Empty / missing data returns None.
    assert normalize_token({"pairs": []}, "MINT") is None
    assert normalize_token({}, "MINT") is None

    # parse_profiles keeps only Solana mints, in order, and skips junk.
    profiles = [
        {"chainId": "solana", "tokenAddress": "MINT_A"},
        {"chainId": "ethereum", "tokenAddress": "MINT_ETH"},
        {"chainId": "solana", "tokenAddress": "MINT_B"},
        {"chainId": "solana"},  # missing address -> skipped
        "not-a-dict",          # junk -> skipped
    ]
    assert parse_profiles(profiles) == ["MINT_A", "MINT_B"]
    assert parse_profiles([]) == []
    assert parse_profiles(None) == []

    print("test_dexscreener: all checks passed")


if __name__ == "__main__":
    main()
