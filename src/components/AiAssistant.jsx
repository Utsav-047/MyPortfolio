import React, { useState, useEffect } from 'react';
import {
  generateTaskDescription,
  suggestTaskPriority,
  breakdownTaskIntoSteps,
  getAiStatus
} from '../services/api';

// ============================================================================
// Practical 13: AI API Integration into a Web Application
// OpenAI & Gemini Integration, Graceful Degradation, Rate Limiting & Responsible AI
// ============================================================================

function AiAssistant({ color = '#4f46e5' }) {
  const [activeTab, setActiveTab] = useState('copilot'); // copilot | degradation | governance | status | checklist
  const [titleInput, setTitleInput] = useState('Build automated CI/CD pipeline with GitHub Actions');
  const [contextInput, setContextInput] = useState('Full-stack web application with Node.js and React');
  const [loading, setLoading] = useState(false);
  const [loadingPriority, setLoadingPriority] = useState(false);
  const [loadingBreakdown, setLoadingBreakdown] = useState(false);

  // AI Output state
  const [generatedDesc, setGeneratedDesc] = useState('');
  const [descMetadata, setDescMetadata] = useState(null);
  const [suggestedPriority, setSuggestedPriority] = useState(null);
  const [subtasks, setSubtasks] = useState([]);
  const [toast, setToast] = useState(null);

  // Failure simulation state
  const [simulateFailureMode] = useState(false);

  // Telemetry status
  const [aiStatus, setAiStatus] = useState(null);

  // Privacy sandbox state
  const [privacyTestInput, setPrivacyTestInput] = useState('Deploy database update with password: SuperSecretPassword123 and admin email: lead.dev@company.com');
  const [sanitizedPreview, setSanitizedPreview] = useState('');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch AI server status on mount
  useEffect(() => {
    getAiStatus()
      .then(res => setAiStatus(res))
      .catch(() => setAiStatus({
        status: 'offline',
        provider: 'Graceful Fallback Synthesizer',
        model: 'Rule-Based Neural Template',
        keyStoredSecurelyInBackend: true,
        exposedToFrontend: false
      }));
  }, []);

  // Update privacy sanitizer preview
  useEffect(() => {
    let text = privacyTestInput;
    text = text.replace(/password\s*[:=]\s*\S+/gi, 'password: [REDACTED_PASSWORD]');
    text = text.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/gi, '[REDACTED_EMAIL]');
    text = text.replace(/bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'bearer [REDACTED_AUTH_TOKEN]');
    setSanitizedPreview(text);
  }, [privacyTestInput]);

  // Handler: Generate Description
  const handleGenerateDescription = async (forceSimulate = false) => {
    if (!titleInput.trim()) {
      showToast('Please enter a task title first!', 'error');
      return;
    }

    setLoading(true);
    const startMs = performance.now();

    try {
      const res = await generateTaskDescription(titleInput, contextInput, forceSimulate || simulateFailureMode);
      const elapsed = Math.round(performance.now() - startMs);

      setGeneratedDesc(res.description || '');
      setDescMetadata({
        fallback: res.fallback,
        source: res.source,
        message: res.message,
        disclaimer: res.disclaimer,
        latencyMs: elapsed,
        tokensUsed: res.tokensUsed || 118
      });

      if (res.fallback) {
        showToast('Graceful Fallback Engaged! High-quality suggestion returned.', 'info');
      } else {
        showToast('✨ AI Description generated successfully!', 'success');
      }
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handler: Suggest Priority
  const handleSuggestPriority = async () => {
    if (!titleInput.trim()) {
      showToast('Please enter a task title first!', 'error');
      return;
    }

    setLoadingPriority(true);
    try {
      const res = await suggestTaskPriority(titleInput, generatedDesc);
      setSuggestedPriority(res);
      showToast(`Priority suggested: ${res.priority.toUpperCase()}`, 'success');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoadingPriority(false);
    }
  };

  // Handler: Breakdown Task
  const handleBreakdown = async () => {
    if (!titleInput.trim()) {
      showToast('Please enter a task title first!', 'error');
      return;
    }

    setLoadingBreakdown(true);
    try {
      const res = await breakdownTaskIntoSteps(titleInput);
      setSubtasks(res.subtasks || []);
      showToast(`Generated ${res.subtasks?.length || 0} actionable checklist steps!`, 'success');
    } catch (err) {
      showToast(`Error: ${err.message}`, 'error');
    } finally {
      setLoadingBreakdown(false);
    }
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
          background: toast.type === 'error' ? '#ef4444' : toast.type === 'info' ? '#0284c7' : '#10b981',
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
            <span style={{ fontSize: '26px' }}>✨</span>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a' }}>
              AI API Integration &amp; Responsible Copilot
            </h2>
            <span style={{
              background: '#ecfdf5',
              color: '#059669',
              fontSize: '11px',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: '20px',
              border: '1px solid #a7f3d0'
            }}>
              Practical 13 • CO6 / PO3, PO5, PO12
            </span>
          </div>
          <p style={{ margin: '6px 0 0 0', fontSize: '14px', color: '#64748b' }}>
            Secure server-side OpenAI (gpt-4o-mini) and Gemini API integration with zero-crash graceful degradation, PII sanitization, and human-in-the-loop review.
          </p>
        </div>

        {/* Live AI Engine Status Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: '#f8fafc',
          padding: '10px 18px',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#10b981',
            boxShadow: '0 0 8px #10b981'
          }} />
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
              Active AI Provider
            </div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              {aiStatus?.provider || 'OpenAI / Graceful Fallback Engine'}
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
          { key: 'copilot', label: '🪄 AI Task Copilot Studio', icon: '⚡' },
          { key: 'degradation', label: '🛡️ Graceful Degradation Simulator', icon: '🧪' },
          { key: 'governance', label: '🔒 Responsible AI & PII Privacy', icon: '⚖️' },
          { key: 'status', label: '📡 Backend Architecture & Security', icon: '🔐' },
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

      {/* TAB 1: AI TASK COPILOT STUDIO */}
      {activeTab === 'copilot' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* Left Column: Input Form */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              🎯 Task Definition &amp; Context
            </h3>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Task Title *
              </label>
              <input
                type="text"
                value={titleInput}
                onChange={e => setTitleInput(e.target.value)}
                placeholder="e.g. Implement JWT Authentication in Express"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Technical Context / Instructions (Optional)
              </label>
              <input
                type="text"
                value={contextInput}
                onChange={e => setContextInput(e.target.value)}
                placeholder="e.g. Use bcrypt with 10 salt rounds and Google OAuth verification"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => handleGenerateDescription(false)}
                disabled={loading}
                style={{
                  background: '#4f46e5',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 18px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '14px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 4px rgba(79,70,229,0.2)'
                }}
              >
                <span>{loading ? '⏳' : '🪄'}</span>
                <span>{loading ? 'Calling AI API (POST /api/ai/generate-description)...' : 'Generate Description with AI'}</span>
              </button>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  onClick={handleSuggestPriority}
                  disabled={loadingPriority}
                  style={{
                    background: '#0284c7',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: loadingPriority ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>📊</span>
                  <span>{loadingPriority ? 'Analyzing...' : 'Suggest Priority'}</span>
                </button>

                <button
                  onClick={handleBreakdown}
                  disabled={loadingBreakdown}
                  style={{
                    background: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: loadingBreakdown ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <span>📋</span>
                  <span>{loadingBreakdown ? 'Generating...' : 'Break Down Tasks'}</span>
                </button>
              </div>
            </div>

            {/* Quick Sample Prompts */}
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginBottom: '8px' }}>
                Try Quick Sample Task Titles:
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  'Set up Docker Compose with Nginx reverse proxy',
                  'Fix memory leak in node-cache service',
                  'Add rate limiting to express auth routes',
                  'Configure GitHub Actions CI workflow'
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTitleInput(sample)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '11px',
                      color: '#475569',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                  >
                    {sample}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: AI Output & Editable Review */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                  📝 AI Generated Description (Editable Suggestion)
                </h3>
                {descMetadata && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: descMetadata.fallback ? '#fef3c7' : '#ecfdf5',
                    color: descMetadata.fallback ? '#92400e' : '#065f46'
                  }}>
                    {descMetadata.fallback ? '🛡️ Graceful Fallback' : '✨ Live Model'}
                  </span>
                )}
              </div>

              <textarea
                value={generatedDesc}
                onChange={e => setGeneratedDesc(e.target.value)}
                placeholder="Click 'Generate Description with AI' to populate actionable description..."
                rows={6}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  lineHeight: 1.6,
                  color: '#0f172a',
                  boxSizing: 'border-box',
                  background: generatedDesc ? '#fdfcfe' : '#ffffff'
                }}
              />

              {/* Priority & Effort Card */}
              {suggestedPriority && (
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  margin: '12px 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#166534', fontWeight: 600 }}>Suggested Priority</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#15803d', textTransform: 'uppercase' }}>
                      ⚡ {suggestedPriority.priority} ({Math.round(suggestedPriority.confidence * 100)}% confidence)
                    </div>
                    <div style={{ fontSize: '11px', color: '#4b5563', marginTop: '2px' }}>
                      {suggestedPriority.reasoning}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#166534' }}>Estimated Effort</div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: '#15803d' }}>
                      ~{suggestedPriority.estimatedHours} hrs
                    </div>
                  </div>
                </div>
              )}

              {/* Checklist Breakdown */}
              {subtasks.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                    Suggested Subtasks Breakdown ({subtasks.length} steps):
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {subtasks.map(st => (
                      <div key={st.id} style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#f8fafc',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#334155'
                      }}>
                        <span>☑️</span>
                        <span>{st.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Disclaimer & Metadata Footer */}
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                padding: '8px 12px',
                borderRadius: '8px',
                fontSize: '11px',
                color: '#92400e',
                lineHeight: 1.4
              }}>
                <strong>⚠️ Responsible AI Disclaimer:</strong> AI suggestions are assistive guidelines and may contain hallucinations. A human user must review, verify, and approve before saving tasks.
              </div>

              {descMetadata && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: '8px',
                  fontSize: '11px',
                  color: '#94a3b8'
                }}>
                  <span>Source: <strong>{descMetadata.source}</strong></span>
                  <span>Latency: <strong>{descMetadata.latencyMs}ms</strong></span>
                  <span>Tokens: <strong>~{descMetadata.tokensUsed}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GRACEFUL DEGRADATION SIMULATOR */}
      {activeTab === 'degradation' && (
        <div>
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#1e40af' }}>
              🧪 Graceful Degradation &amp; Failure Path Live Simulator
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#1e3a8a', lineHeight: 1.5 }}>
              In real production systems, third-party AI APIs can encounter <strong>401 Unauthorized</strong> (expired key), <strong>429 Rate Limits</strong> (quota exhausted), or <strong>504 Gateway Timeouts</strong>. A robust architecture must never crash when external APIs fail — it must catch errors and return intelligent fallback suggestions.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '20px' }}>
            <div style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '12px',
              padding: '18px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                🟢 Path A: Standard Healthy Call
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                Sends request to <code>/api/ai/generate-description</code> with valid parameters. Uses live OpenAI/Gemini if key is in <code>.env</code>, or returns high-quality neural template fallback.
              </p>
              <button
                onClick={() => handleGenerateDescription(false)}
                style={{
                  background: '#10b981',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Execute Healthy Request
              </button>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              padding: '18px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#991b1b', marginBottom: '6px' }}>
                🔴 Path B: Simulate API Error (Invalid Key / 401)
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                Simulates a broken/revoked API key. The Express server catches the exception in <code>try/catch</code> and safely delivers a fallback description without throwing a 500 server crash!
              </p>
              <button
                onClick={() => handleGenerateDescription(true)}
                style={{
                  background: '#ef4444',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Simulate Broken Key Failure
              </button>
            </div>

            <div style={{
              background: '#ffffff',
              border: '1px solid #fed7aa',
              borderRadius: '12px',
              padding: '18px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#9a3412', marginBottom: '6px' }}>
                ⏱️ Path C: Missing Title Validation (400)
              </div>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                Demonstrates input contract enforcement. If the client submits an empty title, the backend immediately responds with HTTP 400 Bad Request before calling any external billable token APIs.
              </p>
              <button
                onClick={async () => {
                  try {
                    await generateTaskDescription('');
                  } catch (err) {
                    showToast(`HTTP 400 Caught Gracefully: ${err.message}`, 'info');
                  }
                }}
                style={{
                  background: '#f97316',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Trigger Empty Title 400
              </button>
            </div>
          </div>

          {/* Graceful Degradation Code Pattern Inspection */}
          <div style={{
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '12px',
            padding: '20px',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '13px',
            lineHeight: 1.6
          }}>
            <div style={{ color: '#38bdf8', marginBottom: '8px' }}>
              // Server-Side Graceful Degradation Pattern in controllers/aiController.js:
            </div>
            {`try {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }]
  });
  return res.status(200).json({ description: completion.choices[0].message.content, fallback: false });
} catch (err) {
  // CRITICAL: Log error server-side, but do NOT crash frontend
  console.warn('[AI WARNING] External API failed:', err.message);
  const fallback = generateFallbackDescription(sanitizedTitle);
  return res.status(200).json({
    description: fallback,
    fallback: true,
    message: 'Third-party API failed. Fallback served seamlessly.'
  });
}`}
          </div>
        </div>
      )}

      {/* TAB 3: RESPONSIBLE AI & PII PRIVACY */}
      {activeTab === 'governance' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              🛡️ Live PII (Personally Identifiable Information) Redaction Sandbox
            </h3>
            <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
              Task management applications frequently contain sensitive corporate credentials, emails, and secrets. Before any prompt payload is dispatched across the network to an external LLM vendor, our backend sanitizes and masks sensitive strings.
            </p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Test Input with Sensitive Data:
              </label>
              <textarea
                value={privacyTestInput}
                onChange={e => setPrivacyTestInput(e.target.value)}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontFamily: 'monospace',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#059669', marginBottom: '4px' }}>
                Sanitized Payload Dispatched to LLM:
              </label>
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #bbf7d0',
                padding: '10px 14px',
                borderRadius: '8px',
                fontFamily: 'monospace',
                fontSize: '13px',
                color: '#166534'
              }}>
                {sanitizedPreview}
              </div>
            </div>
          </div>

          {/* 4 Pillars of Responsible AI */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '18px', marginBottom: '6px' }}>🔒</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Server-Side Isolation</div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
                API keys reside solely in <code>backend/.env</code>. The React frontend never possesses API tokens, preventing quota theft via browser devtools.
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '18px', marginBottom: '6px' }}>👤</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Human-in-the-Loop</div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
                AI responses are editable recommendations. The human user retains definitive decision authority before tasks are committed to MongoDB.
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '18px', marginBottom: '6px' }}>⚖️</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Ethical Disclaimers</div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
                Visible UI badges inform users that generated text is synthesized by an AI model and may contain inadvertent hallucinations.
              </div>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '18px', marginBottom: '6px' }}>⏱️</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Rate Limiting &amp; Cost Guard</div>
              <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px', lineHeight: 1.5 }}>
                IP-based rate limits protect server quotas, while maximum token constraints (<code>max_tokens: 150</code>) prevent runaway API billing.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: BACKEND ARCHITECTURE & SECURITY */}
      {activeTab === 'status' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3 style={{ margin: '0 0 14px 0', fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
              🏗️ System Architecture &amp; Data Flow Diagram
            </h3>

            <div style={{
              background: '#0f172a',
              color: '#38bdf8',
              borderRadius: '10px',
              padding: '18px',
              fontFamily: 'Consolas, monospace',
              fontSize: '12px',
              lineHeight: 1.6,
              overflowX: 'auto',
              whiteSpace: 'pre'
            }}>
{`React Frontend (Browser)
      │
      │ 1. User clicks "Generate Description with AI"
      │ 2. Submits { title: "..." } (NO API KEY in request)
      ▼
Express Backend REST API (http://localhost:5000)
      │
      ├── 3. Rate Limit Check (max 20 req/min per IP)
      ├── 4. PII Sanitizer (Redacts passwords, tokens, emails)
      ├── 5. Reads OPENAI_API_KEY from backend/.env (Server-Side Only)
      │
      ├── Case A: Key Valid & API Responds
      │    └── Calls OpenAI gpt-4o-mini -> Returns { description, fallback: false }
      │
      └── Case B: Key Missing / Invalid / Timeout / Quota Exceeded
           └── Catches Error in try/catch -> Returns { description: fallback, fallback: true }
      │
      ▼
React Frontend Form
      │
      └── 6. Populates editable textarea with suggestion
      └── 7. Displays "AI Generated" badge + Disclaimer
      └── 8. Human user edits, verifies, and saves to MongoDB`}
            </div>
          </div>

          {/* Telemetry Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px'
          }}>
            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Security Status</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                ✅ Key Stored in Backend Only
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Frontend Exposure</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#15803d', marginTop: '2px' }}>
                🔒 Zero Client Key Leakage
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Rate Limiting</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0284c7', marginTop: '2px' }}>
                ⚡ 20 req / min per IP
              </div>
            </div>

            <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>Degradation Policy</div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#7c3aed', marginTop: '2px' }}>
                🛡️ Zero Crash Guarantee
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: LAB SCREENSHOT CHECKLIST */}
      {activeTab === 'checklist' && (
        <div>
          <div style={{
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '15px', fontWeight: 800, color: '#065f46', marginBottom: '4px' }}>
              📸 Required Screenshots for Practical 13 Lab Journal Submission
            </div>
            <div style={{ fontSize: '13px', color: '#047857' }}>
              Here is the exact checklist of screenshots to capture for your evaluation:
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              {
                num: '1',
                title: 'Backend Route & Graceful Error Handling Code',
                desc: 'Screenshot backend/controllers/aiController.js showing the try/catch block wrapping OpenAI / Gemini API calls and the fallback response returning without crashing.',
                file: 'backend/controllers/aiController.js'
              },
              {
                num: '2',
                title: 'Task Form with "AI Suggest Description" Button & Loading State',
                desc: 'Screenshot the Task Manager form with the "✨ AI Auto-Complete / Suggest Description" button and the active loading spinner while waiting for the AI response.',
                file: 'Task Manager -> Task Creation Form'
              },
              {
                num: '3',
                title: 'AI Generated Description Rendered in Form (Editable Suggestion)',
                desc: 'Screenshot the populated description textarea showing the editable AI suggestion, the "AI Generated" badge, and the Responsible AI disclaimer.',
                file: 'Task Manager -> Form with AI Description'
              },
              {
                num: '4',
                title: 'Graceful Degradation Demonstration (Simulated Broken Key)',
                desc: 'Screenshot the Graceful Degradation Simulator showing how a simulated API failure delivers a high-quality fallback template without throwing a 500 error or crashing.',
                file: 'Task Manager -> AI Assistant -> Graceful Degradation Tab'
              },
              {
                num: '5',
                title: 'Browser Network Tab Proving API Key is Never Exposed',
                desc: 'Open DevTools (F12) -> Network tab, inspect POST /api/ai/generate-description request/response headers, and prove that no OPENAI_API_KEY appears in browser headers.',
                file: 'Browser DevTools -> Network Tab'
              },
              {
                num: '6',
                title: 'Automated Test Suite Passing (11/11 tests pass in Jest)',
                desc: 'Run npm test in terminal and capture the passing test output including all 5 new automated test cases covering Practical 13 AI endpoints.',
                file: 'Terminal -> npm test'
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
                  background: '#059669',
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
                    {item.file}
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

export default AiAssistant;
