<?php
header('Content-Type: application/json');
session_start();
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['user_id'])) {
    require_once 'dbConnect.inc.php';
    
    $task_id = $_POST['task_id'];
    $user_id = $_SESSION['user_id'];
    
    try {
        $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = :task_id AND user_id = :user_id");
        $stmt->execute([
            'task_id' => $task_id,
            'user_id' => $user_id
        ]);
        
        echo json_encode(['success' => true]);
        exit();
    } catch (PDOException $e) {
        die("Error deleting task: " . $e->getMessage());
    }
} else {
        echo json_encode(['success' => false]);
    exit();
}
?>