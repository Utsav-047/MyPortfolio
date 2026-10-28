import React, { useState, useEffect } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';
import { updateUserRole } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const ADMIN_EMAILS = ['utsavpatel788190@gmail.com', '24aiml047@charusat.edu.in'];
const ADMIN_SECURITY_PIN = 'utsav2026';

/**
 * AuthGate
 *
 * Professional, role-aware security gateway for Task Manager.
 * Restricts Manager/Admin privileges to verified admins or users with the Admin Passkey.
 * General visitors authenticate as Employee to safely explore the workspace.
 */
function AuthGate({ children, onAuthChange }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [selectedRole, setSelectedRole] = useState('employee'); // Default: safe employee role
  const [switchingRole, setSwitchingRole] = useState(false);

  // Admin Security Passcode States
  const [adminPinInput, setAdminPinInput] = useState('');
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinModalError, setPinModalError] = useState(null);
  const [modalPinInput, setModalPinInput] = useState('');

  // Rehydrate session from localStorage on mount & listen to 401 events
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (!parsed.role) parsed.role = 'employee';
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
      setAuthError('Your session has expired. Please authenticate with Google again.');
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
      // Determine requested role with admin authorization checks
      let requestedRole = selectedRole;
      if (selectedRole === 'manager') {
        const hasValidPin = adminPinInput.trim() === ADMIN_SECURITY_PIN;
        if (!hasValidPin) {
          // Will verify if user's Google email matches ADMIN_EMAILS below
        }
      }

      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: credentialResponse.credential,
          role: requestedRole
        })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      const userEmail = (data.user?.email || '').toLowerCase();
      const isDesignatedAdmin = ADMIN_EMAILS.includes(userEmail);

      // Enforce Admin Verification
      let finalRole = 'employee';
      if (isDesignatedAdmin) {
        finalRole = 'manager';
      } else if (selectedRole === 'manager' && adminPinInput.trim() === ADMIN_SECURITY_PIN) {
        finalRole = 'manager';
      } else {
        finalRole = 'employee';
      }

      const userData = { ...data.user, role: finalRole };
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

  const handleToggleRoleClick = () => {
    if (!user) return;
    const isCurrentlyManager = (user.role || 'employee') === 'manager';

    if (isCurrentlyManager) {
      // Direct downgrade to employee without verification
      performRoleSwitch('employee');
    } else {
      // Upgrading to manager requires admin verification
      const userEmail = (user.email || '').toLowerCase();
      if (ADMIN_EMAILS.includes(userEmail)) {
        // Designated admin bypasses PIN prompt
        performRoleSwitch('manager');
      } else {
        // Ask for Admin Security PIN
        setPinModalError(null);
        setModalPinInput('');
        setShowPinModal(true);
      }
    }
  };

  const handleModalPinSubmit = (e) => {
    e.preventDefault();
    if (modalPinInput.trim() === ADMIN_SECURITY_PIN) {
      setShowPinModal(false);
      performRoleSwitch('manager');
    } else {
      setPinModalError('Invalid Admin Passcode. Access denied.');
    }
  };

  const performRoleSwitch = async (newRole) => {
    setSwitchingRole(true);
    try {
      await updateUserRole(newRole);
      const updatedUser = { ...user, role: newRole };
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      if (onAuthChange) onAuthChange(updatedUser);
      window.dispatchEvent(new CustomEvent('role_changed', { detail: newRole }));
    } catch (e) {
      console.error('Failed to switch role on backend:', e);
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

  // ── Authenticated User State ──
  if (user) {
    const isManager = (user.role || 'employee') === 'manager';

    return (
      <div style={{ width: '100%' }}>
        {/* User Workspace Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          marginBottom: '18px',
          background: isManager ? '#f8fafc' : '#ffffff',
          borderRadius: '14px',
          border: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          gap: '12px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}>
          {/* User Profile Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                style={{
                  width: '34px', height: '34px', borderRadius: '50%',
                  border: '1.5px solid #cbd5e1', objectFit: 'cover'
                }}
              />
            ) : (
              <div style={{
                width: '34px', height: '34px', borderRadius: '50%',
                background: isManager ? '#4f46e5' : '#059669',
                color: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '13px'
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}

            <div style={{ lineHeight: 1.3 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#0f172a' }}>
                  {user.name}
                </span>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                  letterSpacing: '0.4px',
                  padding: '3px 9px',
                  borderRadius: '6px',
                  background: isManager ? '#ede9fe' : '#ecfdf5',
                  color: isManager ? '#5b21b6' : '#065f46',
                  border: `1px solid ${isManager ? '#c4b5fd' : '#a7f3d0'}`,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px'
                }}>
                  {isManager ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  )}
                  {isManager ? 'Manager (Admin)' : 'Team Member (Employee)'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>{user.email}</div>
            </div>
          </div>

          {/* Action Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleToggleRoleClick}
              disabled={switchingRole}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#f8fafc',
                color: '#334155',
                border: '1px solid #cbd5e1',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              title={isManager ? 'Switch to Employee Mode' : 'Verify Admin PIN to switch to Manager Mode'}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
              {switchingRole ? 'Switching...' : (isManager ? 'Switch to Employee View' : 'Admin / Manager Unlock')}
            </button>

            <button
              onClick={handleLogout}
              style={{
                background: '#ffffff',
                color: '#dc2626',
                border: '1px solid #fca5a5',
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.15s'
              }}
              onMouseOver={e => e.target.style.background = '#fef2f2'}
              onMouseOut={e => e.target.style.background = '#ffffff'}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Modal: Admin Passcode Verification Dialog */}
        {showPinModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '28px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: '#ede9fe', color: '#6d28d9',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#0f172a' }}>
                    Admin Verification
                  </h3>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Manager privileges require security passkey
                  </div>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, margin: '0 0 16px 0' }}>
                Manager mode allows assigning tasks, editing team deliverables, and managing project workflows. Please enter your Admin Passcode to unlock:
              </p>

              <form onSubmit={handleModalPinSubmit}>
                <input
                  type="password"
                  placeholder="Enter Admin Passcode"
                  value={modalPinInput}
                  onChange={e => setModalPinInput(e.target.value)}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '14px',
                    boxSizing: 'border-box',
                    marginBottom: '10px'
                  }}
                />

                {pinModalError && (
                  <div style={{ color: '#dc2626', fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>
                    ⚠️ {pinModalError}
                  </div>
                )}

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    style={{
                      background: '#f1f5f9',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      background: '#4f46e5',
                      border: 'none',
                      color: '#ffffff',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    Verify & Unlock
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Render Task Manager */}
        {React.cloneElement(children, { userRole: user.role || 'employee', currentUser: user })}
      </div>
    );
  }

  // ── Auth Gate Sign-In Screen ──
  return (
    <>
      <style>{`
        .ag-gate-wrapper {
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
        }

        .ag-gate-card {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 38px 36px;
          max-width: 520px;
          width: 100%;
          text-align: center;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.04);
          opacity: ${mounted ? 1 : 0};
          transform: ${mounted ? 'translateY(0)' : 'translateY(16px)'};
          transition: opacity 0.4s ease, transform 0.4s ease;
        }

        .ag-lock-icon {
          width: 56px;
          height: 56px;
          background: #ede9fe;
          border: 1px solid #ddd6fe;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 18px auto;
          color: #4f46e5;
        }

        .ag-gate-title {
          font-size: 24px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 6px 0;
          letter-spacing: -0.4px;
        }

        .ag-gate-subtitle {
          font-size: 13.5px;
          color: #64748b;
          line-height: 1.5;
          margin: 0 0 22px 0;
        }

        .ag-role-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 18px;
        }

        .ag-role-card {
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          padding: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-align: left;
          background: #f8fafc;
        }

        .ag-role-card.active-employee {
          border-color: #059669;
          background: #f0fdf4;
        }

        .ag-role-card.active-manager {
          border-color: #4f46e5;
          background: #f5f3ff;
        }

        .ag-role-header {
          font-size: 13.5px;
          font-weight: 700;
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .ag-role-desc {
          font-size: 11.5px;
          color: #64748b;
          line-height: 1.4;
        }

        .ag-google-wrapper {
          display: flex;
          justify-content: center;
          margin: 16px 0 10px 0;
        }

        .ag-error {
          margin-top: 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px;
          color: #dc2626;
          font-weight: 500;
        }
      `}</style>

      <div className="ag-gate-wrapper">
        <div className="ag-gate-card">
          <div className="ag-lock-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h2 className="ag-gate-title">Workspace Authentication</h2>
          <p className="ag-gate-subtitle">
            Secure single sign-on with Google OAuth 2.0 to access the Task Management Workspace.
          </p>

          {/* Role Selection */}
          <div className="ag-role-selector">
            <div
              className={`ag-role-card ${selectedRole === 'employee' ? 'active-employee' : ''}`}
              onClick={() => setSelectedRole('employee')}
            >
              <div className="ag-role-header" style={{ color: '#047857' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Employee
              </div>
              <div className="ag-role-desc">
                Standard team workspace to view assigned tasks and report progress.
              </div>
            </div>

            <div
              className={`ag-role-card ${selectedRole === 'manager' ? 'active-manager' : ''}`}
              onClick={() => setSelectedRole('manager')}
            >
              <div className="ag-role-header" style={{ color: '#4338ca' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Manager (Admin)
              </div>
              <div className="ag-role-desc">
                Protected admin role to create, assign, and supervise team workflows.
              </div>
            </div>
          </div>

          {/* Admin Passcode Input if Manager is selected */}
          {selectedRole === 'manager' && (
            <div style={{
              background: '#f8fafc',
              border: '1px solid #cbd5e1',
              borderRadius: '10px',
              padding: '12px 14px',
              marginBottom: '16px',
              textAlign: 'left'
            }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>
                Admin Security Passcode (Required for Manager Mode)
              </label>
              <input
                type="password"
                placeholder="Enter Admin Passcode"
                value={adminPinInput}
                onChange={e => setAdminPinInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
              />
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '5px' }}>
                Restricted to authorized project admins. Or sign in with verified admin Google account.
              </div>
            </div>
          )}

          {/* Role Confirmation Prompt */}
          <div style={{ marginBottom: '10px', fontSize: '13px', fontWeight: '600', color: '#475569' }}>
            Continue with Google OAuth as <span style={{ color: selectedRole === 'manager' ? '#4f46e5' : '#059669', textTransform: 'capitalize', fontWeight: '700' }}>{selectedRole === 'manager' ? 'Manager (Admin)' : 'Employee'}</span>
          </div>

          {/* Google Sign-In */}
          {loading ? (
            <div style={{ padding: '12px', color: '#4f46e5', fontWeight: 600, fontSize: '13px' }}>
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
