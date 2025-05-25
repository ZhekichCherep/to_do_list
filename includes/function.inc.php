<?
function isEmptySignin(...$values): bool { 
    foreach($values as $value){
        if(empty($value)){
            return true;
        }
    }
    return false;
}

function isCorrectEmail($email){
    if(strpos($email, '.') && strpos($email, '@')){
        return true;
    }
    return false;
}

function checkPassword($password){
    $checkPass = array(
        "numeric" => false,
        "spec_simbol" => false,
        "cap_letter" => false
    );
    foreach(str_split($password) as $item){
        if(is_numeric($item)){
            $checkPass['numeric'] = true;
        }
        elseif(ctype_upper($item)){
            $checkPass['cap_letter'] = true;
        }
        elseif(preg_match("/[^a-zA-Z0-9]/", $password)){
            $checkPass['spec_simbol'] = true;
        }
    }
    foreach(array_values($checkPass) as $value){
        if(!$value){
            return false;
        }
    }
    return true;
}

function checkValue($value): string {
    return htmlentities(htmlspecialchars(strip_tags($value)));
}

function sendMail($to, $message, $subject="ToDoList",){
    $headers = "From:".$to. "\r\n" .
            "Reply-To:".$to. "\r\n" .
            "X-Mailer: PHP/" . phpversion();

    return mail($to, $subject, $message, $headers);
}

function getUserByLogin($email, $pdo){
    $sql = "SELECT id, email, password, active FROM users_data WHERE email = :email OR login = :login";
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['email' => $email, 'login'=>$email]);
    $user = $stmt->fetch();
    return $user;
}

function insertIntoDatabase($pdo, $table, $data) {
    $columns = implode(', ', array_keys($data));
    $placeholders = ':' . implode(', :', array_keys($data));
    
    $sql = "INSERT INTO $table ($columns) VALUES ($placeholders)";
    $stmt = $pdo->prepare($sql);
    
    return $stmt->execute($data);
}

function validateSignUpData($name, $surname, $gender, $email, $password, $password_confirmation) {
    if (isEmptySignIn($name, $surname, $gender, $email, $password, $password_confirmation)) {
        return [
            'location' => "../pages/SignUp.php",
            'errors' => "Все поля обязательные",
            'params' => []
        ];
    }
    
    if (!isCorrectEmail($email)) {
        return [
            'location' => "../pages/SignUp.php",
            'errors' => "Некорректный email",
            'params' => [
                'email' => $email,
                'name' => $name,
                'surname' => $surname,
                'gender' => $gender
            ]
        ];
    }
    
    if (!checkPassword($password)) {
        return [
            'location' => "../pages/SignUp.php",
            'errors' => "Пароль должен содержать одну цифру, один спец. символ и одну заглавную букву",
            'params' => [
                'email' => $email,
                'name' => $name,
                'surname' => $surname,
                'gender' => $gender
            ]
        ];
    }
    
    if ($password != $password_confirmation) {
        return [
            'location' => "../pages/SignUp.php",
            'errors' => "Пароли не совпадают",
            'params' => [
                'email' => $email,
                'name' => $name,
                'surname' => $surname,
                'gender' => $gender
            ]
        ];
    }
    
    return null;
}
?>