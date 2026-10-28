# 🌟 Full-Stack Portfolio & Task Management Application

[![CI Pipeline](https://github.com/Utsav-047/MyPortfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/Utsav-047/MyPortfolio/actions/workflows/ci.yml)
[![Node.js](https://img.shields.io/badge/Node.js-18.x%20%7C%2020.x-green.svg)](https://nodejs.org/)
[![Jest Test Suite](https://img.shields.io/badge/Tests-Passing%20(11%2F11)-brightgreen.svg)](https://jestjs.io/)
[![GitHub Actions](https://img.shields.io/badge/CI%2FCD-GitHub%20Actions%20v4-blue.svg)](https://github.com/features/actions)
[![OpenAI & Gemini](https://img.shields.io/badge/AI%20API-OpenAI%20%26%20Gemini-purple.svg)](https://openai.com/)


A modern, production-grade full-stack portfolio and task management system built using **React 18**, **Vite**, **Node.js**, **Express**, **Mongoose ODM**, **MongoDB Atlas**, **Google OAuth 2.0**, and **JWT Authentication**.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 React Frontend (Vite)                       │
│                   http://localhost:5173                     │
│  • Google OAuth (@react-oauth/google)                       │
│  • Centralized API Service (src/services/api.js)            │
│  • Task Manager + Practical 7 Pipeline Inspector UI         │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON / HTTP (CORS Enabled)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Express Backend REST API                    │
│                   http://localhost:5000                     │
│  • JWT Authentication Middleware (protect)                  │
│  • Input Validation Pipeline (validateTaskFields)           │
│  • Bcrypt Password Hashing & Google ID Verification         │
│  • User-Scoped Data Isolation                               │
└──────────────────────────────┬──────────────────────────────┘
                               │ Mongoose ODM Queries
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 MongoDB Atlas Database                      │
│  • users collection (Google OAuth & local credentials)      │
│  • tasks collection (User-scoped task documents)            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

- **🔐 Dual-Layer Authentication**:
  - **Google OAuth 2.0**: Fast, secure token-verified sign-in via Google Identity Services.
  - **Local Credentials**: Bcrypt password salted-hashing with JSON Web Tokens (JWT).
  - **Protected Middleware (`protect`)**: Enforces Bearer JWT verification on all restricted resources.
  - **Profile Endpoint (`GET /api/auth/me`)**: Returns decoded authenticated user identity.
- **📋 User-Isolated Task Management**:
  - Tasks are scoped strictly per authenticated user (`userId`).
  - Pagination (5 items/page), full-text search, and multi-status filtering.
  - Optimistic UI updates with automatic rollback on error.
  - Single-task export download with ISO-8601 audit timestamp.
- **⚡ Interactive Pipeline Inspector**:
  - Built-in live testing suite to test and inspect HTTP headers, payloads, status codes (200, 201, 400, 401), and bcrypt tokens.
- **🚀 Practical 8: Dynamic Code Splitting & Performance Optimization**:
  - Route-level code splitting using `React.lazy()` and `<Suspense>` across all application pages.
  - On-demand heavy component loading (Recharts analytics bundle loaded only on interaction).
  - Anti-flicker minimum delay wrapper (`lazyWithDelay`) for smooth skeleton transitions on fast networks.
  - Initial JS bundle reduction of 67.1% (38.4 KB gzip initial shell).

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Lucide Icons, `@react-oauth/google`
- **Backend**: Node.js, Express.js, JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, `google-auth-library`, `cors`, `dotenv`
- **Database**: MongoDB Atlas, Mongoose ODM

---

## 📦 API Endpoints

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/google` | Verify Google ID token & issue app JWT | No |
| `POST` | `/api/auth/register` | Register new user with bcrypt-hashed password | No |
| `POST` | `/api/auth/login` | Login with email/password & receive JWT | No |
| `GET` | `/api/auth/me` | Fetch decoded profile of current authenticated user | **Yes (Bearer JWT)** |

### Task Routes (`/api/tasks`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/tasks` | Get paginated, filtered tasks for logged-in user | **Yes (Bearer JWT)** |
| `POST` | `/api/tasks` | Create a new user-scoped task | **Yes (Bearer JWT)** |
| `GET` | `/api/tasks/:id` | Get details of a specific task | **Yes (Bearer JWT)** |
| `PUT` | `/api/tasks/:id` | Update an existing task | **Yes (Bearer JWT)** |
| `DELETE`| `/api/tasks/:id` | Delete a task document | **Yes (Bearer JWT)** |

---

## ⚙️ Local Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/Utsav-047/MyPortfolio.git
cd MyPortfolio
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory (see `backend/.env.example`):
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/taskmanager?retryWrites=true&w=majority
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
JWT_SECRET=your_jwt_secret_key
```

Start the backend server:
```bash
node server.js
```

### 3. Frontend Setup
In a new terminal window from the root directory:
```bash
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🔒 Security Best Practices
- Sensitive environment variables are kept strictly inside `.env` and ignored by `.gitignore`.
- Password credentials are salted and hashed using `bcryptjs` with 10 salt rounds before storage.
- All protected API routes enforce JWT token verification and user isolation.

---

## 🚀 Practical 12: Automated CI/CD Pipeline with GitHub Actions

### Objective
Automate code quality validation, dependency installation, and API testing using a Continuous Integration pipeline configured with GitHub Actions.

### Architecture & Pipeline Flow
```
git push origin main / Pull Request
             │
             ▼
GitHub Actions Trigger (`.github/workflows/ci.yml`)
             │
             ├── Job 1: `lint` (Code Quality & Syntax Gates)
             │    ├── actions/checkout@v4
             │    ├── actions/setup-node@v4 (Node 18.x)
             │    ├── npm install
             │    └── npm run lint (ESLint checks)
             │
             └── Job 2: `build-and-test` [needs: lint]
                  ├── actions/checkout@v4
                  ├── actions/setup-node@v4 (Node 18.x)
                  ├── npm install (Root & Backend)
                  ├── npm test (Jest & Supertest automated API tests)
                  ├── npm run build (Vite production bundle verification)
                  └── Report Pass / Fail Status
             │
             ▼
Green Checkmark (Pass) or Red X (Fail) on GitHub + Status Badge
```

### Automated Test Suite Coverage (`backend/tests/api.test.js`)
- `GET /tasks returns 200`: Validates task list endpoint accessibility (Syllabus requirement).
- `GET /health returns 200`: Validates server health check endpoint.
- `GET / returns 200`: Validates API root endpoint metadata and endpoint map.
- `GET /api/tasks returns 401`: Validates unauthorized access rejection on protected routes.
- `GET /api/tasks returns 200 (authenticated)`: Validates JWT Bearer authentication parsing.
- `GET /api/non-existent-endpoint returns 404`: Validates standard 404 error handler.
- `POST /api/ai/generate-description`: Validates AI description generation and fallback behavior.
- `POST /api/ai/suggest-priority`: Validates priority & effort estimation.
- `GET /api/ai/status`: Validates server-side key security and telemetry.

### Running Tests Locally
```bash
# Run tests directly from backend
cd backend
npm test

# Or run from project root
npm test
```

---

## ✨ Practical 13: AI API Integration into a Web Application

### Objective
Integrate an external AI service (OpenAI `gpt-4o-mini` / Gemini `gemini-1.5-flash`) into the Task Management application with secure server-side API key management, graceful degradation without application crash, and Responsible AI governance.

### Architecture & Security Flow
```
React Frontend (Form / AI Copilot)
             │
             │ 1. User enters task title & clicks "Auto-Generate Description"
             │ 2. Dispatches POST /api/ai/generate-description (NO API KEY in browser)
             ▼
Express Backend REST API (http://localhost:5000)
             │
             ├── 3. Rate Limit Filter (max 20 req/min per IP)
             ├── 4. PII Redaction Filter (sanitizes passwords, bearer tokens, emails)
             ├── 5. Reads OPENAI_API_KEY / GEMINI_API_KEY from backend/.env
             │
             ├── [Path A: Key Valid & API Responds]
             │    └── Calls OpenAI / Gemini API -> Returns generated suggestion
             │
             └── [Path B: Key Missing / Invalid / Timeout / Quota Exceeded]
                  └── Catches error in try/catch -> Returns domain fallback description
             │
             ▼
React Frontend (Task Form & Copilot Studio)
             │
             └── 6. Renders editable suggestion in description textarea
             └── 7. Human user reviews, verifies, and saves to MongoDB
```

### Key Security & Governance Guardrails
1. **Server-Side API Key Storage**: The API key is stored exclusively in `backend/.env` (excluded by `.gitignore`) and is never leaked or transmitted to browser network requests.
2. **Graceful Degradation Guarantee**: If the external AI service fails or times out, the backend catches the error and serves a high-quality fallback template without throwing a 500 error or crashing the React app.
3. **Human-in-the-Loop**: All AI outputs are editable suggestions. The user maintains full editorial control.
4. **PII Sanitization**: Sensitive credential patterns are sanitized before prompt payloads are dispatched to external models.

---

## 🌐 Live Production Deployments

- **Frontend Application**: [https://myportfolio-frontend-6xmm.onrender.com](https://myportfolio-frontend-6xmm.onrender.com)
- **Backend API & Microservices**: [https://myportfolio-8zei.onrender.com](https://myportfolio-8zei.onrender.com)
- **Direct Contact Delivery**: Messages delivered directly to `utsavpatel788190@gmail.com` via FormSubmit AJAX service
- **Hardened Architecture**: Task Manager frontend UI is streamlined strictly to Task Board and AI Copilot Studio; infrastructure services (Docker container mesh, in-memory caching engine, SSE streams) execute securely on the backend.


