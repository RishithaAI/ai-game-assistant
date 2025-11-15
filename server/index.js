const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const { Server } = require('socket.io');

const sudoku = require('./solvers/sudoku');
const game2048 = require('./solvers/game_2048');
const tictactoe = require('./solvers/tictactoe');
const chess = require('./solvers/chess_stub');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

app.use(bodyParser.json());

app.get('/api/health', (req,res) => {
  res.json({ ok: true, time: Date.now() });
});

// REST API for hints
app.post('/api/hint/:game', (req, res) => {
  try {
    const game = req.params.game;
    const payload = req.body;
    if (!payload) return res.status(400).json({ ok:false, error:'No payload' });

    if (game === 'sudoku')
      return res.json({ ok: true, hint: sudoku.getHint(payload.board) });

    if (game === '2048')
      return res.json({ ok: true, hint: game2048.getHint(payload.board) });

    if (game === 'tictactoe')
      return res.json({ ok: true, hint: tictactoe.getHint(payload.board) });

    if (game === 'chess')
      return res.json({ ok: true, hint: chess.getHint(payload.fen || payload.moves) });

    return res.status(400).json({ ok:false, error:'Unsupported game' });

  } catch (err) {
    console.error('REST hint error:', err);
    res.status(500).json({ ok:false, error: err.message });
  }
});

// Feedback system
const feedbackQueue = [];

app.post('/api/feedback', (req, res) => {
  const fb = req.body || {};
  fb.ts = Date.now();
  feedbackQueue.push(fb);
  console.log('Feedback received:', fb);
  res.json({ ok:true, message:'Feedback stored' });
});

app.get('/api/feedback', (req, res) => {
  res.json({
    ok: true,
    count: feedbackQueue.length,
    feedback: feedbackQueue
  });
});

// WebSocket realtime handling
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on('join_session', (data) => {
    if (data && data.sessionId) socket.join(data.sessionId);
  });

  socket.on('board_state', async (msg) => {
    try {
      if (!msg || !msg.game || !msg.state) {
        socket.emit('error', { code:'INVALID', message:'Missing {game, state}' });
        return;
      }

      let hint = null;

      if (msg.game === 'sudoku')       hint = sudoku.getHint(msg.state);
      else if (msg.game === '2048')    hint = game2048.getHint(msg.state);
      else if (msg.game === 'tictactoe') hint = tictactoe.getHint(msg.state);
      else if (msg.game === 'chess')   hint = chess.getHint(msg.state);
      else hint = { error: 'Unsupported game' };

      const payload = {
        type: 'hint',
        game: msg.game,
        sessionId: msg.sessionId || socket.id,
        payload: hint,
        ts: Date.now()
      };

      if (msg.sessionId) io.to(msg.sessionId).emit('hint', payload);
      else socket.emit('hint', payload);

    } catch (err) {
      console.error('board_state error:', err);
      socket.emit('error', { code:'SERVER_ERR', message: err.message });
    }
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected:', socket.id);
  });
});

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Multi-game hint server running on port ${PORT}`);
});
