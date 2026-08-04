import React, { useState, useEffect, useCallback } from 'react';
import Task from './task.jsx';

const API_BASE = 'http://localhost:5000';

/**
 * Todo component (todo.jsx)
 * Array-based Task Manager with submission and deletion popups/notifications.
 */
function Todo() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Notification Popup State
  const [popup, setPopup] = useState(null); // { type: 'submit' | 'delete' | 'info', title: string, message: string }

  // Show auto-expiring popup notification
  const triggerPopup = (type, titleText, messageText) => {
    setPopup({ type, title: titleText, message: messageText });
    setTimeout(() => {
      setPopup(null);
    }, 4000);
  };

  // ── Fetch tasks stored in Array on server ─────────────────
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/tasks`);
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setTasks(data.data);
      }
    } catch (err) {
      console.error('Error fetching tasks array:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // ── Submit Data (Create or Update) ─────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!title.trim()) {
      setErrorMsg('Task title is required');
      return;
    }

    try {
      if (editingTask) {
        // PUT request
        const res = await fetch(`${API_BASE}/api/tasks/${editingTask.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            completed: editingTask.completed
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update task');

        // Show Submission Popup
        triggerPopup(
          'submit',
          '🔔 Notification on Server & Client',
          data.message || 'Your data is submitted'
        );

        setEditingTask(null);
      } else {
        // POST request
        const res = await fetch(`${API_BASE}/api/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: title.trim(),
            description: description.trim(),
            completed: false
          })
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to create task');

        // Show Submission Popup
        triggerPopup(
          'submit',
          '🔔 Notification on Server & Client',
          data.message || 'Your data is submitted'
        );
      }

      setTitle('');
      setDescription('');
      fetchTasks();
    } catch (err) {
      setErrorMsg(err.message || 'Something went wrong');
    }
  };

  // ── Delete Task ───────────────────────────────────────────
  const handleDelete = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${id}`, {
        method: 'DELETE'
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete task');

      // Show Deletion Popup Notification
      triggerPopup(
        'delete',
        '🚨 Notification on Server & Client',
        data.message || 'Data deleted'
      );

      fetchTasks();
    } catch (err) {
      setErrorMsg(err.message || 'Could not delete task');
    }
  };

  // ── Toggle Completion Status ──────────────────────────────
  const handleToggle = async (task) => {
    try {
      const res = await fetch(`${API_BASE}/api/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed })
      });
      const data = await res.json();
      if (res.ok && data.message) {
        triggerPopup('info', 'Task Updated', `Task status changed to ${!task.completed ? 'Completed' : 'Pending'}`);
      }
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Edit Task Click Handler ──────────────────────────────
  const handleEditInit = (task) => {
    setEditingTask(task);
    setTitle(task.title);
    setDescription(task.description || '');
  };

  const cancelEdit = () => {
    setEditingTask(null);
    setTitle('');
    setDescription('');
    setErrorMsg('');
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '1.5rem', color: '#f8fafc' }}>
      
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
            backgroundColor: popup.type === 'delete' ? 'rgba(220, 38, 38, 0.95)' : popup.type === 'submit' ? 'rgba(16, 185, 129, 0.95)' : 'rgba(59, 130, 246, 0.95)',
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
              style={{
                background: 'none',
                border: 'none',
                color: '#fff',
                fontSize: '1.2rem',
                cursor: 'pointer',
                opacity: 0.8
              }}
            >
              &times;
            </button>
          </div>
          <p style={{ margin: '0.4rem 0 0 0', fontSize: '0.95rem', fontWeight: '500' }}>
            {popup.message}
          </p>
        </div>
      )}

      {/* Header Banner */}
      <div 
        style={{ 
          marginBottom: '2rem', 
          textAlign: 'center',
          padding: '1.5rem',
          background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(15, 23, 42, 0.9))',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <h2 style={{ fontSize: '1.8rem', margin: '0 0 0.5rem 0', color: '#38bdf8' }}>
          📝 Array-Based Todo Task Manager
        </h2>
        <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
          Data is stored in-memory server JS Array (not in CSV). Server & Client popup notifications trigger on Submission & Deletion.
        </p>
      </div>

      {/* Task Input Form */}
      <form 
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1.5rem',
          backgroundColor: 'rgba(30, 41, 59, 0.7)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: '2rem'
        }}
      >
        <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#f1f5f9' }}>
          {editingTask ? `✏️ Edit Task #${editingTask.id}` : '➕ Add New Task'}
        </h3>

        {errorMsg && (
          <div style={{ padding: '0.75rem', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', fontSize: '0.9rem' }}>
            {errorMsg}
          </div>
        )}

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>
            Task Title *
          </label>
          <input
            type="text"
            placeholder="Enter task title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              color: '#f8fafc',
              fontSize: '0.95rem',
              outline: 'none'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>
            Description (Optional)
          </label>
          <textarea
            placeholder="Enter task details..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              backgroundColor: 'rgba(15, 23, 42, 0.8)',
              color: '#f8fafc',
              fontSize: '0.95rem',
              outline: 'none',
              resize: 'vertical'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
          {editingTask && (
            <button
              type="button"
              onClick={cancelEdit}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: 'rgba(148, 163, 184, 0.2)',
                color: '#cbd5e1',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            style={{
              padding: '0.6rem 1.4rem',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.95rem',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
          >
            {editingTask ? 'Submit Updated Data' : 'Submit Task Data'}
          </button>
        </div>
      </form>

      {/* Task List Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#f1f5f9' }}>
            📋 Current Tasks Array ({tasks.length})
          </h3>
          <button
            onClick={fetchTasks}
            style={{
              background: 'none',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#38bdf8',
              padding: '0.35rem 0.75rem',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.85rem'
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>Loading tasks array from server...</p>
        ) : tasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'rgba(30, 41, 59, 0.4)', borderRadius: '12px', border: '1px border-dashed rgba(255, 255, 255, 0.1)', color: '#94a3b8' }}>
            No tasks found in array. Add your first task above!
          </div>
        ) : (
          tasks.map((t) => (
            <Task
              key={t.id}
              task={t}
              onToggle={handleToggle}
              onEdit={handleEditInit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Todo;
export { Todo };
