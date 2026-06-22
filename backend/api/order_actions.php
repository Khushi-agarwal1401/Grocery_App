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

$action = $_GET['action'] ?? '';

// Check CSRF on POST operations
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    try {
        verify_csrf_token($token);
    } catch (Exception $e) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'CSRF Token Validation Failed']);
        exit;
    }
}

try {
    switch ($action) {
        // Fetch all products for dynamic selection dropdowns
        case 'fetch_products':
            $products = db_fetch_all("SELECT Product_ID, Product_Name, Price, Stock FROM PRODUCT WHERE Stock > 0 ORDER BY Product_Name ASC");
            echo json_encode(['success' => true, 'data' => $products]);
            break;
            
        // Get full order details for Invoice / Modals
        case 'get_details':
            $order_id = (int)($_GET['id'] ?? 0);
            if ($order_id <= 0) {
                throw new Exception("Invalid Order ID.");
            }
            
            // 1. Fetch Order details with customer and agent names
            $order = db_fetch("
                SELECT o.*, 
                       c.Name as Customer_Name, c.Email as Customer_Email, c.Phone as Customer_Phone, c.Address as Customer_Address,
                       a.Name as Agent_Name, a.Phone as Agent_Phone
                FROM ORDERS o
                JOIN CUSTOMER c ON o.Customer_ID = c.Customer_ID
                LEFT JOIN DELIVERY_AGENT a ON o.Agent_ID = a.Agent_ID
                WHERE o.Order_ID = ?
            ", [$order_id]);
            
            if (!$order) {
                throw new Exception("Order not found.");
            }
            
            // 2. Fetch Order Items
            $items = db_fetch_all("
                SELECT oi.*, p.Product_Name 
                FROM ORDER_ITEM oi
                JOIN PRODUCT p ON oi.Product_ID = p.Product_ID
                WHERE oi.Order_ID = ?
            ", [$order_id]);
            
            // 3. Fetch Payment details
            $payment = db_fetch("SELECT * FROM PAYMENT WHERE Order_ID = ?", [$order_id]);
            
            echo json_encode([
                'success' => true,
                'order' => $order,
                'items' => $items,
                'payment' => $payment
            ]);
            break;

        // Create Order (Wizard placement)
        case 'create':
            $customer_id = (int)($_POST['Customer_ID'] ?? 0);
            $agent_id = !empty($_POST['Agent_ID']) ? (int)$_POST['Agent_ID'] : null;
            $order_date = trim($_POST['Order_Date'] ?? date('Y-m-d'));
            $status = trim($_POST['Status'] ?? 'Pending');
            $items = $_POST['items'] ?? []; // Array of {product_id, quantity}
            
            // Payment details
            $pay_mode = trim($_POST['Payment_Mode'] ?? 'UPI');
            $pay_status = trim($_POST['Payment_Status'] ?? 'Pending');
            
            if ($customer_id <= 0) {
                throw new Exception("Please select a valid Customer.");
            }
            if (empty($items)) {
                throw new Exception("Please add at least one product to the order.");
            }
            
            db_begin_transaction();
            
            // 1. Generate Order ID
            $order_id = db_get_next_id('ORDERS', 'Order_ID');
            
            // 2. Process Items and calculate total
            $total_amount = 0.00;
            $items_to_insert = [];
            
            foreach ($items as $item) {
                $pid = (int)($item['Product_ID'] ?? 0);
                $qty = (int)($item['Quantity'] ?? 0);
                
                if ($pid <= 0 || $qty <= 0) {
                    throw new Exception("Invalid Product ID or Quantity selected.");
                }
                
                // Fetch product details to verify price & stock
                $product = db_fetch("SELECT Product_Name, Price, Stock FROM PRODUCT WHERE Product_ID = ? FOR UPDATE", [$pid]);
                if (!$product) {
                    throw new Exception("Product ID #{$pid} does not exist.");
                }
                
                if ($product['Stock'] < $qty) {
                    throw new Exception("Insufficient stock for product '{$product['Product_Name']}'. Available: {$product['Stock']}, Requested: {$qty}");
                }
                
                $price = (float)$product['Price'];
                $subtotal = $price * $qty;
                $total_amount += $subtotal;
                
                $items_to_insert[] = [
                    'Product_ID' => $pid,
                    'Quantity' => $qty,
                    'Price' => $price
                ];
            }
            
            // 3. Insert Order metadata
            db_query("
                INSERT INTO ORDERS (Order_ID, Order_Date, Total_Amount, Status, Customer_ID, Agent_ID) 
                VALUES (?, ?, ?, ?, ?, ?)
            ", [$order_id, $order_date, $total_amount, $status, $customer_id, $agent_id]);
            
            // 4. Insert Items and update stock
            foreach ($items_to_insert as $item) {
                // Insert item record
                db_query("
                    INSERT INTO ORDER_ITEM (Order_ID, Product_ID, Quantity, Price) 
                    VALUES (?, ?, ?, ?)
                ", [$order_id, $item['Product_ID'], $item['Quantity'], $item['Price']]);
                
                // Deduct stock
                db_query("
                    UPDATE PRODUCT 
                    SET Stock = Stock - ? 
                    WHERE Product_ID = ?
                ", [$item['Quantity'], $item['Product_ID']]);
            }
            
            // 5. Create Payment record (strict 1:1)
            $payment_id = db_get_next_id('PAYMENT', 'Payment_ID');
            db_query("
                INSERT INTO PAYMENT (Payment_ID, Order_ID, Amount, Payment_Mode, Payment_Status, Payment_Date) 
                VALUES (?, ?, ?, ?, ?, ?)
            ", [$payment_id, $order_id, $total_amount, $pay_mode, $pay_status, $order_date]);
            
            db_commit();
            echo json_encode([
                'success' => true,
                'message' => 'Order placed successfully.',
                'order_id' => $order_id
            ]);
            break;

        // Cancel Order (Restore stock)
        case 'cancel':
            $order_id = (int)($_POST['id'] ?? 0);
            if ($order_id <= 0) {
                throw new Exception("Invalid Order ID.");
            }
            
            db_begin_transaction();
            
            // Check current order status
            $order = db_fetch("SELECT Status FROM ORDERS WHERE Order_ID = ? FOR UPDATE", [$order_id]);
            if (!$order) {
                throw new Exception("Order not found.");
            }
            
            if ($order['Status'] === 'Cancelled') {
                throw new Exception("Order is already cancelled.");
            }
            
            // Restore inventory for all items in order
            $items = db_fetch_all("SELECT Product_ID, Quantity FROM ORDER_ITEM WHERE Order_ID = ?", [$order_id]);
            foreach ($items as $item) {
                db_query("
                    UPDATE PRODUCT 
                    SET Stock = Stock + ? 
                    WHERE Product_ID = ?
                ", [$item['Quantity'], $item['Product_ID']]);
            }
            
            // Update order status to 'Cancelled'
            db_query("UPDATE ORDERS SET Status = 'Cancelled' WHERE Order_ID = ?", [$order_id]);
            
            // Update payment status to 'Failed' or 'Refunded'
            db_query("UPDATE PAYMENT SET Payment_Status = 'Failed' WHERE Order_ID = ?", [$order_id]);
            
            db_commit();
            echo json_encode(['success' => true, 'message' => 'Order cancelled successfully and stock restored.']);
            break;
            
        // Assign Delivery Agent
        case 'assign_agent':
            $order_id = (int)($_POST['Order_ID'] ?? 0);
            $agent_id = (int)($_POST['Agent_ID'] ?? 0);
            
            if ($order_id <= 0 || $agent_id <= 0) {
                throw new Exception("Invalid Order or Agent selection.");
            }
            
            db_query("UPDATE ORDERS SET Agent_ID = ? WHERE Order_ID = ?", [$agent_id, $order_id]);
            echo json_encode(['success' => true, 'message' => 'Delivery agent assigned successfully.']);
            break;

        // Update Order Status
        case 'update_status':
            $order_id = (int)($_POST['Order_ID'] ?? 0);
            $status = trim($_POST['Status'] ?? '');
            
            if ($order_id <= 0 || empty($status)) {
                throw new Exception("Invalid parameters.");
            }
            
            // If updating status to Cancelled, use the cancel action routine to properly restore stock
            if ($status === 'Cancelled') {
                // Redirect internally to cancel logic
                $_POST['id'] = $order_id;
                // Run cancellation logic directly
                $items = db_fetch_all("SELECT Product_ID, Quantity FROM ORDER_ITEM WHERE Order_ID = ?", [$order_id]);
                
                db_begin_transaction();
                $current_status = db_count("SELECT Status FROM ORDERS WHERE Order_ID = ?", [$order_id]);
                if ($current_status !== 'Cancelled') {
                    foreach ($items as $item) {
                        db_query("UPDATE PRODUCT SET Stock = Stock + ? WHERE Product_ID = ?", [$item['Quantity'], $item['Product_ID']]);
                    }
                    db_query("UPDATE ORDERS SET Status = 'Cancelled' WHERE Order_ID = ?", [$order_id]);
                    db_query("UPDATE PAYMENT SET Payment_Status = 'Failed' WHERE Order_ID = ?", [$order_id]);
                }
                db_commit();
                
                echo json_encode(['success' => true, 'message' => 'Order updated to Cancelled and stock restored.']);
                exit;
            }
            
            db_query("UPDATE ORDERS SET Status = ? WHERE Order_ID = ?", [$status, $order_id]);
            
            // If Delivered, automatically mark Payment as Success (e.g. for CoD orders)
            if ($status === 'Delivered') {
                db_query("UPDATE PAYMENT SET Payment_Status = 'Success' WHERE Order_ID = ?", [$order_id]);
            }
            
            echo json_encode(['success' => true, 'message' => 'Order status updated successfully.']);
            break;

        default:
            throw new Exception("Invalid action specified.");
    }
} catch (Exception $e) {
    if (get_db_connection()->inTransaction()) {
        db_rollback();
    }
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
