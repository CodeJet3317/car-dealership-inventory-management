import { initAuth } from "./auth.js";
import { fetchAndRenderVehicles, handleSearch, handleAddVehicle } from "./vehicles.js";

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    const email = localStorage.getItem("email");

    if (token) {
        setDashboardState(role, email);
        fetchAndRenderVehicles();
    }

    // Initialize Auth Listeners
    initAuth(
        (userRole, userEmail) => {
            setDashboardState(userRole, userEmail);
            fetchAndRenderVehicles();
        },
        () => {
            setLoggedOutState();
        }
    );

    // Initialize Search & Add Vehicle Listeners
    document.getElementById("search-btn").addEventListener("click", handleSearch);
    document.getElementById("add-vehicle-form").addEventListener("submit", handleAddVehicle);
});

function setDashboardState(role, email) {
    document.getElementById("auth-section").classList.add("hidden");
    document.getElementById("dashboard-section").classList.remove("hidden");

    const userInfo = document.getElementById("user-info");
    userInfo.innerText = `Signed in as: ${email} (${role})`;
    userInfo.classList.remove("hidden");

    document.getElementById("logout-btn").classList.remove("hidden");

    if (role === "ADMIN") {
        document.getElementById("admin-panel").classList.remove("hidden");
    }
}

function setLoggedOutState() {
    document.getElementById("auth-section").classList.remove("hidden");
    document.getElementById("dashboard-section").classList.add("hidden");
    document.getElementById("user-info").classList.add("hidden");
    document.getElementById("logout-btn").classList.add("hidden");
    document.getElementById("admin-panel").classList.add("hidden");
}