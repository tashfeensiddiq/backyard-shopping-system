
from fastapi import APIRouter, HTTPException

from app.services.favorite_service import (
    get_favorite_shop_ids,
    add_favorite_shop,
    remove_favorite_shop
)

router = APIRouter(prefix="/api/favorites", tags=["Favorites"])


@router.get("/{browser_id}")
def list_favorites(browser_id: str):
    try:
        favorite_ids = get_favorite_shop_ids(browser_id)

        return {
            "browser_id": browser_id,
            "favorite_shop_ids": favorite_ids
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to retrieve favorite shops"
        )


@router.post("/{browser_id}/{shop_id}")
def create_favorite(browser_id: str, shop_id: int):
    try:
        added = add_favorite_shop(browser_id, shop_id)

        if not added:
            raise HTTPException(
                status_code=404,
                detail="Shop not found"
            )

        return {
            "message": "Favorite shop added successfully",
            "shop_id": shop_id
        }

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to add favorite shop"
        )


@router.delete("/{browser_id}/{shop_id}")
def delete_favorite(browser_id: str, shop_id: int):
    try:
        remove_favorite_shop(browser_id, shop_id)

        return {
            "message": "Favorite shop removed successfully",
            "shop_id": shop_id
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Unable to remove favorite shop"
        )
