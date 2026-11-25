
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.shops import router as shops_router


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
