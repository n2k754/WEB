"""Paramètres de simulation. TOUS ARBITRAIRES : rien n'est optimisé ni prouvé."""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class Config:
    stake_usd: float = 20.0          # mise virtuelle par trade
    max_open: int = 10
    # --- entrée ---
    max_age_s: float = 600           # on n'entre que sur un pool créé il y a < 10 min
    min_liquidity_usd: float = 3000.0
    min_buyers_15m: int = 10
    max_sell_buy_ratio: float = 1.0  # sells <= ratio * buys
    # --- sortie ---
    take_profit: float = 0.50        # +50 %
    stop_loss: float = -0.30         # -30 %
    liquidity_drop: float = 0.40     # liquidité -40 % vs entrée = signal de rug
    max_hold_s: float = 3600
    missing_polls_as_rug: int = 2    # pool disparu de l'API N fois de suite
    # --- coûts (pessimistes) ---
    fee_pct: float = 0.01            # par côté
    base_slippage: float = 0.02      # par côté, plus l'impact de prix ci-dessous


def price_impact(amount_usd: float, liquidity_usd: float) -> float:
    """Impact approximatif (pool à produit constant) : montant / (liquidité/2)."""
    if not liquidity_usd or liquidity_usd <= 0:
        return 1.0
    return min(1.0, amount_usd / (liquidity_usd / 2))


def entry_decision(p: dict, cfg: Config, now: float) -> tuple[bool, str]:
    if p["price"] is None or p["price"] <= 0:
        return False, "prix absent"
    if p["liquidity"] is None or p["liquidity"] < cfg.min_liquidity_usd:
        return False, "liquidité trop faible"
    if now - p["created_ts"] > cfg.max_age_s:
        return False, "pool trop ancien"
    if p["buyers_15m"] < cfg.min_buyers_15m:
        return False, "pas assez d'acheteurs"
    if p["sells_15m"] > cfg.max_sell_buy_ratio * max(p["buys_15m"], 1):
        return False, "trop de ventes"
    return True, "ok"
