import stripe
from fastapi import APIRouter, Depends, Header, HTTPException, Request, status

from app.core.dependecies import get_db
from app.core.config import get_settings
from app.core.security import get_current_user
from app.payments.schemas import CheckoutSessionResponse
from app.payments.services import PaymentService


payments_router = APIRouter(prefix="/payments", tags=["payments"])
stripe_webhooks_router = APIRouter(prefix="/webhooks", tags=["stripe-webhooks"])


@payments_router.post("/checkout-session", response_model=CheckoutSessionResponse)
async def create_checkout_session(
    db=Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    service = PaymentService(db)
    return CheckoutSessionResponse(url=service.create_checkout_session(current_user["sub"]))


@stripe_webhooks_router.post("/stripe")
async def stripe_webhook(
    request: Request,
    stripe_signature: str | None = Header(default=None, alias="stripe-signature"),
    db=Depends(get_db),
):
    settings = get_settings()
    if not settings.stripe_secret_key or not settings.stripe_webhook_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Stripe webhook is not configured",
        )

    if not stripe_signature:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Stripe signature",
        )

    payload = await request.body()
    stripe.api_key = settings.stripe_secret_key

    try:
        event = stripe.Webhook.construct_event(
            payload,
            stripe_signature,
            settings.stripe_webhook_secret,
        )
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid payload",
        ) from exc
    except stripe.error.SignatureVerificationError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid signature",
        ) from exc

    try:
        PaymentService(db).handle_webhook_event(event)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal webhook processing error",
        ) from exc

    return {"status": "success"}
