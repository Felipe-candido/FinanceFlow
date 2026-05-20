from typing import Any
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.settings.models import UserSettings
from app.users.models import User


class SettingsService:
    def __init__(self, db: Session, user_id: UUID):
        self.db = db
        self.user = db.get(User, user_id)
        if not self.user:
            raise HTTPException(status_code=404, detail="User not found")

    def get_settings(self) -> UserSettings:
        settings = self.db.get(UserSettings, self.user.id)
        if settings:
            return settings

        settings = UserSettings(user_id=self.user.id, data={})
        self.db.add(settings)
        self.db.commit()
        self.db.refresh(settings)
        return settings

    def update_settings(self, data: dict[str, Any]) -> UserSettings:
        settings = self.get_settings()
        settings.data = data
        self.db.commit()
        self.db.refresh(settings)
        return settings
