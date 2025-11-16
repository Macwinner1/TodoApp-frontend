// class TodoManager {
//     constructor() {
//         this.todos = [];
//         this.currentFilter = 'all';
//         this.searchQuery = '';
//         this.editingTodoId = null;
//         this.todoToDelete = null;
//     }

//     async loadTodos() {
//         try {
//             const loadingEl = document.getElementById('loading-todos');
//             const todoListEl = document.getElementById('todo-list');
//             const emptyStateEl = document.getElementById('empty-state');

//             if (loadingEl) loadingEl.classList.remove('hidden');
//             if (emptyStateEl) emptyStateEl.classList.add('hidden');

//             // Get todos based on current filter and search
//             const filters = {};
//             if (this.currentFilter === 'completed') {
//                 filters.completed = true;
//             } else if (this.currentFilter === 'pending') {
//                 filters.completed = false;
//             }
            
//             if (this.searchQuery) {
//                 filters.search = this.searchQuery;
//             }

//             const response = await api.getTodos(filters);
//             this.todos = response.data || [];

//             this.renderTodos();
//             await this.loadStats();
            

//         } catch (error) {
//             console.error('Failed to load todos:', error);
//             this.showError('Failed to load todos. Please try again.');
//         } finally {
//             const loadingEl = document.getElementById('loading-todos');
//             if (loadingEl) loadingEl.classList.add('hidden');
//         }
//     }

//     // Render todos in the list
//     renderTodos() {
//         const todoListEl = document.getElementById('todo-list');
//         const emptyStateEl = document.getElementById('empty-state');
//         // const loadingEl = document.getElementById('loading-todos');

//         if (!todoListEl) return;

//         // Hide loading
//         // if (loadingEl) loadingEl.classList.add('hidden');

//         if (this.todos.length === 0 || !this.todos) {
//         todoListEl.innerHTML = '';
//         if (emptyStateEl) emptyStateEl.classList.remove('hidden');
//             const titleEl = document.getElementById('empty-title');
//             const descEl = document.getElementById('empty-description');
//             const actionBtn = document.getElementById('empty-action');

//             if (this.currentFilter === 'completed') {
//             titleEl.textContent = 'No completed todos';
//             descEl.textContent = 'You haven’t marked any todos as completed yet.';
//             actionBtn.classList.add('hidden'); // Hide the "Create" button
//             } else if (this.currentFilter === 'pending') {
//             titleEl.textContent = 'No pending todos';
//             descEl.textContent = 'Looks like you haven’t added any todos yet, or you’ve already completed them all. Either way, you’re off to a great start!';
//             actionBtn.classList.remove('hidden');
//             } else {
//             titleEl.textContent = 'No todos found';
//             descEl.textContent = 'Get started by creating your todo that contains these keywords!';
//             actionBtn.classList.remove('hidden');
//             }
//         return;
//         }


//         if (emptyStateEl) emptyStateEl.classList.add('hidden');

//         todoListEl.innerHTML = this.todos.map(todo => this.createTodoHTML(todo)).join('');
        
//     }

//     // Create HTML for a single todo item
//     createTodoHTML(todo) {
//         const dueDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : '';
//         const createdDate = new Date(todo.createdAt).toLocaleDateString();
        
//         return `
//             <div class="todo-item ${todo.completed ? 'completed' : ''}" data-todo-id="${todo.todoId}">
//                 <div class="todo-header-item">
//                     <h3 class="todo-title">${this.escapeHtml(todo.title)}</h3>
//                     <span class="todo-priority priority-${todo.priority.toLowerCase()}">
//                         ${todo.priority}
//                     </span>
//                 </div>
                
//                 ${todo.description ? `<p class="todo-description">${this.escapeHtml(todo.description)}</p>` : ''}
                
//                 <div class="todo-meta">
//                     <span>Created: ${createdDate}</span>
//                     ${dueDate ? `<span>Due: ${dueDate}</span>` : ''}
//                 </div>
                
