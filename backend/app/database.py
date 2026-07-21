"""
Database Configuration & Connection Helper Module
-------------------------------------------------
Provides direct raw SQL database connection helper functions using PyMySQL.
Loads environment variables from .env file to construct database connections.
"""

import os
import pymysql
from dotenv import load_dotenv

# Load environment variables from .env file (searches current and parent directories)
load_dotenv()

def get_db_connection():
    """
    Establishes and returns a direct raw SQL MySQL connection using PyMySQL.
    
    Returns:
        pymysql.connections.Connection: Active database connection with DictCursor 
        so query results are returned as dictionary objects (key-value pairs).
    """
    return pymysql.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", "root"),
        database=os.getenv("DB_NAME", "car_dealership_db"),
        port=int(os.getenv("DB_PORT", 3306)),
        cursorclass=pymysql.cursors.DictCursor  # Format query results as Python dicts
    )