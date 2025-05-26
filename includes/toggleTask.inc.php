<?php
header('Content-Type: application/json');
session_start();

$response = ['success' => false, 'message' => ''];

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !isset($_SESSION['user_id'])) {
        $response['message'] = 'Unauthorized request';
        echo json_encode($response);
        exit();
    }

    if (!isset($_POST['task_id'])) {
        $response['message'] = 'Task ID is required';
        echo json_encode($response);
        exit();
    }

    require_once 'dbConnect.inc.php';
    
    $task_id = $_POST['task_id'];
    $completed = isset($_POST['completed']) ? 1 : 0;
    $user_id = $_SESSION['user_id'];
    
    $stmt = $pdo->prepare("UPDATE tasks SET completed = :completed WHERE id = :task_id AND user_id = :user_id");
    $result = $stmt->execute([
        'completed' => $completed,
        'task_id' => $task_id,
        'user_id' => $user_id
    ]);
    
    if ($result && $stmt->rowCount() > 0) {
        $response['success'] = true;
        $response['message'] = 'Task updated successfully';
        $response['completed'] = (bool)$completed;
    } else {
        $response['message'] = 'No task found or no changes made';
    }
    
} catch (PDOException $e) {
    $response['message'] = 'Database error: ' . $e->getMessage();
} catch (Exception $e) {
    $response['message'] = 'Error: ' . $e->getMessage();
}

echo json_encode($response);
exit();
?>