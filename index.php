<?php
session_start();
require_once './includes/dbConnect.inc.php';
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>To-do list</title>
    <link rel="stylesheet" href="./assets/css/style.css">
</head>
<body>
    <div id="app">
        <div id="view-container"></div>
    </div>

    <template id="login-template">
        <h> Sign In </h>
        <form id="sign_in_form">
            <input id="login" placeholder="login/e-mail" name='login'>
            <input id="password" placeholder="password" type="text" name="password">
            <div id="error_message"></div>
            <div id="success_message"></div>
            <button type="submit" id="sign_in">Sign in</button>
            <div class="bottom_label">
                <a href="#register" id="ref_to_sign_up">Registration</a>
                <a href="#reset-password" id="ref_to_reset_password">Reset password</a>
            </div>
        </form>
    </template>

    <template id="register-template">
        <a href="#login">Back to sign in</a>
        <form id="sign_up_form">
            <input id="name" name="name" placeholder="name">
            <input id="surname" name="surname" placeholder="surname">
            <p>Choose your gender</p>
            <select name="gender">
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
            <input id="e-mail"  placeholder="e-mail" name="email">
            <input id="password"  placeholder="password" name="password">
            <input id="password_confirmation" placeholder="password confirmation" name="password_confirmation">
            <div id="error_message"></div>
            <div id="success_message"></div>
            <button type="submit">Sign up</button>
        </form>
    </template>

    <template id="reset-password-template">
        <a href="#login">Back to sign in</a>
        <div class="container">
        <h1>Reset Password</h1>
        <a id="ref_to_sign_in">Back to sign in</a>
        <?php if (isset($_GET['token'])) { ?>
            <form id="change_password">
                <p>Create a new password</p>
                <input type="hidden" name="token" value="<?php echo htmlspecialchars($_GET['token']); ?>">
                <input placeholder="New password" name="password">
                <input  placeholder="Confirm new password" name="password_confirmation">
                <button type="submit">Change password</button>
                <div id="error_message"></div>
                <div id="success_message"></div>
            </form>
        <?} else { ?>
            <form id="reset_password_form">
                <input placeholder="Email or login" id="email">
                <button type="submit">Reset password</button>
            </form>
            <div id="error_message"></div>
            <div id="success_message"></div>

        <?} ?>
    </div>
    </template>

<template id="tasks-template">

<template id="edit-task-template">
    <div class="edit-task-container">
        <h2>Edit Task</h2>
        <form id="edit-task-form" class="task-form">
            <input type="text" name="task_title" placeholder="Task title" required>
            <textarea name="task_description" placeholder="Task description"></textarea>
            <input type="date" name="due_date">
            <select name="priority">
                <option value="low">Low</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High</option>
            </select>
            <button type="submit">Save Changes</button>
            <a href="#tasks" class="cancel-btn">Cancel</a>
        </form>
    </div>
</template>


    <div class="container">
        <header>
            <h1>My ToDo List</h1>
            <div class="user-info">
                <span id="user-name"></span>
                <a href="#logout" class="logout-btn">Logout</a>
            </div>
        </header>

        <div class="todo-container">
            <form id="add-task-form" class="add-task-form">
                <input type="text" name="task_title" placeholder="Enter task title" required>
                <textarea name="task_description" placeholder="Enter task description"></textarea>
                <input type="date" name="due_date">
                <select name="priority">
                    <option value="low">Low</option>
                    <option value="medium" selected>Medium</option>
                    <option value="high">High</option>
                </select>
                <button id="add-task-button" type="submit">Add Task</button>
            </form>

            <div class="task-filters">
                <select id="task-filter">
                    <option value="all">All Tasks</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            <div class="tasks-list">
            </div>
        </div>
    </div>
    </template>
        <?php if (isset($_GET['activate_token'])) { 
        ?>        <h>Успешно активиравано</h>
        <?
        require_once "includes/dbConnect.inc.php";
        try{
            $token = $_GET['activate_token'];
            $sql = "SELECT id FROM tokens WHERE token=:token;";
            $stmt = $pdo->prepare($sql);
            $stmt->execute(['token'=>$token]);
            $id = $stmt->fetch()['id'];
            $sqlUpdateActive = "UPDATE users_data SET active = 1 WHERE id = :id";
            $sqlDeleteToken = "DELETE FROM tokens WHERE token = :token";
            $stmtUpdate = $pdo->prepare($sqlUpdateActive);
            $stmtDelete = $pdo->prepare($sqlDeleteToken);
            $stmtUpdate->execute([
                'id' => $id,
            ]);
            $stmtDelete->execute([
                'token' => $token,
            ]);
            exit();

        }
        catch (PDOException $e) {
            die("Database error: " . $e->getMessage());
        }

    } ?>
    <script src="./assets/js/router.js" type="module"></script>
</body>
</html>
