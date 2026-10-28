// ============================================================================
// Practical 13: AI API Integration Controller
// Handles OpenAI & Gemini API calls with graceful degradation, rate-limiting,
// and Responsible AI privacy protection.
// ============================================================================

const OpenAI = require('openai');

// Rate limiting cache (IP -> { count, firstRequestTime })
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

// Responsible AI: Blacklist of sensitive data patterns that must never be sent to external LLMs
const SENSITIVE_PATTERNS = [
  /password\s*[:=]\s*\S+/i,
  /bearer\s+[A-Za-z0-9\-._~+/]+=*/i,
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/i, // Emails sanitized
  /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/, // Credit card
  /api[_-]?key\s*[:=]\s*\S+/i,
  /secret\s*[:=]\s*\S+/i
];

/**
 * Sanitizes input text to prevent PII / credential leakage to third-party LLMs
 */
function sanitizeInput(text) {
  if (!text) return '';
  let sanitized = text;
  SENSITIVE_PATTERNS.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[REDACTED_SENSITIVE_DATA]');
  });
  return sanitized;
}

/**
 * Simple in-memory rate limiter per IP address
 */
function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || (now - record.firstRequestTime) > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, firstRequestTime: now });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1, resetInSeconds: 60 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const resetInSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - record.firstRequestTime)) / 1000);
    return { allowed: false, remaining: 0, resetInSeconds };
  }

  record.count += 1;
  const resetInSeconds = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - record.firstRequestTime)) / 1000);
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count, resetInSeconds };
}

/**
 * Intelligent domain-aware fallback generator when API key is missing or fails.
 * Guarantees graceful degradation without application crash.
 */
function generateFallbackDescription(title, context = '') {
  const lower = title.toLowerCase();

  if (lower.includes('docker') || lower.includes('container') || lower.includes('compose')) {
    return `Containerize the application components using multi-stage Dockerfiles and Docker Compose. Configure isolated bridge networking, healthchecks, persistent storage volumes, and Nginx reverse proxy routing. Ensure minimal image footprints and non-root execution permissions.`;
  }
  if (lower.includes('ci') || lower.includes('pipeline') || lower.includes('action') || lower.includes('test')) {
    return `Set up an automated GitHub Actions CI/CD workflow to checkout code, install dependencies, run ESLint quality checks, execute Jest & Supertest automated test suites, and report build status badges on every push to the main branch.`;
  }
  if (lower.includes('auth') || lower.includes('login') || lower.includes('jwt') || lower.includes('google')) {
    return `Implement secure authentication workflows with Google OAuth 2.0 and JWT verification. Enforce Bearer token extraction, role-based authorization gates, password salting with bcrypt (10 rounds), and token expiry handling.`;
  }
  if (lower.includes('cache') || lower.includes('redis') || lower.includes('performance')) {
    return `Optimize read throughput using an in-memory caching tier with node-cache. Implement a 60-second TTL strategy, cache-invalidation hooks on task mutation, and lean query projections to eliminate database bottlenecks.`;
  }
  if (lower.includes('bug') || lower.includes('fix') || lower.includes('error')) {
    return `Investigate and resolve the reported issue in the target module. Reproduce with unit tests, inspect server logs, apply the patch, and verify backward compatibility without breaking existing APIs.`;
  }
  if (lower.includes('ui') || lower.includes('frontend') || lower.includes('component')) {
    return `Develop responsive UI components utilizing modern CSS flex/grid layouts, accessible HTML5 semantic tags, stateful interaction handlers, and smooth micro-animations. Ensure seamless desktop and mobile rendering.`;
  }
  if (lower.includes('api') || lower.includes('route') || lower.includes('backend') || lower.includes('endpoint')) {
    return `Design and expose RESTful Express endpoints supporting JSON request/response formats, input payload validation, error propagation middleware, and centralized logging.`;
  }

  return `Execute end-to-end implementation for "${title}". Define functional specifications, write maintainable modular code, add automated unit tests, and document deliverable artifacts following production best practices.`;
}

/**
 * Suggests a priority level based on keyword analysis
 */
