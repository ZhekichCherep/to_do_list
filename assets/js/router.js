import { isCorrectEmail, checkIsEmptyValue, setErrorMessage, checkPassword } from "./functions.js";
import { sendPostRequest, saveToLocalStorage, getFromLocalStorage } from "./api.js";


class Router{
    constructor() {
        this.routes = {
            'login': this.showLogin.bind(this),
            'register': this.showRegister.bind(this),
            'reset-password': this.showResetPassword.bind(this),
            'tasks': this.showTasks.bind(this),
            'logout': this.logout.bind(this),
            'edit-task': this.showEditTask.bind(this)
        };
        this.init();
        this.handleActivationToken();
        let count = 0;
    }

    init() {
        window.addEventListener('hashchange', () => this.route());
        window.addEventListener('load', () => this.route());
    }

    route(){
        let hash = window.location.hash.split('?')[0].substring(1);
        console.log(hash)
        if(!hash || window.location.hash.includes('activate_token')){
            hash = 'login';
        }
        const handler = this.routes[hash.split('/')[0]] || this.showNotFound;
        handler.call(this);
    }

    async handleActivationToken() {
        const urlParams = new URLSearchParams(window.location.search);
        const activationToken = urlParams.get('activate_token');
        saveToLocalStorage('message', 'Аккаунт успешно активирован!');

        if (activationToken) {
            try {
                document.getElementById('view-container').innerHTML = '<p>Активация аккаунта...</p>';
                
                const response = await sendPostRequest('./includes/activateAccount.inc.php', {
                    activate_token: activationToken
                });
                
                if (response.success) {
                    const newUrl = window.location.pathname;
                    window.history.replaceState({}, document.title, newUrl);
                    
                    saveToLocalStorage('message', 'Аккаунт успешно активирован!');
                    this.count = 1;
                    window.location.hash = 'login';
                } else {
                    throw new Error(response.error || 'Ошибка активации');
                    
                }
            } catch (error) {
                
                console.error('Activation error:', error);
                document.getElementById('view-container').innerHTML = `
                    <div class="error-message">
                        Ошибка активации: ${error.message}
                        <a href="#login">Перейти к входу</a>
                    </div>
                `;
            }
        }
    }


    async showLogin(){
        if(await checkAuth()){
            window.location.hash = 'tasks';
            return;
        }
        document.getElementById('view-container').innerHTML = document.getElementById('login-template').innerHTML;
        this.setupLoginForm();
    }

    async showRegister(){
        if(await checkAuth()){
            window.location.hash = 'tasks';
            return;
        }
        document.getElementById('view-container').innerHTML = document.getElementById('register-template').innerHTML;
        this.setupRegisterFrom();
    }

    async showResetPassword(){
        if(await checkAuth()){
            window.location.hash = 'tasks';
            return;
        }
        document.getElementById('view-container').innerHTML = document.getElementById('reset-password-template').innerHTML;
        this.setupResetPasswordFrom();
    }

