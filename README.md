# Petits bâtisseurs — « Construis-la ! »

Un jeu d'architecture pour Lovisa (6 ans) et Linnéa (3 ans) : un bâtiment apparaît en ombre, et l'enfant fait glisser des formes simples (carré, rectangle, triangle, arche, colonne, coupole) pour le reconstruire. Pas de chrono, pas de perdant : seulement des étoiles. À la fin d'une partie (5 bâtiments), une petite ville réunit tout ce qui a été construit.

## Deux façons de jouer

- **Seul, sur un iPad, un iPhone ou un Mac** : ouvrez `solo.html` (ou le bouton « 📱 Jouer seul » de l'accueil), touchez Lovisa ou Linnéa, et jouez. Aucune connexion n'est nécessaire une fois la page chargée : après une première visite en ligne, le jeu reste disponible hors connexion grâce au cache.
- **Sur la télé** : ouvrez `index.html` sur la télé. Chaque enfant scanne le QR code avec un téléphone ou un iPad, puis touche son portrait. Lancez la partie avec ▶ (sur la télé ou sur un téléphone). Chacune construit sur son appareil, et la télé montre le modèle et les constructions en direct, côte à côte. On peut jouer à 1 ou à 2.

## Les deux profils

- **Linnéa** : 2 à 3 grandes pièces, uniquement celles qu'il faut, dans le bon sens. Les emplacements sont dessinés en pointillés dans la couleur de la pièce, et l'aimantation est très généreuse : il suffit de lâcher la pièce n'importe où sur le plateau.
- **Lovisa** : 3 à 8 pièces, plus des pièces pièges. Certaines arrivent dans le mauvais sens, et il faut les toucher pour les tourner (↻). Seule l'ombre est montrée, et il faut poser la pièce près de sa place.

## Langue et son

Les drapeaux 🇫🇷 / 🇸🇪 en haut à droite choisissent la langue des consignes parlées, et 🔊 coupe le son et la voix. La voix dépend de celles installées sur l'appareil ; s'il n'y en a pas, le jeu reste muet sans erreur. Le bouton 🗣️ répète la consigne.

## Technique

Site statique, prêt pour GitHub Pages (`.nojekyll`). Il n'y a aucune publicité ni collecte de données, et aucun appel réseau, sauf le serveur PeerJS public utilisé en mode télé pour mettre en relation la télé et les téléphones (repris de Geo Party, avec un relais TURN de secours). Les sons sont générés dans le navigateur, sans fichier audio.

- `index.html` : écran télé · `play.html` : téléphone ou iPad · `solo.html` : jeu seul
- `js/buildings.js` : les 13 bâtiments (une version Linnéa et une version Lovisa chacun)
- `js/builder.js` : le plateau de construction (glisser-déposer tactile, aimantation, rotation)
- `tools/e2e.cjs` : test rapide (`?transport=local` permet de simuler la télé et un téléphone dans un même navigateur)
