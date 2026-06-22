<?php
/**
 * Database Helper Functions using PDO
 */
require_once dirname(__DIR__) . '/config/config.php';

$pdo_connection = null;

function get_db_connection() {
    global $pdo_connection;
    
    if ($pdo_connection !== null) {
        return $pdo_connection;
    }
    
    try {
        $dsn = sprintf("mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4", DB_HOST, DB_PORT, DB_NAME);
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        
        $pdo_connection = new PDO($dsn, DB_USER, DB_PASS, $options);
        return $pdo_connection;
    } catch (PDOException $e) {
        error_log("Database Connection Error: " . $e->getMessage());
        die("Database Connection Error. Please check log files.");
    }
}

/**
 * Execute SQL statement with parameters
 */
function db_query($sql, $params = []) {
    try {
        $db = get_db_connection();
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    } catch (PDOException $e) {
        error_log("Query execution failed: " . $e->getMessage() . " | SQL: " . $sql);
        throw $e;
    }
}

/**
 * Fetch a single row
 */
function db_fetch($sql, $params = []) {
    $stmt = db_query($sql, $params);
    return $stmt->fetch();
}

/**
 * Fetch all rows
 */
function db_fetch_all($sql, $params = []) {
    $stmt = db_query($sql, $params);
    return $stmt->fetchAll();
}

/**
 * Fetch dynamic count
 */
function db_count($sql, $params = []) {
    $stmt = db_query($sql, $params);
    return $stmt->fetchColumn();
}

/**
 * Transaction Controls
 */
function db_begin_transaction() {
    return get_db_connection()->beginTransaction();
}

function db_commit() {
    return get_db_connection()->commit();
}

function db_rollback() {
    return get_db_connection()->rollBack();
}

/**
 * Programmatic Next ID Generator (due to lack of AUTO_INCREMENT in DB schema)
 * Always run this inside a transaction if you are performing concurrent inserts
 */
function db_get_next_id($table, $pk_column) {
    // Sanitizing table and column name since they can't be parameterized
    $table = preg_replace('/[^a-zA-Z0-9_]/', '', $table);
    $pk_column = preg_replace('/[^a-zA-Z0-9_]/', '', $pk_column);
    
    $sql = "SELECT COALESCE(MAX($pk_column), 0) + 1 FROM $table";
    $stmt = db_query($sql);
    return (int)$stmt->fetchColumn();
}
