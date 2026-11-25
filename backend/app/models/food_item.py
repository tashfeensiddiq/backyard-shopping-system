from sqlalchemy import Column, Integer, String, Numeric, Boolean, ForeignKey
from app.database import Base


class FoodItem(Base):
    __tablename__ = "food_items"

    id = Column(Integer, primary_key=True, index=True)
    shop_id = Column(Integer, ForeignKey("shops.id"), nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(String(500))
    price = Column(Numeric(10, 2), nullable=False)
    is_available = Column(Boolean, default=True)