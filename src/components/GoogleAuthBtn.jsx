import React, { useState, useEffect } from 'react';
import { GoogleLogin, googleLogout } from '@react-oauth/google';

const API_BASE = 'http://localhost:5000';

function GoogleAuthBtn() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('auth_user');
      }
    }
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

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      // Save token and profile
      localStorage.setItem('auth_token', data.token);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      setUser(data.user);
    } catch (err) {
      console.error('Google Auth Error:', err);
      setAuthError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    googleLogout();
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  if (user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              border: '2px solid #4f46e5',
              objectFit: 'cover'
            }}
          />
        ) : (
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: '#4f46e5',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '14px'
            }}
          >
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>
            {user.name}
          </span>
          <span style={{ fontSize: '11px', color: '#64748b' }}>
            {user.email}
          </span>
        </div>
        <button
          onClick={handleLogout}
          style={{
            background: '#f1f5f9',
            color: '#dc2626',
            border: '1px solid #fecaca',
            padding: '5px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            marginLeft: '4px'
          }}
          title="Sign out from Google Account"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {loading ? (
        <span style={{ fontSize: '13px', color: '#64748b' }}>Verifying...</span>
      ) : (
        <GoogleLogin
          onSuccess={handleLoginSuccess}
          onError={() => setAuthError('Google Sign-In Failed')}
          shape="pill"
          theme="outline"
          size="medium"
          text="signin_with"
        />
      )}
      {authError && (
        <span style={{ fontSize: '11px', color: '#ef4444' }}>{authError}</span>
      )}
    </div>
  );
}

export default GoogleAuthBtn;
