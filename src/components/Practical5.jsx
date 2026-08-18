import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = 'http://localhost:5000';

function Practical5() {
  // ── State Management ───────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [dbStatus, setDbStatus] = useState({ status: 'checking', dbState: 'Checking...', dbName: '', host: '' });
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | validation | architecture | questions

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState('medium');
  const [formStatus, setFormStatus] = useState('pending');
  const [editingTask, setEditingTask] = useState(null);
  const [formError, setFormError] = useState(null);
  const [popup, setPopup] = useState(null);

  // Filter & Search state
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Single Task ID Lookup (Supplementary requirement: GET /tasks/:id test)
  const [lookupId, setLookupId] = useState('');
  const [lookupResult, setLookupResult] = useState(null);
  const [lookupError, setLookupError] = useState(null);
  const [isLookingUp, setIsLookingUp] = useState(false);

  // Schema Validation Test Sandbox
  const [validationTestPayload, setValidationTestPayload] = useState(
    JSON.stringify({ title: '', priority: 'super-high' }, null, 2)
  );
  const [validationTestResult, setValidationTestResult] = useState(null);

  const logTerminalRef = useRef(null);

  // ── Trigger Toast Popup ───────────────────────────────────
  const triggerPopup = (type, titleText, messageText) => {
    setPopup({ type, title: titleText, message: messageText });
    setTimeout(() => {
      setPopup(null);
    }, 4500);
  };

  // ── Fetch DB Status ────────────────────────────────────────
  const fetchDbStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/db-status`);
      const data = await res.json();
      setDbStatus(data);
      setServerOnline(true);
    } catch {
      setServerOnline(false);
      setDbStatus({ status: 'offline', dbState: 'Server Offline', dbName: 'N/A', host: 'N/A' });
    }
  }, []);

  // ── Fetch All Tasks ───────────────────────────────────────
  const fetchTasks = useCallback(async (
    filterStatus = statusFilter,
    querySearch = searchQuery
  ) => {
    try {
      let url = `${API_BASE}/api/tasks?limit=100`;
      if (filterStatus && filterStatus !== 'all') url += `&status=${encodeURIComponent(filterStatus)}`;
      if (querySearch) url += `&search=${encodeURIComponent(querySearch)}`;

      const res = await fetch(url);
      const data = await res.json();
      setTasks(data.data || []);
      setServerOnline(true);
      setLoading(false);
    } catch {
      setServerOnline(false);
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  // ── Initial Load & Polling ────────────────────────────────
  useEffect(() => {
    fetchTasks(statusFilter, searchQuery);
    fetchDbStatus();
    const interval = setInterval(() => {
      fetchDbStatus();
    }, 4000);
    return () => clearInterval(interval);
  }, [fetchTasks, fetchDbStatus]);

  // ── Filter Tab Change ─────────────────────────────────────
  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    fetchTasks(newStatus, searchQuery);
  };

  // ── Search Submit & Clear ─────────────────────────────────
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    fetchTasks(statusFilter, searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    fetchTasks(statusFilter, '');
  };

  // ── Task-Wise Download with Timestamp Handler ─────────────
  const handleDownloadTask = (task) => {
    const now = new Date();
    const timestampISO = now.toISOString();
    const timestampLocal = now.toLocaleString();
    const taskId = task._id || task.id;

    const exportData = {
      taskDetails: {
        id: taskId,
        title: task.title,
        description: task.description || '',
        status: task.status || (task.completed ? 'completed' : 'pending'),
        completed: Boolean(task.completed || task.status === 'completed'),
        priority: task.priority || 'medium',
        createdAt: task.createdAt || null,
        updatedAt: task.updatedAt || null
      },
      downloadMetadata: {
        downloadedAtISO: timestampISO,
        downloadedAtLocal: timestampLocal,
        timestamp: now.getTime()
      }
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const cleanTitle = (task.title || 'task').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    link.href = url;
    link.download = `Task_${taskId}_${cleanTitle}_${now.getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    triggerPopup(
      'info',
      '📥 Task Exported',
      `Task #${taskId} downloaded with timestamp: ${timestampLocal}`
    );
  };

  // ── Create or Update Task ─────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    const taskData = {
      title: formTitle,
      description: formDesc,
      priority: formPriority,
      status: formStatus,
      completed: formStatus === 'completed'
    };

    try {
      if (editingTask) {
        // PUT /api/tasks/:id
        const res = await fetch(`${API_BASE}/api/tasks/${editingTask._id || editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
        const data = await res.json();

        if (!res.ok) {
          setFormError(data);
          throw new Error(data.message || 'Validation failed');
        }

        triggerPopup(
          'submit',
          '🍃 MongoDB Document Updated',
          `Document #${data.data._id || data.data.id} saved to MongoDB Atlas`
        );
        setEditingTask(null);
      } else {
        // POST /api/tasks
        const res = await fetch(`${API_BASE}/api/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
        const data = await res.json();

        if (!res.ok) {
          setFormError(data);
          throw new Error(data.message || 'Validation failed');
        }

        triggerPopup(
          'submit',
          '🍃 MongoDB Document Saved',
          `New document persisted in collection: ${data.data.title}`
        );
      }

      setFormTitle('');
      setFormDesc('');
      setFormPriority('medium');
      setFormStatus('pending');
      fetchTasks(statusFilter, searchQuery);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Toggle Completion / Status Change ──────────────────────
  const changeTaskStatus = async (task, newStatus) => {
    const taskId = task._id || task.id;
    const isCompleted = newStatus === 'completed';

    try {
      const res = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, completed: isCompleted })
      });
      const data = await res.json();
      if (res.ok) {
        triggerPopup(
          'info',
          'Status Updated in MongoDB',
          `Status changed to ${newStatus.toUpperCase()}`
        );
      }
      fetchTasks(statusFilter, searchQuery);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Delete Task ───────────────────────────────────────────
  const deleteTask = async (task) => {
    const taskId = task._id || task.id;
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${taskId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Delete failed');

      triggerPopup('delete', '🚨 Document Deleted', data.message || 'Document removed from MongoDB');
      fetchTasks(statusFilter, searchQuery);
    } catch (err) {
      console.error(err);
    }
  };

  // ── GET /api/tasks/:id Endpoint Lookup Test ────────────────
  const handleLookupTask = async (e) => {
    e.preventDefault();
    setLookupResult(null);
    setLookupError(null);
    if (!lookupId.trim()) return;

    setIsLookingUp(true);
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${lookupId.trim()}`);
      const data = await res.json();
      if (!res.ok) {
        setLookupError(data);
      } else {
        setLookupResult(data);
      }
    } catch (err) {
      setLookupError({ error: 'Network Error', message: 'Failed to reach Express server' });
    } finally {
      setIsLookingUp(false);
    }
  };

  // ── Test Mongoose Schema Validation Error Sandbox ──────────
  const runValidationTest = async () => {
    setValidationTestResult(null);
    try {
      const parsedBody = JSON.parse(validationTestPayload);
      const res = await fetch(`${API_BASE}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedBody)
      });
      const data = await res.json();
      setValidationTestResult({ status: res.status, ok: res.ok, body: data });
    } catch (err) {
      setValidationTestResult({
        status: 400,
        ok: false,
        body: { error: 'Client JSON Syntax Error', message: 'Invalid JSON payload string' }
      });
    }
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description || '');
    setFormPriority(task.priority || 'medium');
    setFormStatus(task.status || (task.completed ? 'completed' : 'pending'));
    setFormError(null);
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormPriority('medium');
    setFormStatus('pending');
    setFormError(null);
  };

  // Helper for priority pill colors
  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case 'high':
        return 'p5-badge-high';
      case 'medium':
        return 'p5-badge-medium';
      case 'low':
        return 'p5-badge-low';
      default:
        return 'p5-badge-medium';
    }
  };

  return (
    <div className="page-view" style={{ width: '100%' }}>
      {/* Dynamic Embedded CSS Styles */}
      <style>{`
        .p5-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          color: #0f172a;
        }

        .p5-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #ffffff;
          padding: 20px 24px;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.04);
          flex-wrap: wrap;
          gap: 16px;
        }

        .p5-title {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .p5-status-group {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .p5-status-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          background-color: #f8fafc;
        }

        .p5-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .p5-dot.online { background-color: #10b981; box-shadow: 0 0 8px #10b981; }
        .p5-dot.offline { background-color: #ef4444; }

        .p5-nav-tabs {
          display: flex;
          gap: 8px;
          background: #f1f5f9;
          padding: 6px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow-x: auto;
        }

        .p5-tab-btn {
          flex: 1;
          padding: 10px 16px;
          border: none;
          background: none;
          font-size: 14px;
          font-weight: 600;
          color: #64748b;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .p5-tab-btn.active {
          background: #ffffff;
          color: #4f46e5;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
        }

        .p5-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        @media (max-width: 868px) {
          .p5-grid {
            grid-template-columns: 1fr;
          }
        }

        .p5-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
        }

        .p5-card-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 0;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .p5-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .p5-label {
          font-size: 13px;
          font-weight: 600;
          color: #334155;
          margin-bottom: 6px;
          display: block;
        }

        .p5-input, .p5-textarea, .p5-select {
          width: 100%;
          padding: 10px 14px;
          font-size: 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background-color: #f8fafc;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s ease;
        }

        .p5-input:focus, .p5-textarea:focus, .p5-select:focus {
          border-color: #4f46e5;
          background-color: #ffffff;
        }

        .p5-submit-btn {
          background: #4f46e5;
          color: #ffffff;
          border: none;
          padding: 12px 20px;
          font-weight: 700;
          font-size: 14px;
          border-radius: 8px;
          cursor: pointer;
          transition: background 0.2s ease;
        }

        .p5-submit-btn:hover { background: #4338ca; }

        .p5-cancel-btn {
          background: #e2e8f0;
          color: #475569;
          border: none;
          padding: 12px 20px;
          font-weight: 600;
          font-size: 14px;
          border-radius: 8px;
          cursor: pointer;
        }

        .p5-error-box {
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 12px 16px;
          color: #991b1b;
          font-size: 13px;
        }

        .p5-error-title { font-weight: 700; margin-bottom: 4px; }

        /* Task Cards */
        .p5-task-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
          max-height: 520px;
          overflow-y: auto;
        }

        .p5-task-item {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .p5-task-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.06);
        }

        .p5-task-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
        }

        .p5-id-tag {
          font-family: var(--font-mono, monospace);
          font-size: 11px;
          color: #64748b;
          background: #f1f5f9;
          padding: 2px 8px;
          border-radius: 4px;
          letter-spacing: -0.02em;
        }

        .p5-task-title {
          font-weight: 700;
          font-size: 15px;
          color: #0f172a;
        }

        .p5-badge-row {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .p5-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 9999px;
          text-transform: uppercase;
        }

        .p5-badge-completed { background: #d1fae5; color: #065f46; }
        .p5-badge-pending { background: #fef3c7; color: #92400e; }

        .p5-badge-high { background: #fee2e2; color: #991b1b; }
        .p5-badge-medium { background: #e0e7ff; color: #3730a3; }
        .p5-badge-low { background: #f3f4f6; color: #4b5563; }

        .p5-action-btn {
          font-size: 12px;
          font-weight: 600;
          padding: 5px 10px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s ease;
        }

        .p5-btn-edit { background: #e0e7ff; color: #4338ca; }
        .p5-btn-toggle { background: #ecfdf5; color: #047857; }
        .p5-btn-delete { background: #fef2f2; color: #dc2626; }

        .p5-action-btn:hover { opacity: 0.8; }

        .p5-json-pre {
          background: #0f172a;
          color: #38bdf8;
          padding: 16px;
          border-radius: 12px;
          font-family: var(--font-mono, monospace);
          font-size: 13px;
          overflow-x: auto;
          line-height: 1.5;
        }

        .p5-qa-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .p5-q-title {
          font-weight: 700;
          color: #1e1b4b;
          font-size: 15px;
          margin-bottom: 6px;
        }

        .p5-q-answer {
          color: #475569;
          font-size: 14px;
          line-height: 1.6;
          background: #f8fafc;
          padding: 12px 16px;
          border-left: 4px solid #4f46e5;
          border-radius: 0 8px 8px 0;
        }

        .p5-arch-flow {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 20px 0;
        }

        .p5-flow-step {
          width: 100%;
          max-width: 500px;
          padding: 14px 20px;
          border-radius: 12px;
          text-align: center;
          font-weight: 700;
          font-size: 14px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }

        .p5-step-express { background: #3b82f6; color: white; }
        .p5-step-mongoose { background: #8b5cf6; color: white; }
        .p5-step-mongo { background: #10b981; color: white; }
        .p5-flow-arrow { font-size: 20px; color: #94a3b8; }
      `}</style>

      <div className="p5-container">
        {/* Top Header Bar */}
        <div className="p5-header-bar">
          <h2 className="p5-title">
            <span>🍃</span> Practical 5: MongoDB &amp; Mongoose Integration
          </h2>
          <div className="p5-status-group">
            <div className="p5-status-pill">
              <span className={`p5-dot ${serverOnline ? 'online' : 'offline'}`}></span>
              <span>Express API: {serverOnline ? 'Online (Port 5000)' : 'Offline'}</span>
            </div>
            <div className="p5-status-pill" style={{ backgroundColor: dbStatus.status === 'online' ? '#ecfdf5' : '#fff1f2' }}>
              <span className={`p5-dot ${dbStatus.status === 'online' ? 'online' : 'offline'}`}></span>
              <span>Database: <strong>{dbStatus.dbState}</strong></span>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="p5-nav-tabs">
          {[
            { key: 'dashboard', label: '📋 Live Mongo CRUD' },
            { key: 'lookup', label: '🔍 GET /tasks/:id Test' },
            { key: 'validation', label: '🛡️ Schema Validation Tester' },
            { key: 'architecture', label: '🏗️ Mongoose Architecture' },
            { key: 'questions', label: '❓ Theory & Key Questions' }
          ].map((tab) => (
            <button
              key={tab.key}
              className={`p5-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Interactive Toast Popup for Notifications */}
        {popup && (
          <div
            style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              zIndex: 9999,
              minWidth: '320px',
              padding: '1rem 1.25rem',
              borderRadius: '12px',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)',
              backgroundColor: popup.type === 'delete' ? 'rgba(220, 38, 38, 0.95)' : 'rgba(16, 185, 129, 0.95)',
              color: '#ffffff',
              backdropFilter: 'blur(10px)',
              animation: 'fadeIn 0.3s ease-in-out',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '1rem' }}>{popup.title}</strong>
              <button
                onClick={() => setPopup(null)}
                style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}
              >
                &times;
              </button>
            </div>
            <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.95rem', fontWeight: '500' }}>
              {popup.message}
            </p>
          </div>
        )}

        {/* ================= TAB 1: LIVE MONGO CRUD DASHBOARD ================= */}
        {activeTab === 'dashboard' && (
          <div className="p5-grid">
            {/* Left Card: Create / Edit Form */}
            <div className="p5-card">
              <h3 className="p5-card-title">
                {editingTask ? `Edit Task #${editingTask._id || editingTask.id}` : 'Create MongoDB Task'}
              </h3>
              <form onSubmit={handleSubmit} className="p5-form">
                <div>
                  <label className="p5-label">Title (Required, Auto-Trimmed) *</label>
                  <input
                    type="text"
                    className="p5-input"
                    placeholder="e.g. Learn Mongoose Schema Design"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="p5-label">Description</label>
                  <textarea
                    className="p5-textarea"
                    rows={3}
                    placeholder="Optional description details..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                </div>

                <div>
                  <label className="p5-label">Priority (Schema Enum: low | medium | high)</label>
                  <select
                    className="p5-select"
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value)}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority (Default)</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div>
                  <label className="p5-label">Status Format (pending | in_progress | completed)</label>
                  <select
                    className="p5-select"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="in_progress">⚡ In Progress</option>
                    <option value="completed">✅ Completed</option>
                  </select>
                </div>

                {formError && (
                  <div className="p5-error-box">
                    <div className="p5-error-title">❌ {formError.error || 'Validation Error'}</div>
                    <div>{formError.message}</div>
                    {formError.details && (
                      <ul style={{ margin: '6px 0 0 16px', padding: 0 }}>
                        {formError.details.map((d, i) => (
                          <li key={i}>{d}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button type="submit" className="p5-submit-btn" style={{ flex: 1 }}>
                    {editingTask ? 'Save Changes' : '+ Save to Database'}
                  </button>
                  {editingTask && (
                    <button type="button" className="p5-cancel-btn" onClick={cancelEdit}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right Card: MongoDB Tasks Collection */}
            <div className="p5-card">
              <h3 className="p5-card-title">
                <span>Database Tasks ({tasks.length})</span>
                <button
                  onClick={() => fetchTasks(statusFilter, searchQuery)}
                  style={{
                    background: '#f1f5f9',
                    border: '1px solid #cbd5e1',
                    borderRadius: '6px',
                    padding: '4px 10px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Refresh
                </button>
              </h3>

              {/* Status Filter Tabs & Search Bar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0' }}>
                {/* Filter Tabs: All, Pending, In Progress, Completed */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {[
                    { key: 'all', label: 'All', icon: '📋' },
                    { key: 'pending', label: 'Pending', icon: '⏳' },
                    { key: 'in_progress', label: 'In Progress', icon: '⚡' },
                    { key: 'completed', label: 'Completed', icon: '✅' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => handleStatusFilterChange(tab.key)}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700',
                        border: statusFilter === tab.key ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                        background: statusFilter === tab.key ? '#e0e7ff' : '#f8fafc',
                        color: statusFilter === tab.key ? '#3730a3' : '#475569',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Search Bar with Search Button */}
                <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    className="p5-input"
                    placeholder="Search by title or description..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    style={{ flex: 1, padding: '8px 12px', fontSize: '13px' }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: '#4f46e5',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontWeight: '700',
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    🔍 Search
                  </button>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      style={{
                        background: '#f1f5f9',
                        color: '#64748b',
                        border: '1px solid #cbd5e1',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      ✖ Clear
                    </button>
                  )}
                </form>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  Connecting &amp; loading tasks from MongoDB...
                </div>
              ) : tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  No tasks found in collection matching filters.
                </div>
              ) : (
                <div className="p5-task-list">
                  {tasks.map((task) => {
                    const taskId = task._id || task.id;
                    const taskStatus = task.status || (task.completed ? 'completed' : 'pending');
                    return (
                      <div key={taskId} className="p5-task-item">
                        <div className="p5-task-header">
                          <div>
                            <div className="p5-id-tag">ID: {taskId}</div>
                            <div className="p5-task-title" style={{ marginTop: '4px' }}>
                              {task.title}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                            <select
                              value={taskStatus}
                              onChange={(e) => changeTaskStatus(task, e.target.value)}
                              style={{
                                fontSize: '12px',
                                fontWeight: '600',
                                padding: '4px 6px',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                background: '#f8fafc',
                                cursor: 'pointer'
                              }}
                            >
                              <option value="pending">⏳ Pending</option>
                              <option value="in_progress">⚡ In Progress</option>
                              <option value="completed">✅ Completed</option>
                            </select>
                            <button
                              style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                              onClick={() => handleDownloadTask(task)}
                              title="Download task with timestamp"
                            >
                              📥 Download
                            </button>
                            <button
                              className="p5-action-btn p5-btn-edit"
                              onClick={() => startEdit(task)}
                            >
                              Edit
                            </button>
                            <button
                              className="p5-action-btn p5-btn-delete"
                              onClick={() => deleteTask(task)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div className="p5-badge-row">
                          <span
                            className={`p5-badge ${
                              taskStatus === 'completed'
                                ? 'p5-badge-completed'
                                : taskStatus === 'in_progress'
                                ? 'p5-badge-medium'
                                : 'p5-badge-pending'
                            }`}
                            style={
                              taskStatus === 'in_progress'
                                ? { background: '#e0f2fe', color: '#0369a1' }
                                : {}
                            }
                          >
                            {taskStatus.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className={`p5-badge ${getPriorityBadgeClass(task.priority)}`}>
                            {task.priority || 'medium'} priority
                          </span>
                        </div>

                        {task.description && (
                          <p style={{ margin: '2px 0 0 0', fontSize: '13px', color: '#475569' }}>
                            {task.description}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: GET /tasks/:id LOOKUP TEST ================= */}
        {activeTab === 'lookup' && (
          <div className="p5-card">
            <h3 className="p5-card-title">Supplementary Problem: GET /api/tasks/:id Lookup &amp; 404 Verification</h3>
            <p style={{ fontSize: '14px', color: '#475569', marginTop: 0 }}>
              Test fetching a specific document by its MongoDB ObjectId. Enter an existing task ID or test an invalid/non-existent ID to observe structured 404 responses.
            </p>

            <form onSubmit={handleLookupTask} style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
              <input
                type="text"
                className="p5-input"
                placeholder="Enter MongoDB ObjectId (e.g., 64f1a2b3c4d5e6f7a8b9c0d1)"
                value={lookupId}
                onChange={(e) => setLookupId(e.target.value)}
                style={{ flex: 1 }}
              />
              <button type="submit" className="p5-submit-btn" disabled={isLookingUp}>
                {isLookingUp ? 'Fetching...' : 'GET /api/tasks/:id'}
              </button>
            </form>

            {/* Response Display */}
            {lookupResult && (
              <div>
                <h4 style={{ color: '#059669', marginBottom: '8px' }}>✅ 200 OK — Task Found:</h4>
                <pre className="p5-json-pre">{JSON.stringify(lookupResult, null, 2)}</pre>
              </div>
            )}

            {lookupError && (
              <div>
                <h4 style={{ color: '#dc2626', marginBottom: '8px' }}>❌ Error Response Received:</h4>
                <pre className="p5-json-pre" style={{ background: '#450a0a', color: '#fca5a5' }}>
                  {JSON.stringify(lookupError, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: SCHEMA VALIDATION TESTER ================= */}
        {activeTab === 'validation' && (
          <div className="p5-card">
            <h3 className="p5-card-title">Mongoose Schema Validation Testing Sandbox</h3>
            <p style={{ fontSize: '14px', color: '#475569', marginTop: 0 }}>
              Mongoose validates documents at the application layer before they reach MongoDB. Test sending invalid payloads (e.g., missing required <code>title</code> or invalid <code>priority</code> enum) to see structured JSON error responses.
            </p>

            <div className="p5-grid">
              <div>
                <label className="p5-label">JSON Payload to POST /api/tasks:</label>
                <textarea
                  className="p5-textarea"
                  rows={8}
                  style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '13px' }}
                  value={validationTestPayload}
                  onChange={(e) => setValidationTestPayload(e.target.value)}
                />
                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                  <button className="p5-submit-btn" onClick={runValidationTest}>
                    ▶️ Run Validation Test
                  </button>
                  <button
                    className="p5-cancel-btn"
                    onClick={() => setValidationTestPayload(JSON.stringify({ title: '', priority: 'invalid-enum' }, null, 2))}
                  >
                    Load Missing Title Payload
                  </button>
                </div>
              </div>

              <div>
                <label className="p5-label">Structured Server Response JSON:</label>
                {validationTestResult ? (
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '6px', color: validationTestResult.ok ? '#059669' : '#dc2626' }}>
                      HTTP Status Code: {validationTestResult.status}
                    </div>
                    <pre className="p5-json-pre">{JSON.stringify(validationTestResult.body, null, 2)}</pre>
                  </div>
                ) : (
                  <div style={{ background: '#f8fafc', border: '1px border #e2e8f0', borderRadius: '8px', padding: '24px', color: '#64748b', textAlign: 'center' }}>
                    Click "Run Validation Test" to view structured server response.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: ARCHITECTURE DIAGRAM ================= */}
        {activeTab === 'architecture' && (
          <div className="p5-card">
            <h3 className="p5-card-title">Mongoose ODM Architecture Flow</h3>

            <div className="p5-arch-flow">
              <div className="p5-flow-step p5-step-express">
                1. Express Application (HTTP Server)
                <br />
                <span style={{ fontWeight: 'normal', fontSize: '12px' }}>
                  Receives incoming POST / PUT JSON requests
                </span>
              </div>

              <div className="p5-flow-arrow">↓</div>

              <div className="p5-flow-step p5-step-mongoose">
                2. Mongoose ODM Layer (Task Schema)
                <br />
                <span style={{ fontWeight: 'normal', fontSize: '12px' }}>
                  - Required fields validation (title)
                  <br />
                  - Enum validation (priority: low | medium | high)
                  <br />
                  - Pre-save hook (Automatic title whitespace trimming)
                </span>
              </div>

              <div className="p5-flow-arrow">↓</div>

              <div className="p5-flow-step p5-step-mongo">
                3. MongoDB Atlas Database
                <br />
                <span style={{ fontWeight: 'normal', fontSize: '12px' }}>
                  Document persisted in <code>tasks</code> collection
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: THEORY & KEY QUESTIONS ================= */}
        {activeTab === 'questions' && (
          <div className="p5-card p5-qa-card">
            <h3 className="p5-card-title">Key Analysis Questions &amp; Practical 5 Theory</h3>

            <div>
              <div className="p5-q-title">
                1. What is the purpose of a schema in a NoSQL database like MongoDB, given that MongoDB itself is schema-less?
              </div>
              <div className="p5-q-answer">
                Although MongoDB itself accepts any JSON document, application logic requires data predictability and consistency. A Mongoose schema acts as an application-level contract that guarantees every saved document follows uniform field types, default values, and validation rules without requiring database constraints.
              </div>
            </div>

            <div>
              <div className="p5-q-title">
                2. Why is it important to define required fields and default values at the schema level rather than relying on frontend validation alone?
              </div>
              <div className="p5-q-answer">
                Frontend validation can be easily bypassed by attackers using tools like Postman, curl, or custom scripts. Defining constraints at the backend schema level provides a single source of truth that guarantees invalid or malicious requests are rejected before reaching the database.
              </div>
            </div>

            <div>
              <div className="p5-q-title">
                3. What happens internally when a document fails Mongoose validation — where is the request stopped?
              </div>
              <div className="p5-q-answer">
                Validation occurs locally in Node.js inside Mongoose memory BEFORE any network database call is made. If validation fails, Mongoose throws a <code>ValidationError</code> synchronously and stops execution before sending data over the network to MongoDB.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Practical5;
