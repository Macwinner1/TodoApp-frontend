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

document.addEventListener("click", function (event) {
    if (event.target.id === "todo-modal") todoManager.closeTodoModal();
    if (event.target.id === "delete-modal") todoManager.closeDeleteModal();
});

const todoManager = new TodoManager();
