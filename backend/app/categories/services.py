from sqlalchemy.orm import Session
from app.categories.models import Category
from app.categories.schemas import CategoryCreate
from app.users.models import User
from uuid import UUID


class CategoryService:

    def __init__(self, db: Session, user_id: UUID):
        self.db = db
        self.user = db.get(User, user_id)

        if not self.user:
            raise ValueError("Usuário não encontrado")

    # Criar categoria
    def create_category(self, data: CategoryCreate) -> Category:

        # evita duplicidade de nome para o mesmo usuário
        existing = self.db.query(Category).filter(
            Category.user_id == self.user.id,
            Category.name.ilike(data.name)
        ).first()

        if existing:
            raise ValueError("Categoria já existe")

        new_category = Category(
            name=data.name,
            type=data.type,
            color=data.color,
            user_id=self.user.id
        )

        self.db.add(new_category)
        self.db.commit()
        self.db.refresh(new_category)

        return new_category

    # Listar categorias do usuário
    def list_categories(self) -> list[Category]:
        return self.db.query(Category)\
            .filter(Category.user_id == self.user.id)\
            .order_by(Category.name.asc())\
            .all()

    # Buscar categoria por ID
    def get_category(self, category_id: UUID) -> Category:
        category = self.db.query(Category).filter(
            Category.id == category_id,
            Category.user_id == self.user.id
        ).first()

        if not category:
            raise ValueError("Categoria não encontrada")

        return category

    # Atualizar categoria
    def update_category(self, category_id: UUID, data: CategoryCreate) -> Category:
        category = self.get_category(category_id)

        category.name = data.name
        category.type = data.type
        category.color = data.color

        self.db.commit()
        self.db.refresh(category)

        return category

    # Deletar categoria
    def delete_category(self, category_id: UUID):
        category = self.get_category(category_id)

        # proteção: não deletar se houver transactions
        if category.transactions:
            raise ValueError("Não é possível deletar categoria com transações")

        self.db.delete(category)
        self.db.commit()



DEFAULT_CATEGORIES = [
    # DESPESAS
    {"name": "Moradia", "type": "expense", "color": "#ef4444"},
    {"name": "Alimentação", "type": "expense", "color": "#f97316"},
    {"name": "Transporte", "type": "expense", "color": "#eab308"},
    {"name": "Saúde", "type": "expense", "color": "#ec4899"},
    {"name": "Lazer", "type": "expense", "color": "#8b5cf6"},
    {"name": "Outros", "type": "expense", "color": "#6b7280"},

    # RECEITAS
    {"name": "Salário", "type": "income", "color": "#22c55e"},
    {"name": "Freelance", "type": "income", "color": "#10b981"},
    {"name": "Investimentos", "type": "income", "color": "#3b82f6"},
    {"name": "Outros", "type": "income", "color": "#4b5563"},
]

def create_default_categories(db, user_id):
    for data in DEFAULT_CATEGORIES:
        category = Category(
            name=data["name"],
            type=data["type"],
            color=data["color"],
            user_id=user_id,
            is_default=True,
        )
        db.add(category)

    db.commit()