
from sqlalchemy import Column, Integer, String, ForeignKey, UniqueConstraint
from app.database import Base


class FavoriteShop(Base):
    __tablename__ = "favorite_shops"

    id = Column(Integer, primary_key=True, index=True)

    browser_id = Column(String(36), nullable=False, index=True)

    shop_id = Column(
        Integer,
        ForeignKey("shops.id", ondelete="CASCADE"),
        nullable=False
    )

    __table_args__ = (
        UniqueConstraint(
            "browser_id",
            "shop_id",
            name="uq_browser_favorite_shop"
        ),
    )
