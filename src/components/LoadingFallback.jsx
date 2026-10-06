import React from 'react';

export default function LoadingFallback({ title = "Loading page chunk...", subtitle = "Code splitting in action" }) {
  return (
    <div className="container" style={{ padding: '3rem 0' }}>
      <div className="glass-card loading-fallback-container">
        <div className="loading-spinner-ring" aria-label="Loading indicator" />
        <div style={{ textAlign: 'center' }}>
          <p className="loading-pulse-text">{title}</p>
          <p className="loading-subtext" style={{ marginTop: '0.5rem' }}>
            ⚡ {subtitle}
          </p>
        </div>

        {/* Skeleton Preview */}
        <div style={{ width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <div className="skeleton-box" style={{ height: '24px', width: '70%', margin: '0 auto' }}></div>
          <div className="skeleton-box" style={{ height: '14px', width: '90%', margin: '0 auto' }}></div>
          <div className="skeleton-box" style={{ height: '14px', width: '80%', margin: '0 auto' }}></div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginTop: '0.5rem' }}>
            <div className="skeleton-box" style={{ height: '60px' }}></div>
            <div className="skeleton-box" style={{ height: '60px' }}></div>
            <div className="skeleton-box" style={{ height: '60px' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
