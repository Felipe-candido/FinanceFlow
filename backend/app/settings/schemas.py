from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel


class SettingsPayload(BaseModel):
    data: dict[str, Any]


class SettingsResponse(SettingsPayload):
    user_id: UUID
    updated_at: datetime

    model_config = {
        "from_attributes": True,
    }
