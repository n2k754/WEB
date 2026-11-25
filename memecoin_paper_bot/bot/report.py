from __future__ import annotations

import sqlite3


def report(db_path: str = "paper.db") -> str:
    db = sqlite3.connect(db_path)
    rows = db.execute("SELECT pnl, exit_reason, stake FROM positions WHERE status='closed'").fetchall()
    n_open = db.execute("SELECT COUNT(*) FROM positions WHERE status='open'").fetchone()[0]
    seen = db.execute("SELECT decision, COUNT(*) FROM seen GROUP BY decision").fetchall()
    out = [f"Pools vus: {dict(seen)} | positions ouvertes: {n_open}"]
    if not rows:
        out.append("Aucun trade clôturé pour l'instant.")
        return "\n".join(out)
    pnls = [r[0] for r in rows]
    wins = sum(1 for x in pnls if x > 0)
    invested = sum(r[2] for r in rows)
    out += [
        f"Trades clôturés: {len(rows)} | gagnants: {wins} ({100*wins/len(rows):.0f} %)",
        f"PnL virtuel total: {sum(pnls):+.2f} $ sur {invested:.0f} $ misés ({100*sum(pnls)/invested:+.1f} %)",
        f"Meilleur: {max(pnls):+.2f} $ | pire: {min(pnls):+.2f} $",
        "Par raison de sortie:",
    ]
    by: dict[str, list[float]] = {}
    for pnl, reason, _ in rows:
        by.setdefault(reason, []).append(pnl)
    for reason, v in sorted(by.items(), key=lambda kv: -len(kv[1])):
        out.append(f"  - {reason}: {len(v)} trades, {sum(v):+.2f} $")
    out.append("Rappel : simulation sans la vitesse des bots pros ; le réel sera pire.")
    return "\n".join(out)
