from app.database import SessionLocal
from app.models.shop import Shop
from app.models.food_item import FoodItem

db = SessionLocal()

try:
    existing_shops = db.query(Shop).count()

    if existing_shops == 0:
        boutique = Shop(
            name="Demo Boutique Downtown",
            description="Sample fashion boutique.",
            category="Fashion",
            address="Downtown, St. John's, NL, Canada",
            latitude=47.5615,
            longitude=-52.7126,
            is_active=True
        )

        general_shop = Shop(
            name="Demo Shop West",
            description="Sample local shop.",
            category="General",
            address="West End, St. John's, NL, Canada",
            latitude=47.5588,
            longitude=-52.7350,
            is_active=True
        )

        restaurant = Shop(
            name="Harbour Bites Restaurant",
            description="A demo restaurant serving popular meals.",
            category="Restaurant",
            address="East End, St. John's, NL, Canada",
            latitude=47.5740,
            longitude=-52.6900,
            is_active=True
        )

        db.add_all([boutique, general_shop, restaurant])
        db.flush()

        food_items = [
            FoodItem(shop_id=restaurant.id, name="Classic Beef Burger",
                     description="Beef burger", price=12.99),
            FoodItem(shop_id=restaurant.id, name="Chicken Burger",
                     description="Chicken burger", price=11.99),
            FoodItem(shop_id=restaurant.id, name="Margherita Pizza",
                     description="Classic cheese pizza", price=14.99),
            FoodItem(shop_id=restaurant.id, name="Chicken Pizza",
                     description="Chicken pizza", price=16.99),
            FoodItem(shop_id=restaurant.id, name="Fish and Chips",
                     description="Fish with fries", price=15.99),
            FoodItem(shop_id=restaurant.id, name="Poutine",
                     description="Fries with cheese curds and gravy",
                     price=9.99),
            FoodItem(shop_id=restaurant.id, name="French Fries",
                     description="Crispy fries", price=5.99),
            FoodItem(shop_id=restaurant.id, name="Soft Drinks",
                     description="Assorted soft drinks", price=2.99),
        ]


        db.add_all(food_items)
        db.commit()

        print("Demo shops and food items inserted successfully!")

    else:
        print("Shop records already exist. No data inserted.")

except Exception:
    db.rollback()
    raise

finally:
    db.close()