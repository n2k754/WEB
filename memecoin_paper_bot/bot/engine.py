"""Moteur de simulation (papier) : aucun argent, aucun portefeuille, aucune clé."""
from __future__ import annotations

import sqlite3

from .strategy import Config, entry_decision, price_impact


class Engine:
    def __init__(self, feed, cfg: Config | None = None, db_path: str = "paper.db"):
        self.feed, self.cfg = feed, cfg or Config()
        self.db = sqlite3.connect(db_path)
        self.db.executescript(
            """
            CREATE TABLE IF NOT EXISTS seen(pool TEXT PRIMARY KEY, name TEXT, ts REAL,
                decision TEXT, reason TEXT);
            CREATE TABLE IF NOT EXISTS positions(id INTEGER PRIMARY KEY AUTOINCREMENT,
                pool TEXT, name TEXT, entry_ts REAL, entry_price REAL, entry_liq REAL,
                stake REAL, tokens REAL, status TEXT, misses INTEGER DEFAULT 0,
                exit_ts REAL, exit_price REAL, exit_reason TEXT, proceeds REAL, pnl REAL);
            """
        )
        self.db.commit()

    # ---- coûts ----
    def _buy_tokens(self, price: float, liq: float) -> float:
        c = self.cfg
        net = c.stake_usd * (1 - c.fee_pct) * (1 - c.base_slippage - price_impact(c.stake_usd, liq))
        return max(net, 0.0) / price

    def _sell_proceeds(self, tokens: float, price: float, liq: float) -> float:
        c = self.cfg
        value = tokens * price
        return value * (1 - c.fee_pct) * max(0.0, 1 - c.base_slippage - price_impact(value, liq))

    # ---- cycle ----
    def tick(self, now: float) -> dict:
        stats = {"opened": 0, "closed": 0, "skipped": 0}
        self._update_positions(now, stats)
        self._discover(now, stats)
        self.db.commit()
        return stats

    def _open(self):
        return self.db.execute(
            "SELECT id,pool,entry_ts,entry_price,entry_liq,tokens,misses FROM positions WHERE status='open'"
        ).fetchall()

    def _close(self, pid, now, price, proceeds, reason, stake):
        self.db.execute(
            "UPDATE positions SET status='closed', exit_ts=?, exit_price=?, exit_reason=?, "
            "proceeds=?, pnl=? WHERE id=?",
            (now, price, reason, proceeds, proceeds - stake, pid),
        )

    def _update_positions(self, now, stats):
        rows = self._open()
        if not rows:
            return
        cur = self.feed.pools([r[1] for r in rows])
        c = self.cfg
        for pid, pool, entry_ts, entry_price, entry_liq, tokens, misses in rows:
            p = cur.get(pool)
            if p is None or p["price"] is None:
                misses += 1
                if misses >= c.missing_polls_as_rug:
                    self._close(pid, now, 0.0, 0.0, "disparu (rug présumé)", c.stake_usd)
                    stats["closed"] += 1
                else:
                    self.db.execute("UPDATE positions SET misses=? WHERE id=?", (misses, pid))
                continue
            # Sortie exécutée au prix OBSERVÉ à ce relevé : on ne « devine » jamais
            # un prix d'avant-rug (un vrai bot non plus ne peut pas le faire).
            change = p["price"] / entry_price - 1
            liq = p["liquidity"] or 0.0
            reason = None
            if entry_liq and liq < entry_liq * (1 - c.liquidity_drop):
                reason = "liquidité en chute (rug ?)"
            elif change <= c.stop_loss:
                reason = "stop loss"
            elif change >= c.take_profit:
                reason = "take profit"
            elif now - entry_ts >= c.max_hold_s:
                reason = "durée maximale"
            if reason:
                proceeds = self._sell_proceeds(tokens, p["price"], liq)
                self._close(pid, now, p["price"], proceeds, reason, c.stake_usd)
                stats["closed"] += 1
            elif misses:
                self.db.execute("UPDATE positions SET misses=0 WHERE id=?", (pid,))

    def _discover(self, now, stats):
        c = self.cfg
        n_open = len(self._open())
        for p in self.feed.new_pools():
            if self.db.execute("SELECT 1 FROM seen WHERE pool=?", (p["address"],)).fetchone():
                continue
            ok, reason = entry_decision(p, c, now)
            if ok and n_open >= c.max_open:
                ok, reason = False, "trop de positions ouvertes"
            self.db.execute(
                "INSERT INTO seen VALUES (?,?,?,?,?)",
                (p["address"], p["name"], now, "enter" if ok else "skip", reason),
            )
            if not ok:
                stats["skipped"] += 1
                continue
            tokens = self._buy_tokens(p["price"], p["liquidity"])
            self.db.execute(
                "INSERT INTO positions(pool,name,entry_ts,entry_price,entry_liq,stake,tokens,status) "
                "VALUES (?,?,?,?,?,?,?, 'open')",
                (p["address"], p["name"], now, p["price"], p["liquidity"], c.stake_usd, tokens),
            )
            n_open += 1
            stats["opened"] += 1
