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
          width={iconDimensions * 0.72} 
          height={iconDimensions * 0.72} 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Stylized code brackets and neural node symbolizing AI + Web */}
          <path 
            d="M9 10L4 16L9 22" 
            stroke="#ffffff" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <path 
            d="M23 10L28 16L23 22" 
            stroke="#ffffff" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          {/* Central Neural Pulse Node */}
          <circle cx="16" cy="16" r="3.2" fill="#ffffff" />
          <path 
            d="M16 8V12.8M16 19.2V24" 
            stroke="#ffffff" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeOpacity="0.85" 
          />
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
