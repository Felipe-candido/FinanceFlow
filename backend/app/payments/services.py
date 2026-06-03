from uuid import UUID

import stripe
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.users.models import User


class PaymentService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.settings = get_settings()

    def create_checkout_session(self, user_id: str) -> str:
        if not self.settings.stripe_secret_key or not self.settings.stripe_price_id:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Stripe is not configured",
            )

        user = self.db.get(User, UUID(user_id))
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        stripe.api_key = self.settings.stripe_secret_key
        customer_id = self._get_or_create_customer(user)

        try:
            session = stripe.checkout.Session.create(
                mode="subscription",
                customer=customer_id,
                client_reference_id=str(user.id),
                line_items=[
                    {
                        "price": self.settings.stripe_price_id,
                        "quantity": 1,
                    }
                ],
                subscription_data={
                    "trial_period_days": 14,
                    "metadata": {
                        "user_id": str(user.id),
                        "price_id": self.settings.stripe_price_id,
                    },
                },
                metadata={
                    "user_id": str(user.id),
                    "price_id": self.settings.stripe_price_id,
                },
                success_url=(
                    f"{self.settings.frontend_url}/dashboard"
                    "?checkout=success&session_id={CHECKOUT_SESSION_ID}"
                ),
                cancel_url=f"{self.settings.frontend_url}/?checkout=cancelled#planos",
            )
        except stripe.StripeError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail=str(exc.user_message or "Could not create Stripe Checkout session"),
            ) from exc

        if not session.url:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Stripe did not return a Checkout URL",
            )

        user.price_id = self.settings.stripe_price_id
        self.db.commit()

        return session.url

    def _get_or_create_customer(self, user: User) -> str:
        if user.stripe_customer_id:
            return user.stripe_customer_id

        customer = stripe.Customer.create(
            email=user.email,
            name=user.name,
            metadata={"user_id": str(user.id)},
        )

        user.stripe_customer_id = customer.id
        self.db.commit()
        self.db.refresh(user)

        return customer.id
