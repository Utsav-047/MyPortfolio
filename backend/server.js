// ============================================================
//  MyPortfolio Task Manager API Server (Practical 5: Mongoose & MongoDB)
// ============================================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const store = require('./data/store');
const requestLogger = require('./middleware/requestLogger');
const { notFoundHandler, globalErrorHandler } = require('./utils/errorHandler');
const taskRoutes = require('./routes/taskRoutes');
const authRoutes = require('./routes/authRoutes');
const systemRoutes = require('./routes/systemRoutes');
const eventRoutes = require('./routes/eventRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// 1. CORS
app.use(cors());

// 2. Body Parser
app.use(express.json());

// 3. Request Logging Middleware
app.use(requestLogger);

// 4. Database Connection Status Endpoint
app.get('/api/db-status', (req, res) => {
  const states = { 0: 'Disconnected', 1: 'Connected (MongoDB Atlas)', 2: 'Connecting', 3: 'Disconnecting' };
  const stateCode = mongoose.connection.readyState;
  res.status(200).json({
    status: stateCode === 1 ? 'online' : 'offline',
    dbState: states[stateCode] || 'Unknown',
    dbName: mongoose.connection.name || 'N/A',
    host: mongoose.connection.host || 'N/A'
  });
});

// Direct endpoint for Practical 12 CI/CD automated test verification
app.get('/tasks', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'GET /tasks reachable for CI/CD pipeline automated test suite',
    total: store.tasks ? store.tasks.length : 0,
    data: store.tasks || []
  });
});

// 5. Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/events', eventRoutes);
app.use('/', systemRoutes);

// 6. 404 Handler
app.use(notFoundHandler);

// 7. Global Error Handler (Structured Mongoose Validation Errors)
app.use(globalErrorHandler);

// Start Server conditionally (only when executed directly, not when imported by test runner)
if (require.main === module) {
  // Connect to MongoDB Atlas / Local
  connectDB();

  app.listen(PORT, () => {
    console.log(`\n🚀 MyPortfolio Backend Server running on http://localhost:${PORT}`);
    console.log(`📡 Architecture: Node.js -> Express -> Mongoose ODM -> MongoDB`);
    console.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}\n`);
  });
}

module.exports = app;

