"""Point d'entrée : python -m bot.main [--live] [--once]

Par défaut : SIMULATION (aucune commande réelle). `--live` exige que
OfficialAliExpress soit implémenté.
"""
from __future__ import annotations

import argparse
import json
import logging
import os
import time

from .aliexpress_client import DryRunAliExpress, OfficialAliExpress
from .etsy_client import EtsyClient
from .processor import process_receipts
from .store import Store


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("--live", action="store_true", help="passer de vraies commandes")
    p.add_argument("--once", action="store_true", help="un seul passage puis quitter")
    p.add_argument("--mapping", default="mapping.json")
    p.add_argument("--interval", type=int, default=300, help="secondes entre deux relevés")
    args = p.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(name)s %(message)s")

    etsy = EtsyClient(
        os.environ["ETSY_API_KEY"], os.environ["ETSY_ACCESS_TOKEN"], os.environ["ETSY_SHOP_ID"]
    )
    if args.live:
        ali = OfficialAliExpress(
            os.environ["ALI_APP_KEY"], os.environ["ALI_APP_SECRET"], os.environ["ALI_ACCESS_TOKEN"]
        )
    else:
        ali = DryRunAliExpress()
    with open(args.mapping, encoding="utf-8") as f:
        mapping = json.load(f)
    store = Store()
    phone = os.environ.get("FALLBACK_PHONE", "")

    while True:
        stats = process_receipts(etsy, ali, store, mapping, phone)
        logging.getLogger("bot").info("passage terminé: %s", stats)
        if args.once:
            break
        time.sleep(args.interval)


if __name__ == "__main__":
    main()
