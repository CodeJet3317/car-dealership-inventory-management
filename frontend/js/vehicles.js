import { apiRequest } from "./api.js";

export async function fetchAndRenderVehicles(url = "/vehicles") {
    try {
        const vehicles = await apiRequest(url);
        renderVehicleGrid(vehicles);
    } catch (err) {
        console.error("Failed to fetch vehicles:", err);
    }
}

export async function handleSearch() {
    const make = document.getElementById("search-make").value;
    const category = document.getElementById("search-category").value;
    const maxPrice = document.getElementById("search-max-price").value;

    let query = `/vehicles/search?`;
    if (make) query += `make=${encodeURIComponent(make)}&`;
    if (category) query += `category=${encodeURIComponent(category)}&`;
    if (maxPrice) query += `max_price=${maxPrice}&`;

    fetchAndRenderVehicles(query);
}

export async function handleAddVehicle(e) {
    e.preventDefault();
    const make = document.getElementById("add-make").value;
    const model = document.getElementById("add-model").value;
    const category = document.getElementById("add-category").value;
    const price = parseFloat(document.getElementById("add-price").value);
    const quantity = parseInt(document.getElementById("add-quantity").value);

    try {
        await apiRequest("/vehicles", "POST", { make, model, category, price, quantity }, true);
        alert("Vehicle added successfully!");
        e.target.reset();
        fetchAndRenderVehicles();
    } catch (err) {
        alert("Failed to add vehicle: " + err.message);
    }
}

async function purchaseVehicle(id) {
    const qty = prompt("Enter quantity to purchase:", "1");
    if (!qty) return;

    try {
        await apiRequest(`/vehicles/${id}/purchase`, "POST", { quantity: parseInt(qty) }, true);
        alert("Purchase successful!");
        fetchAndRenderVehicles();
    } catch (err) {
        alert("Purchase failed: " + err.message);
    }
}

async function restockVehicle(id) {
    const qty = prompt("Enter quantity to restock:", "5");
    if (!qty) return;

    try {
        await apiRequest(`/vehicles/${id}/restock`, "POST", { quantity: parseInt(qty) }, true);
        alert("Restocked successfully!");
        fetchAndRenderVehicles();
    } catch (err) {
        alert("Restock failed: " + err.message);
    }
}

async function deleteVehicle(id) {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
        await apiRequest(`/vehicles/${id}`, "DELETE", null, true);
        alert("Vehicle deleted.");
        fetchAndRenderVehicles();
    } catch (err) {
        alert("Delete failed: " + err.message);
    }
}

function renderVehicleGrid(vehicles) {
    const grid = document.getElementById("vehicle-grid");
    const userRole = localStorage.getItem("role");
    grid.innerHTML = "";

    if (!vehicles || vehicles.length === 0) {
        grid.innerHTML = `<p class="text-gray-500 col-span-3 text-center py-4">No vehicles found.</p>`;
        return;
    }

    vehicles.forEach(v => {
        const id = v.id || v[0];
        const make = v.make || v[1];
        const model = v.model || v[2];
        const category = v.category || v[3];
        const price = v.price || v[4];
        const quantity = v.quantity || v[5];

        const card = document.createElement("div");
        card.className = "bg-white p-4 rounded-lg shadow-md flex flex-col justify-between";
        card.innerHTML = `
            <div>
                <div class="flex justify-between items-start">
                    <h4 class="font-bold text-lg text-gray-800">${make} ${model}</h4>
                    <span class="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-semibold">${category}</span>
                </div>
                <p class="text-gray-600 text-xl font-bold mt-2">$${parseFloat(price).toLocaleString()}</p>
                <p class="text-sm text-gray-500 mt-1">Stock Available: <span class="font-medium text-gray-700">${quantity}</span></p>
            </div>
            <div class="mt-4 space-y-2">
                <button class="purchase-btn w-full bg-green-600 text-white py-1.5 rounded hover:bg-green-700 text-sm font-medium" data-id="${id}">Purchase</button>
                ${userRole === 'ADMIN' ? `
                    <div class="flex gap-2">
                        <button class="restock-btn flex-1 bg-yellow-500 text-white py-1 rounded hover:bg-yellow-600 text-xs font-medium" data-id="${id}">Restock</button>
                        <button class="delete-btn flex-1 bg-red-500 text-white py-1 rounded hover:bg-red-600 text-xs font-medium" data-id="${id}">Delete</button>
                    </div>
                ` : ''}
            </div>
        `;

        // Attach event listeners cleanly
        card.querySelector(".purchase-btn").addEventListener("click", () => purchaseVehicle(id));
        if (userRole === 'ADMIN') {
            card.querySelector(".restock-btn").addEventListener("click", () => restockVehicle(id));
            card.querySelector(".delete-btn").addEventListener("click", () => deleteVehicle(id));
        }

        grid.appendChild(card);
    });
}