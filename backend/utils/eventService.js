const EventEmitter = require('events');

// ============================================================================
// Asynchronous Processing & Event-Driven Architecture Service
// Core Node.js EventEmitter Bus with In-Memory Job Queue & SSE Broadcaster
// ============================================================================

class AppEventBus extends EventEmitter {
  constructor() {
    super();
    // Allow up to 100 concurrent listeners without warning
    this.setMaxListeners(100);

    // In-memory audit log of emitted events (last 100 events)
    this.eventLogs = [];

    // In-memory tracking of asynchronous background jobs
    this.jobs = new Map();

    // Connected Server-Sent Events (SSE) client response streams
    this.sseClients = new Set();

    // Global performance & event metrics
    this.metrics = {
      totalEventsEmitted: 0,
      totalJobsDispatched: 0,
      totalJobsCompleted: 0,
      totalJobsFailed: 0,
      startTime: Date.now()
    };

    // Register built-in decoupled consumers
    this.registerConsumers();
  }

  // ── Emit Event & Broadcast via SSE ──────────────────────────
  emitAppEvent(eventType, payload = {}) {
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const timestamp = new Date().toISOString();
    const eventRecord = {
      id: eventId,
      type: eventType,
      payload,
      timestamp,
      processedBy: []
    };

    this.metrics.totalEventsEmitted += 1;

    // Log in memory (bounded to last 100 events)
    this.eventLogs.unshift(eventRecord);
    if (this.eventLogs.length > 100) {
      this.eventLogs.pop();
    }

    // Console logging
    console.log(`\n[EVENT EMITTED] ${eventType} (ID: ${eventId})`);
    console.log(`   Payload:`, JSON.stringify(payload));

    // Emit on Node.js EventEmitter bus (triggers registered async consumers)
    this.emit(eventType, eventRecord);

    // Broadcast in real-time to all connected SSE clients
    this.broadcastSSE(eventRecord);

    return eventRecord;
  }

  // ── Server-Sent Events (SSE) Management ─────────────────────
  addSseClient(res) {
    this.sseClients.add(res);
    console.log(`[SSE CLIENT CONNECTED] Active clients: ${this.sseClients.size}`);

    // Send initial handshake event
    res.write(`data: ${JSON.stringify({
      type: 'SSE_CONNECTED',
      message: 'Subscribed to real-time event-driven stream',
      activeClients: this.sseClients.size,
      timestamp: new Date().toISOString()
    })}\n\n`);

    res.on('close', () => {
      this.sseClients.delete(res);
      console.log(`[SSE CLIENT DISCONNECTED] Active clients: ${this.sseClients.size}`);
    });
  }

  broadcastSSE(eventRecord) {
    const dataString = `data: ${JSON.stringify(eventRecord)}\n\n`;
    for (const client of this.sseClients) {
      try {
        client.write(dataString);
      } catch (err) {
        console.error('[SSE BROADCAST ERROR]', err.message);
        this.sseClients.delete(client);
      }
    }
  }

  // ── Register Decoupled Event Consumers ──────────────────────
  registerConsumers() {
    // 1. Audit Logger Consumer
    this.on('TASK_CREATED', (evt) => {
      evt.processedBy.push('AuditLogConsumer');
      console.log(`  [AuditLogConsumer] Recorded task creation: #${evt.payload.taskId || evt.payload.id}`);
    });

    this.on('TASK_STATUS_CHANGED', (evt) => {
      evt.processedBy.push('AuditLogConsumer');
      console.log(`  [AuditLogConsumer] Status transition recorded for task: #${evt.payload.taskId} -> ${evt.payload.newStatus}`);
    });

    this.on('TASK_DELETED', (evt) => {
      evt.processedBy.push('AuditLogConsumer');
      console.log(`  [AuditLogConsumer] Task deletion logged for: #${evt.payload.taskId}`);
    });

    // 2. Notification Consumer (simulates async dispatch to assignee/manager)
    this.on('TASK_CREATED', (evt) => {
      evt.processedBy.push('NotificationConsumer');
      const assignee = evt.payload.assignedTo?.name || 'Team';
      console.log(`  [NotificationConsumer] Queued async alert for assignee "${assignee}"`);
    });

    this.on('TASK_STATUS_CHANGED', (evt) => {
      if (evt.payload.newStatus === 'completed') {
        evt.processedBy.push('NotificationConsumer');
        console.log(`  [NotificationConsumer] Dispatched completion notification to team manager`);
      }
    });

    // 3. Background Job Lifecycle Consumer
    this.on('ASYNC_JOB_STARTED', (evt) => {
      evt.processedBy.push('JobSupervisorConsumer');
    });

    this.on('ASYNC_JOB_PROGRESS', (evt) => {
      evt.processedBy.push('JobSupervisorConsumer');
    });

    this.on('ASYNC_JOB_COMPLETED', (evt) => {
      evt.processedBy.push('JobSupervisorConsumer');
      this.metrics.totalJobsCompleted += 1;
    });

    this.on('ASYNC_JOB_FAILED', (evt) => {
      evt.processedBy.push('JobSupervisorConsumer');
      this.metrics.totalJobsFailed += 1;
    });
  }

