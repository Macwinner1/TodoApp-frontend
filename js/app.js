
class TodoApp {
    constructor() {
        this.currentPage = null;
        this.pageCache = new Map();
    }

    async init() {
        console.log('Initializing Todo App...');
        
        this.setupEventListeners();
        
        const isAuthenticated = await authManager.checkAuth();
        
        if (isAuthenticated) {
            this.showDashboard();
        } else {
            this.showLoginPage();
        }
    }

    setupEventListeners() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                authManager.logout();
            });
        }

        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page) {
                this.navigateToPage(event.state.page, false);
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const todoModal = document.getElementById('todo-modal');
                const deleteModal = document.getElementById('delete-modal');
                
                if (todoModal && todoModal.style.display === 'block') {
                    todoManager.closeTodoModal();
                }
                
                if (deleteModal && deleteModal.style.display === 'block') {
                    todoManager.closeDeleteModal();
                }
            }
            
            if (event.ctrlKey && event.key === 'n' && this.currentPage === 'dashboard') {
                event.preventDefault();
                todoManager.showAddTodoModal();
            }
        });
    }

    async loadPageContent(pageName) {
        if (this.pageCache.has(pageName)) {
            return this.pageCache.get(pageName);
        }

        try {
            const response = await fetch(`pages/${pageName}.html`);
            if (!response.ok) {
                throw new Error(`Failed to load page: ${pageName}`);
            }
            
            const content = await response.text();
            this.pageCache.set(pageName, content);
            return content;
        } catch (error) {
            console.error('Error loading page content:', error);
            return '<div class="error">Failed to load page content</div>';
        }
    }

    async navigateToPage(pageName, pushState = true) {
        if (this.currentPage === pageName) return;

        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        try {
            mainContent.innerHTML = '<div class="text-center" style="padding: 40px;"><div class="loading" style="margin: 0 auto;"></div><p style="margin-top: 10px;">Loading...</p></div>';

            const content = await this.loadPageContent(pageName);
            mainContent.innerHTML = content;

            this.currentPage = pageName;

            if (pushState) {
                history.pushState({ page: pageName }, '', `#${pageName}`);
            }

            await this.initializePage(pageName);

        } catch (error) {
            console.error('Error navigating to page:', error);
            mainContent.innerHTML = '<div class="error">Failed to load page</div>';
        }
    }

    async initializePage(pageName) {
        switch (pageName) {
            case 'dashboard':
                await this.initializeDashboard();
                break;
            case 'auth':
                this.initializeAuthPages();
                break;
        }
    }

    async initializeDashboard() {
        this.updateNavbar(true);
        
        await todoManager.loadTodos();
    }

    initializeAuthPages() {
        this.updateNavbar(false);
    }

    updateNavbar(show) {
        const navbar = document.getElementById('navbar');
        const welcomeMessage = document.getElementById('welcome-message');
        
        if (navbar) {
            navbar.style.display = show ? 'flex' : 'none';
        }
        
        if (show && welcomeMessage && authManager.getCurrentUser()) {
            const user = authManager.getCurrentUser();
            welcomeMessage.textContent = `Welcome, ${user.fullName || user.username}!`;
        }
    }

    async showLoginPage() {
        await this.navigateToPage('auth');
        const loginPage = document.getElementById('login-page');
        const registerPage = document.getElementById('register-page');
        
        if (loginPage) loginPage.classList.remove('hidden');
        if (registerPage) registerPage.classList.add('hidden');
    }

    async showRegisterPage() {
        await this.navigateToPage('auth');
        const loginPage = document.getElementById('login-page');
        const registerPage = document.getElementById('register-page');
        
        if (loginPage) loginPage.classList.add('hidden');
        if (registerPage) registerPage.classList.remove('hidden');
    }

    async showDashboard() {
        await this.navigateToPage('dashboard');
    }

    handleError(error) {
        console.error('Application error:', error);
        
        if (error.status === 401) {
            authManager.logout();
        } else {
            showMessage(error.message || 'An unexpected error occurred', 'error');
        }
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    window.app = new TodoApp();
    
    try {
        await app.init();
    } catch (error) {
        console.error('Failed to initialize app:', error);
        document.getElementById('main-content').innerHTML = 
            '<div class="error text-center" style="padding: 40px;"><h3>Failed to load application</h3><p>Please refresh the page and try again.</p></div>';
    }
});

window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});