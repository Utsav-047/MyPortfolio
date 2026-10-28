const NodeCache = require('node-cache');

/**
 * In-Memory Caching Service using node-cache
 * 
 * Configured with standard TTL of 60 seconds as specified.
 * checkperiod: automatic cleanup check every 120 seconds.
 */
const taskCache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120,
  useClones: false // performance boost for read-only cached JSON
});

/**
 * Generate standardized cache key for task queries.
 * Format: tasks_<userId> (matches exact format: tasks_6a96cff1fe495756006aaec6)
 * If query filters exist, appends serialized query parameters.
 */
const getTaskCacheKey = (req) => {
  const userId = req.user?.id || req.user?._id || 'default';
  const queryKeys = Object.keys(req.query || {});
  
  if (queryKeys.length === 0) {
    return `tasks_${userId}`;
  }

  // If query parameters exist, sort them for key consistency
  const queryString = queryKeys
    .sort()
    .map((k) => `${k}=${encodeURIComponent(req.query[k])}`)
    .join('&');

  return `tasks_${userId}_${queryString}`;
};

/**
 * Invalidate cache for tasks on any write operation (POST, PUT, DELETE).
 * Ensures stale data is never served.
 */
const invalidateTaskCache = (userId = null) => {
  const allKeys = taskCache.keys();
  const taskKeys = allKeys.filter((k) => k.startsWith('tasks_'));
  
  if (taskKeys.length > 0) {
    taskCache.del(taskKeys);
  }
  
  if (userId) {
    taskCache.del(`tasks_${userId}`);
  }

  console.log(`[CACHE INVALIDATED] Purged ${taskKeys.length} task cache key(s) to prevent stale data.`);
};

module.exports = {
  taskCache,
  getTaskCacheKey,
  invalidateTaskCache
};
