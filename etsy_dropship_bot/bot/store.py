"""Mémoire SQLite : garantit qu'une commande Etsy n'est traitée qu'une seule fois."""
from __future__ import annotations

import sqlite3


class Store:
    def __init__(self, path: str = "orders.db"):
        self.db = sqlite3.connect(path)
        self.db.execute(
            "CREATE TABLE IF NOT EXISTS orders ("
            "receipt_id TEXT PRIMARY KEY, status TEXT NOT NULL, "
            "ali_order_id TEXT, detail TEXT)"
        )
        self.db.commit()

    def seen(self, receipt_id) -> bool:
        row = self.db.execute(
            "SELECT 1 FROM orders WHERE receipt_id=?", (str(receipt_id),)
        ).fetchone()
        return row is not None

    def record(self, receipt_id, status: str, ali_order_id: str | None = None, detail: str = ""):
        self.db.execute(
            "INSERT OR REPLACE INTO orders VALUES (?,?,?,?)",
            (str(receipt_id), status, ali_order_id, detail),
        )
        self.db.commit()

    def all(self) -> list[tuple]:
        return self.db.execute("SELECT * FROM orders ORDER BY rowid").fetchall()
