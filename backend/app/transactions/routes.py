from typing import Optional
from uuid import UUID
from app.core.dependecies import get_db
from datetime import datetime
from app.transactions.services import TransactionService
from fastapi import APIRouter, Depends, HTTPException
from app.transactions.schemas import (
     RecurringTransactionResponse,
     RecurringTransactionUpdate,
     TransactionCreate,
     TransactionResponse,
     TransactionUpdate,
)
from app.core.security import get_current_user

transactions_router = APIRouter(prefix="/transactions", tags=["transactions"])

@transactions_router.post("/add", response_model=TransactionResponse)
async def create_transaction(
      transaction_data: TransactionCreate,
      db = Depends(get_db),
      current_user: dict = Depends(get_current_user)
      ):

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


@transactions_router.get("/recurring/list", response_model=list[RecurringTransactionResponse])
async def list_recurring_transactions(
     db = Depends(get_db),
     current_user: dict = Depends(get_current_user)
     ):

     service = TransactionService(db, current_user["sub"])
     return service.list_recurring_transactions()


@transactions_router.patch("/recurring/{recurring_transaction_id}", response_model=RecurringTransactionResponse)
async def update_recurring_transaction_status(
     recurring_transaction_id: UUID,
     recurring_data: RecurringTransactionUpdate,
     db = Depends(get_db),
     current_user: dict = Depends(get_current_user)
     ):

     service = TransactionService(db, current_user["sub"])
     return service.update_recurring_transaction_status(
          recurring_transaction_id,
          recurring_data.is_active,
     )


@transactions_router.delete("/recurring/{recurring_transaction_id}")
async def delete_recurring_transaction(
     recurring_transaction_id: UUID,
     db = Depends(get_db),
     current_user: dict = Depends(get_current_user)
     ):

     service = TransactionService(db, current_user["sub"])
     return service.delete_recurring_transaction(recurring_transaction_id)

@transactions_router.delete("/{transaction_id}")
async def delete_transaction(
     transaction_id: UUID,
     db = Depends(get_db),
     current_user: dict = Depends(get_current_user)
     ):

     service = TransactionService(db, current_user["sub"])
     return service.delete_transaction(transaction_id)


@transactions_router.post("/delete/{transaction_id}")
async def delete_transaction_legacy(
     transaction_id: UUID,
     db = Depends(get_db),
     current_user: dict = Depends(get_current_user)
     ):
     service = TransactionService(db, current_user["sub"])
     return service.delete_transaction(transaction_id)


@transactions_router.put("/update/{transaction_id}", response_model=TransactionResponse)
async def update_transaction(
     transaction_id: UUID,
     transaction_data: TransactionUpdate,
     db = Depends(get_db),
     current_user: dict = Depends(get_current_user)
     ):

     service = TransactionService(db, current_user["sub"])
     return service.update_transaction(transaction_id, transaction_data)
