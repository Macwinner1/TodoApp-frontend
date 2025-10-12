
const BASE_URL = 'http://localhost:8080/api';


async function checkIfStillLoggedIn() {
  try {
    const response = await fetch('http://localhost:8080/api/me', {
      method: 'GET',
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(response.status === 401 ? 'Not logged in' : 'Request failed');
    }

    const json = await response.json();
    const match = json.message.match(/Logged in as userId: (\S+), username: (\S+)/);
    if (!match) {
      throw new Error('Invalid user data');
    }
    return { userId: match[1], username: match[2] };
  } catch (error) {
    throw error;
  }
}

async function registerUser(userData) {
  try {
    const response = await fetch('http://localhost:8080/api/register', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData), 
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Registration failed');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

async function loginUser(credentials) {
  try {
    const response = await fetch('http://localhost:8080/api/login', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Login failed');
    }

    return await checkIfStillLoggedIn();
  } catch (error) {
    throw error;
  }
}

async function logoutUser() {
  try {
    const response = await fetch(`${BASE_URL}/logout`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });


    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Logout failed');
    }

    return await response.json(); 
  } catch (error) {
    throw error;
  }
}

async function getTodos(filters = {}) {
  try {
    const queryParams = new URLSearchParams();
    if (filters.completed !== undefined) {
      queryParams.append('completed', filters.completed);
    }
    if (filters.search) {
      queryParams.append('searchTerm', filters.search);
    }
    const queryString = queryParams.toString();
    const url = queryString ? `${BASE_URL}/search?${queryString}` : `${BASE_URL}`;

    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to fetch todos');
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    throw error;
  }
}

async function getTodo(id) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to fetch todo');
    }

    const data = await response.json();
    return data.data; 
  } catch (error) {
    throw error;
  }
}

async function createTodo(todoData) {
  try {
    const response = await fetch(`${BASE_URL}/create`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to create todo');
    }

    const data = await response.json();
    return data.data; 
  } catch (error) {
    throw error;
  }
}

async function updateTodo(id, todoData) {
  try {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(todoData),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to update todo');
    }

    const data = await response.json();
    return data.data; 
  } catch (error) {
    throw error;
  }
}

async function toggleComplete(id, completed) {
  try {
    const endpoint = completed ? `${BASE_URL}/${id}/complete` : `${BASE_URL}/${id}/incomplete`;
    const response = await fetch(endpoint, {
      method: 'PATCH',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to toggle completion');
    }

    const data = await response.json();
    return data.data; 
  } catch (error) {
    throw error;
  }
}


async function deleteTodo(id) {
  try {
   
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete todo');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}


async function getTodoStats() {
  try {
    const todos = await getTodos();
    const total = todos.length;
    const completed = todos.filter((todo) => todo.completed).length;
    const pending = total - completed;
    const highPriority = todos.filter((todo) => todo.priority === 'HIGH').length;
    return { total, completed, pending, highPriority };
  } catch (error) {
    throw error;
  }
}