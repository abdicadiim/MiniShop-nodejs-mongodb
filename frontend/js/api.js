// API utility functions
if (typeof API_BASE_URL === 'undefined') {
    var API_BASE_URL = 'https://minishop-nodejs-mongodb-backend.onrender.com';
}

// Check if auth functions are available
function checkAuthFunctions() {
    if (typeof getAuthToken === 'undefined') {
        console.error('Auth functions not loaded. Make sure auth.js is loaded before api.js');
        return false;
    }
    return true;
}

// Generic API request function
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = checkAuthFunctions() ? getAuthToken() : null;
    
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    // Add authorization header if token exists
    if (token) {
        defaultOptions.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Merge options
    const finalOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };
    
    try {
        const response = await fetch(url, finalOptions);
        const data = await response.json();
        
        // Handle authentication errors
        if (response.status === 401) {
            if (checkAuthFunctions() && typeof clearAuthData === 'function') {
                clearAuthData();
            }
            if (typeof showAlert === 'function') {
                showAlert('Session expired. Please login again.', 'warning');
            }
            if (!window.location.pathname.includes('login.html')) {
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
            }
            throw new Error('Unauthorized');
        }
        
        return { response, data };
    } catch (error) {
        console.error('API request error:', error);
        throw error;
    }
}

// Auth API functions
const authAPI = {
    async login(email, password) {
        const { data } = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
        return data;
    },
    
    async register(username, email, password) {
        const { data } = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password }),
        });
        return data;
    },
    
    async getProfile() {
        const { data } = await apiRequest('/auth/profile');
        return data;
    }
};

// Products API functions
const productsAPI = {
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';
        const { data } = await apiRequest(endpoint);
        return data;
    },
    
    async getById(id) {
        const { data } = await apiRequest(`/products/${id}`);
        return data;
    },
    
    async create(productData) {
        const { data } = await apiRequest('/products', {
            method: 'POST',
            body: JSON.stringify(productData),
        });
        return data;
    },
    
    async update(id, productData) {
        const { data } = await apiRequest(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData),
        });
        return data;
    },
    
    async delete(id) {
        const { data } = await apiRequest(`/products/${id}`, {
            method: 'DELETE',
        });
        return data;
    }
};

// Cart API functions
const cartAPI = {
    async get() {
        const { data } = await apiRequest('/cart');
        return data;
    },
    
    async addItem(productId, quantity = 1) {
        const { data } = await apiRequest('/cart/add', {
            method: 'POST',
            body: JSON.stringify({ productId, quantity }),
        });
        return data;
    },
    
    async updateItem(productId, quantity) {
        const { data } = await apiRequest(`/cart/update/${productId}`, {
            method: 'PUT',
            body: JSON.stringify({ quantity }),
        });
        return data;
    },
    
    async removeItem(productId) {
        const { data } = await apiRequest(`/cart/remove/${productId}`, {
            method: 'DELETE',
        });
        return data;
    },
    
    async clear() {
        const { data } = await apiRequest('/cart/clear', {
            method: 'DELETE',
        });
        return data;
    }
};

// Orders API functions
const ordersAPI = {
    async getAll(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/orders?${queryString}` : '/orders';
        const { data } = await apiRequest(endpoint);
        return data;
    },
    
    async getById(id) {
        const { data } = await apiRequest(`/orders/${id}`);
        return data;
    },
    
    async create(shippingAddress) {
        const { data } = await apiRequest('/orders/create', {
            method: 'POST',
            body: JSON.stringify({ shippingAddress }),
        });
        return data;
    },
    
    async updateStatus(id, status) {
        const { data } = await apiRequest(`/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status }),
        });
        return data;
    },
    
    async getAllAdmin(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/orders/admin/all?${queryString}` : '/orders/admin/all';
        const { data } = await apiRequest(endpoint);
        return data;
    }
};

// Utility functions
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusBadgeClass(status) {
    const statusClasses = {
        pending: 'bg-warning',
        processing: 'bg-info',
        shipped: 'bg-primary',
        delivered: 'bg-success',
        cancelled: 'bg-danger'
    };
    return statusClasses[status] || 'bg-secondary';
}

function getStatusText(status) {
    return status.charAt(0).toUpperCase() + status.slice(1);
}

// Make APIs globally available
window.authAPI = authAPI;
window.productsAPI = productsAPI;
window.cartAPI = cartAPI;
window.ordersAPI = ordersAPI;
window.formatPrice = formatPrice;
window.formatDate = formatDate;
window.getStatusBadgeClass = getStatusBadgeClass;
window.getStatusText = getStatusText;
