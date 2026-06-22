/**
 * Core API & UI Helper Module
 */
(function() {
    const API_BASE = '/backend/api/';

    const API = {
        /**
         * Perform GET request
         */
        async get(endpoint, params = {}) {
            let url = API_BASE + endpoint;
            const queryKeys = Object.keys(params);
            if (queryKeys.length > 0) {
                const searchParams = new URLSearchParams();
                queryKeys.forEach(key => searchParams.append(key, params[key]));
                url += (url.includes('?') ? '&' : '?') + searchParams.toString();
            }

            try {
                const response = await fetch(url);
                return await handleResponse(response);
            } catch (error) {
                handleNetworkError(error);
                throw error;
            }
        },

        /**
         * Perform POST request
         */
        async post(endpoint, data = {}, isMultipart = false) {
            const url = API_BASE + endpoint;
            
            // Auto inject CSRF token from window if not already present
            let body = data;
            const headers = {};

            // If window.csrfToken is set, inject it
            if (window.csrfToken) {
                headers['X-CSRF-TOKEN'] = window.csrfToken;
                
                if (data instanceof FormData) {
                    if (!data.has('csrf_token')) {
                        data.append('csrf_token', window.csrfToken);
                    }
                } else if (typeof data === 'object' && data !== null) {
                    if (!data.csrf_token) {
                        data.csrf_token = window.csrfToken;
                    }
                }
            }

            let requestOptions = {
                method: 'POST',
                headers: headers
            };

            if (isMultipart) {
                // Let browser set content-type for multipart files automatically
                requestOptions.body = data;
            } else {
                headers['Content-Type'] = 'application/x-www-form-urlencoded';
                if (data instanceof FormData) {
                    requestOptions.body = new URLSearchParams(data);
                } else if (typeof data === 'object') {
                    const params = new URLSearchParams();
                    Object.keys(data).forEach(key => params.append(key, data[key]));
                    requestOptions.body = params;
                } else {
                    requestOptions.body = data;
                }
            }

            try {
                const response = await fetch(url, requestOptions);
                return await handleResponse(response);
            } catch (error) {
                handleNetworkError(error);
                throw error;
            }
        },

        /**
         * Display premium Toast Notification
         */
        showToast(message, type = 'success') {
            let container = document.querySelector('.toast-container');
            if (!container) {
                container = document.createElement('div');
                container.className = 'toast-container';
                document.body.appendChild(container);
            }

            const toast = document.createElement('div');
            toast.className = `toast-custom ${type}`;
            
            let icon = 'bi-check-circle-fill';
            if (type === 'danger') icon = 'bi-exclamation-triangle-fill';
            if (type === 'warning') icon = 'bi-exclamation-circle-fill';
            if (type === 'info') icon = 'bi-info-circle-fill';

            toast.innerHTML = `
                <i class="bi ${icon} fs-5"></i>
                <div class="toast-content flex-grow-1 fw-500">${message}</div>
                <button type="button" class="btn-close ms-auto" aria-label="Close"></button>
            `;

            container.appendChild(toast);

            // Bind click to dismiss
            toast.querySelector('.btn-close').addEventListener('click', () => {
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 300);
            });

            // Auto dismiss
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.opacity = '0';
                    setTimeout(() => toast.remove(), 300);
                }
            }, 4000);
        }
    };

    /**
     * Parse HTTP Responses
     */
    async function handleResponse(response) {
        if (response.status === 401) {
            // Unauthorized -> Clear session and redirect to login
            const currentPath = window.location.pathname;
            const targetDir = currentPath.includes('/admin/') ? '/admin/login.html' : '/customer/login.html';
            window.location.href = targetDir;
            throw new Error('Unauthorized');
        }

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || `HTTP Error ${response.status}`);
        }

        const json = await response.json();
        return json;
    }

    /**
     * Handle Network Errors
     */
    function handleNetworkError(error) {
        console.error('API Error:', error);
        API.showToast('Network error: Unable to connect to server. Please try again.', 'danger');
    }

    // Export globally
    window.API = API;
})();
