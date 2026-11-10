import React from 'react';

/**
 * Authentic, professional engineering brand mark for Utsav Patel.
 * High-contrast, clean geometric emblem without AI gradients.
 */
function BrandLogo({ size = 'medium' }) {
  const iconDimensions = size === 'large' ? 36 : size === 'small' ? 24 : 30;
  const fontSize = size === 'large' ? '18px' : size === 'small' ? '14px' : '15.5px';

  return (
    <div className="brand-logo-container" style={{ display: 'inline-flex', alignItems: 'center', gap: '9px' }}>
      {/* Precision Geometric Monochromatic Emblem */}
      <div 
        className="brand-logo-emblem"
        style={{
          width: iconDimensions,
          height: iconDimensions,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          background: 'var(--brand-emblem-bg, #09090b)',
          color: 'var(--brand-emblem-text, #ffffff)',
          border: '1px solid var(--border-light, #e4e4e7)',
          flexShrink: 0,
          transition: 'transform 0.2s ease, background-color 0.2s ease, color 0.2s ease'
        }}
      >
        <svg 
          width={iconDimensions * 0.58} 
          height={iconDimensions * 0.58} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </div>

      {/* Typography with high contrast */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '-0.02em' }}>
        <span style={{ 
          fontSize, 
          fontWeight: 800, 
          color: 'var(--text-primary)',
          fontFamily: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif"
        }}>
          utsavpatel
        </span>
        <span style={{ 
          fontSize: '10.5px', 
          fontWeight: 700, 
          color: 'var(--text-secondary)',
          background: 'var(--bg-card-subtle)',
          border: '1px solid var(--border-light)',
          padding: '1.5px 6px',
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
