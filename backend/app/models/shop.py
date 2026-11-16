from sqlalchemy import Column, Integer, String, Boolean, Float
from app.database import Base


class Shop(Base):
    __tablename__ = "shops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(String(500))
    category = Column(String(100), nullable=False)
    address = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    is_active = Column(Boolean, default=True)