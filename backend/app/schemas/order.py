
from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime


class OrderItemCreate(BaseModel):
    item_id: int
    quantity: int = Field(gt=0)
    addons: list[str] = Field(default_factory=list)


class OrderCreate(BaseModel):
    customer_key: str
    customer_name: str
    phone_number: str
    delivery_address: str
    payment_method: str
    items: list[OrderItemCreate] = Field(min_length=1)


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_name: str
    shop_name: str
    quantity: int
    unit_price: float
    addons: str | None = None


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    customer_key: str | None = None
    customer_name: str
    phone_number: str
    delivery_address: str
    payment_method: str
    total_amount: float
    status: str
    created_at: datetime
    items: list[OrderItemResponse] = Field(default_factory=list)


class OrderStatusUpdate(BaseModel):
    status: str
