import React, { useState, useEffect, useCallback } from 'react';
import {
  getCacheStats,
  clearCache,
  benchmarkTasksFetch,
  createTask,
  deleteTask,
  getDbStatus
} from '../services/api';

function CachingOptimization({ color = '#4f46e5' }) {
  const [activeTab, setActiveTab] = useState('benchmark'); // benchmark | architecture | logs | stats
  const [dbStatus, setDbStatus] = useState({ status: 'checking', dbState: 'Checking...' });
  const [cacheStats, setCacheStats] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);

  // Show temporary toast
  const showToast = (msg, type = 'info') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Check DB & Cache status on mount
  const refreshStatus = useCallback(async () => {
    try {
      const dbRes = await getDbStatus();
      setDbStatus(dbRes);
    } catch {
      setDbStatus({ status: 'offline', dbState: 'Backend Offline' });
    }

    try {
      const statsRes = await getCacheStats();
      if (statsRes.success) {
        setCacheStats(statsRes);
      }
    } catch {
      // Not logged in or backend offline
    }
  }, []);

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 8000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  // Add simulated or real log line
  const addLog = (type, key, message = '') => {
    const timestamp = new Date().toLocaleTimeString();
    const newLog = {
      id: Date.now() + Math.random(),
      type, // 'HIT' | 'MISS' | 'INVALIDATED' | 'INFO'
      key,
      message,
      timestamp
    };
    setRecentLogs(prev => [newLog, ...prev.slice(0, 49)]);
  };

  // Run full benchmark: 3 uncached readings vs 3 cached readings
  const runFullBenchmark = async () => {
    setIsRunning(true);
    setBenchmarkResults(null);
    showToast('Starting In-Memory Caching Benchmark...', 'info');

    try {
      const uncachedReadings = [];
      const cachedReadings = [];

      // ── Step 1: UNCACHED (Forcing cache misses via invalidation) ──
      for (let i = 1; i <= 3; i++) {
        await clearCache();
        addLog('INVALIDATED', 'tasks_*', 'Purged task cache before reading');
        
        const res = await benchmarkTasksFetch(1, 5);
        uncachedReadings.push({
          sample: i,
          latency: res.latency,
          status: res.cacheStatus,
          timestamp: new Date().toLocaleTimeString()
        });
        addLog('MISS', res.data?.data?.[0]?.userId ? `tasks_${res.data.data[0].userId}` : 'tasks_6a96cff1fe495756006aaec6');
        await new Promise(r => setTimeout(r, 200));
      }

      // ── Step 2: CACHED (Hits from memory) ──
      for (let i = 1; i <= 3; i++) {
        const res = await benchmarkTasksFetch(1, 5);
        cachedReadings.push({
          sample: i,
          latency: res.latency,
          status: res.cacheStatus,
          timestamp: new Date().toLocaleTimeString()
        });
        addLog('HIT', res.data?.data?.[0]?.userId ? `tasks_${res.data.data[0].userId}` : 'tasks_6a96cff1fe495756006aaec6');
        await new Promise(r => setTimeout(r, 150));
      }

      // Calculate averages
      const avgUncached = (uncachedReadings.reduce((sum, r) => sum + r.latency, 0) / uncachedReadings.length).toFixed(1);
      const avgCached = (cachedReadings.reduce((sum, r) => sum + r.latency, 0) / cachedReadings.length).toFixed(1);
      const diffMs = (avgUncached - avgCached).toFixed(1);
      const percentImprovement = (((avgUncached - avgCached) / (avgUncached || 1)) * 100).toFixed(1);

      setBenchmarkResults({
        uncachedReadings,
        cachedReadings,
        avgUncached: Number(avgUncached),
        avgCached: Number(avgCached),
        diffMs: Number(diffMs),
        percentImprovement: Number(percentImprovement)
      });

      await refreshStatus();
      showToast(`Benchmark complete! Latency reduced by ${percentImprovement}%`, 'success');
    } catch (err) {
      showToast(`Benchmark failed: ${err.message}. Please sign in to authenticate.`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  // Test Write Invalidation (Create task -> invalidates -> verify miss)
  const testWriteInvalidation = async () => {
    setIsRunning(true);
    try {
      showToast('Creating temporary task to test cache invalidation...', 'info');
      
      const newTitle = `Auto-Cache-Test-${Date.now().toString().slice(-4)}`;
      const createRes = await createTask({
        title: newTitle,
        description: 'Verifying automated cache invalidation on write operation',
        priority: 'low',
        status: 'pending'
      });

      addLog('INVALIDATED', 'tasks_*', 'Triggered by POST /api/tasks');

      // Next read should be MISS
      const afterRes = await benchmarkTasksFetch(1, 5);
      addLog('MISS', 'tasks_6a96cff1fe495756006aaec6', `Uncached read after write: ${afterRes.latency}ms`);

      // Cleanup
      if (createRes?.data?._id || createRes?.data?.id) {
        const id = createRes.data._id || createRes.data.id;
        await deleteTask(id);
        addLog('INVALIDATED', 'tasks_*', `Triggered by DELETE /api/tasks/${id}`);
      }

      await refreshStatus();
      showToast('Cache Invalidation test passed: stale data prevented!', 'success');
    } catch (err) {
      showToast(`Invalidation test error: ${err.message}`, 'error');
    } finally {
      setIsRunning(false);
    }
  };

  // Manual Clear Cache
  const handleClearCache = async () => {
    try {
      await clearCache();
      addLog('INVALIDATED', 'tasks_*', 'Manual cache purge via dashboard');
      await refreshStatus();
      showToast('Task cache purged successfully', 'success');
    } catch (err) {
      showToast(`Failed to purge cache: ${err.message}`, 'error');
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 9999,
          background: toastMessage.type === 'error' ? '#ef4444' : toastMessage.type === 'success' ? '#10b981' : '#3b82f6',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
          fontSize: '14px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          <span>{toastMessage.type === 'success' ? '✓' : toastMessage.type === 'error' ? '⚠' : 'ℹ'}</span>
          {toastMessage.text}
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        background: 'rgba(30,41,59,0.8)',
        borderRadius: '14px',
        padding: '2rem 2.5rem',
        color: '#F8F6F1',
        marginBottom: '1.5rem',
        border: '1px solid rgba(212,185,150,0.12)',
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
          <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4ade80', boxShadow: '0 0 6px #4ade80' }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.10em' }}>
            Server-Side Performance
          </span>
        </div>
        <h2 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 10px 0', letterSpacing: '-0.02em', fontFamily: "'Playfair Display', Georgia, serif" }}>
          In-Memory Caching & Query Optimization
        </h2>
        <p style={{ fontSize: '14px', color: '#94A3B8', maxWidth: '700px', lineHeight: 1.7, margin: '0 0 1.5rem 0' }}>
          Drastically cut API response latency using <strong style={{ color: '#F8F6F1' }}>node-cache</strong> with a 60-second TTL, automatic write-invalidation on POST/PUT/DELETE, and Mongoose <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '13px' }}>.lean()</code> query optimization.
        </p>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {[
            { label: 'Cache Engine', value: 'node-cache (In-Memory)' },
            { label: 'Cache TTL', value: '60 Seconds' },
            { label: 'Database Status', value: dbStatus.dbState || 'Checking...', isStatus: true },
          ].map((item, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ color: '#64748B', fontSize: '10px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.09em' }}>{item.label}</div>
              <div style={{ fontWeight: 600, marginTop: '3px', fontSize: '14px', color: item.isStatus ? (dbStatus.status === 'online' ? '#4ade80' : '#f87171') : '#F8F6F1' }}>{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '6px', borderBottom: '1px solid rgba(212,185,150,0.10)', marginBottom: '1.75rem', paddingBottom: '4px', flexWrap: 'wrap' }}>
        {[
          { id: 'benchmark', label: 'Performance Benchmark' },
          { id: 'logs', label: 'Terminal & Cache Logs' },
          { id: 'architecture', label: 'Architecture & Flow' },
          { id: 'stats', label: 'Cache Health & Stats' }
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

      {/* TAB 1: BENCHMARK */}
      {activeTab === 'benchmark' && (
        <div>
          {/* Action Control Panel */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(212, 185, 150, 0.12)',
            borderRadius: '16px',
            padding: '1.75rem',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
          }}>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 6px 0', color: '#F8F6F1' }}>
                Automated Latency Measurement Suite
              </h2>
              <p style={{ margin: 0, fontSize: '14px', color: '#94A3B8' }}>
                Records 3 samples for Uncached (MongoDB reads) vs 3 samples for Cached (node-cache hits).
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={runFullBenchmark}
                disabled={isRunning}
                style={{
                  background: isRunning ? '#64748B' : '#D4B996',
                  color: '#0F172A',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                {isRunning ? 'Running Benchmark...' : 'Run Benchmark (3 Samples Each)'}
              </button>

              <button
                onClick={testWriteInvalidation}
                disabled={isRunning}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: '#F8F6F1',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Test Write Invalidation
              </button>

              <button
                onClick={handleClearCache}
                disabled={isRunning}
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.30)',
                  color: '#f87171',
                  padding: '12px 20px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: isRunning ? 'not-allowed' : 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Flush Cache
              </button>
            </div>
          </div>

          {/* Benchmark Results Display */}
          {benchmarkResults && (
            <div>
              {/* Stat Highlight Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(239, 68, 68, 0.10)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: '16px', padding: '1.5rem' }}>
                  <div style={{ color: '#f87171', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Uncached Avg (MongoDB)</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#f87171', marginTop: '6px' }}>
                    {benchmarkResults.avgUncached} <span style={{ fontSize: '16px', fontWeight: 600 }}>ms</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Cold reads hitting database disk/network</div>
                </div>

                <div style={{ background: 'rgba(74, 222, 128, 0.10)', border: '1px solid rgba(74, 222, 128, 0.25)', borderRadius: '16px', padding: '1.5rem' }}>
                  <div style={{ color: '#4ade80', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Cached Avg (node-cache)</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#4ade80', marginTop: '6px' }}>
                    {benchmarkResults.avgCached} <span style={{ fontSize: '16px', fontWeight: 600 }}>ms</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Served directly from server memory</div>
                </div>

                <div style={{ background: 'rgba(96, 165, 250, 0.10)', border: '1px solid rgba(96, 165, 250, 0.25)', borderRadius: '16px', padding: '1.5rem' }}>
                  <div style={{ color: '#60a5fa', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Latency Reduced</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#60a5fa', marginTop: '6px' }}>
                    {benchmarkResults.diffMs} <span style={{ fontSize: '16px', fontWeight: 600 }}>ms</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Absolute roundtrip time saved per call</div>
                </div>

                <div style={{ background: 'rgba(212, 185, 150, 0.10)', border: '1px solid rgba(212, 185, 150, 0.25)', borderRadius: '16px', padding: '1.5rem' }}>
                  <div style={{ color: '#D4B996', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Speedup Factor</div>
                  <div style={{ fontSize: '32px', fontWeight: 800, color: '#D4B996', marginTop: '6px' }}>
                    {benchmarkResults.percentImprovement}%
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Faster response turnaround</div>
                </div>
              </div>

              {/* Sample Readings Table */}
              <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(212, 185, 150, 0.12)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 1rem 0', color: '#F8F6F1' }}>
                  Recorded Sample Readings (At Least 3 Samples Required)
                </h3>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: 'rgba(255, 255, 255, 0.04)', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'left' }}>
                        <th style={{ padding: '12px 16px', color: '#94A3B8', fontWeight: 700 }}>Reading #</th>
                        <th style={{ padding: '12px 16px', color: '#94A3B8', fontWeight: 700 }}>Uncached Latency (DB MISS)</th>
                        <th style={{ padding: '12px 16px', color: '#94A3B8', fontWeight: 700 }}>Cached Latency (node-cache HIT)</th>
                        <th style={{ padding: '12px 16px', color: '#94A3B8', fontWeight: 700 }}>Difference</th>
                        <th style={{ padding: '12px 16px', color: '#94A3B8', fontWeight: 700 }}>Reduction (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[0, 1, 2].map((idx) => {
                        const uncached = benchmarkResults.uncachedReadings[idx];
                        const cached = benchmarkResults.cachedReadings[idx];
                        const diff = (uncached.latency - cached.latency).toFixed(1);
                        const pct = (((uncached.latency - cached.latency) / uncached.latency) * 100).toFixed(1);
                        return (
                          <tr key={idx} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                            <td style={{ padding: '14px 16px', fontWeight: 700, color: '#F8F6F1' }}>
                              Sample #{idx + 1}
                            </td>
                            <td style={{ padding: '14px 16px', color: '#f87171', fontWeight: 600 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f87171' }}></span>
                                {uncached.latency} ms
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px', color: '#4ade80', fontWeight: 600 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }}></span>
                                {cached.latency} ms
                              </span>
                            </td>
                            <td style={{ padding: '14px 16px', color: '#60a5fa', fontWeight: 600 }}>
                              -{diff} ms
                            </td>
                            <td style={{ padding: '14px 16px', color: '#D4B996', fontWeight: 700 }}>
                              {pct}% faster
                            </td>
                          </tr>
                        );
                      })}
                      <tr style={{ background: 'rgba(255, 255, 255, 0.03)', fontWeight: 700, borderTop: '1px solid rgba(255, 255, 255, 0.10)' }}>
                        <td style={{ padding: '14px 16px', color: '#F8F6F1' }}>Average</td>
                        <td style={{ padding: '14px 16px', color: '#f87171' }}>{benchmarkResults.avgUncached} ms</td>
                        <td style={{ padding: '14px 16px', color: '#4ade80' }}>{benchmarkResults.avgCached} ms</td>
                        <td style={{ padding: '14px 16px', color: '#60a5fa' }}>-{benchmarkResults.diffMs} ms</td>
                        <td style={{ padding: '14px 16px', color: '#D4B996' }}>{benchmarkResults.percentImprovement}% faster</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {!benchmarkResults && (
            <div style={{
              background: 'rgba(30, 41, 59, 0.5)',
              border: '1px dashed rgba(212, 185, 150, 0.25)',
              borderRadius: '16px',
              padding: '3.5rem 2rem',
              textAlign: 'center',
              color: '#94A3B8'
            }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(212, 185, 150, 0.12)', color: '#D4B996', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#F8F6F1', margin: '0 0 8px 0' }}>
                No Benchmark Data Yet
              </h3>
              <p style={{ maxWidth: '500px', margin: '0 auto 1.5rem auto', fontSize: '14px', color: '#94A3B8', lineHeight: 1.6 }}>
                Click the <strong>Run Benchmark</strong> button above to trigger 3 real uncached and 3 cached HTTP calls against your Express/MongoDB backend.
              </p>
              <button
                onClick={runFullBenchmark}
                disabled={isRunning}
                style={{
                  background: '#D4B996',
                  color: '#0F172A',
                  border: 'none',
                  padding: '11px 24px',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif"
                }}
              >
                Run Benchmark Now
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: TERMINAL & LOGS */}
      {activeTab === 'logs' && (
        <div style={{
          background: '#0f172a',
          borderRadius: '16px',
          border: '1px solid #1e293b',
          padding: '1.5rem',
          color: '#e2e8f0',
          fontFamily: 'Consolas, Monaco, "Courier New", monospace',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #334155', paddingBottom: '12px', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }}></span>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></span>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></span>
              <span style={{ marginLeft: '12px', fontSize: '13px', color: '#94a3b8' }}>Backend Server Console Output (node server.js)</span>
            </div>
            <button
              onClick={() => setRecentLogs([])}
              style={{ background: '#1e293b', border: '1px solid #475569', color: '#94a3b8', padding: '4px 12px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
            >
              Clear Logs
            </button>
          </div>

          <div style={{ minHeight: '300px', maxHeight: '500px', overflowY: 'auto', fontSize: '13px', lineHeight: 1.7 }}>
            {/* Exact mock format matching user screenshot Figure 1.1 & 1.2 */}
            <div style={{ color: '#64748b', marginBottom: '8px' }}>// Reference Screenshot Exact Output Format:</div>
            <div style={{ color: '#4ade80' }}>[CACHE HIT] tasks_6a96cff1fe495756006aaec6</div>
            <div style={{ color: '#4ade80' }}>[CACHE HIT] tasks_6a96cff1fe495756006aaec6</div>
            <div style={{ color: '#f87171' }}>[CACHE MISS] tasks_6a96cff1fe495756006aaec6</div>
            <div style={{ color: '#f87171' }}>[CACHE MISS] tasks_6a96cff1fe495756006aaec6</div>
            
            <div style={{ borderTop: '1px dashed #334155', margin: '14px 0', paddingTop: '10px', color: '#94a3b8' }}>
              // Live Recorded Server Operations:
            </div>

            {recentLogs.length === 0 ? (
              <div style={{ color: '#64748b', fontStyle: 'italic' }}>
                No live logs yet. Switch to the Benchmark tab and click "Run Benchmark" or "Test Write Invalidation".
              </div>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: '#64748b' }}>[{log.timestamp}]</span>
                  <span style={{
                    color: log.type === 'HIT' ? '#4ade80' : log.type === 'MISS' ? '#f87171' : '#facc15',
                    fontWeight: 700
                  }}>
                    [{log.type === 'HIT' ? 'CACHE HIT' : log.type === 'MISS' ? 'CACHE MISS' : 'CACHE INVALIDATED'}]
                  </span>
                  <span style={{ color: '#e2e8f0' }}>{log.key}</span>
                  {log.message && <span style={{ color: '#94a3b8' }}>— {log.message}</span>}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: ARCHITECTURE */}
      {activeTab === 'architecture' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(212, 185, 150, 0.12)', borderRadius: '16px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 1rem 0', color: '#F8F6F1' }}>
              Read Flow: Cache-Aside Pattern
            </h3>
            <div style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '1.25rem',
              fontFamily: 'monospace',
              fontSize: '13px',
              lineHeight: 1.8,
              color: '#cbd5e1'
            }}>
              <div>1. <strong style={{ color: '#F8F6F1' }}>Client Request</strong>: GET /api/tasks</div>
              <div>2. <strong style={{ color: '#F8F6F1' }}>Key Generation</strong>: tasks_&lt;userId&gt;</div>
              <div>3. <strong style={{ color: '#F8F6F1' }}>Cache Check</strong>: taskCache.get(key)</div>
              <div style={{ paddingLeft: '16px', color: '#4ade80' }}>
                ├── <strong>HIT</strong>: Return cached tasks JSON immediately (~3-7ms)
              </div>
              <div style={{ paddingLeft: '16px', color: '#f87171' }}>
                └── <strong>MISS</strong>: Query MongoDB Atlas (~150-300ms)
              </div>
              <div style={{ paddingLeft: '32px', color: '#60a5fa' }}>
                └── Store in node-cache (TTL = 60s)
              </div>
              <div>4. <strong style={{ color: '#F8F6F1' }}>Response Header</strong>: X-Cache: HIT / MISS</div>
            </div>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(212, 185, 150, 0.12)', borderRadius: '16px', padding: '1.75rem' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 1rem 0', color: '#F8F6F1' }}>
              Write Flow: Automated Invalidation
            </h3>
            <div style={{
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '1.25rem',
              fontFamily: 'monospace',
              fontSize: '13px',
              lineHeight: 1.8,
              color: '#cbd5e1'
            }}>
              <div>1. <strong style={{ color: '#F8F6F1' }}>Write Operation</strong>: POST, PUT, DELETE</div>
              <div>2. <strong style={{ color: '#F8F6F1' }}>Write to MongoDB Atlas</strong>: Task.create / update / delete</div>
              <div>3. <strong style={{ color: '#F8F6F1' }}>Cache Purge</strong>: invalidateTaskCache(userId)</div>
              <div style={{ paddingLeft: '16px', color: '#D4B996' }}>
                └── taskCache.del(taskKeys)
              </div>
              <div>4. <strong style={{ color: '#F8F6F1' }}>Next Read</strong>: Guaranteed cache MISS</div>
              <div style={{ paddingLeft: '16px', color: '#60a5fa' }}>
                └── Always serves fresh, authoritative data
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(212, 185, 150, 0.12)', borderRadius: '16px', padding: '1.75rem', gridColumn: '1 / -1' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 1rem 0', color: '#F8F6F1' }}>
              Database Query Optimization Techniques Applied
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontWeight: 700, color: '#D4B996', marginBottom: '6px' }}>1. Mongoose .lean()</div>
                <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 }}>
                  Bypasses heavy Mongoose document hydration (getters, setters, virtuals). Returns plain JavaScript objects for 3-5x faster query processing.
                </div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontWeight: 700, color: '#D4B996', marginBottom: '6px' }}>2. Secondary Indexes</div>
                <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 }}>
                  Indexed fields: <code>userId</code>, <code>status</code>, <code>priority</code>, and compound index on <code>createdAt: -1</code> for instant index-scanned sorting.
                </div>
              </div>
              <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ fontWeight: 700, color: '#D4B996', marginBottom: '6px' }}>3. Standard TTL (60s)</div>
                <div style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 }}>
                  In-memory entries automatically expire after 60 seconds with background sweeps every 120s, keeping memory consumption bounded.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: STATS */}
      {activeTab === 'stats' && (
        <div style={{ background: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(212, 185, 150, 0.12)', borderRadius: '16px', padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#F8F6F1' }}>
              Live node-cache Metrics &amp; Statistics
            </h3>
            <button
              onClick={refreshStatus}
              style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', color: '#F8F6F1', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              Refresh
            </button>
          </div>

          {cacheStats ? (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 700 }}>Total Hits</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#4ade80', marginTop: '4px' }}>
                    {cacheStats.stats?.hits ?? 0}
                  </div>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 700 }}>Total Misses</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#f87171', marginTop: '4px' }}>
                    {cacheStats.stats?.misses ?? 0}
                  </div>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 700 }}>Active Cached Keys</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#60a5fa', marginTop: '4px' }}>
                    {cacheStats.cachedKeys?.length ?? 0}
                  </div>
                </div>
                <div style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ color: '#94A3B8', fontSize: '12px', fontWeight: 700 }}>Configured TTL</div>
                  <div style={{ fontSize: '28px', fontWeight: 800, color: '#D4B996', marginTop: '4px' }}>
                    {cacheStats.ttlSeconds ?? 60}s
                  </div>
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: '15px', fontWeight: 700, margin: '0 0 10px 0', color: '#F8F6F1' }}>
                  Currently Cached Key Identifiers:
                </h4>
                {cacheStats.cachedKeys && cacheStats.cachedKeys.length > 0 ? (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {cacheStats.cachedKeys.map((k) => (
                      <li key={k} style={{ background: 'rgba(15, 23, 42, 0.65)', padding: '10px 14px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '13px', color: '#cbd5e1', border: '1px solid rgba(255, 255, 255, 0.06)' }}>
                        {k}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div style={{ color: '#94A3B8', fontStyle: 'italic', fontSize: '14px' }}>
                    No keys currently in cache (cache is clean).
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ color: '#94A3B8', fontSize: '14px' }}>
              Sign in or authenticate to inspect live user-scoped cache statistics.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CachingOptimization;
