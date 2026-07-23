# 🧪 Car Inventory Management System — Complete Test Documentation (`test.md`)

This document provides a detailed breakdown of all **18 Backend Integration & Diagnostic Unit Tests** and a summary of **Frontend Component & Compilation Verifications** for the Car Inventory Management System.

---

## 📊 Summary Table of All 18 Backend Tests

| # | Test Name | File | Purpose ("Why I Used It") | Solution & Verification ("How I Solved It") | Result |
|---|---|---|---|---|---|
| 1 | `test_1_register_user` | `test_auth.py` | Verify user account self-registration | Hashes password with bcrypt, inserts into MySQL `users` table, and returns `201 Created` with UUID. | **`PASSED`** |
| 2 | `test_duplicate_registration_conflict` | `test_auth.py` | Ensure duplicate email registrations are blocked | Intercepts duplicate email attempts, prevents SQL unique key conflicts, and returns `400/422 Bad Request`. | **`PASSED`** |
| 3 | `test_2_login_user` | `test_auth.py` | Verify user login & JWT token generation | Compares bcrypt hashes, returns signed JWT bearer token, user role (`USER`/`ADMIN`), and `must_reset` flag. | **`PASSED`** |
| 4 | `test_3_reset_credentials` | `test_auth.py` | Enforce credential reset permissions | Rejects non-admin users with `403 Forbidden` while allowing `ADMIN` users to update email & password with `200 OK`. | **`PASSED`** |
| 5 | `test_create_order_success` | `test_orders.py` | Verify vehicle purchasing & order creation | Calculates total price (`quantity * unit_price`), logs order record, and returns `201 Created`. | **`PASSED`** |
| 6 | `test_regular_user_cannot_add_vehicle` | `test_rbac.py` | Prevent regular users from creating inventory | Checks JWT role payload in FastAPI dependency and blocks non-admins with `403 Forbidden`. | **`PASSED`** |
| 7 | `test_admin_user_can_add_vehicle` | `test_rbac.py` | Allow authorized admins to add inventory | Validates `ADMIN` role in JWT token, creates new vehicle in database, and returns `201 Created`. | **`PASSED`** |
| 8 | `test_regular_user_cannot_delete_vehicle` | `test_rbac.py` | Protect vehicle inventory from unauthorized deletion | Blocks regular users attempting `DELETE /api/vehicles/{id}` with `403 Forbidden`. | **`PASSED`** |
| 9 | `test_regular_user_cannot_restock_vehicle` | `test_rbac.py` | Protect stock quantities from unauthorized restocking | Enforces RBAC check on `POST /api/vehicles/{id}/restock`, returning `403 Forbidden` for non-admins. | **`PASSED`** |
| 10 | `test_add_vehicle` | `test_vehicles.py` | Verify vehicle creation database persistence | Stores make, model, category, price, and quantity into MySQL `vehicles` table; returns `201 Created`. | **`PASSED`** |
| 11 | `test_get_vehicles` | `test_vehicles.py` | Verify public inventory listing API | Executes `SELECT * FROM vehicles` and returns a JSON list of available inventory with `200 OK`. | **`PASSED`** |
| 12 | `test_update_vehicle` | `test_vehicles.py` | Verify vehicle record updates | Updates existing vehicle parameters (`PUT /api/vehicles/{id}`) and returns updated vehicle object with `200 OK`. | **`PASSED`** |
| 13 | `test_delete_vehicle` | `test_vehicles.py` | Verify vehicle deletion from database | Executes `DELETE FROM vehicles WHERE id = %s` for admin requests and returns `200 OK`. | **`PASSED`** |
| 14 | `test_search_vehicles` | `test_vehicles.py` | Verify live search & multi-parameter filtering | Constructs dynamic SQL `WHERE` clauses for `make`, `category`, and price range, returning filtered lists. | **`PASSED`** |
| 15 | `test_restock_vehicle` | `test_vehicles.py` | Verify stock inventory incrementing | Increments vehicle stock (`quantity = quantity + add_amount`) and returns updated `new_quantity`. | **`PASSED`** |
| 16 | `test_purchase_vehicle_reduces_stock` | `test_vehicles.py` | Verify automatic stock reduction upon order | Decrements available stock upon purchase (e.g. 5 units - 2 purchased = 3 remaining) to prevent overselling. | **`PASSED`** |
| 17 | `test_purchase_out_of_stock_blocked` | `test_vehicles.py` | Block purchase attempts exceeding available stock | Checks current stock vs requested quantity and rejects excessive orders with `400 Bad Request`. | **`PASSED`** |
| 18 | `test_connection` | `test_db.py` | Verify MySQL database driver & connection pool | Runs a standalone `SELECT 1` ping query using PyMySQL driver to verify DB host, credentials, and SQL pool health. | **`PASSED`** |

