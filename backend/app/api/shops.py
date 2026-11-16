from fastapi import APIRouter
from app.schemas.shop import ShopResponse
from app.services.shop_service import get_active_shops

router = APIRouter(prefix="/api/shops", tags=["Shops"])


@router.get("", response_model=list[ShopResponse])
def list_shops():
    return get_active_shops()