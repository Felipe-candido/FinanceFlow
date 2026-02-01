from app.core.dependecies import get_db
from datetime import datetime
from app.transactions.services import TransactionService
from fastapi import APIRouter, Depends, HTTPException
from app.transactions.schemas import TransactionBase, TransactionResponse
from app.core.security import get_current_user

transactions_router = APIRouter(prefix="/transactions", tags=["auth"])

@transactions_router.post("/add", response_model=TransactionResponse)
async def create_transaction(
      transaction_data: TransactionBase,
      db = Depends(get_db),
      current_user: dict = Depends(get_current_user)
      ):

     print("TRANSACTION DATA:", transaction_data)

     current_user_id = current_user["sub"]

     service = TransactionService(db, current_user_id)
     new_transaction = service.create_transaction(transaction_data)
     return new_transaction