    async showTasks() {
        if(!await checkAuth()){
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

    showEditTask() {
        if(!checkAuth()){
            window.location.hash = 'login';
            return;
        }
        
        const taskId = new URLSearchParams(window.location.hash.split('?')[1]).get('id');
        
        if(!taskId) {
            this.showNotFound();
            return;
        }

        document.getElementById('view-container').innerHTML = document.getElementById('edit-task-template').innerHTML;
        this.setupEditTaskForm(taskId);
    }

    setupLoginForm() {
        const signInForm = document.getElementById("sign_in_form");
        const errorElement = document.getElementById("error_message");
        const successElenent = document.getElementById("success_message");
        if (getFromLocalStorage("message")){
            setErrorMessage(successElenent, getFromLocalStorage("message"), true);
            if (this.count > 2){
                saveToLocalStorage("message", '');
                setErrorMessage(successElenent, '', false)
            }
            else{ 
                this.count += 1
            }
        }
        if (signInForm) {
            signInForm.addEventListener("submit", async (e) => {
                e.preventDefault();

                this.count += 1
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
        const successElement = document.getElementById("success_message");
        
        if (getFromLocalStorage("message")) {
            setErrorMessage(successElement, getFromLocalStorage("message"), true);
            saveToLocalStorage("message", '');
        }

        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.slice(1).split('?')[1] || '');
        const token = urlParams.get('token') || hashParams.get('token');

        if (token) {
            const changePasswordForm = document.getElementById("change_password");
            if (changePasswordForm) {
                changePasswordForm.addEventListener("submit", async (e) => {
                    e.preventDefault();

                    const new_password = changePasswordForm.querySelector('input[name="password"]').value;
                    const passwordConfirmation = changePasswordForm.querySelector('input[name="password_confirmation"]').value;

                    if (new_password !== passwordConfirmation) {
                        setErrorMessage(errorElement, "Пароли не совпадают", true);
                        return;
                    }

                    if(!checkPassword(new_password)){
                        setErrorMessage(errorElement, "Пароль должен содеражать минимум 8 символов, 1 букву и 1 спец. символ", true);
                        return;
                    }

                    try {
                        const response = await sendPostRequest("./includes/ChangePassword.inc.php", {
                            token: token,
                            password: new_password
                        });

                        if (response?.success) {
                            saveToLocalStorage("message", "Пароль успешно изменён");
                            const url = new URL(window.location.href);
                            url.searchParams.delete('token');
                            url.hash = "#login";
                            window.location.href = url.toString();
                             
                        } else {
                            setErrorMessage(errorElement, response?.error || "Ошибка сервера", true);
                        }
                    } catch (error) {
                        console.error('Password reset error:', error);
                        setErrorMessage(errorElement, "Ошибка соединения", true);
                    }
                });
            }
        } 
        else {
            const resetPasswordForm = document.getElementById("reset_password_form");
            if (resetPasswordForm) {
                resetPasswordForm.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    const emailValue = resetPasswordForm.querySelector("#email").value;

                    if (checkIsEmptyValue(emailValue)) {
                        setErrorMessage(errorElement, "Все поля обязательные", true);
                        return;
                    }

                    if (!isCorrectEmail(emailValue)) {
                        setErrorMessage(errorElement, "Некорректный email", true);
                        return;
                    }

                    setErrorMessage(errorElement, "", false);
                    
                    try {
                        const response = await sendPostRequest("./includes/ResetPassword.inc.php", {
                            login: emailValue
                        });

                        if (response?.success) {
                            saveToLocalStorage("message", "Письмо с инструкциями отправлено на вашу почту");
                            window.location.href = "#login";
                        } else {
                            setErrorMessage(errorElement, response?.error || "Ошибка сервера", true);
                        }
                    } catch (error) {
                        console.error('Password reset request error:', error);
                        setErrorMessage(errorElement, "Ошибка соединения", true);
                    }
                });
            }
        }
    }

    async setupTasksForm() {
        const tasksContainer = document.querySelector('.tasks-list');
        const filter_value = document.getElementById('task-filter').value;
        const user_data = await sendPostRequest('./includes/getUserName.inc.php');
        const name = user_data.name;
        document.getElementById('user-name').textContent = name;
        console.log(name);
    
        sendPostRequest("./includes/getTasks.inc.php", {filter: filter_value}).then(tasks => {
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
                    <a href="#edit-task?id=${task.id}" class="edit-btn">Edit</a>                <form class="delete-task-form">
                    <input type="hidden" name="task_id" value="${task.id}">
                    <button type="submit" class="delete-btn">Delete</button>
                </form>
            </div>
        `;

        return taskElement;
    }

    setupTaskEventHandlers() {
        document.getElementById('task-filter').addEventListener('change', async (e) =>{
            this.showTasks();
        });
        const form = document.getElementById('add-task-form');
        form.removeEventListener('submit', form.submitHandler);

        document.getElementById('add-task-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const form = document.getElementById('add-task-form');
            const formData = new FormData(form);
            const formDataObj = Object.fromEntries(formData.entries());
            
            console.log('Form data:', formDataObj);
            
            if (!formDataObj.task_title?.trim() || !formDataObj.task_title?.trimStart()) {
                alert('Пустое название или название из одних проблеов');
                return;
            }

            try {
                const response = await sendPostRequest('./includes/addTask.inc.php', formDataObj);
                console.log('Server response:', response);
                
                if (!response.success) {
                    throw new Error(response.message || 'Add task failed');
                }
                
                this.showTasks(); 
                const url = new URL(window.location.href);
                url.searchParams.delete('token');
                url.hash = "#login";
                window.location.href = url.toString();
                form.reset(); 
            } catch (error) {
                console.error('Error adding task:', error);
                alert(`Error: ${error.message}`);
            }
        });

        document.querySelectorAll('.toggle-task-form').forEach(form => {
            form.addEventListener('change', async (e) => {
                const formData = new FormData(form);
                const formDataObj = Object.fromEntries(formData.entries());
                console.log(formDataObj);
                try {
                    const response = await sendPostRequest('./includes/toggleTask.inc.php', formDataObj);
                    if (!response.success) throw new Error('Toggle failed');
                    this.showTasks(); 
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
                    this.showTasks();
                } catch (error) {
                    console.error('Error deleting task:', error);
                }
            });
        });
    }

    async setupEditTaskForm(taskId) {
        try {
            const response = await sendPostRequest('./includes/getTask.inc.php', { task_id: taskId });
            
            if (!response.success) {
                throw new Error(response.message || 'Failed to load task');
            }
            
            const task = response.task;
            const form = document.getElementById('edit-task-form');
            
            form.elements.task_title.value = task.title;
            form.elements.task_description.value = task.description || '';
            form.elements.due_date.value = task.due_date || '';
            form.elements.priority.value = task.priority || 'medium';
            
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const formData = new FormData(form);
                const formDataObj = Object.fromEntries(formData.entries());
                formDataObj.task_id = taskId;
                
                const title = formDataObj.task_title
                console.log(title);
                if(!title.trimStart() || !title.trim()){
                    alert('Пустое название');
                    return;
                }
                try {
                    const saveResponse = await sendPostRequest('./includes/updateTask.inc.php', formDataObj);
                    
                    if (!saveResponse.success) {
                        throw new Error(saveResponse.message || 'Failed to update task');
                    }
                    
                    window.location.hash = 'tasks';
                } catch (error) {
                    console.error('Error updating task:', error);
                    alert(`Error: ${error.message}`);
                }
            });
            
        } catch (error) {
            console.error('Error loading task:', error);
            alert(`Error: ${error.message}`);
            window.location.hash = 'tasks';
        }
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
    try {
        const response = await fetch('./includes/isAuth.inc.php');
        const data = await response.json();
        console.log(data.is_auth);
        return data.is_auth;
    } catch (error) {
        console.error('Auth check failed:', error);
        return null;
    }
}


new Router();