import React from 'react';

// Real, Official SVG Tech Logos with exact brand vectors & colors
export const PythonLogo = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <linearGradient id="py-a" x1="70.252" y1="1237.476" x2="170.659" y2="1151.089" gradientUnits="userSpaceOnUse" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)">
      <stop offset="0" stopColor="#5A9FD4"/>
      <stop offset="1" stopColor="#306998"/>
    </linearGradient>
    <linearGradient id="py-b" x1="209.474" y1="1098.811" x2="173.62" y2="1149.537" gradientUnits="userSpaceOnUse" gradientTransform="matrix(.563 0 0 -.568 -29.215 707.817)">
      <stop offset="0" stopColor="#FFD43B"/>
      <stop offset="1" stopColor="#FFE873"/>
    </linearGradient>
    <path fill="url(#py-a)" d="M63.391 1.988c-4.222.02-8.252.379-11.8 1.007-10.45 1.846-12.346 5.71-12.346 12.837v9.411h24.693v3.137H27.544c-7.175 0-13.46 4.313-15.426 12.521-2.268 9.405-2.368 15.275 0 25.096 1.755 7.311 5.947 12.519 13.124 12.519h8.491V67.234c0-8.151 7.051-15.34 15.426-15.34h24.665c6.866 0 12.346-5.654 12.346-12.548V15.833c0-6.693-5.646-11.72-12.346-12.837-4.244-.706-8.645-1.027-12.833-1.008zM50.037 9.557c2.55 0 4.634 2.117 4.634 4.721 0 2.593-2.083 4.69-4.634 4.69-2.56 0-4.633-2.097-4.633-4.69-.001-2.604 2.073-4.721 4.633-4.721z"/>
    <path fill="url(#py-b)" d="M91.682 28.38v10.966c0 8.5-7.208 15.655-15.426 15.655H51.591c-6.756 0-12.346 5.783-12.346 12.549v23.515c0 6.691 5.818 10.628 12.346 12.547 7.816 2.297 15.312 2.713 24.665 0 6.216-1.801 12.346-5.423 12.346-12.547v-9.412H63.938v-3.138h37.012c7.176 0 9.852-5.005 12.348-12.519 2.578-7.735 2.467-15.174 0-25.096-1.774-7.145-5.161-12.521-12.348-12.521h-9.268zM77.809 87.927c2.561 0 4.634 2.097 4.634 4.692 0 2.602-2.074 4.719-4.634 4.719-2.55 0-4.633-2.117-4.633-4.719 0-2.595 2.083-4.692 4.633-4.692z"/>
  </svg>
);

export const ReactLogo = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="-11.5 -10.23174 23 20.46348" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <circle cx="0" cy="0" r="2.05" fill="#61DAFB"/>
    <g stroke="#61DAFB" strokeWidth="1" fill="none">
      <ellipse rx="11" ry="4.2"/>
      <ellipse rx="11" ry="4.2" transform="rotate(60)"/>
      <ellipse rx="11" ry="4.2" transform="rotate(120)"/>
    </g>
  </svg>
);

export const TensorFlowLogo = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path fill="#FF6F00" d="M12 1L2 6.5v11L12 23l10-5.5v-11L12 1zm0 3.3l7 3.8v7.8l-7 3.8-7-3.8V8.1l7-3.8z"/>
    <path fill="#FFA000" d="M11 6h2v12h-2zm-4 3h10v2H7z"/>
  </svg>
);

export const OpenCVLogo = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <circle cx="50" cy="28" r="20" fill="none" stroke="#ED1C24" strokeWidth="10"/>
    <circle cx="28" cy="68" r="20" fill="none" stroke="#00A2E8" strokeWidth="10"/>
    <circle cx="72" cy="68" r="20" fill="none" stroke="#22B14C" strokeWidth="10"/>
  </svg>
);

