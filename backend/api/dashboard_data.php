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

try {
    // Fetch card statistics
    $total_customers = db_count("SELECT COUNT(*) FROM CUSTOMER");
    $total_products = db_count("SELECT COUNT(*) FROM PRODUCT");
    $total_orders = db_count("SELECT COUNT(*) FROM ORDERS");
    $total_revenue = db_count("SELECT COALESCE(SUM(Total_Amount), 0) FROM ORDERS WHERE Status != 'Cancelled'");
    $total_categories = db_count("SELECT COUNT(*) FROM CATEGORY");
    $total_suppliers = db_count("SELECT COUNT(*) FROM SUPPLIER");
    $total_agents = db_count("SELECT COUNT(*) FROM DELIVERY_AGENT");

    // 1. Monthly Revenue & Trends
    $monthly_rev_query = "
        SELECT DATE_FORMAT(Order_Date, '%b %Y') as Month, 
               SUM(Total_Amount) as Revenue, 
               COUNT(*) as OrdersCount
        FROM ORDERS 
        WHERE Status != 'Cancelled'
        GROUP BY DATE_FORMAT(Order_Date, '%Y-%m'), Month
        ORDER BY DATE_FORMAT(Order_Date, '%Y-%m') ASC
        LIMIT 12
    ";
    $monthly_data = db_fetch_all($monthly_rev_query);
    
    $months = [];
    $revenues = [];
    $order_counts = [];
    foreach ($monthly_data as $row) {
        $months[] = $row['Month'];
        $revenues[] = (float)$row['Revenue'];
        $order_counts[] = (int)$row['OrdersCount'];
    }

    // 2. Orders by Status
    $status_query = "
        SELECT Status, COUNT(*) as Count 
        FROM ORDERS 
        GROUP BY Status
    ";
    $status_data = db_fetch_all($status_query);
    
    $statuses = [];
    $status_counts = [];
    foreach ($status_data as $row) {
        $statuses[] = $row['Status'];
        $status_counts[] = (int)$row['Count'];
    }

    // 3. Top 5 Selling Products
    $top_products_query = "
        SELECT p.Product_Name, SUM(oi.Quantity) as TotalQty 
        FROM ORDER_ITEM oi 
        JOIN PRODUCT p ON oi.Product_ID = p.Product_ID 
        GROUP BY oi.Product_ID, p.Product_Name
        ORDER BY TotalQty DESC 
        LIMIT 5
    ";
    $top_products_data = db_fetch_all($top_products_query);
    
    $top_products = [];
    $top_qty = [];
    foreach ($top_products_data as $row) {
        $top_products[] = $row['Product_Name'];
        $top_qty[] = (int)$row['TotalQty'];
    }

    // 4. Category-wise Sales
    $category_sales_query = "
        SELECT c.Category_Name, SUM(oi.Quantity * oi.Price) as Sales 
        FROM ORDER_ITEM oi 
        JOIN PRODUCT p ON oi.Product_ID = p.Product_ID 
        JOIN CATEGORY c ON p.Category_ID = c.Category_ID 
        GROUP BY c.Category_ID, c.Category_Name
        ORDER BY Sales DESC
        LIMIT 6
    ";
    $category_data = db_fetch_all($category_sales_query);
    
    $categories = [];
    $category_sales = [];
    foreach ($category_data as $row) {
        $categories[] = $row['Category_Name'];
        $category_sales[] = (float)$row['Sales'];
    }

    // Respond with consolidated data
    echo json_encode([
        'success' => true,
        'stats' => [
            'total_customers' => $total_customers,
            'total_products' => $total_products,
            'total_orders' => $total_orders,
            'total_revenue' => $total_revenue,
            'total_categories' => $total_categories,
            'total_suppliers' => $total_suppliers,
            'total_agents' => $total_agents
        ],
        'months' => $months,
        'revenues' => $revenues,
        'order_counts' => $order_counts,
        'statuses' => $statuses,
        'status_counts' => $status_counts,
        'top_products' => $top_products,
        'top_qty' => $top_qty,
        'categories' => $categories,
        'category_sales' => $category_sales
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch dashboard data: ' . $e->getMessage()
    ]);
}
