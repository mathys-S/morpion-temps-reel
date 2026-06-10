const socket = io();

const statusEl = document.getElementById('status');
const findBtn  = document.getElementById('find-game-btn');
const replayBtn = document.getElementById('replay-btn');
const cells = document.querySelectorAll('.cell');

let mySymbol = null;
let roomId   = null;
let myTurn   = false;

// --- Helpers ---

function setStatus(text, ...classes) {
  statusEl.textContent = text;
  statusEl.className = classes.filter(Boolean).join(' ');
}

function enableBoard(enabled) {
  cells.forEach(cell => { cell.disabled = !enabled; });
}

function resetBoard() {
  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
    cell.disabled = true;
  });
}

function resetFindBtn() {
  findBtn.disabled = false;
  findBtn.classList.remove('searching');
  findBtn.textContent = 'Trouver une partie';
}

function showReplay() {
  replayBtn.hidden = false;
  findBtn.hidden = true;
  resetFindBtn();
}

function startSearch() {
  resetBoard();
  replayBtn.hidden = true;
  findBtn.hidden = false;
  findBtn.disabled = true;
  findBtn.classList.add('searching');
  findBtn.textContent = 'Recherche…';
  mySymbol = null;
  roomId   = null;
  myTurn   = false;
  setStatus('Recherche d’un adversaire…');
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
  setStatus('En attente d’un autre joueur…');
});

socket.on('game-start', ({ symbol, roomId: id }) => {
  mySymbol = symbol;
  roomId   = id;
  myTurn   = symbol === 'X';
  resetFindBtn();
  findBtn.hidden = true;
  enableBoard(myTurn);

  const opponentSymbol = mySymbol === 'X' ? 'O' : 'X';
  if (myTurn) {
    setStatus(`C’est votre tour (${mySymbol})`, 'my-turn', `turn-${mySymbol.toLowerCase()}`);
  } else {
    setStatus(`Tour de l’adversaire`, `turn-${opponentSymbol.toLowerCase()}`);
  }
});

socket.on('move-made', ({ index, symbol }) => {
  const cell = cells[index];
  cell.textContent = symbol;
  cell.classList.add(symbol.toLowerCase(), 'placed');
  cell.addEventListener('animationend', () => cell.classList.remove('placed'), { once: true });

  myTurn = symbol !== mySymbol;
  enableBoard(false);

  const opponentSymbol = mySymbol === 'X' ? 'O' : 'X';
  if (myTurn) {
    cells.forEach(c => { if (c.textContent === '') c.disabled = false; });
    setStatus(`C’est votre tour (${mySymbol})`, 'my-turn', `turn-${mySymbol.toLowerCase()}`);
  } else {
    setStatus(`Tour de l’adversaire`, `turn-${opponentSymbol.toLowerCase()}`);
  }
});

socket.on('game-over', ({ winner, winningLine }) => {
  enableBoard(false);

  if (winningLine) {
    winningLine.forEach(i => cells[i].classList.add('winner'));
  }

  if (!winner) {
    setStatus('Match nul !', 'result-draw');
  } else if (winner === mySymbol) {
    setStatus('Vous avez gagné !', 'result-win');
  } else {
    setStatus('Vous avez perdu.', 'result-lose');
  }

  showReplay();
});

socket.on('opponent-left', () => {
  enableBoard(false);
  setStatus('Adversaire déconnecté.', 'result-lose');
  showReplay();
});
