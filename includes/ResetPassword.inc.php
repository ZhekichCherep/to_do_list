<?php
header('Content-Type: application/json');
if(isset($_POST['login'])) {
    require_once 'function.inc.php';
    require_once 'dbConnect.inc.php';

    $email = checkValue($_POST['login']);

    $user = getUserByLogin($email, $pdo);

    if(!$user['id'] || !$user['active']) {
            echo json_encode([
                'success' => false,
                'error' => "Неактивированный аккаунт"
            ]);
            exit();
    }

    $token = bin2hex(random_bytes(32));

    try {
        $sql = "UPDATE tokens SET token = :token  WHERE id = :id";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            'id' => $user['id'],
            'token' => $token,
        ]);
        
        if($stmt->rowCount() === 0) {
            $sql = "INSERT INTO tokens (id, token) VALUES (:id, :token)";
            $stmt = $pdo->prepare($sql);
            $stmt->execute([
                'id' => $user['id'],
                'token' => $token,
            ]);
        }

        if (sendMail($email, "http://localhost/to_do_list/to_do_list/index.php?token=".$token."#reset-password")) {
            echo json_encode([
                'success' => true,
                'error' => "Письмо с инструкциями отправлено на вашу почту"
            ]);
            exit();
        }
    } catch (PDOException $e) {
            echo json_encode([
                'success' => false,
                'error' => $e->getMessage()
            ]);
            exit();
    }
} 
?>