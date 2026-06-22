<?php
header('Content-Type: application/json');
require_once dirname(__DIR__) . '/config/config.php';

$_SESSION = array();

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

if (isset($_COOKIE['remember_admin'])) {
    setcookie('remember_admin', '', time() - 3600, "/");
}

session_destroy();

echo json_encode(['success' => true, 'message' => 'Logged out successfully']);
