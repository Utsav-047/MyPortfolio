const appEventBus = require('../utils/eventService');

// 1. GET /api/events/stream — Server-Sent Events (SSE) Stream
const streamEvents = (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*'
  });

  // Flush headers immediately
  if (res.flushHeaders) {
    res.flushHeaders();
  }

  // Register client in the Event Bus
  appEventBus.addSseClient(res);

  // Send periodic keepalive comment every 25 seconds to keep connection open across firewalls/proxies
  const keepAliveInterval = setInterval(() => {
    res.write(': keepalive\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAliveInterval);
  });
};

// 2. GET /api/events/logs — Retrieve recent audit logs from Event Bus
const getEventLogs = (req, res) => {
  const logs = appEventBus.getRecentLogs();
  return res.status(200).json({
    success: true,
    count: logs.length,
    data: logs
  });
};

// 3. GET /api/events/metrics — Retrieve Event Bus and Worker Metrics
const getEventMetrics = (req, res) => {
  const metrics = appEventBus.getMetrics();
  return res.status(200).json({
    success: true,
    data: metrics
  });
};

// 4. POST /api/events/jobs/dispatch — Dispatch Asynchronous Background Job (Returns 202 Accepted)
const dispatchJob = (req, res) => {
  const { type, payload } = req.body;

  const validTypes = ['BULK_TASK_PROCESSOR', 'AUDIT_REPORT_GENERATOR', 'TEAM_BROADCAST_ALERTS'];
  const jobType = validTypes.includes(type) ? type : 'BULK_TASK_PROCESSOR';

  const startTime = Date.now();

  // Dispatch to non-blocking worker queue
  const job = appEventBus.dispatchAsyncJob(jobType, payload || {}, req.user?.id || 'demo_user');
  const queueLatencyMs = Date.now() - startTime;

  // Immediate HTTP 202 Accepted response — request thread is never blocked!
  return res.status(202).json({
    success: true,
    message: 'Asynchronous job accepted and dispatched to background event worker.',
    queueLatencyMs,
    job: {
      jobId: job.jobId,
      type: job.type,
      status: job.status,
      createdAt: job.createdAt,
      checkStatusUrl: `/api/events/jobs/${job.jobId}`
    }
  });
};

// 5. GET /api/events/jobs — Retrieve all tracked background jobs
const getAllJobs = (req, res) => {
  const jobs = appEventBus.getAllJobs();
  return res.status(200).json({
    success: true,
    count: jobs.length,
    data: jobs
  });
};

// 6. GET /api/events/jobs/:jobId — Check progress of a specific async job
const getJobStatus = (req, res) => {
  const job = appEventBus.getJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({
      error: 'Not Found',
      message: `Job '${req.params.jobId}' does not exist in job registry.`
    });
  }

  return res.status(200).json({
    success: true,
    data: job
  });
};

module.exports = {
  streamEvents,
  getEventLogs,
  getEventMetrics,
  dispatchJob,
  getAllJobs,
  getJobStatus
};