//                 <div class="todo-actions">
//                     <button class="btn btn-sm ${todo.completed ? 'btn-warning' : 'btn-success'}" 
//                             onclick="todoManager.toggleComplete(${todo.todoId})">
//                         ${todo.completed ? 'Mark Pending' : 'Mark Complete'}
//                     </button>
//                     <button class="btn btn-sm btn-primary" onclick="todoManager.editTodo(${todo.todoId})">
//                         Edit
//                     </button>
//                     <button class="btn btn-sm btn-danger" onclick="todoManager.showDeleteModal(${todo.todoId})">
//                         Delete
//                     </button>
//                 </div>
//             </div>
//         `;
//     }

//     // Load todo statistics
//     async loadStats() {
//         try {
//             const stats = await api.getTodoStats();
            
//             const data = stats.data ?? stats;

//             document.getElementById('total-todos').textContent = data.total ?? 0;
//             document.getElementById('completed-todos').textContent = data.completed ?? 0;
//             document.getElementById('pending-todos').textContent = data.pending ?? 0;
            
//         } catch (error) {
//             console.error('Failed to load stats:', error);
//             // this.showError('Failed to load statistics');
//         }
//     }

//     // Show add todo modal
//     showAddTodoModal() {
//         this.editingTodoId = null;

//         document.getElementById('modal-title').textContent = 'Add New Todo';
//         document.getElementById('submit-btn-text').textContent = 'Add Todo';
//         document.getElementById('todo-form').reset();
//         document.getElementById('todo-completed').checked = false;

//         document.getElementById('todo-modal').style.display = 'block';
//     }

//     // Edit todo
//     async editTodo(todoId) {
//         try {
//             const response = await api.getTodo(todoId);
//             const todo = response.data ?? response;
//             this.editingTodoId = todoId;
            
//             document.getElementById('modal-title').textContent = 'Edit Todo';
//             document.getElementById('submit-btn-text').textContent = 'Update Todo';

//             document.getElementById('todo-title').value = todo.title ?? '';
//             document.getElementById('todo-description').value = todo.description ?? '';
//             document.getElementById('todo-priority').value = todo.priority ?? 'MEDIUM';
//             document.getElementById('todo-completed').checked = todo.completed ?? false;
            
//             // Handle due date
//             if (todo.dueDate) {
//                 const date = new Date(todo.dueDate);
//                 const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
//                 document.getElementById('todo-due-date').value = localDate.toISOString().slice(0, 16);
//             } else {
//                 document.getElementById('todo-due-date').value = '';
//             }
            
//             document.getElementById('todo-modal').style.display = 'block';
            
//         } catch (error) {
//             console.error('Failed to load todo for editing:', error);
//             this.showError('Failed to load todo for editing');
//         }
//     }

//     // Handle todo form submission
//     async handleTodoSubmit(event) {
//         event.preventDefault();
        
//         const form = event.target;
//         const formData = new FormData(form);
//         const submitBtn = form.querySelector('button[type="submit"]');
//         const originalText = submitBtn.innerHTML;
        
//         try {
//             // Show loading state
//             submitBtn.innerHTML = '<span class="loading"></span> Saving...';
//             submitBtn.disabled = true;
            
//             const todoData = {
//                 title: formData.get('title')?.trim(),
//                 description: formData.get('description')?.trim() || '',
//                 priority: formData.get('priority'),
//                 completed: formData.get('completed') === 'on',
//                 dueDate: formData.get('dueDate') || null
//             };
            
//             // Validate
//             if (!todoData.title.trim()) {
//                 throw new Error('Title is required');
//             }
            
//             if (this.editingTodoId) {
//                 // Update existing todo
//                 await api.updateTodo(this.editingTodoId, todoData);
//                 this.showSuccess('Todo updated successfully');
//             } else {
//                 // Create new todo
//                 await api.createTodo(todoData);
//                 this.showSuccess('Todo created successfully');
//             }
            
//             this.closeTodoModal();
//             await this.loadTodos();
            
//         } catch (error) {
//             console.error('Failed to save todo:', error);
//             this.showError(error.message || 'Failed to save todo');
//         } finally {
//             submitBtn.innerHTML = originalText;
//             submitBtn.disabled = false;
//         }
//     }

