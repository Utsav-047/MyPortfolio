const express = require('express');
const {
  streamEvents,
  getEventLogs,
  getEventMetrics,
  dispatchJob,
  getAllJobs,
  getJobStatus
} = require('../controllers/eventController');

const router = express.Router();

// Real-Time Server-Sent Events stream (public or JWT; public SSE enables easy browser subscriptions)
router.get('/stream', streamEvents);

// Event Bus Audit Logs & System Metrics
router.get('/logs', getEventLogs);
router.get('/metrics', getEventMetrics);

// Asynchronous Background Job Processing (Non-Blocking)
router.post('/jobs/dispatch', dispatchJob);
router.get('/jobs', getAllJobs);
router.get('/jobs/:jobId', getJobStatus);

module.exports = router;
