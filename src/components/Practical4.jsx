import React, { useState, useEffect, useRef, useCallback } from 'react';

const API_BASE = 'http://localhost:5000';

function Practical4() {
  // ── State ─────────────────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | logs | architecture | maturity

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const logTerminalRef = useRef(null);

  // ── Fetch tasks ───────────────────────────────────────────
  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks`);
      const data = await res.json();
      setTasks(data.data || []);
      setServerOnline(true);
      setLoading(false);
    } catch {
      setServerOnline(false);
      setLoading(false);
    }
  }, []);

  // ── Fetch logs ────────────────────────────────────────────
  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/logs`);
      const data = await res.json();
      setLogs(data.data || []);
    } catch {
      // ignore
    }
  }, []);

  // ── Initial load & polling ────────────────────────────────
  useEffect(() => {
    fetchTasks();
    fetchLogs();
    const interval = setInterval(() => {
      fetchLogs();
    }, 2000);
    return () => clearInterval(interval);
  }, [fetchTasks, fetchLogs]);

  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [logs]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  // ── Create / Update task ──────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim()) {
      setFormError('Title is required');
      return;
    }

    try {
      if (editingTask) {
        // PUT update
        const res = await fetch(`${API_BASE}/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: formTitle, description: formDesc }),
        });
        if (!res.ok) throw new Error('Update failed');
        showSuccess(`Task #${editingTask.id} updated`);
        setEditingTask(null);
      } else {
        // POST create
        const res = await fetch(`${API_BASE}/api/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: formTitle, description: formDesc, completed: false }),
        });
        if (!res.ok) throw new Error('Create failed');
        showSuccess('Task created');
      }

      setFormTitle('');
      setFormDesc('');
      fetchTasks();
      setTimeout(fetchLogs, 300);
    } catch (err) {
      setFormError(err.message);
    }
  };

  // ── Toggle completed / pending ─────────────────────────────
  const toggleComplete = async (task) => {
    try {
      await fetch(`${API_BASE}/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      fetchTasks();
      setTimeout(fetchLogs, 300);
    } catch {
      // ignore
    }
  };

  // ── Delete task ───────────────────────────────────────────
  const deleteTask = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Delete failed');
      showSuccess(`Task #${id} deleted`);
      fetchTasks();
      setTimeout(fetchLogs, 300);
    } catch {
      // ignore
    }
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description);
    setFormError('');
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormError('');
  };

  return (
    <div className="page-view">
      <div className="p4-page-container">
        {/* Top Header Row with Status Pill */}
        <div className="p4-header-bar">
          <div className="p4-header-left">
            <h2 className="section-title" style={{ margin: 0 }}>Practical 4: Task Manager REST API</h2>
          </div>
          <div className="p4-header-right">
            <div className="p4-status-pill-badge">
              <span className={`p4-status-dot-blue ${serverOnline ? 'online' : 'offline'}`}></span>
              <span>Backend: {serverOnline ? 'Online (Port 5000)' : 'Offline'}</span>
            </div>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="p4-nav-tabs">
          {[
            { key: 'dashboard', label: '📋 Task Manager' },
            { key: 'logs', label: '📟 Live Console Logs' },
            { key: 'architecture', label: '🏗️ Middleware Architecture' },
            { key: 'maturity', label: '📊 Maturity Model' },
          ].map((tab) => (
            <button
              key={tab.key}
              className={`p4-nav-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {successMsg && (
          <div className="p4-toast">
            ✅ {successMsg}
          </div>
        )}

        {/* ================= DASHBOARD TAB ================= */}
        {activeTab === 'dashboard' && (
          <div className="p4-exact-grid">
            {/* Left Card: Create / Edit Task Form */}
            <div className="p4-exact-card p4-form-box">
              <h3 className="p4-exact-card-title">
                {editingTask ? `Edit Task #${editingTask.id}` : 'Create Task'}
              </h3>
              <form onSubmit={handleSubmit} className="p4-exact-form">
                <div className="p4-form-field">
                  <label className="p4-field-label">Task Title *</label>
                  <input
                    type="text"
                    className="p4-field-input"
                    placeholder="Task title..."
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                  />
                </div>
                <div className="p4-form-field">
                  <label className="p4-field-label">Description</label>
                  <textarea
                    className="p4-field-textarea"
                    placeholder="Task details..."
                    rows={4}
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                  />
                </div>

                {formError && <div className="p4-form-error-msg">{formError}</div>}

                <div className="p4-form-btn-group">
                  <button type="submit" className="p4-exact-submit-btn">
                    {editingTask ? 'Update Task' : '+ Create Task'}
                  </button>
                  {editingTask && (
                    <button type="button" className="p4-exact-cancel-btn" onClick={cancelEdit}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right Card: Tasks (N) List */}
            <div className="p4-exact-card p4-tasks-box">
              <h3 className="p4-exact-card-title">Tasks ({tasks.length})</h3>

              {loading ? (
                <div className="p4-loading-text">Loading tasks...</div>
              ) : tasks.length === 0 ? (
                <div className="p4-empty-box">No tasks available. Add a new task above!</div>
              ) : (
                <div className="p4-task-card-list">
                  {tasks.map((task) => (
                    <div key={task.id} className="p4-task-item-card">
                      {/* Top Row: #id on left */}
                      <div className="p4-item-id">#{task.id}</div>

                      {/* Main info & Buttons */}
                      <div className="p4-item-main-row">
                        <div className="p4-item-title">{task.title}</div>

                        <div className="p4-item-actions">
                          <button className="p4-btn-soft-edit" onClick={() => startEdit(task)}>
                            Edit
                          </button>
                          <button
                            className="p4-btn-soft-toggle"
                            onClick={() => toggleComplete(task)}
                          >
                            {task.completed ? 'Mark Pending' : 'Mark Done'}
                          </button>
                          <button className="p4-btn-soft-delete" onClick={() => deleteTask(task.id)}>
                            Delete
                          </button>
                        </div>
                      </div>

                      {/* Badge for status */}
                      <div className="p4-item-badge-row">
                        <span className={`p4-badge-pill ${task.completed ? 'completed' : 'pending'}`}>
                          {task.completed ? 'COMPLETED' : 'PENDING'}
                        </span>
                      </div>

                      {/* Description */}
                      {task.description && (
                        <p className="p4-item-description">{task.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= LIVE CONSOLE LOGS TAB ================= */}
        {activeTab === 'logs' && (
          <div className="p4-exact-card p4-terminal-wrapper">
            <div className="p4-terminal-top">
              <span className="p4-terminal-dot red"></span>
              <span className="p4-terminal-dot yellow"></span>
              <span className="p4-terminal-dot green"></span>
              <span className="p4-terminal-title-text">node server.js — CSV Log File: logs/requests.log.csv</span>
            </div>
            <div className="p4-terminal-screen" ref={logTerminalRef}>
              <div className="p4-term-line header">
                Task Management server running on http://localhost:5000
              </div>
              <div className="p4-term-line header">
                Logging requests to CSV: logs/requests.log.csv
              </div>
              {logs.map((l, i) => (
                <div key={l.id || i} className="p4-term-line">
                  [{l.timestamp}] {l.method} {l.url} {l.ip || '::1'} - HTTP {l.statusCode || 200}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="p4-term-line dim">No HTTP requests logged yet. Perform operations in the Task Manager tab.</div>
              )}
            </div>
          </div>
        )}

        {/* ================= ARCHITECTURE TAB ================= */}
        {activeTab === 'architecture' && (
          <div className="p4-exact-card">
            <h3 className="p4-exact-card-title">Middleware Pipeline Architecture</h3>
            <div className="p4-arch-flow">
              <div className="p4-flow-step client">Client (Browser / Postman)</div>
              <div className="p4-flow-arrow">↓</div>
              <div className="p4-flow-step mw">[Logging Middleware] → Writes to Console &amp; CSV</div>
              <div className="p4-flow-arrow">↓</div>
              <div className="p4-flow-step router">
                Express Router
                <br />
                <code>GET /api/tasks → getAllTasks</code>
                <br />
                <code>POST /api/tasks → createTask</code>
                <br />
                <code>PUT /api/tasks/:id → updateTask</code>
                <br />
                <code>DELETE /api/tasks/:id → deleteTask</code>
              </div>
              <div className="p4-flow-arrow">↓</div>
              <div className="p4-flow-step error">[Global Error Handler] (err, req, res, next)</div>
            </div>

            <div className="p4-kq-box" style={{ marginTop: '24px' }}>
              <h4>Key Analysis Questions</h4>
              <div className="p4-kq-q">1. Why must the error handling middleware be defined last in the middleware chain?</div>
              <div className="p4-kq-a">Express executes middleware sequentially. An error handler has 4 parameters <code>(err, req, res, next)</code>. Placing it last ensures it catches errors passed via <code>next(err)</code> from any upstream route or middleware.</div>
              
              <div className="p4-kq-q">2. What is the difference between <code>app.use()</code> and a route-specific middleware?</div>
              <div className="p4-kq-a"><code>app.use()</code> runs for all incoming requests matching a path prefix globally. Route-specific middleware is passed directly to individual routes (e.g. <code>router.put('/tasks/:id', validateTaskId, handler)</code>) and runs only for that endpoint.</div>

              <div className="p4-kq-q">3. Why is it considered bad practice to send raw error stack traces to the client?</div>
              <div className="p4-kq-a">Exposing stack traces leaks internal directory structures, package versions, and sensitive code logic to potential attackers. Generic 500 error responses protect server security.</div>
            </div>
          </div>
        )}

        {/* ================= MATURITY MODEL TAB ================= */}
        {activeTab === 'maturity' && (
          <div className="p4-exact-card">
            <h3 className="p4-exact-card-title">Richardson Maturity Model Evaluation</h3>
            <div className="p4-table-responsive">
              <table className="p4-mat-table">
                <thead>
                  <tr>
                    <th>Level</th>
                    <th>Criterion</th>
                    <th>Satisfied?</th>
                    <th>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Level 0</strong></td>
                    <td>Single URI, single verb (RPC)</td>
                    <td><span className="p4-mat-yes">✅ Surpassed</span></td>
                    <td>API uses multiple URIs and HTTP verbs.</td>
                  </tr>
                  <tr>
                    <td><strong>Level 1</strong></td>
                    <td>Resources with individual URIs</td>
                    <td><span className="p4-mat-yes">✅ Yes</span></td>
                    <td>URIs modeled per resource: <code>/api/tasks</code>, <code>/api/tasks/:id</code></td>
                  </tr>
                  <tr>
                    <td><strong>Level 2</strong></td>
                    <td>HTTP Verbs &amp; Status Codes</td>
                    <td><span className="p4-mat-yes">✅ Yes</span></td>
                    <td>GET (200), POST (201), PUT (200), DELETE (200), 400, 404, 500</td>
                  </tr>
                  <tr>
                    <td><strong>Level 3</strong></td>
                    <td>HATEOAS (Hypermedia Links)</td>
                    <td><span className="p4-mat-no">⚠️ Awareness Only</span></td>
                    <td>Demonstrated JSON link structure in MATURITY.md</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p4-kq-box" style={{ marginTop: '20px' }}>
              <h4>Level 3 HATEOAS Example JSON:</h4>
              <pre className="p4-hateoas-pre">{`{
  "id": "123",
  "title": "Task A",
  "_links": {
    "self": "/api/tasks/123",
    "delete": "/api/tasks/123"
  }
}`}</pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Practical4;
