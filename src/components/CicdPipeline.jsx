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
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.03)',
      marginTop: '16px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          background: toast.type === 'error' ? '#ef4444' : toast.type === 'info' ? '#3b82f6' : '#10b981',
          color: '#ffffff',
          padding: '12px 20px',
          borderRadius: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          zIndex: 99999,
          fontWeight: 600,
          fontSize: '14px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          {toast.message}
        </div>
      )}

      {/* Header & Status Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        paddingBottom: '20px',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '26px' }}>🚀</span>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
              CI/CD Pipeline with GitHub Actions
            </h2>
            <span style={{
              background: '#ede9fe',
              color: '#4f46e5',
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '20px',
              border: '1px solid #c7d2fe'
            }}>
              Practical 12 • CO5 / PO3, PO5
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#64748b' }}>
            Automated Continuous Integration pipeline with GitHub Actions, Jest unit testing, Supertest API verification, and ESLint code quality gates.
          </p>
        </div>

        {/* Live CI Pipeline Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: pipelineState === 'success' ? '#ecfdf5' : pipelineState === 'failed' ? '#fff1f2' : '#f0f9ff',
          padding: '10px 18px',
          borderRadius: '12px',
          border: `1px solid ${pipelineState === 'success' ? '#a7f3d0' : pipelineState === 'failed' ? '#fecdd3' : '#bae6fd'}`
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: pipelineState === 'success' ? '#10b981' : pipelineState === 'failed' ? '#ef4444' : '#0284c7',
            boxShadow: `0 0 8px ${pipelineState === 'success' ? '#10b981' : pipelineState === 'failed' ? '#ef4444' : '#0284c7'}`,
            animation: pipelineState === 'running' ? 'pulse 1s infinite' : 'none'
          }} />
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Workflow Status
            </div>
            <div style={{
              fontSize: '15px',
              fontWeight: 800,
              color: pipelineState === 'success' ? '#065f46' : pipelineState === 'failed' ? '#991b1b' : '#0369a1'
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
        gap: '8px',
        margin: '20px 0',
        flexWrap: 'wrap'
      }}>
        {[
          { key: 'pipeline', label: '🔄 Interactive Pipeline DAG', icon: '⚡' },
          { key: 'terminal', label: '💻 GitHub Actions Run Logs', icon: '📜' },
          { key: 'yaml', label: '📄 .github/workflows/ci.yml', icon: '⚙️' },
          { key: 'analysis', label: '🧠 Theory & Key Analysis', icon: '📚' },
          { key: 'checklist', label: '📸 Lab Screenshot Guide', icon: '✅' }
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            style={{
              padding: '9px 18px',
              borderRadius: '10px',
              border: activeTab === t.key ? 'none' : '1px solid #e2e8f0',
              background: activeTab === t.key ? color : '#f8fafc',
              color: activeTab === t.key ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <span>{t.icon}</span>
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
            background: '#f8fafc',
            padding: '16px 20px',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            marginBottom: '20px'
          }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                Pipeline Test Execution Simulator
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                Simulate a real commit push, broken test assertion failure, or fixed green pipeline run.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={() => runSimulation('healthy')}
                disabled={pipelineState === 'running'}
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: pipelineState === 'running' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(16,185,129,0.2)'
                }}
              >
                <span>🟢</span> Run Passing Pipeline (Green Check)
              </button>

              <button
                onClick={() => runSimulation('broken')}
                disabled={pipelineState === 'running'}
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '9px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: pipelineState === 'running' ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 4px rgba(239,68,68,0.2)'
                }}
              >
                <span>🔴</span> Deliberately Break Test (Red X Mark)
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
                  background: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
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
                <span>🛠️</span> Fix Test &amp; Reset
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

              let badgeBg = '#f1f5f9';
              let badgeColor = '#64748b';
              let icon = '⚪';

              if (isFailed) {
                badgeBg = '#fee2e2';
                badgeColor = '#b91c1c';
                icon = '❌';
              } else if (isPassed) {
                badgeBg = '#dcfce7';
                badgeColor = '#15803d';
                icon = '✅';
              } else if (isCurrent) {
                badgeBg = '#e0f2fe';
                badgeColor = '#0369a1';
                icon = '⏳';
              } else if (isSkipped) {
                badgeBg = '#f8fafc';
                badgeColor = '#94a3b8';
                icon = '⏭️';
              }

              return (
                <div
                  key={step.id}
                  style={{
                    background: '#ffffff',
                    border: `1px solid ${isFailed ? '#fca5a5' : isPassed ? '#bbf7d0' : isCurrent ? '#7dd3fc' : '#e2e8f0'}`,
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                    boxShadow: isCurrent ? '0 4px 12px rgba(2,132,199,0.15)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 800,
                      color: '#64748b',
                      background: '#f1f5f9',
                      padding: '2px 8px',
                      borderRadius: '6px'
                    }}>
                      Step {step.id}
                    </span>
                    <span style={{
                      background: badgeBg,
                      color: badgeColor,
                      fontSize: '11px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span>{icon}</span>
                      <span>
                        {isFailed ? 'FAILED' : isPassed ? 'PASSED' : isCurrent ? 'RUNNING' : isSkipped ? 'SKIPPED' : 'PENDING'}
                      </span>
                    </span>
                  </div>

                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                      {step.name}
                    </div>
                    <code style={{ fontSize: '11px', color: '#475569', background: '#f8fafc', padding: '2px 6px', borderRadius: '4px', wordBreak: 'break-all' }}>
                      {step.command}
                    </code>
                  </div>

                  <div style={{ fontSize: '11px', color: '#94a3b8', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Duration:</span>
                    <strong>{step.duration}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Repository & Trigger Metadata Card */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '18px 22px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>GitHub Repository</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                <a
                  href="https://github.com/Utsav-047/MyPortfolio"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: '#4f46e5', textDecoration: 'none' }}
                >
                  Utsav-047/MyPortfolio ↗
                </a>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Trigger Event &amp; Branch</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                <code>push</code> on <code>origin/main</code>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Commit Hash (SHA)</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
                <code>{commitSha}</code> ({testScenario === 'broken' ? 'Deliberate Failure' : 'Verified CI Green'})
              </div>
            </div>

            <div>
              <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>README CI Status Badge</div>
              <div style={{ marginTop: '4px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: pipelineState === 'success' ? '#10b981' : '#ef4444',
                  color: '#ffffff',
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
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
              Execution Console Output ({testScenario === 'broken' ? 'Run #43 - FAILED' : 'Run #42 - PASSED'})
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setTestScenario('healthy')}
                style={{
                  background: testScenario === 'healthy' ? '#10b981' : '#f1f5f9',
                  color: testScenario === 'healthy' ? '#fff' : '#475569',
                  border: 'none',
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
                  background: testScenario === 'broken' ? '#ef4444' : '#f1f5f9',
                  color: testScenario === 'broken' ? '#fff' : '#475569',
                  border: 'none',
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
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '12px',
            padding: '20px',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '13px',
            lineHeight: 1.6,
            maxHeight: '480px',
            overflowY: 'auto',
            border: '1px solid #1e293b',
            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.5)',
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
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                GitHub Actions Workflow Configuration
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                File Location: <code>.github/workflows/ci.yml</code>
              </div>
            </div>

            <button
              onClick={copyYaml}
              style={{
                background: '#4f46e5',
                color: '#ffffff',
                border: 'none',
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
              <span>{copiedYaml ? '✅ Copied!' : '📋 Copy YAML'}</span>
            </button>
          </div>

          <div style={{
            background: '#1e293b',
            color: '#f1f5f9',
            borderRadius: '12px',
            padding: '20px',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '13px',
            lineHeight: 1.6,
            overflowX: 'auto',
            border: '1px solid #334155',
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
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              ❓ Key Question 1: What is the difference between CI and CD, and which does Practical 12 demonstrate?
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#334155', lineHeight: 1.6 }}>
              <strong>Continuous Integration (CI)</strong> is the automated practice of integrating code changes into a shared repository frequently (often multiple times per day). Each commit triggers an automated build and test pipeline to immediately detect syntax errors, broken tests, and integration conflicts.
            </p>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#334155', lineHeight: 1.6 }}>
              <strong>Continuous Delivery (CD)</strong> automatically stages tested code releases so they are always in a deployable state. <strong>Continuous Deployment</strong> goes one step further by automatically pushing green builds directly to production environments (e.g. DockerHub, AWS, Vercel).
            </p>
            <div style={{
              background: '#ecfdf5',
              borderLeft: '4px solid #10b981',
              padding: '10px 14px',
              borderRadius: '4px',
              fontSize: '13px',
              color: '#065f46',
              fontWeight: 600
            }}>
              💡 <strong>Practical 12 Conclusion:</strong> This practical demonstrates <strong>Continuous Integration (CI)</strong> — automatically pulling code, installing dependencies, running ESLint and Jest/Supertest suites on push, and reporting pass/fail status without pushing to a live production hosting target.
            </div>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              ❓ Key Question 2: Why does running tests automatically on every push catch problems earlier than testing manually before release?
            </h3>
            <ul style={{ margin: '0 0 0 18px', padding: 0, fontSize: '14px', color: '#334155', lineHeight: 1.7 }}>
              <li><strong>Immediate Root Cause Isolation:</strong> The offending change is tied directly to the exact commit SHA that introduced it, drastically reducing debugging time from hours to seconds.</li>
              <li><strong>Eliminates "Works on My Machine" Syndrome:</strong> Tests execute in a clean, pristine containerized Ubuntu runner with isolated Node.js environments.</li>
              <li><strong>Prevents Merge Pollution:</strong> Pull Request checks can enforce branch protection rules preventing broken code from ever reaching the <code>main</code> branch.</li>
            </ul>
          </div>

          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              ❓ Key Question 3: What happens if the test file path is incorrect? Would it fail at the same step?
            </h3>
            <p style={{ margin: '0', fontSize: '14px', color: '#334155', lineHeight: 1.6 }}>
              If the test path is incorrect, Jest exits with <em>"No tests found related to files matching..."</em> or exit code 1 depending on <code>--passWithNoTests</code>. While it fails in the <code>npm test</code> step, the failure log specifically states a <strong>configuration / path error</strong> rather than an <strong>assertion expectation mismatch</strong> (e.g. <code>expect(received).toBe(expected)</code>).
            </p>
          </div>
        </div>
      )}

      {/* TAB 5: LAB SCREENSHOT CHECKLIST */}
      {activeTab === 'checklist' && (
        <div>
          <div style={{
            background: '#ede9fe',
            border: '1px solid #c7d2fe',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#3730a3', marginBottom: '4px' }}>
              📸 Required Screenshots for Practical 12 Lab Journal Submission
            </div>
            <div style={{ fontSize: '13px', color: '#4338ca' }}>
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
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
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
                  background: '#4f46e5',
                  color: '#ffffff',
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
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '13px', color: '#475569', margin: '4px 0 8px 0', lineHeight: 1.5 }}>
                    {item.desc}
                  </div>
                  <code style={{
                    fontSize: '12px',
                    background: '#f1f5f9',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    color: '#334155'
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
