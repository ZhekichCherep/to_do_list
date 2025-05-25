import { isCorrectEmail, checkIsEmptyValue, setErrorMessage } from "./functions.js";
import { sendPostRequest, saveToLocalStorage } from "./api.js";


class Router{
    constructor() {
        this.routes = {
            'login': this.showLogin.bind(this),
            'register': this.showRegister.bind(this), 
            'reset-password': this.showResetPassword.bind(this), 
            'tasks': this.showTasks.bind(this)
        };
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.route());
        window.addEventListener('load', () => this.route());
    }

    route(){
        const hash = window.location.hash.substring(1) || 'login';
        const handler = this.routes[hash.split('/')[0]] || this.showNotFound;
        handler.call(this);
    }
    showLogin(){
        if(checkAuth()){
            window.location.hash = 'dashboard';
            return;
        }
        document.getElementById('view-container').innerHTML = document.getElementById('login-template').innerHTML;
        this.setupLoginForm();
    }

    showRegister(){
        document.getElementById('view-container').innerHTML = document.getElementById('register-template').innerHTML;
        this.setupRegisterFrom();
    }

    showResetPassword(){
        document.getElementById('view-container').innerHTML = document.getElementById('reset-password-template').innerHTML;
        this.setupResetPasswordFrom();
    }

    showTasks() {
        if (!checkAuth()) {
            window.location.hash = 'login';
            return;
        }
        
        document.getElementById('content').innerHTML = '<h2>Мои задачи</h2>';
        // Загрузка задач через API
    }

    showNotFound() {
        document.getElementById('view-container').innerHTML = '<h1>404 Страница не найдена</h1>';
    }
    
    setupLoginForm() {
        const signInForm = document.getElementById("sign_in_form");
        const errorElement = document.getElementById("error_message");
            if (signInForm) {
                signInForm.addEventListener("submit", async (e) => {
                    e.preventDefault();
        
                    const loginValue = document.getElementById("login").value;
                    const passwordValue = document.getElementById("password").value;
        
                    if (checkIsEmptyValue(loginValue, passwordValue)) {
                        setErrorMessage(errorElement, "Все поля обязательные", true);
                        return;
                    }
                    
                    setErrorMessage(errorElement, "", false);
                    saveToLocalStorage("login", loginValue);
                    
                    const response = await sendPostRequest("./includes/SignIn.inc.php", { 
                        login: loginValue, 
                        password: passwordValue 
                    });
        
                    if (response.success) {
                        window.location.hash = "#main";
                        return;
                    }
                    setErrorMessage(errorElement, response.error, true);
                }
            );
        }
    }

    setupRegisterFrom(){
    const signUpForm = document.getElementById("sign_up_form");
        const errorElement = document.getElementById("error_div")
        if (signUpForm) {
            signUpForm.addEventListener("submit", async (e) => {
                e.preventDefault();
    
                const nameValue = document.getElementById("name").value;
                const surnameValue = document.getElementById("surname").value;
                const genderValue = document.querySelector('select[name="gender"]').value;
                const emailValue = document.getElementById("e-mail").value;
                const passwordValue = document.getElementById("password").value;
                const passwordConfirmationValue = document.getElementById("password_confirmation").value;
    
                if (checkIsEmptyValue(nameValue, surnameValue, genderValue, emailValue,
                    passwordConfirmationValue, passwordValue)) {
                    setErrorMessage(errorElement, "Все поля обязательные", true);
                    return;
                }
    
                if (!isCorrectEmail(emailValue)){
                    setErrorMessage(errorElement, "Некорректный e-mail", true);
                    return;
                }
                
                if (!checkPassword(passwordValue)){
                    setErrorMessage(errorElement, "Пароль должен содеражать минимум 8 символов, 1 букву и 1 спец. символ", true);
                    return;
                }
    
                setErrorMessage(errorElement, "", false);
                
                const response = await sendPostRequest("../../includes/SignUp.inc.php", { 
                    name: nameValue,
                    surname: surnameValue,
                    gender: genderValue, 
                    email: emailValue,
                    password: passwordValue, 
                    password_confirmation: passwordConfirmationValue 
                });
    
                if (response.success) {
                    saveToLocalStorage("page_state", "sign_in");
                    saveToLocalStorage("message", response.message)
                    initPage();
                    return;
                }
                setErrorMessage(errorElement, response.error, true);
            });
        }
    }

    setupResetPasswordFrom(){
        const errorElement = document.getElementById("alert_error");
        
        if (getFromLocalStorage("message")){
                setErrorMessage(errorElement, getFromLocalStorage("message"), true);
                saveToLocalStorage("message", "");
            }
        
        const resetPasswordForm = document.getElementById("reset_password_form");
        if (resetPasswordForm) {
            resetPasswordForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const emailValue = document.getElementById("email").value;
                if (checkIsEmptyValue(emailValue)) {
                    setErrorMessage(errorElement, "Все поля обязательные", true);
                    return;
                }
                
                if(!isCorrectEmail(emailValue)){
                    setErrorMessage(errorElement, "Некорректный email", true);
                    return;
                }
                setErrorMessage(errorElement, "", false);
                    const response = await sendPostRequest("../includes/ResetPassword.inc.php", { 
                    login: emailValue
                });
                if (response.success) {
                    saveToLocalStorage("page_state", "sign_in");
                    saveToLocalStorage("message", "Письмо с инструкциями отправлено на вашу почту")
                    initPage();
                    return;
                }
                setErrorMessage(errorElement, response.error, true);
            });
        }
    }

}

function checkAuth() {
    return localStorage.getItem('auth_token') !== null;
}

new Router();