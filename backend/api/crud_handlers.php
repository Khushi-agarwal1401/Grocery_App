<?php
header('Content-Type: application/json');
require_once dirname(__DIR__) . '/config/config.php';
require_once dirname(__DIR__) . '/includes/db.php';

// Verify authentication
if (!isset($_SESSION['user_logged_in']) || $_SESSION['user_logged_in'] !== true) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

$module = $_GET['module'] ?? '';
$action = $_GET['action'] ?? '';

// Check CSRF on writing actions
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Read input from POST or JSON body
    $input = $_POST;
    if (empty($input)) {
        $raw = file_get_contents('php://input');
        $input = json_decode($raw, true) ?? [];
    }
    
    $token = $input['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    try {
        verify_csrf_token($token);
    } catch (Exception $e) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'CSRF Token Validation Failed']);
        exit;
    }
}

try {
    switch ($module) {
        // ==========================================
        // CATEGORIES MODULE
        // ==========================================
        case 'categories':
            if ($action === 'list') {
                $data = db_fetch_all("SELECT * FROM CATEGORY ORDER BY Category_ID ASC");
                echo json_encode(['success' => true, 'data' => $data]);
            } 
            elseif ($action === 'get') {
                $id = (int)($_GET['id'] ?? 0);
                $row = db_fetch("SELECT * FROM CATEGORY WHERE Category_ID = ?", [$id]);
                echo json_encode(['success' => (bool)$row, 'data' => $row]);
            } 
            elseif ($action === 'save') {
                $id = (int)($_POST['Category_ID'] ?? 0);
                $name = trim($_POST['Category_Name'] ?? '');
                $description = trim($_POST['Description'] ?? '');
                
                if (empty($name)) {
                    throw new Exception("Category Name is required.");
                }
                
                if ($id > 0) {
                    db_query("UPDATE CATEGORY SET Category_Name = ?, Description = ? WHERE Category_ID = ?", [$name, $description, $id]);
                    echo json_encode(['success' => true, 'message' => 'Category updated successfully']);
                } else {
                    db_begin_transaction();
                    $new_id = db_get_next_id('CATEGORY', 'Category_ID');
                    db_query("INSERT INTO CATEGORY (Category_ID, Category_Name, Description) VALUES (?, ?, ?)", [$new_id, $name, $description]);
                    db_commit();
                    echo json_encode(['success' => true, 'message' => 'Category created successfully', 'id' => $new_id]);
                }
            } 
            elseif ($action === 'delete') {
                $id = (int)($_POST['id'] ?? 0);
                $product_count = db_count("SELECT COUNT(*) FROM PRODUCT WHERE Category_ID = ?", [$id]);
                if ($product_count > 0) {
                    throw new Exception("Cannot delete category. {$product_count} products are linked to it.");
                }
                db_query("DELETE FROM CATEGORY WHERE Category_ID = ?", [$id]);
                echo json_encode(['success' => true, 'message' => 'Category deleted successfully']);
            }
            break;

        // ==========================================
        // CUSTOMERS MODULE
        // ==========================================
        case 'customers':
            if ($action === 'list') {
                $data = db_fetch_all("SELECT * FROM CUSTOMER ORDER BY Customer_ID ASC");
                echo json_encode(['success' => true, 'data' => $data]);
            } 
            elseif ($action === 'get') {
                $id = (int)($_GET['id'] ?? 0);
                $row = db_fetch("SELECT * FROM CUSTOMER WHERE Customer_ID = ?", [$id]);
                if ($row) {
                    // Fetch statistics
                    $stats = db_fetch("
                        SELECT COUNT(*) as OrderCount, COALESCE(SUM(Total_Amount), 0) as TotalSpent 
                        FROM ORDERS 
                        WHERE Customer_ID = ? AND Status != 'Cancelled'
                    ", [$id]);
                    $row['stats'] = $stats;
                    
                    // Fetch order history details
                    $row['orders'] = db_fetch_all("
                        SELECT Order_ID, Order_Date, Total_Amount, Status 
                        FROM ORDERS 
                        WHERE Customer_ID = ? 
                        ORDER BY Order_Date DESC, Order_ID DESC
                    ", [$id]);
                }
                echo json_encode(['success' => (bool)$row, 'data' => $row]);
            } 
            elseif ($action === 'save') {
                $id = (int)($_POST['Customer_ID'] ?? 0);
                $name = trim($_POST['Name'] ?? '');
                $email = trim($_POST['Email'] ?? '');
                $phone = trim($_POST['Phone'] ?? '');
                $address = trim($_POST['Address'] ?? '');
                $reg_date = trim($_POST['Registered_Date'] ?? date('Y-m-d'));
                
                if (empty($name) || empty($phone)) {
                    throw new Exception("Name and Phone are required.");
                }
                
                if ($id > 0) {
                    db_query(
                        "UPDATE CUSTOMER SET Name = ?, Email = ?, Phone = ?, Address = ?, Registered_Date = ? WHERE Customer_ID = ?",
                        [$name, $email, $phone, $address, $reg_date, $id]
                    );
                    echo json_encode(['success' => true, 'message' => 'Customer updated successfully']);
                } else {
                    db_begin_transaction();
                    $new_id = db_get_next_id('CUSTOMER', 'Customer_ID');
                    db_query(
                        "INSERT INTO CUSTOMER (Customer_ID, Name, Email, Phone, Address, Registered_Date) VALUES (?, ?, ?, ?, ?, ?)",
                        [$new_id, $name, $email, $phone, $address, $reg_date]
                    );
                    db_commit();
                    echo json_encode(['success' => true, 'message' => 'Customer created successfully', 'id' => $new_id]);
                }
            } 
            elseif ($action === 'delete') {
                $id = (int)($_POST['id'] ?? 0);
                $order_count = db_count("SELECT COUNT(*) FROM ORDERS WHERE Customer_ID = ?", [$id]);
                if ($order_count > 0) {
                    throw new Exception("Cannot delete customer. There are {$order_count} orders associated with this account.");
                }
                db_query("DELETE FROM CUSTOMER WHERE Customer_ID = ?", [$id]);
                echo json_encode(['success' => true, 'message' => 'Customer deleted successfully']);
            }
            break;

        // ==========================================
        // SUPPLIERS MODULE
        // ==========================================
        case 'suppliers':
            if ($action === 'list') {
                $data = db_fetch_all("SELECT * FROM SUPPLIER ORDER BY Supplier_ID ASC");
                echo json_encode(['success' => true, 'data' => $data]);
            } 
            elseif ($action === 'get') {
                $id = (int)($_GET['id'] ?? 0);
                $row = db_fetch("SELECT * FROM SUPPLIER WHERE Supplier_ID = ?", [$id]);
                if ($row) {
                    // Fetch Supplier Performance Statistics
                    $total_products = db_count("SELECT COUNT(*) FROM PRODUCT WHERE Supplier_ID = ?", [$id]);
                    $total_orders = db_count("
                        SELECT COUNT(DISTINCT oi.Order_ID) 
                        FROM ORDER_ITEM oi 
                        JOIN PRODUCT p ON oi.Product_ID = p.Product_ID 
                        WHERE p.Supplier_ID = ?
                    ", [$id]);
                    $revenue_gen = db_count("
                        SELECT COALESCE(SUM(oi.Quantity * oi.Price), 0) 
                        FROM ORDER_ITEM oi 
                        JOIN PRODUCT p ON oi.Product_ID = p.Product_ID 
                        WHERE p.Supplier_ID = ?
                    ", [$id]);
                    
                    $row['stats'] = [
                        'total_products' => $total_products,
                        'total_orders' => $total_orders,
                        'revenue_gen' => $revenue_gen
                    ];
                    
                    // Fetch Linked Products list
                    $row['products'] = db_fetch_all("
                        SELECT Product_ID, Product_Name, Price, Stock 
                        FROM PRODUCT 
                        WHERE Supplier_ID = ?
                        ORDER BY Product_Name ASC
                    ", [$id]);
                }
                echo json_encode(['success' => (bool)$row, 'data' => $row]);
            } 
            elseif ($action === 'save') {
                $id = (int)($_POST['Supplier_ID'] ?? 0);
                $name = trim($_POST['Name'] ?? '');
                $contact = trim($_POST['Contact_No'] ?? '');
                $address = trim($_POST['Address'] ?? '');
                
                if (empty($name) || empty($contact)) {
                    throw new Exception("Supplier Name and Contact No are required.");
                }
                
                if ($id > 0) {
                    db_query(
                        "UPDATE SUPPLIER SET Name = ?, Contact_No = ?, Address = ? WHERE Supplier_ID = ?",
                        [$name, $contact, $address, $id]
                    );
                    echo json_encode(['success' => true, 'message' => 'Supplier updated successfully']);
                } else {
                    db_begin_transaction();
                    $new_id = db_get_next_id('SUPPLIER', 'Supplier_ID');
                    db_query(
                        "INSERT INTO SUPPLIER (Supplier_ID, Name, Contact_No, Address) VALUES (?, ?, ?, ?)",
                        [$new_id, $name, $contact, $address]
                    );
                    db_commit();
                    echo json_encode(['success' => true, 'message' => 'Supplier created successfully', 'id' => $new_id]);
                }
            } 
            elseif ($action === 'delete') {
                $id = (int)($_POST['id'] ?? 0);
                $product_count = db_count("SELECT COUNT(*) FROM PRODUCT WHERE Supplier_ID = ?", [$id]);
                if ($product_count > 0) {
                    throw new Exception("Cannot delete supplier. {$product_count} products are supplied by them.");
                }
                db_query("DELETE FROM SUPPLIER WHERE Supplier_ID = ?", [$id]);
                echo json_encode(['success' => true, 'message' => 'Supplier deleted successfully']);
            }
            break;

        // ==========================================
        // PRODUCTS MODULE
        // ==========================================
        case 'products':
            if ($action === 'list') {
                $data = db_fetch_all("
                    SELECT p.*, c.Category_Name, s.Name as Supplier_Name 
                    FROM PRODUCT p
                    LEFT JOIN CATEGORY c ON p.Category_ID = c.Category_ID
                    LEFT JOIN SUPPLIER s ON p.Supplier_ID = s.Supplier_ID
                    ORDER BY p.Product_ID ASC
                ");
                echo json_encode(['success' => true, 'data' => $data]);
            } 
            elseif ($action === 'get') {
                $id = (int)($_GET['id'] ?? 0);
                $row = db_fetch("SELECT * FROM PRODUCT WHERE Product_ID = ?", [$id]);
                echo json_encode(['success' => (bool)$row, 'data' => $row]);
            } 
            elseif ($action === 'save') {
                $id = (int)($_POST['Product_ID'] ?? 0);
                $name = trim($_POST['Product_Name'] ?? '');
                $price = (float)($_POST['Price'] ?? 0);
                $stock = (int)($_POST['Stock'] ?? 0);
                $cat_id = (int)($_POST['Category_ID'] ?? 0);
                $sup_id = (int)($_POST['Supplier_ID'] ?? 0);
                
                if (empty($name) || $price <= 0 || $cat_id <= 0 || $sup_id <= 0) {
                    throw new Exception("Name, valid Price, Category, and Supplier are required.");
                }

                // Handle Image Upload if file is present
                $image_filename = $_POST['existing_image'] ?? '';
                if (isset($_FILES['Product_Image']) && $_FILES['Product_Image']['error'] === UPLOAD_ERR_OK) {
                    $file_tmp = $_FILES['Product_Image']['tmp_name'];
                    $file_name = $_FILES['Product_Image']['name'];
                    $ext = strtolower(pathinfo($file_name, PATHINFO_EXTENSION));
                    
                    $allowed = ['jpg', 'jpeg', 'png', 'webp'];
                    if (!in_array($ext, $allowed)) {
                        throw new Exception("Invalid image format. Allowed formats: " . implode(', ', $allowed));
                    }
                    
                    // Generate safe unique filename
                    $image_filename = 'product_' . time() . '_' . rand(100, 999) . '.' . $ext;
                    if (!move_uploaded_file($file_tmp, UPLOAD_DIR . $image_filename)) {
                        throw new Exception("Failed to save uploaded image.");
                    }
                }
                
                if ($id > 0) {
                    // Update includes image filename if we have one
                    // Let's store image name or handle in custom way. 
                    // Note: Since DB doesn't have an Image column, we will store image metadata in a JSON file or session,
                    // OR if we can't modify the schema, we'll store product images named exactly as `product_<Product_ID>.jpg` in uploads.
                    // Storing as `product_<Product_ID>.jpg` (or png/webp) in the `/uploads/` folder is perfect 
                    // because it does not require adding an `Image` column to the PRODUCT table!
                    // This is an extremely elegant solution to support product image uploads without violating 
                    // the strict database schema constraint.
                    
                    db_query(
                        "UPDATE PRODUCT SET Product_Name = ?, Price = ?, Stock = ?, Category_ID = ?, Supplier_ID = ? WHERE Product_ID = ?",
                        [$name, $price, $stock, $cat_id, $sup_id, $id]
                    );
                    
                    // If a new image was uploaded, copy/rename it to product_<Product_ID>.<ext>
                    if (isset($_FILES['Product_Image']) && $_FILES['Product_Image']['error'] === UPLOAD_ERR_OK) {
                        // Delete any existing files with this prefix to avoid conflicts
                        foreach (glob(UPLOAD_DIR . "product_{$id}.*") as $old_file) {
                            unlink($old_file);
                        }
                        rename(UPLOAD_DIR . $image_filename, UPLOAD_DIR . "product_{$id}.{$ext}");
                    }
                    
                    echo json_encode(['success' => true, 'message' => 'Product updated successfully']);
                } else {
                    db_begin_transaction();
                    $new_id = db_get_next_id('PRODUCT', 'Product_ID');
                    db_query(
                        "INSERT INTO PRODUCT (Product_ID, Product_Name, Price, Stock, Category_ID, Supplier_ID) VALUES (?, ?, ?, ?, ?, ?)",
                        [$new_id, $name, $price, $stock, $cat_id, $sup_id]
                    );
                    db_commit();
                    
                    // If image was uploaded, rename to product_<new_id>.<ext>
                    if (isset($_FILES['Product_Image']) && $_FILES['Product_Image']['error'] === UPLOAD_ERR_OK) {
                        rename(UPLOAD_DIR . $image_filename, UPLOAD_DIR . "product_{$new_id}.{$ext}");
                    }
                    
                    echo json_encode(['success' => true, 'message' => 'Product created successfully', 'id' => $new_id]);
                }
            } 
            elseif ($action === 'delete') {
                $id = (int)($_POST['id'] ?? 0);
                $order_item_count = db_count("SELECT COUNT(*) FROM ORDER_ITEM WHERE Product_ID = ?", [$id]);
                if ($order_item_count > 0) {
                    throw new Exception("Cannot delete product. It is included in {$order_item_count} orders.");
                }
                db_query("DELETE FROM PRODUCT WHERE Product_ID = ?", [$id]);
                
                // Clean up image file
                foreach (glob(UPLOAD_DIR . "product_{$id}.*") as $img_file) {
                    unlink($img_file);
                }
                
                echo json_encode(['success' => true, 'message' => 'Product deleted successfully']);
            }
            break;

        // ==========================================
        // DELIVERY AGENTS MODULE
        // ==========================================
        case 'delivery_agents':
            if ($action === 'list') {
                $data = db_fetch_all("SELECT * FROM DELIVERY_AGENT ORDER BY Agent_ID ASC");
                echo json_encode(['success' => true, 'data' => $data]);
            } 
            elseif ($action === 'get') {
                $id = (int)($_GET['id'] ?? 0);
                $row = db_fetch("SELECT * FROM DELIVERY_AGENT WHERE Agent_ID = ?", [$id]);
                if ($row) {
                    // Fetch Delivery Agent Stats
                    $total = (int)db_count("SELECT COUNT(*) FROM ORDERS WHERE Agent_ID = ?", [$id]);
                    $completed = (int)db_count("SELECT COUNT(*) FROM ORDERS WHERE Agent_ID = ? AND Status = 'Delivered'", [$id]);
                    $active = (int)db_count("SELECT COUNT(*) FROM ORDERS WHERE Agent_ID = ? AND Status IN ('Pending', 'Shipped')", [$id]);
                    $cancelled = (int)db_count("SELECT COUNT(*) FROM ORDERS WHERE Agent_ID = ? AND Status = 'Cancelled'", [$id]);
                    
                    $success_rate = ($total > 0) ? round(($completed / $total) * 100, 1) : 100.0;
                    
                    $row['stats'] = [
                        'total_deliveries' => $total,
                        'completed_deliveries' => $completed,
                        'active_deliveries' => $active,
                        'cancelled_deliveries' => $cancelled,
                        'success_rate' => $success_rate
                    ];
                    
                    // Fetch Assigned Orders
                    $row['orders'] = db_fetch_all("
                        SELECT o.Order_ID, o.Order_Date, o.Total_Amount, o.Status, c.Name as Customer_Name 
                        FROM ORDERS o
                        JOIN CUSTOMER c ON o.Customer_ID = c.Customer_ID
                        WHERE o.Agent_ID = ?
                        ORDER BY o.Order_Date DESC, o.Order_ID DESC
                    ", [$id]);
                }
                echo json_encode(['success' => (bool)$row, 'data' => $row]);
            } 
            elseif ($action === 'save') {
                $id = (int)($_POST['Agent_ID'] ?? 0);
                $name = trim($_POST['Name'] ?? '');
                $phone = trim($_POST['Phone'] ?? '');
                $vehicle = trim($_POST['Vehicle_No'] ?? '');
                
                if (empty($name) || empty($phone)) {
                    throw new Exception("Agent Name and Phone are required.");
                }
                
                if ($id > 0) {
                    db_query(
                        "UPDATE DELIVERY_AGENT SET Name = ?, Phone = ?, Vehicle_No = ? WHERE Agent_ID = ?",
                        [$name, $phone, $vehicle, $id]
                    );
                    echo json_encode(['success' => true, 'message' => 'Delivery agent updated successfully']);
                } else {
                    db_begin_transaction();
                    $new_id = db_get_next_id('DELIVERY_AGENT', 'Agent_ID');
                    db_query(
                        "INSERT INTO DELIVERY_AGENT (Agent_ID, Name, Phone, Vehicle_No) VALUES (?, ?, ?, ?)",
                        [$new_id, $name, $phone, $vehicle]
                    );
                    db_commit();
                    echo json_encode(['success' => true, 'message' => 'Delivery agent created successfully', 'id' => $new_id]);
                }
            } 
            elseif ($action === 'delete') {
                $id = (int)($_POST['id'] ?? 0);
                $active_deliveries = db_count("SELECT COUNT(*) FROM ORDERS WHERE Agent_ID = ? AND Status IN ('Pending', 'Shipped')", [$id]);
                if ($active_deliveries > 0) {
                    throw new Exception("Cannot delete agent. They are currently assigned to {$active_deliveries} active deliveries.");
                }
                
                // Set Agent_ID to NULL on historic orders to avoid breaking FKs (or if DB FK is restrict, block deletion)
                // Let's check how FK is defined. It is a standard FOREIGN KEY. Typically RESTRICT by default in MySQL.
                // So if they have any orders, we must set Agent_ID to null or fail.
                // Let's set Agent_ID = NULL for completed/cancelled orders, or fail if restricted.
                try {
                    db_query("UPDATE ORDERS SET Agent_ID = NULL WHERE Agent_ID = ?", [$id]);
                    db_query("DELETE FROM DELIVERY_AGENT WHERE Agent_ID = ?", [$id]);
                    echo json_encode(['success' => true, 'message' => 'Delivery agent deleted successfully']);
                } catch (Exception $e) {
                    throw new Exception("Cannot delete delivery agent. They have order associations in history.");
                }
            }
            break;

        // ==========================================
        // PAYMENTS MODULE
        // ==========================================
        case 'payments':
            if ($action === 'list') {
                $data = db_fetch_all("
                    SELECT p.*, o.Order_Date, c.Name as Customer_Name 
                    FROM PAYMENT p
                    JOIN ORDERS o ON p.Order_ID = o.Order_ID
                    JOIN CUSTOMER c ON o.Customer_ID = c.Customer_ID
                    ORDER BY p.Payment_ID DESC
                ");
                echo json_encode(['success' => true, 'data' => $data]);
            } 
            elseif ($action === 'get') {
                $id = (int)($_GET['id'] ?? 0);
                $row = db_fetch("SELECT * FROM PAYMENT WHERE Payment_ID = ?", [$id]);
                echo json_encode(['success' => (bool)$row, 'data' => $row]);
            } 
            elseif ($action === 'save') {
                $payment_id = (int)($_POST['Payment_ID'] ?? 0);
                $status = trim($_POST['Payment_Status'] ?? '');
                $mode = trim($_POST['Payment_Mode'] ?? '');
                
                if (empty($status) || $payment_id <= 0) {
                    throw new Exception("Payment ID and Status are required.");
                }
                
                db_query(
                    "UPDATE PAYMENT SET Payment_Status = ?, Payment_Mode = ? WHERE Payment_ID = ?",
                    [$status, $mode, $payment_id]
                );
                
                // If payment was updated to Success and order is pending, we can keep it as is, 
                // but let's maintain audit logic.
                echo json_encode(['success' => true, 'message' => 'Payment updated successfully']);
            }
            break;

        // ==========================================
        // ORDERS MODULE LIST ONLY (Create/Cancel are in order_actions.php)
        // ==========================================
        case 'orders':
            if ($action === 'list') {
                $data = db_fetch_all("
                    SELECT o.*, c.Name as Customer_Name, a.Name as Agent_Name 
                    FROM ORDERS o
                    JOIN CUSTOMER c ON o.Customer_ID = c.Customer_ID
                    LEFT JOIN DELIVERY_AGENT a ON o.Agent_ID = a.Agent_ID
                    ORDER BY o.Order_ID DESC
                ");
                echo json_encode(['success' => true, 'data' => $data]);
            }
            break;

        default:
            throw new Exception("Invalid module or action specified.");
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
