from datetime import datetime
from pydantic import BaseModel
from typing import List, Optional
from app.transactions.schemas import TransactionResponse

class ProjectionPoint(BaseModel):
    date: str
    balance: float

class ProjectionData(BaseModel):
    current_balance: float
    avg_daily_expense: float
    projected_balance_in_30_days: float
    days_until_zero: Optional[int] = None
    chart_data: List[ProjectionPoint]

class DashboardPeriod(BaseModel):
    start_date: datetime
    end_date: datetime


class CategoryTotal(BaseModel):
    category: str
    total: float
    color: str

class DashboardResponse(BaseModel):

    period: DashboardPeriod

    total_income: float
    total_expense: float
    balance: float

    expenses_by_category: List[CategoryTotal]
    income_by_category: List[CategoryTotal]

    last_transactions: List[TransactionResponse]
    
    projection: ProjectionData