export const JavaScriptLogo = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 630 630" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect width="630" height="630" fill="#F7DF1E" rx="80"/>
    <path d="M423.2 492.8c12.6 20.7 29.2 36.1 58.7 36.1 24.6 0 40.2-12.2 40.2-29.2 0-20.3-16.1-27.4-43.1-39.2l-14.8-6.3c-42.5-18.2-70.8-41-70.8-89.2 0-44.2 33.6-77.7 86.8-77.7 37.5 0 64.3 13 83.2 46.5l-39.8 25.6c-8.7-15.4-18.5-22.1-43.4-22.1-20.9 0-33.1 11.8-33.1 26.8 0 18.5 13.8 25.6 38.6 36.3l14.6 6.3c50.5 21.7 76.5 44.2 76.5 92.3 0 52.8-41.4 82.8-97.8 82.8-54.8 0-89.5-27.6-105.7-64.3l49.9-24.8zm-177.3 4.7c-8.3 13.8-19.7 22.9-42.6 22.9-24.8 0-40.6-13.8-40.6-47.3V292.5h53.6v176.7c0 15 6.3 22.5 17.7 22.5 9.1 0 15.4-4.7 19.7-13.8l-7.8-4.4z"/>
  </svg>
);

export const HTMLLogo = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path fill="#E44D26" d="M71 460L30 0h452l-41 460-185 52z"/>
    <path fill="#F16529" d="M256 472l149-41 35-391H256v432z"/>
    <path fill="#EBEBEB" d="M256 208h-74l-5-57h79V95H118l15 170h123v-57zm0 148l-1 1-62-17-4-45H133l8 97 115 32v-68z"/>
    <path fill="#FFFFFF" d="M256 208h74l-7 77-67 18v60l115-32 16-179H256v56zm0-113v56h132l5-56H256z"/>
  </svg>
);

export const CSSLogo = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 512 512" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path fill="#264DE4" d="M71 460L30 0h452l-41 460-185 52z"/>
    <path fill="#2965F1" d="M256 472l149-41 35-391H256v432z"/>
    <path fill="#EBEBEB" d="M256 208h-74l-5-57h79V95H118l15 170h123v-57zm0 148l-1 1-62-17-4-45H133l8 97 115 32v-68z"/>
    <path fill="#FFFFFF" d="M256 208h74l-7 77-67 18v60l115-32 16-179H256v56zm0-113v56h132l5-56H256z"/>
  </svg>
);

export const MySQLLogo = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path fill="#00758F" d="M2 109.2v9.4h3.8v-3.7h3.4v3.7h3.8v-9.4h-3.8v3.8H5.8v-3.8zm31.1 0l-2.8 5.5-2.8-5.5h-3.4v9.4h3.5v-5.2l2.3 4.4h.8l2.3-4.4v5.2h3.5v-9.4zm5.5 0v9.4h7.7v-2.9h-3.9v-6.5zm17.2 0l-4 9.4h3.8l.6-1.6h4.1l.6 1.6h3.9l-4-9.4zm-.1 5.7l1.2-3.1 1.2 3.1zm22 3.7v-9.4h-3.8v9.4zm9.3-3.4l-4.6-6h-3.4v9.4h3.6v-5.8l4.5 5.8h3.5v-9.4h-3.6zm5.8-6v9.4h8.1v-2.8h-4.3v-1.1h4.3v-2.7h-4.3v-1h4.3v-2.8z"/>
    <path fill="#F29111" d="M111.8 94.4c-5.9-.1-10.4 1.2-10.4 1.2v.6c.7.6 1.9 1.7 2.3 2.7 1 2.8-3.2 4-4 4.1-2.7.3-5.3-.4-7.5-1.9l-.5.3 1.1 8c.5.4 4.5 3.8 12.1 3.7 8.2-.1 13.4-4.5 13.9-10.1.3-3.7-1.8-6.4-7-8.6z"/>
    <path fill="#00758F" d="M48.5 8.9c-2.4 2.5-5.3 5.3-5.3 9.5 0 7.1 5.9 10.7 11.6 14.1 4.6 2.7 8.9 5.2 8.9 9.9 0 2.8-1.3 5.2-3.2 7.2 5.6-2.5 8.9-6.9 8.9-12 0-6.9-5.3-10.7-10.4-14.3-4.6-3.2-8.9-6.2-8.9-11.2.1-1.1.1-2.3.4-3.2zm3.2-8.9c-1.1 3.4-4.5 5.9-7.2 8.9-3.6 4-5.5 9.3-2.7 14.4 2.2 4.1 6.5 6.2 9.7 9.4 3.5 3.4 5.7 9.3 3.4 14.3 4.7-4 6.3-10.5 3.4-15.6-2.7-4.7-7.1-6.5-10.3-10.1-3-3.3-3.2-8.3-.5-11.9C50.9 6.4 52.5 3.7 51.7 0zm35 2.8c-1 2.5-2.9 4.5-4.9 6.5-3.4 3.5-7.2 7.5-7.2 13.6 0 7.4 5.7 11.2 11.2 14.8 4.5 3 9.1 6 9.1 11.1 0 3.6-1.8 6.7-4.7 9.1 5.5-2.5 9.3-7.6 9.3-13.3 0-6.9-5.2-10.4-10.2-13.7-4.8-3.2-9.4-6.3-9.4-11.5 0-4.4 2.1-7.3 4.8-10.3 2.4-2.7 3.5-4.3 2-6.3z"/>
  </svg>
);

