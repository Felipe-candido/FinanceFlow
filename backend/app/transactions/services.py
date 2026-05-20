from datetime import datetime
from typing import Optional
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.transactions.schemas import TransactionCreate, TransactionUpdate
from app.transactions.models import Transaction
from app.users.models import User
from app.categories.models import Category
from sqlalchemy.orm import joinedload

class TransactionService:
      def __init__(self, db: Session, user_id: str):
        self.db = db
        self.user = db.get(User, user_id)
        if not self.user:
              raise HTTPException(status_code=404, detail="User not found")

      def create_transaction(self, data: TransactionCreate) -> Transaction:
            self._validate_type(data.type)
            if data.category_id is None:
                  raise HTTPException(status_code=422, detail="Category is required")

            category = self.db.query(Category).filter(
                  Category.id == data.category_id,
                  Category.user_id == self.user.id,
                  Category.type == data.type,
            ).first()

            if not category:
                raise HTTPException(status_code=404, detail="Category not found")

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


      def get_transactions(
                self, 
                start_date: Optional[datetime] = None, 
                end_date: Optional[datetime] = None
                ) -> list[Transaction]:
           
           query = self.db.query(Transaction)\
           .options(joinedload(Transaction.category))\
                  .filter(Transaction.user_id == self.user.id)

           if start_date is not None:
               query = query.filter(Transaction.date >= start_date)

           if end_date is not None:
               query = query.filter(Transaction.date <= end_date)

           return query.all()
      

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
      
      
      def delete_transaction(self, idTransaction):
            transaction = self.db.query(Transaction)\
                  .filter(
                        Transaction.id == idTransaction,
                        Transaction.user_id == self.user.id
                  ).first()
            
            if not transaction:
                  raise HTTPException(status_code=404, detail="Transaction not found")
            
            # salva os dados antes de deletar
            data = {
                  "id": transaction.id,
                  "amount": transaction.amount,
                  "category": transaction.category.name if transaction.category else None
            }
            
            self.db.delete(transaction)
            self.db.commit()
            
            return {"message": "Deleted successfully", "data": data }


      def update_transaction(self, idTransaction, data: TransactionUpdate) -> Transaction:
            transaction = self.db.query(Transaction)\
                  .filter(
                        Transaction.id == idTransaction,
                        Transaction.user_id == self.user.id
                  ).first()
            
            if not transaction:
                  raise HTTPException(status_code=404, detail="Transaction not found")

            if data.type is not None:
                  self._validate_type(data.type)
                  transaction.type = data.type

            if data.category_id is not None:
                  category_type = data.type or transaction.type
                  category = self.db.query(Category).filter(
                        Category.id == data.category_id,
                        Category.user_id == self.user.id,
                        Category.type == category_type,
                  ).first()

                  if not category:
                        raise HTTPException(status_code=404, detail="Category not found")

                  transaction.category_id = category.id

            if data.description is not None:
                  transaction.description = data.description

            if data.date is not None:
                  transaction.date = data.date

            if data.amount is not None:
                  transaction.amount = data.amount

            self.db.commit()
            self.db.refresh(transaction)
            
            return transaction

      @staticmethod
      def _validate_type(type_: str) -> None:
            if type_ not in {"income", "expense"}:
                  raise HTTPException(status_code=422, detail="Invalid transaction type")

          