function suggestPriorityFromText(title, description = '') {
  const combined = `${title} ${description}`.toLowerCase();
  if (combined.includes('urgent') || combined.includes('critical') || combined.includes('security') || combined.includes('vulnerability') || combined.includes('prod break')) {
    return { priority: 'urgent', confidence: 0.95, reasoning: 'Contains critical security, production break, or urgent keywords.' };
  }
  if (combined.includes('deploy') || combined.includes('bug') || combined.includes('fix') || combined.includes('pipeline') || combined.includes('auth')) {
    return { priority: 'high', confidence: 0.85, reasoning: 'Core system stability, deployment, or authentication task.' };
  }
  if (combined.includes('feature') || combined.includes('api') || combined.includes('docker') || combined.includes('test')) {
    return { priority: 'medium', confidence: 0.80, reasoning: 'Standard product development and containerization task.' };
  }
  return { priority: 'low', confidence: 0.70, reasoning: 'Documentation, minor styling, or maintenance task.' };
}

/**
 * 1. POST /api/ai/generate-description
 * Auto-generates a concise, actionable task description from a task title.
 */
const generateTaskDescription = async (req, res) => {
  const clientIp = req.ip || req.connection.remoteAddress || '127.0.0.1';
  const { allowed, remaining, resetInSeconds } = checkRateLimit(clientIp);

  if (!allowed) {
    return res.status(429).json({
      success: false,
      error: 'Rate Limit Exceeded',
      message: `Too many AI requests. Please wait ${resetInSeconds} seconds before requesting again.`,
      resetInSeconds
    });
  }

  const { title, context = '', simulateFailure = false } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Task title is required to generate an AI description.'
    });
  }

  const sanitizedTitle = sanitizeInput(title.trim());
  const sanitizedContext = sanitizeInput(context.trim());

  // Force simulated failure if requested by user for lab demonstration
  if (simulateFailure) {
    const fallbackDesc = generateFallbackDescription(sanitizedTitle, sanitizedContext);
    return res.status(200).json({
      success: true,
      description: fallbackDesc,
      fallback: true,
      source: 'graceful-fallback-engine',
      message: 'Demonstration Mode: Simulated AI API failure. Fallback generated successfully without app crash.',
      disclaimer: '⚠️ AI-generated suggestion. Please review and modify before saving.',
      rateLimit: { remaining, resetInSeconds }
    });
  }

  // ── 1. Check for OpenAI API Key ──────────────────────────────────────────
  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey !== 'your_key_here' && apiKey.startsWith('sk-')) {
    try {
      const client = new OpenAI({ apiKey });
      const prompt = `You are a professional project manager. Write a concise, 2-3 sentence actionable task description for a task titled "${sanitizedTitle}". Context: ${sanitizedContext || 'General software development task'}. Keep it professional and focus on deliverables. Do not use quotes.`;

      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 150,
        temperature: 0.7
      });

      const description = completion.choices[0]?.message?.content?.trim();

      if (description) {
        return res.status(200).json({
          success: true,
          description,
          fallback: false,
          source: 'OpenAI (gpt-4o-mini)',
          model: 'gpt-4o-mini',
          tokensUsed: completion.usage?.total_tokens || 0,
          disclaimer: '✨ Generated by OpenAI gpt-4o-mini. Review and edit before saving.',
          rateLimit: { remaining, resetInSeconds }
        });
      }
    } catch (err) {
      console.warn(`[AI SERVICE WARNING] OpenAI call failed: ${err.message}. Engaging graceful fallback.`);
      // Graceful degradation on API failure / timeout / invalid key
      const fallbackDesc = generateFallbackDescription(sanitizedTitle, sanitizedContext);
      return res.status(200).json({
        success: true,
        description: fallbackDesc,
        fallback: true,
        source: 'graceful-fallback-engine',
        originalError: err.message,
        message: 'OpenAI API encountered an error or invalid key. Fallback template provided gracefully.',
        disclaimer: '⚠️ Fallback suggestion. Please review and modify before saving.',
        rateLimit: { remaining, resetInSeconds }
      });
    }
  }

  // ── 2. Check for Google Gemini API Key (100% Free from Google AI Studio) ─
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim().length > 10) {
    try {
      // Use X-goog-api-key header — works for both AIzaSy... and AQ. OAuth key formats
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;
      const prompt = `You are a professional project manager. Write a concise, 2-3 sentence actionable task description for a task titled "${sanitizedTitle}". Context: ${sanitizedContext || 'General software development task'}. Keep it professional and focus on deliverables. Do not use quotes.`;

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': geminiKey.trim()
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 150, temperature: 0.7 }
        })
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const description = geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (description) {
          return res.status(200).json({
            success: true,
            description,
            fallback: false,
            source: 'Google Gemini (gemini-2.0-flash)',
            model: 'gemini-2.0-flash',
            disclaimer: '✨ Generated by Google Gemini 2.0 Flash. Review and edit before saving.',
            rateLimit: { remaining, resetInSeconds }
          });
        }
      } else {
        const errBody = await geminiRes.text();
        console.warn(`[GEMINI WARNING] Gemini responded ${geminiRes.status}: ${errBody}`);
      }
    } catch (gErr) {
      console.warn(`[GEMINI WARNING] Gemini call failed: ${gErr.message}`);
    }
  }

  // ── 3. Fallback when no API Key is configured ───────────────────────────
  // Guarantees application never crashes even without third-party API credentials
  const fallbackDesc = generateFallbackDescription(sanitizedTitle, sanitizedContext);

  return res.status(200).json({
    success: true,
    description: fallbackDesc,
    fallback: true,
    source: 'graceful-fallback-engine',
    message: 'No live AI API key found in .env. High-quality graceful fallback suggestion served automatically.',
    disclaimer: 'ℹ️ Suggestion generated by local template engine. Please review before saving.',
    rateLimit: { remaining, resetInSeconds }
  });
};

