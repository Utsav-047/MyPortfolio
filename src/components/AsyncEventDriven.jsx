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
        background: 'rgba(30,41,59,0.8)',
        borderRadius: '14px',
        padding: '2rem 2.5rem',
        color: '#F8F6F1',
        marginBottom: '1.5rem',
        border: '1px solid rgba(212,185,150,0.12)',
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: sseConnected ? '#4ade80' : '#f87171',
            boxShadow: sseConnected ? '0 0 6px #4ade80' : 'none'
          }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.10em' }}>
            {sseConnected ? 'Real-Time Event Stream Active' : 'Connecting to Event Stream...'}
          </span>
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 10px 0', letterSpacing: '-0.02em', fontFamily: "'Playfair Display', Georgia, serif" }}>
          Asynchronous Processing & Event-Driven Architecture
        </h2>
        <p style={{ fontSize: '14px', color: '#94A3B8', maxWidth: '700px', lineHeight: 1.7, margin: '0 0 1.5rem 0' }}>
          Decouple client HTTP requests from heavy background execution using a non-blocking <strong style={{ color: '#F8F6F1' }}>Node.js EventEmitter Bus</strong>, instantaneous <strong style={{ color: '#F8F6F1' }}>HTTP 202 Accepted</strong> responses, and real-time <strong style={{ color: '#F8F6F1' }}>Server-Sent Events (SSE)</strong>.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {[
            { label: 'Event Bus', value: 'Node.js EventEmitter' },
            { label: 'Real-Time Protocol', value: 'Server-Sent Events (SSE)' },
            { label: 'Total Events Emitted', value: metrics?.totalEventsEmitted ?? logs.length, accent: true },
            { label: 'Active Jobs in Queue', value: jobs.filter(j => j.status === 'PROCESSING' || j.status === 'QUEUED').length, accent: true },
          ].map((item, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ color: '#64748B', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.09em' }}>{item.label}</div>
              <div style={{ fontWeight: 600, marginTop: '3px', fontSize: '14px', color: item.accent ? '#4ade80' : '#F8F6F1' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid rgba(212,185,150,0.10)', marginBottom: '1.75rem', paddingBottom: '4px', flexWrap: 'wrap' }}>
        {[
          { id: 'dispatcher', label: 'Async Job Dispatcher' },
          { id: 'stream', label: 'Live Event Stream (SSE)' },
          { id: 'architecture', label: 'Architecture Flow' },
          { id: 'metrics', label: 'Event Bus Metrics' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              background: activeTab === tab.id ? 'rgba(212,185,150,0.12)' : 'transparent',
              color: activeTab === tab.id ? '#D4B996' : '#64748B',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.15s ease',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: ASYNC JOB DISPATCHER */}
      {activeTab === 'dispatcher' && (
        <div>
          {/* Action Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {/* Card 1: Bulk Task Batch Processor */}
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(212, 185, 150, 0.12)', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(212, 185, 150, 0.12)', color: '#D4B996', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: 'rgba(212, 185, 150, 0.15)', color: '#D4B996', border: '1px solid rgba(212, 185, 150, 0.3)' }}>
                  202 ACCEPTED
                </span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 6px 0', color: '#F8F6F1' }}>
                Bulk Task Batch Processor
              </h3>
              <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                Asynchronously executes batch status reconciliation and priority recalculation across all tasks without blocking the main event loop.
              </p>
              <button
                onClick={() => handleDispatchJob('BULK_TASK_PROCESSOR', { targetStatus: 'completed', batchSize: 24 })}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  background: '#D4B996',
                  color: '#0F172A',
                  border: 'none',
                  padding: '11px 18px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                {isSubmitting ? 'Dispatching...' : 'Dispatch Batch Processor'}
              </button>
            </div>

            {/* Card 2: Automated Audit & SLA Report Generator */}
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(212, 185, 150, 0.12)', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(74, 222, 128, 0.12)', color: '#4ade80', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: 'rgba(74, 222, 128, 0.15)', color: '#4ade80', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
                  NON-BLOCKING I/O
                </span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 6px 0', color: '#F8F6F1' }}>
                Automated Audit &amp; SLA Report
              </h3>
              <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                Compiles multi-dimensional compliance reports, calculating response times, task completions, and generating a timestamped audit artifact.
              </p>
              <button
                onClick={() => handleDispatchJob('AUDIT_REPORT_GENERATOR', { scope: 'full_audit', format: 'pdf_json' })}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#F8F6F1',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '11px 18px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                {isSubmitting ? 'Dispatching...' : 'Generate Audit Report'}
              </button>
            </div>

            {/* Card 3: Team Broadcast & Alert Dispatcher */}
            <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(212, 185, 150, 0.12)', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.12)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4.9 19.1C1 15.2 1 8.8 4.9 4.9"/><path d="M7.8 16.2c-2.3-2.3-2.3-6.1 0-8.5"/><circle cx="12" cy="12" r="2"/><path d="M16.2 7.8c2.3 2.3 2.3 6.1 0 8.5"/><path d="M19.1 4.9C23 8.8 23 15.1 19.1 19"/></svg>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                  PUB-SUB EVENT
                </span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 6px 0', color: '#F8F6F1' }}>
                Team Broadcast Notification
              </h3>
              <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 1.25rem 0' }}>
                Emits decoupled broadcast events across multiple consumer handlers (Email simulation, in-app SSE banner, and dashboard feed).
              </p>
              <button
                onClick={() => handleDispatchJob('TEAM_BROADCAST_ALERTS', { priority: 'high', channel: 'all_members' })}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#F8F6F1',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  padding: '11px 18px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                {isSubmitting ? 'Dispatching...' : 'Dispatch Team Broadcast'}
              </button>
            </div>
          </div>

          {/* Instantaneous Response Banner (HTTP 202 Accepted Proof) */}
          {lastAcceptedResponse && (
            <div style={{
              background: 'rgba(74, 222, 128, 0.10)',
              border: '1px solid rgba(74, 222, 128, 0.25)',
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
                  <span style={{ fontSize: '12px', fontWeight: 800, color: '#4ade80', background: 'rgba(74, 222, 128, 0.18)', padding: '3px 10px', borderRadius: '6px', border: '1px solid rgba(74, 222, 128, 0.3)' }}>
                    HTTP 202 ACCEPTED
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#4ade80' }}>
                    Client Round-Trip Time: {lastAcceptedResponse.clientRoundtripMs || lastAcceptedResponse.queueLatencyMs} ms
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '6px' }}>
                  Job ID: <code style={{ color: '#D4B996' }}>{lastAcceptedResponse.job?.jobId}</code> — Dispatched to asynchronous background worker thread. Request thread freed immediately!
                </div>
              </div>
              <button
                onClick={() => setActiveTab('stream')}
                style={{ background: '#4ade80', color: '#0f172a', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
              >
                View Live Progress &rarr;
              </button>
            </div>
          )}

          {/* Active Job Queue Status Table */}
          <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(212, 185, 150, 0.12)', borderRadius: '16px', padding: '1.75rem', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 4px 0', color: '#F8F6F1' }}>
                  Asynchronous Job Queue &amp; Worker Monitor
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>
                  Real-time worker lifecycle updates received automatically via Server-Sent Events.
                </p>
              </div>
              <button
                onClick={refreshData}
                style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#F8F6F1', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
              >
                Refresh Queue
              </button>
            </div>

            {jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94A3B8', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px', border: '1px dashed rgba(255, 255, 255, 0.1)' }}>
                No asynchronous background jobs have been dispatched yet. Click any button above to test!
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left' }}>
                      <th style={{ padding: '12px 14px', color: '#94A3B8', fontWeight: 700 }}>Job ID</th>
                      <th style={{ padding: '12px 14px', color: '#94A3B8', fontWeight: 700 }}>Job Type</th>
                      <th style={{ padding: '12px 14px', color: '#94A3B8', fontWeight: 700 }}>Status</th>
                      <th style={{ padding: '12px 14px', color: '#94A3B8', fontWeight: 700, minWidth: '180px' }}>Progress (SSE Stream)</th>
                      <th style={{ padding: '12px 14px', color: '#94A3B8', fontWeight: 700 }}>Duration</th>
                      <th style={{ padding: '12px 14px', color: '#94A3B8', fontWeight: 700 }}>Dispatched At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobs.map((job) => {
                      const isComplete = job.status === 'COMPLETED';
                      const isProcessing = job.status === 'PROCESSING';
                      return (
                        <tr key={job.jobId} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                          <td style={{ padding: '12px 14px', fontFamily: 'monospace', fontWeight: 700, color: '#D4B996' }}>
                            {job.jobId}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 600, color: '#F8F6F1' }}>
                            {job.type}
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: isComplete ? 'rgba(74, 222, 128, 0.15)' : isProcessing ? 'rgba(96, 165, 250, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                              color: isComplete ? '#4ade80' : isProcessing ? '#60a5fa' : '#fbbf24',
                              border: isComplete ? '1px solid rgba(74, 222, 128, 0.3)' : isProcessing ? '1px solid rgba(96, 165, 250, 0.3)' : '1px solid rgba(251, 191, 36, 0.3)'
                            }}>
                              {job.status}
                            </span>
                          </td>
                          <td style={{ padding: '12px 14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{ flex: 1, background: 'rgba(255, 255, 255, 0.08)', borderRadius: '999px', height: '6px', overflow: 'hidden' }}>
                                <div style={{
                                  width: `${job.progress || (isComplete ? 100 : 0)}%`,
                                  background: isComplete ? '#4ade80' : '#D4B996',
                                  height: '100%',
                                  transition: 'width 0.3s ease'
                                }} />
                              </div>
                              <span style={{ fontSize: '11px', fontWeight: 700, minWidth: '34px', color: '#94A3B8' }}>
                                {job.progress || (isComplete ? 100 : 0)}%
                              </span>
                            </div>
                            {job.stepDescription && isProcessing && (
                              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '4px' }}>
                                ↳ {job.stepDescription}
                              </div>
                            )}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#cbd5e1', fontWeight: 600 }}>
                            {job.durationMs ? `${job.durationMs} ms` : (isProcessing ? 'Working...' : 'Queued')}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#94A3B8', fontSize: '12px' }}>
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
          <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(212, 185, 150, 0.12)', borderRadius: '16px', padding: '1.75rem', gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 1rem 0', color: '#F8F6F1' }}>
              Synchronous Blocking vs. Asynchronous Event-Driven Architecture
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ color: '#f87171', fontWeight: 700, marginBottom: '6px' }}>Synchronous Model (Blocking)</div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#fca5a5', lineHeight: 1.6 }}>
                  <li>Client sends HTTP POST request.</li>
                  <li>Server thread blocks while executing heavy report generation / batch task logic (~2,500ms).</li>
                  <li>Client browser UI freezes or displays spinner waiting for completion.</li>
                  <li>Server connection pools risk exhaustion during high concurrent load.</li>
                </ul>
              </div>

              <div style={{ background: 'rgba(74, 222, 128, 0.08)', border: '1px solid rgba(74, 222, 128, 0.25)', borderRadius: '12px', padding: '1.25rem' }}>
                <div style={{ color: '#4ade80', fontWeight: 700, marginBottom: '6px' }}>Asynchronous Event-Driven (Non-Blocking)</div>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#86efac', lineHeight: 1.6 }}>
                  <li>Client sends HTTP POST request.</li>
                  <li>Server registers job and returns <strong style={{ color: '#F8F6F1' }}>HTTP 202 Accepted</strong> immediately (~4ms).</li>
                  <li>Event Bus dispatches job to decoupled background workers (using setImmediate).</li>
                  <li>Workers emit progressive progress events streamed via Server-Sent Events (SSE).</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Pipeline Flowchart */}
          <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(212, 185, 150, 0.12)', borderRadius: '16px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 1rem 0', color: '#F8F6F1' }}>
              Event-Driven Pipeline Flow
            </h3>
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)', fontFamily: 'monospace', fontSize: '12px', lineHeight: 1.8, color: '#cbd5e1' }}>
              <div>1. <strong style={{ color: '#F8F6F1' }}>Event Producer</strong>: taskController / eventController</div>
              <div style={{ color: '#D4B996', paddingLeft: '12px' }}>└── appEventBus.emitAppEvent(eventType, payload)</div>
              <div>2. <strong style={{ color: '#F8F6F1' }}>Central Event Bus</strong>: Node.js EventEmitter</div>
              <div style={{ color: '#60a5fa', paddingLeft: '12px' }}>├── AuditLogConsumer (immutable logging)</div>
              <div style={{ color: '#60a5fa', paddingLeft: '12px' }}>├── NotificationConsumer (async alerts)</div>
              <div style={{ color: '#60a5fa', paddingLeft: '12px' }}>└── JobSupervisorConsumer (lifecycle monitoring)</div>
              <div>3. <strong style={{ color: '#F8F6F1' }}>Broadcaster</strong>: Server-Sent Events (SSE) Stream</div>
              <div style={{ color: '#4ade80', paddingLeft: '12px' }}>└── Pushes JSON frames to all connected browser clients</div>
            </div>
          </div>

          {/* Decoupled Consumers */}
          <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(212, 185, 150, 0.12)', borderRadius: '16px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: '0 0 1rem 0', color: '#F8F6F1' }}>
              Active Decoupled Consumers
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <strong style={{ fontSize: '13px', color: '#F8F6F1' }}>1. AuditLogConsumer</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                  Listens to all task mutations (create, update, delete) and maintains tamper-evident audit records.
                </p>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <strong style={{ fontSize: '13px', color: '#F8F6F1' }}>2. NotificationConsumer</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                  Decouples alerts from user requests, preventing external SMTP/SMS latency from slowing down task creation.
                </p>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <strong style={{ fontSize: '13px', color: '#F8F6F1' }}>3. JobSupervisorConsumer</strong>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94A3B8' }}>
                  Monitors long-running background tasks, tracking elapsed duration, error states, and completion milestones.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: METRICS */}
      {activeTab === 'metrics' && (
        <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(212, 185, 150, 0.12)', borderRadius: '16px', padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#F8F6F1' }}>
              Live Event Bus &amp; Worker Health Metrics
            </h3>
            <button
              onClick={refreshData}
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#F8F6F1', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
            >
              Refresh
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 700 }}>Total Events Emitted</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#D4B996', marginTop: '4px' }}>
                {metrics?.totalEventsEmitted ?? logs.length}
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 700 }}>Active SSE Subscribers</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#4ade80', marginTop: '4px' }}>
                {metrics?.activeSseClients ?? (sseConnected ? 1 : 0)}
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 700 }}>Jobs Dispatched</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>
                {metrics?.totalJobsDispatched ?? jobs.length}
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 700 }}>Jobs Completed</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#4ade80', marginTop: '4px' }}>
                {metrics?.totalJobsCompleted ?? jobs.filter(j => j.status === 'COMPLETED').length}
              </div>
            </div>

            <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 700 }}>Server Uptime</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#D4B996', marginTop: '4px' }}>
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
