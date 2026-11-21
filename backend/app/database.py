import os
from dotenv import load_dotenv  # Load environment variables from the .env file
from sqlalchemy import create_engine, URL
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()   # Load the variables stored in .env

database_url = URL.create(      # Construct the database connection URL using environment variables
    drivername="mysql+pymysql",
    username=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    host=os.getenv("DB_HOST"),
    port=int(os.getenv("DB_PORT", "3306")),
    database=os.getenv("DB_NAME"),
)

engine = create_engine(     # Create the SQLAlchemy engine to manage database connections
    database_url,
    pool_pre_ping=True,
    echo=True
)

SessionLocal = sessionmaker(    # Configure a session factory for database operations
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()       # Create a base class for defining SQLAlchemy ORM models