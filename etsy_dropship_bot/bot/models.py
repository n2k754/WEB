"""Modèles de données partagés."""
from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(frozen=True)
class Address:
    name: str
    line1: str
    line2: str
    city: str
    state: str
    zip: str
    country_iso: str
    phone: str  # requis par AliExpress ; Etsy ne le fournit généralement pas

    @classmethod
    def from_etsy_receipt(cls, receipt: dict, fallback_phone: str) -> "Address":
        """Convertit un « receipt » Etsy (API Open v3) en adresse de livraison."""
        required = ("name", "first_line", "city", "zip", "country_iso")
        missing = [k for k in required if not receipt.get(k)]
        if missing:
            raise ValueError(f"adresse Etsy incomplète, champs manquants: {missing}")
        return cls(
            name=receipt["name"],
            line1=receipt["first_line"],
            line2=receipt.get("second_line") or "",
            city=receipt["city"],
            state=receipt.get("state") or "",
            zip=receipt["zip"],
            country_iso=receipt["country_iso"],
            phone=receipt.get("phone") or fallback_phone,
        )


@dataclass(frozen=True)
class OrderLine:
    ali_product_id: str
    ali_sku: str
    quantity: int


@dataclass
class OrderResult:
    ok: bool
    ali_order_id: str | None = None
    detail: str = ""
    payload: dict = field(default_factory=dict)
