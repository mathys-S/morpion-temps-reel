# Morpion temps réel

Jeu de morpion multijoueur en ligne — deux joueurs s'affrontent en temps réel depuis leur navigateur.

## Comment jouer

1. Ouvre le jeu et clique sur **Trouver une partie** — le serveur te met en attente d'un adversaire.
2. Dès qu'un second joueur se connecte, la partie démarre. Un symbole t'est attribué (X ou O) aléatoirement.
3. Les joueurs jouent chacun leur tour en cliquant sur une case libre. Le plateau est bloqué quand ce n'est pas ton tour.
4. La partie se termine sur une victoire (aligner trois symboles) ou un match nul (plateau plein). Clique **Rejouer** pour relancer une recherche.

## Stack technique

- **Node.js + Express** — serveur HTTP, sert les fichiers statiques
- **Socket.io** — communication temps réel bidirectionnelle
- **HTML / CSS / JavaScript** — interface cliente, sans framework

## Lancer en local

```bash
git clone https://github.com/ton-utilisateur/morpion-temps-reel.git
cd morpion-temps-reel
npm install
node server.js
```

Ouvre ensuite [http://localhost:3000](http://localhost:3000) dans deux onglets (ou sur deux appareils du même réseau) pour tester une partie complète.

## Comment ça marche

Le serveur fait autorité : il valide chaque coup, maintient l'état de la partie en mémoire et diffuse les mises à jour aux deux joueurs via WebSocket.

```
Joueur A                  Serveur                 Joueur B
   │── find-game ────────────▶│◀──────── find-game ──│
   │◀─ game-start ────────────│────────── game-start ─▶│
   │── make-move ────────────▶│                        │
   │◀─ move-made ─────────────│─────────── move-made ──▶│
   │◀─ game-over ─────────────│─────────── game-over ──▶│
```

Le client ne fait qu'envoyer les intentions (clic sur une case) et afficher ce que le serveur lui renvoie. Aucune logique de jeu ne s'exécute côté navigateur.
