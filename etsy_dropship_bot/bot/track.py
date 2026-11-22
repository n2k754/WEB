"""Renvoie un numéro de suivi vers Etsy : python -m bot.track RECEIPT_ID CODE CARRIER"""
from __future__ import annotations

import os
import sys

from .etsy_client import EtsyClient


def main() -> None:
    if len(sys.argv) != 4:
        sys.exit("usage: python -m bot.track RECEIPT_ID TRACKING_CODE CARRIER_NAME ('other' si absent de la liste Etsy)")
    receipt_id, code, carrier = sys.argv[1:]
    etsy = EtsyClient(
        os.environ["ETSY_API_KEY"], os.environ["ETSY_ACCESS_TOKEN"], os.environ["ETSY_SHOP_ID"]
    )
    etsy.add_tracking(receipt_id, code, carrier)
    print(f"suivi {code} envoyé à Etsy pour la commande {receipt_id}")


if __name__ == "__main__":
    main()
