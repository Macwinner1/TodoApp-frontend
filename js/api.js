class APIService {
    constructor() {
        this.baseURL = 'http://127.0.0.1:8080/api';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    async makeRequest(url, options = {}) {
      const fullUrl = `${this.baseURL}${url}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 36000);

      const config = {
          credentials: 'include',
          signal: controller.signal,
          ...options,
          headers: {
              ...this.defaultHeaders,
              ...(options.headers || {}),
          },
      };

      try {
          const response = await fetch(fullUrl, config);
          clearTimeout(timeout);
          
          const contentType = response.headers.get('content-type');

          let data;
          if (contentType && contentType.includes('application/json')) {
              data = await response.json();
          } else {
              data = await response.text();
          }

          if (!response.ok) {
              const errorMessage = (typeof data === 'object' && data !== null)
                  ? data.message || data.error
                  : String(data);

              const error = new Error(errorMessage || 'Request failed');
              error.status = response.status;
              error.data = data;
              throw error;
          }
          return data;
      } catch (error) {
          if (error.name === 'AbortError') {
              throw new Error('Request timed out. Please try again.');
          }

          if (error.name === 'TypeError' && error.message.includes('fetch')) {
              throw new Error('Unable to connect to server. Please check if the backend is running.');
          }

          throw error;
      } finally {
          clearTimeout(timeout);
      }
    }

    async register(userData) {
        return this.makeRequest('/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async login(credentials) {
        return this.makeRequest('/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
            // credentials: 'include'

        });
    }

    async logout() {
        return this.makeRequest('/logout', {
            method: 'POST',
        });
    }

    async getCurrentUser() {
        return this.makeRequest('/me');
    }

     async getTodos() {
        return this.makeRequest('/todos');
    }

    async searchTodos(filters = {}) {
        const queryParams = new URLSearchParams();
        
        if (filters.completed !== undefined) queryParams.append('completed', filters.completed);
        if (filters.search) queryParams.append('keyword', filters.search);

        const queryString = queryParams.toString();
        const url = queryString ? `/search?${queryString}` : '/search';
        
        return this.makeRequest(url);
    }


    async getTodo(todoId) {
        return this.makeRequest(`/${todoId}`);
    }

    async createTodo(todoData) {
        return this.makeRequest('/create', {
            method: 'POST',
            body: JSON.stringify(todoData),
        });
    }

    async updateTodo(todoId, todoData) {
        return this.makeRequest(`/update/${todoId}`, {
            method: 'PUT',
            body: JSON.stringify(todoData),
        });
    }

    async deleteTodo(todoId) {
        return this.makeRequest(`/delete/${todoId}`, {
            method: 'DELETE',
        });
    }

    async markComplete(todoId) {
        return this.makeRequest(`/${todoId}/complete`, {
            method: 'PATCH',
        });
    }

    async markIncomplete(todoId) {
        return this.makeRequest(`/${todoId}/incomplete`, {
            method: 'PATCH',
        });
    }

    async getTodoStats() {
        return this.makeRequest('/stats');
    }
}

const api = new APIService();