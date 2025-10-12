
let todos = [];
let currentFilter = 'all';
let searchQuery = '';
let editingTodoId = null;
let todoToDelete = null;

async function loadTodos() {
  try {
    const loadingEl = document.getElementById('loading-todos');
    const todoListEl = document.getElementById('todo-list');
    const emptyStateEl = document.getElementById('empty-state');

    if (loadingEl) loadingEl.classList.remove('hidden');
    if (emptyStateEl) emptyStateEl.classList.add('hidden');

    const filters = {};
    if (currentFilter === 'completed') {
      filters.completed = true;
    } else if (currentFilter === 'pending') {
      filters.completed = false;
    }
    if (searchQuery) {
      filters.search = searchQuery;
    }

    todos = await getTodos(filters);
    renderTodos();
    await loadStats();
  } catch (error) {
    console.error('Failed to load todos:', error);
    if (error.message === 'Not logged in') {
      logout();
    } else {
      showMessage('Failed to load todos. Please try again.', 'error');
    }
  } finally {
    const loadingEl = document.getElementById('loading-todos');
    if (loadingEl) loadingEl.classList.add('hidden');
  }
}

function renderTodos() {
  const todoListEl = document.getElementById('todo-list');
  const emptyStateEl = document.getElementById('empty-state');
  const loadingEl = document.getElementById('loading-todos');

  if (!todoListEl) return;
  if (loadingEl) loadingEl.classList.add('hidden');

  if (todos.length === 0) {
    todoListEl.innerHTML = '';
    if (emptyStateEl) emptyStateEl.classList.remove('hidden');
    return;
  }

  if (emptyStateEl) emptyStateEl.classList.add('hidden');
  todoListEl.innerHTML = todos.map((todo) => createTodoHTML(todo)).join('');
}

function createTodoHTML(todo) {
  const dueDate = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : '';
  const createdDate = new Date(todo.createdAt).toLocaleDateString();
  return `
    <div class="todo-item ${todo.completed ? 'completed' : ''}" data-todo-id="${todo.id}">
      <div class="todo-header-item">
        <h3 class="todo-title">${escapeHtml(todo.title)}</h3>
        <span class="todo-priority priority-${todo.priority.toLowerCase()}">
          ${todo.priority}
        </span>
      </div>
      ${todo.description ? `<p class="todo-description">${escapeHtml(todo.description)}</p>` : ''}
      <div class="todo-meta">
        <span>Created: ${createdDate}</span>
        ${dueDate ? `<span>Due: ${dueDate}</span>` : ''}
      </div>
      <div class="todo-actions">
        <button class="btn btn-sm ${todo.completed ? 'btn-warning' : 'btn-success'}" 
                onclick="toggleComplete('${todo.id}')">
          ${todo.completed ? 'Mark Pending' : 'Mark Complete'}
        </button>
        <button class="btn btn-sm btn-primary" onclick="editTodo('${todo.id}')">
          Edit
        </button>
        <button class="btn btn-sm btn-danger" onclick="showDeleteModal('${todo.id}')">
          Delete
        </button>
      </div>
    </div>
  `;
}

async function loadStats() {
  try {
    const stats = await getTodoStats();
    const totalEl = document.getElementById('total-todos');
    const completedEl = document.getElementById('completed-todos');
    const pendingEl = document.getElementById('pending-todos');
    const highPriorityEl = document.getElementById('high-priority-todos');

    if (totalEl) totalEl.textContent = stats.total || 0;
    if (completedEl) completedEl.textContent = stats.completed || 0;
    if (pendingEl) pendingEl.textContent = stats.pending || 0;
    if (highPriorityEl) highPriorityEl.textContent = stats.highPriority || 0;
  } catch (error) {
    console.error('Failed to load stats:', error);
  }
}

function showAddTodoModal() {
  editingTodoId = null;
  const modal = document.getElementById('todo-modal');
  const title = document.getElementById('modal-title');
  const submitBtn = document.getElementById('submit-btn-text');
  const form = document.getElementById('todo-form');

  if (title) title.textContent = 'Add New Todo';
  if (submitBtn) submitBtn.textContent = 'Add Todo';
  if (form) form.reset();

  const completedCheckbox = document.getElementById('todo-completed');
  if (completedCheckbox) completedCheckbox.checked = false;

  if (modal) modal.style.display = 'block';
  else console.error('Modal element not found!');
}

