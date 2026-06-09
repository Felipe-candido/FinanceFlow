from typing import Any
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
                success_url=self.settings.frontend_url + "/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}",
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

    def handle_webhook_event(self, event: Any) -> None:
        stripe.api_key = self.settings.stripe_secret_key

        try:
            # CORREÇÃO: Utilizando notação de ponto (Stripe v8+)
            event_type = event.type
            event_data = event.data.object

            if event_type == "checkout.session.completed":
                self._handle_checkout_completed(event_data)
            elif event_type == "customer.subscription.updated":
                self._handle_subscription_updated(event_data)
            elif event_type == "customer.subscription.deleted":
                self._handle_subscription_deleted(event_data)
        except Exception as e:
            print(f"Erro processando evento interno: {str(e)}") # Adicionando log de segurança
            self.db.rollback()
            raise

    def _handle_checkout_completed(self, session: Any) -> None:
        # CORREÇÃO: Utilizando notação de ponto (Stripe v8+)
        user_id = session.client_reference_id
        
        # Fallback de segurança para o metadata
        if not user_id and session.metadata:
            user_id = session.metadata.get("user_id")

        stripe_customer_id = session.customer
        subscription_id = session.subscription

        if not user_id:
            return

        user = self.db.get(User, UUID(str(user_id)))
        if not user:
            return

        if stripe_customer_id:
            user.stripe_customer_id = str(stripe_customer_id)

        if subscription_id:
            subscription = stripe.Subscription.retrieve(str(subscription_id))
            user.subscription_status = subscription.status
            user.price_id = self._get_subscription_price_id(subscription) or user.price_id

        self.db.commit()

    def _handle_subscription_updated(self, subscription: Any) -> None:
        # CORREÇÃO: Utilizando notação de ponto (Stripe v8+)
        user = self._get_user_by_stripe_customer_id(subscription.customer)
        if not user:
            return

        user.subscription_status = subscription.status
        user.price_id = self._get_subscription_price_id(subscription) or user.price_id
        self.db.commit()

    def _handle_subscription_deleted(self, subscription: Any) -> None:
        # CORREÇÃO: Utilizando notação de ponto (Stripe v8+)
        user = self._get_user_by_stripe_customer_id(subscription.customer)
        if not user:
            return

        user.subscription_status = "canceled"
        self.db.commit()

    def _get_user_by_stripe_customer_id(self, stripe_customer_id: str | None) -> User | None:
        if not stripe_customer_id:
            return None

        return (
            self.db.query(User)
            .filter(User.stripe_customer_id == str(stripe_customer_id))
            .first()
        )

    @staticmethod
    def _get_subscription_price_id(subscription: Any) -> str | None:
        # CORREÇÃO: Utilizando notação de ponto (Stripe v8+)
        items = subscription.items.data if subscription.items else []
        if not items:
            return None

        price = items[0].price
        if not price:
            return None

        return price.id

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