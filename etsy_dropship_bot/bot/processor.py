"""Logique centrale : commande Etsy payée -> commande fournisseur."""
from __future__ import annotations

import logging

from .models import Address, OrderLine

log = logging.getLogger("bot.processor")


def process_receipts(etsy, ali, store, mapping: dict, fallback_phone: str) -> dict:
    """mapping : {listing_id (str): {"product_id": str, "sku": str}}"""
    stats = {"ordered": 0, "manual": 0, "skipped": 0, "failed": 0}
    for receipt in etsy.list_paid_unshipped_receipts():
        rid = receipt["receipt_id"]
        if store.seen(rid):
            stats["skipped"] += 1
            continue
        try:
            address = Address.from_etsy_receipt(receipt, fallback_phone)
            lines = []
            for t in receipt.get("transactions", []):
                m = mapping.get(str(t["listing_id"]))
                if m is None:
                    raise LookupError(f"listing Etsy {t['listing_id']} absent du mapping")
                lines.append(OrderLine(m["product_id"], m["sku"], int(t.get("quantity", 1))))
            if not lines:
                raise LookupError("commande sans article")
        except (ValueError, LookupError) as exc:
            # On ne devine jamais : cas incomplet -> traitement manuel.
            store.record(rid, "needs_manual", detail=str(exc))
            log.warning("receipt %s à traiter à la main: %s", rid, exc)
            stats["manual"] += 1
            continue

        try:
            result = ali.place_order(address, lines)
        except Exception as exc:  # noqa: BLE001 - on journalise et on continue
            store.record(rid, "failed", detail=repr(exc))
            log.error("échec commande receipt %s: %s", rid, exc)
            stats["failed"] += 1
            continue

        if result.ok:
            store.record(rid, "ordered", result.ali_order_id, result.detail)
            stats["ordered"] += 1
        else:
            store.record(rid, "failed", detail=result.detail)
            stats["failed"] += 1
    return stats
