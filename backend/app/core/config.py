import os
import re
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


def _get_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.lower() in {"1", "true", "yes", "on"}


def _get_list(name: str, default: list[str]) -> list[str]:
    value = os.getenv(name)
    if not value:
        return default
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings:
    database_url: str
    supabase_project_url: str
    cors_origins: list[str]
    sql_echo: bool
    stripe_secret_key: str | None
    stripe_price_id: str | None
    stripe_webhook_secret: str | None
    frontend_url: str

    def __init__(self) -> None:
        database_url = os.getenv("DATABASE_URL")
        if not database_url:
            raise RuntimeError("DATABASE_URL is not configured")

        supabase_project_url = os.getenv("SUPABASE_PROJECT_URL")
        if not supabase_project_url:
            project_ref = os.getenv("SUPABASE_PROJECT_REF") or self._infer_supabase_ref(database_url)
            if project_ref:
                supabase_project_url = f"https://{project_ref}.supabase.co"

        if not supabase_project_url:
            raise RuntimeError("SUPABASE_PROJECT_URL is not configured")

        self.database_url = database_url
        self.supabase_project_url = supabase_project_url.rstrip("/")
        self.cors_origins = _get_list(
            "CORS_ORIGINS",
            ["finance-flow-mu-sooty.vercel.app", "http://localhost:3001"],
        )
        self.sql_echo = _get_bool("SQL_ECHO", False)
        self.stripe_secret_key = os.getenv("STRIPE_SECRET_KEY")
        self.stripe_price_id = os.getenv("STRIPE_PRICE_ID")
        self.stripe_webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
        self.frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")

    @staticmethod
    def _infer_supabase_ref(database_url: str) -> str | None:
        match = re.search(r"postgres(?:%2E|\.)?([a-z0-9]{20})", database_url)
        if match:
            return match.group(1)
        return None


@lru_cache
def get_settings() -> Settings:
    return Settings()
