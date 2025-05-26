<?php
header('Content-Type: application/json');
session_start();

$response = ['success' => false, 'message' => ''];

try {
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not authorized');
    }

    $required = ['task_id', 'task_title'];
    foreach ($required as $field) {
        if (empty($_POST[$field])) {
            throw new Exception("Field $field is required");
        }
    }

    require_once 'dbConnect.inc.php';
    
    $stmt = $pdo->prepare("UPDATE tasks SET 
        title = :title,
        description = :description,
        due_date = :due_date,
        priority = :priority
        WHERE id = :task_id AND user_id = :user_id");
    
    $stmt->execute([
        'title' => $_POST['task_title'],
        'description' => $_POST['task_description'] ?? null,
        'due_date' => !empty($_POST['due_date']) ? $_POST['due_date'] : null,
        'priority' => $_POST['priority'] ?? 'medium',
        'task_id' => $_POST['task_id'],
        'user_id' => $_SESSION['user_id']
    ]);
    
    $response['success'] = true;
    $response['message'] = 'Task updated successfully';
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);