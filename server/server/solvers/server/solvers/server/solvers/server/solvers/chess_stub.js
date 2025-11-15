// server/solvers/chess_stub.js
// Minimal stub hint engine for chess
// Later you can replace with a real chess engine (like stockfish or chess.js)

function getHint(input) {
  return {
    mode: 'stub',
    message: 'Chess hints not implemented yet. Provide FEN or move list to extend.'
  };
}

module.exports = { getHint };
