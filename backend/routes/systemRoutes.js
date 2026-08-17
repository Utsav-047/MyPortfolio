const express = require('express');
const store = require('../data/store');

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'online',
    message: 'Backend is running successfully!',
    timestamp: new Date().toISOString(),
    endpoints: {
      tasks: '/api/tasks',
      logs: '/api/logs',
      health: '/health'
    }
  });
});

router.get('/health', (req, res) => {
  res.status(200).send(`
    <div style="font-family: system-ui, sans-serif; padding: 2rem; background: #0f172a; color: #38bdf8; min-height: 100vh;">
      <h1 style="color: #4ade80;">🚀 Backend is Running Successfully!</h1>
      <p style="color: #cbd5e1; font-size: 1.1rem;">Server running on port <strong>5000</strong></p>
      <ul style="color: #94a3b8; font-size: 1rem; line-height: 1.8;">
        <li>Tasks API: <a href="/api/tasks" style="color: #38bdf8;">/api/tasks</a></li>
        <li>Logs API: <a href="/api/logs" style="color: #38bdf8;">/api/logs</a></li>
      </ul>
    </div>
  `);
});

router.get('/api/logs', (req, res) => {
  res.status(200).json({ success: true, count: store.requestLogs.length, data: store.requestLogs });
});

router.get('/logs', (req, res) => {
  res.status(200).json({ success: true, count: store.requestLogs.length, data: store.requestLogs });
});

module.exports = router;