---

## 🔍 Detailed In-Depth Breakdown of All 18 Backend Tests

### 🔐 Auth Test Suite ([`backend/app/__tests__/test_auth.py`](file:///c:/Users/acer/Downloads/Car%20Inventory%20Management/backend/app/__tests__/test_auth.py))

#### 1. `test_1_register_user`
* **Why I Used It:** To verify that the account registration endpoint (`POST /api/auth/register`) successfully creates a new user account with a securely hashed password in the MySQL database.
* **How I Solved It:** Used FastAPI's `TestClient` to post registration payload (`email`, `password`). The backend hashes the password using `passlib[bcrypt]`, inserts the record into MySQL, and returns `201 Created` containing a generated UUID and email.

#### 2. `test_duplicate_registration_conflict`
* **Why I Used It:** To ensure the system handles duplicate registration attempts gracefully without throwing raw database primary key / unique constraint exceptions.
* **How I Solved It:** Registered the test email a second time. The backend queries existing records before insertion and returns a clean `400` or `422 Bad Request` with an `"already registered"` detail message.

#### 3. `test_2_login_user`
* **Why I Used It:** To verify that valid credentials authenticate successfully and return a signed JWT token containing the user's role and forced password reset flags.
* **How I Solved It:** Sent login credentials to `POST /api/auth/login`. The endpoint verifies the bcrypt hash, generates a signed JWT token with `role` claims, and returns `token_type: "bearer"`, `role: "USER"`, and `must_reset: false`.

#### 4. `test_3_reset_credentials`
* **Why I Used It:** To enforce security requirements preventing regular users from calling credential reset endpoints while enabling admins to update credentials.
* **How I Solved It:** Tested `PUT /api/auth/reset-credentials` using a regular user token (verified `403 Forbidden`), and then tested with an `ADMIN` token (verified `200 OK` success).

---

### 🛒 Order Test Suite ([`backend/app/__tests__/test_orders.py`](file:///c:/Users/acer/Downloads/Car%20Inventory%20Management/backend/app/__tests__/test_orders.py))

#### 5. `test_create_order_success`
* **Why I Used It:** To verify that regular users can place vehicle purchase orders and that the system accurately calculates order price totals.
* **How I Solved It:** Created a vehicle record via admin fixture (price = $20,000, quantity = 5). Placed a user order for 2 units. The endpoint calculates `total_price = 20,000 * 2 = 40,000` and creates an order record with `201 Created`.

---

### 🛡️ RBAC Security Test Suite ([`backend/app/__tests__/test_rbac.py`](file:///c:/Users/acer/Downloads/Car%20Inventory%20Management/backend/app/__tests__/test_rbac.py))

#### 6. `test_regular_user_cannot_add_vehicle`
* **Why I Used It:** To ensure non-admin users cannot inject new vehicles into the dealership inventory.
* **How I Solved It:** Created a regular user token and attempted `POST /api/vehicles`. FastAPI's `require_admin` dependency inspects the JWT payload role and blocks the request with `403 Forbidden`.

#### 7. `test_admin_user_can_add_vehicle`
* **Why I Used It:** To confirm that users with the `ADMIN` role are authorized to manage inventory stock.
* **How I Solved It:** Inserted an admin record directly into the DB fixture, authenticated to get an admin JWT, and posted a vehicle creation payload. Verified `201 Created` response.

#### 8. `test_regular_user_cannot_delete_vehicle`
* **Why I Used It:** To prevent regular users from deleting existing dealership vehicle records.
* **How I Solved It:** Created a vehicle as admin, then attempted `DELETE /api/vehicles/{id}` using a regular user token. Verified `403 Forbidden` enforcement.

#### 9. `test_regular_user_cannot_restock_vehicle`
* **Why I Used It:** To ensure regular users cannot arbitrarily increase available inventory quantities.
* **How I Solved It:** Sent a `POST /api/vehicles/{id}/restock` request using a regular user token. Verified `403 Forbidden` enforcement.

---

### 🚗 Vehicle Inventory Test Suite ([`backend/app/__tests__/test_vehicles.py`](file:///c:/Users/acer/Downloads/Car%20Inventory%20Management/backend/app/__tests__/test_vehicles.py))

#### 10. `test_add_vehicle`
* **Why I Used It:** To test full database persistence for new vehicle records (make, model, category, price, quantity).
* **How I Solved It:** Sent a valid vehicle JSON object as admin to `POST /api/vehicles`. Verified the returned object contains the auto-generated UUID and matching parameters with `201 Created`.

