from datetime import datetime
from requests import Session
from schemas import TransactionCreate
from app.transactions.models import Transaction

class TransactionService:

      def create_transaction(self, data: TransactionCreate, db: Session) -> Transaction:

            new_transaction = Transaction(
                  description = data.description,
                  type = data.type,
                  date = data.date,
                  amount = data.amout,
                  category = data.category
            )

