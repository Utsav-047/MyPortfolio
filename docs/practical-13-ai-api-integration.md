# Practical 13: AI API Integration into a Web Application

**Course Outcome / Program Outcome:** CO6 / PO3, PO5, PO12  
**Objective:** Integrate an external AI service (OpenAI API / Gemini API) into the full-stack Task Management application, understand server-side API key isolation, ensure zero-crash graceful degradation, and implement Responsible AI data governance.

---

## 1. Theoretical Concepts & Architecture

### 1.1 Architecture & Data Flow Diagram
```
React Frontend (Task Form / AI Copilot)
              │
              │ 1. User clicks "Auto-Generate Description"
              │ 2. Sends POST /api/ai/generate-description (NO API KEY in browser)
              ▼
Express Backend REST API (http://localhost:5000)
              │
              ├── 3. Rate Limit Filter (max 20 requests/min per client IP)
              ├── 4. PII Redaction Filter (regex sanitization: passwords, tokens, emails)
              ├── 5. Reads OPENAI_API_KEY / GEMINI_API_KEY from backend/.env
              │
              ├── [Case 1: Key Configured & Upstream Available]
              │    └── Calls OpenAI gpt-4o-mini / Gemini 1.5 Flash -> Returns generated text
              │
              └── [Case 2: Key Missing / Invalid / Network Timeout / Quota Exhausted]
                   └── Catches exception in try/catch -> Returns domain fallback description
              │
              ▼
React Frontend Form & Copilot Studio
              │
              └── 6. Renders editable suggestion in description textarea
              └── 7. Displays "AI Generated" badge + Responsible AI Disclaimer
              └── 8. Human user verifies, refines, and saves task to MongoDB
```

---

## 2. Key Analysis & Viva Questions

### Q1: Why must the AI API key be called from the backend rather than directly from the React frontend?
**Answer:**
- **Client-Side Exposure:** Code executed in the browser is completely public. Any API key embedded in React code or environment variables prefixed with `VITE_` can be trivially extracted by opening Browser DevTools -> Network Tab or Inspecting the JavaScript bundle source.
- **Quota Theft & Financial Risk:** If a secret OpenAI or Gemini API key is leaked to the client, malicious actors can extract the key and exhaust the developer's credit balance or rate limits within seconds.
- **Backend as Security Proxy:** By channeling requests through our Express backend (`/api/ai/generate-description`), the API key resides exclusively in the server environment (`backend/.env`). The frontend only interacts with our authorized backend endpoints.

### Q2: What does 'graceful degradation' mean in this context, and why does it matter?
**Answer:**
- **Definition:** Graceful degradation is an architectural design pattern where a software system maintains core operational capabilities even when non-critical components or external third-party services fail.
- **Why It Matters:** External AI models (OpenAI, Gemini) are outside our infrastructure control and can suffer from rate limit throttling (`HTTP 429`), network latency spikes, service outages, or expired keys.
- **Implementation:** Our Express route wraps external API calls in a `try/catch` block. If the third-party call fails, the backend catches the error and returns a high-quality domain fallback suggestion (`fallback: true`). As a result, the user can still create and manage tasks seamlessly without experiencing a 500 error or frontend crash.

### Q3: What are the privacy, governance, and ethical implications of sending task data to an external AI API?
**Answer:**
- **Data Leakage & Model Training:** By default, public LLM endpoints may log prompt payloads or use them to train future model iterations unless enterprise Zero Data Retention (ZDR) agreements are signed.
- **Data That Must NEVER Be Sent:**
  1. Passwords, hashed secrets, API tokens, and JWTs.
  2. Personally Identifiable Information (PII) such as Social Security Numbers, Aadhaar IDs, or personal phone numbers.
  3. Sensitive financial or credit card records.
  4. Proprietary corporate secrets or non-public intellectual property.
- **PII Sanitization:** Our controller includes regex-based sanitization that scrubs credential patterns (`password: [REDACTED]`, `bearer [REDACTED]`) before dispatching payloads to the external model.

---

## 3. Backend Endpoints Implemented

| Method | Endpoint | Purpose | Graceful Degradation |
|---|---|---|---|
| `POST` | `/api/ai/generate-description` | Generates a 2-3 sentence actionable task description from a title | Returns fallback template if key is missing or fails |
| `POST` | `/api/ai/suggest-priority` | Analyzes task complexity and suggests priority level & estimated hours | Returns rule-based priority analysis |
| `POST` | `/api/ai/breakdown` | Decomposes a task into 4 actionable checklist subtasks | Returns standard modular subtask plan |
| `GET` | `/api/ai/status` | Returns server-side AI configuration, model name, and safety policies | Always returns live status |

---

## 4. Frontend UI Features

1. **Auto-Generate Button on Task Creation Form**:
   - Located directly between the Task Title input and Description textarea.
   - Shows a loading spinner (`⏳ Generating with AI...`) during execution.
   - Populates the description field with an editable suggestion.
   - Displays an AI Suggestion Banner indicating the source (`OpenAI` or `Graceful Fallback`).
2. **Dedicated "✨ AI Copilot & Assistant" Sub-Module in Task Manager**:
   - **Tab 1: AI Task Copilot Studio**: Interactive prompt playground with Quick Sample Titles.
   - **Tab 2: Graceful Degradation Simulator**: Interactive buttons to simulate Healthy calls, Broken Key (401), and Missing Title (400).
   - **Tab 3: Responsible AI & PII Privacy**: Interactive sandbox demonstrating live PII redaction and the 4 pillars of AI governance.
   - **Tab 4: Architecture & Security**: ASCII system flow and telemetry metrics.
   - **Tab 5: Lab Evidence & Screenshot Guide**: Step-by-step checklist for lab submission.

---

## 5. Lab Journal Submission Checklist (Screenshots Required)

| Screenshot # | Description | How to Capture |
|---|---|---|
| **Screenshot 1** | Backend Route & Graceful Error Handling Code | Screenshot `backend/controllers/aiController.js` showing the `try/catch` block wrapping OpenAI calls. |
| **Screenshot 2** | Task Form with "AI Suggest Description" Button & Loading State | Open Task Manager form, enter a title, and click "Auto-Generate Description" while the spinner is active. |
| **Screenshot 3** | AI Generated Description Rendered in Form | Screenshot the populated textarea with the editable suggestion and Responsible AI disclaimer. |
| **Screenshot 4** | Graceful Degradation Simulator (Simulated Broken Key) | Open Task Manager -> `✨ AI Copilot` -> `Graceful Degradation` tab and click "Simulate Broken Key Failure". |
| **Screenshot 5** | Browser Network Tab Proving Key is Never Exposed | Press F12 -> Network tab -> click `generate-description` -> verify no `OPENAI_API_KEY` exists in request headers. |
| **Screenshot 6** | Automated Test Suite Passing (11/11 tests pass) | Run `npm test` in terminal showing all 11 unit and integration tests passing. |
