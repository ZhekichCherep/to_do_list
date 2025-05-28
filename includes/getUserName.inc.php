<?php
header('Content-Type: application/json');
session_start();

$response = ['success' => false, 'message' => ''];

try {
    if (!isset($_SESSION['user_id'])) {
        throw new Exception('Not authorized');
    }

    require_once 'dbConnect.inc.php';
    
    $stmt = $pdo->prepare("SELECT name FROM users_data WHERE id = :user_id");
    $stmt->execute([
        'user_id' => $_SESSION['user_id']
    ]);
    
    $name = $stmt->fetch(PDO::FETCH_ASSOC)['name'];
    
    if (!$name) {
        throw new Exception('Name not found');
    }
    
    $response['success'] = true;
    $response['name'] = $name;
} catch (Exception $e) {
    $response['message'] = $e->getMessage();
}

echo json_encode($response);