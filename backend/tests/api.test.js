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

});
