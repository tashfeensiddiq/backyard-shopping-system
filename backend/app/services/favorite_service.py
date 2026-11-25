
from app.database import SessionLocal
from app.models.favorite_shop import FavoriteShop
from app.models.shop import Shop


def get_favorite_shop_ids(browser_id: str) -> list[int]:
    db = SessionLocal()

    try:
        favorites = (
            db.query(FavoriteShop.shop_id)
            .filter(FavoriteShop.browser_id == browser_id)
            .all()
        )

        return [favorite.shop_id for favorite in favorites]

    finally:
        db.close()


def add_favorite_shop(browser_id: str, shop_id: int) -> bool:
    db = SessionLocal()

    try:
        shop = db.query(Shop).filter(Shop.id == shop_id).first()

        if shop is None:
            return False

        existing = (
            db.query(FavoriteShop)
            .filter(
                FavoriteShop.browser_id == browser_id,
                FavoriteShop.shop_id == shop_id
            )
            .first()
        )

        if existing is None:
            favorite = FavoriteShop(
                browser_id=browser_id,
                shop_id=shop_id
            )
            db.add(favorite)
            db.commit()

        return True

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()


def remove_favorite_shop(browser_id: str, shop_id: int) -> None:
    db = SessionLocal()

    try:
        db.query(FavoriteShop).filter(
            FavoriteShop.browser_id == browser_id,
            FavoriteShop.shop_id == shop_id
        ).delete(synchronize_session=False)

        db.commit()

    except Exception:
        db.rollback()
        raise

    finally:
        db.close()
