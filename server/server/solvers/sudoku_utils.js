function deepCopy(board) {
  return board.map(row => row.slice());
}

function isValid(board, r, c, val) {
  for (let j = 0; j < 9; j++) if (board[r][j] === val) return false;
  for (let i = 0; i < 9; i++) if (board[i][c] === val) return false;

  const br = Math.floor(r / 3) * 3;
  const bc = Math.floor(c / 3) * 3;

  for (let i = br; i < br + 3; i++) {
    for (let j = bc; j < bc + 3; j++) {
      if (board[i][j] === val) return false;
    }
  }
  return true;
}

function computeCandidates(board) {
  const cand = Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => [])
  );

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] && board[r][c] !== 0) continue;

      const possibles = [];
      for (let v = 1; v <= 9; v++) {
        if (isValid(board, r, c, v)) possibles.push(v);
      }
      cand[r][c] = possibles;
    }
  }
  return cand;
}

function findSingleCandidate(board, candidates) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if ((board[r][c] === 0 || board[r][c] === null) &&
          candidates[r][c].length === 1) {
        return {
          type: 'single_candidate',
          r,
          c,
          value: candidates[r][c][0],
          reason: 'only candidate'
        };
      }
    }
  }
  return null;
}

function findSinglePositionInUnit(board, candidates) {
  for (let num = 1; num <= 9; num++) {

    // rows
    for (let r = 0; r < 9; r++) {
      let spots = [];
      for (let c = 0; c < 9; c++) {
        if ((board[r][c] === 0 || board[r][c] === null) &&
            candidates[r][c].includes(num)) {
          spots.push({ r, c });
        }
      }
      if (spots.length === 1) {
        return {
          type: 'single_position',
          unit: 'row',
          num,
          r: spots[0].r,
          c: spots[0].c,
          value: num,
          reason: `only position for ${num} in row ${r + 1}`
        };
      }
    }

    // columns
    for (let c = 0; c < 9; c++) {
      let spots = [];
      for (let r = 0; r < 9; r++) {
        if ((board[r][c] === 0 || board[r][c] === null) &&
            candidates[r][c].includes(num)) {
          spots.push({ r, c });
        }
      }
      if (spots.length === 1) {
        return {
          type: 'single_position',
          unit: 'col',
          num,
          r: spots[0].r,
          c: spots[0].c,
          value: num,
          reason: `only position for ${num} in column ${c + 1}`
        };
      }
    }

    // blocks
    for (let br = 0; br < 3; br++) {
      for (let bc = 0; bc < 3; bc++) {
        let spots = [];
        for (let i = br * 3; i < br * 3 + 3; i++) {
          for (let j = bc * 3; j < bc * 3 + 3; j++) {
            if ((board[i][j] === 0 || board[i][j] === null) &&
                candidates[i][j].includes(num)) {
              spots.push({ r: i, c: j });
            }
          }
        }
        if (spots.length === 1) {
          return {
            type: 'single_position',
            unit: 'block',
            num,
            r: spots[0].r,
            c: spots[0].c,
            value: num,
            reason: `only position for ${num} in block ${br + 1}-${bc + 1}`
          };
        }
      }
    }
  }

  return null;
}

function findLogicalStep(board) {
  const candidates = computeCandidates(board);

  const step1 = findSingleCandidate(board, candidates);
  if (step1) return { kind: 'logical', step: step1, candidates };

  const step2 = findSinglePositionInUnit(board, candidates);
  if (step2) return { kind: 'logical', step: step2, candidates };

  return null;
}

function solveBacktrack(board) {
  let r0 = -1, c0 = -1;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (!board[r][c] || board[r][c] === 0) {
        r0 = r;
        c0 = c;
        break;
      }
    }
    if (r0 !== -1) break;
  }

  if (r0 === -1) return board;

  for (let v = 1; v <= 9; v++) {
    if (isValid(board, r0, c0, v)) {
      board[r0][c0] = v;

      const res = solveBacktrack(board);
      if (res) return res;

      board[r0][c0] = 0;
    }
  }
  return null;
}

module.exports = {
  deepCopy,
  computeCandidates,
  findLogicalStep,
  solveBacktrack
};
