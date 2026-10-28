import React, { useState, lazy, Suspense } from 'react';

const CachingOptimization = lazy(() => import('./CachingOptimization'));
const AsyncEventDriven = lazy(() => import('./AsyncEventDriven'));
const DockerContainerization = lazy(() => import('./DockerContainerization'));
const CicdPipeline = lazy(() => import('./CicdPipeline'));

const TABS = [
  {
    id: 'caching',
    label: '⚡ In-Memory Caching',
    subtitle: 'Practical 9',
    description: 'Redis-style in-memory caching strategies for high-performance data access',
  },
  {
    id: 'async',
    label: '📡 Async Event-Driven',
    subtitle: 'Practical 10',
    description: 'Non-blocking async architecture with event queues and message brokers',
  },
  {
    id: 'docker',
    label: '🐳 Docker & Containers',
    subtitle: 'Practical 11',
    description: 'Containerization with Docker for consistent, portable deployments',
  },
  {
    id: 'cicd',
    label: '🔁 CI/CD Pipeline',
    subtitle: 'Practical 12',
    description: 'Automated build, test, and deployment pipelines for modern DevOps',
  },
];

const PALETTE = {
  bg: '#0f172a',
  card: 'rgba(30,41,59,0.8)',
  cardSolid: '#1e293b',
  accent: '#D4B996',
  accentMuted: 'rgba(212,185,150,0.15)',
  text: '#F8F6F1',
  muted: '#94A3B8',
  border: 'rgba(212,185,150,0.2)',
  borderHover: 'rgba(212,185,150,0.5)',
  glow: 'rgba(212,185,150,0.08)',
};

function LoadingSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '320px',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          border: `3px solid ${PALETTE.border}`,
          borderTop: `3px solid ${PALETTE.accent}`,
          borderRadius: '50%',
          animation: 'p8spin 0.8s linear infinite',
        }}
      />
      <span style={{ color: PALETTE.muted, fontSize: '14px', letterSpacing: '0.05em' }}>
        Loading component…
      </span>
      <style>{`@keyframes p8spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function TabButton({ tab, isActive, accentColor, onClick }) {
  const [hovered, setHovered] = React.useState(false);

  return (
    <button
      onClick={() => onClick(tab.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '2px',
        padding: '12px 18px',
        background: isActive
          ? PALETTE.accentMuted
          : hovered
          ? 'rgba(255,255,255,0.04)'
          : 'transparent',
        border: 'none',
        borderBottom: isActive
          ? `2px solid ${PALETTE.accent}`
          : '2px solid transparent',
        borderRadius: '0',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        color: isActive ? PALETTE.accent : hovered ? PALETTE.text : PALETTE.muted,
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: '13px', fontWeight: isActive ? 600 : 400, letterSpacing: '0.01em' }}>
        {tab.label}
      </span>
      <span
        style={{
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: isActive ? 'rgba(212,185,150,0.7)' : 'rgba(148,163,184,0.6)',
        }}
      >
        {tab.subtitle}
      </span>
    </button>
  );
}

function Practical8({ color = '#4f46e5' }) {
  const [activeTab, setActiveTab] = useState('caching');

  const activeTabData = TABS.find((t) => t.id === activeTab);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PALETTE.bg,
        color: PALETTE.text,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        padding: '0 0 80px',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          background: `linear-gradient(135deg, rgba(30,41,59,0.95) 0%, rgba(15,23,42,0.98) 100%)`,
          borderBottom: `1px solid ${PALETTE.border}`,
          padding: '48px 32px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* decorative glow blobs */}
        <div
          style={{
            position: 'absolute',
            top: '-60px',
            right: '-60px',
            width: '300px',
            height: '300px',
            background: `radial-gradient(circle, rgba(212,185,150,0.08) 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-40px',
            left: '10%',
            width: '200px',
            height: '200px',
            background: `radial-gradient(circle, rgba(79,70,229,0.06) 0%, transparent 70%)`,
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '960px', margin: '0 auto', position: 'relative' }}>
          {/* badge */}
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: PALETTE.accentMuted,
              border: `1px solid ${PALETTE.border}`,
              borderRadius: '20px',
              padding: '4px 14px',
              marginBottom: '20px',
            }}
          >
            <span style={{ fontSize: '11px', color: PALETTE.accent, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Performance Optimization &amp; DevOps
            </span>
          </div>

          <h1
            style={{
              fontSize: 'clamp(24px, 4vw, 36px)',
              fontWeight: 700,
              margin: '0 0 12px',
              color: PALETTE.text,
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            Practical 8{' '}
            <span style={{ color: PALETTE.accent }}>—</span>{' '}
            Advanced Web Framework Practicals
          </h1>

          <p
            style={{
              fontSize: '15px',
              color: PALETTE.muted,
              margin: '0 0 28px',
              maxWidth: '620px',
              lineHeight: 1.7,
            }}
          >
            A deep dive into performance optimization techniques and modern DevOps practices —
            from intelligent caching and async event-driven systems to Docker containerization
            and fully automated CI/CD pipelines.
          </p>

          {/* stat pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            {[
              { icon: '⚡', label: '4 Practicals' },
              { icon: '🚀', label: 'Performance Focus' },
              { icon: '🛠️', label: 'DevOps Ready' },
              { icon: '📦', label: 'Production Patterns' },
            ].map((pill) => (
              <div
                key={pill.label}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid rgba(255,255,255,0.08)`,
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '12px',
                  color: PALETTE.muted,
                }}
              >
                <span>{pill.icon}</span>
                <span>{pill.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Navigation ── */}
      <div
        style={{
          background: PALETTE.cardSolid,
          borderBottom: `1px solid ${PALETTE.border}`,
          position: 'sticky',
          top: 0,
          zIndex: 10,
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}
      >
        <div
          style={{
            maxWidth: '960px',
            margin: '0 auto',
            display: 'flex',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {TABS.map((tab) => (
            <TabButton
              key={tab.id}
              tab={tab}
              isActive={activeTab === tab.id}
              accentColor={color}
              onClick={setActiveTab}
            />
          ))}
        </div>
      </div>

      {/* ── Active Tab Info Bar ── */}
      <div
        style={{
          maxWidth: '960px',
          margin: '0 auto',
          padding: '20px 32px 0',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: PALETTE.accentMuted,
            border: `1px solid ${PALETTE.border}`,
            borderRadius: '10px',
          }}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: PALETTE.accent,
              boxShadow: `0 0 8px ${PALETTE.accent}`,
              flexShrink: 0,
            }}
          />
          <div>
            <span style={{ fontSize: '13px', color: PALETTE.accent, fontWeight: 600 }}>
              {activeTabData?.subtitle}
            </span>
            <span style={{ fontSize: '13px', color: PALETTE.muted, marginLeft: '8px' }}>
              {activeTabData?.description}
            </span>
          </div>
        </div>
      </div>

      {/* ── Component Content ── */}
      <div
        style={{
          maxWidth: '960px',
          margin: '24px auto 0',
          padding: '0 32px',
        }}
      >
        <div
          style={{
            background: PALETTE.card,
            border: `1px solid ${PALETTE.border}`,
            borderRadius: '16px',
            overflow: 'hidden',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}
        >
          <Suspense fallback={<LoadingSpinner />}>
            {activeTab === 'caching' && <CachingOptimization color={color} />}
            {activeTab === 'async' && <AsyncEventDriven color={color} />}
            {activeTab === 'docker' && <DockerContainerization color={color} />}
            {activeTab === 'cicd' && <CicdPipeline color={color} />}
          </Suspense>
        </div>
      </div>

      {/* ── Footer ── */}
      <div
        style={{
          maxWidth: '960px',
          margin: '40px auto 0',
          padding: '0 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <span style={{ fontSize: '12px', color: 'rgba(148,163,184,0.5)', letterSpacing: '0.05em' }}>
          Practical 8 · Advanced Web Framework · Performance Optimization
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              title={tab.label}
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                background: activeTab === tab.id ? PALETTE.accent : 'rgba(148,163,184,0.3)',
                transition: 'all 0.2s ease',
                transform: activeTab === tab.id ? 'scale(1.3)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Practical8;
