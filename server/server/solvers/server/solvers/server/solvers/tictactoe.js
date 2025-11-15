// server/solvers/tictactoe.js
// board: array of 9 elements, 0-empty, 1-X (player), 2-O (opponent/AI)
// returns a suggestion object { mode, pos, reason }

function checkWin(b, val) {
  const lines = [
    [0,1,2],[3,4,5],[6,7,8], // rows
    [0,3,6],[1,4,7],[2,5,8], // cols
    [0,4,8],[2,4,6]          // diags
  ];
  return lines.some(line => line.every(i => b[i] === val));
}

function getHint(board) {
  // shallow copy
  const b = board.slice();

  // 1) Win if possible (player = 1)
  for (let i = 0; i < 9; i++) {
    if (!b[i]) {
      const copy = b.slice(); copy[i] = 1;
      if (checkWin(copy, 1)) return { mode: 'win', pos: i, reason: 'winning move' };
    }
  }

  // 2) Block opponent (opponent = 2)
  for (let i = 0; i < 9; i++) {
    if (!b[i]) {
      const copy = b.slice(); copy[i] = 2;
      if (checkWin(copy, 2)) return { mode: 'block', pos: i, reason: 'block opponent' };
    }
  }

  // 3) Take center if free
  if (!b[4]) return { mode: 'center', pos: 4, reason: 'take center' };

  // 4) Take any corner
  const corners = [0,2,6,8];
  for (const p of corners) if (!b[p]) return { mode: 'corner', pos: p, reason: 'take corner' };

  // 5) Else take first available
  for (let i = 0; i < 9; i++) if (!b[i]) return { mode: 'any', pos: i, reason: 'fallback move' };

  // 6) Full board
  return { mode: 'full', message: 'board full or no moves' };
}

module.exports = { getHint };
