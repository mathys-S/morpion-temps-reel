const WINNING_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // lignes
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // colonnes
  [0, 4, 8], [2, 4, 6],            // diagonales
];

class TicTacToeGame {
  constructor() {
    this.board = Array(9).fill(null);
    this.currentTurn = 'X';
  }

  makeMove(cellIndex) {
    if (cellIndex < 0 || cellIndex > 8 || this.board[cellIndex] !== null) {
      return { valid: false };
    }

    const symbol = this.currentTurn;
    this.board[cellIndex] = symbol;

    const winner = this._checkWinner();
    const isDraw = !winner && this.board.every(cell => cell !== null);

    if (!winner && !isDraw) {
      this.currentTurn = symbol === 'X' ? 'O' : 'X';
    }

    const winningLine = winner ? this._getWinningLine() : null;
    return { valid: true, symbol, winner, isDraw, winningLine, board: this.board };
  }

  getState() {
    return { board: this.board, currentTurn: this.currentTurn };
  }

  _checkWinner() {
    for (const [a, b, c] of WINNING_LINES) {
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return this.board[a];
      }
    }
    return null;
  }

  _getWinningLine() {
    for (const line of WINNING_LINES) {
      const [a, b, c] = line;
      if (this.board[a] && this.board[a] === this.board[b] && this.board[a] === this.board[c]) {
        return line;
      }
    }
    return null;
  }
}

module.exports = TicTacToeGame;
