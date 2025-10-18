// Home page functionality
let currentProducts = [];
let currentPage = 1;
let totalPages = 1;
let currentFilters = {};

document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    if (!isAuthenticated()) {
        showAlert('Please login to view products', 'warning');
        return;
    }
    
    // Load initial products
    loadProducts();
    
    // Setup search functionality
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchProducts();
            }
        });
    }
});

// Load products from API
async function loadProducts() {
    try {
        showLoading(true);
        
        const params = {
            page: currentPage,
            limit: 12,
            ...currentFilters
        };
        
        const result = await productsAPI.getAll(params);
        
        if (result.success) {
            currentProducts = result.data.products;
            totalPages = result.data.pagination.pages;
            
            displayProducts(currentProducts);
            updatePagination();
            
            if (currentProducts.length === 0) {
                showNoProducts(true);
            } else {
                showNoProducts(false);
            }
        } else {
            showAlert('Failed to load products', 'danger');
        }
    } catch (error) {
        console.error('Error loading products:', error);
        showAlert('Error loading products', 'danger');
    } finally {
        showLoading(false);
    }
}

// Display products in grid
function displayProducts(products) {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    productsGrid.innerHTML = '';
    
    products.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Create product card element
function createProductCard(product) {
    const col = document.createElement('div');
    col.className = 'col-md-4 col-lg-3 mb-4';
    
    col.innerHTML = `
        <div class="card h-100 product-card">
            <div class="position-relative">
                <img src="${product.image}" class="card-img-top product-image" alt="${product.name}" 
                     style="height: 200px; object-fit: cover;">
                ${product.featured ? '<span class="badge bg-warning position-absolute top-0 end-0 m-2">Featured</span>' : ''}
                ${product.stock === 0 ? '<div class="position-absolute top-0 start-0 end-0 bottom-0 bg-dark bg-opacity-50 d-flex align-items-center justify-content-center"><span class="text-white fw-bold">Out of Stock</span></div>' : ''}
            </div>
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${product.name}</h5>
                <p class="card-text text-muted small flex-grow-1">${product.description}</p>
                <div class="mt-auto">
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="h5 text-primary mb-0">${formatPrice(product.price)}</span>
                        <span class="badge bg-secondary">${product.category}</span>
                    </div>
                    <div class="d-flex gap-2">
                        <button class="btn btn-outline-primary btn-sm flex-grow-1" 
                                onclick="viewProduct('${product._id}')">
                            <i class="fas fa-eye me-1"></i>View
                        </button>
                        <button class="btn btn-primary btn-sm flex-grow-1" 
                                onclick="addToCart('${product._id}')"
                                ${product.stock === 0 ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus me-1"></i>Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    return col;
}

// Add product to cart
async function addToCart(productId) {
    try {
        const result = await cartAPI.addItem(productId, 1);
        
        if (result.success) {
            showAlert('Product added to cart!', 'success');
            updateCartCount();
        } else {
            showAlert(result.message || 'Failed to add product to cart', 'danger');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showAlert('Error adding product to cart', 'danger');
    }
}

// View product details
async function viewProduct(productId) {
    try {
        const result = await productsAPI.getById(productId);
        
        if (result.success) {
            showProductModal(result.data.product);
        } else {
            showAlert('Failed to load product details', 'danger');
        }
    } catch (error) {
        console.error('Error loading product:', error);
        showAlert('Error loading product details', 'danger');
    }
}

// Show product modal
function showProductModal(product) {
    const modalTitle = document.getElementById('productModalTitle');
    const modalBody = document.getElementById('productModalBody');
    
    if (modalTitle && modalBody) {
        modalTitle.textContent = product.name;
        
        modalBody.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <img src="${product.image}" class="img-fluid rounded" alt="${product.name}">
                </div>
                <div class="col-md-6">
                    <h4>${product.name}</h4>
                    <p class="text-muted">${product.description}</p>
                    <div class="mb-3">
                        <span class="h3 text-primary">${formatPrice(product.price)}</span>
                    </div>
                    <div class="mb-3">
                        <span class="badge bg-secondary me-2">${product.category}</span>
                        <span class="badge ${product.featured ? 'bg-warning' : 'bg-info'}">${product.featured ? 'Featured' : 'Regular'}</span>
                    </div>
                    <div class="mb-3">
                        <strong>Stock:</strong> ${product.stock} available
                    </div>
                    ${product.stock === 0 ? 
                        '<div class="alert alert-warning">This product is currently out of stock.</div>' : 
                        '<button class="btn btn-primary" onclick="addToCartFromModal()">Add to Cart</button>'
                    }
                </div>
            </div>
        `;
        
        // Store current product for modal actions
        window.currentModalProduct = product;
        
        // Show modal
        const modal = new bootstrap.Modal(document.getElementById('productModal'));
        modal.show();
    }
}

// Add to cart from modal
function addToCartFromModal() {
    if (window.currentModalProduct) {
        addToCart(window.currentModalProduct._id);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('productModal'));
        if (modal) {
            modal.hide();
        }
    }
}

// Search products
function searchProducts() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        currentFilters.search = searchInput.value.trim();
        currentPage = 1;
        loadProducts();
    }
}

// Filter products by category
function filterProducts(category = null) {
    if (category) {
        currentFilters.category = category;
        document.getElementById('category-filter').value = category;
    } else {
        const categoryFilter = document.getElementById('category-filter');
        currentFilters.category = categoryFilter.value;
    }
    
    currentPage = 1;
    loadProducts();
}

// Sort products
function sortProducts() {
    const sortFilter = document.getElementById('sort-filter');
    const sortValue = sortFilter.value;
    
    switch (sortValue) {
        case 'price-low':
            currentFilters.sort = 'price';
            currentFilters.order = 'asc';
            break;
        case 'price-high':
            currentFilters.sort = 'price';
            currentFilters.order = 'desc';
            break;
        case 'name':
            currentFilters.sort = 'name';
            currentFilters.order = 'asc';
            break;
        default:
            delete currentFilters.sort;
            delete currentFilters.order;
    }
    
    currentPage = 1;
    loadProducts();
}

// Update pagination
function updatePagination() {
    const pagination = document.getElementById('pagination');
    if (!pagination || totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    paginationHTML += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
        </li>
    `;
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            paginationHTML += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                </li>
            `;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }
    
    // Next button
    paginationHTML += `
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
        </li>
    `;
    
    pagination.innerHTML = paginationHTML;
}

// Change page
function changePage(page) {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
        currentPage = page;
        loadProducts();
    }
}

// Scroll to products section
function scrollToProducts() {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
    }
}

// Show/hide loading spinner
function showLoading(show) {
    const loadingSpinner = document.getElementById('loading-spinner');
    if (loadingSpinner) {
        loadingSpinner.style.display = show ? 'block' : 'none';
    }
}

// Show/hide no products message
function showNoProducts(show) {
    const noProducts = document.getElementById('no-products');
    if (noProducts) {
        noProducts.style.display = show ? 'block' : 'none';
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
window.addToCart = addToCart;
window.viewProduct = viewProduct;
window.addToCartFromModal = addToCartFromModal;
window.searchProducts = searchProducts;
window.filterProducts = filterProducts;
window.sortProducts = sortProducts;
window.changePage = changePage;
window.scrollToProducts = scrollToProducts;
