<?
header('Content-Type: application/json');
if(isset($_POST)){

    require_once 'function.inc.php';
    require_once 'dbConnect.inc.php';
    $name = checkValue($_POST['name']);
    $surname = checkValue($_POST['surname']);
    $gender = checkValue($_POST['gender']);
    $email = checkValue($_POST['email']);
    $password = checkValue($_POST['password']);
    $password_confirmation = checkValue($_POST['password_confirmation']);

    $user = getUserByLogin($email, $pdo);

    if($user){
        echo json_encode([
            'succeess' => false,
            'error' => "Данный email уже зарегистрирован"
        ]);
        exit();
    }

    else{
        try {
            $stmt = $pdo->query("SELECT MAX(id) as max_id FROM users_data");
            $row = $stmt->fetch();
            $id = $row['max_id'] + 1;
            
            $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
            $token = bin2hex(random_bytes(32));
            
            insertIntoDatabase($pdo, 'users_data', [
                'id' => $id,
                'name' => $name,
                'surname' => $surname,
                'email' => $email,
                'password' => $hashedPassword,
                'active' => 0,
                'login' => strtok($email, '@')
            ]);
            
            insertIntoDatabase($pdo, 'tokens', [
                'id' => $id,
                'token' => $token
            ]);
            
        } catch (PDOException $e) {
            echo "Ошибка: " . $e->getMessage();
        }

        if(sendMail($email, "Перейдите для активации аккаунта http://localhost/to_do_list/to_do_list/index.php?activate_token=".$token)){
                echo json_encode([
                    'success' => true,
                    'message' => 'Для завершения активации перейдите по ссылке в письме'
                ]);
                exit();
        }
        echo json_encode([
            'succeess' => false,
            'error' => "Не удалось отправить письмо"
        ]);
    }
}
?>