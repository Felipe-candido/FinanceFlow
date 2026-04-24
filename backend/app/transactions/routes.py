from typing import Optional
from uuid import UUID
from app.core.dependecies import get_db
from datetime import datetime
from app.transactions.services import TransactionService
from fastapi import APIRouter, Depends, HTTPException
from app.transactions.schemas import TransactionBase, TransactionResponse
from app.core.security import get_current_user

transactions_router = APIRouter(prefix="/transactions", tags=["transactions"])

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


@transactions_router.get("/list", response_model=list[TransactionResponse])
async def list_transactions(
     start_date: Optional[datetime] = None,
     end_date: Optional[datetime] = None,
     db = Depends(get_db),
     current_user: dict = Depends(get_current_user)
      ):
     
     current_user_id = current_user["sub"]
     service = TransactionService(db, current_user_id)
     return service.get_transactions(start_date, end_date)

@transactions_router.post("/delete/{transaction_id}")
async def delete_transaction(
     transaction_id: UUID,
     db = Depends(get_db),
     current_user: dict = Depends(get_current_user)
     ):

     service = TransactionService(db, current_user["sub"])
     return service.delete_transaction(transaction_id)
