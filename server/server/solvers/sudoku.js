const utils = require('./sudoku_utils');

function normalizeBoard(input) {
  if (!Array.isArray(input) || input.length !== 9)
    throw new Error('Board must be 9x9 array');

  return input.map(row => {
    if (!Array.isArray(row) || row.length !== 9)
      throw new Error('Board must be 9x9 array');

    return row.map(cell => {
      if (cell === null || cell === undefined || cell === '.') return 0;
      if (cell === 0) return 0;

      const n = Number(cell);
      if (!n || n < 0 || n > 9) return 0;
      return n;
    });
  });
}

function getHint(rawBoard) {
  const board = normalizeBoard(rawBoard);

  // Try logical hint first
  const logical = utils.findLogicalStep(board);
  if (logical) return { mode: 'logical', ...logical };

  // Fallback to backtracking
  const copy = utils.deepCopy(board);
  const solved = utils.solveBacktrack(copy);

  if (!solved) {
    return { mode: 'failed', message: 'No solution found' };
  }

  // Identify first empty cell and return its value
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!board[r][c] || board[r][c] === 0) {
        return {
          mode: 'forced',
          r,
          c,
          value: solved[r][c],
          reason: 'backtracking solution'
        };
      }
    }
  }

  return { mode: 'solved', message: 'Already solved' };
}

module.exports = { getHint };
