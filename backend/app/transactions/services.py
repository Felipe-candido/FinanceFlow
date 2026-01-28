from datetime import datetime
from requests import Session
from schemas import TransactionCreate
from app.transactions.models import Transaction

class TransactionService:
      def __init__(self, db: Session):
        self.db = db

      def create_transaction(self, data: TransactionCreate) -> Transaction:

            new_transaction = Transaction(
                  description = data.description,
                  type = data.type,
                  date = data.date,
                  amount = data.amount,
                  category = data.category,
                  user_id = self.user.id
            )

            self.db.add(new_transaction)
            self.db.commit()
            self.db.refresh(new_transaction)

            return new_transaction

