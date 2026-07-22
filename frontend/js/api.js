const API_BASE_URL = "http://localhost:8000/api";

export async function apiRequest(endpoint, method = "GET", data = null, requiresAuth = false) {
    const headers = { "Content-Type": "application/json" };

    if (requiresAuth) {
        const token = localStorage.getItem("token");
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    const config = { method, headers };
    if (data) config.body = JSON.stringify(data);

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Handle FastAPI validation error arrays vs standard string errors
            let errorMessage = "An error occurred with the API request.";
            if (errorData.detail) {
                if (Array.isArray(errorData.detail)) {
                    errorMessage = errorData.detail.map(err => err.msg).join(", ");
                } else if (typeof errorData.detail === "string") {
                    errorMessage = errorData.detail;
                }
            }

            throw new Error(errorMessage);
        }

        // Handle empty responses gracefully
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    } catch (error) {
        throw error;
    }
}