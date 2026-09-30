<?php
header('Content-Type: application/json');
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$password = trim($_POST['password'] ?? '');
$csrf_token = $_POST['csrf_token'] ?? '';

// Verify CSRF
if (!isset($_SESSION['csrf_token']) || $csrf_token !== $_SESSION['csrf_token']) {
    echo json_encode(['success' => false, 'message' => 'CSRF Token Validation Failed']);
    exit;
}

if (empty($name) || empty($email) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Please fill all required fields.']);
    exit;
}

try {
    // Check if email already exists
    $existing = db_fetch("SELECT Customer_ID FROM CUSTOMER WHERE Email = ?", [$email]);
    if ($existing) {
        echo json_encode(['success' => false, 'message' => 'Email is already registered.']);
        exit;
    }

    db_begin_transaction();
    
    // Get next ID
    $next_id = db_get_next_id('CUSTOMER', 'Customer_ID');
    
    // Hash password
    $hashed_password = password_hash($password, PASSWORD_DEFAULT);
    
    // Registered Date
    $registered_date = date('Y-m-d');
    
    // Insert new customer
    db_query(
        "INSERT INTO CUSTOMER (Customer_ID, Name, Email, Password, Registered_Date) VALUES (?, ?, ?, ?, ?)",
        [$next_id, $name, $email, $hashed_password, $registered_date]
    );
    
    db_commit();
    
    // Log the user in
    $_SESSION['user_logged_in'] = true;
    $_SESSION['username'] = $email;
    $_SESSION['role'] = 'customer';
    
    echo json_encode([
        'success' => true,
        'role' => 'customer',
        'username' => $email,
        'message' => 'Account created successfully!'
    ]);
    
} catch (Exception $e) {
    db_rollback();
    error_log("Signup error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'An error occurred during signup.']);
}
