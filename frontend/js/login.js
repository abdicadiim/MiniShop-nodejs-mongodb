// Login page functionality
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginCard = document.querySelector('.card');
    const registerCard = document.getElementById('register-card');
    
    console.log('Forms found:', { loginForm: !!loginForm, registerForm: !!registerForm });
    
    // Login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!email || !password) {
                showAlert('Please fill in all fields', 'danger');
                return;
            }
            
            const loginBtn = document.getElementById('login-btn');
            const originalText = loginBtn.innerHTML;
            
            try {
                // Show loading state
                loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Signing In...';
                loginBtn.disabled = true;
                
                const result = await authAPI.login(email, password);
                
                if (result.success) {
                    // Store auth data
                    setAuthData(result.data.user, result.data.token);
                    
                    showAlert('Login successful!', 'success');
                    
                    // Redirect to home page
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    showAlert(result.message || 'Login failed', 'danger');
                }
            } catch (error) {
                console.error('Login error:', error);
                showAlert('Login failed. Please try again.', 'danger');
            } finally {
                // Restore button state
                loginBtn.innerHTML = originalText;
                loginBtn.disabled = false;
            }
        });
    }
    
    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            console.log('Register form submitted');
            
            // Check if authAPI is available
            if (typeof authAPI === 'undefined') {
                console.error('authAPI is not defined');
                showAlert('Registration system not available. Please refresh the page.', 'danger');
                return;
            }
            
            const username = document.getElementById('reg-username').value;
            const email = document.getElementById('reg-email').value;
            const password = document.getElementById('reg-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (!username || !email || !password || !confirmPassword) {
                showAlert('Please fill in all fields', 'danger');
                return;
            }
            
            if (password !== confirmPassword) {
                showAlert('Passwords do not match', 'danger');
                return;
            }
            
            if (password.length < 6) {
                showAlert('Password must be at least 6 characters long', 'danger');
                return;
            }
            
            const registerBtn = document.getElementById('register-btn');
            const originalText = registerBtn.innerHTML;
            
            try {
                // Show loading state
                registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Creating Account...';
                registerBtn.disabled = true;
                
                const result = await authAPI.register(username, email, password);
                
                if (result.success) {
                    // Store auth data
                    setAuthData(result.data.user, result.data.token);
                    
                    showAlert('Account created successfully!', 'success');
                    
                    // Redirect to home page
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 1000);
                } else {
                    showAlert(result.message || 'Registration failed', 'danger');
                }
            } catch (error) {
                console.error('Registration error:', error);
                console.error('Error details:', error.message);
                showAlert('Registration failed: ' + error.message, 'danger');
            } finally {
                // Restore button state
                registerBtn.innerHTML = originalText;
                registerBtn.disabled = false;
            }
        });
    }
});

// Show register form
function showRegisterForm() {
    const loginCard = document.querySelector('.card');
    const registerCard = document.getElementById('register-card');
    
    if (loginCard && registerCard) {
        loginCard.style.display = 'none';
        registerCard.style.display = 'block';
    }
}

// Show login form
function showLoginForm() {
    const loginCard = document.querySelector('.card');
    const registerCard = document.getElementById('register-card');
    
    if (loginCard && registerCard) {
        loginCard.style.display = 'block';
        registerCard.style.display = 'none';
    }
}

// Toggle password visibility
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleIcon = document.getElementById('password-toggle-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Toggle register password visibility
function toggleRegisterPassword() {
    const passwordInput = document.getElementById('reg-password');
    const toggleIcon = document.getElementById('reg-password-toggle-icon');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleIcon.classList.remove('fa-eye');
        toggleIcon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleIcon.classList.remove('fa-eye-slash');
        toggleIcon.classList.add('fa-eye');
    }
}

// Make functions globally available
window.showRegisterForm = showRegisterForm;
window.showLoginForm = showLoginForm;
window.togglePassword = togglePassword;
window.toggleRegisterPassword = toggleRegisterPassword;
