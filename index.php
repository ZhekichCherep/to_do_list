<?php
session_start();
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
        <a> Sign In </a>
        <form id="sign_in_form">
            <input id="login" placeholder="login/e-mail" name='login'>
            <input id="password" placeholder="password" type="text" name="password">
            <div id="error_message"></div>
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
            </form>
        <?} else { ?>
            <form id="reset_password_form">
                <input placeholder="Email or login" id="email">
                <button type="submit">Reset password</button>
            </form>
        <div id="error_message"></div>

        <?} ?>
    </div>
    </template>

    <script src="./assets/js/router.js" type="module"></script>
</body>
</html>
