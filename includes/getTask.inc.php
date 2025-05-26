<?php
header('Content-Type: application/json');
session_start();

$response = ['success' => false, 'message' => ''];

try {
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not authorized');
    }

    if (!isset($_POST['task_id'])) {
        throw new Exception('Task ID is required');
    }

    require_once 'dbConnect.inc.php';
    
    $stmt = $pdo->prepare("SELECT * FROM tasks WHERE id = :task_id AND user_id = :user_id");
    $stmt->execute([
        'task_id' => $_POST['task_id'],
        'user_id' => $_SESSION['user_id']
    ]);
    
    $task = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$task) {
        throw new Exception('Task not found');
    }
    
    $response['success'] = true;
    $response['task'] = $task;
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);