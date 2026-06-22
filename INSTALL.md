# Installation & Setup Guide

This document describes the step-by-step installation, database configuration, and deployment instructions for the **Grocery Management System**.

---

## 1. Prerequisites

Make sure your local environment has the following software installed:
- **PHP 8.0 or higher** (with `pdo_mysql` extension enabled)
- **MySQL 5.7 / 8.0 or MariaDB**
- **Web Server** (e.g. Apache, Nginx, or using PHP's built-in web server)
- Modern web browser (Chrome, Firefox, Safari, Edge)

---

## 2. Directory Structure

```
/Grocery_app
├── INSTALL.md                 # This instructions file
├── uploads/                   # Product images (write permissions required)
│
├── database/
│   └── Grocery_app.sql        # Database schema & 20 sample records per table
│
├── backend/
│   ├── config/
│   │   └── config.php         # DB credentials, session, CSRF, sanitization
│   ├── includes/
│   │   └── db.php             # PDO helper: queries, transactions, ID generation
│   └── api/
│       ├── auth_status.php    # Session check & CSRF token endpoint
│       ├── login_handler.php  # AJAX login handler
│       ├── logout_handler.php # Session destroyer
│       ├── dashboard_data.php # Dashboard analytics JSON
│       ├── crud_handlers.php  # Unified CRUD (all modules)
│       ├── order_actions.php  # Create, cancel, assign, status update
│       └── reports_data.php   # 6 report type data endpoints
│
└── frontend/
    ├── index.html             # Root redirect → dashboard/
    ├── assets/
    │   ├── css/
    │   │   └── styles.css     # Dark mode, glassmorphism, premium UI
    │   └── js/
    │       ├── main.js        # Theme toggle, toast notifications, loader
    │       └── layout.js      # Auth check, dynamic sidebar/navbar injection
    ├── auth/
    │   └── login.html         # Admin login with CSRF protection
    ├── dashboard/
    │   └── index.html         # Stats cards, Chart.js analytics (4 charts)
    ├── categories/
    │   └── index.html         # CRUD with DataTables + export buttons
    ├── suppliers/
    │   └── index.html         # CRUD + performance analytics modal
    ├── customers/
    │   └── index.html         # CRUD + order history modal
    ├── products/
    │   └── index.html         # CRUD + image upload + stock alerts + filters
    ├── orders/
    │   ├── index.html         # List, assign agent, update status
    │   ├── create.html        # Wizard with dynamic item rows + auto totals
    │   └── invoice.html       # Print-optimized invoice
    ├── payments/
    │   └── index.html         # Analytics cards + payment status management
    ├── delivery_agents/
    │   └── index.html         # CRUD + delivery performance stats
    └── reports/
        └── index.html         # 6 report types with CSV/Excel/PDF exports
```

---

## 3. Database Setup Instructions

1. Start your local MySQL database service.
2. Log in to the MySQL terminal or open a tool like phpMyAdmin/DBeaver.
3. Import the SQL file `database/Grocery_app.sql` to initialize the database:
   - **Via terminal:**
     ```bash
     mysql -u root -p < database/Grocery_app.sql
     ```
   - **Via graphical tool:** Select "Import", browse to `database/Grocery_app.sql`, and execute.
4. Verify that the `Grocery_app` database has been created and populated with 20 sample rows in each of the 8 tables.

---

## 4. Application Configuration

Open the `backend/config/config.php` file and adjust your database connection credentials:

```php
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_NAME', 'Grocery_app');
define('DB_USER', 'root');        // Your MySQL username
define('DB_PASS', '');            // Your MySQL password
```

The default `DB_USER` is set to `radheshyambhati` (no password). Change to match your local MySQL credentials.

### Folder Permissions

Make sure the `uploads/` directory has write permissions:

```bash
chmod 755 uploads/
```

---

## 5. Deployment & Execution

### Option A: Using PHP Built-in Server (Recommended for development)

1. Open a terminal and navigate to the project root:
   ```bash
   cd /path/to/Grocery_app
   ```

2. Run the PHP built-in web server:
   ```bash
   php -S localhost:8000
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:8000/frontend/auth/login.html
   ```

### Option B: Local Stack (XAMPP / MAMP / WAMP)

1. Copy the `Grocery_app` folder into your server root directory:
   - XAMPP: `htdocs/`
   - WAMP: `www/`
   - MAMP: `htdocs/`

2. Start Apache and MySQL services from the control panel.

3. Navigate to:
   ```
   http://localhost/Grocery_app/frontend/auth/login.html
   ```

---

## 6. Architecture Overview

### Frontend (`frontend/`)
- All UI pages are **static HTML** files served directly by the web server
- JavaScript dynamically loads sidebar, navbar, and checks auth status
- JQuery, Bootstrap 5, DataTables, and Chart.js loaded from CDN
- All data operations use **AJAX** calls to the backend PHP API endpoints
- Resources grouped under `frontend/assets/css/` and `frontend/assets/js/`

### Backend (`backend/`)
- All API endpoints are in `backend/api/`
- Configuration in `backend/config/`, database helpers in `backend/includes/`
- Responses are JSON for all CRUD and analytics operations
- PDO prepared statements prevent SQL injection
- CSRF tokens protect all write operations
- Configuration-based admin auth (no database user table needed)

### Database (`database/`)
- MySQL schema file in `database/Grocery_app.sql`
- InnoDB engine with foreign key relationships
- No AUTO_INCREMENT — reusable `db_get_next_id()` helper generates IDs
- Transactions used for multi-table operations (order creation, cancellation)

---

## 7. Access Credentials

Log in with the following credentials (defined via bcrypt hash in `backend/config/config.php`):

- **Username:** `admin`
- **Password:** `admin123`

---

## 8. Security Features

| Feature | Implementation |
|---------|---------------|
| Session Authentication | PHP sessions with secure cookie settings |
| SQL Injection Prevention | PDO prepared statements throughout |
| XSS Prevention | `htmlspecialchars()` + custom `escapeHtml()` in JS |
| CSRF Protection | Per-session CSRF tokens validated on all POST requests |
| Input Validation | Server-side validation in all CRUD handlers |
| Output Escaping | Double escaping (PHP backend + JS frontend) |
| Secure Session Handling | HttpOnly cookies, secure flag on HTTPS |

---

## 9. Troubleshooting

### "Database Connection Error"
- Verify MySQL is running: `mysql -u root -p -e "SHOW DATABASES"`
- Check credentials in `backend/config/config.php`
- Ensure the `Grocery_app` database exists and is populated

### "Unauthorized" on API calls
- Clear browser cookies and re-login
- Ensure session files are writable by PHP

### Image uploads not working
- Check `uploads/` directory permissions (should be 755 or 775)
- Verify `upload_max_filesize` and `post_max_size` in `php.ini`

### Blank page or 404
- Ensure you're accessing `.html` files (not `.php`)
- Check the web server document root points to the project folder
- Verify URL includes `/frontend/` path (e.g., `/frontend/dashboard/index.html`)