//     // Toggle todo completion status
//     async toggleComplete(todoId) {
//         try {
//             const todo = this.todos.find(t => t.todoId === todoId);
//             if (!todo) return;
            
//             const updatedTodo = {
//                 ...todo,
//                 completed: !todo.completed
//             };
            
//             await api.updateTodo(todoId, updatedTodo);
//             this.showSuccess(`Todo "${todo.title}" is now marked as ${updatedTodo.completed ? 'completed' : 'pending'}`);
            
//             // await this.filterTodos(this.currentFilter);
//             await this.loadTodos();
            
//         } catch (error) {
//             console.error('Failed to toggle todo completion:', error);
//             this.showError('Failed to update todo status');
//         }
//     }

//     // Show delete confirmation modal
//     showDeleteModal(todoId) {
//         this.todoToDelete = todoId;
//         // console.log('Preparing to delete todo:', todoId);
//         const modal = document.getElementById('delete-modal');
//         if (modal) modal.style.display = 'block';
//     }

//     // Confirm delete
//     async confirmDelete() {
//         if (!this.todoToDelete) return;
        
//         try {
//             await api.deleteTodo(this.todoToDelete);
//             this.showSuccess('Todo deleted successfully');
//             this.closeDeleteModal();
//             await this.loadTodos();
            
//         } catch (error) {
//             console.error('Failed to delete todo:', error);
//             this.showError('Failed to delete todo');
//         }
//     }

//     // Close todo modal
//     closeTodoModal() {
//         const modal = document.getElementById('todo-modal');
//         if (modal) modal.style.display = 'none';
//         this.editingTodoId = null;
//     }

//     // Close delete modal
//     closeDeleteModal() {
//         const modal = document.getElementById('delete-modal');
//         if (modal) modal.style.display = 'none';
//         this.todoToDelete = null;
//     }

//     // Filter todos
//     async filterTodos(filter, buttonEl) {
//         this.currentFilter = filter;
        
//         // Update active button
//         const filterButtons = document.querySelectorAll('.filter-btn');
//         filterButtons.forEach(btn => btn.classList.remove('active'));
//         if (buttonEl) buttonEl.classList.add('active');
        
//         await this.loadTodos();
//     }

//     // Handle search
//     handleSearch() {
//         const searchInput = document.getElementById('search-input');
//         if (!searchInput) return;
        
//         clearTimeout(this.searchTimeout);
//         this.searchTimeout = setTimeout(async () => {
//             this.searchQuery = searchInput.value.trim();
//             await this.loadTodos();
//         }, 500);
//     }

//     // Utility functions
//     escapeHtml(text) {
//         const div = document.createElement('div');
//         div.textContent = text;
//         return div.innerHTML;
//     }

//     showSuccess(message) {
//         showMessage(message, 'success');
//     }

//     showError(message) {
//         showMessage(message, 'error');
//     }
// }

// // Modal click outside to close
// document.addEventListener('click', function(event) {
//     const todoModal = document.getElementById('todo-modal');
//     const deleteModal = document.getElementById('delete-modal');
    
//     if (event.target === todoModal) {
//         todoManager.closeTodoModal();
//     }
    
//     if (event.target === deleteModal) {
//         todoManager.closeDeleteModal();
//     }
// });

// // Create global todo manager instance
// const todoManager = new TodoManager();


class TodoManager {
    constructor() {
        this.todos = [];
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.editingTodoId = null;
        this.todoToDelete = null;
    }

    async loadTodos() {
        try {
            const loadingEl = document.getElementById('loading-todos');
            const todoListEl = document.getElementById('todo-list');
            const emptyStateEl = document.getElementById('empty-state');

            if (loadingEl) loadingEl.classList.remove('hidden');
            if (emptyStateEl) emptyStateEl.classList.add('hidden');

            // Build filters for /search
            const filters = {};
            if (this.currentFilter === 'completed') filters.completed = true;
            else if (this.currentFilter === 'pending') filters.completed = false;

            if (this.searchQuery) filters.search = this.searchQuery;

            let response;

            if (Object.keys(filters).length > 0) {
                response = await api.searchTodos(filters);
            } else {
                response = await api.getTodos();
            }

            const data = response.data ?? response.todos ?? [];

            this.todos = data;
            this.renderTodos();
            await this.loadStats();

        } catch (error) {
            console.error("Failed to load todos:", error);
            this.showError("Failed to load todos.");
        } finally {
            const loadingEl = document.getElementById('loading-todos');
            if (loadingEl) loadingEl.classList.add('hidden');
        }
    }


