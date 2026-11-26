from sqlalchemy import Column, Integer, String, Numeric, Boolean, ForeignKey  # Import column types
from app.database import Base  # Import the base model


class FoodItem(Base):  # Define the FoodItem model
    __tablename__ = "food_items"  # Set the table name

    id = Column(Integer, primary_key=True, index=True)  # Primary key
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)  # Linked shop ID
    name = Column(String(150), nullable=False)  # Food item name
    description = Column(String(500))  # Food item description
    price = Column(Numeric(10, 2), nullable=False)  # Food item price
    is_available = Column(Boolean, default=True)  # Availability status