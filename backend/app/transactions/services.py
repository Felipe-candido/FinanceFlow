from calendar import monthrange
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session, joinedload

from app.categories.models import Category
from app.transactions.models import RecurringTransaction, Transaction
from app.transactions.schemas import TransactionCreate, TransactionUpdate
from app.users.models import User


class TransactionService:
    def __init__(self, db: Session, user_id: str):
        self.db = db
        self.user = db.get(User, user_id)
        if not self.user:
            raise HTTPException(status_code=404, detail="User not found")

    def create_transaction(self, data: TransactionCreate) -> Transaction:
        self._validate_type(data.type)
        category = self._get_user_category(data.category_id, data.type)
        transaction_date = self._normalize_transaction_date(data.date)

        if not data.is_recurring:
            new_transaction = Transaction(
                description=data.description,
                type=data.type,
                date=transaction_date,
                amount=data.amount,
                category_id=category.id,
                user_id=self.user.id,
            )
            self.db.add(new_transaction)
            self.db.commit()
            self.db.refresh(new_transaction)
            return new_transaction

        recurrence_settings = self._validate_recurrence(transaction_date, data)
        recurring_template = RecurringTransaction(
            user_id=self.user.id,
            category_id=category.id,
            description=data.description,
            amount=data.amount,
            type=data.type,
            start_date=transaction_date,
            interval_months=recurrence_settings["interval_months"],
            end_date=recurrence_settings["end_date"],
            total_occurrences=recurrence_settings["occurrences"],
            generated_occurrences=1,
            is_active=True,
        )
        recurring_template.is_active = self._has_future_occurrences(recurring_template)
        self.db.add(recurring_template)
        self.db.flush()

        new_transaction = Transaction(
            description=data.description,
            type=data.type,
            date=transaction_date,
            amount=data.amount,
            category_id=category.id,
            user_id=self.user.id,
            recurring_transaction_id=recurring_template.id,
            recurrence_sequence=1,
        )

        self.db.add(new_transaction)
        self.db.commit()
        self.db.refresh(new_transaction)
        return new_transaction

    def synchronize_recurring_transactions(self, up_to: Optional[datetime] = None) -> None:
        requested_limit = self._normalize_transaction_date(up_to)
        current_limit = self._normalize_transaction_date(None)
        generation_limit = min(requested_limit, current_limit)

        recurring_templates = (
            self.db.query(RecurringTransaction)
            .filter(
                RecurringTransaction.user_id == self.user.id,
                RecurringTransaction.is_active.is_(True),
            )
            .order_by(RecurringTransaction.start_date.asc())
            .all()
        )

        has_changes = False
        for template in recurring_templates:
            if self._materialize_template_until(template, generation_limit):
                has_changes = True

        if has_changes:
            self.db.commit()

    def get_transactions(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> list[Transaction]:
        self.synchronize_recurring_transactions(end_date)

        query = (
            self.db.query(Transaction)
            .options(joinedload(Transaction.category))
            .filter(Transaction.user_id == self.user.id)
        )

        if start_date is not None:
            query = query.filter(Transaction.date >= self._normalize_transaction_date(start_date))

        if end_date is not None:
            query = query.filter(Transaction.date <= self._normalize_transaction_date(end_date))

        return query.order_by(Transaction.date.desc(), Transaction.created_at.desc()).all()

    def get_expenses(self, start_date: datetime, end_date: datetime) -> list[Transaction]:
        self.synchronize_recurring_transactions(end_date)
        return (
            self.db.query(Transaction)
            .options(joinedload(Transaction.category))
            .filter(
                Transaction.user_id == self.user.id,
                Transaction.type == "expense",
            )
            .filter(
                Transaction.date.between(
                    self._normalize_transaction_date(start_date),
                    self._normalize_transaction_date(end_date),
                )
            )
            .order_by(Transaction.date.desc())
            .all()
        )

    def get_incomes(self, start_date: datetime, end_date: datetime) -> list[Transaction]:
        self.synchronize_recurring_transactions(end_date)
        return (
            self.db.query(Transaction)
            .options(joinedload(Transaction.category))
            .filter(
                Transaction.user_id == self.user.id,
                Transaction.type == "income",
            )
            .filter(
                Transaction.date.between(
                    self._normalize_transaction_date(start_date),
                    self._normalize_transaction_date(end_date),
                )
            )
            .order_by(Transaction.date.desc())
            .all()
        )

    def delete_transaction(self, id_transaction):
        transaction = (
            self.db.query(Transaction)
            .filter(
                Transaction.id == id_transaction,
                Transaction.user_id == self.user.id,
            )
            .first()
        )

        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")

        data = {
            "id": transaction.id,
            "amount": transaction.amount,
            "category": transaction.category.name if transaction.category else None,
        }

        self.db.delete(transaction)
        self.db.commit()
        return {"message": "Deleted successfully", "data": data}

    def update_transaction(self, id_transaction, data: TransactionUpdate) -> Transaction:
        transaction = (
            self.db.query(Transaction)
            .filter(
                Transaction.id == id_transaction,
                Transaction.user_id == self.user.id,
            )
            .first()
        )

        if not transaction:
            raise HTTPException(status_code=404, detail="Transaction not found")

        if data.type is not None:
            self._validate_type(data.type)
            transaction.type = data.type

        if data.category_id is not None:
            category_type = data.type or transaction.type
            category = self._get_user_category(data.category_id, category_type)
            transaction.category_id = category.id

        if data.description is not None:
            transaction.description = data.description

        if data.date is not None:
            transaction.date = self._normalize_transaction_date(data.date)

        if data.amount is not None:
            transaction.amount = data.amount

        self.db.commit()
        self.db.refresh(transaction)
        return transaction

    def _materialize_template_until(
        self, template: RecurringTransaction, generation_limit: datetime
    ) -> bool:
        has_changes = False

        while template.is_active:
            next_sequence = template.generated_occurrences + 1

            if template.total_occurrences and next_sequence > template.total_occurrences:
                template.is_active = False
                has_changes = True
                break

            next_date = self._add_months(
                template.start_date,
                template.interval_months * (next_sequence - 1),
            )

            if template.end_date and next_date > template.end_date:
                template.is_active = False
                has_changes = True
                break

            if next_date > generation_limit:
                break

            self.db.add(
                Transaction(
                    description=template.description,
                    type=template.type,
                    date=next_date,
                    amount=template.amount,
                    category_id=template.category_id,
                    user_id=template.user_id,
                    recurring_transaction_id=template.id,
                    recurrence_sequence=next_sequence,
                )
            )
            template.generated_occurrences = next_sequence
            has_changes = True

        return has_changes

    def _validate_recurrence(self, start_date: datetime, data: TransactionCreate) -> dict:
        interval_months = data.recurrence_interval_months or 1
        end_date = (
            self._normalize_transaction_date(data.recurrence_end_date)
            if data.recurrence_end_date
            else None
        )

        if end_date and end_date < start_date:
            raise HTTPException(
                status_code=422,
                detail="recurrence_end_date must be greater than or equal to date",
            )

        return {
            "interval_months": interval_months,
            "end_date": end_date,
            "occurrences": data.recurrence_occurrences,
        }

    def _has_future_occurrences(self, template: RecurringTransaction) -> bool:
        if template.total_occurrences is not None and template.total_occurrences <= 1:
            return False

        next_date = self._add_months(template.start_date, template.interval_months)
        if template.end_date and next_date > template.end_date:
            return False

        return True

    def _get_user_category(self, category_id, category_type: str) -> Category:
        if category_id is None:
            raise HTTPException(status_code=422, detail="Category is required")

        category = (
            self.db.query(Category)
            .filter(
                Category.id == category_id,
                Category.user_id == self.user.id,
                Category.type == category_type,
            )
            .first()
        )

        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        return category

    @staticmethod
    def _add_months(base: datetime, months: int) -> datetime:
        month_index = base.month - 1 + months
        year = base.year + month_index // 12
        month = month_index % 12 + 1
        day = min(base.day, monthrange(year, month)[1])
        return base.replace(year=year, month=month, day=day)

    @staticmethod
    def _normalize_transaction_date(value: Optional[datetime]) -> datetime:
        parsed = value or datetime.now(timezone.utc)

        if parsed.tzinfo is not None:
            parsed = parsed.astimezone(timezone.utc).replace(tzinfo=None)

        if parsed.year < 2000 or parsed.year > 2100:
            raise HTTPException(
                status_code=422,
                detail="Date out of allowed range (2000-2100)",
            )

        return parsed

    @staticmethod
    def _validate_type(type_: str) -> None:
        if type_ not in {"income", "expense"}:
            raise HTTPException(status_code=422, detail="Invalid transaction type")
