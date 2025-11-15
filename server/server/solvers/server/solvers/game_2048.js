function cloneGrid(g) {
  return g.map(row => row.slice());
}

function simulateMove(board, dir) {
  const N = 4;
  const grid = cloneGrid(board);

  function mergeRowLeft(row) {
    let arr = row.filter(x => x && x > 0);
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        arr.splice(i + 1, 1);
      }
    }
    while (arr.length < N) arr.push(0);
    return arr;
  }

  let moved = false;

  if (dir === "left") {
    for (let r = 0; r < N; r++) {
      const before = grid[r].slice();
      grid[r] = mergeRowLeft(grid[r]);
      if (grid[r].toString() !== before.toString()) moved = true;
    }
  } else if (dir === "right") {
    for (let r = 0; r < N; r++) {
      const before = grid[r].slice();
      grid[r] = mergeRowLeft(grid[r].slice().reverse()).reverse();
      if (grid[r].toString() !== before.toString()) moved = true;
    }
  } else if (dir === "up") {
    let t = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => grid[j][i]));
    for (let r = 0; r < N; r++) t[r] = mergeRowLeft(t[r]);
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) grid[j][i] = t[i][j];
  } else if (dir === "down") {
    let t = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => grid[j][i]));
    for (let r = 0; r < N; r++) t[r] = mergeRowLeft(t[r].slice().reverse()).reverse();
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) grid[j][i] = t[i][j];
  }

  return { board: grid, moved };
}

function countEmpty(grid) {
  let cnt = 0;
  for (let r = 0; r < 4; r++)
    for (let c = 0; c < 4; c++)
      if (!grid[r][c] || grid[r][c] === 0) cnt++;
  return cnt;
}

function evaluateBoard(grid) {
  return countEmpty(grid);
}

function getHint(board) {
  const moves = ["left", "right", "up", "down"];
  let best = null;

  for (const m of moves) {
    const res = simulateMove(board, m);
    if (!res.moved) continue;

    const score = evaluateBoard(res.board);
    if (!best || score > best.score) {
      best = { move: m, score, board: res.board };
    }
  }

  if (!best) return { mode: "no_move", message: "No valid move" };

  return {
    mode: "suggest",
    move: best.move,
    reason: "maximize empty tiles (simple heuristic)",
    estimate: best.score
  };
}

module.exports = { getHint };
