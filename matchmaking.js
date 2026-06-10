const TicTacToeGame = require('./game');

const queue = [];
const activeGames = new Map();   // roomId -> { game, players: [socketA, socketB] }
const socketRoom = new Map();    // socketId -> roomId

function addToQueue(socket, io) {
  // Refuse si le joueur est déjà en file ou en partie
  if (queue.includes(socket) || socketRoom.has(socket.id)) return;

  if (queue.length > 0) {
    const opponent = queue.shift();

    const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const game = new TicTacToeGame();

    const [symbolA, symbolB] = Math.random() < 0.5 ? ['X', 'O'] : ['O', 'X'];

    opponent.join(roomId);
    socket.join(roomId);

    activeGames.set(roomId, {
      game,
      players: [opponent, socket],
      symbols: { [opponent.id]: symbolA, [socket.id]: symbolB },
    });
    socketRoom.set(opponent.id, roomId);
    socketRoom.set(socket.id, roomId);

    opponent.emit('game-start', { symbol: symbolA, roomId });
    socket.emit('game-start', { symbol: symbolB, roomId });
  } else {
    queue.push(socket);
    socket.emit('waiting');
  }
}

function removeFromQueue(socket) {
  const index = queue.indexOf(socket);
  if (index !== -1) {
    queue.splice(index, 1);
  }
}

function handleDisconnect(socket, io) {
  const inQueue = queue.includes(socket);
  if (inQueue) {
    removeFromQueue(socket);
    return;
  }

  const roomId = socketRoom.get(socket.id);
  if (!roomId) return;

  const room = activeGames.get(roomId);
  if (room) {
    const opponent = room.players.find(p => p.id !== socket.id);
    if (opponent) {
      opponent.emit('opponent-left');
      socketRoom.delete(opponent.id);
    }
    activeGames.delete(roomId);
  }

  socketRoom.delete(socket.id);
}

module.exports = { addToQueue, removeFromQueue, handleDisconnect, activeGames, socketRoom };
