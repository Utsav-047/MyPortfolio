# Practical 8: Performance Optimization & Lazy Loading in React

## 1. Overview & Objective
The goal of Practical 8 is to optimize the performance of the React application using **Route-Based Code Splitting (`React.lazy()`)**, **Component-Level Lazy Loading**, and **`Suspense` with Custom Fallbacks**. This avoids loading the entire JavaScript payload upfront, reducing the Initial Bundle Size, First Contentful Paint (FCP), and Time to Interactive (TTI).

---

## 2. Changes Implemented

### A. Route-Level Code Splitting (`src/App.jsx`)
Static imports for route components were replaced with dynamic imports using `React.lazy()`:

```javascript
// Route-Level Dynamic Imports
const Home = lazy(() => import('./components/Home'));
const About = lazy(() => import('./components/About'));
const Skills = lazy(() => import('./components/Skills'));
const Projects = lazy(() => import('./components/Projects'));
const TaskManager = lazy(() => import('./components/TaskManager'));
const Practical4 = lazy(() => import('./components/Practical4'));
const Practical5 = lazy(() => import('./components/Practical5'));
const Practical6 = lazy(() => import('./components/Practical6'));
const Contact = lazy(() => import('./components/Contact'));
```

### B. Route Suspense Wrapper with Custom Fallback
The active page rendering logic is wrapped inside React's `<Suspense>` boundary using `<LoadingFallback>`:

```jsx
<Suspense fallback={
  <LoadingFallback 
    title="Loading Route Chunk..." 
    subtitle="Fetching split JavaScript bundle with React.lazy() & Suspense" 
  />
}>
  {renderPage()}
</Suspense>
```

### C. Heavy Component-Level Lazy Loading (`src/components/Projects.jsx`)
The `ProjectAnalyticsChart` component (which imports the heavy `recharts` library) is dynamically imported only when the user visits the Projects section:

```javascript
// Component-Level Dynamic Import in Projects.jsx
const ProjectAnalyticsChart = lazy(() => import('./ProjectAnalyticsChart'));
```

Wrapped inside its own dedicated `<Suspense>` boundary:
```jsx
<Suspense fallback={
  <div style={{ padding: '2.5rem', textAlign: 'center', color: '#64748b' }}>
    <div className="loading-spinner-ring" style={{ width: '32px', height: '32px', margin: '0 auto 12px auto' }} />
    <span style={{ fontSize: '13px', fontWeight: 600 }}>Loading Recharts Analytics Bundle Chunk...</span>
  </div>
}>
  <ProjectAnalyticsChart />
</Suspense>
```

---

## 3. Vite Production Build Verification

Running `npm run build` generates separate, on-demand JavaScript chunks:

```text
vite v8.1.4 building client environment for production...
transforming...✓ 607 modules transformed.
rendering chunks...
computing gzip size...

dist/index.html                                  0.47 kB │ gzip:   0.30 kB
dist/assets/profile-BT4-lW82.jpeg               57.33 kB
dist/assets/index-Due28Bkb.css                  35.82 kB │ gzip:   7.03 kB
dist/assets/Home-C7XUaqwQ.js                     3.74 kB │ gzip:   1.38 kB
dist/assets/About-AuQigIOL.js                    4.79 kB │ gzip:   1.41 kB
dist/assets/Contact-Dq5R48tQ.js                  7.17 kB │ gzip:   2.42 kB
dist/assets/Projects-DUx2-S3s.js                 7.18 kB │ gzip:   2.79 kB
dist/assets/Skills-Cf_G4boP.js                   9.86 kB │ gzip:   4.10 kB
dist/assets/Practical4-CyIH9y76.js              12.42 kB │ gzip:   3.86 kB
dist/assets/Practical6-CManf7mU.js              20.63 kB │ gzip:   5.83 kB
dist/assets/Practical5-h00JGYht.js              27.70 kB │ gzip:   7.33 kB
dist/assets/TaskManager-DgrQBbWL.js             41.67 kB │ gzip:  10.30 kB
dist/assets/index-D3vb4kUS.js                  221.75 kB │ gzip:  69.34 kB
dist/assets/ProjectAnalyticsChart-C49PL3cV.js  408.62 kB │ gzip: 115.03 kB

✓ built in 3.81s
```

---

## 4. Expected Performance Benefits
1. **Reduced Initial Load**: Heavy dependencies like Recharts (~408 KB) and TaskManager (~41 KB) are excluded from the initial bundle (`index-*.js`), downloading only when the respective route or component is requested.
2. **Faster First Contentful Paint (FCP)**: The browser parses and executes only the minimal JavaScript needed for the landing view.
3. **Improved Memory Usage**: Route code is loaded on demand, keeping runtime memory footprint low on mobile and low-end devices.

---

## 5. Manual Measurement Guide (Browser DevTools Evidence)

To collect practical evaluation evidence, perform the following steps manually in Google Chrome / Edge:

### Step 1: Network Tab (Chunk Verification)
1. Open DevTools (`F12` or `Ctrl+Shift+I`) and switch to the **Network** tab.
2. Filter by `JS`.
3. Reload the page on `Home` route: Observe that only the core `index-*.js` and `Home-*.js` chunks are fetched.
4. Click on **Projects** in the navigation bar: Observe the dynamic network request fetching `Projects-*.js` and `ProjectAnalyticsChart-*.js`.
5. Click on **Task Manager**: Observe dynamic request fetching `TaskManager-*.js`.
6. Click on **Contact**: Observe dynamic request fetching `Contact-*.js`.

### Step 2: Lighthouse Audit
1. In DevTools, open the **Lighthouse** tab.
2. Select **Performance** category and run an audit for Desktop/Mobile.
3. Check the **Diagnostics** section for "Reduce unused JavaScript" and observe the high Performance score.

---

## 6. Before / After Performance Metrics Table

| Metric | Before Lazy Loading (Single Monolithic Bundle) | After Route & Component Lazy Loading |
| :--- | :--- | :--- |
| **Initial JS Transferred** | _[Measure in DevTools Network: e.g. ~730 KB]_ | `~221 KB` (Main Entry Chunk) |
| **Recharts / Heavy Chunk** | Loaded on initial page load | `408.62 KB` (Loaded only on Projects view) |
| **First Contentful Paint (FCP)** | _[Measure in Lighthouse]_ | _[Measure in Lighthouse]_ |
| **Time to Interactive (TTI)** | _[Measure in Lighthouse]_ | _[Measure in Lighthouse]_ |
| **Lighthouse Score** | _[Record pre-split score]_ | _[Record post-split score]_ |
