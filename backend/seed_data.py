# Import the database session factory
from app.database import SessionLocal

# Import the Shop and FoodItem database models
from app.models.shop import Shop
from app.models.food_item import FoodItem

# Create a database session to interact with the database
db = SessionLocal()

try:
    # Check how many shop records already exist in the database
    existing_shops = db.query(Shop).count()

    # Insert demo data only if no shop records exist
    if existing_shops == 0:

        # Create a demo boutique shop
        boutique = Shop(
            name="Demo Boutique Downtown",  # Set the shop name
            description="Sample fashion boutique.",  # Set the shop description
            category="Fashion",  # Set the shop category
            address="Downtown, St. John's, NL, Canada",  # Set the shop address
            latitude=47.5615,  # Set the shop's latitude
            longitude=-52.7126,  # Set the shop's longitude
            is_active=True  # Mark the shop as active
        )

        # Create a demo general shop
        general_shop = Shop(
            name="Demo Shop West",  # Set the shop name
            description="Sample local shop.",  # Set the shop description
            category="General",  # Set the shop category
            address="West End, St. John's, NL, Canada",  # Set the shop address
            latitude=47.5588,  # Set the shop's latitude
            longitude=-52.7350,  # Set the shop's longitude
            is_active=True  # Mark the shop as active
        )

        # Create a demo restaurant
        restaurant = Shop(
            name="Harbour Bites Restaurant",  # Set the restaurant name
            description="A demo restaurant serving popular meals.",  # Set the restaurant description
            category="Restaurant",  # Set the restaurant category
            address="East End, St. John's, NL, Canada",  # Set the restaurant address
            latitude=47.5740,  # Set the restaurant's latitude
            longitude=-52.6900,  # Set the restaurant's longitude
            is_active=True  # Mark the restaurant as active
        )

        # Add all three shop objects to the database session
        db.add_all([boutique, general_shop, restaurant])

        # Flush the pending changes to the database
        # This generates the restaurant ID needed for the food items
        db.flush()

        # Create a list of demo food items associated with the restaurant
        food_items = [
            # Create a beef burger menu item
            FoodItem(shop_id=restaurant.id, name="Classic Beef Burger",
                     description="Beef burger", price=12.99),

            # Create a chicken burger menu item
            FoodItem(shop_id=restaurant.id, name="Chicken Burger",
                     description="Chicken burger", price=11.99),

            # Create a Margherita pizza menu item
            FoodItem(shop_id=restaurant.id, name="Margherita Pizza",
                     description="Classic cheese pizza", price=14.99),

            # Create a chicken pizza menu item
            FoodItem(shop_id=restaurant.id, name="Chicken Pizza",
                     description="Chicken pizza", price=16.99),

            # Create a fish and chips menu item
            FoodItem(shop_id=restaurant.id, name="Fish and Chips",
                     description="Fish with fries", price=15.99),

            # Create a poutine menu item
            FoodItem(shop_id=restaurant.id, name="Poutine",
                     description="Fries with cheese curds and gravy",
                     price=9.99),

            # Create a French fries menu item
            FoodItem(shop_id=restaurant.id, name="French Fries",
                     description="Crispy fries", price=5.99),

            # Create a soft drinks menu item
            FoodItem(shop_id=restaurant.id, name="Soft Drinks",
                     description="Assorted soft drinks", price=2.99),
        ]

        # Add all food items to the database session
        db.add_all(food_items)

        # Commit all pending changes to permanently save them
        db.commit()

        # Display a success message after the data has been inserted
        print("Demo shops and food items inserted successfully!")

    else:
        # Display a message if shop records already exist
        print("Shop records already exist. No data inserted.")

# Handle any exception that occurs during database operations
except Exception:
    # Roll back the transaction if an error occurs
    db.rollback()

    # Re-raise the exception so the error is not silently ignored
    raise

# Always execute this block, regardless of success or failure
finally:
    # Close the database session to release database resources
    db.close()
