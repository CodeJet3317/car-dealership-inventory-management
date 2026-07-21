"""
Database Connection Diagnostic Test Script
-------------------------------------------
Simple standalone test script to verify connection to the MySQL database
server using PyMySQL connection credentials configured in the environment.
"""

from app.database import get_db_connection

def test_connection():
    """
    Executes a simple 'SELECT 1' ping query against the database
    to confirm connectivity, authentication, and SQL execution.
    """
    connection = None
    try:
        # Establish database connection using database.py helper
        connection = get_db_connection()
        
        # Execute test ping query
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1 AS result;")
            result = cursor.fetchone()
            print("Database connection successful! Result:", result["result"])
            
    except Exception as e:
        # Print failure output with specific error details
        print("Database connection failed:", e)
        
    finally:
        # Ensure database connection is safely closed
        if connection:
            connection.close()

if __name__ == "__main__":
    # Execute script standalone
    test_connection()