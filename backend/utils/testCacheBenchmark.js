/**
 * In-Memory Caching & Performance Benchmark Verification
 * 
 * Tests the caching behavior of GET /api/tasks:
 * 1. Simulates authenticated GET /api/tasks requests
 * 2. Measures response latency (Uncached vs. Cached)
 * 3. Tests cache invalidation on write operations
 * 4. Outputs at least 3 sample readings for uncached vs cached
 */

require('dotenv').config();
const jwt = require('jsonwebtoken');

// A sample user ID matching MongoDB ObjectId format (24 hex characters)
const sampleUserId = '6a96cff1fe495756006aaec6';
const secret = process.env.JWT_SECRET || 'utsav_myportfolio_super_secure_jwt_secret_2026';

// Generate valid JWT
const token = jwt.sign(
  {
    id: sampleUserId,
    email: 'utsavpatel788190@gmail.com',
    name: 'Utsav Patel',
    role: 'manager'
  },
  secret,
  { expiresIn: '1h' }
);

console.log('Generated test token for user:', sampleUserId);
console.log('Starting benchmark against server at http://localhost:5000 ...\n');

async function runBenchmark() {
  const url = 'http://localhost:5000/api/tasks';
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Helper to make a request and measure round-trip time
  async function timedRequest(label) {
    const start = performance.now();
    const res = await fetch(url, { headers });
    const duration = (performance.now() - start).toFixed(2);
    const data = await res.json();
    const cacheHeader = res.headers.get('x-cache') || 'N/A';
    return { status: res.status, duration: parseFloat(duration), cacheHeader, count: data.count || 0 };
  }

  // 1. Flush cache first to ensure cold state
  await fetch('http://localhost:5000/api/tasks/cache', { method: 'DELETE', headers });
  console.log('🧹 Cache cleared. Ready for measurements.\n');

  console.log('--- TEST CASE 1: UNCACHED (COLD DB READS) ---');
  const uncachedReadings = [];
  for (let i = 1; i <= 3; i++) {
    // Flush cache before each reading to force a MISS
    if (i > 1) {
      await fetch('http://localhost:5000/api/tasks/cache', { method: 'DELETE', headers });
    }
    const result = await timedRequest(`Uncached Sample #${i}`);
    uncachedReadings.push(result);
    console.log(`Sample ${i} (MISS): ${result.duration} ms | X-Cache: ${result.cacheHeader} | Status: ${result.status}`);
  }

  console.log('\n--- TEST CASE 2: CACHED (IN-MEMORY HITS) ---');
  // First request populates cache
  await timedRequest('Warmup');
  const cachedReadings = [];
  for (let i = 1; i <= 3; i++) {
    const result = await timedRequest(`Cached Sample #${i}`);
    cachedReadings.push(result);
    console.log(`Sample ${i} (HIT) : ${result.duration} ms | X-Cache: ${result.cacheHeader} | Status: ${result.status}`);
  }

  console.log('\n--- TEST CASE 3: CACHE INVALIDATION ON WRITE (POST) ---');
  const createStart = performance.now();
  const createRes = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      title: 'Benchmark Temporary Task',
      description: 'Used to verify cache invalidation',
      priority: 'low',
      status: 'pending'
    })
  });
  const createdTask = await createRes.json();
  console.log(`POST /api/tasks: ${createRes.status} (Created Task ID: ${createdTask.data?._id || createdTask.data?.id})`);

  // Next GET must be a MISS
  const afterWrite = await timedRequest('Post-Write Read');
  console.log(`Subsequent GET (Should be MISS): ${afterWrite.duration} ms | X-Cache: ${afterWrite.cacheHeader}`);

  // Clean up: delete task
  if (createdTask.data?._id || createdTask.data?.id) {
    const taskId = createdTask.data._id || createdTask.data.id;
    await fetch(`${url}/${taskId}`, { method: 'DELETE', headers });
    console.log(`Cleaned up temporary task ID: ${taskId}`);
  }

  console.log('\n======================================================');
  console.log('📊 PERFORMANCE COMPARISON SUMMARY');
  console.log('======================================================');
  const avgUncached = (uncachedReadings.reduce((acc, r) => acc + r.duration, 0) / uncachedReadings.length).toFixed(2);
  const avgCached = (cachedReadings.reduce((acc, r) => acc + r.duration, 0) / cachedReadings.length).toFixed(2);
  const reduction = (((avgUncached - avgCached) / avgUncached) * 100).toFixed(1);

  console.log(`Average Uncached Latency: ${avgUncached} ms`);
  console.log(`Average Cached Latency:   ${avgCached} ms`);
  console.log(`Latency Reduction:        ${reduction}% faster`);
  console.log('======================================================\n');
}

runBenchmark().catch((err) => {
  console.error('Benchmark execution error (is backend running?):', err.message);
});
