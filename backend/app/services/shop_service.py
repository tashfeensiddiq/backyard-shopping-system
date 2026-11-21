from app.database import SessionLocal
from app.models.shop import Shop
from app.models.food_item import FoodItem
from app.schemas.shop import ShopResponse, FoodItemResponse


def get_active_shops() -> list[ShopResponse]:
    db = SessionLocal()

    try:
        shops = (
            db.query(Shop)
            .filter(Shop.is_active.is_(True))
            .all()
        )

        results = []

        for shop in shops:
            food_items = (
                db.query(FoodItem)
                .filter(
                    FoodItem.shop_id == shop.id,
                    FoodItem.is_available.is_(True)
                )
                .all()
            )

            results.append(
                ShopResponse(
                    id=shop.id,
                    name=shop.name,
                    description=shop.description,
                    category=shop.category,
                    address=shop.address,
                    latitude=shop.latitude,
                    longitude=shop.longitude,
                    is_active=shop.is_active,
                    items=[
                        FoodItemResponse.model_validate(item)
                        for item in food_items
                    ]
                )
            )

        return results

    finally:
        db.close()