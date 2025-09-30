class APIService {
    constructor() {
        this.baseURL = 'http://localhost:8080/api/v1';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    async makeRequest(url, options = {}) {
        const fullUrl = `${this.baseURL}${url}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 10000);

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
            let data = contentType && contentType.includes('application/json')
                ? await response.json()
                : await response.text();

            if (!response.ok) {
                const errorMessage = typeof data === 'object' ? data.message || data.error : data;
                const error = new Error(errorMessage || 'Request failed');
                error.status = response.status;
                error.data = data;
                error.response = response;
                throw error;
            }

            return data;
        } catch (error) {
            clearTimeout(timeout);
            if (error.name === 'AbortError') {
                throw new Error('Request timed out. Please try again.');
            }
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Unable to connect to server. Please check if the backend is running.');
            }
            throw error;
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

    async getTodos(filters = {}) {
        const queryParams = new URLSearchParams();
        if (filters.search) queryParams.append('searchTerm', filters.search);
        if (filters.completed !== undefined) queryParams.append('completed', filters.completed);
        const queryString = queryParams.toString();
        const url = queryString ? `/search?${queryString}` : '/';
        return this.makeRequest(url);
    }

    async getTodo(id) {
        return this.makeRequest(`/${id}`);
    }

    async createTodo(todoData) {
        return this.makeRequest('/todo/create', {
            method: 'POST',
            body: JSON.stringify(todoData),
        });
    }

    async updateTodo(id, todoData) {
        return this.makeRequest(`/${id}`, {
            method: 'PUT',
            body: JSON.stringify(todoData),
        });
    }

    async deleteTodo(id) {
        return this.makeRequest(`/${id}`, {
            method: 'DELETE',
        });
    }

    async markComplete(id) {
        return this.makeRequest(`/${id}/complete`, {
            method: 'PATCH',
        });
    }

    async markIncomplete(id) {
        return this.makeRequest(`/${id}/incomplete`, {
            method: 'PATCH',
        });
    }

    async getTodoStats() {
        const todos = await this.getTodos();
        return {
            total: todos.length,
            completed: todos.filter(t => t.completed).length,
            pending: todos.filter(t => !t.completed).length,
        };
    }
}

const api = new APIService();
