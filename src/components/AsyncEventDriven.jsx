import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  dispatchAsyncJob,
  getAllJobs,
  getEventLogs,
  getEventMetrics,
  getEventsStreamUrl
} from '../services/api';

function AsyncEventDriven({ color = '#4f46e5' }) {
  const [activeTab, setActiveTab] = useState('dispatcher'); // dispatcher | stream | architecture | metrics
  const [jobs, setJobs] = useState([]);
  const [logs, setLogs] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastAcceptedResponse, setLastAcceptedResponse] = useState(null);
  const [sseConnected, setSseConnected] = useState(false);
  const [selectedLogPayload, setSelectedLogPayload] = useState(null);
  const [filterType, setFilterType] = useState('ALL');
  const [toast, setToast] = useState(null);

  const eventSourceRef = useRef(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── 1. Fetch initial jobs, logs, metrics ────────────────────
  const refreshData = useCallback(async () => {
    try {
      const [jobsRes, logsRes, metricsRes] = await Promise.all([
        getAllJobs().catch(() => ({ data: [] })),
        getEventLogs().catch(() => ({ data: [] })),
        getEventMetrics().catch(() => ({ data: null }))
      ]);

      if (jobsRes.data) setJobs(jobsRes.data);
      if (logsRes.data) setLogs(logsRes.data);
      if (metricsRes.data) setMetrics(metricsRes.data);
    } catch {
      // Backend may be offline
    }
  }, []);

  // ── 2. Real-Time Server-Sent Events (SSE) Listener ─────────
  useEffect(() => {
    refreshData();

    const streamUrl = getEventsStreamUrl();
    const es = new EventSource(streamUrl);
    eventSourceRef.current = es;

    es.onopen = () => {
      setSseConnected(true);
    };

    es.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);

        // Handle handshake
        if (parsed.type === 'SSE_CONNECTED') {
          setSseConnected(true);
          return;
        }

        // Prepend incoming event to live logs
        setLogs(prev => [parsed, ...prev.slice(0, 99)]);

        // Update jobs in real-time if job event
        if (parsed.type === 'ASYNC_JOB_QUEUED') {
          setJobs(prev => [
            {
              jobId: parsed.payload.jobId,
              type: parsed.payload.type,
              status: 'QUEUED',
              progress: 0,
              createdAt: parsed.payload.createdAt
            },
            ...prev
          ]);
        } else if (parsed.type === 'ASYNC_JOB_STARTED') {
          setJobs(prev => prev.map(j =>
            j.jobId === parsed.payload.jobId
              ? { ...j, status: 'PROCESSING', startedAt: parsed.payload.startedAt }
              : j
          ));
        } else if (parsed.type === 'ASYNC_JOB_PROGRESS') {
          setJobs(prev => prev.map(j =>
            j.jobId === parsed.payload.jobId
              ? { ...j, progress: parsed.payload.progress, status: 'PROCESSING', stepDescription: parsed.payload.stepDescription }
              : j
          ));
        } else if (parsed.type === 'ASYNC_JOB_COMPLETED') {
          setJobs(prev => prev.map(j =>
            j.jobId === parsed.payload.jobId
              ? {
                  ...j,
                  status: 'COMPLETED',
                  progress: 100,
                  durationMs: parsed.payload.durationMs,
                  result: parsed.payload.result,
                  completedAt: parsed.payload.completedAt
                }
              : j
          ));
          showToast(`Job ${parsed.payload.jobId} completed asynchronously!`, 'success');
        } else if (parsed.type === 'ASYNC_JOB_FAILED') {
          setJobs(prev => prev.map(j =>
            j.jobId === parsed.payload.jobId
              ? { ...j, status: 'FAILED', error: parsed.payload.error, completedAt: parsed.payload.completedAt }
              : j
          ));
        }

        // Also refresh metrics
        getEventMetrics().then(res => {
          if (res.data) setMetrics(res.data);
        }).catch(() => {});
      } catch (err) {
        console.error('Error parsing SSE event:', err);
      }
    };

    es.onerror = () => {
      setSseConnected(false);
    };

    return () => {
      es.close();
    };
  }, [refreshData]);

  // ── 3. Dispatch Asynchronous Background Job ────────────────
  const handleDispatchJob = async (jobType, customPayload = {}) => {
    setIsSubmitting(true);
    setLastAcceptedResponse(null);

    try {
      const res = await dispatchAsyncJob(jobType, customPayload);
      setLastAcceptedResponse(res);
      showToast(`202 Accepted! Dispatched job in ${res.clientRoundtripMs || res.queueLatencyMs}ms`, 'info');
      await refreshData();
    } catch (err) {
      showToast(`Failed to dispatch async job: ${err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterType === 'ALL') return true;
    if (filterType === 'TASKS') return log.type?.startsWith('TASK_');
    if (filterType === 'JOBS') return log.type?.startsWith('ASYNC_JOB_');
    return log.type === filterType;
  });

  const getEventBadge = (type) => {
    switch (type) {
      case 'TASK_CREATED': return { bg: '#dcfce7', color: '#166534', icon: '🌱' };
      case 'TASK_STATUS_CHANGED': return { bg: '#e0f2fe', color: '#0369a1', icon: '⚡' };
      case 'TASK_DELETED': return { bg: '#fee2e2', color: '#991b1b', icon: '🗑️' };
      case 'ASYNC_JOB_QUEUED': return { bg: '#fef3c7', color: '#92400e', icon: '📥' };
      case 'ASYNC_JOB_STARTED': return { bg: '#ede9fe', color: '#5b21b6', icon: '🚀' };
      case 'ASYNC_JOB_PROGRESS': return { bg: '#f0fdf4', color: '#15803d', icon: '⏳' };
      case 'ASYNC_JOB_COMPLETED': return { bg: '#d1fae5', color: '#065f46', icon: '✅' };
      case 'ASYNC_JOB_FAILED': return { bg: '#fef2f2', color: '#dc2626', icon: '❌' };
      default: return { bg: '#f1f5f9', color: '#475569', icon: '📡' };
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem 0', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: toast.type === 'error' ? '#ef4444' : toast.type === 'info' ? '#3b82f6' : '#10b981',
          color: '#ffffff',
          padding: '12px 22px',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          fontSize: '14px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <span>{toast.type === 'error' ? '⚠️' : toast.type === 'info' ? '⚡' : '✓'}</span>
          {toast.message}
        </div>
      )}

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #090d16 0%, #1e1b4b 50%, #312e81 100%)',
        borderRadius: '20px',
        padding: '2.5rem',
        color: '#ffffff',
        marginBottom: '2rem',
        boxShadow: '0 20px 40px rgba(15, 23, 42, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.12)', padding: '6px 14px', borderRadius: '30px', fontSize: '13px', fontWeight: 600, marginBottom: '1rem', backdropFilter: 'blur(8px)' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: sseConnected ? '#4ade80' : '#f87171',
              boxShadow: sseConnected ? '0 0 10px #4ade80' : 'none'
            }}></span>
            {sseConnected ? 'Real-Time Event Stream Active (SSE Connected)' : 'Connecting to Event Stream...'}
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 800, margin: '0 0 10px 0', letterSpacing: '-0.5px' }}>
            Asynchronous Processing &amp; Event-Driven Architecture
          </h1>
          <p style={{ fontSize: '15px', color: '#c7d2fe', maxWidth: '780px', lineHeight: 1.6, margin: 0 }}>
            Decouple client HTTP requests from heavy background execution using a non-blocking <strong>Node.js EventEmitter Bus</strong>, instantaneous <strong>HTTP 202 Accepted</strong> responses (~3-6ms), and real-time <strong>Server-Sent Events (SSE)</strong> live progress streaming.
          </p>

          {/* Quick Metrics Bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', marginTop: '1.75rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ color: '#a5b4fc', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Event Bus</div>
              <div style={{ fontWeight: 800, marginTop: '2px' }}>Node.js EventEmitter</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ color: '#a5b4fc', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Real-Time Protocol</div>
              <div style={{ fontWeight: 800, marginTop: '2px' }}>Server-Sent Events (SSE)</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ color: '#a5b4fc', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Total Events Emitted</div>
              <div style={{ fontWeight: 800, marginTop: '2px', color: '#38bdf8' }}>{metrics?.totalEventsEmitted ?? logs.length}</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.08)', padding: '10px 18px', borderRadius: '12px', fontSize: '13px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ color: '#a5b4fc', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>Active Jobs in Queue</div>
              <div style={{ fontWeight: 800, marginTop: '2px', color: '#4ade80' }}>
                {jobs.filter(j => j.status === 'PROCESSING' || j.status === 'QUEUED').length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem', paddingBottom: '4px', flexWrap: 'wrap' }}>
        {[
          { id: 'dispatcher', label: '🚀 Async Job Dispatcher', badge: 'Interactive' },
          { id: 'stream', label: '📡 Live Event Stream (SSE)', badge: `${logs.length}` },
          { id: 'architecture', label: '📐 Event-Driven Architecture Flow', badge: null },
          { id: 'metrics', label: '📊 Event Bus Metrics', badge: null }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 18px',
              fontSize: '14px',
              fontWeight: 600,
              border: 'none',
              background: activeTab === tab.id ? '#ede9fe' : 'transparent',
              color: activeTab === tab.id ? '#4f46e5' : '#64748b',
              borderRadius: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease'
            }}
          >
            {tab.label}
            {tab.badge && (
              <span style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                background: activeTab === tab.id ? '#4f46e5' : '#cbd5e1',
                color: '#ffffff',
                fontWeight: 700
              }}>
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: ASYNC JOB DISPATCHER */}
      {activeTab === 'dispatcher' && (
        <div>
          {/* Action Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {/* Card 1: Bulk Task Batch Processor */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ fontSize: '28px' }}>⚡</div>
                <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#e0e7ff', color: '#4338ca' }}>
                  202 ACCEPTED
                </span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 6px 0', color: '#1e293b' }}>
                Bulk Task Batch Processor
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                Asynchronously executes batch status reconciliation and priority recalculation across all tasks without blocking the main event loop.
              </p>
              <button
                onClick={() => handleDispatchJob('BULK_TASK_PROCESSOR', { targetStatus: 'completed', batchSize: 24 })}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  background: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  padding: '11px 18px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isSubmitting ? 'Dispatching...' : '🚀 Dispatch Batch Processor'}
              </button>
            </div>

            {/* Card 2: Automated Audit & SLA Report Generator */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ fontSize: '28px' }}>📑</div>
                <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#dcfce7', color: '#166534' }}>
                  NON-BLOCKING I/O
                </span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 6px 0', color: '#1e293b' }}>
                Automated Audit &amp; SLA Report
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                Compiles multi-dimensional compliance reports, calculating response times, task completions, and generating a timestamped audit artifact.
              </p>
              <button
                onClick={() => handleDispatchJob('AUDIT_REPORT_GENERATOR', { scope: 'full_audit', format: 'pdf_json' })}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  background: '#0284c7',
                  color: '#ffffff',
                  border: 'none',
                  padding: '11px 18px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isSubmitting ? 'Dispatching...' : '📊 Generate Audit Report'}
              </button>
            </div>

            {/* Card 3: Team Broadcast & Alert Dispatcher */}
            <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ fontSize: '28px' }}>📢</div>
                <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: '#faf5ff', color: '#7c3aed' }}>
                  PUB-SUB EVENT
                </span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 6px 0', color: '#1e293b' }}>
                Team Broadcast Notification
              </h3>
              <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                Emits decoupled broadcast events across multiple consumer handlers (Email simulation, in-app SSE banner, and dashboard feed).
              </p>
              <button
                onClick={() => handleDispatchJob('TEAM_BROADCAST_ALERTS', { priority: 'high', channel: 'all_members' })}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  background: '#7c3aed',
                  color: '#ffffff',
                  border: 'none',
                  padding: '11px 18px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isSubmitting ? 'Dispatching...' : '📢 Dispatch Team Broadcast'}
              </button>
            </div>
          </div>

          {/* Instantaneous Response Banner (HTTP 202 Accepted Proof) */}
          {lastAcceptedResponse && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '14px',
              padding: '1.25rem 1.5rem',
              marginBottom: '2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#166534', background: '#dcfce7', padding: '3px 10px', borderRadius: '6px' }}>
                    HTTP 202 ACCEPTED
                  </span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: '#15803d' }}>
                    Client Round-Trip Time: {lastAcceptedResponse.clientRoundtripMs || lastAcceptedResponse.queueLatencyMs} ms
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#166534', marginTop: '6px' }}>
                  Job ID: <code>{lastAcceptedResponse.job?.jobId}</code> — Dispatched to asynchronous background worker thread. Request thread freed immediately!
                </div>
              </div>
              <button
                onClick={() => setActiveTab('stream')}
                style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
              >
                View Live Progress &rarr;
              </button>
            </div>
          )}

          {/* Active Job Queue Status Table */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0', color: '#1e293b' }}>
                  Asynchronous Job Queue &amp; Worker Monitor
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Real-time worker lifecycle updates received automatically via Server-Sent Events.
                </p>
              </div>
              <button
                onClick={refreshData}
                style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                🔄 Refresh Queue
              </button>
            </div>

            {jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: '#64748b', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                No asynchronous background jobs have been dispatched yet. Click any button above to test!
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Job ID</th>
                      <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Job Type</th>
                      <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700, minWidth: '180px' }}>Progress (SSE Stream)</th>
                      <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Duration</th>
                      <th style={{ padding: '12px 14px', color: '#475569', fontWeight: 700 }}>Dispatched At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => {
                      const isComplete = job.status === 'COMPLETED';
                      const isProcessing = job.status === 'PROCESSING';
                      return (
                        <tr key={job.jobId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#334155' }}>
                            {job.jobId}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 600, color: '#1e293b' }}>
                            {job.type}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '3px 9px',
                              borderRadius: '6px',
                              background: isComplete ? '#dcfce7' : isProcessing ? '#e0f2fe' : '#fef3c7',
                              color: isComplete ? '#166534' : isProcessing ? '#0369a1' : '#92400e'
                            }}>
                              {job.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ flex: 1, background: '#e2e8f0', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
                                <div style={{
                                  width: `${job.progress || (isComplete ? 100 : 0)}%`,
                                  background: isComplete ? '#10b981' : '#4f46e5',
                                  height: '100%',
                                  transition: 'width 0.3s ease'
                                }} />
                              </div>
                              <span style={{ fontSize: '11px', fontWeight: 700, minWidth: '34px', color: '#475569' }}>
                                {job.progress || (isComplete ? 100 : 0)}%
                              </span>
                            </div>
                            {job.stepDescription && isProcessing && (
                              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                                ↳ {job.stepDescription}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#64748b', fontWeight: 600 }}>
                            {job.durationMs ? `${job.durationMs} ms` : (isProcessing ? 'Working...' : 'Queued')}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '12px' }}>
                            {new Date(job.createdAt).toLocaleTimeString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: LIVE EVENT STREAM (SSE) */}
      {activeTab === 'stream' && (
        <div style={{
          background: '#090d16',
          borderRadius: '16px',
          border: '1px solid #1e293b',
          padding: '1.5rem',
          color: '#e2e8f0',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          {/* Stream Bar Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '1rem', flexWrap: 'wrap', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: sseConnected ? '#10b981' : '#ef4444', boxShadow: sseConnected ? '0 0 10px #10b981' : 'none' }}></span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: sseConnected ? '#4ade80' : '#f87171' }}>
                {sseConnected ? 'LIVE EVENT STREAM (SSE /api/events/stream)' : 'DISCONNECTED'}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b' }}>({logs.length} events captured)</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                style={{ background: '#1e293b', border: '1px solid #334155', color: '#e2e8f0', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
              >
                <option value="ALL">Show All Events</option>
                <option value="TASKS">Tasks Events Only</option>
                <option value="JOBS">Async Jobs Only</option>
                <option value="TASK_CREATED">TASK_CREATED</option>
                <option value="TASK_STATUS_CHANGED">TASK_STATUS_CHANGED</option>
                <option value="TASK_DELETED">TASK_DELETED</option>
                <option value="ASYNC_JOB_PROGRESS">ASYNC_JOB_PROGRESS</option>
                <option value="ASYNC_JOB_COMPLETED">ASYNC_JOB_COMPLETED</option>
              </select>

              <button
                onClick={() => setLogs([])}
                style={{ background: '#1e293b', border: '1px solid #475569', color: '#94a3b8', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
              >
                Clear Screen
              </button>
            </div>
          </div>

          {/* Stream Output */}
          <div style={{ minHeight: '340px', maxHeight: '520px', overflowY: 'auto', fontSize: '12px', lineHeight: 1.8 }}>
            {filteredLogs.length === 0 ? (
              <div style={{ color: '#64748b', fontStyle: 'italic', padding: '2rem 0', textAlign: 'center' }}>
                No events in current filter. Create/update a task or dispatch an async job to see real-time event broadcasts!
              </div>
            ) : (
              filteredLogs.map((log) => {
                const badge = getEventBadge(log.type);
                return (
                  <div
                    key={log.id || `${log.timestamp}-${Math.random()}`}
                    onClick={() => setSelectedLogPayload(log)}
                    style={{
                      display: 'flex',
                      gap: '10px',
                      alignItems: 'baseline',
                      borderBottom: '1px solid #111827',
                      padding: '4px 0',
                      cursor: 'pointer',
                      transition: 'background 0.1s ease'
                    }}
                    title="Click to inspect event payload"
                  >
                    <span style={{ color: '#64748b', fontSize: '11px', flexShrink: 0 }}>
                      [{new Date(log.timestamp).toLocaleTimeString()}]
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '4px',
                      background: badge.bg,
                      color: badge.color,
                      flexShrink: 0
                    }}>
                      {badge.icon} {log.type}
                    </span>
                    <span style={{ color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {JSON.stringify(log.payload)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Payload Inspector Modal */}
          {selectedLogPayload && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: '#0f172a',
              borderRadius: '8px',
              border: '1px solid #334155'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ color: '#38bdf8', fontWeight: 700, fontSize: '12px' }}>
                  Inspecting Event: {selectedLogPayload.type} ({selectedLogPayload.id})
                </span>
                <button
                  onClick={() => setSelectedLogPayload(null)}
                  style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}
                >
                  ✖
                </button>
              </div>
              <pre style={{ margin: 0, color: '#4ade80', fontSize: '11px', overflowX: 'auto', maxHeight: '180px' }}>
                {JSON.stringify(selectedLogPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ARCHITECTURE */}
      {activeTab === 'architecture' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Synchronous vs Asynchronous Comparison */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem', gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 1rem 0', color: '#1e293b' }}>
              Synchronous Blocking vs. Asynchronous Event-Driven Architecture
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ color: '#991b1b', fontWeight: 800, marginBottom: '6px' }}>❌ Synchronous Model (Blocking)</div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#7f1d1d', lineHeight: 1.6 }}>
                  <li>Client sends HTTP POST request.</li>
                  <li>Server thread blocks while executing heavy report generation / batch task logic (~2,500ms).</li>
                  <li>Client browser UI freezes or displays spinner waiting for completion.</li>
                  <li>Server connection pools risk exhaustion during high concurrent load.</li>
                </ul>
              </div>

              <div style={{ background: '#f0fdf4', border: '1px solid #dcfce7', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ color: '#166534', fontWeight: 800, marginBottom: '6px' }}>✅ Asynchronous Event-Driven (Non-Blocking)</div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#14532d', lineHeight: 1.6 }}>
                  <li>Client sends HTTP POST request.</li>
                  <li>Server registers job and returns <strong>HTTP 202 Accepted</strong> immediately (~4ms).</li>
                  <li>Event Bus dispatches job to decoupled background workers (using setImmediate).</li>
                  <li>Workers emit progressive progress events streamed via Server-Sent Events (SSE).</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pipeline Flowchart */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 1rem 0', color: '#1e293b' }}>
              Event-Driven Pipeline Flow
            </h3>
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.8, color: '#334155' }}>
              <div>1. <strong>Event Producer</strong>: taskController / eventController</div>
              <div style={{ color: '#4f46e5', paddingLeft: '12px' }}>└── appEventBus.emitAppEvent(eventType, payload)</div>
              <div>2. <strong>Central Event Bus</strong>: Node.js EventEmitter</div>
              <div style={{ color: '#0369a1', paddingLeft: '12px' }}>├── AuditLogConsumer (immutable logging)</div>
              <div style={{ color: '#0369a1', paddingLeft: '12px' }}>├── NotificationConsumer (async alerts)</div>
              <div style={{ color: '#0369a1', paddingLeft: '12px' }}>└── JobSupervisorConsumer (lifecycle monitoring)</div>
              <div>3. <strong>Broadcaster</strong>: Server-Sent Events (SSE) Stream</div>
              <div style={{ color: '#16a34a', paddingLeft: '12px' }}>└── Pushes JSON frames to all connected browser clients</div>
            </div>
          </div>

          {/* Decoupled Consumers */}
          <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 1rem 0', color: '#1e293b' }}>
              Active Decoupled Consumers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>1. AuditLogConsumer</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  Listens to all task mutations (create, update, delete) and maintains tamper-evident audit records.
                </p>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>2. NotificationConsumer</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  Decouples email/push alerts from user requests, preventing external SMTP/SMS latency from slowing down task creation.
                </p>
              </div>
              <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>3. JobSupervisorConsumer</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                  Monitors long-running background tasks, tracking elapsed duration, error states, and completion milestones.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: METRICS */}
      {activeTab === 'metrics' && (
        <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#1e293b' }}>
              Live Event Bus &amp; Worker Health Metrics
            </h3>
            <button
              onClick={refreshData}
              style={{ background: '#f8fafc', border: '1px solid #cbd5e1', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
            >
              🔄 Refresh
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 700 }}>Total Events Emitted</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#4f46e5', marginTop: '4px' }}>
                {metrics?.totalEventsEmitted ?? logs.length}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 700 }}>Active SSE Subscribers</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                {metrics?.activeSseClients ?? (sseConnected ? 1 : 0)}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 700 }}>Jobs Dispatched</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                {metrics?.totalJobsDispatched ?? jobs.length}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 700 }}>Jobs Completed</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                {metrics?.totalJobsCompleted ?? jobs.filter(j => j.status === 'COMPLETED').length}
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ color: '#64748b', fontSize: '12px', fontWeight: 700 }}>Server Uptime</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#7c3aed', marginTop: '4px' }}>
                {metrics?.uptimeSeconds ? `${metrics.uptimeSeconds}s` : 'Active'}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AsyncEventDriven;
