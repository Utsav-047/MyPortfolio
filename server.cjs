// ============================================================
//  MyPortfolio Task Manager API Server (server.cjs)
//  In-Memory Array Data Store with Real-Time Server Notifications
// ============================================================

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// ── In-Memory Data Store (Data stored in JavaScript Array) ──
let tasks = [
  { id: 1, title: 'Learn Node.js & Express', description: 'Understand core Node modules, Express routing, and middleware', completed: true },
  { id: 2, title: 'Build Task Management Backend', description: 'Implement REST endpoints with array storage and notifications', completed: false }
];
let nextId = 3;

// ── In-Memory Request Logs ──
const requestLogs = [];

// ============================================================
//  MIDDLEWARE PIPELINE
// ============================================================

// 1. CORS — Allow frontend dev server
app.use(cors());

// 2. Body Parser — Parse JSON request bodies
app.use(express.json());

// 3. Request Logging Middleware (Global)
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.socket.remoteAddress || '::1';

  res.on('finish', () => {
    const statusCode = res.statusCode;
    const consoleLog = `[${timestamp}] ${method} ${url} ${ip} - HTTP ${statusCode}`;
    console.log(consoleLog);

    requestLogs.push({
      id: Date.now() + Math.random(),
      timestamp,
      method,
      url,
      ip,
      statusCode
    });

    if (requestLogs.length > 100) requestLogs.shift();
  });

  next();
});

// 4. Content-Type Validation Middleware (POST/PUT only)
const validateContentType = (req, res, next) => {
  if (req.method === 'POST' || req.method === 'PUT') {
    const contentType = req.headers['content-type'];
    if (!contentType || !contentType.includes('application/json')) {
      return res.status(415).json({
        error: 'Unsupported Media Type',
        message: 'Content-Type header must be application/json'
      });
    }
  }
  next();
};

// 5. Task ID Format Validation Middleware
const validateTaskId = (req, res, next) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id <= 0) {
    return res.status(400).json({
      error: 'Invalid Task ID',
      message: 'Task ID must be a positive integer'
    });
  }
  req.taskId = id;
  next();
};

// ============================================================
//  RESTful ROUTES HANDLERS
// ============================================================

const router = express.Router();

// GET all tasks
router.get('/tasks', (req, res) => {
  res.status(200).json({
    success: true,
    count: tasks.length,
    data: tasks
  });
});

// POST new task (Data Submitted Notification)
router.post('/tasks', validateContentType, (req, res, next) => {
  try {
    const { title, description, completed } = req.body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Title is required'
      });
    }

    const newTask = {
      id: nextId++,
      title: title.trim(),
      description: (description && typeof description === 'string') ? description.trim() : '',
      completed: typeof completed === 'boolean' ? completed : false
    };

    // Store data in Array
    tasks.push(newTask);

    // Server Notification on Data Submission
    console.log(`\n========================================`);
    console.log(`🔔 SERVER NOTIFICATION: Your data is submitted!`);
    console.log(`   Task ID: #${newTask.id} | Title: "${newTask.title}"`);
    console.log(`========================================\n`);

    res.status(201).json({
      success: true,
      message: 'Your data is submitted',
      data: newTask
    });
  } catch (err) {
    next(err);
  }
});

// PUT update task (Data Submitted / Updated Notification)
router.put('/tasks/:id', validateTaskId, validateContentType, (req, res, next) => {
  try {
    const taskIndex = tasks.findIndex(t => t.id === req.taskId);

    if (taskIndex === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${req.taskId} not found`
      });
    }

    const { title, description, completed } = req.body;
    const task = tasks[taskIndex];

    if (title !== undefined) task.title = String(title).trim();
    if (description !== undefined) task.description = String(description).trim();
    if (completed !== undefined) task.completed = Boolean(completed);

    // Server Notification on Data Submission/Update
    console.log(`\n========================================`);
    console.log(`🔔 SERVER NOTIFICATION: Your data is submitted (Updated)!`);
    console.log(`   Task ID: #${task.id} | Title: "${task.title}"`);
    console.log(`========================================\n`);

    res.status(200).json({
      success: true,
      message: 'Your data is submitted',
      data: task
    });
  } catch (err) {
    next(err);
  }
});

// DELETE task (Data Deleted Notification)
router.delete('/tasks/:id', validateTaskId, (req, res, next) => {
  try {
    const taskIndex = tasks.findIndex(t => t.id === req.taskId);

    if (taskIndex === -1) {
      return res.status(404).json({
        error: 'Not Found',
        message: `Task with ID ${req.taskId} not found`
      });
    }

    const deletedTask = tasks.splice(taskIndex, 1)[0];

    // Server Notification on Data Deletion
    console.log(`\n========================================`);
    console.log(`🚨 SERVER NOTIFICATION: Data deleted!`);
    console.log(`   Deleted Task ID: #${deletedTask.id} | Title: "${deletedTask.title}"`);
    console.log(`========================================\n`);

    res.status(200).json({
      success: true,
      message: 'Data deleted',
      data: deletedTask
    });
  } catch (err) {
    next(err);
  }
});

// Mount router on both /api and root /
app.use('/api', router);
app.use('/', router);

// GET /logs — for live telemetry UI
app.get('/api/logs', (req, res) => {
  res.status(200).json({ success: true, count: requestLogs.length, data: requestLogs });
});
app.get('/logs', (req, res) => {
  res.status(200).json({ success: true, count: requestLogs.length, data: requestLogs });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route Not Found',
    message: `Cannot ${req.method} ${req.url}`
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.message}`);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong on the server'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`MyPortfolio Task Management Server running on http://localhost:${PORT}`);
  console.log(`Data Storage: In-Memory Array (tasks array inside MyPortfolio)`);
});
