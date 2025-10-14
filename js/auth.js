
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
    }

    async checkAuth() {
        try {
            const user = await api.getCurrentUser();
            this.currentUser = user;
            this.isAuthenticated = true;
            return true;
        } catch (error) {
            this.currentUser = null;
            this.isAuthenticated = false;
            return false;
        }
    }

    async loginUser(credentials) {
        try {
            const response = await api.login(credentials);
            this.currentUser = response.user;
            this.isAuthenticated = true;
            return response;
        } catch (error) {
            this.currentUser = null;
            this.isAuthenticated = false;
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await api.register(userData);
            return await this.loginUser({
                username: userData.username,
                password: userData.password
            });
        } catch (error) {
            throw error;
        }
    }

    async logout() {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this.currentUser = null;
            this.isAuthenticated = false;
            this.redirectToLogin();
        }
    }

    redirectToLogin() {
        app.showLoginPage();
    }

    redirectToDashboard() {
        app.showDashboard();
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const credentials = {
        username: formData.get('username'),
        password: formData.get('password')
    };

    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        submitButton.innerHTML = '<span class="loading"></span> Logging in...';
        submitButton.disabled = true;
        
        clearFormErrors(form);
        
        if (!credentials.username || !credentials.password) {
            throw new Error('Please fill in all fields');
        }

        await authManager.loginUser(credentials);
        
        showMessage('Login successful! Redirecting...', 'success');
        setTimeout(() => {
            authManager.redirectToDashboard();
        }, 1000);
        
    } catch (error) {
        console.error('Login error:', error);
        showFormError(form, error.message || 'Login failed. Please try again.');
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    const userData = {
        username: formData.get('username'),
        password: formData.get('password'),
        email: formData.get('email'),
        fullName: formData.get('fullName')
    };

    const confirmPassword = formData.get('confirmPassword');
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    
    try {
        submitButton.innerHTML = '<span class="loading"></span> Creating Account...';
        submitButton.disabled = true;
        
        clearFormErrors(form);
        
        if (!userData.username || !userData.password || !userData.email) {
            throw new Error('Please fill in all required fields');
        }
        
        if (userData.password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }
        
        if (userData.password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            throw new Error('Please enter a valid email address');
        }

        await authManager.register(userData);
        
        showMessage('Account created successfully! Redirecting...', 'success');
        setTimeout(() => {
            authManager.redirectToDashboard();
        }, 1000);
        
    } catch (error) {
        console.error('Registration error:', error);
        showFormError(form, error.message || 'Registration failed. Please try again.');
    } finally {
        submitButton.textContent = originalText;
        submitButton.disabled = false;
    }
}

function showFormError(form, message) {
    let errorElement = form.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        form.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

function clearFormErrors(form) {
    const errorElements = form.querySelectorAll('.error-message');
    errorElements.forEach(element => element.remove());
    
    const errorInputs = form.querySelectorAll('.form-control.error');
    errorInputs.forEach(input => input.classList.remove('error'));
}

function showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type === 'success' ? 'success-message' : 'error-message'}`;
    messageEl.textContent = message;
    messageEl.style.position = 'fixed';
    messageEl.style.top = '20px';
    messageEl.style.right = '20px';
    messageEl.style.zIndex = '1001';
    messageEl.style.padding = '15px 20px';
    messageEl.style.borderRadius = '8px';
    messageEl.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
    messageEl.style.color = type === 'success' ? '#155724' : '#721c24';
    messageEl.style.border = type === 'success' ? '1px solid #c3e6cb' : '1px solid #f5c6cb';
    
    document.body.appendChild(messageEl);
    
    setTimeout(() => {
        if (messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }, 50000);
}
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});


const authManager = new AuthManager();