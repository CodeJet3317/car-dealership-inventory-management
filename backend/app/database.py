"""
Database utility module for the Car Dealership Inventory System.

Manages raw PyMySQL connections, initializes database tables schema on startup,
and seeds initial administrative credentials.
"""

import os
import uuid
import pymysql
from dotenv import load_dotenv
from passlib.context import CryptContext

# Load environment variables from local .env file
load_dotenv()

# Password hashing context configured to use bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db_connection():
    """
    Establishes and returns a direct MySQL database connection using PyMySQL.
    Reads connection parameters (host, user, password, database, port) from environment variables.
    
    Returns:
        pymysql.connections.Connection: PyMySQL connection with dictionary cursor support.
    """
    return pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "root"),
        database=os.getenv("DB_NAME", "car_dealership_db"),
        port=int(os.getenv("DB_PORT", 3306)),
        cursorclass=pymysql.cursors.DictCursor
    )

def init_db():
    """
    Automatically creates required MySQL relational tables on application startup if they do not exist.
    
    Tables created:
    - users: Stores user authentication details, roles (USER/ADMIN), and force-reset flags.
    - vehicles: Stores vehicle inventory including make, model, category, price, and available stock quantity.
    - orders: Stores purchase order records linking user emails, vehicle IDs, purchase quantity, and total cost.
    """
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Table 1: Users table schema definition
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id VARCHAR(36) PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(50) NOT NULL,
                    must_reset BOOLEAN DEFAULT FALSE
                )
            """)
            
            # Migration check: ensure 'must_reset' column exists if table was created in an older schema version
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN must_reset BOOLEAN DEFAULT FALSE")
            except Exception:
                pass  # Column already exists, safe to ignore exception

            # Table 2: Vehicles table schema definition
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS vehicles (
                    id VARCHAR(36) PRIMARY KEY,
                    make VARCHAR(100) NOT NULL,
                    model VARCHAR(100) NOT NULL,
                    category VARCHAR(100) NOT NULL,
                    price DECIMAL(10, 2) NOT NULL,
                    quantity INT NOT NULL
                )
            """)

            # Table 3: Orders table schema definition
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS orders (
                    id VARCHAR(36) PRIMARY KEY,
                    user_email VARCHAR(255) NOT NULL,
                    vehicle_id VARCHAR(36) NOT NULL,
                    quantity INT NOT NULL,
                    total_price DECIMAL(10, 2) NOT NULL
                )
            """)
        connection.commit()
    finally:
        connection.close()

def seed_default_admin():
    """
    Automatically provisions a default admin user ('admin@gmail.com' with password 'admin') if none exists.
    If the account already exists with default credentials, forces 'must_reset' to TRUE until updated.
    """
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Query existing admin account details
            cursor.execute("SELECT id, role, password, must_reset FROM users WHERE email = %s", ("admin@gmail.com",))
            admin_user = cursor.fetchone()
            
            if not admin_user:
                # Provision new default admin account with initial credentials
                admin_id = str(uuid.uuid4())
                hashed_password = pwd_context.hash("admin")
                
                cursor.execute(
                    "INSERT INTO users (id, email, password, role, must_reset) VALUES (%s, %s, %s, %s, %s)",
                    (admin_id, "admin@gmail.com", hashed_password, "ADMIN", True)
                )
                connection.commit()
            else:
                # If default password is still active, ensure admin role and force credential reset flag
                is_default_pass = pwd_context.verify("admin", admin_user["password"])
                if is_default_pass or admin_user.get("role") != "ADMIN" or not admin_user.get("must_reset"):
                    cursor.execute(
                        "UPDATE users SET role = %s, must_reset = %s WHERE email = %s",
                        ("ADMIN", True, "admin@gmail.com")
                    )
                    connection.commit()
    finally:
        connection.close()