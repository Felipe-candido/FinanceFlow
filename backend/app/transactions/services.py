from datetime import datetime
from requests import Session
from app.transactions.schemas import TransactionCreate
from app.transactions.models import Transaction
from app.users.models import User
from app.categories.models import Category
from sqlalchemy import or_
from sqlalchemy.orm import joinedload

class TransactionService:
      def __init__(self, db: Session, user_id: str):
        self.db = db
        self.user = db.get(User, user_id)

      def create_transaction(self, data: TransactionCreate) -> Transaction:

            category = self.db.query(Category).filter(
                  Category.id == data.category_id,
                  or_(
                        Category.user_id == self.user.id,
                        Category.is_default == True
                  )
            ).first()

            if not category:
                raise ValueError("Category not found")

            new_transaction = Transaction(
                  description = data.description,
                  type = data.type,
                  date = data.date,
                  amount = data.amount,
                  category_id = category.id,
                  user_id = self.user.id
            )

            self.db.add(new_transaction)
            self.db.commit()
            self.db.refresh(new_transaction)

            return new_transaction


      def get_transactions(self, start_date: datetime, end_date: datetime) -> list[Transaction]:
           return self.db.query(Transaction)\
           .options(joinedload(Transaction.category))\
                  .filter(Transaction.user_id == self.user.id)\
                  .filter(Transaction.date.between(start_date, end_date))\
                  .all()
      

      def get_expenses(self, start_date: datetime, end_date: datetime) -> list[Transaction]:
           return self.db.query(Transaction)\
           .options(joinedload(Transaction.category))\
                  .filter(Transaction.user_id == self.user.id,
                          Transaction.type == "expense")\
                  .filter(Transaction.date.between(start_date, end_date))\
                  .all()
      
      
      def get_incomes(self, start_date: datetime, end_date: datetime) -> list[Transaction]:
           return self.db.query(Transaction)\
           .options(joinedload(Transaction.category))\
                  .filter(Transaction.user_id == self.user.id,
                          Transaction.type == "income")\
                  .filter(Transaction.date.between(start_date, end_date))\
                  .all()
      
      
      
      
           