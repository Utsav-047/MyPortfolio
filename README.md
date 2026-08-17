# MyPortfolio — Full Stack Task Management & Portfolio

A full-stack portfolio application featuring integrated academic practicals, built using **React 18**, **Vite**, **Node.js**, **Express**, **Mongoose ODM**, and **MongoDB Atlas**.

---

## Architecture Overview

- **Frontend**: React (Vite) running on `http://localhost:5173`
- **Backend**: Express API server running on `http://localhost:5000`
- **Database**: MongoDB Atlas (`tasks` collection) via Mongoose ODM

```
React Frontend (localhost:5173)
       │
       ▼  fetch / CORS (src/services/api.js)
Express Backend (localhost:5000)
       │
       ▼  Mongoose Schema Validation
MongoDB Atlas Database (tasks collection)
```

---

## Practicals Included

1. **Practical 1-3**: React UI components, routing, and state management.
2. **Practical 4**: Modular Express REST API with request logging and in-memory fallback CRUD.
3. **Practical 5**: Mongoose ODM schema design, pre-save hooks, priority enums, and structured error handling.
4. **Practical 6 (Full-Stack Integration)**: End-to-end wiring of React frontend to Node/MongoDB backend:
   - 5-Task per page backend pagination.
   - Centralized API client (`src/services/api.js`).
   - Optimistic UI updates for creation and completion toggles.
   - Delete confirmation modal dialog.
   - Toast notification feedback system.

---

## Local Setup & Running Instructions

### 1. Backend Server Setup
Open a terminal in the root directory:

```bash
cd backend
npm install
node server.js
```

The Express API will start on `http://localhost:5000`.

### 2. Frontend React App Setup
Open a second terminal in the root directory:

```bash
npm install
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## Environment Configuration

Backend configuration file `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://24aiml047_db_user:Utsav123@cluster0.bhx1rkv.mongodb.net/taskmanager?retryWrites=true&w=majority&appName=Cluster0
```
