<?php
session_start();
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_SESSION['user_id'])) {
    require_once 'dbConnect.inc.php';
    
    $title = htmlspecialchars($_POST['task_title']);
    $description = htmlspecialchars($_POST['task_description']);
    $due_date = !empty($_POST['due_date']) ? $_POST['due_date'] : null;
    $priority = in_array($_POST['priority'], ['low', 'medium', 'high']) ? $_POST['priority'] : 'medium';
    $user_id = $_SESSION['user_id'];
    
    try {
        $stmt = $pdo->prepare("INSERT INTO tasks (user_id, title, description, due_date, priority, created_at) 
                              VALUES (:user_id, :title, :description, :due_date, :priority, NOW())");
        $stmt->execute([
            'user_id' => $user_id,
            'title' => $title,
            'description' => $description,
            'due_date' => $due_date,
            'priority' => $priority
        ]);
        
        header("Location: ../pages/main.php");
        exit();
    } catch (PDOException $e) {
        die("Error adding task: " . $e->getMessage());
    }
} else {
    header("Location: ../pages/SignIn.php");
    exit();
}
?>