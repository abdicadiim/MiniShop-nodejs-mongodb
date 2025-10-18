// Orders page functionality
let currentOrders = [];

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isAuthenticated()) {
        showAlert('Please login to view your orders', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // Load orders
    loadOrders();
});

// Load orders from API
async function loadOrders() {
    try {
        showOrdersLoading(true);
        
        const result = await ordersAPI.getAll();
        
        if (result.success) {
            currentOrders = result.data.orders;
            displayOrders(currentOrders);
            
            if (currentOrders.length === 0) {
                showEmptyOrders(true);
            } else {
                showEmptyOrders(false);
            }
        } else {
            showAlert('Failed to load orders', 'danger');
        }
    } catch (error) {
        console.error('Error loading orders:', error);
        showAlert('Error loading orders', 'danger');
    } finally {
        showOrdersLoading(false);
    }
}

// Display orders
function displayOrders(orders) {
    const ordersList = document.getElementById('orders-list');
    if (!ordersList) return;
    
    ordersList.innerHTML = '';
    
    orders.forEach(order => {
        const orderElement = createOrderElement(order);
        ordersList.appendChild(orderElement);
    });
}

// Create order element
function createOrderElement(order) {
    const col = document.createElement('div');
    col.className = 'col-12 mb-3';
    
    col.innerHTML = `
        <div class="card">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-2">
                        <div class="text-center">
                            <div class="h6 mb-1">Order #${order._id.slice(-8)}</div>
                            <small class="text-muted">${formatDate(order.createdAt)}</small>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="h6 mb-1">${order.items.length} Item${order.items.length > 1 ? 's' : ''}</div>
                        <small class="text-muted">
                            ${order.items.slice(0, 2).map(item => item.product.name).join(', ')}
                            ${order.items.length > 2 ? ` and ${order.items.length - 2} more...` : ''}
                        </small>
                    </div>
                    <div class="col-md-2">
                        <div class="h6 mb-1">${formatPrice(order.totalAmount)}</div>
                    </div>
                    <div class="col-md-3">
                        <span class="badge ${getStatusBadgeClass(order.status)} fs-6">
                            ${getStatusText(order.status)}
                        </span>
                    </div>
                    <div class="col-md-2 text-end">
                        <button class="btn btn-outline-primary btn-sm" onclick="viewOrderDetails('${order._id}')">
                            <i class="fas fa-eye me-1"></i>View Details
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// View order details
async function viewOrderDetails(orderId) {
    try {
        const result = await ordersAPI.getById(orderId);
        
        if (result.success) {
            showOrderModal(result.data.order);
        } else {
            showAlert('Failed to load order details', 'danger');
        }
    } catch (error) {
        console.error('Error loading order details:', error);
        showAlert('Error loading order details', 'danger');
    }
}

// Show order modal
function showOrderModal(order) {
    const modalBody = document.getElementById('orderModalBody');
    if (!modalBody) return;
    
    modalBody.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <h6 class="fw-bold mb-3">Order Information</h6>
                <table class="table table-sm">
                    <tr>
                        <td><strong>Order ID:</strong></td>
                        <td>${order._id}</td>
                    </tr>
                    <tr>
                        <td><strong>Order Date:</strong></td>
                        <td>${formatDate(order.createdAt)}</td>
                    </tr>
                    <tr>
                        <td><strong>Status:</strong></td>
                        <td>
                            <span class="badge ${getStatusBadgeClass(order.status)}">
                                ${getStatusText(order.status)}
                            </span>
                        </td>
                    </tr>
                    <tr>
                        <td><strong>Total Items:</strong></td>
                        <td>${order.items.length}</td>
                    </tr>
                    <tr>
                        <td><strong>Total Amount:</strong></td>
                        <td class="fw-bold">${formatPrice(order.totalAmount)}</td>
                    </tr>
                </table>
            </div>
            <div class="col-md-6">
                <h6 class="fw-bold mb-3">Shipping Address</h6>
                <address>
                    ${order.shippingAddress.street}<br>
                    ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
                    ${order.shippingAddress.country}
                </address>
            </div>
        </div>
        
        <hr>
        
        <h6 class="fw-bold mb-3">Order Items</h6>
        <div class="table-responsive">
            <table class="table table-sm">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.items.map(item => `
                        <tr>
                            <td>
                                <div class="d-flex align-items-center">
                                    <img src="${item.product.image}" class="me-2" 
                                         style="width: 40px; height: 40px; object-fit: cover;" 
                                         alt="${item.product.name}">
                                    <div>
                                        <div class="fw-bold">${item.product.name}</div>
                                        <small class="text-muted">${item.product.category}</small>
                                    </div>
                                </div>
                            </td>
                            <td>${item.quantity}</td>
                            <td>${formatPrice(item.price)}</td>
                            <td class="fw-bold">${formatPrice(item.price * item.quantity)}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr class="table-active">
                        <th colspan="3">Total</th>
                        <th>${formatPrice(order.totalAmount)}</th>
                    </tr>
                </tfoot>
            </table>
        </div>
    `;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('orderModal'));
    modal.show();
}

// Refresh orders
function refreshOrders() {
    loadOrders();
}

// Show/hide orders loading
function showOrdersLoading(show) {
    const ordersLoading = document.getElementById('orders-loading');
    if (ordersLoading) {
        ordersLoading.style.display = show ? 'block' : 'none';
    }
}

// Show/hide empty orders message
function showEmptyOrders(show) {
    const emptyOrders = document.getElementById('empty-orders');
    if (emptyOrders) {
        emptyOrders.style.display = show ? 'block' : 'none';
    }
}

// Update cart count
async function updateCartCount() {
    try {
        const result = await cartAPI.get();
        if (result.success) {
            const cartCount = result.data.cart.items.length;
            const cartCountElement = document.getElementById('cart-count');
            if (cartCountElement) {
                cartCountElement.textContent = cartCount;
            }
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    if (isAuthenticated()) {
        updateCartCount();
    }
});

// Make functions globally available
window.viewOrderDetails = viewOrderDetails;
window.refreshOrders = refreshOrders;
