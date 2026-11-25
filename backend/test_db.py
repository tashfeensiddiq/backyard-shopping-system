from app.database import engine
from sqlalchemy import text


def test_database_connection():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
            print("MySQL connection successful!")

    except Exception as error:
        print("MySQL connection failed:")
        print(error)


if __name__ == "__main__":
    test_database_connection()