import json
from calendar import monthrange
from datetime import datetime, timezone, date
from typing import Literal, Optional
from uuid import UUID

from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from langchain_core.tools import tool

from app.budgets.services import BudgetService
from app.categories.models import Category
from app.categories.services import CategoryService
from app.dashboard.services import DashboardService
from app.transactions.schemas import TransactionCreate, TransactionResponse
from app.transactions.services import TransactionService

# ==========================================
# 1. SCHEMAS DE ENTRADA (Para orientar o LLM)
# ==========================================

class AdicionarTransacaoInput(BaseModel):
    description: str = Field(..., description="A descrição do gasto ou ganho")
    amount: float = Field(..., description="O valor monetário absoluto, sempre positivo")
    type: Literal["income", "expense"] = Field(
        ..., description="'income' para receitas/ganhos, 'expense' para despesas/gastos"
    )
    category_name: str = Field(
        ..., description="O nome da categoria (ex: Transporte, Alimentação, Salário)"
    )
    date: Optional[str] = Field(
        None, description="Data da transação EXATAMENTE no formato YYYY-MM-DD. Se omitida, use a data de hoje."
    )
class BuscarTransacoesInput(BaseModel):
    start_date: Optional[datetime] = Field(None, description="Data inicial do filtro")
    end_date: Optional[datetime] = Field(None, description="Data final do filtro")
    category_name: Optional[str] = Field(None, description="Filtrar por nome de categoria")
    transaction_type: Optional[Literal["income", "expense"]] = Field(None, description="Filtrar por tipo")
    limit: Optional[int] = Field(None, description="Limite de registros a retornar")

class ConsultarOrcamentoInput(BaseModel):
    start_date: Optional[datetime] = Field(None, description="Data inicial do orçamento")
    end_date: Optional[datetime] = Field(None, description="Data final do orçamento")

# ==========================================
# 2. LÓGICA CORE INTERNA
# ==========================================

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
            f"Categoria '{category_name}' não encontrada para o tipo '{transaction_type}'."
        )

    return category.id

# ==========================================
# 3. FÁBRICA DE FERRAMENTAS DO LANGCHAIN
# ==========================================

def get_tools_for_user(db: Session, user_id: UUID):
    """
    Retorna uma lista de ferramentas instanciadas e blindadas,
    injetando automaticamente a sessão de banco e o user_id.
    """

    @tool(args_schema=AdicionarTransacaoInput)
    def agent_add_transaction(description: str, amount: float, type: Literal["income", "expense"], category_name: str, date: Optional[str] = None) -> str:
        """Adiciona uma transação. Use sempre que o usuário quiser registrar um ganho ou gasto."""
        try:
            category_id = _resolve_category_id(db, user_id, category_name, type)
            
            # Ajuste da estrutura para a lógica de datas separadas
            # O campo 'date' vindo da IA deve mapear para o campo de data suposta,
            # enquanto a criação real fica a cargo do back-end.
            transaction_data = TransactionCreate(
                description=description,
                amount=amount,
                type=type,
                category_id=category_id,
                intended_date=date, # Ajuste este nome para o campo exato do seu schema Pydantic
            )
            transaction = TransactionService(db, user_id).create_transaction(transaction_data)
            result = TransactionResponse.model_validate(transaction).model_dump()
            return f"Sucesso! Transação adicionada: {json.dumps(result, default=str)}"
            
        except ValueError as e:
            return f"Erro ao adicionar: {str(e)} Sugira ao usuário as categorias existentes."
        except Exception as e:
            return f"Erro interno do servidor ao criar transação: {str(e)}"


    @tool(args_schema=BuscarTransacoesInput)
    def agent_list_transactions(start_date: Optional[datetime] = None, end_date: Optional[datetime] = None, category_name: Optional[str] = None, transaction_type: Optional[Literal["income", "expense"]] = None, limit: Optional[int] = None) -> str:
        """Lista ou filtra transações antigas e recentes do usuário."""
        try:
            service = TransactionService(db, user_id)
            transactions = service.get_transactions(start_date, end_date)

            if category_name:
                transactions = [tx for tx in transactions if tx.category and tx.category.name.lower() == category_name.lower()]
            if transaction_type:
                transactions = [tx for tx in transactions if tx.type == transaction_type]
            if limit:
                transactions = transactions[:limit]

            result = [TransactionResponse.model_validate(tx).model_dump() for tx in transactions]
            
            if not result:
                return "Nenhuma transação encontrada com esses filtros."
                
            return json.dumps(result, default=str)
        except Exception as e:
            return f"Erro ao buscar transações: {str(e)}"


    @tool
    def agent_get_dashboard_summary(month: Optional[int] = None, year: Optional[int] = None, category: Optional[str] = None) -> str:
        """Retorna o resumo financeiro (Dashboard) com total de receitas, despesas e saldo. Use para responder qual o saldo ou resumo do mês."""
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
        except Exception as e:
            return f"Erro ao gerar resumo financeiro: {str(e)}"


    @tool(args_schema=ConsultarOrcamentoInput)
    def agent_get_budget_status(start_date: Optional[datetime] = None, end_date: Optional[datetime] = None) -> str:
        """Consulta o status dos orçamentos mensais, mostrando limites e quanto já foi gasto. Ideal para responder 'Estou dentro do orçamento?'."""
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
                results.append({
                    "category_name": cat_name,
                    "limit": limit,
                    "spent": spent,
                    "remaining": round(limit - spent, 2),
                    "over_budget": spent > limit,
                })

            if not results:
                return "O usuário ainda não possui orçamentos definidos."
                
            return json.dumps({"budgets": results}, default=str)
        except Exception as e:
            return f"Erro ao consultar orçamentos: {str(e)}"


    @tool
    def agent_list_categories() -> str:
        """Retorna todas as categorias cadastradas do usuário. Use para saber quais categorias existem antes de registrar uma transação se estiver em dúvida."""
        try:
            categories = CategoryService(db, user_id).list_categories()
            result = [
                {"id": str(c.id), "name": c.name, "type": c.type} 
                for c in categories
            ]
            return json.dumps(result, default=str)
        except Exception as e:
            return f"Erro ao listar categorias: {str(e)}"

    # Retorna o array de ferramentas prontas para o LLM
    return [
        agent_add_transaction,
        agent_list_transactions,
        agent_get_dashboard_summary,
        agent_get_budget_status,
        agent_list_categories
    ]