from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import get_settings

settings = get_settings()

database = create_engine(settings.database_url, echo=settings.sql_echo)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=database
)

Base = declarative_base()

