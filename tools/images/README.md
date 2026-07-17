# Atelier images — mode d'emploi (zéro coût, avec ChatGPT Plus)

Production d'images pour les questions et cartes de théorie, sans API payante.
Toi tu génères les images dans ChatGPT ; l'atelier fait tout le reste
(prompts, renommage, conversion WebP, placement, mise à jour des données).

## Installation (une seule fois)

```bash
cd tools/images
npm install
node build-plan.js
```

## La boucle (≈30 secondes par image)

```bash
node atelier.js         # 1. affiche + copie le prompt dans le presse-papiers
# 2. colle dans ChatGPT (Ctrl+V), attends l'image, clique "Télécharger"
node atelier.js take    # 3. l'atelier récupère l'image, la convertit, l'installe, et copie le prompt suivant
```

Répète 2-3. C'est tout.

- `node atelier.js skip` — passe la question courante (pas d'image pertinente)
- `node atelier.js status` — avancement par thème
- `node atelier.js take <chemin>` — utiliser un fichier précis au lieu du dernier téléchargement

## Notes

- L'ordre du plan : permis B (thème A → I), puis permis AM. Questions d'abord, cartes ensuite.
- Les questions qui affichent déjà un panneau (`sign`) sont exclues — le panneau EST leur visuel.
- « Fait » = le champ `image` existe dans le JSON du thème : le plan est relançable sans risque,
  et l'avancement survit à un reset de l'atelier.
- Pense à `git add public/images src/data` + commit régulièrement (par lot de 20-30 images).
- Qualité : si l'image de ChatGPT ne convient pas, régénère dans la même conversation
  (« même scène mais sans le panneau stop », etc.) avant de télécharger.
