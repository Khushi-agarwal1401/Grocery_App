<?php
header('Content-Type: application/json');
require_once dirname(__DIR__) . '/config/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

$username = trim($_POST['username'] ?? '');
$password = trim($_POST['password'] ?? '');
$csrf_token = $_POST['csrf_token'] ?? '';

// Verify CSRF
if (!isset($_SESSION['csrf_token']) || $csrf_token !== $_SESSION['csrf_token']) {
    echo json_encode(['success' => false, 'message' => 'CSRF Token Validation Failed']);
    exit;
}

if ($username === ADMIN_USER && password_verify($password, ADMIN_PASS_HASH)) {
    $_SESSION['user_logged_in'] = true;
    $_SESSION['username'] = ADMIN_USER;
    
    if (isset($_POST['remember_me'])) {
        setcookie('remember_admin', ADMIN_USER, time() + (86400 * 30), "/");
    }
    
    echo json_encode([
        'success' => true,
        'role' => 'admin',
        'username' => ADMIN_USER,
        'message' => 'Welcome back, Admin!'
    ]);
} elseif ($username === REGULAR_USER && password_verify($password, REGULAR_USER_HASH)) {
    $_SESSION['user_logged_in'] = true;
    $_SESSION['username'] = REGULAR_USER;
    
    if (isset($_POST['remember_me'])) {
        setcookie('remember_admin', REGULAR_USER, time() + (86400 * 30), "/");
    }
    
    echo json_encode([
        'success' => true,
        'role' => 'customer',
        'username' => REGULAR_USER,
        'message' => 'Welcome back, User!'
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Incorrect username or password.']);
}
