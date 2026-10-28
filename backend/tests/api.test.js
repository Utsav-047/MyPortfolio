// ============================================================================
// Automated CI/CD Test Suite for MyPortfolio Task Management API
// Practical 12: CI/CD Pipeline with GitHub Actions
// Frameworks: Jest & Supertest
// ============================================================================

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../server');

describe('Task Management API - CI/CD Automated Test Suite', () => {

  // ── Test Case 1: Core Syllabus Requirement ───────────────────────────────
  // Step 2 from Practical 12: Verify GET /tasks returns HTTP 200 status code
  test('GET /tasks returns 200', async () => {
    const res = await request(app).get('/tasks');
    // Test assertion restored to HTTP 200 OK
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ── Test Case 2: Health Check & System Status Endpoint ───────────────────
  // Post-lab task: Add second automated test covering a different endpoint
  test('GET /health returns 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
  });

  // ── Test Case 3: API Root Status Endpoint ────────────────────────────────
  test('GET / returns 200 with online status and endpoints map', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('status', 'online');
    expect(res.body.endpoints).toHaveProperty('tasks', '/api/tasks');
  });

  // ── Test Case 4: Security & Authentication Gate ─────────────────────────
  // Protected /api/tasks route must reject unauthenticated requests with 401
  test('GET /api/tasks returns 401 Unauthorized without JWT token', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error', 'Unauthorized');
  });

  // ── Test Case 5: Authenticated Task Access with JWT Bearer Token ────────
  test('GET /api/tasks returns 200 with valid JWT Bearer authentication', async () => {
    const secret = process.env.JWT_SECRET || 'utsav_myportfolio_super_secure_jwt_secret_2026';
    const testToken = jwt.sign(
      { id: 'ci-test-runner', email: 'ci.runner@github.actions', role: 'manager' },
      secret,
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${testToken}`);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  // ── Test Case 6: 404 Route Not Found Handler ────────────────────────────
  test('GET /api/non-existent-endpoint returns 404 Not Found', async () => {
    const res = await request(app).get('/api/non-existent-endpoint');
    expect(res.statusCode).toBe(404);
  });

  // ── Practical 13: AI API Integration & Graceful Degradation Tests ────────
  test('POST /api/ai/generate-description returns 200 with generated description', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .send({ title: 'Configure Docker Compose for full-stack application' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('description');
    expect(typeof res.body.description).toBe('string');
    expect(res.body.description.length).toBeGreaterThan(10);
    expect(res.body).toHaveProperty('disclaimer');
  });

  test('POST /api/ai/generate-description returns 400 when title is missing', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toBe('Validation Error');
  });

  test('POST /api/ai/generate-description handles simulated failure gracefully', async () => {
    const res = await request(app)
      .post('/api/ai/generate-description')
      .send({ title: 'Fix JWT Token validation bug', simulateFailure: true });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body.fallback).toBe(true);
    expect(res.body.source).toBe('graceful-fallback-engine');
  });

  test('POST /api/ai/suggest-priority returns suggested priority level and reasoning', async () => {
    const res = await request(app)
      .post('/api/ai/suggest-priority')
      .send({ title: 'Fix critical security vulnerability in authentication middleware' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('priority');
    expect(['low', 'medium', 'high', 'urgent']).toContain(res.body.priority);
    expect(res.body).toHaveProperty('confidence');
  });

  test('GET /api/ai/status returns AI configuration telemetry', async () => {
    const res = await request(app).get('/api/ai/status');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('responsibleAiPolicies');
    expect(res.body.keyStoredSecurelyInBackend).toBe(true);
    expect(res.body.exposedToFrontend).toBe(false);
  });

});

