from pydantic import BaseModel, ConfigDict, Field


class FoodItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None
    price: float
    is_available: bool


class ShopResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    description: str | None = None
    category: str
    address: str
    latitude: float
    longitude: float
    is_active: bool
    items: list[FoodItemResponse] = Field(default_factory=list)