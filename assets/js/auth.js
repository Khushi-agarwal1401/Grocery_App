/**
 * Authentication Module
 */
(function() {
    const Auth = {
        /**
         * Initialize Auth session check on page load
         */
        async checkSession() {
            const currentPath = window.location.pathname;
            const isLoginPage = currentPath.includes('/login.html');
            const isAdminPath = currentPath.includes('/admin/');
            
            try {
                // Fetch current status
                const res = await fetch('/backend/api/auth_status.php');
                const data = await res.json();
                
                if (data.success) {
                    window.csrfToken = data.csrf_token;
                    
                    if (isLoginPage) {
                        if (data.authenticated) {
                            // Redirect to home/dashboard if already logged in
                            window.location.href = isAdminPath ? '/admin/index.html' : '/customer/index.html';
                        }
                    } else {
                        if (!data.authenticated) {
                            // Redirect to login page if unauthenticated
                            window.location.href = isAdminPath ? '/admin/login.html' : '/customer/login.html';
                        } else {
                            // Set header dropdown name and trigger load
                            const userDropdownName = document.getElementById('userDropdownName');
                            if (userDropdownName) {
                                userDropdownName.textContent = data.username || 'User';
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Session check failed:', error);
                if (!isLoginPage) {
                    window.location.href = isAdminPath ? '/admin/login.html' : '/customer/login.html';
                }
            }
        },

        /**
         * Perform login
         */
        async login(username, password, rememberMe = false, isAdmin = false) {
            const formData = new FormData();
            formData.append('username', username);
            formData.append('password', password);
            formData.append('csrf_token', window.csrfToken);
            if (rememberMe) {
                formData.append('remember_me', 'on');
            }

            try {
                const response = await fetch('/backend/api/login_handler.php', {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'X-CSRF-TOKEN': window.csrfToken
                    }
                });
                
                const data = await response.json();
                if (data.success) {
                    window.location.href = isAdmin ? '/admin/index.html' : '/customer/index.html';
                } else {
                    window.API.showToast(data.message || 'Login failed', 'danger');
                    throw new Error(data.message);
                }
            } catch (error) {
                console.error('Login action failed:', error);
                throw error;
            }
        },

        /**
         * Perform logout
         */
        async logout(isAdmin = false) {
            try {
                const response = await fetch('/backend/api/logout_handler.php');
                const data = await response.json();
                if (data.success) {
                    window.location.href = isAdmin ? '/admin/login.html' : '/customer/login.html';
                }
            } catch (error) {
                console.error('Logout failed:', error);
                window.API.showToast('Logout failed. Directing to login.', 'warning');
                window.location.href = isAdmin ? '/admin/login.html' : '/customer/login.html';
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
