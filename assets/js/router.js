import { isCorrectEmail, checkIsEmptyValue, setErrorMessage, checkPassword } from "./functions.js";
import { sendPostRequest, saveToLocalStorage, getFromLocalStorage } from "./api.js";


class Router{
    constructor() {
        this.routes = {
            'login': this.showLogin.bind(this),
            'register': this.showRegister.bind(this),
            'reset-password': this.showResetPassword.bind(this),
            'tasks': this.showTasks.bind(this),
            'logout': this.logout.bind(this)
        };
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.route());
        window.addEventListener('load', () => this.route());
    }

    route(){
        let hash = window.location.hash.split('?')[0].substring(1);
        if(!hash){
            hash = 'login';
        }
        const handler = this.routes[hash.split('/')[0]] || this.showNotFound;
        handler.call(this);
    }
    showLogin(){
        // if(checkAuth()){
        //     window.location.hash = 'tasks';
        //     return;
        // }
        document.getElementById('view-container').innerHTML = document.getElementById('login-template').innerHTML;
        this.setupLoginForm();
    }

    showRegister(){
        // if(checkAuth()){
        //     window.location.hash = 'tasks';
        //     return;
        // }
        document.getElementById('view-container').innerHTML = document.getElementById('register-template').innerHTML;
        this.setupRegisterFrom();
    }

    showResetPassword(){
        // if(checkAuth()){
        //     window.location.hash = 'tasks';
        //     return;
        // }
        document.getElementById('view-container').innerHTML = document.getElementById('reset-password-template').innerHTML;
        this.setupResetPasswordFrom();
    }

    showTasks() {
        if(!checkAuth()){
            window.location.hash = 'login';
            return;
        }
        document.getElementById('view-container').innerHTML = document.getElementById('tasks-template').innerHTML;
        this.setupTasksForm();
    }

    async logout(){
        const responce = await sendPostRequest('./includes/logout.inc.php');
        console.log(responce.success);
        window.location.hash = 'login';

        return;
    }

    showNotFound() {
        document.getElementById('view-container').innerHTML = '<h1>404 Страница не найдена</h1>';
    }

    setupLoginForm() {
        const signInForm = document.getElementById("sign_in_form");
        const errorElement = document.getElementById("error_message");
        const successElenent = document.getElementById("success_message");
        if (getFromLocalStorage("message")){
            setErrorMessage(successElenent, getFromLocalStorage("message"), true);
            saveToLocalStorage("message", '');
        }

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
                    window.location.hash = "#tasks";
                    return;
                }
                setErrorMessage(errorElement, response.error, true);
            });
        }
    }

    setupRegisterFrom(){
        const signUpForm = document.getElementById("sign_up_form");
        const errorElement = document.getElementById("error_message");
        const successElenent = document.getElementById("success_message");
        if (getFromLocalStorage("message")){
            setErrorMessage(successElenent, getFromLocalStorage("message"), true);
            saveToLocalStorage("message", '');
        }
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

                if(passwordConfirmationValue != passwordValue){
                    setErrorMessage(errorElement, "Пароли не совпадают", true);
                    return;
                }

                if (!checkPassword(passwordValue)){
                    setErrorMessage(errorElement, "Пароль должен содеражать минимум 8 символов, 1 букву и 1 спец. символ", true);
                    return;
                }

                setErrorMessage(errorElement, "", false);

                const response = await sendPostRequest("./includes/SignUp.inc.php", {
                    name: nameValue,
                    surname: surnameValue,
                    gender: genderValue,
                    email: emailValue,
                    password: passwordValue,
                    password_confirmation: passwordConfirmationValue
                });

                if (response.success) {
                    saveToLocalStorage("message", response.message)
                    window.location.hash = 'login';
                    return;
                }
                setErrorMessage(errorElement, response.error, true);
            });
        }
    }

    setupResetPasswordFrom() {
        const errorElement = document.getElementById("error_message");
        const successElenent = document.getElementById("success_message");
        if (getFromLocalStorage("message")){
            setErrorMessage(successElenent, getFromLocalStorage("message"), true);
            saveToLocalStorage("message", '');
        }

        if (window.location.hash.includes('token=')) {
            const token = new URLSearchParams(window.location.hash.split('?')[1]).get('token');

            const changePasswordForm = document.getElementById("change_password");
            if (changePasswordForm) {
                changePasswordForm.addEventListener("submit", async (e) => {
                    e.preventDefault();

                    const password = document.querySelector('input[name="password"]').value;
                    const passwordConfirmation = document.querySelector('input[name="password_confirmation"]').value;

                    if (password !== passwordConfirmation) {
                        setErrorMessage(errorElement, "Пароли не совпадают", true);
                        return;
                    }

                    const response = await sendPostRequest("./includes/ResetPassword.inc.php", {
                        token: token,
                        new_password: password
                    });

                    if (response.success) {
                        saveToLocalStorage("message", "Пароль успешно изменён");
                        window.location.hash = "#login";
                    } else {
                        setErrorMessage(errorElement, response.error, true);
                    }
                });
            }
        }
        else {
            const resetPasswordForm = document.getElementById("reset_password_form");
            if (resetPasswordForm) {
                resetPasswordForm.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    const emailValue = document.getElementById("email").value;

                    if (checkIsEmptyValue(emailValue)) {
                        setErrorMessage(errorElement, "Все поля обязательные", true);
                        return;
                    }

                    if (!isCorrectEmail(emailValue)) {
                        setErrorMessage(errorElement, "Некорректный email", true);
                        return;
                    }

                    setErrorMessage(errorElement, "", false);
                    const response = await sendPostRequest("./includes/ResetPassword.inc.php", {
                        login: emailValue
                    });

                    if (response.success) {
                        saveToLocalStorage("message", "Письмо с инструкциями отправлено на вашу почту");
                        window.location.hash = "#login";
                    } else {
                        setErrorMessage(errorElement, response.error, true);
                    }
                });
            }
        }
    }

    setupTasksForm() {
        const tasksContainer = document.querySelector('.tasks-list');
        sendPostRequest("./includes/getTasks.inc.php").then(tasks => {
            tasksContainer.innerHTML = '';
            
            if (tasks.length === 0) {
                tasksContainer.innerHTML = '<p class="no-tasks">No tasks found. Add your first task above!</p>';
                return;
            }
            tasks['tasks'].forEach(task => {
                const taskElement = this.createTaskElement(task);
                tasksContainer.appendChild(taskElement);
            });

            this.setupTaskEventHandlers();
        }).catch(error => {
            console.error('Error loading tasks:', error);
            tasksContainer.innerHTML = '<p class="error">Error loading tasks. Please try again.</p>';
        });
    }



    createTaskElement(task) {
        const taskElement = document.createElement('div');
        taskElement.className = `task-item ${task.completed ? 'completed' : ''} priority-${task.priority}`;

        taskElement.innerHTML = `
            <div class="task-checkbox">
                <form class="toggle-task-form">
                    <input type="hidden" name="task_id" value="${task.id}">
                    <input type="checkbox" name="completed" ${task.completed ? 'checked' : ''}>
                </form>
            </div>
            <div class="task-content">
                <h3>${this.escapeHtml(task.title)}</h3>
                <p>${this.escapeHtml(task.description)}</p>
                <div class="task-meta">
                    ${task.due_date ? `<span class="due-date">Due: ${this.formatDate(task.due_date)}</span>` : ''}
                    <span class="priority">${this.capitalizeFirstLetter(task.priority)}</span>
                </div>
            </div>
            <div class="task-actions">
                <a href="#edit-task?id=${task.id}" class="edit-btn">Edit</a>
                <form class="delete-task-form">
                    <input type="hidden" name="task_id" value="${task.id}">
                    <button type="submit" class="delete-btn">Delete</button>
                </form>
            </div>
        `;

        return taskElement;
    }

    setupTaskEventHandlers() {
        
        document.querySelectorAll('.add-task-form').forEach(form => {
            form.addEventListener('submit', async (e) => {
                const formData = new FormData(form);
                const formDataObj = Object.fromEntries(formData.entries());
                console.log(formDataObj);
                try {
                    const response = await sendPostRequest('./includes/toggleTask.inc.php', formDataObj);
                    if (!response.success) throw new Error('Toggle failed');
                    this.setupTasksForm(); 
                } catch (error) {
                    console.error('Error toggling task:', error);
                }
            });
        });

        document.querySelectorAll('.toggle-task-form').forEach(form => {
            form.addEventListener('change', async (e) => {
                const formData = new FormData(form);
                const formDataObj = Object.fromEntries(formData.entries());
                console.log(formDataObj);
                try {
                    const response = await sendPostRequest('./includes/toggleTask.inc.php', formDataObj);
                    if (!response.success) throw new Error('Toggle failed');
                    this.setupTasksForm(); 
                } catch (error) {
                    console.error('Error toggling task:', error);
                }
            });
        });

        document.querySelectorAll('.delete-task-form').forEach(form => {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();

                const formData = new FormData(form);
                const formDataObj = Object.fromEntries(formData.entries());

                try {
                    const response = await sendPostRequest('./includes/deleteTask.inc.php', formDataObj)
                    if (!response.success) throw new Error('Delete failed');
                    this.setupTasksForm();
                } catch (error) {
                    console.error('Error deleting task:', error);
                }
            });
        });
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    formatDate(dateString) {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}

async function checkAuth() {
    const responce = await sendPostRequest('./includes/isAuth.inc.php', {});
    return responce.is_auth;
}

new Router();