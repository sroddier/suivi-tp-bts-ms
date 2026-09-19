# Suivi des TP — BTS MS

Notes de travaux pratiques **calculées à partir des compétences** du BTS Maintenance des systèmes (option SP).

**Site :** [https://sroddier.github.io/suivi-tp-bts-ms/](https://sroddier.github.io/suivi-tp-bts-ms/)

| Page | Rôle |
|------|------|
| [index.html](index.html) | Espace élève (code → niveaux + notes) |
| [methode.html](methode.html) | Comment on passe de 0–3 à /20 |
| [prof.html](prof.html) | Saisie des indicateurs, export |

Démo : `LEA24`, `YAN24`, `INE24`, `KAR24`.

## Publier une promo réelle

1. Espace professeur : ajouter les élèves (codes, pas les noms complets).
2. Noter chaque TP (0 / 1 / 2 / 3 / non observé).
3. **Exporter** → remplacer `js/promo.js`.
4. Double-cliquer `publier.bat`.

Les saisies restent dans le navigateur du professeur tant qu’elles ne sont pas exportées.

## Moteur

- Indicateurs officiels du GAP (pôles 1 et 2).
- Poids égal par compétence dans un TP.
- Note /20 : 0→0, 1→8, 2→14, 3→20.
- Plafond 8/20 si un indicateur QHSE observé vaut 0.
- Niveau actuel = 3 dernières observations, les plus récentes pèsent plus.
