import React, { useState, useEffect } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';

const API_BASE = 'http://localhost:5000';

/**
 * AuthGate
 *
 * Wraps the Task Manager with a premium authentication layer.
 * If the user is not signed in via Google, shows a beautiful login splash.
 * After successful Google auth, renders the protected children (Task Manager).
 *
 * Props:
 *  - children: React node (the TaskManager component)
 *  - onAuthChange: optional callback(user | null) to notify parent on login/logout
 */
function AuthGate({ children, onAuthChange }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Rehydrate session from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
        if (onAuthChange) onAuthChange(parsed);
      } catch {
        localStorage.removeItem('auth_user');
      }
    }
    // Small delay so the entrance animation plays
    setTimeout(() => setMounted(true), 50);
  }, []);

  const handleLoginSuccess = async (credentialResponse) => {
    setLoading(true);
    setAuthError(null);
    try {
      const res = await fetch(`${API_BASE}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Authentication failed');

      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      setUser(data.user);
      if (onAuthChange) onAuthChange(data.user);
    } catch (err) {
      setAuthError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    if (onAuthChange) onAuthChange(null);
  };

  // ── If authenticated, render children with a logout control ──
  if (user) {
    return (
      <div style={{ width: '100%' }}>
        {/* Slim user bar at the top of the Task Manager */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 20px',
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%)',
          borderRadius: '14px',
          border: '1px solid #c7d2fe',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#10b981', boxShadow: '0 0 8px #10b981'
            }} />
            <span style={{ fontSize: '13px', fontWeight: '600', color: '#3730a3' }}>
              🔐 Authenticated Session
            </span>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid #6366f1', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: '#4f46e5', color: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '12px'
              }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{user.name}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>{user.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              fontSize: '11px', background: '#dcfce7', color: '#166534',
              padding: '3px 10px', borderRadius: '9999px', fontWeight: '600'
            }}>
              ✅ Your private tasks — visible only to you
            </span>
            <button
              onClick={handleLogout}
              style={{
                background: '#fef2f2', color: '#dc2626',
                border: '1px solid #fecaca',
                padding: '5px 14px', borderRadius: '8px',
                fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                transition: 'background 0.2s'
              }}
              onMouseOver={e => e.target.style.background = '#fee2e2'}
              onMouseOut={e => e.target.style.background = '#fef2f2'}
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Protected content */}
        {children}
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
          padding: 52px 48px;
          max-width: 520px;
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
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          border-radius: 22px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 28px auto;
          font-size: 36px;
          box-shadow: 0 8px 24px rgba(79, 70, 229, 0.35);
          animation: ag-float 3s ease-in-out infinite;
        }

        @keyframes ag-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        .ag-gate-title {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          margin: 0 0 12px 0;
          letter-spacing: -0.5px;
        }

        .ag-gate-subtitle {
          font-size: 15px;
          color: #64748b;
          line-height: 1.6;
          margin: 0 0 32px 0;
        }

        .ag-features {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 36px;
          text-align: left;
        }

        .ag-feature-row {
          display: flex;
          align-items: center;
          gap: 10px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 10px 14px;
          font-size: 13px;
          color: #334155;
          font-weight: 500;
        }

        .ag-feature-icon {
          font-size: 18px;
          width: 30px;
          text-align: center;
          flex-shrink: 0;
        }

        .ag-google-wrapper {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
          transform: scale(1.08);
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

        .ag-loading-text {
          font-size: 14px;
          color: #6366f1;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .ag-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid #c7d2fe;
          border-top-color: #4f46e5;
          border-radius: 50%;
          animation: ag-spin 0.7s linear infinite;
        }

        @keyframes ag-spin {
          to { transform: rotate(360deg); }
        }

        .ag-footer-note {
          margin-top: 24px;
          font-size: 12px;
          color: #94a3b8;
          line-height: 1.5;
        }

        .ag-divider {
          border: none;
          border-top: 1px solid #f1f5f9;
          margin: 28px 0;
        }
      `}</style>

      <div className="ag-gate-wrapper">
        <div className="ag-gate-card">
          {/* Lock Icon */}
          <div className="ag-lock-icon">🔐</div>

          <h2 className="ag-gate-title">Sign in to Task Manager</h2>
          <p className="ag-gate-subtitle">
            Your personal task workspace is protected.<br />
            Sign in with Google to access your private tasks.
          </p>

          {/* Feature Highlights */}
          <div className="ag-features">
            <div className="ag-feature-row">
              <span className="ag-feature-icon">👤</span>
              <span><strong>User-wise isolation</strong> — your tasks are private and only visible to you</span>
            </div>
            <div className="ag-feature-row">
              <span className="ag-feature-icon">📥</span>
              <span><strong>Per-task download</strong> — export any task as JSON with a download timestamp</span>
            </div>
            <div className="ag-feature-row">
              <span className="ag-feature-icon">🍃</span>
              <span><strong>MongoDB persistence</strong> — your data survives page refreshes</span>
            </div>
            <div className="ag-feature-row">
              <span className="ag-feature-icon">⚡</span>
              <span><strong>Optimistic UI</strong> — instant feedback before server confirmation</span>
            </div>
          </div>

          <hr className="ag-divider" />

          {/* Google Sign-In Button */}
          {loading ? (
            <div className="ag-loading-text">
              <span className="ag-spinner" />
              Verifying your Google account...
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
                width="300"
              />
            </div>
          )}

          {authError && (
            <div className="ag-error">
              ⚠️ {authError}
            </div>
          )}

          <p className="ag-footer-note">
            🔒 We only use your Google profile (name, email, avatar) to identify your session.<br />
            No passwords are stored. Session is secured with JWT.
          </p>
        </div>
      </div>
    </>
  );
}

export default AuthGate;