  // ── Asynchronous Job Processing Queue (Non-Blocking Workers) ─
  dispatchAsyncJob(jobType, payload = {}, userId = 'system') {
    const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const createdAt = new Date().toISOString();

    const job = {
      jobId,
      type: jobType,
      userId,
      status: 'QUEUED', // QUEUED | PROCESSING | COMPLETED | FAILED
      progress: 0,
      payload,
      result: null,
      error: null,
      createdAt,
      startedAt: null,
      completedAt: null,
      durationMs: null
    };

    this.jobs.set(jobId, job);
    this.metrics.totalJobsDispatched += 1;

    // Emit event: Job Queued
    this.emitAppEvent('ASYNC_JOB_QUEUED', {
      jobId,
      type: jobType,
      status: 'QUEUED',
      createdAt
    });

    // Kick off asynchronous non-blocking worker execution using setImmediate / setTimeout
    setImmediate(() => {
      this.processJobWorker(jobId);
    });

    return job;
  }

  // Worker implementation for simulated asynchronous processing
  async processJobWorker(jobId) {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'PROCESSING';
    job.startedAt = new Date().toISOString();
    const startTime = Date.now();

    this.emitAppEvent('ASYNC_JOB_STARTED', {
      jobId,
      type: job.type,
      startedAt: job.startedAt
    });

    try {
      // Execute progressive stages to simulate real asynchronous computational workload
      const totalSteps = 4;
      for (let step = 1; step <= totalSteps; step++) {
        // Asynchronous delay simulating CPU or I/O work (400ms per step)
        await new Promise((resolve) => setTimeout(resolve, 450));

        job.progress = Math.round((step / totalSteps) * 100);

        let stepDescription = '';
        if (job.type === 'BULK_TASK_PROCESSOR') {
          stepDescription = `Processed batch chunk ${step}/${totalSteps} (${job.progress}% completed)`;
        } else if (job.type === 'AUDIT_REPORT_GENERATOR') {
          stepDescription = `Compiled audit logs section ${step}/${totalSteps} (${job.progress}%)`;
        } else if (job.type === 'TEAM_BROADCAST_ALERTS') {
          stepDescription = `Dispatched notification channel batch ${step}/${totalSteps} (${job.progress}%)`;
        } else {
          stepDescription = `Step ${step}/${totalSteps} executed successfully`;
        }

        this.emitAppEvent('ASYNC_JOB_PROGRESS', {
          jobId,
          type: job.type,
          progress: job.progress,
          step,
          totalSteps,
          stepDescription
        });
      }

      // Finalize job
      job.status = 'COMPLETED';
      job.completedAt = new Date().toISOString();
      job.durationMs = Date.now() - startTime;
      job.progress = 100;

      // Construct simulated result
      if (job.type === 'BULK_TASK_PROCESSOR') {
        job.result = {
          processedItems: 24,
          updatedStatus: job.payload.targetStatus || 'completed',
          summary: 'Bulk operations applied asynchronously without blocking API request threads.'
        };
      } else if (job.type === 'AUDIT_REPORT_GENERATOR') {
        job.result = {
          reportId: `RPT-${Date.now().toString().slice(-6)}`,
          generatedAt: job.completedAt,
          recordsScanned: 180,
          complianceStatus: '100% Passed',
          fileSize: '48.2 KB'
        };
      } else {
        job.result = {
          deliveredAlerts: 16,
          failedAlerts: 0,
          channels: ['Email', 'In-App SSE', 'Dashboard Push']
        };
      }

      this.emitAppEvent('ASYNC_JOB_COMPLETED', {
        jobId,
        type: job.type,
        durationMs: job.durationMs,
        result: job.result,
        completedAt: job.completedAt
      });
    } catch (err) {
      job.status = 'FAILED';
      job.error = err.message;
      job.completedAt = new Date().toISOString();
      job.durationMs = Date.now() - startTime;

      this.emitAppEvent('ASYNC_JOB_FAILED', {
        jobId,
        type: job.type,
        error: err.message,
        completedAt: job.completedAt
      });
    }
  }

  getJob(jobId) {
    return this.jobs.get(jobId) || null;
  }

  getAllJobs() {
    return Array.from(this.jobs.values()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  getRecentLogs() {
    return this.eventLogs;
  }

  getMetrics() {
    return {
      ...this.metrics,
      activeSseClients: this.sseClients.size,
      totalJobsInQueue: Array.from(this.jobs.values()).filter(j => j.status === 'PROCESSING' || j.status === 'QUEUED').length,
      uptimeSeconds: Math.floor((Date.now() - this.metrics.startTime) / 1000)
    };
  }
}

// Export singleton instance of Event Bus
const appEventBus = new AppEventBus();
module.exports = appEventBus;
