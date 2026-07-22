import { apiRequest } from "./api.js";

export function initAuth(onLoginSuccess, onLogout) {
    const loginForm = document.getElementById("login-form");
    const registerForm = document.getElementById("register-form");
    const logoutBtn = document.getElementById("logout-btn");

    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;

        try {
            const data = await apiRequest("/auth/login", "POST", { email, password });
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("email", email);
            onLoginSuccess(data.role, email);
        } catch (err) {
            alert("Login Failed: " + err.message);
        }
    });

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("reg-email").value;
        const password = document.getElementById("reg-password").value;

        try {
            await apiRequest("/auth/register", "POST", { email, password });
            alert("Registration successful! Please login.");
            registerForm.reset();
        } catch (err) {
            alert("Registration Failed: " + err.message);
        }
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.clear();
        onLogout();
    });
}