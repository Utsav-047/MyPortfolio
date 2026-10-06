import { lazy } from 'react';

/**
 * lazyWithDelay wraps React.lazy() with a minimum delay promise.
 * 
 * Why: On fast network connections, dynamic chunks can load in 20-40ms,
 * causing the Suspense fallback to flicker abruptly for a single frame.
 * This helper ensures a smooth transition by enforcing a minimum duration
 * (e.g., 300ms) for the loading state or seamlessly rendering.
 * 
 * @param {Function} importFunc - Dynamic import function, e.g. () => import('./Component')
 * @param {number} delay - Minimum delay in milliseconds (default: 300ms)
 * @returns {React.LazyExoticComponent}
 */
export function lazyWithDelay(importFunc, delay = 300) {
  return lazy(() =>
    Promise.all([
      importFunc(),
      new Promise((resolve) => setTimeout(resolve, delay))
    ]).then(([moduleExports]) => moduleExports)
  );
}
