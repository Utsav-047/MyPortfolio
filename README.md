# 🌟 Full-Stack Portfolio & Task Management Application

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
