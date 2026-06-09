const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const { addToQueue, handleDisconnect, activeGames, socketRoom } = require('./matchmaking');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  console.log(`Joueur connecté : ${socket.id}`);

  socket.on('find-game', () => {
    addToQueue(socket, io);
  });

  socket.on('make-move', ({ index }) => {
    const roomId = socketRoom.get(socket.id);
    if (!roomId) return;

    const room = activeGames.get(roomId);
    if (!room) return;

    const { game } = room;
    const result = game.makeMove(index);
    if (!result.valid) return;

    io.to(roomId).emit('move-made', {
      index,
      symbol: result.symbol,
      board: result.board,
    });

    if (result.over) {
      io.to(roomId).emit('game-over', {
        winner: result.winner,
        winningLine: result.winningLine ?? null,
        board: result.board,
      });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Joueur déconnecté : ${socket.id}`);
    handleDisconnect(socket, io);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
