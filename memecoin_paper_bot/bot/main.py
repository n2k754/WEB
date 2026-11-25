"""python -m bot.main run [--interval 60]   |   python -m bot.main report"""
from __future__ import annotations

import argparse
import logging
import time

from .engine import Engine
from .feed import GeckoFeed
from .report import report


def main() -> None:
    p = argparse.ArgumentParser()
    p.add_argument("cmd", choices=["run", "report"])
    p.add_argument("--interval", type=int, default=60, help="secondes entre deux relevés")
    p.add_argument("--db", default="paper.db")
    a = p.parse_args()
    if a.cmd == "report":
        print(report(a.db))
        return
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
    eng = Engine(GeckoFeed(), db_path=a.db)
    print("Mode PAPIER : aucun argent, aucune clé. Ctrl+C pour arrêter.")
    while True:
        try:
            logging.info("relevé: %s", eng.tick(time.time()))
        except Exception as exc:  # noqa: BLE001 - réseau instable : on continue
            logging.warning("erreur ignorée: %r", exc)
        time.sleep(a.interval)


if __name__ == "__main__":
    main()
