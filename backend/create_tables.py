from app.database import Base, engine
from app.models import Shop, FoodItem
from app.models.order import Order, OrderItem

def create_tables():
    try:
        Base.metadata.create_all(bind=engine)
        print("Database tables created successfully!")

    except Exception as e:
        print(f"Error creating database tables: {e}")

if __name__ == "__main__":
    create_tables()