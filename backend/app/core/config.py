import os
from pathlib import Path
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATA_DIR = BASE_DIR / "data"
RAW_DATA_DIR = DATA_DIR / "raw"
PROCESSED_DATA_DIR = DATA_DIR / "processed"
DEMO_DATA_DIR = DATA_DIR / "demo"
ARTIFACTS_DIR = DATA_DIR / "artifacts"

for directory in [DATA_DIR, RAW_DATA_DIR, PROCESSED_DATA_DIR, DEMO_DATA_DIR, ARTIFACTS_DIR]:
    directory.mkdir(parents=True, exist_ok=True)

class Settings(BaseModel):
    PROJECT_NAME: str = "AI Football Scout & Tactical Intelligence System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    DATABASE_URL: str = f"sqlite:///{DATA_DIR / 'football_scout.db'}"
    DEMO_MODE_DEFAULT: bool = True
    RANDOM_SEED: int = 42
    
    BASE_DIR: Path = BASE_DIR
    DATA_DIR: Path = DATA_DIR
    RAW_DATA_DIR: Path = RAW_DATA_DIR
    PROCESSED_DATA_DIR: Path = PROCESSED_DATA_DIR
    DEMO_DATA_DIR: Path = DEMO_DATA_DIR
    ARTIFACTS_DIR: Path = ARTIFACTS_DIR

settings = Settings()
