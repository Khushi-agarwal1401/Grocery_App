<?php
/**
 * Application Configuration
 */

// Error reporting
error_reporting(E_ALL);
ini_set('display_errors', 0); // Hide errors in production, log them instead
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/errors.log');

// Start secure session if not already started
if (session_status() === PHP_SESSION_NONE) {
    // Secure session cookies
    ini_set('session.cookie_httponly', 1);
    ini_set('session.use_only_cookies', 1);
    
    // Set secure flag if using HTTPS
    $isSecure = false;
    if (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on') {
        $isSecure = true;
    } elseif (!empty($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https' || !empty($_SERVER['HTTP_X_FORWARDED_SSL']) && $_SERVER['HTTP_X_FORWARDED_SSL'] === 'on') {
        $isSecure = true;
    }
    
    if ($isSecure) {
        ini_set('session.cookie_secure', 1);
    }
    
    session_start();
}

// Database Credentials
define('DB_HOST', '127.0.0.1');
define('DB_PORT', '3306');
define('DB_NAME', 'Grocery_app');
define('DB_USER', 'root');
define('DB_PASS', '1234'); // Adjust if local environment has a password

// Admin Credentials (Option 1: Config-based Authentication)
// Username: admin
// Password: admin123
define('ADMIN_USER', 'admin');
define('ADMIN_PASS_HASH', '$2y$10$QMIUiDn7sH/w794kxJl.vue/vLmqaVXsdwgRj5C.9.hdss7eKxl9y'); // Hash of 'admin123'

// User Credentials (Regular User)
// Username: user
// Password: user123
define('REGULAR_USER', 'user');
define('REGULAR_USER_HASH', '$2y$10$N76Ou8NVOxYKIy3nsSEJoOVOqbZo8GcRYNroxFNa4JnEVu8kctSlG'); // Hash of 'user123'

// Application Paths & URLs
define('BASE_URL', '/'); // Root relative or absolute url path
define('UPLOAD_DIR', dirname(__DIR__, 2) . '/uploads/');

// Create uploads directory if not exists
if (!file_exists(UPLOAD_DIR)) {
    mkdir(UPLOAD_DIR, 0755, true);
}

// Timezone
date_default_timezone_set('Asia/Kolkata');

// Helper to check if user is logged in
function check_auth() {
    if (!isset($_SESSION['user_logged_in']) || $_SESSION['user_logged_in'] !== true) {
        header('Location: ' . BASE_URL . 'frontend/auth/login.html');
        exit;
    }
}

// Helper to render alerts/toast notifications
function set_flash_message($type, $message) {
    $_SESSION['flash_message'] = [
        'type' => $type, // success, danger, warning, info
        'message' => $message
    ];
}

function display_flash_message() {
    if (isset($_SESSION['flash_message'])) {
        $flash = $_SESSION['flash_message'];
        unset($_SESSION['flash_message']);
        return $flash;
    }
    return null;
}

// CSRF Token Generation & Verification
function generate_csrf_token() {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verify_csrf_token($token) {
    if (!isset($_SESSION['csrf_token']) || $token !== $_SESSION['csrf_token']) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'CSRF Token Validation Failed']);
        exit;
    }
    return true;
}

// Input Sanitization Helpers
function sanitize_input($data) {
    if (is_array($data)) {
        return array_map('sanitize_input', $data);
    }
    return htmlspecialchars(trim($data), ENT_QUOTES, 'UTF-8');
}
