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

$type = $_GET['type'] ?? '';
$start_date = $_GET['start_date'] ?? '';
$end_date = $_GET['end_date'] ?? '';

// Fallback to defaults if date is empty
if (empty($start_date)) {
    $start_date = date('Y-m-01'); // First day of current month
}
if (empty($end_date)) {
    $end_date = date('Y-m-d');
}

try {
    $data = [];
    
    switch ($type) {
        case 'sales':
            $data = db_fetch_all("
                SELECT o.Order_ID, 
                       o.Order_Date, 
                       c.Name as Customer_Name, 
                       o.Total_Amount, 
                       o.Status 
                FROM ORDERS o 
                JOIN CUSTOMER c ON o.Customer_ID = c.Customer_ID 
                WHERE o.Order_Date BETWEEN ? AND ? 
                ORDER BY o.Order_Date DESC, o.Order_ID DESC
            ", [$start_date, $end_date]);
            break;
            
        case 'revenue':
            $data = db_fetch_all("
                SELECT p.Payment_ID, 
                       p.Order_ID, 
                       p.Amount, 
                       p.Payment_Mode, 
                       p.Payment_Status, 
                       p.Payment_Date 
                FROM PAYMENT p 
                WHERE p.Payment_Date BETWEEN ? AND ? 
                ORDER BY p.Payment_Date DESC, p.Payment_ID DESC
            ", [$start_date, $end_date]);
            break;
            
        case 'product':
            // Total units sold and total revenue per product
            $data = db_fetch_all("
                SELECT p.Product_ID, 
                       p.Product_Name, 
                       c.Category_Name, 
                       s.Name as Supplier_Name, 
                       p.Price, 
                       p.Stock, 
                       COALESCE(SUM(oi.Quantity), 0) as Units_Sold,
                       COALESCE(SUM(oi.Quantity * oi.Price), 0) as Total_Revenue
                FROM PRODUCT p 
                LEFT JOIN CATEGORY c ON p.Category_ID = c.Category_ID 
                LEFT JOIN SUPPLIER s ON p.Supplier_ID = s.Supplier_ID 
                LEFT JOIN ORDER_ITEM oi ON p.Product_ID = oi.Product_ID
                LEFT JOIN ORDERS o ON oi.Order_ID = o.Order_ID AND o.Status != 'Cancelled'
                GROUP BY p.Product_ID, p.Product_Name, c.Category_Name, s.Name, p.Price, p.Stock
                ORDER BY Units_Sold DESC
            ");
            break;
            
        case 'customer':
            // High-value customers analysis
            $data = db_fetch_all("
                SELECT c.Customer_ID, 
                       c.Name, 
                       c.Email, 
                       c.Phone, 
                       COUNT(o.Order_ID) as Total_Orders, 
                       COALESCE(SUM(o.Total_Amount), 0) as Total_Spend
                FROM CUSTOMER c 
                LEFT JOIN ORDERS o ON c.Customer_ID = o.Customer_ID AND o.Status != 'Cancelled'
                GROUP BY c.Customer_ID, c.Name, c.Email, c.Phone
                ORDER BY Total_Spend DESC
            ");
            break;
            
        case 'supplier':
            // Supplier supply volume & value
            $data = db_fetch_all("
                SELECT s.Supplier_ID, 
                       s.Name, 
                       s.Contact_No, 
                       COUNT(DISTINCT p.Product_ID) as Total_Products, 
                       COALESCE(SUM(oi.Quantity), 0) as Units_Sold,
                       COALESCE(SUM(oi.Quantity * oi.Price), 0) as Total_Revenue
                FROM SUPPLIER s 
                LEFT JOIN PRODUCT p ON s.Supplier_ID = p.Supplier_ID 
                LEFT JOIN ORDER_ITEM oi ON p.Product_ID = oi.Product_ID
                LEFT JOIN ORDERS o ON oi.Order_ID = o.Order_ID AND o.Status != 'Cancelled'
                GROUP BY s.Supplier_ID, s.Name, s.Contact_No
                ORDER BY Total_Revenue DESC
            ");
            break;
            
        case 'delivery':
            // Agent delivery success rate
            $data = db_fetch_all("
                SELECT a.Agent_ID, 
                       a.Name, 
                       a.Phone, 
                       COUNT(o.Order_ID) as Assigned_Orders, 
                       SUM(CASE WHEN o.Status = 'Delivered' THEN 1 ELSE 0 END) as Completed, 
                       SUM(CASE WHEN o.Status = 'Cancelled' THEN 1 ELSE 0 END) as Cancelled
                FROM DELIVERY_AGENT a 
                LEFT JOIN ORDERS o ON a.Agent_ID = o.Agent_ID 
                GROUP BY a.Agent_ID, a.Name, a.Phone
                ORDER BY Assigned_Orders DESC
            ");
            break;
            
        default:
            throw new Exception("Invalid report type requested.");
    }
    
    echo json_encode([
        'success' => true,
        'data' => $data
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to generate report data: ' . $e->getMessage()
    ]);
}
