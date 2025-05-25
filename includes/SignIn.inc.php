<?php
header('Content-Type: application/json');
if (isset($_POST['login'])) {
    require_once 'function.inc.php';
    require_once 'dbConnect.inc.php';

    $email = checkValue($_POST['login']);
    $password = checkValue($_POST['password']); 
    $user = getUserByLogin($email, $pdo);

    if ($user) {
        if (!$user['active']) {
            echo json_encode([
                'success' => false,
                'error' => "Неактивированный аккаунт"
            ]);
            exit();
        } elseif (password_verify($password, $user['password'])) {
            session_start();
            $_SESSION['user_id'] = $user['id'];
            echo json_encode([
                'success' => true,
                'redirect' => "../pages/SignIn.php" 
            ]);
            exit();
        } else {
            echo json_encode([
                'success' => false,
                'error' => "Неверный логин или пароль"
            ]);
            exit();
        }
    } else {
        echo json_encode([
            'success' => false,
            'error' => "Неверный логин или пароль"
        ]);
        exit();
    }
}