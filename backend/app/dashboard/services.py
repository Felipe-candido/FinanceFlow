from sqlalchemy import select, func
from app.dashboard.schemas import DashboardResponse, DashboardPeriod
from app.transactions.models import Transaction
from datetime import datetime
from enum import Enum


class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"


class DashboardService:
    def __init__(self, db, user_id: str):
        self.db = db
        self.user_id = user_id

    def _get_total(
        self,
        start_date: datetime,
        end_date: datetime,
        type_: TransactionType,
        category: str | None = None,
    ):
        stmt = (
            select(func.coalesce(func.sum(Transaction.amount), 0))
            .where(
                Transaction.user_id == self.user_id,
                Transaction.type == type_.value,
                Transaction.date.between(start_date, end_date),
            )
        )

        if category is not None:
            stmt = stmt.where(Transaction.category == category)

        result = self.db.execute(stmt).scalar_one()

        return result

    def get_last_transactions(self) -> list[Transaction]:
        stmt = (
            select(Transaction)
            .where(Transaction.user_id == self.user_id)
            .order_by(Transaction.date.desc())
            .limit(5)
        )

        result = self.db.execute(stmt).scalars().all()

        return result

    def _get_total_by_category(
        self,
        start_date: datetime,
        end_date: datetime,
        type_: TransactionType,
    ):
        stmt = (
            select(
                Transaction.category.label("category"),
                func.coalesce(func.sum(Transaction.amount), 0).label("total"),
            )
            .where(
                Transaction.user_id == self.user_id,
                Transaction.type == type_.value,
                Transaction.date.between(start_date, end_date),
            )
            .group_by(Transaction.category)
        )

        result = self.db.execute(stmt).mappings().all()

        return result

    def get_dashboard_data(
        self,
        start_date: datetime,
        end_date: datetime,
        category: str | None = None,
    ) -> DashboardResponse:

        total_income = self._get_total(
            start_date, end_date, TransactionType.INCOME, category
        )

        total_expense = self._get_total(
            start_date, end_date, TransactionType.EXPENSE, category
        )

        balance = total_income - total_expense

        expenses_by_category = self._get_total_by_category(
            start_date, end_date, TransactionType.EXPENSE
        )

        income_by_category = self._get_total_by_category(
            start_date, end_date, TransactionType.INCOME
        )

        last_transactions = self.get_last_transactions()

        return DashboardResponse(
            period=DashboardPeriod(
                start_date=start_date,
                end_date=end_date,
            ),
            total_income=total_income,
            total_expense=total_expense,
            balance=balance,
            expenses_by_category=expenses_by_category,
            income_by_category=income_by_category,
            last_transactions=last_transactions,
        )