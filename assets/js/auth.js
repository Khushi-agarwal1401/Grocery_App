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
            
            try {
                // Fetch current status using the interceptable API helper if available
                const data = window.API ? 
                    await window.API.get('auth_status.php') : 
                    await fetch('/backend/api/auth_status.php').then(r => r.json());
                
                if (data.success) {
                    window.csrfToken = data.csrf_token;
                    
                    if (isLoginPage) {
                        if (data.authenticated) {
                            // Redirect to home/dashboard if already logged in
                            window.location.href = './index.html';
                        }
                    } else {
                        if (!data.authenticated) {
                            // Redirect to login page if unauthenticated
                            window.location.href = './login.html';
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
                    window.location.href = './login.html';
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
                    window.location.href = './index.html';
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
         * Perform logout
         */
        async logout(isAdmin = false) {
            try {
                const data = window.API ?
                    await window.API.get('logout_handler.php') :
                    await fetch('/backend/api/logout_handler.php').then(r => r.json());
                
                if (data.success) {
                    window.location.href = './login.html';
                }
            } catch (error) {
                console.error('Logout failed:', error);
                if (window.API) {
                    window.API.showToast('Logout failed. Directing to login.', 'warning');
                }
                window.location.href = './login.html';
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
