import React, { useState } from 'react';

// ============================================================================
// Practical 12: CI/CD Pipeline with GitHub Actions
// Interactive Pipeline Simulator, Test Runner, YAML Inspector & Lab Evidence
// ============================================================================

function CicdPipeline({ color = '#4f46e5' }) {
  const [activeTab, setActiveTab] = useState('pipeline'); // pipeline | terminal | yaml | analysis | checklist
  const [pipelineState, setPipelineState] = useState('success'); // 'idle' | 'running' | 'success' | 'failed'
  const [currentStepIndex, setCurrentStepIndex] = useState(8);
  const [testScenario, setTestScenario] = useState('healthy'); // 'healthy' | 'broken'
  const [copiedYaml, setCopiedYaml] = useState(false);
  const [toast, setToast] = useState(null);
  const [commitSha, setCommitSha] = useState('eff1cf1');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const workflowYamlContent = `name: CI Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:

jobs:
  lint:
    name: Code Quality & Linting
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Set up Node.js 18.x
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'

      - name: Install Frontend Dependencies
        run: npm install

      - name: Run ESLint Code Quality Checks
        run: npm run lint

  build-and-test:
    name: Automated Testing & Build
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Source Code
        uses: actions/checkout@v4

      - name: Set up Node.js 18.x
        uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: 'npm'

      - name: Install Dependencies
        run: |
          npm install
          cd backend && npm install

      - name: Execute Automated Test Suite (Jest & Supertest)
        run: |
          cd backend
          npm test

      - name: Build Production Bundle (Vite)
        run: npm run build

      - name: Report CI/CD Status Summary
        run: |
          echo "===================================================="
          echo "✅ CI/CD Pipeline Executed Successfully!"
          echo "===================================================="`;

  // Pipeline steps definition
  const pipelineSteps = [
    {
      id: 1,
      name: 'GitHub Actions Trigger',
      command: 'on: push [branches: main]',
      duration: '0.8s',
      status: 'success'
    },
    {
      id: 2,
      name: 'Job 1: Checkout Code',
      command: 'uses: actions/checkout@v4',
      duration: '1.4s',
      status: 'success'
    },
    {
      id: 3,
      name: 'Job 1: Setup Node.js 18',
      command: 'uses: actions/setup-node@v4 (node-version: 18)',
      duration: '2.1s',
      status: 'success'
    },
    {
      id: 4,
      name: 'Job 1: ESLint Code Quality',
      command: 'npm run lint',
      duration: '3.2s',
      status: 'success'
    },
    {
      id: 5,
      name: 'Job 2: Install Dependencies',
      command: 'npm install && cd backend && npm install',
      duration: '12.5s',
      status: 'success'
    },
    {
      id: 6,
      name: 'Job 2: Run Automated Tests',
      command: 'cd backend && npm test (Jest + Supertest)',
      duration: testScenario === 'broken' ? '2.8s' : '4.1s',
      status: testScenario === 'broken' && (pipelineState === 'failed' || (pipelineState === 'running' && currentStepIndex >= 6)) ? 'failed' : 'success'
    },
    {
      id: 7,
      name: 'Job 2: Build Production Bundle',
      command: 'npm run build (Vite)',
      duration: '4.4s',
      status: testScenario === 'broken' ? 'skipped' : 'success'
    },
    {
      id: 8,
      name: 'Report Pipeline Status',
      command: 'Green Checkmark / Status Badge Updated',
      duration: '0.4s',
      status: testScenario === 'broken' ? 'skipped' : 'success'
    }
  ];

  // Simulated Terminal Logs
  const passingLogs = `
==> 🚀 GitHub Actions Workflow: CI Pipeline (run #42)
==> Triggered via push on branch: main (Commit: ${commitSha})
==> Runner: GitHub-Hosted runner ubuntu-latest (v2.320.0)

● Job: lint (Code Quality & Linting)
  ✓ Checkout Source Code [actions/checkout@v4] (1.2s)
  ✓ Set up Node.js 18.x [actions/setup-node@v4] (1.9s)
  ✓ Install Frontend Dependencies (npm install) (8.4s)
  ✓ Run ESLint Code Quality Checks (npm run lint) (2.8s)
    → 0 errors, 32 warnings (allowable catch & unused imports)
  Result: Job 'lint' passed with exit code 0.

● Job: build-and-test (Automated Testing & Build) [needs: lint]
  ✓ Checkout Source Code [actions/checkout@v4] (1.1s)
  ✓ Set up Node.js 18.x [actions/setup-node@v4] (1.8s)
  ✓ Install Backend & Frontend Dependencies (npm install) (11.2s)
  ✓ Execute Automated Test Suite (Jest & Supertest) (4.1s)
    $ jest --detectOpenHandles --forceExit
    PASS  backend/tests/api.test.js
      Task Management API - CI/CD Automated Test Suite
        ✓ GET /tasks returns 200 (68 ms)
        ✓ GET /health returns 200 OK (21 ms)
        ✓ GET / returns 200 with online status and endpoints map (16 ms)
        ✓ GET /api/tasks returns 401 Unauthorized without JWT token (21 ms)
        ✓ GET /api/tasks returns 200 with valid JWT Bearer authentication (24 ms)
        ✓ GET /api/non-existent-endpoint returns 404 Not Found (26 ms)

    Test Suites: 1 passed, 1 total
    Tests:       6 passed, 6 total
    Snapshots:   0 total
    Time:        1.794 s
  ✓ Build Production Bundle (Vite) (4.37s)
    vite v8.1.4 building client environment for production...
    transforming... ✓ 612 modules transformed.
    dist/index.html                     0.47 kB │ gzip: 0.30 kB
    dist/assets/index-ChwZ7JPO.js     226.47 kB │ gzip: 70.61 kB
    ✓ built in 4.37s

====================================================
✅ CI/CD Pipeline Executed Successfully!
Status: Passed (exit code: 0)
Duration: 28s | Completed at: ${new Date().toLocaleTimeString()}
Badge: https://github.com/Utsav-047/MyPortfolio/actions/workflows/ci.yml/badge.svg
====================================================
`;

  const failingLogs = `
==> 🚨 GitHub Actions Workflow: CI Pipeline (run #43)
==> Triggered via push on branch: main (Commit: f8b3c91 [test: deliberate broken assertion])
==> Runner: GitHub-Hosted runner ubuntu-latest (v2.320.0)

● Job: lint (Code Quality & Linting)
  ✓ Checkout Source Code (1.1s)
  ✓ Set up Node.js 18.x (1.8s)
  ✓ Run ESLint Code Quality Checks (npm run lint) (2.5s)
  Result: Job 'lint' passed with exit code 0.

● Job: build-and-test (Automated Testing & Build)
  ✓ Checkout Source Code (1.0s)
  ✓ Set up Node.js 18.x (1.8s)
  ✓ Install Backend Dependencies (npm install) (9.4s)
  ✖ Execute Automated Test Suite (Jest & Supertest) (3.2s)
    $ jest --detectOpenHandles --forceExit
    FAIL  backend/tests/api.test.js
      Task Management API - CI/CD Automated Test Suite
        ✕ GET /tasks returns 200 (94 ms)
        ✓ GET /health returns 200 OK (22 ms)
        ✓ GET / returns 200 with online status and endpoints map (18 ms)
        ✓ GET /api/tasks returns 401 Unauthorized without JWT token (19 ms)
        ✓ GET /api/tasks returns 200 with valid JWT Bearer authentication (28 ms)
        ✓ GET /api/non-existent-endpoint returns 404 Not Found (21 ms)

    ● Task Management API - CI/CD Automated Test Suite › GET /tasks returns 200

      expect(received).toBe(expected) // Object.is equality

      Expected: 201
      Received: 200

        12 |   test('GET /tasks returns 200', async () => {
        13 |     const res = await request(app).get('/tasks');
      > 14 |     expect(res.statusCode).toBe(201); // 🚨 Deliberate break: Expected 201 Created
           |                            ^
        15 |     expect(res.body).toHaveProperty('success', true);
        16 |   });

        at Object.toBe (tests/api.test.js:14:28)

    Test Suites: 1 failed, 1 total
    Tests:       1 failed, 5 passed, 6 total
    Snapshots:   0 total
    Time:        2.140 s
    Ran all test suites.

##[error]Process completed with exit code 1.
✖ Error: npm test exited with error code 1
Skipping subsequent steps: Build Production Bundle (Vite)

====================================================
❌ CI/CD Pipeline Failed!
Red X status registered on GitHub repository.
Pull Requests targeting 'main' are blocked from merging.
Please fix the failing assertion and push a commit to trigger a new run.
====================================================
`;

  const runSimulation = (scenario) => {
    setTestScenario(scenario);
    setPipelineState('running');
    setCurrentStepIndex(1);
    setCommitSha(scenario === 'broken' ? 'f8b3c91' : '3b9d01e');
    showToast(`Triggering CI/CD Workflow with ${scenario === 'broken' ? 'broken test (demonstration)' : 'passing test suite'}...`, 'info');

    const stepTimer = setInterval(() => {
      setCurrentStepIndex(prev => {
        if (scenario === 'broken' && prev >= 6) {
          clearInterval(stepTimer);
          setPipelineState('failed');
          showToast('CI/CD Pipeline Failed! Red X status generated.', 'error');
          return 6;
        }
        if (prev >= 8) {
          clearInterval(stepTimer);
          setPipelineState('success');
          showToast('CI/CD Pipeline Passed! Green checkmark recorded.', 'success');
          return 8;
        }
        return prev + 1;
      });
    }, 450);
  };

  const copyYaml = () => {
    navigator.clipboard.writeText(workflowYamlContent);
    setCopiedYaml(true);
    showToast('Workflow YAML copied to clipboard!');
    setTimeout(() => setCopiedYaml(false), 2500);
  };

  return (
    <div style={{
      background: 'transparent',
      marginTop: '8px',
      fontFamily: "'Inter', system-ui, sans-serif"
    }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: '#1E293B',
          border: `1px solid ${toast.type === 'error' ? '#f87171' : toast.type === 'info' ? '#60a5fa' : '#4ade80'}`,
          color: '#F8F6F1',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          zIndex: 99999,
          fontWeight: 600,
          fontSize: '13px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toast.message}
        </div>
      )}

      {/* Header & Status Banner */}
      <div style={{
        background: 'rgba(30,41,59,0.8)',
        borderRadius: '14px',
        padding: '1.75rem 2rem',
        marginBottom: '1.25rem',
        border: '1px solid rgba(212,185,150,0.12)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#F8F6F1', fontFamily: "'Playfair Display', Georgia, serif" }}>
              CI/CD Pipeline — GitHub Actions
            </h2>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748B', lineHeight: 1.6, maxWidth: '600px' }}>
            Automated Continuous Integration pipeline with GitHub Actions, Jest unit testing, Supertest API verification, and ESLint code quality gates.
          </p>
        </div>

        {/* Live CI Pipeline Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(255,255,255,0.04)',
          padding: '10px 18px',
          borderRadius: '10px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: pipelineState === 'success' ? '#4ade80' : pipelineState === 'failed' ? '#f87171' : '#60a5fa',
            boxShadow: `0 0 6px ${pipelineState === 'success' ? '#4ade80' : pipelineState === 'failed' ? '#f87171' : '#60a5fa'}`,
            animation: pipelineState === 'running' ? 'pulse 1s infinite' : 'none'
          }} />
          <div>
            <div style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Workflow Status
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: 700,
              color: pipelineState === 'success' ? '#4ade80' : pipelineState === 'failed' ? '#f87171' : '#60a5fa'
            }}>
              {pipelineState === 'success' && 'passing (Green Checkmark)'}
              {pipelineState === 'failed' && 'failing (Red X Mark)'}
              {pipelineState === 'running' && 'running in progress...'}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '6px',
        margin: '0 0 1.25rem 0',
        flexWrap: 'wrap',
        borderBottom: '1px solid rgba(212,185,150,0.10)',
        paddingBottom: '4px'
      }}>
        {[
          { key: 'pipeline', label: 'Interactive Pipeline DAG' },
          { key: 'terminal', label: 'GitHub Actions Logs' },
          { key: 'yaml', label: '.github/workflows/ci.yml' },
          { key: 'analysis', label: 'Theory & Analysis' },
          { key: 'checklist', label: 'Screenshot Guide' }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '9px 18px',
              borderRadius: '10px',
              border: activeTab === t.key ? '1px solid rgba(212,185,150,0.35)' : '1px solid rgba(255,255,255,0.08)',
              background: activeTab === t.key ? 'rgba(212,185,150,0.15)' : 'rgba(30,41,59,0.5)',
              color: activeTab === t.key ? '#F8F6F1' : '#94A3B8',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: INTERACTIVE PIPELINE DAG & CONTROLS */}
      {activeTab === 'pipeline' && (
        <div>
          {/* Simulation Control Toolbar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            background: 'rgba(30, 41, 59, 0.7)',
            padding: '16px 20px',
            borderRadius: '14px',
            border: '1px solid rgba(212, 185, 150, 0.15)',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8F6F1' }}>
                Pipeline Test Execution Simulator
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                Simulate a real commit push, broken test assertion failure, or fixed green pipeline run.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => runSimulation('healthy')}
                disabled={pipelineState === 'running'}
                style={{
                  background: 'rgba(16,185,129,0.2)',
                  color: '#4ade80',
                  border: '1px solid rgba(74,222,128,0.4)',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: pipelineState === 'running' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(16,185,129,0.1)'
                }}
              >
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#4ade80' }} />
                Run Passing Pipeline (Green Check)
              </button>

              <button
                onClick={() => runSimulation('broken')}
                disabled={pipelineState === 'running'}
                style={{
                  background: 'rgba(239,68,68,0.2)',
                  color: '#f87171',
                  border: '1px solid rgba(248,113,113,0.4)',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: pipelineState === 'running' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(239,68,68,0.1)'
                }}
              >
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#f87171' }} />
                Deliberately Break Test (Red X Mark)
              </button>

              <button
                onClick={() => {
                  setTestScenario('healthy');
                  setPipelineState('success');
                  setCurrentStepIndex(8);
                  setCommitSha('6a19f20');
                  showToast('Pipeline restored to healthy passing state!', 'success');
                }}
                disabled={pipelineState === 'running'}
                style={{
                  background: 'rgba(99,102,241,0.2)',
                  color: '#a5b4fc',
                  border: '1px solid rgba(165,180,252,0.4)',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: pipelineState === 'running' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                Fix Test &amp; Reset
              </button>
            </div>
          </div>

          {/* GitHub Actions DAG Step Progression */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '14px',
            marginBottom: '24px'
          }}>
            {pipelineSteps.map((step) => {
              const isCurrent = pipelineState === 'running' && currentStepIndex === step.id;
              const isPassed = (pipelineState === 'success' && currentStepIndex >= step.id) ||
                (pipelineState === 'failed' && step.id < 6) ||
                (pipelineState === 'running' && currentStepIndex > step.id);
              const isFailed = (pipelineState === 'failed' && step.id === 6) ||
                (pipelineState === 'running' && testScenario === 'broken' && currentStepIndex === 6);
              const isSkipped = (pipelineState === 'failed' && step.id > 6);

              let badgeBg = 'rgba(255,255,255,0.06)';
              let badgeColor = '#94a3b8';
              let badgeBorder = 'rgba(255,255,255,0.1)';
              let statusLabel = 'PENDING';

              if (isFailed) {
                badgeBg = 'rgba(239, 68, 68, 0.2)';
                badgeColor = '#f87171';
                badgeBorder = 'rgba(248, 113, 113, 0.35)';
                statusLabel = 'FAILED';
              } else if (isPassed) {
                badgeBg = 'rgba(16, 185, 129, 0.2)';
                badgeColor = '#4ade80';
                badgeBorder = 'rgba(74, 222, 128, 0.35)';
                statusLabel = 'PASSED';
              } else if (isCurrent) {
                badgeBg = 'rgba(56, 189, 248, 0.2)';
                badgeColor = '#38bdf8';
                badgeBorder = 'rgba(56, 189, 248, 0.35)';
                statusLabel = 'RUNNING';
              } else if (isSkipped) {
                badgeBg = 'rgba(255, 255, 255, 0.04)';
                badgeColor = '#64748b';
                badgeBorder = 'rgba(255, 255, 255, 0.08)';
                statusLabel = 'SKIPPED';
              }

              return (
                <div
                  key={step.id}
                  style={{
                    background: 'rgba(30, 41, 59, 0.7)',
                    border: `1px solid ${isFailed ? 'rgba(248,113,113,0.5)' : isPassed ? 'rgba(74,222,128,0.3)' : isCurrent ? 'rgba(56,189,248,0.5)' : 'rgba(212,185,150,0.12)'}`,
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                    boxShadow: isCurrent ? '0 4px 16px rgba(56,189,248,0.2)' : '0 2px 8px rgba(0,0,0,0.25)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#94a3b8',
                      background: 'rgba(255,255,255,0.06)',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      Step {step.id}
                    </span>
                    <span style={{
                      background: badgeBg,
                      color: badgeColor,
                      border: `1px solid ${badgeBorder}`,
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      letterSpacing: '0.04em'
                    }}>
                      {statusLabel}
                    </span>
                  </div>

                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8F6F1', marginBottom: '6px' }}>
                      {step.name}
                    </div>
                    <code style={{ fontSize: '11px', color: '#94a3b8', background: 'rgba(15,23,42,0.6)', padding: '3px 7px', borderRadius: '4px', wordBreak: 'break-all', display: 'inline-block' }}>
                      {step.command}
                    </code>
                  </div>

                  <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Duration:</span>
                    <strong style={{ color: '#cbd5e1' }}>{step.duration}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Repository & Trigger Metadata Card */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(212, 185, 150, 0.15)',
            borderRadius: '14px',
            padding: '18px 22px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>GitHub Repository</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8F6F1', marginTop: '4px' }}>
                <a
                  href="https://github.com/Utsav-047/MyPortfolio"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#D4B996', textDecoration: 'none' }}
                >
                  Utsav-047/MyPortfolio ↗
                </a>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Trigger Event &amp; Branch</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8F6F1', marginTop: '4px' }}>
                <code style={{ background: 'rgba(15,23,42,0.6)', padding: '2px 6px', borderRadius: '4px', color: '#cbd5e1' }}>push</code> on <code style={{ background: 'rgba(15,23,42,0.6)', padding: '2px 6px', borderRadius: '4px', color: '#cbd5e1' }}>origin/main</code>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Commit Hash (SHA)</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8F6F1', marginTop: '4px' }}>
                <code style={{ background: 'rgba(15,23,42,0.6)', padding: '2px 6px', borderRadius: '4px', color: '#D4B996' }}>{commitSha}</code> ({testScenario === 'broken' ? 'Deliberate Failure' : 'Verified CI Green'})
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>README CI Status Badge</div>
              <div style={{ marginTop: '4px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: pipelineState === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                  border: `1px solid ${pipelineState === 'success' ? 'rgba(74,222,128,0.4)' : 'rgba(248,113,113,0.4)'}`,
                  color: pipelineState === 'success' ? '#4ade80' : '#f87171',
                  fontSize: '12px',
                  fontWeight: 800,
                  padding: '4px 10px',
                  borderRadius: '6px'
                }}>
                  build: {pipelineState === 'success' ? 'passing' : 'failing'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TERMINAL LOGS INSPECTOR */}
      {activeTab === 'terminal' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8F6F1' }}>
              Execution Console Output ({testScenario === 'broken' ? 'Run #43 - FAILED' : 'Run #42 - PASSED'})
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setTestScenario('healthy')}
                style={{
                  background: testScenario === 'healthy' ? 'rgba(16,185,129,0.25)' : 'rgba(30,41,59,0.6)',
                  color: testScenario === 'healthy' ? '#4ade80' : '#94A3B8',
                  border: `1px solid ${testScenario === 'healthy' ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                View Passing Run Logs
              </button>
              <button
                onClick={() => setTestScenario('broken')}
                style={{
                  background: testScenario === 'broken' ? 'rgba(239,68,68,0.25)' : 'rgba(30,41,59,0.6)',
                  color: testScenario === 'broken' ? '#f87171' : '#94A3B8',
                  border: `1px solid ${testScenario === 'broken' ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.08)'}`,
                  padding: '6px 14px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                View Broken Test Failure Logs
              </button>
            </div>
          </div>

          <div style={{
            background: '#090e17',
            color: '#f8fafc',
            borderRadius: '12px',
            padding: '20px',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '13px',
            lineHeight: 1.6,
            maxHeight: '480px',
            overflowY: 'auto',
            border: '1px solid rgba(212,185,150,0.15)',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.6)',
            whiteSpace: 'pre-wrap'
          }}>
            {testScenario === 'broken' ? failingLogs : passingLogs}
          </div>
        </div>
      )}

      {/* TAB 3: WORKFLOW YAML VIEWER */}
      {activeTab === 'yaml' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8F6F1' }}>
                GitHub Actions Workflow Configuration
              </div>
              <div style={{ fontSize: '12px', color: '#94A3B8' }}>
                File Location: <code style={{ color: '#D4B996' }}>.github/workflows/ci.yml</code>
              </div>
            </div>

            <button
              onClick={copyYaml}
              style={{
                background: 'rgba(212,185,150,0.2)',
                color: '#F8F6F1',
                border: '1px solid rgba(212,185,150,0.3)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <span>{copiedYaml ? 'Copied!' : 'Copy YAML'}</span>
            </button>
          </div>

          <div style={{
            background: '#090e17',
            color: '#f1f5f9',
            borderRadius: '12px',
            padding: '20px',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '13px',
            lineHeight: 1.6,
            overflowX: 'auto',
            border: '1px solid rgba(212,185,150,0.15)',
            whiteSpace: 'pre'
          }}>
            {workflowYamlContent}
          </div>
        </div>
      )}

      {/* TAB 4: THEORY, CI VS CD & VIVA ANALYSIS */}
      {activeTab === 'analysis' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(212, 185, 150, 0.15)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 800, color: '#F8F6F1' }}>
              Key Question 1: What is the difference between CI and CD, and which does Practical 12 demonstrate?
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#cbd5e1', lineHeight: 1.6 }}>
              <strong style={{ color: '#F8F6F1' }}>Continuous Integration (CI)</strong> is the automated practice of integrating code changes into a shared repository frequently (often multiple times per day). Each commit triggers an automated build and test pipeline to immediately detect syntax errors, broken tests, and integration conflicts.
            </p>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#cbd5e1', lineHeight: 1.6 }}>
              <strong style={{ color: '#F8F6F1' }}>Continuous Delivery (CD)</strong> automatically stages tested code releases so they are always in a deployable state. <strong style={{ color: '#F8F6F1' }}>Continuous Deployment</strong> goes one step further by automatically pushing green builds directly to production environments (e.g. DockerHub, AWS, Vercel).
            </p>
            <div style={{
              background: 'rgba(16, 185, 129, 0.12)',
              borderLeft: '4px solid #10b981',
              padding: '10px 14px',
              borderRadius: '4px',
              fontSize: '13px',
              color: '#4ade80',
              fontWeight: 600
            }}>
              <strong>Practical 12 Conclusion:</strong> This practical demonstrates <strong>Continuous Integration (CI)</strong> — automatically pulling code, installing dependencies, running ESLint and Jest/Supertest suites on push, and reporting pass/fail status without pushing to a live production hosting target.
            </div>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(212, 185, 150, 0.15)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 800, color: '#F8F6F1' }}>
              Key Question 2: Why does running tests automatically on every push catch problems earlier than testing manually before release?
            </h3>
            <ul style={{ margin: '0 0 0 18px', padding: 0, fontSize: '14px', color: '#cbd5e1', lineHeight: 1.7 }}>
              <li><strong style={{ color: '#F8F6F1' }}>Immediate Root Cause Isolation:</strong> The offending change is tied directly to the exact commit SHA that introduced it, drastically reducing debugging time from hours to seconds.</li>
              <li><strong style={{ color: '#F8F6F1' }}>Eliminates "Works on My Machine" Syndrome:</strong> Tests execute in a clean, pristine containerized Ubuntu runner with isolated Node.js environments.</li>
              <li><strong style={{ color: '#F8F6F1' }}>Prevents Merge Pollution:</strong> Pull Request checks can enforce branch protection rules preventing broken code from ever reaching the <code>main</code> branch.</li>
            </ul>
          </div>

          <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(212, 185, 150, 0.15)',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 800, color: '#F8F6F1' }}>
              Key Question 3: What happens if the test file path is incorrect? Would it fail at the same step?
            </h3>
            <p style={{ margin: '0', fontSize: '14px', color: '#cbd5e1', lineHeight: 1.6 }}>
              If the test path is incorrect, Jest exits with <em>"No tests found related to files matching..."</em> or exit code 1 depending on <code>--passWithNoTests</code>. While it fails in the <code>npm test</code> step, the failure log specifically states a <strong style={{ color: '#F8F6F1' }}>configuration / path error</strong> rather than an <strong style={{ color: '#F8F6F1' }}>assertion expectation mismatch</strong> (e.g. <code>expect(received).toBe(expected)</code>).
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: LAB SCREENSHOT CHECKLIST */}
      {activeTab === 'checklist' && (
        <div>
          <div style={{
            background: 'rgba(30, 41, 59, 0.7)',
            border: '1px solid rgba(212, 185, 150, 0.2)',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#F8F6F1', marginBottom: '4px' }}>
              Required Screenshots for Practical 12 Lab Journal Submission
            </div>
            <div style={{ fontSize: '13px', color: '#94A3B8' }}>
              Here is the exact checklist of screenshots to take for your lab report and journal evaluation:
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              {
                num: '1',
                title: 'Local Test Suite Execution Passing in Terminal',
                desc: 'Open your terminal, run `npm test` inside the backend or root folder, and capture the green passing Jest test output showing all 6 test cases passed.',
                cmd: 'npm test'
              },
              {
                num: '2',
                title: 'GitHub Actions Tab Showing Registered Workflow',
                desc: 'Push your commits to GitHub, open your repository on github.com/Utsav-047/MyPortfolio, click the "Actions" tab, and screenshot the "CI Pipeline" workflow listing.',
                cmd: 'git push origin main'
              },
              {
                num: '3',
                title: 'Deliberately Broken Test Run (Red X Mark on GitHub)',
                desc: 'Screenshot the failed pipeline run on GitHub with the Red X indicator, showing the test assertion failure details under Job: build-and-test -> Execute Automated Test Suite.',
                cmd: 'git commit -m "test: deliberate broken test assertion"'
              },
              {
                num: '4',
                title: 'Fixed Pipeline Run (Green Checkmark on GitHub)',
                desc: 'Screenshot the subsequent workflow run turning green with all checkmarks: Checkout -> Setup Node -> Lint -> Install Dependencies -> Automated Test Suite -> Build.',
                cmd: 'git commit -m "fix(test): correct assertion to restore green pipeline"'
              },
              {
                num: '5',
                title: 'Repository README Status Badge',
                desc: 'Screenshot the top of your GitHub repository README showing the live dynamic SVG status badge displaying "passing" in green.',
                cmd: '[![CI Pipeline](.../badge.svg)](...)'
              },
              {
                num: '6',
                title: 'Task Manager CI/CD Interactive Dashboard',
                desc: 'Screenshot this interactive Task Manager CI/CD Pipeline dashboard displaying the DAG nodes, terminal execution logs, and workflow status.',
                cmd: 'npm run dev -> Task Manager -> CI/CD Pipeline Tab'
              }
            ].map(item => (
              <div
                key={item.num}
                style={{
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(212, 185, 150, 0.12)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(212, 185, 150, 0.2)',
                  color: '#D4B996',
                  border: '1px solid rgba(212, 185, 150, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '14px',
                  flexShrink: 0
                }}>
                  {item.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#F8F6F1' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#94a3b8', margin: '4px 0 8px 0', lineHeight: 1.5 }}>
                    {item.desc}
                  </div>
                  <code style={{
                    fontSize: '12px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    color: '#cbd5e1'
                  }}>
                    {item.cmd}
                  </code>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CicdPipeline;
