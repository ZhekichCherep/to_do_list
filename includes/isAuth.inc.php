<?
header('Content-Type: application/json');
session_start();
echo json_encode(['is_auth' => !empty($_SESSION['user_id'])])
?>