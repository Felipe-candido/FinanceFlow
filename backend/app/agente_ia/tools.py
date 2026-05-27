import json
from calendar import monthrange
from datetime import datetime, timezone
from typing import Literal, Optional
from uuid import UUID

from langchain_core.tools import tool
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.budgets.services import BudgetService
from app.categories.models import Category
from app.categories.services import CategoryService
from app.dashboard.services import DashboardService
from app.transactions.schemas import TransactionCreate, TransactionResponse
from app.transactions.services import TransactionService


class AdicionarTransacaoInput(BaseModel):
    description: str = Field(..., description="Descricao do gasto ou ganho")
    amount: float = Field(..., description="Valor monetario absoluto, sempre positivo")
    type: Literal["income", "expense"] = Field(
        ..., description="'income' para receitas, 'expense' para despesas"
    )
    category_name: str = Field(
        ..., description="Nome da categoria (ex: Transporte, Alimentacao, Salario)"
    )
    date: Optional[str] = Field(
        None,
        description="Data no formato YYYY-MM-DD. Se omitida, use a data de hoje.",
    )
    is_recurring: bool = Field(
        False,
        description="True quando for uma transacao mensal recorrente.",
    )
    recurrence_occurrences: Optional[int] = Field(
        None,
        description="Quantidade total para parcelados (exemplo: 12).",
    )
    recurrence_end_date: Optional[str] = Field(
        None,
        description="Data limite da recorrencia no formato YYYY-MM-DD.",
    )


class BuscarTransacoesInput(BaseModel):
    start_date: Optional[datetime] = Field(None, description="Data inicial do filtro")
    end_date: Optional[datetime] = Field(None, description="Data final do filtro")
    category_name: Optional[str] = Field(None, description="Filtrar por categoria")
    transaction_type: Optional[Literal["income", "expense"]] = Field(
        None, description="Filtrar por tipo"
    )
    limit: Optional[int] = Field(None, description="Limite de registros")


class ConsultarOrcamentoInput(BaseModel):
    start_date: Optional[datetime] = Field(None, description="Data inicial do orcamento")
    end_date: Optional[datetime] = Field(None, description="Data final do orcamento")


def _resolve_category_id(
    db: Session,
    user_id: UUID,
    category_name: str,
    transaction_type: Literal["income", "expense"],
) -> UUID:
    category = (
        db.query(Category)
        .filter(Category.user_id == user_id)
        .filter(Category.type == transaction_type)
        .filter(Category.name.ilike(category_name))
        .first()
    )

    if not category:
        raise ValueError(
            f"Categoria '{category_name}' nao encontrada para o tipo '{transaction_type}'."
        )

    return category.id


def get_tools_for_user(db: Session, user_id: UUID):
    @tool(args_schema=AdicionarTransacaoInput)
    def agent_add_transaction(
        description: str,
        amount: float,
        type: Literal["income", "expense"],
        category_name: str,
        date: Optional[str] = None,
        is_recurring: bool = False,
        recurrence_occurrences: Optional[int] = None,
        recurrence_end_date: Optional[str] = None,
    ) -> str:
        """Adiciona uma transacao para o usuario."""
        try:
            category_id = _resolve_category_id(db, user_id, category_name, type)
            parsed_date = date or datetime.now(timezone.utc).strftime("%Y-%m-%d")

            transaction_data = TransactionCreate(
                description=description,
                amount=amount,
                type=type,
                category_id=category_id,
                date=parsed_date,
                is_recurring=is_recurring,
                recurrence_occurrences=recurrence_occurrences,
                recurrence_end_date=recurrence_end_date,
            )
            transaction = TransactionService(db, user_id).create_transaction(transaction_data)
            result = TransactionResponse.model_validate(transaction).model_dump()
            return f"Sucesso! Transacao adicionada: {json.dumps(result, default=str)}"
        except ValueError as exc:
            return f"Erro ao adicionar: {str(exc)}"
        except Exception as exc:
            return f"Erro interno do servidor ao criar transacao: {str(exc)}"

    @tool(args_schema=BuscarTransacoesInput)
    def agent_list_transactions(
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        category_name: Optional[str] = None,
        transaction_type: Optional[Literal["income", "expense"]] = None,
        limit: Optional[int] = None,
    ) -> str:
        """Lista ou filtra transacoes antigas e recentes."""
        try:
            service = TransactionService(db, user_id)
            transactions = service.get_transactions(start_date, end_date)

            if category_name:
                transactions = [
                    tx
                    for tx in transactions
                    if tx.category and tx.category.name.lower() == category_name.lower()
                ]
            if transaction_type:
                transactions = [tx for tx in transactions if tx.type == transaction_type]
            if limit:
                transactions = transactions[:limit]

            result = [TransactionResponse.model_validate(tx).model_dump() for tx in transactions]

            if not result:
                return "Nenhuma transacao encontrada com esses filtros."

            return json.dumps(result, default=str)
        except Exception as exc:
            return f"Erro ao buscar transacoes: {str(exc)}"

    @tool
    def agent_get_dashboard_summary(
        month: Optional[int] = None,
        year: Optional[int] = None,
        category: Optional[str] = None,
    ) -> str:
        """Retorna o resumo financeiro com receitas, despesas e saldo."""
        try:
            now = datetime.now(timezone.utc)
            req_month = month or now.month
            req_year = year or now.year
            day_count = monthrange(req_year, req_month)[1]
            start_date = datetime(req_year, req_month, 1, tzinfo=timezone.utc)
            end_date = datetime(req_year, req_month, day_count, 23, 59, 59, tzinfo=timezone.utc)

            summary = DashboardService(db, user_id).get_dashboard_data(
                start_date=start_date,
                end_date=end_date,
                category=category,
            )
            return json.dumps(summary.model_dump(), default=str)
        except Exception as exc:
            return f"Erro ao gerar resumo financeiro: {str(exc)}"

    @tool(args_schema=ConsultarOrcamentoInput)
    def agent_get_budget_status(
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
    ) -> str:
        """Consulta status dos orcamentos mensais por categoria."""
        try:
            budget_service = BudgetService(db, user_id)
            transaction_service = TransactionService(db, user_id)

            budgets = budget_service.list_budgets()
            transactions = transaction_service.get_transactions(start_date, end_date)

            spent_by_category: dict[str, float] = {}
            for tx in transactions:
                if tx.category:
                    cat_name = tx.category.name
                    spent_by_category[cat_name] = spent_by_category.get(cat_name, 0.0) + float(tx.amount)

            results = []
            for budget in budgets:
                cat_name = budget.category.name
                limit = float(budget.limit)
                spent = float(spent_by_category.get(cat_name, 0.0))
                results.append(
                    {
                        "category_name": cat_name,
                        "limit": limit,
                        "spent": spent,
                        "remaining": round(limit - spent, 2),
                        "over_budget": spent > limit,
                    }
                )

            if not results:
                return "O usuario ainda nao possui orcamentos definidos."

            return json.dumps({"budgets": results}, default=str)
        except Exception as exc:
            return f"Erro ao consultar orcamentos: {str(exc)}"

    @tool
    def agent_list_categories() -> str:
        """Retorna todas as categorias cadastradas do usuario."""
        try:
            categories = CategoryService(db, user_id).list_categories()
            result = [{"id": str(c.id), "name": c.name, "type": c.type} for c in categories]
            return json.dumps(result, default=str)
        except Exception as exc:
            return f"Erro ao listar categorias: {str(exc)}"

    return [
        agent_add_transaction,
        agent_list_transactions,
        agent_get_dashboard_summary,
        agent_get_budget_status,
        agent_list_categories,
    ]
