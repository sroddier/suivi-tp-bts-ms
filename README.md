# Suivi des TP — BTS MS

Notes de travaux pratiques **calculées à partir des compétences** du BTS Maintenance des systèmes (option SP).

**Site :** [https://sroddier.github.io/suivi-tp-bts-ms/](https://sroddier.github.io/suivi-tp-bts-ms/)

| Page | Rôle |
|------|------|
| [index.html](index.html) | Espace élève (code → niveaux + notes) |
| [methode.html](methode.html) | Comment on passe de 0–3 à /20 |
| [prof.html](prof.html) | Saisie des indicateurs, export |

Démo : `LEA24`, `YAN24`, `INE24`, `KAR24`.

## Les 8 TP du plateau

| Fiche | Machine | Compétences notées |
|-------|---------|-------------------|
| [Découverte](tps.html) 2 h | Pallettic 1, Pallettic 2, Ravoux, Ermax | C13 conduite · C21/C22 risques · C11-1 · C24 |
| [Diagnostic](tps.html) 3 h | idem, panne posée à l’avance | C11 complète · consignation C13/C21/C22 · C24 |

Fiches élèves : [tps.html](https://sroddier.github.io/suivi-tp-bts-ms/tps.html).

## Importer la classe depuis Pronote

Espace professeur → **Import Pronote**.

1. Dans Pronote, ouvrez la **liste des élèves** de la classe / du groupe.
2. Cliquez sur l’icône d’export en haut à droite de la liste.
   - **Client web** : un CSV est téléchargé. Déposez-le (ou un Excel).
   - **Client lourd** : la liste est copiée. Collez-la dans la zone prévue (Ctrl+V).
3. Vérifiez l’aperçu (codes générés : 3 lettres du nom + 2 du prénom, ex. `DUPMA`).
4. **Remplacer** la liste démo, ou **fusionner** (les élèves déjà présents gardent leur code).

Un fichier d’exemple : [`exemple-pronote.csv`](exemple-pronote.csv).

Colonnes reconnues : Nom, Prénom, Classe / Division, éventuellement Identifiant. Les autres colonnes (sexe, date de naissance…) sont ignorées.

## Publier une promo réelle

1. Importer Pronote (ou ajouter les élèves à la main).
2. Noter chaque TP (0 / 1 / 2 / 3 / non observé).
3. **Exporter promo.js** → remplacer `js/promo.js`.
4. Double-cliquer `publier.bat`.

Les saisies restent dans le navigateur du professeur tant qu’elles ne sont pas exportées. Sur le site public, préférez des **codes** plutôt que les noms complets.

## Moteur

- Indicateurs officiels du GAP (pôles 1 et 2).
- Poids égal par compétence dans un TP.
- Note /20 : 0→0, 1→8, 2→14, 3→20.
- Plafond 8/20 si un indicateur QHSE observé vaut 0.
- Niveau actuel = 3 dernières observations, les plus récentes pèsent plus.
