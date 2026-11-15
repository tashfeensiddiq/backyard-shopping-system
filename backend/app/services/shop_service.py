from app.schemas.shop import Shop

DEMO_SHOPS = [
    Shop(
        id=1,
        name="Demo Boutique Downtown",
        description="Sample fashion boutique.",
        category="Fashion",
        address="Downtown, St. John's, NL, Canada",
        latitude=47.5615,
        longitude=-52.7126,
        is_active=True,
    ),
    Shop(
        id=2,
        name="Demo Shop West",
        description="Sample local shop.",
        category="General",
        address="West End, St. John's, NL, Canada",
        latitude=47.5588,
        longitude=-52.7350,
        is_active=True,
    ),
    Shop(
        id=3,
        name="Harbour Bites Restaurant",
        description="A demo restaurant serving popular meals.",
        category="Restaurant",
        address="East End, St. John's, NL, Canada",
        latitude=47.5740,
        longitude=-52.6900,
        is_active=True,
        items=[
            "Classic Beef Burger - $12.99",
            "Chicken Burger - $11.99",
            "Margherita Pizza - $14.99",
            "Chicken Pizza - $16.99",
            "Fish and Chips - $15.99",
            "Poutine - $9.99",
            "French Fries - $5.99",
            "Soft Drinks - $2.99",
        ],
    ),
]


def get_active_shops() -> list[Shop]:
    return [shop for shop in DEMO_SHOPS if shop.is_active]