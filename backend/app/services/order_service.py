
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
# Discount price
PROMO_CODES = {
    "WELCOME10": {
        "type": "percentage",
        "value": 10,
        "minimum": 0,
    },
    "SAVE5": {
        "type": "fixed",
        "value": 5,
        "minimum": 20,
    },
    "FOOD20": {
        "type": "percentage",
        "value": 20,
        "minimum": 30,
    },
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
# Validate and calculate promo code discount

        promo_code = (
            order_data.promo_code.strip().upper()
            if order_data.promo_code
            else None
        )

        discount_amount = 0.0

        if promo_code:
            promo = PROMO_CODES.get(promo_code)

            if not promo:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid promo code."
                )

            if total_amount < promo["minimum"]:
                raise HTTPException(
                    status_code=400,
                    detail=f"Minimum order amount is ${promo['minimum']}."
                )

            if promo_code == "WELCOME10":
                previous_orders = (
                    db.query(Order)
                    .filter(
                        Order.customer_key == order_data.customer_key
                    )
                    .count()
                )

                if previous_orders > 0:
                    raise HTTPException(
                        status_code=400,
                        detail="WELCOME10 is only for first-time customers."
                    )

            if promo["type"] == "percentage":
                discount_amount = total_amount * promo["value"] / 100
            else:
                discount_amount = promo["value"]

            discount_amount = min(
                round(discount_amount, 2),
                total_amount
            )

        final_total = round(total_amount - discount_amount, 2)

        new_order = Order(
            customer_key=order_data.customer_key,
            customer_name=order_data.customer_name,
            phone_number=order_data.phone_number,
            delivery_address=order_data.delivery_address,
            payment_method=order_data.payment_method,
   promo_code=promo_code,
   discount_amount=discount_amount,
   total_amount=final_total,
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
