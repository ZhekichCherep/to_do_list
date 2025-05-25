export function checkIsEmptyValue(...args){
    for(const arg of args){
        if(!arg){
            return true;
        }
    } 
    return false;
}

export function isCorrectEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function setErrorMessage(errorElement, message, visible){
    if (visible){
        errorElement.textContent = message;
        errorElement.style.display = "block";
    }
    else{
        errorElement.textContent = "";
        errorElement.style.display = "none";
    }
}

export function checkPassword(password) {
    const hasNumber = /\d/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const hasSpecialChar = /[^a-zA-Z0-9]/.test(password);
    
    return hasNumber && hasUpperCase && hasSpecialChar;
}