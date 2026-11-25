
import json

from fastapi import HTTPException
from sqlalchemy.orm import joinedload

from app.database import SessionLocal
from app.models.food_item import FoodItem
from app.models.shop import Shop
from app.models.order import Order, OrderItem
from app.schemas.order import OrderCreate, OrderResponse


# Allowed add-ons and their prices
ADDON_PRICES = {
    "Extra Sauce": 0.50,
    "Mayonnaise": 0.50,
    "Black Pepper": 0.25,
    "Sriracha Sauce": 0.75,
    "Extra Cheese": 1.00,
}


def create_order(order_data: OrderCreate) -> OrderResponse:
    db = SessionLocal()

    try:
        order_items = []
        total_amount = 0.0

        for item_data in order_data.items:
            food_item = (
                db.query(FoodItem)
                .join(Shop)
                .filter(
                    FoodItem.id == item_data.item_id,
                    FoodItem.is_available.is_(True),
                    Shop.is_active.is_(True)
                )
                .first()
            )

            if not food_item:
                raise HTTPException(
                    status_code=404,
                    detail=f"Food item {item_data.item_id} is unavailable."
                )

            addon_total = 0.0

            for addon in item_data.addons:
                if addon not in ADDON_PRICES:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Invalid add-on: {addon}"
                    )

                addon_total += ADDON_PRICES[addon]

            unit_price = food_item.price + addon_total
            item_total = unit_price * item_data.quantity
            total_amount += item_total

            order_items.append(
                OrderItem(
                    item_name=food_item.name,
                    shop_name=db.query(Shop.name)
                    .filter(Shop.id == food_item.shop_id)
                    .scalar(),
                    quantity=item_data.quantity,
                    unit_price=unit_price,
                    addons=json.dumps(item_data.addons)
                    if item_data.addons else None
                )
            )

        new_order = Order(
            customer_key=order_data.customer_key,
            customer_name=order_data.customer_name,
            phone_number=order_data.phone_number,
            delivery_address=order_data.delivery_address,
            payment_method=order_data.payment_method,
            total_amount=round(total_amount, 2),
            status="Pending",
            items=order_items
        )

        db.add(new_order)
        db.commit()

        saved_order = (
            db.query(Order)
            .options(joinedload(Order.items))
            .filter(Order.id == new_order.id)
            .first()
        )

        return OrderResponse.model_validate(saved_order)

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()
