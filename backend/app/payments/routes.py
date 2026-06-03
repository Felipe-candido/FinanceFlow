from fastapi import APIRouter, Depends

from app.core.dependecies import get_db
from app.core.security import get_current_user
from app.payments.schemas import CheckoutSessionResponse
from app.payments.services import PaymentService


payments_router = APIRouter(prefix="/payments", tags=["payments"])


@payments_router.post("/checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = PaymentService(db)
    return CheckoutSessionResponse(url=service.create_checkout_session(current_user["sub"]))
