import calendar
from app.core.dependecies import get_db
from datetime import datetime, timezone
from app.dashboard.services import DashboardService
from fastapi import APIRouter, Depends
from app.dashboard.schemas import DashboardResponse
from app.core.security import get_current_user
from fastapi import Query

dashboard_router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@dashboard_router.get("/summary", response_model=DashboardResponse)
async def get_dashboard_summary(
      month: int | None = Query(None),
      year: int | None = Query(None),
      start_date: datetime | None = Query(None),
      end_date: datetime | None = Query(None),
      category: str | None = Query(None),
      db = Depends(get_db),
      current_user: dict = Depends(get_current_user)
):
      current_user_id = current_user["sub"]

      if not start_date or not end_date:
            now = datetime.now(timezone.utc)
            month = month or now.month
            year = year or now.year

            last_day = calendar.monthrange(year, month)[1]

            start_date = datetime(year, month, 1, tzinfo=timezone.utc)
            end_date = datetime(year, month, last_day, 23, 59, 59, tzinfo=timezone.utc)

      service = DashboardService(db, current_user_id)

      return service.get_dashboard_data(
        start_date=start_date,
        end_date=end_date,
        category=category
    )
