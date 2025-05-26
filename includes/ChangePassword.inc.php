<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'error' => 'Invalid request method']);
    exit();
}

if (!isset($_POST['password'], $_POST['token'])) {
    echo json_encode(['success' => false, 'error' => 'Missing required fields']);
    exit();
}

require_once "dbConnect.inc.php";
require_once "function.inc.php";

$password = checkValue($_POST['password']);
$token = checkValue($_POST['token']);

try {
    $sql = "SELECT id FROM tokens WHERE token = :token";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['token' => $token]);
    $tokenData = $stmt->fetch();

    if (!$tokenData) {
        echo json_encode(['success' => false, 'error' => 'Недействительный или просроченный токен']);
        exit();
    }

    $user_id = $tokenData['id'];

    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    $sqlUpdatePassword = "UPDATE users_data SET password = :password WHERE id = :user_id";
    $stmtUpdate = $pdo->prepare($sqlUpdatePassword);
    $stmtUpdate->execute([
        'user_id' => $user_id,
        'password' => $hashedPassword
    ]);

    $sqlDeleteToken = "DELETE FROM tokens WHERE token = :token";
    $stmtDelete = $pdo->prepare($sqlDeleteToken);
    $stmtDelete->execute(['token' => $token]);

    echo json_encode([
        'success' => true,
        'message' => 'Пароль успешно изменён'
    ]);

} catch (PDOException $e) {
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}