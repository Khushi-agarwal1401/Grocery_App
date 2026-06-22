<?php
header('Content-Type: application/json');
require_once dirname(__DIR__) . '/config/config.php';

$authenticated = isset($_SESSION['user_logged_in']) && $_SESSION['user_logged_in'] === true;
$csrf_token = generate_csrf_token();

$role = null;
if ($authenticated && isset($_SESSION['username'])) {
    $role = ($_SESSION['username'] === ADMIN_USER) ? 'admin' : 'customer';
}

echo json_encode([
    'success' => true,
    'authenticated' => $authenticated,
    'username' => $_SESSION['username'] ?? null,
    'role' => $role,
    'csrf_token' => $csrf_token
]);
