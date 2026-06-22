<?php
header('Content-Type: application/json');
require_once dirname(__DIR__) . '/config/config.php';

$authenticated = isset($_SESSION['user_logged_in']) && $_SESSION['user_logged_in'] === true;
$csrf_token = generate_csrf_token();

echo json_encode([
    'success' => true,
    'authenticated' => $authenticated,
    'username' => $_SESSION['username'] ?? null,
    'csrf_token' => $csrf_token
]);
