<?php
header('Content-Type: application/json');
session_start();

require_once "dbConnect.inc.php";

try {
    if (!isset($_SESSION['user_id'])) {
        echo json_encode(['success' => false, 'error' => 'Not authenticated']);
        exit();
    }

    $user_id = $_SESSION['user_id'];
    $filter = isset($_GET['filter']) ? $_GET['filter'] : 'all';
    
    $sql = "SELECT * FROM tasks WHERE user_id = :user_id";
    
    if ($filter === 'active') {
        $sql .= " AND completed = 0";
    } elseif ($filter === 'completed') {
        $sql .= " AND completed = 1";
    }
    
    $sql .= " ORDER BY completed ASC, priority DESC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['user_id' => $user_id]);
    $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($tasks as &$task) {
        if ($task['due_date']) {
            $task['formatted_due_date'] = date('M j, Y', strtotime($task['due_date']));
        }
    }
    
    echo json_encode([
        'success' => true,
        'tasks' => $tasks,
        'count' => count($tasks),
        'filter' => $filter
    ]);
    
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => 'Database error'
    ]);
}