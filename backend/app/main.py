from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.shops import router as shops_router
from app.api.orders import router as orders_router
from app.api.auth import router as auth_router

# Import model so SQLAlchemy registers the User table
from app.models.user import User

from app.database import Base, engine


app = FastAPI(
    title="Backyard Shopping System API",
    description="API for the Backyard Shopping System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register existing routes
app.include_router(shops_router)
app.include_router(orders_router)

# Register authentication routes
app.include_router(auth_router)


@app.on_event("startup")
def create_tables():
    Base.metadata.create_all(bind=engine)


@app.get("/")
def home():
    return {
        "message": "Backyard Shopping System API is running"
    }


@app.get("/health")
def health():
    return {"status": "healthy"}