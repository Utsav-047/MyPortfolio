import React from 'react';

/**
 * Authentic, professional engineering brand mark for Utsav Patel.
 * Combines a sleek precision emblem with clean, high-contrast typography.
 */
function BrandLogo({ size = 'medium', color = 'var(--theme-color)' }) {
  const iconDimensions = size === 'large' ? 36 : size === 'small' ? 24 : 30;
  const fontSize = size === 'large' ? '19px' : size === 'small' ? '14px' : '16px';

  return (
    <div className="brand-logo-container" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
      {/* Precision Geometric Vector Brand Mark */}
      <div 
        className="brand-logo-emblem"
        style={{
          width: iconDimensions,
          height: iconDimensions,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
          flexShrink: 0
        }}
      >
        <svg 
          width={iconDimensions * 0.62} 
          height={iconDimensions * 0.62} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </div>

      {/* Typography with theme-aware contrast */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '-0.02em' }}>
        <span style={{ 
          fontSize, 
          fontWeight: 800, 
          color: 'var(--text-primary)',
          fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif"
        }}>
          utsavpatel
        </span>
        <span style={{ 
          fontSize: '11px', 
          fontWeight: 700, 
          color: 'var(--theme-color)',
          background: 'var(--theme-color-light)',
          border: '1px solid var(--border-light)',
          padding: '1px 6px',
          borderRadius: '4px',
          letterSpacing: '0.04em',
          textTransform: 'uppercase'
        }}>
          dev
        </span>
      </div>
    </div>
  );
}

export default BrandLogo;
