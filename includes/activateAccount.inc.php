<?php
header('Content-Type: application/json');
require_once "dbConnect.inc.php";

try {
    if (!isset($_POST['activate_token'])) {
        throw new Exception('Токен активации не предоставлен');
    }

    $token = $_POST['activate_token'];
    
    $sql = "SELECT id FROM tokens WHERE token = :token";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['token' => $token]);
    $result = $stmt->fetch();

    if (!$result) {
        throw new Exception('Недействительный или просроченный токен');
    }

    $sqlUpdate = "UPDATE users_data SET active = 1 WHERE id = :id";
    $stmtUpdate = $pdo->prepare($sqlUpdate);
    $stmtUpdate->execute(['id' => $result['id']]);

    $sqlDelete = "DELETE FROM tokens WHERE token = :token";
    $stmtDelete = $pdo->prepare($sqlDelete);
    $stmtDelete->execute(['token' => $token]);

    echo json_encode(['success' => true]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}