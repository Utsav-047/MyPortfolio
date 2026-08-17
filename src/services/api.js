// ============================================================
//  MyPortfolio Practical 6 Central API Client Service
// ============================================================

const BASE_URL = 'http://localhost:5000';

/**
 * Generic helper for handling HTTP fetch requests and parsing JSON error responses.
 */
async function handleResponse(response) {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
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
 * Fetch paginated tasks from backend (Default 5 items per page)
 */
export async function getTasks(page = 1, limit = 5, priority = '', search = '') {
  let url = `${BASE_URL}/api/tasks?page=${page}&limit=${limit}`;
  if (priority) url += `&priority=${encodeURIComponent(priority)}`;
  if (search) url += `&search=${encodeURIComponent(search)}`;

  const response = await fetch(url);
  return handleResponse(response);
}

/**
 * Fetch single task by ID
 */
export async function getTaskById(id) {
  const response = await fetch(`${BASE_URL}/api/tasks/${id}`);
  return handleResponse(response);
}

/**
 * Create a new Task (POST /api/tasks)
 */
export async function createTask(taskData) {
  const response = await fetch(`${BASE_URL}/api/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  return handleResponse(response);
}

/**
 * Update an existing Task (PUT /api/tasks/:id)
 */
export async function updateTask(id, taskData) {
  const response = await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(taskData)
  });
  return handleResponse(response);
}

/**
 * Delete a Task by ID (DELETE /api/tasks/:id)
 */
export async function deleteTask(id) {
  const response = await fetch(`${BASE_URL}/api/tasks/${id}`, {
    method: 'DELETE'
  });
  return handleResponse(response);
}

/**
 * Check MongoDB & Express Backend status
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
  getDbStatus
};
