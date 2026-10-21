import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.db.database import init_db, SessionLocal
from backend.app.data_pipeline.ingestion import DataPipeline
from backend.app.api.router import api_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("football_scout")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure DB tables and seed initial demo data
    logger.info("Initializing Football Scout SQLite Database...")
    init_db()
    db = SessionLocal()
    try:
        pipeline = DataPipeline(db)
        res = pipeline.ensure_demo_data()
        logger.info(f"Database readiness status: {res}")
    finally:
        db.close()
    yield
    logger.info("Application shutdown.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Tactical Intelligence, Player Recommendation & ML System for Professional Football Clubs",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "health_url": f"{settings.API_V1_STR}/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
