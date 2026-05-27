"""add recurring transactions

Revision ID: f1842f2bb1bb
Revises: d7a6c5f1a9b2
Create Date: 2026-05-26 23:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "f1842f2bb1bb"
down_revision: Union[str, Sequence[str], None] = "d7a6c5f1a9b2"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "recurring_transactions",
        sa.Column("id", sa.UUID(), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("category_id", sa.UUID(), nullable=False),
        sa.Column("description", sa.String(length=255), nullable=True),
        sa.Column("amount", sa.Float(), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("start_date", sa.DateTime(), nullable=False),
        sa.Column("interval_months", sa.Integer(), server_default="1", nullable=False),
        sa.Column("end_date", sa.DateTime(), nullable=True),
        sa.Column("total_occurrences", sa.Integer(), nullable=True),
        sa.Column("generated_occurrences", sa.Integer(), server_default="1", nullable=False),
        sa.Column("is_active", sa.Boolean(), server_default="true", nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_recurring_transactions_category_id"),
        "recurring_transactions",
        ["category_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_recurring_transactions_user_id"),
        "recurring_transactions",
        ["user_id"],
        unique=False,
    )

    op.add_column(
        "transactions",
        sa.Column("recurring_transaction_id", postgresql.UUID(as_uuid=True), nullable=True),
    )
    op.add_column(
        "transactions",
        sa.Column("recurrence_sequence", sa.Integer(), nullable=True),
    )

    op.execute("UPDATE transactions SET date = COALESCE(date, created_at, NOW())")
    op.alter_column(
        "transactions",
        "date",
        existing_type=sa.DateTime(),
        server_default=sa.text("now()"),
        nullable=False,
    )

    op.create_index(
        op.f("ix_transactions_recurring_transaction_id"),
        "transactions",
        ["recurring_transaction_id"],
        unique=False,
    )
    op.create_foreign_key(
        "fk_transactions_recurring_transaction_id",
        "transactions",
        "recurring_transactions",
        ["recurring_transaction_id"],
        ["id"],
        ondelete="SET NULL",
    )
    op.create_unique_constraint(
        "uq_transactions_recurring_sequence",
        "transactions",
        ["recurring_transaction_id", "recurrence_sequence"],
    )


def downgrade() -> None:
    op.drop_constraint(
        "uq_transactions_recurring_sequence",
        "transactions",
        type_="unique",
    )
    op.drop_constraint(
        "fk_transactions_recurring_transaction_id",
        "transactions",
        type_="foreignkey",
    )
    op.drop_index(
        op.f("ix_transactions_recurring_transaction_id"),
        table_name="transactions",
    )

    op.alter_column(
        "transactions",
        "date",
        existing_type=sa.DateTime(),
        server_default=None,
        nullable=True,
    )

    op.drop_column("transactions", "recurrence_sequence")
    op.drop_column("transactions", "recurring_transaction_id")

    op.drop_index(
        op.f("ix_recurring_transactions_user_id"),
        table_name="recurring_transactions",
    )
    op.drop_index(
        op.f("ix_recurring_transactions_category_id"),
        table_name="recurring_transactions",
    )
    op.drop_table("recurring_transactions")