    renderTodos() {
        const todoListEl = document.getElementById("todo-list");
        const emptyStateEl = document.getElementById("empty-state");

        if (!todoListEl) return;

        if (!this.todos.length) {
            todoListEl.innerHTML = "";
            const titleEl = document.getElementById('empty-title');
            const descEl = document.getElementById('empty-description');
            const actionBtn = document.getElementById('empty-action');

            if (this.currentFilter === 'completed') {
            titleEl.textContent = 'No completed todos';
            descEl.textContent = 'You haven’t marked any todos as completed yet.';
            actionBtn.classList.add('hidden'); // Hide the "Create" button
            } else if (this.currentFilter === 'pending') {
            titleEl.textContent = 'No pending todos';
            descEl.textContent = 'Looks like you haven’t added any todos yet, or you’ve already completed them all. Either way, you’re off to a great start!';
            actionBtn.classList.remove('hidden');
            } else {
            titleEl.textContent = 'No todos found';
            descEl.textContent = 'Get started by creating your first todo!';
            actionBtn.classList.remove('hidden');
            }

            emptyStateEl?.classList.remove("hidden");
            return;
        }

        emptyStateEl?.classList.add("hidden");

        todoListEl.innerHTML = this.todos
            .map((todo) => this.createTodoHTML(todo))
            .join("");
    }

    // ============================
    // TODO HTML
    // ============================
    createTodoHTML(todo) {
        return `
            <div class="todo-item ${todo.completed ? "completed" : ""}" data-todo-id="${todo.todoId}">
                <div class="todo-header-item">
                    <h3 class="todo-title">${this.escapeHtml(todo.title)}</h3>
                    <span class="todo-priority priority-${todo.priority.toLowerCase()}">${todo.priority}</span>
                </div>

                ${todo.description ? `<p class="todo-description">${this.escapeHtml(todo.description)}</p>` : ""}

                <div class="todo-meta">
                    <span>Created: ${new Date(todo.createdAt).toLocaleDateString()}</span>
                    ${todo.dueDate ? `<span>Due: ${new Date(todo.dueDate).toLocaleDateString()}</span>` : ""}
                </div>

                <div class="todo-actions">
                    <button class="btn btn-sm ${todo.completed ? "btn-warning" : "btn-success"}"
                            onclick="todoManager.toggleComplete('${todo.todoId}')">
                        ${todo.completed ? "Mark Pending" : "Mark Complete"}
                    </button>

                    <button class="btn btn-sm btn-primary" onclick="todoManager.editTodo('${todo.todoId}')">
                        Edit
                    </button>

                    <button class="btn btn-sm btn-danger" onclick="todoManager.showDeleteModal('${todo.todoId}')">
                        Delete
                    </button>
                </div>
            </div>
        `;
    }

    // ============================
    // LOAD STATS
    // ============================
    async loadStats() {
        try {
            const stats = await api.getTodoStats();
            const data = stats.data ?? stats;

            document.getElementById("total-todos").textContent = data.total ?? 0;
            document.getElementById("completed-todos").textContent = data.completed ?? 0;
            document.getElementById("pending-todos").textContent = data.pending ?? 0;
        } catch (error) {
            console.error("Failed to load stats", error);
        }
    }

    showAddTodoModal() {
        this.editingTodoId = null;

        document.getElementById('modal-title').textContent = 'Add New Todo';
        document.getElementById('submit-btn-text').textContent = 'Add Todo';
        document.getElementById('todo-form').reset();
        document.getElementById('todo-completed').checked = false;

        document.getElementById('todo-modal').style.display = 'block';
    }

