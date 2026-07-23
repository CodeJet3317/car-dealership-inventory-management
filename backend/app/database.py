import os
import uuid
import pymysql
from dotenv import load_dotenv
from passlib.context import CryptContext

# Load environment variables from .env file
load_dotenv()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_db_connection():
    """
    Establishes and returns a direct raw SQL MySQL connection using PyMySQL.
    Supports local .env variables as well as Railway's native MYSQL_ variables.
    """
    return pymysql.connect(
        host=os.getenv("DB_HOST", os.getenv("MYSQLHOST", "localhost")),
        user=os.getenv("DB_USER", os.getenv("MYSQLUSER", "root")),
        password=os.getenv("DB_PASSWORD", os.getenv("MYSQLPASSWORD", "root")),
        database=os.getenv("DB_NAME", os.getenv("MYSQLDATABASE", "car_dealership_db")),
        port=int(os.getenv("DB_PORT", os.getenv("MYSQLPORT", 3306))),
        cursorclass=pymysql.cursors.DictCursor
    )

def init_db():
    """
    Automatically creates required MySQL tables on startup if they do not exist.
    """
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            # Users table
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id VARCHAR(36) PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password VARCHAR(255) NOT NULL,
                    role VARCHAR(50) NOT NULL,
                    must_reset BOOLEAN DEFAULT FALSE
                )
            """)
            
            # Migration check: ensure must_reset column exists if table was created previously
            try:
                cursor.execute("ALTER TABLE users ADD COLUMN must_reset BOOLEAN DEFAULT FALSE")
            except Exception:
                pass  # Column already exists

            # Vehicles table
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
            # Orders table
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
    Automatically provisions a default admin user if none exists, or updates role to ADMIN.
    Sets must_reset to TRUE for default admin until credentials are updated.
    """
    connection = get_db_connection()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT id, role, password, must_reset FROM users WHERE email = %s", ("admin@gmail.com",))
            admin_user = cursor.fetchone()
            
            if not admin_user:
                admin_id = str(uuid.uuid4())
                hashed_password = pwd_context.hash("admin")
                
                cursor.execute(
                    "INSERT INTO users (id, email, password, role, must_reset) VALUES (%s, %s, %s, %s, %s)",
                    (admin_id, "admin@gmail.com", hashed_password, "ADMIN", True)
                )
                connection.commit()
            else:
                is_default_pass = pwd_context.verify("admin", admin_user["password"])
                if is_default_pass or admin_user.get("role") != "ADMIN" or not admin_user.get("must_reset"):
                    cursor.execute(
                        "UPDATE users SET role = %s, must_reset = %s WHERE email = %s",
                        ("ADMIN", True, "admin@gmail.com")
                    )
                    connection.commit()
    finally:
        connection.close()