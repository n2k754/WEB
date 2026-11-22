"""Clients AliExpress.

- DryRunAliExpress : simule, n'envoie rien. C'est le mode par défaut.
- OfficialAliExpress : À BRANCHER sur l'API Dropshipping de l'AliExpress Open
  Platform (app approuvée requise). Je ne l'ai pas écrit de mémoire : la
  signature des requêtes et les champs exacts doivent suivre la doc officielle.
  Éviter l'automatisation de navigateur : contraire aux CGU, fragile (captchas).
"""
from __future__ import annotations

import logging
from typing import Protocol

from .models import Address, OrderLine, OrderResult

log = logging.getLogger("bot.ali")


class AliExpressClient(Protocol):
    def place_order(self, address: Address, lines: list[OrderLine]) -> OrderResult: ...


class DryRunAliExpress:
    def __init__(self):
        self.sent: list[dict] = []

    def place_order(self, address: Address, lines: list[OrderLine]) -> OrderResult:
        payload = {
            "shipping_address": address.__dict__,
            "items": [l.__dict__ for l in lines],
        }
        self.sent.append(payload)
        log.info("[SIMULATION] commande AliExpress non envoyée: %s", payload)
        return OrderResult(ok=True, ali_order_id="DRYRUN", detail="simulation", payload=payload)


class QueueAliExpress:
    """Mode assisté : écrit chaque commande prête à passer dans un fichier JSONL.

    Tu la passes toi-même sur AliExpress (ou un outil tiers) avec l'adresse
    déjà formatée. Utile tant que l'API officielle n'est pas disponible.
    """

    def __init__(self, path: str = "pending_orders.jsonl"):
        self.path = path

    def place_order(self, address: Address, lines: list[OrderLine]) -> OrderResult:
        import json

        payload = {
            "shipping_address": address.__dict__,
            "items": [l.__dict__ for l in lines],
        }
        with open(self.path, "a", encoding="utf-8") as f:
            f.write(json.dumps(payload, ensure_ascii=False) + "\n")
        return OrderResult(ok=True, ali_order_id="QUEUED", detail=self.path, payload=payload)


class OfficialAliExpress:
    def __init__(self, app_key: str, app_secret: str, access_token: str):
        self.app_key, self.app_secret, self.access_token = app_key, app_secret, access_token

    def place_order(self, address: Address, lines: list[OrderLine]) -> OrderResult:
        raise NotImplementedError(
            "À implémenter d'après la doc de l'API Dropshipping AliExpress "
            "(création de commande + signature). Voir le README."
        )
