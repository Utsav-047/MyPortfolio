// Central API Client Service for Task Manager & Role-Based Access

const BASE_URL = 'http://localhost:5000';

/**
 * Returns the Authorization and Role headers.
 */
function getAuthHeaders() {
  const token = localStorage.getItem('auth_token');
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('auth_user')); } catch { return null; }
  })();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (user?.role) headers['x-user-role'] = user.role;
  return headers;
}

/**
 * Generic helper for handling HTTP fetch requests and parsing JSON error responses.
 */
async function handleResponse(response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    // If token invalid / expired, dispatch session event
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent('auth_unauthorized', { detail: data }));
    }
    const error = (data && (data.message || data.error)) || `HTTP Error ${response.status}`;
    const errObj = new Error(error);
    errObj.status = response.status;
    errObj.details = data?.details || null;
    errObj.raw = data;
    throw errObj;
  }

  return data;
}

/**
 * Fetch paginated tasks from backend.
 */
export async function getTasks(page = 1, limit = 5, priority = '', search = '', status = 'all', assignedTo = 'all') {
  let url = `${BASE_URL}/api/tasks?page=${page}&limit=${limit}`;
  if (priority && priority !== 'all') url += `&priority=${encodeURIComponent(priority)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;
  if (status && status !== 'all') url += `&status=${encodeURIComponent(status)}`;
  if (assignedTo && assignedTo !== 'all') url += `&assignedTo=${encodeURIComponent(assignedTo)}`;

  const response = await fetch(url, {
    headers: { ...getAuthHeaders() }
  });
  return handleResponse(response);
}

/**
 * Fetch single task by ID.
 */
export async function getTaskById(id) {
  const response = await fetch(`${BASE_URL}/api/tasks/${id}`, {
    headers: { ...getAuthHeaders() }
  });
  return handleResponse(response);
}

/**
 * Create a new Task (POST /api/tasks).
 */
export async function createTask(taskData) {
  const response = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(taskData)
  });
  return handleResponse(response);
}

/**
 * Update an existing Task (PUT /api/tasks/:id).
 */
export async function updateTask(id, taskData) {
  const response = await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify(taskData)
  });
  return handleResponse(response);
}

/**
 * Delete a Task by ID (DELETE /api/tasks/:id).
 */
export async function deleteTask(id) {
  const response = await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method: 'DELETE',
    headers: { ...getAuthHeaders() }
  });
  return handleResponse(response);
}

/**
 * Get Team Members list for assignment dropdown.
 */
export async function getTeamMembers() {
  const response = await fetch(`${BASE_URL}/api/auth/team`, {
    headers: { ...getAuthHeaders() }
  });
  return handleResponse(response);
}

/**
 * Switch User Role (PATCH /api/auth/role).
 */
export async function updateUserRole(role) {
  const response = await fetch(`${BASE_URL}/api/auth/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    body: JSON.stringify({ role })
  });
  return handleResponse(response);
}

/**
 * Check MongoDB & Express Backend status.
 */
export async function getDbStatus() {
  const response = await fetch(`${BASE_URL}/api/db-status`);
  return handleResponse(response);
}

export default {
  BASE_URL,
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  getTeamMembers,
  updateUserRole,
  getDbStatus
};