export const GitLogo = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 128 128" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path fill="#F05032" d="M124.7 57.3L70.7 3.3c-4.4-4.4-11.6-4.4-16 0L39.8 18.2l20.3 20.3c4.7-1.6 10.2-.5 13.9 3.2 3.7 3.7 4.8 9.2 3.2 13.9l19.5 19.5c4.7-1.6 10.2-.5 13.9 3.2 5.5 5.5 5.5 14.4 0 19.9s-14.4 5.5-19.9 0c-4.1-4.1-5-10.2-2.7-15.1l-18.2-18.2v38.9c1.6.8 3.1 2 4.3 3.2 5.5 5.5 5.5 14.4 0 19.9s-14.4 5.5-19.9 0c-5.5-5.5-5.5-14.4 0-19.9 1.6-1.6 3.6-2.7 5.7-3.4V56.7c-2.1-.7-4.1-1.8-5.7-3.4-4.1-4.1-5-10.1-2.8-15.1L32.2 18.4 3.3 47.3c-4.4 4.4-4.4 11.6 0 16l54 54c4.4 4.4 11.6 4.4 16 0l51.4-51.4c4.4-4.4 4.4-11.6 0-16z"/>
  </svg>
);

export const NodeLogo = ({ size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" className={className} style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path fill="#539E43" d="M16 2.5L3.5 9.7v14.6L16 31.5l12.5-7.2V9.7L16 2.5zm0 3.3l9.5 5.5v11L16 27.8l-9.5-5.5v-11L16 5.8z"/>
  </svg>
);

// High-tech Concept Vectors (for Machine Learning, Web Dev, Data Analysis)
export const MLNeuralIcon = ({ size = 24, color = '#6366f1' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93"/>
    <circle cx="12" cy="14" r="3"/>
    <circle cx="5" cy="9" r="2.5"/>
    <circle cx="19" cy="9" r="2.5"/>
    <circle cx="6" cy="19" r="2.5"/>
    <circle cx="18" cy="19" r="2.5"/>
    <line x1="7.2" y1="10.2" x2="10" y2="12.5"/>
    <line x1="16.8" y1="10.2" x2="14" y2="12.5"/>
    <line x1="7.8" y1="17.5" x2="10.2" y2="15.5"/>
    <line x1="16.2" y1="17.5" x2="13.8" y2="15.5"/>
    <line x1="12" y1="6" x2="12" y2="11"/>
  </svg>
);

export const WebDevIcon = ({ size = 24, color = '#3b82f6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
    <path d="M7 8l-2 2.5 2 2.5"/>
    <path d="M17 8l2 2.5-2 2.5"/>
    <line x1="13" y1="7" x2="11" y2="14"/>
  </svg>
);

export const DataAnalysisIcon = ({ size = 24, color = '#10b981' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18"/>
    <rect x="7" y="10" width="3" height="8" rx="1"/>
    <rect x="13" y="6" width="3" height="12" rx="1"/>
    <path d="M19 12l-4-4-4 4-4-4" strokeWidth="2"/>
    <circle cx="19" cy="12" r="1.5" fill={color}/>
  </svg>
);
