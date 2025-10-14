// Todo Management
class TodoManager {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.editingTodoId = null;
        this.todoToDelete = null;
    }

    // Load and display todos
    async loadTodos() {
        try {
            const loadingEl = document.getElementById('loading-todos');
            const todoListEl = document.getElementById('todo-list');
            const emptyStateEl = document.getElementById('empty-state');

            if (loadingEl) loadingEl.classList.remove('hidden');
            if (emptyStateEl) emptyStateEl.classList.add('hidden');

            // Get todos based on current filter and search
            const filters = {};
            if (this.currentFilter === 'completed') {
                filters.completed = true;
            } else if (this.currentFilter === 'pending') {
                filters.completed = false;
            }
            
            if (this.searchQuery) {
                filters.search = this.searchQuery;
            }

            this.todos = await api.getTodos(filters);
            this.renderTodos();
            await this.loadStats();

        } catch (error) {
            console.error('Failed to load todos:', error);
            this.showError('Failed to load todos. Please try again.');
        } finally {
            const loadingEl = document.getElementById('loading-todos');
            if (loadingEl) loadingEl.classList.add('hidden');
        }
    }

    // Render todos in the list
    renderTodos() {
        const todoListEl = document.getElementById('todo-list');
        const emptyStateEl = document.getElementById('empty-state');
        const loadingEl = document.getElementById('loading-todos');

        if (!todoListEl) return;

        // Hide loading
        if (loadingEl) loadingEl.classList.add('hidden');

        if (this.todos.length === 0) {
            todoListEl.innerHTML = '';
            if (emptyStateEl) emptyStateEl.classList.remove('hidden');
            return;
        }

        if (emptyStateEl) emptyStateEl.classList.add('hidden');

        todoListEl.innerHTML = this.todos.map(todo => this.createTodoHTML(todo)).join('');
    }

    // Create HTML for a single todo item
    createTodoHTML(todo) {
        const dueDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : '';
        const createdDate = new Date(todo.createdAt).toLocaleDateString();
        
        return `
            <div class="todo-item ${todo.completed ? 'completed' : ''}" data-todo-id="${todo.id}">
                <div class="todo-header-item">
                    <h3 class="todo-title">${this.escapeHtml(todo.title)}</h3>
                    <span class="todo-priority priority-${todo.priority.toLowerCase()}">
                        ${todo.priority}
                    </span>
                </div>
                
                ${todo.description ? `<p class="todo-description">${this.escapeHtml(todo.description)}</p>` : ''}
                
                <div class="todo-meta">
                    <span>Created: ${createdDate}</span>
                    ${dueDate ? `<span>Due: ${dueDate}</span>` : ''}
                </div>
                
                <div class="todo-actions">
                    <button class="btn btn-sm ${todo.completed ? 'btn-warning' : 'btn-success'}" 
                            onclick="todoManager.toggleComplete(${todo.id})">
                        ${todo.completed ? 'Mark Pending' : 'Mark Complete'}
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="todoManager.editTodo(${todo.id})">
                        Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="todoManager.showDeleteModal(${todo.id})">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }

    // Load todo statistics
    async loadStats() {
        try {
            const stats = await api.getTodoStats();
            
            const totalEl = document.getElementById('total-todos');
            const completedEl = document.getElementById('completed-todos');
            const pendingEl = document.getElementById('pending-todos');
            
            if (totalEl) totalEl.textContent = stats.total || 0;
            if (completedEl) completedEl.textContent = stats.completed || 0;
            if (pendingEl) pendingEl.textContent = stats.pending || 0;
            
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    // Show add todo modal
    showAddTodoModal() {
        console.log('showAddTodoModal called'); // Debug log
        this.editingTodoId = null;
        const modal = document.getElementById('todo-modal');
        const title = document.getElementById('modal-title');
        const submitBtn = document.getElementById('submit-btn-text');
        const form = document.getElementById('todo-form');
        
        console.log('Modal element:', modal); // Debug log
        
        if (title) title.textContent = 'Add New Todo';
        if (submitBtn) submitBtn.textContent = 'Add Todo';
        if (form) form.reset();
        
        // Clear completed checkbox
        const completedCheckbox = document.getElementById('todo-completed');
        if (completedCheckbox) completedCheckbox.checked = false;
        
        if (modal) {
            modal.style.display = 'block';
            console.log('Modal should be visible now'); // Debug log
        } else {
            console.error('Modal element not found!'); // Debug log
        }
    }

    // Edit todo
    async editTodo(todoId) {
        try {
            const todo = await api.getTodo(todoId);
            this.editingTodoId = todoId;
            
            const modal = document.getElementById('todo-modal');
            const title = document.getElementById('modal-title');
            const submitBtn = document.getElementById('submit-btn-text');
            
            if (title) title.textContent = 'Edit Todo';
            if (submitBtn) submitBtn.textContent = 'Update Todo';
            
            // Populate form
            document.getElementById('todo-title').value = todo.title || '';
            document.getElementById('todo-description').value = todo.description || '';
            document.getElementById('todo-priority').value = todo.priority || 'MEDIUM';
            document.getElementById('todo-completed').checked = todo.completed || false;
            
            // Handle due date
            if (todo.dueDate) {
                const date = new Date(todo.dueDate);
                const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                document.getElementById('todo-due-date').value = localDate.toISOString().slice(0, 16);
            } else {
                document.getElementById('todo-due-date').value = '';
            }
            
            if (modal) modal.style.display = 'block';
            
        } catch (error) {
            console.error('Failed to load todo for editing:', error);
            this.showError('Failed to load todo for editing');
        }
    }

    // Handle todo form submission
    async handleTodoSubmit(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            // Show loading state
            submitBtn.innerHTML = '<span class="loading"></span> Saving...';
            submitBtn.disabled = true;
            
            const todoData = {
                title: formData.get('title'),
                description: formData.get('description'),
                priority: formData.get('priority'),
                completed: formData.get('completed') === 'on',
                dueDate: formData.get('dueDate') || null
            };
            
            // Validate
            if (!todoData.title.trim()) {
                throw new Error('Title is required');
            }
            
            if (this.editingTodoId) {
                // Update existing todo
                await api.updateTodo(this.editingTodoId, todoData);
                this.showSuccess('Todo updated successfully');
            } else {
                // Create new todo
                await api.createTodo(todoData);
                this.showSuccess('Todo created successfully');
            }
            
            this.closeTodoModal();
            await this.loadTodos();
            
        } catch (error) {
            console.error('Failed to save todo:', error);
            this.showError(error.message || 'Failed to save todo');
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // Toggle todo completion status
    async toggleComplete(todoId) {
        try {
            const todo = this.todos.find(t => t.id === todoId);
            if (!todo) return;
            
            const updatedTodo = {
                ...todo,
                completed: !todo.completed
            };
            
            await api.updateTodo(todoId, updatedTodo);
            this.showSuccess(`Todo marked as ${updatedTodo.completed ? 'completed' : 'pending'}`);
            await this.loadTodos();
            
        } catch (error) {
            console.error('Failed to toggle todo completion:', error);
            this.showError('Failed to update todo status');
        }
    }

    // Show delete confirmation modal
    showDeleteModal(todoId) {
        this.todoToDelete = todoId;
        const modal = document.getElementById('delete-modal');
        if (modal) modal.style.display = 'block';
    }

    // Confirm delete
    async confirmDelete() {
        if (!this.todoToDelete) return;
        
        try {
            await api.deleteTodo(this.todoToDelete);
            this.showSuccess('Todo deleted successfully');
            this.closeDeleteModal();
            await this.loadTodos();
            
        } catch (error) {
            console.error('Failed to delete todo:', error);
            this.showError('Failed to delete todo');
        }
    }

    // Close todo modal
    closeTodoModal() {
        const modal = document.getElementById('todo-modal');
        if (modal) modal.style.display = 'none';
        this.editingTodoId = null;
    }

    // Close delete modal
    closeDeleteModal() {
        const modal = document.getElementById('delete-modal');
        if (modal) modal.style.display = 'none';
        this.todoToDelete = null;
    }

    // Filter todos
    async filterTodos(filter, buttonEl) {
        this.currentFilter = filter;
        
        // Update active button
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => btn.classList.remove('active'));
        if (buttonEl) buttonEl.classList.add('active');
        
        await this.loadTodos();
    }

    // Handle search
    handleSearch() {
        const searchInput = document.getElementById('search-input');
        if (!searchInput) return;
        
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(async () => {
            this.searchQuery = searchInput.value.trim();
            await this.loadTodos();
        }, 500); // Debounce search
    }

    // Utility functions
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showSuccess(message) {
        showMessage(message, 'success');
    }

    showError(message) {
        showMessage(message, 'error');
    }
}

// Modal click outside to close
document.addEventListener('click', function(event) {
    const todoModal = document.getElementById('todo-modal');
    const deleteModal = document.getElementById('delete-modal');
    
    if (event.target === todoModal) {
        todoManager.closeTodoModal();
    }
    
    if (event.target === deleteModal) {
        todoManager.closeDeleteModal();
    }
});

// Create global todo manager instance
const todoManager = new TodoManager();