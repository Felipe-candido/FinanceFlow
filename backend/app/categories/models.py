from app.core.database import Base
from sqlalchemy import Boolean, Float, String, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.dialects.postgresql import UUID
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.transactions.models import Transaction
    from app.users.models import User


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )

    color: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True
    )

    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False  
    )

    is_default: Mapped[bool] = mapped_column(
      Boolean,
      default=False,
      nullable=False
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    user: Mapped["User"] = relationship("User")

    transactions: Mapped[list["Transaction"]] = relationship(
        back_populates="category"
    )