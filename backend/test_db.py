# Import the database engine
from app.database import engine

# Import text to execute raw SQL statements
from sqlalchemy import text


# Define a function to test the database connection
def test_database_connection():
    try:
        # Establish a connection to the database using the engine
        with engine.connect() as connection:

            # Execute a simple SQL query to verify the connection
            connection.execute(text("SELECT 1"))

            # Print a success message if the query executes successfully
            print("MySQL connection successful!")

    # Catch any exception that occurs during the connection or query execution
    except Exception as error:

        # Print a message indicating that the connection failed
        print("MySQL connection failed:")

        # Print the specific error details for troubleshooting
        print(error)


# Check whether this file is being run directly rather than imported
if __name__ == "__main__":

    # Call the database connection test function
    test_database_connection()