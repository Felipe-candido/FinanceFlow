from app.core.dependecies import get_db
from datetime import datetime
from app.transactions.services import TransactionService
from fastapi import APIRouter, Depends, HTTPException
from app.transactions.schemas import TransactionResponse
from app.core.security import get_current_user

transactions_router = APIRouter(prefix="/transaction", tags=["auth"])

@transactions_router.post("/add", response_model=TransactionResponse)
def create_transaction(
      transaction_data: TransactionResponse,
      db = Depends(get_db),
      current_user = Depends(get_current_user)
      ):
     
     service = TransactionService(db, current_user)
     new_transaction = service.create_transaction(transaction_data)
     return new_transaction
