// Cart page functionality
let currentCart = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isAuthenticated()) {
        showAlert('Please login to view your cart', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    // Load cart
    loadCart();
});

// Load cart from API
async function loadCart() {
    try {
        showCartLoading(true);
        
        const result = await cartAPI.get();
        
        if (result.success) {
            currentCart = result.data.cart;
            displayCartItems(currentCart.items);
            updateOrderSummary(currentCart);
            
            if (currentCart.items.length === 0) {
                showEmptyCart(true);
            } else {
                showEmptyCart(false);
            }
        } else {
            showAlert('Failed to load cart', 'danger');
        }
    } catch (error) {
        console.error('Error loading cart:', error);
        showAlert('Error loading cart', 'danger');
    } finally {
        showCartLoading(false);
    }
}

// Display cart items
function displayCartItems(items) {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    
    cartItems.innerHTML = '';
    
    if (items.length === 0) {
        return;
    }
    
    items.forEach(item => {
        const cartItemElement = createCartItemElement(item);
        cartItems.appendChild(cartItemElement);
    });
}

// Create cart item element
function createCartItemElement(item) {
    const product = item.product;
    const row = document.createElement('div');
    row.className = 'row border-bottom py-3 align-items-center';
    
    row.innerHTML = `
        <div class="col-md-2">
            <img src="${product.image}" class="img-fluid rounded" alt="${product.name}" 
                 style="width: 80px; height: 80px; object-fit: cover;">
        </div>
        <div class="col-md-4">
            <h6 class="mb-1">${product.name}</h6>
            <p class="text-muted small mb-0">${product.description.substring(0, 100)}...</p>
            <span class="badge bg-secondary">${product.category}</span>
        </div>
        <div class="col-md-2">
            <span class="fw-bold">${formatPrice(product.price)}</span>
        </div>
        <div class="col-md-2">
            <div class="input-group input-group-sm">
                <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity('${product._id}', ${item.quantity - 1})">-</button>
                <input type="number" class="form-control text-center" value="${item.quantity}" 
                       min="1" max="${product.stock}" onchange="updateQuantity('${product._id}', this.value)">
                <button class="btn btn-outline-secondary" type="button" onclick="updateQuantity('${product._id}', ${item.quantity + 1})">+</button>
            </div>
            <small class="text-muted">Max: ${product.stock}</small>
        </div>
        <div class="col-md-1">
            <span class="fw-bold">${formatPrice(product.price * item.quantity)}</span>
        </div>
        <div class="col-md-1">
            <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart('${product._id}')">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    return row;
}

// Update item quantity
async function updateQuantity(productId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(productId);
        return;
    }
    
    try {
        const result = await cartAPI.updateItem(productId, parseInt(newQuantity));
        
        if (result.success) {
            currentCart = result.data.cart;
            displayCartItems(currentCart.items);
            updateOrderSummary(currentCart);
            updateCartCount();
        } else {
            showAlert(result.message || 'Failed to update quantity', 'danger');
        }
    } catch (error) {
        console.error('Error updating quantity:', error);
        showAlert('Error updating quantity', 'danger');
    }
}

// Remove item from cart
async function removeFromCart(productId) {
    if (!confirm('Are you sure you want to remove this item from your cart?')) {
        return;
    }
    
    try {
        const result = await cartAPI.removeItem(productId);
        
        if (result.success) {
            currentCart = result.data.cart;
            displayCartItems(currentCart.items);
            updateOrderSummary(currentCart);
            updateCartCount();
            showAlert('Item removed from cart', 'success');
        } else {
            showAlert(result.message || 'Failed to remove item', 'danger');
        }
    } catch (error) {
        console.error('Error removing item:', error);
        showAlert('Error removing item', 'danger');
    }
}

// Clear entire cart
async function clearCart() {
    if (!confirm('Are you sure you want to clear your entire cart?')) {
        return;
    }
    
    try {
        const result = await cartAPI.clear();
        
        if (result.success) {
            currentCart = result.data.cart;
            displayCartItems(currentCart.items);
            updateOrderSummary(currentCart);
            updateCartCount();
            showAlert('Cart cleared successfully', 'success');
        } else {
            showAlert(result.message || 'Failed to clear cart', 'danger');
        }
    } catch (error) {
        console.error('Error clearing cart:', error);
        showAlert('Error clearing cart', 'danger');
    }
}

// Update order summary
function updateOrderSummary(cart) {
    const totalItems = document.getElementById('total-items');
    const subtotal = document.getElementById('subtotal');
    const totalAmount = document.getElementById('total-amount');
    const checkoutBtn = document.getElementById('checkout-btn');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    
    if (totalItems) {
        totalItems.textContent = cart.items.length;
    }
    
    const subtotalValue = cart.items.reduce((total, item) => {
        return total + (item.product.price * item.quantity);
    }, 0);
    
    if (subtotal) {
        subtotal.textContent = formatPrice(subtotalValue);
    }
    
    if (totalAmount) {
        totalAmount.textContent = formatPrice(subtotalValue);
    }
    
    if (checkoutBtn) {
        checkoutBtn.disabled = cart.items.length === 0;
    }
    
    if (clearCartBtn) {
        clearCartBtn.style.display = cart.items.length > 0 ? 'block' : 'none';
    }
}

// Proceed to checkout
function proceedToCheckout() {
    if (!currentCart || currentCart.items.length === 0) {
        showAlert('Your cart is empty', 'warning');
        return;
    }
    
    // Show checkout modal
    showCheckoutModal();
}

// Show checkout modal
function showCheckoutModal() {
    const modalBody = document.getElementById('checkout-summary');
    if (modalBody && currentCart) {
        let summaryHTML = '<div class="table-responsive"><table class="table table-sm">';
        summaryHTML += '<thead><tr><th>Product</th><th>Qty</th><th>Price</th></tr></thead><tbody>';
        
        currentCart.items.forEach(item => {
            summaryHTML += `
                <tr>
                    <td>${item.product.name}</td>
                    <td>${item.quantity}</td>
                    <td>${formatPrice(item.product.price * item.quantity)}</td>
                </tr>
            `;
        });
        
        const total = currentCart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
        
        summaryHTML += '</tbody></table></div>';
        summaryHTML += `<div class="d-flex justify-content-between"><strong>Total:</strong><strong>${formatPrice(total)}</strong></div>`;
        
        modalBody.innerHTML = summaryHTML;
    }
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('checkoutModal'));
    modal.show();
}

// Place order
async function placeOrder() {
    const form = document.getElementById('checkoutForm');
    if (!form) return;
    
    const formData = new FormData(form);
    const shippingAddress = {
        street: formData.get('street'),
        city: formData.get('city'),
        state: formData.get('state'),
        zipCode: formData.get('zipCode'),
        country: formData.get('country')
    };
    
    // Validate shipping address
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || 
        !shippingAddress.zipCode || !shippingAddress.country) {
        showAlert('Please fill in all shipping address fields', 'danger');
        return;
    }
    
    const placeOrderBtn = document.getElementById('place-order-btn');
    const originalText = placeOrderBtn.innerHTML;
    
    try {
        // Show loading state
        placeOrderBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Placing Order...';
        placeOrderBtn.disabled = true;
        
        const result = await ordersAPI.create(shippingAddress);
        
        if (result.success) {
            showAlert('Order placed successfully!', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('checkoutModal'));
            if (modal) {
                modal.hide();
            }
            
            // Redirect to orders page
            setTimeout(() => {
                window.location.href = 'orders.html';
            }, 2000);
        } else {
            showAlert(result.message || 'Failed to place order', 'danger');
        }
    } catch (error) {
        console.error('Error placing order:', error);
        showAlert('Error placing order', 'danger');
    } finally {
        // Restore button state
        placeOrderBtn.innerHTML = originalText;
        placeOrderBtn.disabled = false;
    }
}

// Show/hide cart loading
function showCartLoading(show) {
    const cartLoading = document.getElementById('cart-loading');
    if (cartLoading) {
        cartLoading.style.display = show ? 'block' : 'none';
    }
}

// Show/hide empty cart message
function showEmptyCart(show) {
    const emptyCart = document.getElementById('empty-cart');
    if (emptyCart) {
        emptyCart.style.display = show ? 'block' : 'none';
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

// Make functions globally available
window.updateQuantity = updateQuantity;
window.removeFromCart = removeFromCart;
window.clearCart = clearCart;
window.proceedToCheckout = proceedToCheckout;
window.placeOrder = placeOrder;
