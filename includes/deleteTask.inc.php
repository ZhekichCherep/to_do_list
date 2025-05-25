<?php
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
        
        header("Location: ../pages/main.php");
        exit();
    } catch (PDOException $e) {
        die("Error deleting task: " . $e->getMessage());
    }
} else {
    header("Location: ../pages/SignIn.php");
    exit();
}
?>