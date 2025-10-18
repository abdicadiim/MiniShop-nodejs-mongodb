// Admin page functionality
let currentProducts = [];
let currentOrders = [];
let currentEditingProduct = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication and admin role
    if (!isAuthenticated()) {
        showAlert('Please login to access admin panel', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    const user = getCurrentUser();
    if (!user || user.role !== 'admin') {
        showAlert('Access denied. Admin privileges required.', 'danger');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
        return;
    }
    
    // Load initial data
    loadAdminProducts();
    loadAdminOrders();
});

// Load products for admin
async function loadAdminProducts() {
    try {
        showProductsLoading(true);
        
        const result = await productsAPI.getAll();
        
        if (result.success) {
            currentProducts = result.data.products;
            displayAdminProducts(currentProducts);
            
            if (currentProducts.length === 0) {
                showNoAdminProducts(true);
            } else {
                showNoAdminProducts(false);
            }
        } else {
            showAlert('Failed to load products', 'danger');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showAlert('Error loading products', 'danger');
    } finally {
        showProductsLoading(false);
    }
}

// Load orders for admin
async function loadAdminOrders() {
    try {
        showOrdersLoading(true);
        
        const result = await ordersAPI.getAllAdmin();
        
        if (result.success) {
            currentOrders = result.data.orders;
            displayAdminOrders(currentOrders);
            
            if (currentOrders.length === 0) {
                showNoAdminOrders(true);
            } else {
                showNoAdminOrders(false);
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

// Display products in admin table
function displayAdminProducts(products) {
    const tableBody = document.getElementById('admin-products-table');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    products.forEach(product => {
        const row = createProductTableRow(product);
        tableBody.appendChild(row);
    });
}

// Create product table row
function createProductTableRow(product) {
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>
            <img src="${product.image}" class="img-thumbnail" 
                 style="width: 50px; height: 50px; object-fit: cover;" 
                 alt="${product.name}">
        </td>
        <td>${product.name}</td>
        <td>
            <span class="badge bg-secondary">${product.category}</span>
        </td>
        <td>${formatPrice(product.price)}</td>
        <td>
            <span class="badge ${product.stock > 10 ? 'bg-success' : product.stock > 0 ? 'bg-warning' : 'bg-danger'}">
                ${product.stock}
            </span>
        </td>
        <td>
            <span class="badge ${product.featured ? 'bg-warning' : 'bg-secondary'}">
                ${product.featured ? 'Featured' : 'Regular'}
            </span>
        </td>
        <td>
            <button class="btn btn-sm btn-outline-primary me-1" onclick="editProduct('${product._id}')">
                <i class="fas fa-edit"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="deleteProduct('${product._id}')">
                <i class="fas fa-trash"></i>
            </button>
        </td>
    `;
    
    return row;
}

// Display orders in admin table
function displayAdminOrders(orders) {
    const tableBody = document.getElementById('admin-orders-table');
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    orders.forEach(order => {
        const row = createOrderTableRow(order);
        tableBody.appendChild(row);
    });
}

// Create order table row
function createOrderTableRow(order) {
    const row = document.createElement('tr');
    
    row.innerHTML = `
        <td>
            <small class="text-muted">#${order._id.slice(-8)}</small>
        </td>
        <td>
            <div>
                <div class="fw-bold">${order.user ? order.user.username : 'Unknown User'}</div>
                <small class="text-muted">${order.user ? order.user.email : 'No email'}</small>
            </div>
        </td>
        <td class="fw-bold">${formatPrice(order.totalAmount)}</td>
        <td>
            <span class="badge ${getStatusBadgeClass(order.status)}">
                ${getStatusText(order.status)}
            </span>
        </td>
        <td>
            <small>${formatDate(order.createdAt)}</small>
        </td>
        <td>
            <button class="btn btn-sm btn-outline-primary me-1" onclick="viewOrderDetails('${order._id}')">
                <i class="fas fa-eye"></i>
            </button>
            <button class="btn btn-sm btn-outline-success" onclick="updateOrderStatus('${order._id}')">
                <i class="fas fa-edit"></i>
            </button>
        </td>
    `;
    
    return row;
}

// Show add product modal
function showAddProductModal() {
    currentEditingProduct = null;
    
    const modalTitle = document.getElementById('productModalTitle');
    const saveBtn = document.getElementById('save-product-btn');
    const form = document.getElementById('productForm');
    
    if (modalTitle) modalTitle.textContent = 'Add Product';
    if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-save me-1"></i>Save Product';
    if (form) form.reset();
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

// Edit product
function editProduct(productId) {
    const product = currentProducts.find(p => p._id === productId);
    if (!product) return;
    
    currentEditingProduct = product;
    
    const modalTitle = document.getElementById('productModalTitle');
    const saveBtn = document.getElementById('save-product-btn');
    
    if (modalTitle) modalTitle.textContent = 'Edit Product';
    if (saveBtn) saveBtn.innerHTML = '<i class="fas fa-save me-1"></i>Update Product';
    
    // Populate form
    document.getElementById('product-id').value = product._id;
    document.getElementById('product-name').value = product.name;
    document.getElementById('product-description').value = product.description;
    document.getElementById('product-price').value = product.price;
    document.getElementById('product-category').value = product.category;
    document.getElementById('product-image').value = product.image;
    document.getElementById('product-stock').value = product.stock;
    document.getElementById('product-featured').checked = product.featured;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('productModal'));
    modal.show();
}

// Save product
async function saveProduct() {
    const form = document.getElementById('productForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const productData = {
        name: formData.get('name'),
        description: formData.get('description'),
        price: parseFloat(formData.get('price')),
        category: formData.get('category'),
        image: formData.get('image') || 'https://via.placeholder.com/300x200?text=No+Image',
        stock: parseInt(formData.get('stock')),
        featured: formData.get('featured') === 'on'
    };
    
    // Validate required fields
    if (!productData.name || !productData.description || !productData.price || !productData.category || productData.stock === null) {
        showAlert('Please fill in all required fields', 'danger');
        return;
    }
    
    // Validate price and stock
    if (productData.price <= 0) {
        showAlert('Price must be greater than 0', 'danger');
        return;
    }
    
    if (productData.stock < 0) {
        showAlert('Stock cannot be negative', 'danger');
        return;
    }
    
    const saveBtn = document.getElementById('save-product-btn');
    const originalText = saveBtn.innerHTML;
    
    try {
        // Show loading state
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i>Saving...';
        saveBtn.disabled = true;
        
        let result;
        if (currentEditingProduct) {
            // Update existing product
            result = await productsAPI.update(currentEditingProduct._id, productData);
        } else {
            // Create new product
            result = await productsAPI.create(productData);
        }
        
        if (result.success) {
            showAlert(currentEditingProduct ? 'Product updated successfully!' : 'Product created successfully!', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
            if (modal) {
                modal.hide();
            }
            
            // Reload products
            loadAdminProducts();
        } else {
            showAlert(result.message || 'Failed to save product', 'danger');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        showAlert('Error saving product', 'danger');
    } finally {
        // Restore button state
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
    }
}

// Delete product
async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    try {
        const result = await productsAPI.delete(productId);
        
        if (result.success) {
            showAlert('Product deleted successfully!', 'success');
            loadAdminProducts();
        } else {
            showAlert(result.message || 'Failed to delete product', 'danger');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
        showAlert('Error deleting product', 'danger');
    }
}

// Update order status
async function updateOrderStatus(orderId) {
    const order = currentOrders.find(o => o._id === orderId);
    if (!order) return;
    
    // Populate form
    document.getElementById('order-id').value = order._id;
    document.getElementById('order-status').value = order.status;
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('orderStatusModal'));
    modal.show();
}

// Save order status update
async function updateOrderStatus() {
    const form = document.getElementById('orderStatusForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const orderId = formData.get('orderId');
    const status = formData.get('status');
    
    try {
        const result = await ordersAPI.updateStatus(orderId, status);
        
        if (result.success) {
            showAlert('Order status updated successfully!', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('orderStatusModal'));
            if (modal) {
                modal.hide();
            }
            
            // Reload orders
            loadAdminOrders();
        } else {
            showAlert(result.message || 'Failed to update order status', 'danger');
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        showAlert('Error updating order status', 'danger');
    }
}

// View order details (reuse from orders.js)
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

// Show order modal (reuse from orders.js)
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
                        <td><strong>Customer:</strong></td>
                        <td>${order.user ? order.user.username : 'Unknown User'} (${order.user ? order.user.email : 'No email'})</td>
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

// Filter admin products
function filterAdminProducts() {
    const search = document.getElementById('product-search').value.toLowerCase();
    const category = document.getElementById('product-category-filter').value;
    
    let filteredProducts = currentProducts;
    
    if (search) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(search) ||
            product.description.toLowerCase().includes(search)
        );
    }
    
    if (category) {
        filteredProducts = filteredProducts.filter(product => 
            product.category === category
        );
    }
    
    displayAdminProducts(filteredProducts);
}

// Filter admin orders
function filterAdminOrders() {
    const status = document.getElementById('order-status-filter').value;
    
    let filteredOrders = currentOrders;
    
    if (status) {
        filteredOrders = filteredOrders.filter(order => order.status === status);
    }
    
    displayAdminOrders(filteredOrders);
}

// Show/hide loading states
function showProductsLoading(show) {
    const loading = document.getElementById('products-loading');
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

function showOrdersLoading(show) {
    const loading = document.getElementById('orders-loading');
    if (loading) {
        loading.style.display = show ? 'block' : 'none';
    }
}

function showNoAdminProducts(show) {
    const noProducts = document.getElementById('no-admin-products');
    if (noProducts) {
        noProducts.style.display = show ? 'block' : 'none';
    }
}

function showNoAdminOrders(show) {
    const noOrders = document.getElementById('no-admin-orders');
    if (noOrders) {
        noOrders.style.display = show ? 'block' : 'none';
    }
}

// Make functions globally available
window.showAddProductModal = showAddProductModal;
window.editProduct = editProduct;
window.saveProduct = saveProduct;
window.deleteProduct = deleteProduct;
window.updateOrderStatus = updateOrderStatus;
window.viewOrderDetails = viewOrderDetails;
window.filterAdminProducts = filterAdminProducts;
window.filterAdminOrders = filterAdminOrders;
