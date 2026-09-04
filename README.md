# Grocery Management System (FreshCart)

A full-stack grocery e-commerce and management platform with two portals:

- **Customer storefront — FreshCart** (`customer/`): browse products by category or search, add to cart, checkout with GST & delivery charges, and track orders — all in a premium, responsive UI with light/dark themes.
- **Admin panel** (`admin/`): manage categories, suppliers, customers, products, orders, payments, and delivery agents from a dashboard with analytics charts, reports, and exports.

The app runs in **two modes**:

1. **Static demo mode** — no server or database required. All data is served from a seeded localStorage "mock database", so the app works when opened directly or deployed to GitHub Pages (a Pages workflow is included).
2. **Full stack mode** — a PHP + MySQL backend (`backend/`) with session auth, CSRF protection, and a normalized 8-table schema.

---

## ✨ Features

### Customer storefront
- Browse products by category or keyword search with real-time filtering
- Slide-in cart drawer with quantity controls, wishlist, and mock discounts
- Checkout flow computing GST (5%) + free or flat delivery fee
- Order history with a live status simulator (Pending → Confirmed → Packed → Shipped → Delivered)
- Customer profile editing, order tracking, and invoice view
- Light / dark theme toggle and mobile-first layout

### Admin panel
- Dashboard with stat cards and Chart.js analytics (orders, revenue, top products, etc.)
- Full CRUD management for categories, suppliers, customers, products, payments, and delivery agents
- Order management: create, assign delivery agent, update status, and print invoices
- Product image upload, stock alerts, and filterable DataTables
- Six report types with CSV / Excel / PDF export

### Backend & database
- PHP API endpoints returning JSON via PDO prepared statements (SQL-injection safe)
- Config-based authentication (`admin` / `user`) with bcrypt hashes
- Per-session CSRF tokens validated on every write operation
- MySQL schema with 8 tables (customers, delivery agents, orders, categories, suppliers, products, order items, payments) and 20 sample rows per table

---

## 🧰 Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | HTML5, CSS3 (glassmorphism UI), Vanilla JS |
| Libraries | Bootstrap 5, Bootstrap Icons, jQuery, DataTables, Chart.js (via CDN) |
| Backend   | PHP 8+ (PDO) |
| Database  | MySQL 5.7 / 8.0 or MariaDB |
| Deploy    | Static hosting (GitHub Pages) or any PHP-enabled web server |

---

## 🚀 Getting Started

The app needs **no build step** — just serve the files.

### Option 1 — Static demo (fastest, no PHP)

The frontend automatically switches to a localStorage-backed mock database when it detects GitHub Pages, a `file://` URL, or any port other than `8000`.

- **Just open `index.html` in a browser**, or
- Serve the folder with any static server (e.g. `python3 -m http.server 8080`), or
- Push to GitHub — `.github/workflows/static.yml` deploys the repo to GitHub Pages on `main`.

### Option 2 — Full stack (PHP + MySQL)

1. Import `database/Grocery_app.sql` into MySQL.
2. Update DB credentials in `backend/config/config.php`.
3. Run the PHP built-in server from the project root:

   ```bash
   php -S localhost:8000
   ```

4. Open the entry page (see below).

> Detailed step-by-step setup, configuration, deployment, and troubleshooting are covered in **[INSTALL.md](INSTALL.md)**.

---

## 🔑 Demo Credentials

| Role     | Username | Password |
|----------|----------|----------|
| Admin    | `admin`  | `admin123` |
| Customer | `user`   | `user123` |

The root `index.html` routes to the admin or customer portal based on the active session:

- Admin portal → `admin/login.html`
- Customer storefront → `customer/login.html`

---

## 📁 Project Structure

```
.
├── index.html               # Entry point — routes to admin or customer based on session
├── INSTALL.md               # Detailed installation & deployment guide
├── README.md
│
├── assets/                  # Shared styles & JS modules (current UI)
│   ├── css/                 # styles.css, admin.css, customer.css
│   └── js/                  # api.js (fetch + localStorage mock), auth.js, cart.js, ...
│
├── admin/                   # Admin panel (login + CRUD modules)
├── customer/                # FreshCart storefront (products, cart, checkout, orders)
│
├── frontend/                # Original PHP-driven admin portal (documented in INSTALL.md)
│
├── backend/
│   ├── config/config.php    # DB credentials, sessions, CSRF, auth hashes
│   ├── includes/db.php      # PDO helpers, transactions, ID generation
│   └── api/                 # login, auth_status, CRUD, orders, dashboard, reports endpoints
│
├── database/
│   └── Grocery_app.sql      # Schema + 20 sample rows per table
│
├── uploads/                 # Product images (auto-created; write permissions required)
└── .github/workflows/       # GitHub Pages deployment
```

---

## 📚 Documentation

- **[INSTALL.md](INSTALL.md)** — prerequisites, database setup, configuration, deployment options (PHP built-in server / XAMPP / MAMP / WAMP), security features, and troubleshooting.

---

## 🔒 Security

- PDO prepared statements throughout (SQL injection prevention)
- `htmlspecialchars()` + client-side escaping (XSS prevention)
- Per-session CSRF tokens validated on all write requests
- HttpOnly session cookies with the secure flag on HTTPS
- Server-side input validation in all handlers

---

## 📄 License

This project is for educational / demonstration purposes.
