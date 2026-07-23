# 🏎️ Car Dealership Inventory & Operations Management System

A modern, full-stack web application designed for car dealerships to manage vehicle inventories, streamline sales orders, enforce Role-Based Access Control (RBAC), and deliver an intuitive user experience with live auto-suggest search, interactive product tours, and flexible pagination.

---

## 🌟 Key Features

### 👤 For Regular Users
* **Interactive Product Tour:** Powered by **Driver.js** to guide new users through key portal features with popover tooltips and a single-show preference save.
* **Live Auto-Suggest Search:** Real-time keyboard-navigable (`↑`, `↓`, `Enter`) search filtering by vehicle Make, Category, or Max Price.
* **Grid & List View Switchers:** Toggle between a 3-column card grid and a horizontal list layout, saved across sessions in `localStorage`.
* **Flexible Pagination:** Customize how many vehicles to view per page (5, 10, 20, 50, or All).
* **Instant Vehicle Ordering:** Place purchase orders with live cost calculations and automatic stock reduction.

### 🛡️ For Administrators
* **Complete Inventory CRUD:** Add, update, restock, or delete vehicle records with real-time feedback.
* **Smart Entry Dropdowns:** Auto-suggest inputs for Make, Model, and Category fields to prevent typos.
* **First-Login Force Password Reset:** Security policy enforcing email and password updates upon initial admin login.
* **Admin Credential Management:** On-demand credential reset available directly from the top navigation bar.

---

## 🏗️ Technology Stack

### **Backend**
* **Framework:** FastAPI (Python 3.10+)
* **Database:** MySQL with PyMySQL driver
* **Authentication:** JWT (JSON Web Tokens) with `passlib[bcrypt]` password hashing
* **Testing:** Pytest & FastAPI `TestClient` (18 unit/integration tests)

### **Frontend**
* **Framework:** React 19 & Vite 8
* **Styling:** Tailwind CSS & Lucide Icons
* **Guided Tour:** Driver.js v1

---

## 📷 Application Screenshots

### 1. Login & Registration Portal
<!-- Replace 'path/to/login_register_screenshot.png' with your screenshot file path -->
![Login & Registration Portal](p"C:\Users\acer\OneDrive\Pictures\Screenshots 1\Screenshot 2026-07-23 133122.png")

### 2. User Portal & Vehicle Inventory Dashboard
<!-- Replace 'path/to/user_portal_screenshot.png' with your screenshot file path -->
![User Portal Dashboard]("C:\Users\acer\OneDrive\Pictures\Screenshots 1\Screenshot 2026-07-23 133038.png")

### 3. Admin Portal & Inventory Management Controls
<!-- Replace 'path/to/admin_portal_screenshot.png' with your screenshot file path -->
![Admin Portal Controls]("C:\Users\acer\OneDrive\Pictures\Screenshots 1\Screenshot 2026-07-23 133111.png")

---

## 🚀 Local Setup & Installation Instructions

### Prerequisites
* **Python 3.10+** installed
* **Node.js 18+** & `npm` installed
* **MySQL Server** running locally or remotely

---

### 1. Database Setup
Create the MySQL database and run the initial table schema:

```sql
CREATE DATABASE IF NOT EXISTS car_dealership;
USE car_dealership;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'USER',
    must_reset BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
    id VARCHAR(36) PRIMARY KEY,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    vehicle_id VARCHAR(36) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);
```

---

### 2. Backend Setup & Local Server Execution

1. Navigate to the `backend/` directory:
   ```powershell
   cd backend
   ```

2. Create and activate a Virtual Environment:
   ```powershell
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. Install required Python packages:
   ```powershell
   pip install -r requirements.txt
   ```

4. Launch the FastAPI Development Server:
   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```
   * Access API Swagger Docs at: `http://localhost:8000/docs`

5. Run Backend Test Suite (18 Tests):
   ```powershell
   pytest
   ```

---

### 3. Frontend Setup & Local Execution

1. Navigate to the `frontend/` directory:
   ```powershell
   cd frontend
   ```

2. Install Node dependencies:
   ```powershell
   npm install
   ```

3. Start the Vite React Development Server:
   ```powershell
   npm run dev
   ```
   * Open app in browser at: `http://localhost:5173`

4. Verify Production Build:
   ```powershell
   npm run build
   ```

---

## 🤖 My AI Usage

This project was built in collaboration with **Antigravity (AI Agent)**. Below is a detailed account of how AI was leveraged across different development phases:

1. **Architecture & Refactoring:**
   * Transitioned the original plain HTML/JS UI into a modular, production-ready React 19 application powered by Vite and Tailwind CSS.
   * Structured global authentication state management using React Context API (`AuthContext.jsx`).

2. **Security & RBAC Enforcement:**
   * Designed JWT-based authorization middleware in FastAPI to restrict administrative actions (adding/editing/deleting vehicles, resetting credentials) strictly to `ADMIN` roles while returning `403 Forbidden` for unauthorized requests.

3. **User Experience & Feature Design:**
   * Implemented interactive auto-suggest input fields supporting arrow-key (`Up`/`Down`) navigation and `Enter` selection.
   * Integrated **Driver.js** onboarding tours with custom popovers and single-show persistence (`localStorage`).

4. **Testing & Quality Assurance:**
   * Developed 18 automated backend Pytest test cases covering registration, login, RBAC, inventory CRUD, search filtering, and database pooling.
   * Executed build verification scripts to guarantee 100% compilation cleanliness.
