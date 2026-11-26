from datetime import datetime
import os

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User
from app.schemas.profile import ProfileResponse, ProfileUpdate


router = APIRouter(prefix="/users", tags=["User Profile"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")


# ==========================================
# DATABASE DEPENDENCY
# ==========================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==========================================
# AUTHENTICATED USER
# ==========================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    if not SECRET_KEY:
        raise HTTPException(
            status_code=500,
            detail="JWT secret key is not configured."
        )

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token."
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token."
        )

    user = db.query(User).filter(
        User.id == int(user_id)
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found."
        )

    return user


# ==========================================
# GET MY PROFILE
# ==========================================

@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user)
):
    return current_user


# ==========================================
# UPDATE MY PROFILE
# ==========================================

@router.put("/me", response_model=ProfileResponse)
def update_my_profile(
    request: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    update_data = request.model_dump(exclude_unset=True)

    # Update name
    if "name" in update_data:
        if not update_data["name"] or not update_data["name"].strip():
            raise HTTPException(
                status_code=400,
                detail="Name cannot be empty."
            )

        current_user.name = update_data["name"].strip()

    # Update phone number
    if "phone_number" in update_data:
        current_user.phone_number = update_data["phone_number"]

    # Update address
    if "address" in update_data:
        current_user.address = update_data["address"]

    # Update profile picture
    if "profile_picture" in update_data:
        current_user.profile_picture = update_data["profile_picture"]

    current_user.updated_at = datetime.utcnow()

    try:
        db.commit()
        db.refresh(current_user)

    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to update profile."
        )

    return current_user