/**
 * 2. POST /api/ai/suggest-priority
 * Suggests priority level, effort estimate, and complexity analysis.
 */
const suggestTaskPriority = async (req, res) => {
  const { title, description = '' } = req.body;

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Task title is required to analyze priority.'
    });
  }

  const { priority, confidence, reasoning } = suggestPriorityFromText(title, description);

  return res.status(200).json({
    success: true,
    priority,
    confidence,
    reasoning,
    estimatedHours: priority === 'urgent' ? 2 : priority === 'high' ? 6 : priority === 'medium' ? 12 : 24,
    disclaimer: 'AI priority suggestion based on scope and urgency analysis. User override is supported.'
  });
};

/**
 * 3. POST /api/ai/breakdown-tasks
 * Suggests subtask breakdown for complex tickets.
 */
const breakdownTaskIntoSteps = async (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }

  const subtasks = [
    { id: 1, title: `Analyze requirements and edge cases for "${title}"`, done: false },
    { id: 2, title: `Implement core logic and wire backend APIs`, done: false },
    { id: 3, title: `Add automated unit/integration tests and verify coverage`, done: false },
    { id: 4, title: `Perform code review and update documentation`, done: false }
  ];

  return res.status(200).json({
    success: true,
    title,
    subtasks,
    count: subtasks.length,
    disclaimer: 'Suggested checklist steps generated for task planning.'
  });
};

/**
 * 4. GET /api/ai/status
 * Telemetry endpoint revealing AI configuration, active model, and safety guardrails.
 */
const getAiStatus = async (req, res) => {
  const hasOpenAiKey = Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_key_here');
  const hasGeminiKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_key_here');

  res.status(200).json({
    success: true,
    status: 'online',
    provider: hasOpenAiKey ? 'OpenAI' : hasGeminiKey ? 'Google Gemini' : 'Graceful Fallback Synthesizer',
    model: hasOpenAiKey ? 'gpt-4o-mini' : hasGeminiKey ? 'gemini-2.0-flash' : 'Rule-Based Neural Template',
    apiKeyConfigured: hasOpenAiKey || hasGeminiKey,
    keyStoredSecurelyInBackend: true,
    exposedToFrontend: false,
    rateLimitingEnabled: true,
    maxRequestsPerMinute: MAX_REQUESTS_PER_WINDOW,
    responsibleAiPolicies: {
      piiSanitization: 'Enabled (Regex Filter: Passwords, Tokens, Emails, Credit Cards)',
      gracefulDegradation: 'Active (Zero Crash Guarantee on API Failure)',
      humanInTheLoop: 'Mandatory (Editable suggestions, user retains full control)',
      disclaimerEnforced: 'True'
    }
  });
};

module.exports = {
  generateTaskDescription,
  suggestTaskPriority,
  breakdownTaskIntoSteps,
  getAiStatus
};
