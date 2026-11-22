# Bot Etsy → AliExpress (squelette testé en simulation)

Quand une commande Etsy est payée, le bot lit l'adresse de l'acheteur et prépare
la commande fournisseur correspondante. Chaque commande n'est traitée qu'une fois
(SQLite). Tout cas douteux (article non mappé, adresse incomplète) est mis de côté
en `needs_manual` au lieu d'être deviné.

## Ce qui est fait / testé
- Lecture des commandes, extraction de l'adresse, mapping listing Etsy → produit/SKU
  AliExpress, anti-doublon, mode simulation : **testé** (`python -m unittest discover tests`).

## Ce qui n'est PAS fait / pas testé
- `bot/aliexpress_client.py::OfficialAliExpress` : à implémenter d'après la doc de
  l'API Dropshipping de l'AliExpress Open Platform (app approuvée nécessaire).
- Aucun appel réel à Etsy n'a été testé (pas de clés dans l'environnement de dev).
  Vérifie endpoint, portée OAuth (`transactions_r`) et renouvellement du jeton sur la doc Etsy.
- Paiement AliExpress, retour du numéro de suivi vers Etsy, gestion des ruptures/prix.
- **Téléphone** : AliExpress l'exige, Etsy ne le fournit généralement pas →
  `FALLBACK_PHONE` est utilisé. À valider avec les exigences des transporteurs.

## Utilisation
Étape 0 (une seule fois) : déclare `https://localhost:3003/callback` comme URL de rappel dans ton app Etsy (Etsy exige https ;
le navigateur affichera une erreur après « Autoriser » : colle l'adresse complète dans le terminal),
puis `export ETSY_API_KEY=<keystring>` et `python -m bot.oauth` (jetons dans `etsy_tokens.json`, renouvelés
automatiquement ; `ETSY_ACCESS_TOKEN` devient inutile). Non testé contre un vrai compte Etsy.
```
cp mapping.example.json mapping.json   # remplis tes listings
export ETSY_API_KEY=... ETSY_ACCESS_TOKEN=... ETSY_SHOP_ID=... FALLBACK_PHONE=...
python -m bot.main --once                 # simulation (par défaut), rien n'est envoyé
python -m bot.main --mode queue           # écrit pending_orders.jsonl : tu passes la commande toi-même
python -m bot.main --mode live            # réel : exige OfficialAliExpress implémenté
python -m bot.track RECEIPT_ID CODE CARRIER   # renvoie le suivi à Etsy (portée transactions_w)
```
Note : d'après la doc Etsy consultée, `x-api-key` peut devoir contenir `keystring:secret`
(clé et secret partagé séparés par `:`). Vérifie sur developers.etsy.com.

## Risques à garder en tête
- La politique d'Etsy interdit la revente d'articles non fabriqués/conçus par toi :
  risque de suspension de boutique.
- Tu transmets des données personnelles d'acheteurs à un tiers (RGPD : information
  dans ta politique de confidentialité).
- Ne mets jamais de clés dans le dépôt (variables d'environnement uniquement).