#### 11. `test_get_vehicles`
* **Why I Used It:** To verify that the inventory listing endpoint is publicly accessible without requiring token headers.
* **How I Solved It:** Called `GET /api/vehicles` without authorization headers. Verified `200 OK` and returned data type as a JSON list.

#### 12. `test_update_vehicle`
* **Why I Used It:** To verify that admin users can edit existing vehicle parameters (such as model name, price, or stock count).
* **How I Solved It:** Created a vehicle, sent a `PUT /api/vehicles/{id}` payload with updated values, and verified the updated record returned `200 OK` with modified fields.

#### 13. `test_delete_vehicle`
* **Why I Used It:** To verify that admin users can purge obsolete vehicles from inventory.
* **How I Solved It:** Created a vehicle record, executed `DELETE /api/vehicles/{id}` as admin, and verified `200 OK` confirmation.

#### 14. `test_search_vehicles`
* **Why I Used It:** To test multi-parameter search filtering (`make`, `category`, `min_price`, `max_price`).
* **How I Solved It:** Created test vehicle data and queried `GET /api/vehicles/search?make=Subaru&min_price=25000`. Verified that dynamic SQL filtering returns matching vehicle lists with `200 OK`.

#### 15. `test_restock_vehicle`
* **Why I Used It:** To verify that restocking adds new stock units to an existing vehicle's inventory count.
* **How I Solved It:** Created a vehicle with 2 initial units, posted `{ "quantity": 5 }` to `/restock` as admin, and verified `new_quantity == 7`.

#### 16. `test_purchase_vehicle_reduces_stock`
* **Why I Used It:** To ensure purchasing vehicles decrements remaining stock in MySQL to prevent overselling.
* **How I Solved It:** Created a vehicle with stock = 5, purchased 2 units as a regular user, and queried the inventory endpoint to confirm remaining stock equals 3.

#### 17. `test_purchase_out_of_stock_blocked`
* **Why I Used It:** To ensure purchase attempts exceeding available stock are rejected by the system.
* **How I Solved It:** Created a vehicle with stock = 1 and attempted to purchase 2 units. Verified `400 Bad Request` with an `"insufficient stock"` detail message.

---

### 🔌 Database Connection Diagnostic Test ([`backend/test_db.py`](file:///c:/Users/acer/Downloads/Car%20Inventory%20Management/backend/test_db.py))

#### 18. `test_connection`
* **Why I Used It:** Standalone diagnostic ping test to verify MySQL database connectivity, driver authentication, and connection pooling.
* **How I Solved It:** Connects to MySQL using PyMySQL, executes `SELECT 1 AS result;`, validates the result dict, and safely closes the connection pool.

---

## 🎨 Gist of Frontend Verifications (`frontend/src/`)

* **Compilation & Bundling:** All 1,791 modules compiled cleanly via Vite 8 in `562ms` with zero syntax or build errors (`dist/assets/index-DJlwCGas.js`).
* **Component Features:**
  * **[`Navbar.jsx`](file:///c:/Users/acer/Downloads/Car%20Inventory%20Management/frontend/src/components/Navbar.jsx):** Brand logo, Take Tour action button, Admin Reset Credentials modal, user email badge, and logout control.
  * **[`AuthForms.jsx`](file:///c:/Users/acer/Downloads/Car%20Inventory%20Management/frontend/src/components/AuthForms.jsx):** Single card toggling between Login and Registration views.
  * **[`VehicleSearch.jsx`](file:///c:/Users/acer/Downloads/Car%20Inventory%20Management/frontend/src/components/VehicleSearch.jsx):** Live filtering with floating auto-suggest dropdowns (`z-50`) and keyboard navigation (`↑`, `↓`, `Enter`).
  * **[`AddVehicleForm.jsx`](file:///c:/Users/acer/Downloads/Car%20Inventory%20Management/frontend/src/components/AddVehicleForm.jsx):** Admin vehicle entry with keyboard-navigable auto-suggest dropdowns (`z-40`).
  * **[`VehicleCard.jsx`](file:///c:/Users/acer/Downloads/Car%20Inventory%20Management/frontend/src/components/VehicleCard.jsx):** Support for both 3-column Grid View and horizontal List View, with Purchase, Restock, and Delete action controls.
  * **[`Pagination.jsx`](file:///c:/Users/acer/Downloads/Car%20Inventory%20Management/frontend/src/components/Pagination.jsx):** Customizable page size selector (5, 10, 20, 50, All) and page buttons.
  * **[`tour.js`](file:///c:/Users/acer/Downloads/Car%20Inventory%20Management/frontend/src/utils/tour.js):** Driver.js 5-step guided onboarding tour with compact `Skip ✕` button and single-show `localStorage` persistence.
