import secrets
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    VerifyEmailRequest,
    LoginRequest,
    TokenResponse,
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


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
# REGISTER
# ==========================================

@router.post("/register")
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    email = request.email.lower().strip()

    # Check whether the email already exists
    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email is already registered."
        )

    # Generate a 6-digit verification code
    verification_code = f"{secrets.randbelow(1000000):06d}"

    # Create new user
    user = User(
        name=request.name.strip(),
        email=email,
        password_hash=hash_password(request.password),
        is_verified=False,
        verification_code=verification_code,
        verification_expires_at=datetime.utcnow() + timedelta(minutes=10),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    # Development verification
    # The code is printed in the backend terminal instead of sending an email.
    print("\n" + "=" * 50)
    print("BACKYARD SHOPPING EMAIL VERIFICATION")
    print(f"Email: {email}")
    print(f"Verification Code: {verification_code}")
    print("=" * 50 + "\n")

    return {
        "message": "Registration successful. Check the backend terminal for your verification code.",
        "email": email
    }


# ==========================================
# VERIFY EMAIL
# ==========================================

@router.post("/verify-email")
def verify_email(
    request: VerifyEmailRequest,
    db: Session = Depends(get_db)
):
    email = request.email.lower().strip()

    # Find user
    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    # Check verification status
    if user.is_verified:
        return {
            "message": "Email is already verified."
    }

    # Check whether a verification code exists
    if not user.verification_code:
        raise HTTPException(
            status_code=400,
            detail="No verification code available."
        )

    # Check expiration timestamp
    if not user.verification_expires_at:
        raise HTTPException(
            status_code=400,
            detail="Verification expiration is missing."
        )

    # Check expiration
    if datetime.utcnow() > user.verification_expires_at:
        raise HTTPException(
            status_code=400,
            detail="Verification code expired. Please register again."
        )

    # Validate verification code
    if request.code != user.verification_code:
        raise HTTPException(
            status_code=400,
            detail="Invalid verification code."
        )

    # Mark user as verified
    user.is_verified = True
    user.verification_code = None
    user.verification_expires_at = None

    db.commit()

    return {
        "message": "Email verified successfully."
    }


# ==========================================
# LOGIN
# ==========================================

@router.post("/login", response_model=TokenResponse)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    email = request.email.lower().strip()

    # Find user
    user = db.query(User).filter(
        User.email == email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    # Verify password
    if not verify_password(
        request.password,
        user.password_hash
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    # Require email verification
    if not user.is_verified:
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in."
        )

    # Generate JWT token
    access_token = create_access_token(user.id)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "is_verified": user.is_verified
        }
    }