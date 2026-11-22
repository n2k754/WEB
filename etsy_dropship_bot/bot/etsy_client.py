"""Client minimal pour l'API Open v3 d'Etsy (lecture des commandes payées).

Prérequis côté Etsy : une app déclarée sur etsy.com/developers, un jeton OAuth2
avec la portée `transactions_r`, et l'accès commercial si requis.
À vérifier sur la doc officielle : https://developers.etsy.com
"""
from __future__ import annotations

import json
import urllib.parse
import urllib.request

API = "https://openapi.etsy.com/v3/application"


class EtsyClient:
    def __init__(self, api_key: str, access_token: str, shop_id: str):
        self.api_key = api_key
        self.access_token = access_token
        self.shop_id = shop_id

    def _get(self, path: str, params: dict) -> dict:
        url = f"{API}{path}?{urllib.parse.urlencode(params)}"
        req = urllib.request.Request(
            url,
            headers={
                "x-api-key": self.api_key,
                "Authorization": f"Bearer {self.access_token}",
            },
        )
        with urllib.request.urlopen(req, timeout=30) as resp:
            return json.load(resp)

    def list_paid_unshipped_receipts(self, limit: int = 25) -> list[dict]:
        data = self._get(
            f"/shops/{self.shop_id}/receipts",
            {"was_paid": "true", "was_shipped": "false", "limit": limit},
        )
        return data.get("results", [])


class FakeEtsyClient:
    """Pour les tests et la démo : renvoie des commandes préenregistrées."""

    def __init__(self, receipts: list[dict]):
        self._receipts = receipts

    def list_paid_unshipped_receipts(self, limit: int = 25) -> list[dict]:
        return list(self._receipts)
