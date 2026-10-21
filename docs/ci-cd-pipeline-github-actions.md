# Practical 12: CI/CD Pipeline with GitHub Actions

**Course Outcome / Program Outcome:** CO5 / PO3, PO5  
**Objective:** Automate testing, code quality checks, and production build verification of the Task Management application using an automated Continuous Integration (CI) pipeline with GitHub Actions.

---

## 1. Theoretical Concepts & Architecture

### 1.1 Continuous Integration (CI) vs Continuous Deployment (CD)
- **Continuous Integration (CI):** The practice of regularly merging code changes into a central repository, followed by automated builds and automated tests. Its primary goal is to discover and address bugs quicker, improve software quality, and reduce the time it takes to validate new updates.
- **Continuous Delivery (CD):** An extension of CI where code changes are automatically prepared and staged for release to production.
- **Continuous Deployment (CD):** A software release process where every change that passes all stages of the production pipeline is released directly to customers without manual intervention.

> **Practical 12 Scope:** This practical demonstrates **Continuous Integration (CI)**. It automatically triggers on every `push` and `pull_request` targeting `main`, checks out code, installs dependencies, validates linting, runs automated Jest & Supertest API tests, and verifies production build artifacts.

### 1.2 Pipeline Architecture Flow
```
Developer Workspace (git commit)
              │
              ▼
git push origin main / Pull Request
              │
              ▼
GitHub Actions Event Webhook (`on: [push, pull_request]`)
              │
              ├── Job 1: `lint` (Code Quality Gate)
              │    ├── actions/checkout@v4
              │    ├── actions/setup-node@v4 (node-version: 18.x)
              │    ├── npm install
              │    └── npm run lint (ESLint Checks)
              │
              └── Job 2: `build-and-test` (depends on Job 1 `needs: lint`)
                   ├── actions/checkout@v4
                   ├── actions/setup-node@v4 (node-version: 18.x)
                   ├── npm install (Root & Backend)
                   ├── npm test (Jest & Supertest automated tests)
                   ├── npm run build (Vite production bundle verification)
                   └── Report Summary Status
              │
              ▼
Green Checkmark (Pass) or Red X (Fail) on GitHub + Status Badge
```

---

## 2. GitHub Actions Workflow Configuration (`.github/workflows/ci.yml`)

```yaml
name: CI Pipeline

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
          echo "===================================================="
```

---

## 3. Automated Test Suite (`backend/tests/api.test.js`)

The automated test suite runs via **Jest** and **Supertest** without requiring a live MongoDB Atlas connection or opening listening ports:

1. **`GET /tasks returns 200`**: Validates task endpoint accessibility with HTTP 200 and JSON array structure (core syllabus requirement).
2. **`GET /health returns 200 OK`**: Verifies backend server health check.
3. **`GET / returns 200`**: Validates root metadata and endpoint discovery map.
4. **`GET /api/tasks returns 401 Unauthorized`**: Verifies security middleware blocks requests without a valid JWT Bearer token.
5. **`GET /api/tasks returns 200 (authenticated)`**: Tests protected task retrieval with signed JWT token.
6. **`GET /api/non-existent-endpoint returns 404`**: Verifies 404 global error handler.

---

## 4. Demonstrating Failed vs. Fixed Pipeline Runs

### 4.1 Step 1: Deliberately Breaking the Test
In `backend/tests/api.test.js`, modify the expected status code:
```javascript
test('GET /tasks returns 200', async () => {
  const res = await request(app).get('/tasks');
  expect(res.statusCode).toBe(201); // 🚨 Deliberate error: Expected 201 Created instead of 200 OK
});
```
- Commit and push to GitHub:
  ```bash
  git commit -am "test: deliberate failure for CI demonstration"
  git push origin main
  ```
- **Observed Result on GitHub:**
  - Job `build-and-test` fails at step *Execute Automated Test Suite*.
  - A **Red X mark** is displayed beside the commit on GitHub.
  - Pull requests targeting `main` are blocked.

### 4.2 Step 2: Fixing the Test
Revert the assertion back to `200`:
```javascript
test('GET /tasks returns 200', async () => {
  const res = await request(app).get('/tasks');
  expect(res.statusCode).toBe(200); // ✅ Correct assertion
});
```
- Commit and push:
  ```bash
  git commit -am "fix(test): correct assertion to restore green pipeline"
  git push origin main
  ```
- **Observed Result on GitHub:**
  - Pipeline executes all jobs (`lint` -> `build-and-test`).
  - A **Green checkmark** is displayed on GitHub.
  - The status badge on the README updates to **`passing`**.

---

## 5. Lab Journal Submission Checklist (Screenshots Required)

| Screenshot # | Description | How to Capture |
|---|---|---|
| **Screenshot 1** | Local Jest test execution passing (`npm test`) | Run `npm test` in terminal and screenshot the 6 passing tests. |
| **Screenshot 2** | GitHub Actions Tab registered workflow | Open `https://github.com/Utsav-047/MyPortfolio/actions` and screenshot the "CI Pipeline" workflow. |
| **Screenshot 3** | Deliberately Failed Pipeline Run (Red X) | Click into the failed run on GitHub showing the assertion failure log (`Expected: 201, Received: 200`). |
| **Screenshot 4** | Fixed Green Pipeline Run (Green Checkmark) | Click into the subsequent passing run showing all jobs and steps green. |
| **Screenshot 5** | Repository README Status Badge | Screenshot repository front page showing `build: passing` badge. |
| **Screenshot 6** | Task Manager CI/CD Interactive Tab | Open the app, navigate to Task Manager -> `🚀 CI/CD Pipeline & GitHub Actions` tab. |

---

## 6. Viva Questions & Key Analysis

### Q1: Why does running tests automatically on every push catch problems earlier than manual testing before release?
**Answer:** Automated CI testing immediately attributes any failure to the single commit that caused it. Instead of spending hours triaging a regression weeks later among dozens of changes, developers get instantaneous feedback within seconds of pushing.

### Q2: What would happen to the pipeline if the test file path were incorrect? Would the workflow fail at the same step?
**Answer:** It would fail at the `npm test` step, but with a configuration/path error (`No tests found matching...`) rather than an assertion failure (`expect(received).toBe(expected)`).

### Q3: How do GitHub Actions status badges work?
**Answer:** GitHub Actions generates dynamic SVGs based on the latest run of the default branch for a given workflow file (`.github/workflows/ci.yml/badge.svg`). As soon as a workflow finishes, the badge updates dynamically in real time without editing the README markdown.
