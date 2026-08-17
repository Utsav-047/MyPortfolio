import React, { useState, useEffect, useCallback } from 'react';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getDbStatus
} from '../services/api';

function Practical6() {
  // ── State Management ───────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
  const [dbStatus, setDbStatus] = useState({ status: 'checking', dbState: 'Checking...' });
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard | architecture | questions

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState('medium');
  const [editingTask, setEditingTask] = useState(null);
  const [formError, setFormError] = useState(null);

  // Modal Dialog State for Deleting Tasks (Supplementary Problem)
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast Notification System State (Supplementary Problem)
  const [toasts, setToasts] = useState([]);

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
    } catch (err) {
      setServerOnline(false);
      setDbStatus({ status: 'offline', dbState: 'Backend Offline' });
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
      addToast('error', 'Fetch Error', 'Failed to connect to backend server at http://localhost:5000');
    } finally {
      setLoading(false);
    }
  }, [pagination.page]);

  useEffect(() => {
    fetchPaginatedTasks(1);
    checkBackendStatus();
    const interval = setInterval(checkBackendStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  // ── Optimistic Task Creation ──────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim()) {
      setFormError({ error: 'Validation Error', message: 'Task title is required' });
      return;
    }

    const payload = {
      title: formTitle.trim(),
      description: formDesc.trim(),
      priority: formPriority,
      completed: editingTask ? editingTask.completed : false
    };

    if (editingTask) {
      // Regular PUT Update
      const targetId = editingTask._id || editingTask.id;
      try {
        const res = await updateTask(targetId, payload);
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
      // OPTIMISTIC CREATION (Supplementary Requirement)
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

      // 1. Immediately show task in local list
      setTasks(prev => [optimisticTask, ...prev]);
      setFormTitle('');
      setFormDesc('');
      setFormPriority('medium');
      addToast('info', 'Optimistic Update', 'Task added to UI! Syncing with MongoDB...');

      try {
        // 2. Perform background POST API call
        const res = await createTask(payload);
        // 3. Confirm success & re-fetch to synchronize state
        addToast('success', 'MongoDB Synchronized', `Task saved to database with ID ${res.data._id || res.data.id}`);
        fetchPaginatedTasks(1);
      } catch (err) {
        // 4. Rollback optimistic task on error
        setTasks(prev => prev.filter(t => (t._id || t.id) !== tempId));
        setFormError(err.raw || { error: err.message });
        addToast('error', 'Sync Failed (Rolled back)', err.message);
      }
    }
  };

  // ── Optimistic Toggle Completion ──────────────────────────
  const handleToggleComplete = async (task) => {
    const taskId = task._id || task.id;
    const oldStatus = task.completed;
    const newStatus = !oldStatus;

    // 1. Optimistic local state update
    setTasks(prev => prev.map(t => (t._id || t.id) === taskId ? { ...t, completed: newStatus } : t));

    try {
      await updateTask(taskId, { completed: newStatus });
      addToast('success', 'Status Updated', `Task status changed to ${newStatus ? 'COMPLETED' : 'PENDING'}`);
    } catch (err) {
      // Rollback on error
      setTasks(prev => prev.map(t => (t._id || t.id) === taskId ? { ...t, completed: oldStatus } : t));
      addToast('error', 'Toggle Failed', 'Rolled back completed state change');
    }
  };

  // ── Delete Confirmation Handler ───────────────────────────
  const confirmDeleteTask = async () => {
    if (!taskToDelete) return;
    const taskId = taskToDelete._id || taskToDelete.id;
    setIsDeleting(true);

    try {
      await deleteTask(taskId);
      addToast('delete', 'Task Deleted', `Task #${taskId} permanently removed from MongoDB`);
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
      {/* Embedded CSS Styles */}
      <style>{`
        .p6-container {
          display: flex;
          flex-direction: column;
          gap: 20px;
          color: #0f172a;
        }

        .p6-header-bar {
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

        .p6-title {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .p6-status-pill {
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

        .p6-dot { width: 8px; height: 8px; border-radius: 50%; }
        .p6-dot.online { background-color: #10b981; box-shadow: 0 0 8px #10b981; }
        .p6-dot.offline { background-color: #ef4444; }

        .p6-nav-tabs {
          display: flex;
          gap: 8px;
          background: #f1f5f9;
          padding: 6px;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .p6-tab-btn {
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
        }

        .p6-tab-btn.active {
          background: #ffffff;
          color: #4f46e5;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
        }

        .p6-grid {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 24px;
        }

        @media (max-width: 900px) {
          .p6-grid { grid-template-columns: 1fr; }
        }

        .p6-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
        }

        .p6-card-title {
          font-size: 18px;
          font-weight: 700;
          color: #0f172a;
          margin-top: 0;
          margin-bottom: 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .p6-form { display: flex; flex-direction: column; gap: 14px; }

        .p6-label { font-size: 13px; font-weight: 600; color: #334155; margin-bottom: 4px; display: block; }

        .p6-input, .p6-textarea, .p6-select {
          width: 100%;
          padding: 10px 14px;
          font-size: 14px;
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          background-color: #f8fafc;
          color: #0f172a;
          outline: none;
        }

        .p6-submit-btn {
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

        .p6-submit-btn:hover { background: #4338ca; }

        .p6-cancel-btn {
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
        .p6-task-item {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-bottom: 12px;
          position: relative;
        }

        .p6-task-item.optimistic {
          border: 2px dashed #6366f1;
          background: #f5f3ff;
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse { 0% { opacity: 0.8; } 50% { opacity: 1; } 100% { opacity: 0.8; } }

        .p6-pagination-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #e2e8f0;
          margin-top: 8px;
          flex-wrap: wrap;
          gap: 12px;
        }

        .p6-page-btn {
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 600;
          border: 1px solid #cbd5e1;
          background: #ffffff;
          color: #334155;
          border-radius: 6px;
          cursor: pointer;
        }

        .p6-page-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .p6-page-btn.active {
          background: #4f46e5;
          color: #ffffff;
          border-color: #4f46e5;
        }

        /* Toast Container */
        .p6-toast-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
          max-width: 380px;
        }

        .p6-toast {
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

        .p6-toast-success { background: #10b981; }
        .p6-toast-info { background: #3b82f6; }
        .p6-toast-error { background: #ef4444; }
        .p6-toast-delete { background: #dc2626; }

        /* Confirmation Modal Overlay */
        .p6-modal-overlay {
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

        .p6-modal-box {
          background: #ffffff;
          border-radius: 16px;
          padding: 24px;
          max-width: 440px;
          width: 100%;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      {/* Toast Notification Stack */}
      <div className="p6-toast-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`p6-toast p6-toast-${toast.type}`}>
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

      {/* Delete Confirmation Modal Dialog (Supplementary Problem) */}
      {taskToDelete && (
        <div className="p6-modal-overlay">
          <div className="p6-modal-box">
            <h3 style={{ margin: '0 0 10px 0', color: '#991b1b', fontSize: '18px' }}>
              🗑️ Delete Task Confirmation
            </h3>
            <p style={{ fontSize: '14px', color: '#475569', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Are you sure you want to delete task <strong>"{taskToDelete.title}"</strong>? This will permanently remove the document from MongoDB.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                className="p6-cancel-btn"
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

      <div className="p6-container">
        {/* Top Header Bar */}
        <div className="p6-header-bar">
          <h2 className="p6-title">
            <span>🔗</span> Practical 6: Full Stack Integration (React + Express + MongoDB)
          </h2>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div className="p6-status-pill">
              <span className={`p6-dot ${serverOnline ? 'online' : 'offline'}`}></span>
              <span>API (Port 5000): {serverOnline ? 'Connected' : 'Offline'}</span>
            </div>
            <div className="p6-status-pill" style={{ background: dbStatus.status === 'online' ? '#ecfdf5' : '#fff1f2' }}>
              <span className={`p6-dot ${dbStatus.status === 'online' ? 'online' : 'offline'}`}></span>
              <span>DB: <strong>{dbStatus.dbState}</strong></span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="p6-nav-tabs">
          {[
            { key: 'dashboard', label: '⚡ Full Stack CRUD & 5-Item Pagination' },
            { key: 'architecture', label: '🏗️ End-to-End Architecture' },
            { key: 'questions', label: '❓ Key Questions & CORS Analysis' }
          ].map(tab => (
            <button
              key={tab.key}
              className={`p6-tab-btn ${activeTab === tab.key ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: FULL STACK DASHBOARD WITH 5-TASK PAGINATION */}
        {activeTab === 'dashboard' && (
          <div className="p6-grid">
            {/* Left Card: Create / Edit Form */}
            <div className="p6-card">
              <h3 className="p6-card-title">
                {editingTask ? `Edit Task` : 'Add New Task (Optimistic)'}
              </h3>
              <form onSubmit={handleSubmit} className="p6-form">
                <div>
                  <label className="p6-label">Title *</label>
                  <input
                    type="text"
                    className="p6-input"
                    placeholder="Task title..."
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="p6-label">Description</label>
                  <textarea
                    className="p6-textarea"
                    rows={3}
                    placeholder="Description details..."
                    value={formDesc}
                    onChange={e => setFormDesc(e.target.value)}
                  />
                </div>

                <div>
                  <label className="p6-label">Priority</label>
                  <select
                    className="p6-select"
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
                  <button type="submit" className="p6-submit-btn" style={{ flex: 1 }}>
                    {editingTask ? 'Update Task' : '+ Add Task (Optimistic UI)'}
                  </button>
                  {editingTask && (
                    <button type="button" className="p6-cancel-btn" onClick={cancelEdit}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right Card: Paginated Tasks (5 Tasks Per Page) */}
            <div className="p6-card">
              <h3 className="p6-card-title">
                <span>MongoDB Tasks (Page {pagination.page} of {pagination.totalPages})</span>
                <span style={{ fontSize: '12px', background: '#e0e7ff', color: '#3730a3', padding: '3px 10px', borderRadius: '9999px' }}>
                  Total: {pagination.total} Tasks
                </span>
              </h3>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  Loading tasks from Express API...
                </div>
              ) : tasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                  No tasks found on this page. Create a new task above!
                </div>
              ) : (
                <div>
                  {tasks.map(task => {
                    const taskId = task._id || task.id;
                    const badge = getPriorityBadge(task.priority);

                    return (
                      <div
                        key={taskId}
                        className={`p6-task-item ${task.isOptimistic ? 'optimistic' : ''}`}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div>
                            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b' }}>
                              ID: {taskId} {task.isOptimistic && '(Optimistic UI Pending Sync)'}
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

                  {/* 5-Item Pagination Controls */}
                  <div className="p6-pagination-bar">
                    <span style={{ fontSize: '13px', color: '#64748b' }}>
                      Showing {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                    </span>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        className="p6-page-btn"
                        disabled={pagination.page <= 1}
                        onClick={() => fetchPaginatedTasks(pagination.page - 1)}
                      >
                        &laquo; Prev
                      </button>

                      {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(p => (
                        <button
                          key={p}
                          className={`p6-page-btn ${pagination.page === p ? 'active' : ''}`}
                          onClick={() => fetchPaginatedTasks(p)}
                        >
                          {p}
                        </button>
                      ))}

                      <button
                        className="p6-page-btn"
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

        {/* TAB 2: END-TO-END ARCHITECTURE */}
        {activeTab === 'architecture' && (
          <div className="p6-card">
            <h3 className="p6-card-title">Full Stack Communication Architecture</h3>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ background: '#3b82f6', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: '700', marginBottom: '12px' }}>
                React Frontend (localhost:5173) — Fetch API Client (src/services/api.js)
              </div>
              <div style={{ fontSize: '20px', color: '#94a3b8', margin: '8px 0' }}>↓ JSON HTTP Requests (cors middleware enabled)</div>
              <div style={{ background: '#8b5cf6', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: '700', margin: '12px 0' }}>
                Node / Express Backend (localhost:5000) — Mongoose ODM Validation &amp; Controllers
              </div>
              <div style={{ fontSize: '20px', color: '#94a3b8', margin: '8px 0' }}>↓ Database Operations (Task.find, Task.create, Task.findByIdAndUpdate)</div>
              <div style={{ background: '#10b981', color: '#fff', padding: '16px', borderRadius: '12px', fontWeight: '700', marginTop: '12px' }}>
                MongoDB Database (tasks Collection) — Persistent Document Store
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KEY QUESTIONS & THEORY */}
        {activeTab === 'questions' && (
          <div className="p6-card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 className="p6-card-title">Theory Concepts &amp; Key Analysis Questions</h3>

            <div>
              <h4 style={{ color: '#1e1b4b', margin: '0 0 6px 0' }}>
                1. What changes are required on the backend (CORS) to allow the React dev server to call the Express API?
              </h4>
              <p style={{ background: '#f8fafc', padding: '12px 16px', borderLeft: '4px solid #4f46e5', margin: 0, fontSize: '14px', color: '#475569' }}>
                Browsers enforce the Same-Origin Policy (SOP). Because React runs on <code>http://localhost:5173</code> and Express runs on <code>http://localhost:5000</code>, they are different origins. Enabling the <code>cors()</code> middleware in Express adds HTTP response headers (e.g. <code>Access-Control-Allow-Origin: *</code>) permitting cross-origin requests.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#1e1b4b', margin: '0 0 6px 0' }}>
                2. Why should the UI re-fetch or update local state after a successful POST/PUT/DELETE rather than assuming success silently?
              </h4>
              <p style={{ background: '#f8fafc', padding: '12px 16px', borderLeft: '4px solid #4f46e5', margin: 0, fontSize: '14px', color: '#475569' }}>
                Server-side triggers, default values (e.g., MongoDB generated <code>_id</code>, <code>createdAt</code> timestamps), and pre-save hooks (like trimming whitespace) alter data before saving. Updating state from the server response guarantees the UI accurately mirrors the database truth.
              </p>
            </div>

            <div>
              <h4 style={{ color: '#1e1b4b', margin: '0 0 6px 0' }}>
                3. What is the risk of not handling errors on write operations (POST/PUT/DELETE) the same way as read operations (GET)?
              </h4>
              <p style={{ background: '#f8fafc', padding: '12px 16px', borderLeft: '4px solid #4f46e5', margin: 0, fontSize: '14px', color: '#475569' }}>
                If write errors are swallowed, the UI might show a task as saved or deleted when the database rejected it (e.g., validation failure or network drop). This causes UI state desynchronization, confusing the user and risking data corruption.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Practical6;
