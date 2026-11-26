
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.shops import router as shops_router
from app.api.orders import router as orders_router
from app.api.auth import router as auth_router
from app.api.profile import router as profile_router

# Import model so SQLAlchemy registers the User table
from app.models.user import User

from app.database import Base, engine



# Initialize FastAPI application
app = FastAPI(
    title="Backyard Shopping System API",
    description="API for the Backyard Shopping System",
    version="1.0.0"
)


# Allowed frontend origins during development
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]


# Configure Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register API routers
app.include_router(shops_router)
app.include_router(orders_router)

# Register authentication routes
app.include_router(auth_router)

# Register user profile routes
app.include_router(profile_router)


@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)


# Root endpoint
@app.get("/")
def home():
    return {
        "message": "Backyard Shopping System API is running"
    }


# Basic health check
@app.get("/health")
def health():
    return {
        "status": "healthy",
        "service": "Backyard Shopping System API"
    }
