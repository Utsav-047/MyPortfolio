import React, { useState, useEffect } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { updateUserRole } from '../services/api';

const API_BASE = 'http://localhost:5000';

/**
 * AuthGate
 *
 * Wraps the Task Manager with a role-aware authentication layer.
 * Supports Manager & Employee roles, live role switching, Google Auth,
 * and demo credentials for evaluation.
 */
function AuthGate({ children, onAuthChange }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [selectedRole, setSelectedRole] = useState('manager'); // 'manager' | 'employee'
  const [switchingRole, setSwitchingRole] = useState(false);

  // Rehydrate session from localStorage on mount & listen to 401 events
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (!parsed.role) parsed.role = 'manager';
        setUser(parsed);
        if (onAuthChange) onAuthChange(parsed);
      } catch {
        localStorage.removeItem('auth_user');
      }
    }

    const handleUnauthorized = () => {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      setUser(null);
      if (onAuthChange) onAuthChange(null);
      setAuthError('Your session has expired or the token was invalid. Please sign in again.');
    };

    window.addEventListener('auth_unauthorized', handleUnauthorized);
    setTimeout(() => setMounted(true), 50);

    return () => {
      window.removeEventListener('auth_unauthorized', handleUnauthorized);
    };
  }, []);

  const handleLoginSuccess = async (credentialResponse) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          role: selectedRole
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      const userData = { ...data.user, role: data.user.role || selectedRole };
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      setUser(userData);
      if (onAuthChange) onAuthChange(userData);
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (roleToUse) => {
    setLoading(true);
    setAuthError(null);
    try {
      const email = roleToUse === 'manager' ? 'utsavpatel788190@gmail.com' : 'rahul.sharma@company.dev';
      const name = roleToUse === 'manager' ? 'Utsav Patel (Manager)' : 'Rahul Sharma (Employee)';

      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password: 'Password123!',
          role: roleToUse
        })
      });
      let data = await res.json();

      if (!res.ok) {
        // If already exists, login
        const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password: 'Password123!'
          })
        });
        data = await loginRes.json();
        if (!loginRes.ok) throw new Error(data.message || 'Demo sign in failed');
      }

      const userData = { ...data.user, role: roleToUse };
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      setUser(userData);
      if (onAuthChange) onAuthChange(userData);
    } catch (err) {
      setAuthError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async () => {
    if (!user) return;
    const newRole = user.role === 'manager' ? 'employee' : 'manager';
    setSwitchingRole(true);
    try {
      await updateUserRole(newRole);
      const updatedUser = { ...user, role: newRole };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      if (onAuthChange) onAuthChange(updatedUser);
      // Notify components to re-fetch tasks with new role
      window.dispatchEvent(new CustomEvent('role_changed', { detail: newRole }));
    } catch (e) {
      console.error('Failed to switch role on backend:', e);
      // Fallback update locally
      const updatedUser = { ...user, role: newRole };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      if (onAuthChange) onAuthChange(updatedUser);
      window.dispatchEvent(new CustomEvent('role_changed', { detail: newRole }));
    } finally {
      setSwitchingRole(false);
    }
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    if (onAuthChange) onAuthChange(null);
  };

  // ── If authenticated, render children with role session banner & role switcher ──
  if (user) {
    const isManager = (user.role || 'manager') === 'manager';

    return (
      <div style={{ width: '100%' }}>
        {/* User bar with active Role Badge and Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          marginBottom: '18px',
          background: isManager
            ? 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)'
            : 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          borderRadius: '16px',
          border: `1.5px solid ${isManager ? '#c7d2fe' : '#bbf7d0'}`,
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          {/* User Info & Role Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              background: '#10b981', boxShadow: '0 0 8px #10b981'
            }} />
            
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  border: `2px solid ${isManager ? '#6366f1' : '#10b981'}`,
                  objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: isManager ? '#4f46e5' : '#059669',
                color: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '14px'
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}

            <div style={{ lineHeight: 1.3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '800', color: '#0f172a' }}>
                  {user.name}
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  padding: '3px 9px',
                  borderRadius: '9999px',
                  background: isManager ? '#4338ca' : '#047857',
                  color: '#ffffff',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                }}>
                  {isManager ? '👑 Manager Role' : '💼 Employee Role'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</div>
            </div>
          </div>

          {/* Role Switcher & Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleToggleRole}
              disabled={switchingRole}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: isManager ? '#ede9fe' : '#e0e7ff',
                color: isManager ? '#5b21b6' : '#3730a3',
                border: `1px solid ${isManager ? '#c4b5fd' : '#c7d2fe'}`,
                padding: '7px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title="Toggle role between Manager (assigner) and Employee (assigned tasks)"
            >
              🔄 {switchingRole ? 'Switching...' : (isManager ? 'Switch to Employee Mode' : 'Switch to Manager Mode')}
            </button>

            <button
              onClick={handleLogout}
              style={{
                background: '#fef2f2',
                color: '#dc2626',
                border: '1px solid #fecaca',
                padding: '7px 14px',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={e => e.target.style.background = '#fee2e2'}
              onMouseOut={e => e.target.style.background = '#fef2f2'}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Render Task Manager */}
        {React.cloneElement(children, { userRole: user.role || 'manager', currentUser: user })}
      </div>
    );
  }

  // ── Auth Gate Splash Screen ──
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');

        .ag-gate-wrapper {
          font-family: 'Inter', sans-serif;
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .ag-gate-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          padding: 44px 40px;
          max-width: 560px;
          width: 100%;
          text-align: center;
          box-shadow:
            0 4px 6px -1px rgba(79, 70, 229, 0.06),
            0 20px 40px -10px rgba(79, 70, 229, 0.12);
          opacity: ${mounted ? 1 : 0};
          transform: ${mounted ? 'translateY(0)' : 'translateY(20px)'};
          transition: opacity 0.5s ease, transform 0.5s ease;
        }

        .ag-lock-icon {
          width: 72px;
          height: 72px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px auto;
          font-size: 32px;
          box-shadow: 0 8px 24px rgba(79, 70, 229, 0.35);
        }

        .ag-gate-title {
          font-size: 26px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 8px 0;
          letter-spacing: -0.5px;
        }

        .ag-gate-subtitle {
          font-size: 14px;
          color: #64748b;
          line-height: 1.5;
          margin: 0 0 24px 0;
        }

        .ag-role-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        .ag-role-card {
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          padding: 14px;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }

        .ag-role-card.active-manager {
          border-color: #4f46e5;
          background: #f5f3ff;
        }

        .ag-role-card.active-employee {
          border-color: #10b981;
          background: #f0fdf4;
        }

        .ag-role-header {
          font-size: 14px;
          font-weight: 800;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .ag-role-desc {
          font-size: 12px;
          color: #64748b;
          line-height: 1.4;
        }

        .ag-demo-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 20px;
        }

        .ag-demo-btn {
          border: none;
          padding: 11px 14px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s, box-shadow 0.15s;
        }

        .ag-demo-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .ag-demo-mgr {
          background: #4f46e5;
          color: #ffffff;
        }

        .ag-demo-emp {
          background: #059669;
          color: #ffffff;
        }

        .ag-divider-or {
          display: flex;
          align-items: center;
          text-align: center;
          color: #94a3b8;
          font-size: 12px;
          margin: 18px 0;
        }

        .ag-divider-or::before, .ag-divider-or::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid #e2e8f0;
        }

        .ag-divider-or:not(:empty)::before { margin-right: .5em; }
        .ag-divider-or:not(:empty)::after { margin-left: .5em; }

        .ag-google-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 12px;
          transform: scale(1.05);
          transform-origin: center;
        }

        .ag-error {
          margin-top: 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 13px;
          color: #dc2626;
          font-weight: 500;
        }
      `}</style>

      <div className="ag-gate-wrapper">
        <div className="ag-gate-card">
          <div className="ag-lock-icon">🔐</div>

          <h2 className="ag-gate-title">Role-Based Task Manager</h2>
          <p className="ag-gate-subtitle">
            Sign in as a <strong>Manager</strong> to assign tasks to your team, or as an <strong>Employee</strong> to track and complete your assigned work.
          </p>

          {/* Role Selection Tabs */}
          <div className="ag-role-selector">
            <div
              className={`ag-role-card ${selectedRole === 'manager' ? 'active-manager' : ''}`}
              onClick={() => setSelectedRole('manager')}
            >
              <div className="ag-role-header" style={{ color: '#4338ca' }}>
                👑 Manager
              </div>
              <div className="ag-role-desc">
                Assign tasks to employees, monitor team progress, edit & reassign work.
              </div>
            </div>

            <div
              className={`ag-role-card ${selectedRole === 'employee' ? 'active-employee' : ''}`}
              onClick={() => setSelectedRole('employee')}
            >
              <div className="ag-role-header" style={{ color: '#047857' }}>
                💼 Employee
              </div>
              <div className="ag-role-desc">
                View your assigned tasks, update progress, mark completed.
              </div>
            </div>
          </div>

          {/* Quick Demo Logins */}
          <div className="ag-demo-grid">
            <button
              className="ag-demo-btn ag-demo-mgr"
              onClick={() => handleDemoLogin('manager')}
              disabled={loading}
            >
              👑 Demo as Manager
            </button>
            <button
              className="ag-demo-btn ag-demo-emp"
              onClick={() => handleDemoLogin('employee')}
              disabled={loading}
            >
              💼 Demo as Employee
            </button>
          </div>

          <div className="ag-divider-or">or sign in with Google ({selectedRole.toUpperCase()})</div>

          {/* Google Sign-In */}
          {loading ? (
            <div style={{ padding: '10px', color: '#6366f1', fontWeight: 600, fontSize: '13px' }}>
              Authenticating session...
            </div>
          ) : (
            <div className="ag-google-wrapper">
              <GoogleLogin
                onSuccess={handleLoginSuccess}
                onError={() => setAuthError('Google Sign-In failed. Please try again.')}
                shape="pill"
                theme="filled_blue"
                size="large"
                text="signin_with"
                width="280"
              />
            </div>
          )}

          {authError && (
            <div className="ag-error">
              ⚠️ {authError}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default AuthGate;
