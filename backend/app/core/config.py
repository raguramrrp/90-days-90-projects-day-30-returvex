import os
from pathlib import Path
from pydantic import BaseModel

BASE_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseModel):
    PROJECT_NAME: str = "RETURVEX"
    PROJECT_TITLE: str = "E-Commerce Returns Intelligence & Profit Recovery Platform"
    TAGLINE: str = "Turn return data into smarter business decisions."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{str(BASE_DIR / 'returvex.db').replace('\\', '/')}")
    
    # Financial Formula Defaults (INR)
    DEFAULT_CURRENCY_SYMBOL: str = os.getenv("DEFAULT_CURRENCY_SYMBOL", "₹")
    DEFAULT_REVERSE_LOGISTICS_FEE: float = float(os.getenv("DEFAULT_REVERSE_LOGISTICS_FEE", 120.0))
    DEFAULT_RESTOCKING_PERCENT: float = float(os.getenv("DEFAULT_RESTOCKING_PERCENT", 0.05))
    DEFAULT_WRITE_OFF_PERCENT: float = float(os.getenv("DEFAULT_WRITE_OFF_PERCENT", 0.15))
    DEFAULT_RECOVERABLE_PERCENT: float = float(os.getenv("DEFAULT_RECOVERABLE_PERCENT", 0.80))
    
    # Risk Classification Thresholds (% return rate)
    RISK_THRESHOLD_LOW: float = float(os.getenv("RISK_THRESHOLD_LOW", 8.0))
    RISK_THRESHOLD_MODERATE: float = float(os.getenv("RISK_THRESHOLD_MODERATE", 15.0))
    RISK_THRESHOLD_HIGH: float = float(os.getenv("RISK_THRESHOLD_HIGH", 25.0))
    
    # CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
