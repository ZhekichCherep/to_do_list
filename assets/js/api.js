export async function sendPostRequest(url, data){
    const response = await fetch(url, {
        method: "POST", 
        headers: {"Content-Type": "application/x-www-form-urlencoded"}, 
        body: new URLSearchParams(data), 
    });
    return await response.json();
}

export function saveToLocalStorage(key, value){
    localStorage.setItem(key, value);
}

export function getFromLocalStorage(key){
    return localStorage.getItem(key);
}