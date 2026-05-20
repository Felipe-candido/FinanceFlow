from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from app.budgets.models import Budget
from app.budgets.schemas import BudgetCreate, BudgetUpdate
from app.categories.models import Category
from app.users.models import User


class BudgetService:
    def __init__(self, db: Session, user_id: UUID):
        self.db = db
        self.user = db.get(User, user_id)
        if not self.user:
            raise HTTPException(status_code=404, detail="User not found")

    def list_budgets(self) -> list[Budget]:
        return self.db.query(Budget)\
            .options(joinedload(Budget.category))\
            .filter(Budget.user_id == self.user.id)\
            .order_by(Budget.created_at.asc())\
            .all()

    def create_budget(self, data: BudgetCreate) -> Budget:
        category = self._get_expense_category(data.category_id)

        existing = self.db.query(Budget).filter(
            Budget.user_id == self.user.id,
            Budget.category_id == category.id,
        ).first()
        if existing:
            raise HTTPException(status_code=409, detail="Budget already exists")

        budget = Budget(
            user_id=self.user.id,
            category_id=category.id,
            limit=data.limit,
        )
        self.db.add(budget)
        self.db.commit()
        self.db.refresh(budget)
        return self._get_budget(budget.id)

    def update_budget(self, budget_id: UUID, data: BudgetUpdate) -> Budget:
        budget = self._get_budget(budget_id)

        if data.category_id is not None:
            category = self._get_expense_category(data.category_id)
            existing = self.db.query(Budget).filter(
                Budget.user_id == self.user.id,
                Budget.category_id == category.id,
                Budget.id != budget.id,
            ).first()
            if existing:
                raise HTTPException(status_code=409, detail="Budget already exists")
            budget.category_id = category.id

        if data.limit is not None:
            budget.limit = data.limit

        self.db.commit()
        self.db.refresh(budget)
        return self._get_budget(budget.id)

    def delete_budget(self, budget_id: UUID):
        budget = self._get_budget(budget_id)
        self.db.delete(budget)
        self.db.commit()
        return {"message": "Deleted successfully"}

    def _get_budget(self, budget_id: UUID) -> Budget:
        budget = self.db.query(Budget)\
            .options(joinedload(Budget.category))\
            .filter(Budget.id == budget_id, Budget.user_id == self.user.id)\
            .first()
        if not budget:
            raise HTTPException(status_code=404, detail="Budget not found")
        return budget

    def _get_expense_category(self, category_id: UUID) -> Category:
        category = self.db.query(Category).filter(
            Category.id == category_id,
            Category.user_id == self.user.id,
            Category.type == "expense",
        ).first()
        if not category:
            raise HTTPException(status_code=404, detail="Expense category not found")
        return category
