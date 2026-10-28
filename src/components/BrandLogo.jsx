import React from 'react';

/**
 * Authentic, professional engineering brand mark for Utsav Patel.
 * Combines a sleek gradient emblem with sharp modern typography.
 */
function BrandLogo({ size = 'medium', color = '#4f46e5' }) {
  const iconDimensions = size === 'large' ? 38 : size === 'small' ? 24 : 32;
  const fontSize = size === 'large' ? '20px' : size === 'small' ? '15px' : '17px';

  return (
    <div className="brand-logo-container" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
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
          borderRadius: '9px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #06b6d4 100%)',
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.28), 0 1px 3px rgba(0, 0, 0, 0.08)',
          flexShrink: 0
        }}
      >
        <svg 
          width={iconDimensions * 0.65} 
          height={iconDimensions * 0.65} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="#ffffff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      </div>

      {/* Typography with clean contrast */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', letterSpacing: '-0.02em' }}>
        <span style={{ 
          fontSize, 
          fontWeight: 800, 
          color: '#0f172a',
          fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif"
        }}>
          utsavpatel
        </span>
        <span style={{ 
          fontSize: size === 'small' ? '11px' : '12px', 
          fontWeight: 700, 
          color: '#ffffff',
          background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
          padding: '1px 6px',
          borderRadius: '5px',
          letterSpacing: '0.02em',
          textTransform: 'lowercase'
        }}>
          dev
        </span>
      </div>
    </div>
  );
}

export default BrandLogo;
