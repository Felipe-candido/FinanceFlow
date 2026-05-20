from fastapi import APIRouter, Depends

from app.core.dependecies import get_db
from app.core.security import get_current_user
from app.settings.schemas import SettingsPayload, SettingsResponse
from app.settings.services import SettingsService

settings_router = APIRouter(prefix="/settings", tags=["settings"])


@settings_router.get("", response_model=SettingsResponse)
async def get_settings(
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = SettingsService(db, current_user["sub"])
    return service.get_settings()


@settings_router.put("", response_model=SettingsResponse)
async def update_settings(
    payload: SettingsPayload,
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = SettingsService(db, current_user["sub"])
    return service.update_settings(payload.data)
