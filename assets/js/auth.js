/**
 * Authentication Module
 */
(function() {
    const Auth = {
        /**
         * Initialize Auth session check on page load
         */
        async checkSession() {
            const pathname = window.location.pathname;
            let base = '/';
            if (pathname.includes('/Grocery_App/')) {
                base = '/Grocery_App/';
            }
            
            const isAuthPage = pathname.includes('/login.html') || pathname.includes('/signup.html');
            const isAdminFolder = pathname.includes('/admin');
            const isCustomerFolder = pathname.includes('/customer');
            
            try {
                // Fetch current status using the interceptable API helper if available
                const data = window.API ? 
                    await window.API.get('auth_status.php') : 
                    await fetch('/backend/api/auth_status.php').then(r => r.json());
                
                if (data.success) {
                    window.csrfToken = data.csrf_token;
                    
                    if (isAuthPage) {
                        if (data.authenticated) {
                            // Redirect to home/dashboard if already logged in
                            const role = data.role || data.session?.role || (data.username === 'admin' ? 'admin' : 'customer');
                            if (role === 'admin') {
                                window.location.href = base + 'admin/index.html';
                            } else {
                                window.location.href = base + 'customer/index.html';
                            }
                        }
                    } else {
                        if (!data.authenticated) {
                            // Redirect to correct login page if unauthenticated
                            if (isAdminFolder) {
                                window.location.href = base + 'admin/login.html';
                            } else {
                                window.location.href = base + 'customer/login.html';
                            }
                        } else {
                            // Enforce role-based access control
                            const role = data.role || data.session?.role || (data.username === 'admin' ? 'admin' : 'customer');
                            if (role === 'admin' && !isAdminFolder) {
                                window.location.href = base + 'admin/index.html';
                            } else if (role === 'customer' && isAdminFolder) {
                                window.location.href = base + 'customer/index.html';
                            } else {
                                // Set header dropdown name and trigger load
                                const userDropdownName = document.getElementById('userDropdownName');
                                if (userDropdownName) {
                                    userDropdownName.textContent = data.username || 'User';
                                }
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Session check failed:', error);
                if (!isAuthPage) {
                    if (isAdminFolder) {
                        window.location.href = base + 'admin/login.html';
                    } else {
                        window.location.href = base + 'customer/login.html';
                    }
                }
            }
        },

        /**
         * Perform login
         */
        async login(email, password, rememberMe = false, isAdmin = false) {
            const formData = new FormData();
            formData.append('email', email);
            formData.append('password', password);
            formData.append('csrf_token', window.csrfToken);
            if (rememberMe) {
                formData.append('remember_me', 'on');
            }

            try {
                const data = window.API ? 
                    await window.API.post('login_handler.php', formData) :
                    await fetch('/backend/api/login_handler.php', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-CSRF-TOKEN': window.csrfToken
                        }
                    }).then(r => r.json());
                
                if (data.success) {
                    const pathname = window.location.pathname;
                    let base = '/';
                    if (pathname.includes('/Grocery_App/')) {
                        base = '/Grocery_App/';
                    }
                    
                    const role = data.role || (email === 'admin' || email === 'admin@example.com' ? 'admin' : 'customer');
                    if (role === 'admin') {
                        window.location.href = base + 'admin/index.html';
                    } else {
                        window.location.href = base + 'customer/index.html';
                    }
                } else {
                    if (window.API) {
                        window.API.showToast(data.message || 'Login failed', 'danger');
                    }
                    throw new Error(data.message);
                }
            } catch (error) {
                console.error('Login action failed:', error);
                throw error;
            }
        },

        /**
         * Perform signup
         */
        async signup(userData) {
            const formData = new FormData();
            formData.append('name', userData.name);
            formData.append('email', userData.email);
            formData.append('password', userData.password);
            formData.append('csrf_token', window.csrfToken);

            try {
                const data = window.API ? 
                    await window.API.post('signup_handler.php', formData) :
                    await fetch('/backend/api/signup_handler.php', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'X-CSRF-TOKEN': window.csrfToken
                        }
                    }).then(r => r.json());
                
                if (data.success) {
                    const pathname = window.location.pathname;
                    let base = '/';
                    if (pathname.includes('/Grocery_App/')) {
                        base = '/Grocery_App/';
                    }
                    window.location.href = base + 'customer/index.html';
                } else {
                    if (window.API) {
                        window.API.showToast(data.message || 'Signup failed', 'danger');
                    }
                    throw new Error(data.message);
                }
            } catch (error) {
                console.error('Signup action failed:', error);
                throw error;
            }
        },

        /**
         * Perform logout
         */
        async logout(isAdmin = false) {
            try {
                const data = window.API ?
                    await window.API.get('logout_handler.php') :
                    await fetch('/backend/api/logout_handler.php').then(r => r.json());
                
                const pathname = window.location.pathname;
                let base = '/';
                if (pathname.includes('/Grocery_App/')) {
                    base = '/Grocery_App/';
                }
                
                if (data.success) {
                    if (pathname.includes('/admin')) {
                        window.location.href = base + 'admin/login.html';
                    } else {
                        window.location.href = base + 'customer/login.html';
                    }
                }
            } catch (error) {
                console.error('Logout failed:', error);
                const pathname = window.location.pathname;
                let base = '/';
                if (pathname.includes('/Grocery_App/')) {
                    base = '/Grocery_App/';
                }
                if (window.API) {
                    window.API.showToast('Logout failed. Directing to login.', 'warning');
                }
                if (pathname.includes('/admin')) {
                    window.location.href = base + 'admin/login.html';
                } else {
                    window.location.href = base + 'customer/login.html';
                }
            }
        }
    };

    // Export globally
    window.Auth = Auth;

    // Check session on script execution
    document.addEventListener('DOMContentLoaded', () => {
        Auth.checkSession();
    });
})();
