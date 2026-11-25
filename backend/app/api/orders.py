
from fastapi import APIRouter, HTTPException
from sqlalchemy.orm import joinedload

from app.database import SessionLocal
from app.models.order import Order
from app.schemas.order import OrderCreate, OrderResponse
from app.services.order_service import create_order


router = APIRouter(prefix="/api/orders", tags=["Orders"])


@router.post("", response_model=OrderResponse)
def place_order(order_data: OrderCreate):
    return create_order(order_data)


@router.get("/{customer_key}", response_model=list[OrderResponse])
def get_customer_orders(customer_key: str):
    db = SessionLocal()

    try:
        orders = (
            db.query(Order)
            .options(joinedload(Order.items))
            .filter(Order.customer_key == customer_key)
            .order_by(Order.created_at.desc())
            .all()
        )

        return [
            OrderResponse.model_validate(order)
            for order in orders
        ]

    finally:
        db.close()
