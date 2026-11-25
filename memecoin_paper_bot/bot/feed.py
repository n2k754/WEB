"""Source de données : GeckoTerminal (API publique, sans clé), réseau Solana.

Formats vérifiés sur des réponses réelles : /networks/solana/new_pools et
/networks/solana/pools/multi/{adresses}. Limites de débit exactes : inconnues
(aucun en-tête n'est renvoyé) -> on gère le HTTP 429 avec une pause.
"""
from __future__ import annotations

import json
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone

BASE = "https://api.geckoterminal.com/api/v2/networks/solana"
HEADERS = {"Accept": "application/json;version=20230302", "User-Agent": "paper-bot"}


def to_float(x):
    try:
        return float(x) if x is not None else None
    except (TypeError, ValueError):
        return None


def parse_pool(d: dict) -> dict:
    a = d["attributes"]
    created = datetime.fromisoformat(a["pool_created_at"].replace("Z", "+00:00"))
    tx15 = (a.get("transactions") or {}).get("m15") or {}
    rel = d.get("relationships", {})
    return {
        "address": a["address"],
        "name": a.get("name", "?"),
        "created_ts": created.replace(tzinfo=created.tzinfo or timezone.utc).timestamp(),
        "price": to_float(a.get("base_token_price_usd")),
        "liquidity": to_float(a.get("reserve_in_usd")),
        "buyers_15m": tx15.get("buyers", 0),
        "sellers_15m": tx15.get("sellers", 0),
        "buys_15m": tx15.get("buys", 0),
        "sells_15m": tx15.get("sells", 0),
        "dex": ((rel.get("dex") or {}).get("data") or {}).get("id", ""),
    }


class GeckoFeed:
    def _get(self, path: str) -> dict:
        for attempt in range(3):
            try:
                req = urllib.request.Request(BASE + path, headers=HEADERS)
                with urllib.request.urlopen(req, timeout=30) as r:
                    return json.load(r)
            except urllib.error.HTTPError as e:
                if e.code == 429:
                    time.sleep(30 * (attempt + 1))
                    continue
                raise
        raise RuntimeError("limite de débit persistante (429)")

    def new_pools(self) -> list[dict]:
        return [parse_pool(d) for d in self._get("/new_pools?page=1")["data"]]

    def pools(self, addresses: list[str]) -> dict[str, dict]:
        out: dict[str, dict] = {}
        for i in range(0, len(addresses), 30):
            chunk = addresses[i:i + 30]
            for d in self._get("/pools/multi/" + ",".join(chunk))["data"]:
                p = parse_pool(d)
                out[p["address"]] = p
        return out


class FakeFeed:
    """Pour les tests : états de pools écrits à la main."""

    def __init__(self):
        self.new: list[dict] = []
        self.state: dict[str, dict] = {}

    def new_pools(self):
        return list(self.new)

    def pools(self, addresses):
        return {a: self.state[a] for a in addresses if a in self.state}
