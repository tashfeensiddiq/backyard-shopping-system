
from app.database import SessionLocal
from app.models.shop import Shop
from app.models.food_item import FoodItem

db = SessionLocal()

try:
    # Demo restaurants and their menus
    demo_restaurants = [
        {
            "name": "Italian Corner",
            "description": "Enjoy delicious Italian food and fresh pasta.",
            "category": "Restaurant",
            "address": "Central, St. John's, NL, Canada",
            "latitude": 47.5660,
            "longitude": -52.7100,
            "items": [
                ("Creamy Alfredo Pasta", "Pasta with creamy sauce", 15.99),
                ("Margherita Pizza", "Classic cheese pizza", 14.99),
                ("Garlic Bread", "Toasted garlic bread", 5.99),
                ("Lasagna", "Traditional baked lasagna", 16.99),
            ],
        },
        {
            "name": "Spice Garden",
            "description": "A demo restaurant serving flavorful meals.",
            "category": "Restaurant",
            "address": "West End, St. John's, NL, Canada",
            "latitude": 47.5590,
            "longitude": -52.7250,
            "items": [
                ("Chicken Biryani", "Spiced rice with chicken", 14.99),
                ("Butter Chicken", "Chicken in creamy tomato sauce", 16.99),
                ("Vegetable Curry", "Mixed vegetable curry", 12.99),
                ("Garlic Naan", "Freshly baked naan bread", 3.99),
            ],
        },
        {
            "name": "Pizza Planet",
            "description": "A demo pizza restaurant with tasty favorites.",
            "category": "Restaurant",
            "address": "East End, St. John's, NL, Canada",
            "latitude": 47.5730,
            "longitude": -52.7000,
            "items": [
                ("Pepperoni Pizza", "Pizza topped with pepperoni", 15.99),
                ("BBQ Chicken Pizza", "Chicken with BBQ sauce", 17.99),
                ("Cheese Pizza", "Classic cheese pizza", 12.99),
                ("French Fries", "Crispy golden fries", 5.99),
            ],
        },
    ]

    added_count = 0

    for data in demo_restaurants:
        # Check whether this restaurant already exists
        existing = db.query(Shop).filter(
            Shop.name == data["name"]
        ).first()

        if existing:
            print(f"{data['name']} already exists. Skipping.")
            continue

        # Create restaurant
        restaurant = Shop(
            name=data["name"],
            description=data["description"],
            category=data["category"],
            address=data["address"],
            latitude=data["latitude"],
            longitude=data["longitude"],
            is_active=True,
        )

        db.add(restaurant)
        db.flush()

        # Create its food menu
        for name, description, price in data["items"]:
            food = FoodItem(
                shop_id=restaurant.id,
                name=name,
                description=description,
                price=price,
            )
            db.add(food)

        added_count += 1
        print(f"Added {data['name']} with its menu.")

    db.commit()

    print(f"Finished! Added {added_count} new demo restaurants.")

except Exception as error:
    db.rollback()
    print("Error inserting demo restaurants:", error)
    raise

finally:
    db.close()
