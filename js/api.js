// API Service for backend communication
class APIService {
    constructor() {
        this.baseURL = 'http://localhost:8080/api';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    async makeRequest(url, options = {}) {
      const fullUrl = `${this.baseURL}${url}`;

      // Extended timeout: 60 minutes (3600000 ms)
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3600000);

      const config = {
          credentials: 'include', // Include cookies for session handling
          signal: controller.signal,
          ...options,
          headers: {
              ...this.defaultHeaders,
              ...(options.headers || {}),
          },
      };

      let response;
      let data;

      try {
          response = await fetch(fullUrl, config);

          const contentType = response.headers.get('content-type');

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
          // clearTimeout(timeout);
      }
    }


    // Authentication API methods
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

    // Todo API methods
    async getTodos(filters = {}) {
        const queryParams = new URLSearchParams();
        
        if (filters.completed !== undefined) {
            queryParams.append('completed', filters.completed);
        }
        
        if (filters.search) {
            queryParams.append('search', filters.search);
        }

        const queryString = queryParams.toString();
        const url = queryString ? `/search?${queryString}` : '/search';
        
        return this.makeRequest(url);
    }

    async getTodo(id) {
        return this.makeRequest(`/${id}`);
    }

    async createTodo(todoData) {
        return this.makeRequest('/create', {
            method: 'POST',
            body: JSON.stringify(todoData),
        });
    }

    async updateTodo(id, todoData) {
        return this.makeRequest(`/update/${id}`, {
            method: 'PUT',
            body: JSON.stringify(todoData),
        });
    }

    async deleteTodo(id) {
        return this.makeRequest(`/delete/${id}`, {
            method: 'DELETE',
        });
    }

    async getTodoStats() {
        return this.makeRequest('/stats');
    }
}

// Create a global instance
const api = new APIService();