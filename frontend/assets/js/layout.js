/**
 * Secure Layout & Session Manager for Static HTML Frontend
 */

window.csrfToken = '';

(function() {
    // Run authentication check on load
    const currentPath = window.location.pathname;
    const isLoginPage = currentPath.includes('/auth/login.html');
    
    // We fetch auth status
    const rootPath = getRootPath();
    
    fetch(rootPath + 'backend/api/auth_status.php')
        .then(res => res.json())
        .then(data => {
            if (isLoginPage) {
                if (data.authenticated) {
                    // Redirect to dashboard if logged in
                    window.location.href = rootPath + 'frontend/dashboard/index.html';
                } else {
                    window.csrfToken = data.csrf_token;
                }
                return;
            }
            
            // For all other pages
            if (!data.authenticated) {
                // Redirect to login page if unauthenticated
                window.location.href = rootPath + 'frontend/auth/login.html';
                return;
            }
            
            // Set global CSRF token
            window.csrfToken = data.csrf_token;
            
            // Dynamically load Sidebar & Navbar if containers are present
            loadCommonLayout(data.username || 'Admin', rootPath);            })
        .catch(err => {
            console.error('Session authentication error:', err);
            if (!isLoginPage) {
                window.location.href = rootPath + 'frontend/auth/login.html';
            }
        });
})();

/**
 * Resolve root directory relative path
 */
function getRootPath() {
    const depth = (window.location.pathname.split('/').length - 2);
    // Pages are under /frontend/*/index.html (depth=2 from root)
    // Or /frontend/auth/login.html (depth=2)
    if (depth <= 0) return './';
    return '../'.repeat(depth);
}

/**
 * Load Sidebar and Top Navbar markup dynamically
 */
function loadCommonLayout(username, rootPath) {
    const sidebarContainer = document.getElementById('sidebar-container');
    const navbarContainer = document.getElementById('navbar-container');
    
    const currentPath = window.location.pathname;
    const isActive = (path) => currentPath.includes(path) ? 'active' : '';

    if (sidebarContainer) {
        sidebarContainer.outerHTML = `
        <aside class="sidebar">
            <a href="${rootPath}frontend/dashboard/index.html" class="sidebar-brand">
                <i class="bi bi-cart4"></i>
                <span>GROCERY APP</span>
            </a>
            
            <ul class="sidebar-menu">
                <li class="sidebar-item ${isActive('dashboard')}">
                    <a href="${rootPath}frontend/dashboard/index.html" class="sidebar-link">
                        <i class="bi bi-speedometer2"></i>
                        <span>Dashboard</span>
                    </a>
                </li>
                <li class="sidebar-item ${isActive('categories')}">
                    <a href="${rootPath}frontend/categories/index.html" class="sidebar-link">
                        <i class="bi bi-tags"></i>
                        <span>Categories</span>
                    </a>
                </li>
                <li class="sidebar-item ${isActive('suppliers')}">
                    <a href="${rootPath}frontend/suppliers/index.html" class="sidebar-link">
                        <i class="bi bi-truck"></i>
                        <span>Suppliers</span>
                    </a>
                </li>
                <li class="sidebar-item ${isActive('customers')}">
                    <a href="${rootPath}frontend/customers/index.html" class="sidebar-link">
                        <i class="bi bi-people"></i>
                        <span>Customers</span>
                    </a>
                </li>
                <li class="sidebar-item ${isActive('products')}">
                    <a href="${rootPath}frontend/products/index.html" class="sidebar-link">
                        <i class="bi bi-box-seam"></i>
                        <span>Products</span>
                    </a>
                </li>
                <li class="sidebar-item ${isActive('orders')}">
                    <a href="${rootPath}frontend/orders/index.html" class="sidebar-link">
                        <i class="bi bi-receipt"></i>
                        <span>Orders</span>
                    </a>
                </li>
                <li class="sidebar-item ${isActive('payments')}">
                    <a href="${rootPath}frontend/payments/index.html" class="sidebar-link">
                        <i class="bi bi-credit-card"></i>
                        <span>Payments</span>
                    </a>
                </li>
                <li class="sidebar-item ${isActive('delivery_agents')}">
                    <a href="${rootPath}frontend/delivery_agents/index.html" class="sidebar-link">
                        <i class="bi bi-bicycle"></i>
                        <span>Delivery Agents</span>
                    </a>
                </li>
                <li class="sidebar-item ${isActive('reports')}">
                    <a href="${rootPath}frontend/reports/index.html" class="sidebar-link">
                        <i class="bi bi-graph-up-arrow"></i>
                        <span>Reports</span>
                    </a>
                </li>
            </ul>
        </aside>
        `;
    }
    
    if (navbarContainer) {
        navbarContainer.outerHTML = `
        <header class="top-navbar glass-effect">
            <div class="d-flex align-items-center">
                <button id="sidebar-toggler" class="btn border-0 sidebar-toggler px-2 text-primary" type="button">
                    <i class="bi bi-list fs-3"></i>
                </button>
                <h4 class="mb-0 fw-700 text-primary">Grocery Admin</h4>
            </div>
            
            <div class="d-flex align-items-center gap-3">
                <!-- Theme Toggle -->
                <button id="theme-toggle" class="navbar-action-btn" title="Toggle Theme" type="button">
                    <i class="bi bi-moon-fill"></i>
                </button>
                
                <!-- Admin Dropdown -->
                <div class="dropdown">
                    <button class="btn border-0 d-flex align-items-center gap-2 p-1" type="button" id="profileDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                        <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-600" style="width: 36px; height: 36px;">
                            ${username.charAt(0).toUpperCase()}
                        </div>
                        <span class="d-none d-md-inline fw-500 text-secondary">${username}</span>
                        <i class="bi bi-chevron-down text-secondary fs-8"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-end shadow border-0" aria-labelledby="profileDropdown">
                        <li><a class="dropdown-item py-2" href="#" onclick="handleLogout(event)"><i class="bi bi-box-arrow-right me-2 text-danger"></i> Sign Out</a></li>
                    </ul>
                </div>
            </div>
        </header>
        `;
    }
    
    // Bind Toggle Theme & Mobile Sidebar actions dynamically
    bindLayoutEvents();
}

function bindLayoutEvents() {
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('color-scheme', newTheme);
            
            const icon = themeToggleBtn.querySelector('i');
            if (icon) {
                icon.className = newTheme === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
            }
        });
    }

    const sidebarToggler = document.getElementById('sidebar-toggler');
    const sidebar = document.querySelector('.sidebar');
    if (sidebarToggler && sidebar) {
        sidebarToggler.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('show');
        });
        
        document.addEventListener('click', (e) => {
            if (sidebar.classList.contains('show') && !sidebar.contains(e.target) && e.target !== sidebarToggler) {
                sidebar.classList.remove('show');
            }
        });
    }
}

function handleLogout(e) {
    e.preventDefault();
    const rootPath = getRootPath();
    showLoader();
    fetch(rootPath + 'backend/api/logout_handler.php')
        .then(res => res.json())
        .then(() => {
            hideLoader();
            window.location.href = rootPath + 'auth/login.html';
        })
        .catch(err => {
            hideLoader();
            console.error('Logout error:', err);
            window.location.href = rootPath + 'auth/login.html';
        });
}
