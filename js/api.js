const API_BASE = 'http://localhost:8080/api/v1';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Helper to parse response
async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  let data;

  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMessage = typeof data === 'object' ? data.message || data.error : data;
    const error = new Error(errorMessage || 'Request failed');
    error.status = response.status;
    error.data = data;
    error.response = response;
    throw error;
  }

  return data;
}

// --- API Functions ---

export async function apiRegister(userData) {
  const response = await fetch(`${API_BASE}/register`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    credentials: 'include',
    body: JSON.stringify(userData),
  });
  return handleResponse(response);
}

export async function apiLogin(credentials) {
  const response = await fetch(`${API_BASE}/login`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    credentials: 'include',
    body: JSON.stringify(credentials),
  });
  return handleResponse(response);
}

export async function apiLogout() {
  const response = await fetch(`${API_BASE}/logout`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    credentials: 'include',
  });
  return handleResponse(response);
}

export async function apiGetCurrentUser() {
  const response = await fetch(`${API_BASE}/me`, {
    method: 'GET',
    headers: DEFAULT_HEADERS,
    credentials: 'include',
  });
  return handleResponse(response);
}

export async function apiGetTodos(filters = {}) {
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.append('searchTerm', filters.search);
  if (filters.completed !== undefined) queryParams.append('completed', filters.completed);

  const queryString = queryParams.toString();
  const url = queryString ? `${API_BASE}/search?${queryString}` : `${API_BASE}/`;

  const response = await fetch(url, {
    method: 'GET',
    headers: DEFAULT_HEADERS,
    credentials: 'include',
  });
  const data = await handleResponse(response);
  return data.data || data;
}

export async function apiGetTodo(id) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'GET',
    headers: DEFAULT_HEADERS,
    credentials: 'include',
  });
  const data = await handleResponse(response);
  return data.data || data;
}

export async function apiCreateTodo(todoData) {
  const response = await fetch(`${API_BASE}/todo/create`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    credentials: 'include',
    body: JSON.stringify(todoData),
  });
  const data = await handleResponse(response);
  return data.data || data;
}

export async function apiUpdateTodo(id, todoData) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: DEFAULT_HEADERS,
    credentials: 'include',
    body: JSON.stringify(todoData),
  });
  const data = await handleResponse(response);
  return data.data || data;
}

export async function apiDeleteTodo(id) {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
    headers: DEFAULT_HEADERS,
    credentials: 'include',
  });
  return handleResponse(response);
}

export async function apiMarkComplete(id) {
  const response = await fetch(`${API_BASE}/${id}/complete`, {
    method: 'PATCH',
    headers: DEFAULT_HEADERS,
    credentials: 'include',
  });
  const data = await handleResponse(response);
  return data.data || data;
}

export async function apiMarkIncomplete(id) {
  const response = await fetch(`${API_BASE}/${id}/incomplete`, {
    method: 'PATCH',
    headers: DEFAULT_HEADERS,
    credentials: 'include',
  });
  const data = await handleResponse(response);
  return data.data || data;
}

export async function apiGetTodoStats() {
  const todos = await apiGetTodos();
  const todoArray = Array.isArray(todos) ? todos : [];
  return {
    total: todoArray.length,
    completed: todoArray.filter(t => t.completed).length,
    pending: todoArray.filter(t => !t.completed).length,
  };
}
