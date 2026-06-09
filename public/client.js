const socket = io();

const statusEl = document.getElementById('status');
const findBtn = document.getElementById('find-game-btn');
const replayBtn = document.getElementById('replay-btn');
const cells = document.querySelectorAll('.cell');

let mySymbol = null;
let roomId = null;
let myTurn = false;

// --- Helpers ---

function setStatus(text) {
  statusEl.textContent = text;
}

function enableBoard(enabled) {
  cells.forEach(cell => {
    cell.disabled = !enabled;
  });
}

function resetBoard() {
  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
    cell.disabled = true;
  });
}

function showReplay() {
  replayBtn.hidden = false;
  findBtn.hidden = true;
}

function startSearch() {
  resetBoard();
  replayBtn.hidden = true;
  findBtn.hidden = false;
  mySymbol = null;
  roomId = null;
  myTurn = false;
  setStatus('Recherche d\'un adversaire...');
  socket.emit('find-game');
}

// --- Boutons ---

findBtn.addEventListener('click', startSearch);

replayBtn.addEventListener('click', startSearch);

// --- Cases du plateau ---

cells.forEach(cell => {
  cell.addEventListener('click', () => {
    if (!myTurn || cell.textContent !== '') return;
    const index = parseInt(cell.dataset.index, 10);
    socket.emit('make-move', { index, roomId });
  });
});

// --- Événements serveur ---

socket.on('waiting', () => {
  setStatus('En attente d\'un autre joueur...');
});

socket.on('game-start', ({ symbol, roomId: id }) => {
  mySymbol = symbol;
  roomId = id;
  myTurn = symbol === 'X';
  findBtn.hidden = true;
  enableBoard(myTurn);
  setStatus(myTurn ? `C'est votre tour (${mySymbol})` : `Tour de l'adversaire (${mySymbol})`);
});

socket.on('move-made', ({ index, symbol, board }) => {
  const cell = cells[index];
  cell.textContent = symbol;
  cell.classList.add(symbol.toLowerCase(), 'placed');

  // Retire la classe d'animation après qu'elle soit jouée
  cell.addEventListener('animationend', () => cell.classList.remove('placed'), { once: true });

  myTurn = symbol !== mySymbol;
  enableBoard(false);

  if (myTurn) {
    // Réactive uniquement les cases vides
    cells.forEach(c => {
      if (c.textContent === '') c.disabled = false;
    });
    setStatus(`C'est votre tour (${mySymbol})`);
  } else {
    setStatus(`Tour de l'adversaire`);
  }
});

socket.on('game-over', ({ winner, winningLine }) => {
  console.log('game-over reçu', { winner, winningLine });
  enableBoard(false);

  if (winningLine) {
    winningLine.forEach(i => cells[i].classList.add('winner'));
  }

  if (!winner) {
    setStatus('Match nul !');
  } else if (winner === mySymbol) {
    setStatus('Vous avez gagné !');
  } else {
    setStatus('Vous avez perdu.');
  }

  showReplay();
});

socket.on('opponent-left', () => {
  enableBoard(false);
  setStatus('Adversaire déconnecté.');
  showReplay();
});
