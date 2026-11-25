
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    
    customer_key = Column(String(36), nullable=True, index=True)

    customer_name = Column(String(150), nullable=False)
    phone_number = Column(String(30), nullable=False)

    delivery_address = Column(String(500), nullable=False)

    payment_method = Column(String(50), nullable=False)

    promo_code = Column(String(50), nullable=True)
    
    discount_amount = Column(Float, nullable=False, default=0.0)

    total_amount = Column(Float, nullable=False)

    status = Column(
        String(50),
        nullable=False,
        default="Pending"
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    items = relationship(
        "OrderItem",
        back_populates="order",
        cascade="all, delete-orphan"
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)

    order_id = Column(
        Integer,
        ForeignKey("orders.id"),
        nullable=False
    )

    item_name = Column(String(150), nullable=False)
    shop_name = Column(String(150), nullable=False)

    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)

    addons = Column(String(500), nullable=True)

    order = relationship(
        "Order",
        back_populates="items"
    )
