// Authentication utilities
if (typeof API_BASE_URL === 'undefined') {
    var API_BASE_URL = 'http://localhost:5000/api';
}

// Check if user is authenticated
function isAuthenticated() {
    return localStorage.getItem('token') !== null;
}

// Get current user from localStorage
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}

// Get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Set authentication data
function setAuthData(user, token) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
}

// Clear authentication data
function clearAuthData() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
}

// Logout function
async function logout() {
    try {
        clearAuthData();
        showAlert('Logged out successfully', 'success');
        
        // Redirect to login page if not already there
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        } else {
            // Update UI elements
            updateAuthUI();
        }
    } catch (error) {
        console.error('Logout error:', error);
        showAlert('Error during logout', 'danger');
    }
}

// Update authentication UI elements
function updateAuthUI() {
    const isAuth = isAuthenticated();
    const user = getCurrentUser();
    
    
    // Update navigation elements
    const authDropdown = document.getElementById('auth-dropdown');
    const loginLink = document.getElementById('login-link');
    const userName = document.getElementById('user-name');
    const adminLink = document.getElementById('admin-link');
    
    if (authDropdown && loginLink) {
        if (isAuth && user) {
            authDropdown.style.display = 'block';
            loginLink.style.display = 'none';
            
            if (userName) {
                userName.textContent = user.username;
            }
            
            // Show admin link if user is admin
            if (adminLink && user.role === 'admin') {
                adminLink.style.display = 'block';
            } else if (adminLink) {
                adminLink.style.display = 'none';
            }
        } else {
            authDropdown.style.display = 'none';
            loginLink.style.display = 'block';
            
            if (adminLink) {
                adminLink.style.display = 'none';
            }
        }
    }
}

// Show alert message
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alert-container');
    if (!alertContainer) return;
    
    const alertId = 'alert-' + Date.now();
    const alertHTML = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    alertContainer.innerHTML = alertHTML;
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        const alert = document.getElementById(alertId);
        if (alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }
    }, 5000);
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    updateAuthUI();
    
    // If user is not authenticated and trying to access protected pages
    const protectedPages = ['cart.html', 'orders.html', 'admin.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !isAuthenticated()) {
        showAlert('Please login to access this page', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }
    
    // If user is authenticated and trying to access login page
    if (currentPage === 'login.html' && isAuthenticated()) {
        window.location.href = 'index.html';
    }
    
    // Check if admin is trying to access admin panel
    if (currentPage === 'admin.html' && isAuthenticated()) {
        const user = getCurrentUser();
        if (!user || user.role !== 'admin') {
            showAlert('Access denied. Admin privileges required.', 'danger');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        }
    }
});

// Make functions globally available
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
window.getAuthToken = getAuthToken;
window.setAuthData = setAuthData;
window.clearAuthData = clearAuthData;
window.logout = logout;
window.updateAuthUI = updateAuthUI;
window.showAlert = showAlert;
