import React from 'react';

/**
 * Task component (task.jsx)
 * Renders an individual task item with toggle, edit, and delete functionality.
 */
function Task({ task, onToggle, onEdit, onDelete }) {
  if (!task) return null;

  return (
    <div 
      className={`task-card ${task.completed ? 'completed' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        padding: '1.25rem',
        borderRadius: '12px',
        backgroundColor: task.completed ? 'rgba(16, 185, 129, 0.05)' : 'rgba(30, 41, 59, 0.6)',
        border: `1px solid ${task.completed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.1)'}`,
        backdropFilter: 'blur(8px)',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span 
            style={{
              fontSize: '0.75rem',
              fontWeight: '700',
              padding: '0.2rem 0.6rem',
              borderRadius: '9999px',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}
          >
            #{task.id}
          </span>
          <h3 
            style={{ 
              margin: 0, 
              fontSize: '1.1rem', 
              color: '#f8fafc',
              textDecoration: task.completed ? 'line-through' : 'none',
              opacity: task.completed ? 0.75 : 1
            }}
          >
            {task.title}
          </h3>
        </div>

        <span 
          style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            padding: '0.25rem 0.75rem',
            borderRadius: '9999px',
            backgroundColor: task.completed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
            color: task.completed ? '#34d399' : '#fbbf24',
            border: `1px solid ${task.completed ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`
          }}
        >
          {task.completed ? '✓ Completed' : '⏳ Pending'}
        </span>
      </div>

      {task.description && (
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', lineHeight: '1.5' }}>
          {task.description}
        </p>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button
          onClick={() => onToggle && onToggle(task)}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.825rem',
            fontWeight: '600',
            cursor: 'pointer',
            backgroundColor: task.completed ? 'rgba(148, 163, 184, 0.2)' : 'rgba(16, 185, 129, 0.2)',
            color: task.completed ? '#cbd5e1' : '#34d399',
            transition: 'all 0.2s ease'
          }}
        >
          {task.completed ? 'Mark Pending' : 'Mark Complete'}
        </button>

        {onEdit && (
          <button
            onClick={() => onEdit(task)}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '6px',
              border: 'none',
              fontSize: '0.825rem',
              fontWeight: '600',
              cursor: 'pointer',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              color: '#60a5fa',
              transition: 'all 0.2s ease'
            }}
          >
            Edit
          </button>
        )}

        <button
          onClick={() => onDelete && onDelete(task.id)}
          style={{
            padding: '0.4rem 0.8rem',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.825rem',
            fontWeight: '600',
            cursor: 'pointer',
            backgroundColor: 'rgba(239, 68, 68, 0.2)',
            color: '#f87171',
            transition: 'all 0.2s ease'
          }}
        >
          Delete Task
        </button>
      </div>
    </div>
  );
}

export default Task;
export { Task };
