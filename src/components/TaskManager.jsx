import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getDbStatus
} from '../services/api';

const API_BASE = 'http://localhost:5000';

function TaskManager() {
  // ── State Management ───────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
  const [dbStatus, setDbStatus] = useState({ status: 'checking', dbState: 'Checking...' });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | console | architecture | maturity

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState('medium');
  const [editingTask, setEditingTask] = useState(null);
  const [formError, setFormError] = useState(null);

  // Modal state for deleting tasks
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification stack
  const [toasts, setToasts] = useState([]);

  const logTerminalRef = useRef(null);

  // ── Helper: Add Toast Notification ────────────────────────
  const addToast = (type, title, message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // ── Fetch DB Status ────────────────────────────────────────
  const checkBackendStatus = useCallback(async () => {
    try {
      const res = await getDbStatus();
      setDbStatus(res);
      setServerOnline(true);
    } catch {
      setServerOnline(false);
      setDbStatus({ status: 'offline', dbState: 'Backend Offline' });
    }
  }, []);

  // ── Fetch Live Console Logs ────────────────────────────────
  const fetchLogs = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/logs`);
      const data = await res.json();
      setLogs(data.data || []);
    } catch {
      // ignore
    }
  }, []);

  // ── Fetch Paginated Tasks (5 items per page) ───────────────
  const fetchPaginatedTasks = useCallback(async (pageToFetch = pagination.page) => {
    setLoading(true);
    try {
      const res = await getTasks(pageToFetch, 5);
      setTasks(res.data || []);
      setPagination({
        page: res.currentPage || pageToFetch,
        limit: res.limit || 5,
        total: res.total || 0,
        totalPages: res.totalPages || 1
      });
      setServerOnline(true);
    } catch (err) {
      setServerOnline(false);
      addToast('error', 'Network Error', 'Failed to connect to backend server at http://localhost:5000');
    } finally {
      setLoading(false);
    }
  }, [pagination.page]);

  useEffect(() => {
    fetchPaginatedTasks(1);
    checkBackendStatus();
    fetchLogs();
    const interval = setInterval(() => {
      checkBackendStatus();
      fetchLogs();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [logs]);

  // ── Optimistic Task Creation & Editing ─────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim()) {
      setFormError({ error: 'Validation Error', message: 'Title is required' });
      return;
    }

    const payload = {
      title: formTitle.trim(),
      description: formDesc.trim(),
      priority: formPriority,
      completed: editingTask ? editingTask.completed : false
    };

    if (editingTask) {
      const targetId = editingTask._id || editingTask.id;
      try {
        await updateTask(targetId, payload);
        addToast('success', 'Task Updated', `Task #${targetId} updated successfully`);
        setEditingTask(null);
        setFormTitle('');
        setFormDesc('');
        setFormPriority('medium');
        fetchPaginatedTasks(pagination.page);
      } catch (err) {
        setFormError(err.raw || { error: err.message });
        addToast('error', 'Update Failed', err.message);
      }
    } else {
      // Optimistic UI Update for Task Creation
      const tempId = `optimistic-${Date.now()}`;
      const optimisticTask = {
        _id: tempId,
        id: tempId,
        title: payload.title,
        description: payload.description,
        priority: payload.priority,
        completed: false,
        createdAt: new Date().toISOString(),
        isOptimistic: true
      };

      setTasks(prev => [optimisticTask, ...prev]);
      setFormTitle('');
      setFormDesc('');
      setFormPriority('medium');
      addToast('info', 'Optimistic Update', 'Task added to UI! Syncing with database...');

      try {
        const res = await createTask(payload);
        addToast('success', 'Database Synchronized', `Task saved to MongoDB with ID ${res.data._id || res.data.id}`);
        fetchPaginatedTasks(1);
      } catch (err) {
        setTasks(prev => prev.filter(t => (t._id || t.id) !== tempId));
        setFormError(err.raw || { error: err.message });
        addToast('error', 'Sync Failed (Rolled back)', err.message);
      }
    }
  };

  // ── Optimistic Toggle Completion Status ───────────────────
  const handleToggleComplete = async (task) => {
    const taskId = task._id || task.id;
    const oldStatus = task.completed;
    const newStatus = !oldStatus;

    setTasks(prev => prev.map(t => (t._id || t.id) === taskId ? { ...t, completed: newStatus } : t));

    try {
      await updateTask(taskId, { completed: newStatus });
      addToast('success', 'Status Updated', `Task status changed to ${newStatus ? 'COMPLETED' : 'PENDING'}`);
    } catch (err) {
      setTasks(prev => prev.map(t => (t._id || t.id) === taskId ? { ...t, completed: oldStatus } : t));
      addToast('error', 'Toggle Failed', 'Rolled back status change');
    }
  };

  // ── Delete Confirmation Handler ───────────────────────────
  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    const taskId = taskToDelete._id || taskToDelete.id;
    setIsDeleting(true);

    try {
      await deleteTask(taskId);
      addToast('delete', 'Task Deleted', `Task #${taskId} permanently removed from database`);
      setTaskToDelete(null);
      fetchPaginatedTasks(pagination.page);
    } catch (err) {
      addToast('error', 'Delete Failed', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const startEdit = (task) => {
    setEditingTask(task);
    setFormTitle(task.title);
    setFormDesc(task.description || '');
    setFormPriority(task.priority || 'medium');
    setFormError(null);
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setFormTitle('');
    setFormDesc('');
    setFormPriority('medium');
    setFormError(null);
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return { bg: '#fee2e2', color: '#991b1b' };
      case 'medium': return { bg: '#e0e7ff', color: '#3730a3' };
      case 'low': return { bg: '#f3f4f6', color: '#4b5563' };
      default: return { bg: '#e0e7ff', color: '#3730a3' };
    }
  };

  return (
    <div className="page-view" style={{ width: '100%' }}>
      {/* Embedded Dynamic CSS */}
      <style>{`
        .tm-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          color: #0f172a;
        }

        .tm-header-bar {
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

        .tm-title {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .tm-status-pill {
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

        .tm-dot { width: 8px; height: 8px; border-radius: 50%; }
        .tm-dot.online { background-color: #10b981; box-shadow: 0 0 8px #10b981; }
        .tm-dot.offline { background-color: #ef4444; }

        .tm-nav-tabs {
          display: flex;
          gap: 8px;
          background: #f1f5f9;
          padding: 6px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          overflow-x: auto;
        }

        .tm-tab-btn {
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

        .tm-tab-btn.active {
          background: #ffffff;
          color: #4f46e5;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
        }

        .tm-grid {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 24px;
        }

        @media (max-width: 900px) {
          .tm-grid { grid-template-columns: 1fr; }
        }

        .tm-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
        }

        .tm-card-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 0;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .tm-form { display: flex; flex-direction: column; gap: 14px; }

        .tm-label { font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 4px; display: block; }

        .tm-input, .tm-textarea, .tm-select {
          width: 100%;
          padding: 10px 14px;
          font-size: 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background-color: #f8fafc;
          color: #0f172a;
          outline: none;
        }

        .tm-submit-btn {
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

        .tm-submit-btn:hover { background: #4338ca; }

        .tm-cancel-btn {
          background: #e2e8f0;
          color: #475569;
          border: none;
          padding: 12px 20px;
          font-weight: 600;
          font-size: 14px;
          border-radius: 8px;
          cursor: pointer;
        }

        /* Task Cards & Pagination */
        .tm-task-item {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .tm-task-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 12px -2px rgba(0, 0, 0, 0.05);
        }

        .tm-task-item.optimistic {
          border: 2px dashed #6366f1;
          background: #f5f3ff;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse { 0% { opacity: 0.8; } 50% { opacity: 1; } 100% { opacity: 0.8; } }

        .tm-pagination-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          margin-top: 8px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .tm-page-btn {
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          border-radius: 6px;
          cursor: pointer;
        }

        .tm-page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .tm-page-btn.active {
          background: #4f46e5;
          color: #ffffff;
          border-color: #4f46e5;
        }

        /* Toast Container */
        .tm-toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 380px;
        }

        .tm-toast {
          padding: 14px 18px;
          border-radius: 12px;
          color: #ffffff;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          display: flex;
          justify-content: space-between;
          align-items: center;
          animation: slideIn 0.3s ease-out forwards;
        }

        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

        .tm-toast-success { background: #10b981; }
        .tm-toast-info { background: #3b82f6; }
        .tm-toast-error { background: #ef4444; }
        .tm-toast-delete { background: #dc2626; }

        /* Modal Overlay */
        .tm-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(4px);
          z-index: 10000;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .tm-modal-box {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        /* Terminal Logs */
        .tm-terminal {
          background: #0f172a;
          border-radius: 12px;
          padding: 16px;
          font-family: var(--font-mono, monospace);
          color: #38bdf8;
          max-height: 400px;
          overflow-y: auto;
          font-size: 13px;
          line-height: 1.6;
        }
      `}</style>

      {/* Toast Notification Stack */}
      <div className="tm-toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`tm-toast tm-toast-${toast.type}`}>
            <div>
              <strong style={{ display: 'block', fontSize: '14px' }}>{toast.title}</strong>
              <span style={{ fontSize: '13px' }}>{toast.message}</span>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'none', border: 'none', color: '#fff', fontSize: '16px', cursor: 'pointer', marginLeft: '12px' }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal Dialog */}
      {taskToDelete && (
        <div className="tm-modal-overlay">
          <div className="tm-modal-box">
            <h3 style={{ margin: '0 0 10px 0', color: '#991b1b', fontSize: '18px' }}>
              🗑️ Delete Task Confirmation
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Are you sure you want to delete task <strong>"{taskToDelete.title}"</strong>? This will permanently remove the document from MongoDB.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                className="tm-cancel-btn"
                onClick={() => setTaskToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                style={{ background: '#dc2626', color: '#fff', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}
                onClick={confirmDeleteTask}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Task'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="tm-container">
        {/* Top Header Bar */}
        <div className="tm-header-bar">
          <h2 className="tm-title">
            <span>📋</span> Full-Stack Task Manager
          </h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="tm-status-pill">
              <span className={`tm-dot ${serverOnline ? 'online' : 'offline'}`}></span>
              <span>Express API: {serverOnline ? 'Online (Port 5000)' : 'Offline'}</span>
            </div>
            <div className="tm-status-pill" style={{ background: dbStatus.status === 'online' ? '#ecfdf5' : '#fff1f2' }}>
              <span className={`tm-dot ${dbStatus.status === 'online' ? 'online' : 'offline'}`}></span>
              <span>Database: <strong>{dbStatus.dbState}</strong></span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tm-nav-tabs">
          {[
            { key: 'dashboard', label: '⚡ Task Dashboard' },
            { key: 'console', label: '📟 Live Console & Status' },
            { key: 'architecture', label: '🏗️ System Architecture' },
            { key: 'maturity', label: '📊 API Maturity Model' }
          ].map(tab => (
            <button
              key={tab.key}
              className={`tm-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: TASK DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="tm-grid">
            {/* Form */}
            <div className="tm-card">
              <h3 className="tm-card-title">
                {editingTask ? `Edit Task` : 'Add New Task'}
              </h3>
              <form onSubmit={handleSubmit} className="tm-form">
                <div>
                  <label className="tm-label">Task Title (Required) *</label>
                  <input
                    type="text"
                    className="tm-input"
                    placeholder="Enter title..."
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="tm-label">Description</label>
                  <textarea
                    className="tm-textarea"
                    rows={3}
                    placeholder="Task details..."
                    value={formDesc}
                    onChange={e => setFormDesc(e.target.value)}
                  />
                </div>

                <div>
                  <label className="tm-label">Priority</label>
                  <select
                    className="tm-select"
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value)}
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority (Default)</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                {formError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', color: '#991b1b', fontSize: '13px' }}>
                    <strong>❌ {formError.error || 'Error'}:</strong> {formError.message}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button type="submit" className="tm-submit-btn" style={{ flex: 1 }}>
                    {editingTask ? 'Save Changes' : '+ Add Task (Optimistic UI)'}
                  </button>
                  {editingTask && (
                    <button type="button" className="tm-cancel-btn" onClick={cancelEdit}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Paginated List */}
            <div className="tm-card">
              <h3 className="tm-card-title">
                <span>Tasks List (Page {pagination.page} of {pagination.totalPages})</span>
                <span style={{ fontSize: '12px', background: '#e0e7ff', color: '#3730a3', padding: '3px 10px', borderRadius: '9999px' }}>
                  Total: {pagination.total} Tasks
                </span>
              </h3>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  Loading tasks from database...
                </div>
              ) : tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  No tasks found on this page. Add a task using the form on the left!
                </div>
              ) : (
                <div>
                  {tasks.map(task => {
                    const taskId = task._id || task.id;
                    const badge = getPriorityBadge(task.priority);

                    return (
                      <div
                        key={taskId}
                        className={`tm-task-item ${task.isOptimistic ? 'optimistic' : ''}`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b' }}>
                              ID: {taskId} {task.isOptimistic && '(Syncing...)'}
                            </span>
                            <h4 style={{ margin: '4px 0', fontSize: '15px', color: '#0f172a' }}>
                              {task.title}
                            </h4>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                              onClick={() => startEdit(task)}
                            >
                              Edit
                            </button>
                            <button
                              style={{ background: '#ecfdf5', color: '#047857', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                              onClick={() => handleToggleComplete(task)}
                            >
                              {task.completed ? 'Mark Pending' : 'Mark Done'}
                            </button>
                            <button
                              style={{ background: '#fef2f2', color: '#dc2626', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                              onClick={() => setTaskToDelete(task)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '9999px', background: task.completed ? '#d1fae5' : '#fef3c7', color: task.completed ? '#065f46' : '#92400e' }}>
                            {task.completed ? 'COMPLETED' : 'PENDING'}
                          </span>
                          <span style={{ fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '9999px', background: badge.bg, color: badge.color }}>
                            {task.priority || 'medium'} priority
                          </span>
                        </div>

                        {task.description && (
                          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569' }}>
                            {task.description}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {/* Pagination Controls */}
                  <div className="tm-pagination-bar">
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                    </span>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="tm-page-btn"
                        disabled={pagination.page <= 1}
                        onClick={() => fetchPaginatedTasks(pagination.page - 1)}
                      >
                        &laquo; Prev
                      </button>

                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                        <button
                          key={p}
                          className={`tm-page-btn ${pagination.page === p ? 'active' : ''}`}
                          onClick={() => fetchPaginatedTasks(p)}
                        >
                          {p}
                        </button>
                      ))}

                      <button
                        className="tm-page-btn"
                        disabled={pagination.page >= pagination.totalPages}
                        onClick={() => fetchPaginatedTasks(pagination.page + 1)}
                      >
                        Next &raquo;
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: LIVE CONSOLE & STATUS */}
        {activeTab === 'console' && (
          <div className="tm-card">
            <h3 className="tm-card-title">Live Express Server Request Terminal</h3>
            <div className="tm-terminal" ref={logTerminalRef}>
              <div>Task Management Server running on http://localhost:5000</div>
              <div>Backend Status: {serverOnline ? 'Connected' : 'Offline'} | Database: {dbStatus.dbState}</div>
              <hr style={{ borderColor: '#334155', margin: '10px 0' }} />
              {logs.map((l, i) => (
                <div key={l.id || i}>
                  [{l.timestamp}] {l.method} {l.url} {l.ip || '::1'} - HTTP {l.statusCode || 200}
                </div>
              ))}
              {logs.length === 0 && <div>No HTTP requests logged yet. Perform operations in the Dashboard tab.</div>}
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM ARCHITECTURE */}
        {activeTab === 'architecture' && (
          <div className="tm-card">
            <h3 className="tm-card-title">Full-Stack Application Architecture</h3>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ background: '#3b82f6', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: '700', marginBottom: '12px' }}>
                React Frontend (localhost:5173) — Central API Service (src/services/api.js)
              </div>
              <div style={{ fontSize: '20px', color: '#94a3b8', margin: '8px 0' }}>↓ JSON HTTP Requests (CORS Middleware Enabled)</div>
              <div style={{ background: '#8b5cf6', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: '700', margin: '12px 0' }}>
                Node / Express Backend (localhost:5000) — Mongoose ODM Schema &amp; Controllers
              </div>
              <div style={{ fontSize: '20px', color: '#94a3b8', margin: '8px 0' }}>↓ Query &amp; Persistence (Task.find, Task.create, Task.findByIdAndUpdate)</div>
              <div style={{ background: '#10b981', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: '700', marginTop: '12px' }}>
                MongoDB Database (tasks Collection) — Document Store
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: API MATURITY MODEL */}
        {activeTab === 'maturity' && (
          <div className="tm-card">
            <h3 className="tm-card-title">Richardson Maturity Model &amp; API Design</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                  <th style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Level</th>
                  <th style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Criterion</th>
                  <th style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Level 0</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Single URI, single verb (RPC)</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0', color: '#059669', fontWeight: '700' }}>✅ Surpassed</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Level 1</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Resources with individual URIs</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0', color: '#059669', fontWeight: '700' }}>✅ Implemented (/api/tasks, /api/tasks/:id)</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Level 2</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>HTTP Verbs &amp; Status Codes</td>
                  <td style={{ padding: '10px', borderBottom: '1px solid #e2e8f0', color: '#059669', fontWeight: '700' }}>✅ Implemented (GET 200, POST 201, PUT 200, DELETE 200, 400, 404)</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaskManager;