    // ============================
    // EDIT TODO – FIXED
    // ============================
    async editTodo(todoId) {
        try {
            const response = await api.getTodo(todoId);
            const todo = response.data ?? response;

            this.editingTodoId = todoId;

            document.getElementById("modal-title").textContent = "Edit Todo";
            document.getElementById("submit-btn-text").textContent = "Update Todo";

            document.getElementById("todo-title").value = todo.title ?? "";
            document.getElementById("todo-description").value = todo.description ?? "";
            document.getElementById("todo-priority").value = todo.priority ?? "MEDIUM";
            document.getElementById("todo-completed").checked = todo.completed ?? false;

            if (todo.dueDate) {
                const date = new Date(todo.dueDate);
                document.getElementById("todo-due-date").value = new Date(
                    date.getTime() - date.getTimezoneOffset() * 60000
                )
                    .toISOString()
                    .slice(0, 16);
            }

            document.getElementById("todo-modal").style.display = "block";
        } catch (error) {
            console.error("Failed to load todo:", error);
            this.showError("Could not load todo.");
        }
    }

    // ============================
    // SUBMIT TODO (CREATE/UPDATE)
    // ============================
    async handleTodoSubmit(event) {
        event.preventDefault();

        const form = event.target;
        const formData = new FormData(form);
        const submitBtn = form.querySelector("button[type='submit']");
        const originalText = submitBtn.innerHTML;

        try {
            submitBtn.innerHTML = "Saving...";
            submitBtn.disabled = true;

            const todoData = {
                title: formData.get("title"),
                description: formData.get("description"),
                priority: formData.get("priority"),
                completed: formData.get("completed") === "on",
                dueDate: formData.get("dueDate") || null,
            };

            if (this.editingTodoId) {
                await api.updateTodo(this.editingTodoId, todoData);
                this.showSuccess("Todo updated.");
            } else {
                await api.createTodo(todoData);
                this.showSuccess("Todo created.");
            }

            this.closeTodoModal();
            await this.loadTodos();
        } catch (error) {
            this.showError("Could not save todo.");
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    // ============================
    // TOGGLE COMPLETE – FIXED
    // (Uses PATCH /complete or /incomplete)
    // ============================
    async toggleComplete(todoId) {
        try {
            const todo = this.todos.find((t) => t.todoId === todoId);

            if (!todo) return;

            if (todo.completed) {
                await api.markIncomplete(todoId);
            } else {
                await api.markComplete(todoId);
            }

            this.showSuccess("Todo updated.");
            await this.loadTodos();
        } catch (error) {
            this.showError("Could not update todo.");
        }
    }

    // ============================
    // DELETE – FIXED
    // ============================
    showDeleteModal(todoId) {
        this.todoToDelete = todoId;
        document.getElementById("delete-modal").style.display = "block";
    }

    async confirmDelete() {
        try {
            await api.deleteTodo(this.todoToDelete);
            this.showSuccess("Todo deleted.");
            this.closeDeleteModal();
            await this.loadTodos();
        } catch (error) {
            this.showError("Failed to delete todo.");
        }
    }

    closeTodoModal() {
        document.getElementById("todo-modal").style.display = "none";
    }

    closeDeleteModal() {
        document.getElementById("delete-modal").style.display = "none";
    }

    async filterTodos(filter, buttonEl) {
        this.currentFilter = filter;

        document.querySelectorAll(".filter-btn").forEach((btn) => btn.classList.remove("active"));
        buttonEl?.classList.add("active");

        await this.loadTodos();
    }

    handleSearch() {
        const input = document.getElementById("search-input");
        clearTimeout(this.searchTimeout);

        this.searchTimeout = setTimeout(async () => {
            this.searchQuery = input.value.trim();
            await this.loadTodos();
        }, 300);
    }

    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }

    showSuccess(msg) {
        showMessage(msg, "success");
    }

    showError(msg) {
        showMessage(msg, "error");
    }
}

// Handle clicking outside modals
document.addEventListener("click", function (event) {
    if (event.target.id === "todo-modal") todoManager.closeTodoModal();
    if (event.target.id === "delete-modal") todoManager.closeDeleteModal();
});

const todoManager = new TodoManager();
