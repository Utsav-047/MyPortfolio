import React, { useState, useEffect, useCallback } from 'react';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTeamMembers,
  getDbStatus
} from '../services/api';

function TaskManager({ userRole = 'manager', currentUser = null }) {
  // ── State Management ───────────────────────────────────────
  const [role, setRole] = useState(userRole || 'manager');
  const [tasks, setTasks] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 1 });
  const [dbStatus, setDbStatus] = useState({ status: 'checking', dbState: 'Checking...' });
  const [loading, setLoading] = useState(true);
  const [serverOnline, setServerOnline] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formPriority, setFormPriority] = useState('medium');
  const [formStatus, setFormStatus] = useState('pending'); // pending | in_progress | completed
  const [formAssignee, setFormAssignee] = useState(''); // email of assignee
  const [editingTask, setEditingTask] = useState(null);
  const [formError, setFormError] = useState(null);

  // Filter & Search state
  const [statusFilter, setStatusFilter] = useState('all'); // all | pending | in_progress | completed
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal state for deleting tasks
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast notification stack
  const [toasts, setToasts] = useState([]);

  // Sync userRole prop or role_changed event
  useEffect(() => {
    if (userRole) setRole(userRole);
  }, [userRole]);

  useEffect(() => {
    const handleRoleChanged = (e) => {
      const newRole = e.detail || 'manager';
      setRole(newRole);
      fetchPaginatedTasks(1, statusFilter, searchQuery, 'all', newRole);
    };
    window.addEventListener('role_changed', handleRoleChanged);
    return () => window.removeEventListener('role_changed', handleRoleChanged);
  }, [statusFilter, searchQuery]);

  // ── Helper: Add Toast Notification ────────────────────────
  const addToast = (type, title, message) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
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

  // ── Fetch Team Members ─────────────────────────────────────
  const fetchTeam = useCallback(async () => {
    try {
      const res = await getTeamMembers();
      const list = res.data || [];
      setTeamMembers(list);
      if (list.length > 0 && !formAssignee) {
        setFormAssignee(list[0].email);
      }
    } catch {
      setTeamMembers([
        { id: 'emp-1', name: 'Utsav Patel (Lead)', email: 'utsavpatel788190@gmail.com', role: 'manager' },
        { id: 'emp-2', name: 'Rahul Sharma (Frontend)', email: 'rahul.sharma@company.dev', role: 'employee' },
        { id: 'emp-3', name: 'Priya Patel (ML Dev)', email: 'priya.patel@company.dev', role: 'employee' },
        { id: 'emp-4', name: 'Sneha Joshi (Backend)', email: 'sneha.joshi@company.dev', role: 'employee' }
      ]);
    }
  }, [formAssignee]);

  // ── Fetch Paginated Tasks ─────────────────────────────────
  const fetchPaginatedTasks = useCallback(async (
    pageToFetch = pagination.page,
    filterStatus = statusFilter,
    querySearch = searchQuery,
    filterAssignee = assigneeFilter,
    activeRole = role
  ) => {
    setLoading(true);
    try {
      const res = await getTasks(
        pageToFetch,
        5,
        '',
        querySearch,
        filterStatus,
        activeRole === 'manager' ? filterAssignee : 'all'
      );
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
      if (err.status !== 401) {
        addToast('error', 'Network Error', 'Failed to fetch tasks from backend.');
      }
    } finally {
      setLoading(false);
    }
  }, [pagination.page, statusFilter, searchQuery, assigneeFilter, role]);

  useEffect(() => {
    fetchPaginatedTasks(1, statusFilter, searchQuery, assigneeFilter, role);
    fetchTeam();
    checkBackendStatus();
    const interval = setInterval(() => {
      checkBackendStatus();
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // ── Handle Status Filter Tab Click ─────────────────────────
  const handleStatusFilterChange = (newStatus) => {
    setStatusFilter(newStatus);
    fetchPaginatedTasks(1, newStatus, searchQuery, assigneeFilter, role);
  };

  // ── Handle Assignee Filter Change (Manager Only) ────────────
  const handleAssigneeFilterChange = (newAssignee) => {
    setAssigneeFilter(newAssignee);
    fetchPaginatedTasks(1, statusFilter, searchQuery, newAssignee, role);
  };

  // ── Handle Search Button Trigger ──────────────────────────
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
    fetchPaginatedTasks(1, statusFilter, searchInput, assigneeFilter, role);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    fetchPaginatedTasks(1, statusFilter, '', assigneeFilter, role);
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
        assignedTo: task.assignedTo || { name: 'Unassigned' },
        assignedBy: task.assignedBy || { name: 'Manager' },
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

    addToast(
      'success',
      '📥 Task Downloaded',
      `Task #${taskId} exported with timestamp: ${timestampLocal}`
    );
  };

  // ── Task Creation & Editing ───────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!formTitle.trim()) {
      setFormError({ error: 'Validation Error', message: 'Title is required' });
      return;
    }

    let assignedToObj;
    if (formAssignee === 'all_employees' || formAssignee === 'all@team.dev' || formAssignee === 'all') {
      assignedToObj = { id: 'all', name: 'All Employees', email: 'all@team.dev' };
    } else {
      const selectedMember = teamMembers.find(m => m.email === formAssignee);
      assignedToObj = selectedMember
        ? { id: selectedMember.id || '', name: selectedMember.name, email: selectedMember.email }
        : (formAssignee ? { id: '', name: formAssignee, email: '' } : { id: '', name: 'Unassigned', email: '' });
    }

    const isCompleted = formStatus === 'completed';

    const payload = {
      title: formTitle.trim(),
      description: formDesc.trim(),
      priority: formPriority,
      status: formStatus,
      completed: isCompleted,
      assignedTo: assignedToObj
    };

    if (editingTask) {
      const targetId = editingTask._id || editingTask.id;
      try {
        await updateTask(targetId, payload);
        addToast('success', 'Task Updated', `Task #${targetId} updated successfully`);
        cancelEdit();
        fetchPaginatedTasks(pagination.page, statusFilter, searchQuery, assigneeFilter, role);
      } catch (err) {
        setFormError(err.raw || { error: err.message });
        addToast('error', 'Update Failed', err.message);
      }
    } else {
      const tempId = `optimistic-${Date.now()}`;
      const optimisticTask = {
        _id: tempId,
        id: tempId,
        title: payload.title,
        description: payload.description,
        priority: payload.priority,
        status: payload.status,
        completed: payload.completed,
        assignedTo: payload.assignedTo,
        assignedBy: { name: currentUser?.name || 'Manager', email: currentUser?.email || '' },
        createdAt: new Date().toISOString(),
        isOptimistic: true
      };

      setTasks(prev => [optimisticTask, ...prev]);
      setFormTitle('');
      setFormDesc('');
      setFormPriority('medium');
      setFormStatus('pending');
      addToast('info', 'Optimistic Update', `Task assigned to ${payload.assignedTo.name}! Syncing with database...`);

      try {
        const res = await createTask(payload);
        addToast('success', 'Database Synchronized', `Task saved to MongoDB with ID ${res.data._id || res.data.id}`);
        fetchPaginatedTasks(1, statusFilter, searchQuery, assigneeFilter, role);
      } catch (err) {
        setTasks(prev => prev.filter(t => (t._id || t.id) !== tempId));
        setFormError(err.raw || { error: err.message });
        addToast('error', 'Sync Failed (Rolled back)', err.message);
      }
    }
  };

  // ── Handle Task Workflow Status Transitions (Strict State Machine) ──
  const handleStatusTransition = async (task, targetStatus) => {
    const taskId = task._id || task.id;
    const currentStatus = task.status || (task.completed ? 'completed' : 'pending');

    if (currentStatus === 'completed' && targetStatus !== 'completed' && targetStatus !== 'reopen') {
      addToast('error', 'Invalid Action', 'Completed tasks are finalized. Click "Reopen Task" to start work again.');
      return;
    }

    const nextStatus = targetStatus === 'reopen' ? 'pending' : targetStatus;
    const nextCompleted = nextStatus === 'completed';

    const oldStatus = task.status;
    const oldCompleted = task.completed;

    setTasks(prev => prev.map(t => (t._id || t.id) === taskId ? { ...t, status: nextStatus, completed: nextCompleted } : t));

    try {
      await updateTask(taskId, { status: nextStatus, completed: nextCompleted });
      const toastTitle = nextStatus === 'completed' ? '🎉 Task Completed' : (targetStatus === 'reopen' ? '🔄 Task Reopened' : '⚡ Task In Progress');
      addToast('success', toastTitle, `Task #${taskId} is now ${nextStatus.toUpperCase()}`);
      fetchPaginatedTasks(pagination.page, statusFilter, searchQuery, assigneeFilter, role);
    } catch (err) {
      setTasks(prev => prev.map(t => (t._id || t.id) === taskId ? { ...t, status: oldStatus, completed: oldCompleted } : t));
      addToast('error', 'Status Update Failed', err.message || 'Rolled back status change');
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
      fetchPaginatedTasks(pagination.page, statusFilter, searchQuery, assigneeFilter, role);
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
    setFormStatus(task.status || (task.completed ? 'completed' : 'pending'));
    if (task.assignedTo?.id === 'all' || task.assignedTo?.name === 'All Employees' || task.assignedTo?.email === 'all@team.dev') {
      setFormAssignee('all_employees');
    } else {
      setFormAssignee(task.assignedTo?.email || '');
    }
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

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return { bg: '#fee2e2', color: '#991b1b', label: 'HIGH PRIORITY' };
      case 'medium': return { bg: '#e0e7ff', color: '#3730a3', label: 'MEDIUM PRIORITY' };
      case 'low': return { bg: '#f3f4f6', color: '#4b5563', label: 'LOW PRIORITY' };
      default: return { bg: '#e0e7ff', color: '#3730a3', label: 'MEDIUM PRIORITY' };
    }
  };

  const getStatusBadge = (status, completed) => {
    const s = status || (completed ? 'completed' : 'pending');
    switch (s) {
      case 'completed': return { bg: '#d1fae5', color: '#065f46', label: '✅ COMPLETED' };
      case 'in_progress': return { bg: '#e0f2fe', color: '#0369a1', label: '⚡ IN PROGRESS' };
      case 'pending':
      default: return { bg: '#fef3c7', color: '#92400e', label: '⏳ PENDING' };
    }
  };

  const isManager = role === 'manager';

  // Compute live overview metrics
  const completedCount = tasks.filter(t => t.status === 'completed' || t.completed).length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress' && !t.completed).length;
  const pendingCount = tasks.filter(t => (!t.status || t.status === 'pending') && !t.completed).length;

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
          font-size: 24px;
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

        /* Role KPI Stats Grid */
        .tm-stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 14px;
        }

        .tm-stat-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px 18px;
          display: flex;
          align-items: center;
          gap: 14px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }

        .tm-stat-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }

        .tm-stat-number {
          font-size: 22px;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.1;
        }

        .tm-stat-label {
          font-size: 12px;
          font-weight: 600;
          color: #64748b;
        }

        .tm-grid {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 24px;
        }

        @media (max-width: 960px) {
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

        /* Task Cards & Actions */
        .tm-task-item {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 14px;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .tm-task-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 14px -2px rgba(0, 0, 0, 0.06);
        }

        .tm-task-item.completed-locked {
          border-left: 5px solid #10b981;
          background: #fcfdfd;
        }

        .tm-task-item.in-progress-active {
          border-left: 5px solid #0284c7;
        }

        .tm-task-item.pending-active {
          border-left: 5px solid #f59e0b;
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
          <div>
            <h2 className="tm-title">
              <span>{isManager ? '👑' : '💼'}</span> {isManager ? 'Manager Task Center' : 'Employee Task Hub'}
            </h2>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>
              {isManager
                ? 'Manager Workspace: Create tasks, assign work to employees, and supervise progress.'
                : 'Employee Workspace: View assigned tasks, track deliverables, and complete work.'}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="tm-status-pill">
              <span className={`tm-dot ${serverOnline ? 'online' : 'offline'}`}></span>
              <span>API: {serverOnline ? 'Online (5000)' : 'Offline'}</span>
            </div>
            <div className="tm-status-pill" style={{ background: dbStatus.status === 'online' ? '#ecfdf5' : '#fff1f2' }}>
              <span className={`tm-dot ${dbStatus.status === 'online' ? 'online' : 'offline'}`}></span>
              <span>DB: <strong>{dbStatus.dbState}</strong></span>
            </div>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="tm-stats-grid">
          <div className="tm-stat-card">
            <div className="tm-stat-icon" style={{ background: '#e0e7ff', color: '#4338ca' }}>📋</div>
            <div>
              <div className="tm-stat-number">{pagination.total}</div>
              <div className="tm-stat-label">{isManager ? 'Total Team Tasks' : 'My Total Tasks'}</div>
            </div>
          </div>

          <div className="tm-stat-card">
            <div className="tm-stat-icon" style={{ background: '#e0f2fe', color: '#0369a1' }}>⚡</div>
            <div>
              <div className="tm-stat-number">{inProgressCount}</div>
              <div className="tm-stat-label">In Progress</div>
            </div>
          </div>

          <div className="tm-stat-card">
            <div className="tm-stat-icon" style={{ background: '#d1fae5', color: '#065f46' }}>✅</div>
            <div>
              <div className="tm-stat-number">{completedCount}</div>
              <div className="tm-stat-label">Completed</div>
            </div>
          </div>

          <div className="tm-stat-card">
            <div className="tm-stat-icon" style={{ background: '#fef3c7', color: '#92400e' }}>⏳</div>
            <div>
              <div className="tm-stat-number">{pendingCount}</div>
              <div className="tm-stat-label">Pending Action</div>
            </div>
          </div>

          {isManager && (
            <div className="tm-stat-card">
              <div className="tm-stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>👥</div>
              <div>
                <div className="tm-stat-number">{teamMembers.length}</div>
                <div className="tm-stat-label">Team Members</div>
              </div>
            </div>
          )}
        </div>

        {/* TASK DASHBOARD */}
        <div className="tm-grid">
          {/* Form */}
          <div className="tm-card">
            <h3 className="tm-card-title">
              {editingTask
                ? `✏️ Edit Task`
                : (isManager ? '➕ Assign New Task' : '➕ Create Personal Task')}
            </h3>
            <form onSubmit={handleSubmit} className="tm-form">
              <div>
                <label className="tm-label">Task Title (Required) *</label>
                <input
                  type="text"
                  className="tm-input"
                  placeholder="Enter task title..."
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="tm-label">Description / Instructions</label>
                <textarea
                  className="tm-textarea"
                  rows={3}
                  placeholder="Task details & requirements..."
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                />
              </div>

              {/* Assignee Field — Manager can assign to any employee or entire team */}
              {isManager && (
                <div>
                  <label className="tm-label">👥 Assign To (Team Member or Entire Team)</label>
                  <select
                    className="tm-select"
                    value={formAssignee}
                    onChange={e => setFormAssignee(e.target.value)}
                  >
                    <option value="all_employees">
                      📢 All Employees (Entire Team Broadcast)
                    </option>
                    <optgroup label="👤 Individual Team Members">
                      {teamMembers.map(m => (
                        <option key={m.email || m.name} value={m.email}>
                          {m.name} ({m.role === 'manager' ? 'Lead' : 'Employee'}) — {m.email}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              )}

              <div>
                <label className="tm-label">Priority</label>
                <select
                  className="tm-select"
                  value={formPriority}
                  onChange={e => setFormPriority(e.target.value)}
                >
                  <option value="low">🟢 Low Priority</option>
                  <option value="medium">🔵 Medium Priority (Default)</option>
                  <option value="high">🔴 High Priority</option>
                </select>
              </div>

              <div>
                <label className="tm-label">Initial Status</label>
                <select
                  className="tm-select"
                  value={formStatus}
                  onChange={e => setFormStatus(e.target.value)}
                >
                  <option value="pending">⏳ Pending (To Do)</option>
                  <option value="in_progress">⚡ In Progress</option>
                  <option value="completed">✅ Completed</option>
                </select>
              </div>

              {formError && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 14px', color: '#991b1b', fontSize: '13px' }}>
                  <strong>❌ {formError.error || 'Error'}:</strong> {formError.message}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                <button type="submit" className="tm-submit-btn" style={{ flex: 1 }}>
                  {editingTask ? 'Save Changes' : (isManager ? '👑 Assign Task (Optimistic UI)' : '+ Add Task')}
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
            {/* Status Filter & Manager Assignee Filter */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ fontSize: '15px', fontWeight: '700', color: '#0f172a' }}>
                  {isManager ? 'Filter Team Tasks:' : 'Filter My Tasks:'}
                </span>
                <span style={{ fontSize: '12px', background: '#e0e7ff', color: '#3730a3', padding: '3px 10px', borderRadius: '9999px', fontWeight: '600' }}>
                  Total: {pagination.total} Tasks
                </span>
              </div>

              {/* Filter Tabs: All, Pending, In Progress, Completed */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { key: 'all', label: 'All Tasks', icon: '📋' },
                  { key: 'pending', label: 'Pending', icon: '⏳' },
                  { key: 'in_progress', label: 'In Progress', icon: '⚡' },
                  { key: 'completed', label: 'Completed', icon: '✅' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => handleStatusFilterChange(tab.key)}
                    style={{
                      padding: '7px 16px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '700',
                      border: statusFilter === tab.key ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                      background: statusFilter === tab.key ? '#e0e7ff' : '#f8fafc',
                      color: statusFilter === tab.key ? '#3730a3' : '#475569',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Manager Assignee Filter Dropdown */}
              {isManager && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#475569' }}>
                    Filter by Assignee:
                  </span>
                  <select
                    value={assigneeFilter}
                    onChange={e => handleAssigneeFilterChange(e.target.value)}
                    style={{
                      fontSize: '13px',
                      padding: '6px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#0f172a',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="all">👥 All Team Tasks & Broadcasts</option>
                    <option value="all_employees">📢 Team Broadcasts (All Employees)</option>
                    {teamMembers.length > 0 && (
                      <optgroup label="👤 Individual Employees">
                        {teamMembers.map(m => (
                          <option key={m.email || m.name} value={m.email}>
                            {m.name} ({m.email})
                          </option>
                        ))}
                      </optgroup>
                    )}
                  </select>
                </div>
              )}

              {/* Search Bar */}
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  className="tm-input"
                  placeholder="Search tasks by title, description, assignee..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  style={{
                    background: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 18px',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    whiteSpace: 'nowrap'
                  }}
                >
                  <span>🔍</span> Search
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    style={{
                      background: '#f1f5f9',
                      color: '#64748b',
                      border: '1px solid #cbd5e1',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontWeight: '600',
                      fontSize: '13px',
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
                Loading tasks from database...
              </div>
            ) : tasks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                No tasks found. {isManager ? 'Assign a task to get started!' : 'No tasks assigned to you right now.'}
              </div>
            ) : (
              <div>
                {tasks.map(task => {
                  const taskId = task._id || task.id;
                  const badge = getPriorityBadge(task.priority);
                  const isCompleted = task.status === 'completed' || task.completed;
                  const statusBadge = getStatusBadge(task.status, task.completed);
                  const isTeamBroadcast = task.assignedTo?.id === 'all' || task.assignedTo?.name === 'All Employees' || task.assignedTo?.email === 'all@team.dev';
                  const isAssignedToMe = currentUser && task.assignedTo && (task.assignedTo.email === currentUser.email || task.assignedTo.id === currentUser.id);

                  return (
                    <div
                      key={taskId}
                      className={`tm-task-item ${isCompleted ? 'completed-locked' : (task.status === 'in_progress' ? 'in-progress-active' : 'pending-active')} ${task.isOptimistic ? 'optimistic' : ''}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '11px', fontFamily: 'monospace', color: '#64748b' }}>
                              ID: {taskId} {task.isOptimistic && '(Syncing...)'}
                            </span>

                            {/* Assignee Pill */}
                            {task.assignedTo?.name && (
                              <span style={{
                                fontSize: '11px',
                                fontWeight: '700',
                                padding: '3px 9px',
                                borderRadius: '6px',
                                background: isTeamBroadcast
                                  ? '#ede9fe'
                                  : (isAssignedToMe ? '#dbeafe' : '#f1f5f9'),
                                color: isTeamBroadcast
                                  ? '#5b21b6'
                                  : (isAssignedToMe ? '#1d4ed8' : '#334155'),
                                border: isTeamBroadcast
                                  ? '1px solid #c4b5fd'
                                  : (isAssignedToMe ? '1px solid #93c5fd' : '1px solid #cbd5e1'),
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                {isTeamBroadcast ? (
                                  <>📢 Assigned: <strong>All Employees (Entire Team)</strong></>
                                ) : (
                                  <>👤 Assigned to: <strong>{task.assignedTo.name}</strong> {isAssignedToMe && '(You)'}</>
                                )}
                              </span>
                            )}
                          </div>

                          <h4 style={{
                            margin: '6px 0 4px 0',
                            fontSize: '16px',
                            color: isCompleted ? '#475569' : '#0f172a',
                            textDecoration: isCompleted ? 'line-through' : 'none'
                          }}>
                            {task.title}
                          </h4>
                        </div>

                        {/* Action Controls & Workflow State Management */}
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {isCompleted ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                fontSize: '12px',
                                fontWeight: '800',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                background: '#dcfce7',
                                color: '#166534',
                                border: '1px solid #86efac'
                              }}>
                                🔒 COMPLETED
                              </span>
                              <button
                                onClick={() => handleStatusTransition(task, 'reopen')}
                                style={{
                                  background: '#fef3c7',
                                  color: '#92400e',
                                  border: '1px solid #fde68a',
                                  padding: '4px 9px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                                title="Reopen task and move back to Pending"
                              >
                                🔄 Reopen Task
                              </button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {task.status !== 'in_progress' && (
                                <button
                                  onClick={() => handleStatusTransition(task, 'in_progress')}
                                  style={{
                                    background: '#e0f2fe',
                                    color: '#0369a1',
                                    border: '1px solid #bae6fd',
                                    padding: '4px 10px',
                                    borderRadius: '6px',
                                    fontSize: '12px',
                                    fontWeight: '700',
                                    cursor: 'pointer'
                                  }}
                                >
                                  ⚡ Start Work
                                </button>
                              )}
                              <button
                                onClick={() => handleStatusTransition(task, 'completed')}
                                style={{
                                  background: '#dcfce7',
                                  color: '#166534',
                                  border: '1px solid #86efac',
                                  padding: '4px 10px',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  cursor: 'pointer'
                                }}
                              >
                                ✅ Mark Done
                              </button>
                            </div>
                          )}

                          {/* Download Task with Timestamp */}
                          <button
                            style={{ background: '#0284c7', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                            onClick={() => handleDownloadTask(task)}
                            title="Download task with timestamp"
                          >
                            📥 Download
                          </button>

                          {/* Manager Actions */}
                          {isManager && (
                            <>
                              <button
                                style={{ background: '#e0e7ff', color: '#4338ca', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                onClick={() => startEdit(task)}
                              >
                                Edit
                              </button>
                              <button
                                style={{ background: '#fef2f2', color: '#dc2626', border: 'none', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
                                onClick={() => setTaskToDelete(task)}
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Status & Priority Badges */}
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '2px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '9999px', background: statusBadge.bg, color: statusBadge.color }}>
                          {statusBadge.label}
                        </span>
                        <span style={{ fontSize: '11px', fontWeight: '700', padding: '3px 8px', borderRadius: '9999px', background: badge.bg, color: badge.color }}>
                          {badge.label}
                        </span>
                        {task.assignedBy?.name && (
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            Created by: <strong>{task.assignedBy.name}</strong>
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#475569', lineHeight: 1.4 }}>
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
      </div>
    </div>
  );
}

export default TaskManager;
