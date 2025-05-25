<?php
if(isset($_POST['password']) && isset($_POST['password_confirmation']) && isset($_POST['token'])){
    require_once "dbConnect.inc.php";
    require_once "function.inc.php";

    $password = checkValue($_POST['password']);
    $password_confirmation = checkValue($_POST['password_confirmation']);
    $token = checkValue($_POST['token']);

    if(isEmptySignIn($password, $password_confirmation, $token)){
        header("Location: ../pages/ResetPassword.php?token=".$token."&errors=Все поля обязательные");
        exit();
    }
    elseif(!checkPassword($password)){
        header("Location: ../pages/ResetPassword.php?token=".$token."&errors=Пароль должен содержать одну цифру, один спец. символ и одну заглавную букву");
        exit();
    }
    elseif($password != $password_confirmation){
        header("Location: ../pages/ResetPassword.php?token=".$token."&errors=Пароли не совпадают");
        exit();
    }

    try {
        $sql = "SELECT id FROM tokens WHERE token = :token";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(['token' => $token]);
        $result = $stmt->fetch();
        
        if(!$result){
            header("Location: ../pages/ResetPassword.php?token=".$token."&errors=Недействительный токен");
            exit();
        }
        
        $user_id = $result['id'];
        
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
        
        header("Location: ../pages/SignIn.php?success=Пароль успешно изменён");
        exit();
        
    } catch (PDOException $e) {
        header("Location: ../pages/ResetPassword.php?token=".$token."&errors=Ошибка сервера");
        exit();
    }
} else {
    header("Location: ../pages/ResetPassword.php?errors=Неверные данные");
    exit();
}
?>