async function editTodo(todoId) {
  try {
    const todo = await getTodo(todoId);
    editingTodoId = todoId;

    const modal = document.getElementById('todo-modal');
    const title = document.getElementById('modal-title');
    const submitBtn = document.getElementById('submit-btn-text');

    if (title) title.textContent = 'Edit Todo';
    if (submitBtn) submitBtn.textContent = 'Update Todo';

    document.getElementById('todo-title').value = todo.title || '';
    document.getElementById('todo-description').value = todo.description || '';
    document.getElementById('todo-priority').value = todo.priority || 'MEDIUM';
    document.getElementById('todo-completed').checked = todo.completed || false;

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
    if (error.message === 'Not logged in') {
      logout();
    } else {
      showMessage('Failed to load todo for editing', 'error');
    }
  }
}

async function handleTodoSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;

  try {
    submitBtn.innerHTML = '<span class="loading"></span> Saving...';
    submitBtn.disabled = true;

    const todoData = {
      title: formData.get('title'),
      description: formData.get('description'),
      priority: formData.get('priority'),
      completed: formData.get('completed') === 'on',
      dueDate: formData.get('dueDate') || null,
    };

    if (!todoData.title.trim()) {
      throw new Error('Title is required');
    }

    if (editingTodoId) {
      await updateTodo(editingTodoId, todoData);
      showMessage('Todo updated successfully', 'success');
    } else {
      await createTodo(todoData);
      showMessage('Todo created successfully', 'success');
    }

    closeTodoModal();
    await loadTodos();
  } catch (error) {
    console.error('Failed to save todo:', error);
    if (error.message === 'Not logged in') {
      logout();
    } else {
      showMessage(error.message || 'Failed to save todo', 'error');
    }
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

async function toggleComplete(todoId) {
  try {
    const todo = todos.find((t) => t.id === todoId);
    if (!todo) return;
    await toggleComplete(todoId, !todo.completed);
    showMessage(`Todo marked as ${!todo.completed ? 'completed' : 'pending'}`, 'success');
    await loadTodos();
  } catch (error) {
    console.error('Failed to toggle todo completion:', error);
    if (error.message === 'Not logged in') {
      logout();
    } else {
      showMessage('Failed to update todo status', 'error');
    }
  }
}

function showDeleteModal(todoId) {
  todoToDelete = todoId;
  const modal = document.getElementById('delete-modal');
  if (modal) modal.style.display = 'block';
}

async function confirmDelete() {
  if (!todoToDelete) return;
  try {
    await deleteTodo(todoToDelete);
    showMessage('Todo deleted successfully', 'success');
    closeDeleteModal();
    await loadTodos();
  } catch (error) {
    console.error('Failed to delete todo:', error);
    if (error.message === 'Not logged in') {
      logout();
    } else {
      showMessage('Failed to delete todo', 'error');
    }
  }
}

function closeTodoModal() {
  const modal = document.getElementById('todo-modal');
  if (modal) modal.style.display = 'none';
  editingTodoId = null;
}

function closeDeleteModal() {
  const modal = document.getElementById('delete-modal');
  if (modal) modal.style.display = 'none';
  todoToDelete = null;
}

async function filterTodos(filter, buttonEl) {
  currentFilter = filter;
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach((btn) => btn.classList.remove('active'));
  if (buttonEl) buttonEl.classList.add('active');
  await loadTodos();
}

function handleSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(async () => {
    searchQuery = searchInput.value.trim();
    await loadTodos();
  }, 500);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

document.addEventListener('click', function (event) {
  const todoModal = document.getElementById('todo-modal');
  const deleteModal = document.getElementById('delete-modal');
  if (event.target === todoModal) {
    closeTodoModal();
  }
  if (event.target === deleteModal) {
    closeDeleteModal();
  }
});