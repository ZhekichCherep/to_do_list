<?
$dbHost = 'localhost';
$dbUsername = 'root';
$dbPassword = '';
$dbName = 'users';

$dsn = "mysql:host=$dbHost; dbname=$dbName;charset=utf8";

$options = [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES => false
];

try {
    $pdo = new PDO($dsn, $dbUsername, $dbPassword, $options);
}catch (PDOException $e){
    die('Error'.$e->getMessage());
}
?>