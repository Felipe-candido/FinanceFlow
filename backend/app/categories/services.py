import unicodedata
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.categories.models import Category
from app.categories.schemas import CategoryCreate, CategoryUpdate
from app.users.models import User


# ---------------------------------------------------------
# FUNÇÃO AUXILIAR PARA REMOVER ACENTOS E DEIXAR MINÚSCULO
# ---------------------------------------------------------
def normalize_string(text: str) -> str:
    if not text:
        return ""
    # Transforma "Salário" em "salario", "Alimentação" em "alimentacao", etc.
    return unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('utf-8').lower()


class CategoryService:
    def __init__(self, db: Session, user_id: UUID):
        self.db = db
        self.user = db.get(User, user_id)

        if not self.user:
            raise HTTPException(status_code=404, detail="User not found")

    def create_category(self, data: CategoryCreate) -> Category:
        self._validate_type(data.type)

        # Busca as categorias do tipo específico e compara na memória (sem acento)
        user_categories = self.db.query(Category).filter(
            Category.user_id == self.user.id,
            Category.type == data.type,
        ).all()

        normalized_new_name = normalize_string(data.name)
        for cat in user_categories:
            if normalize_string(cat.name) == normalized_new_name:
                raise HTTPException(status_code=409, detail="Category already exists")

        new_category = Category(
            name=data.name,
            type=data.type,
            color=data.color,
            user_id=self.user.id,
        )

        self.db.add(new_category)
        self.db.commit()
        self.db.refresh(new_category)

        return new_category

    def list_categories(self) -> list[Category]:
        categories = self.db.query(Category)\
            .filter(Category.user_id == self.user.id)\
            .order_by(Category.type.asc(), Category.name.asc())\
            .all()

        if categories:
            return categories

        ensure_default_categories(self.db, self.user.id)
        self.db.commit()

        return self.db.query(Category)\
            .filter(Category.user_id == self.user.id)\
            .order_by(Category.type.asc(), Category.name.asc())\
            .all()

    def get_category(self, category_id: UUID) -> Category:
        category = self.db.query(Category).filter(
            Category.id == category_id,
            Category.user_id == self.user.id,
        ).first()

        if not category:
            raise HTTPException(status_code=404, detail="Category not found")

        return category

    def update_category(self, category_id: UUID, data: CategoryUpdate) -> Category:
        category = self.get_category(category_id)

        if data.type is not None:
            self._validate_type(data.type)
            category.type = data.type

        if data.name is not None:
            # Busca todas menos a própria categoria sendo editada
            user_categories = self.db.query(Category).filter(
                Category.user_id == self.user.id,
                Category.type == category.type,
                Category.id != category.id,
            ).all()

            normalized_new_name = normalize_string(data.name)
            for cat in user_categories:
                if normalize_string(cat.name) == normalized_new_name:
                    raise HTTPException(status_code=409, detail="Category already exists")
                    
            category.name = data.name

        if data.color is not None:
            category.color = data.color

        self.db.commit()
        self.db.refresh(category)

        return category

    def delete_category(self, category_id: UUID):
        category = self.get_category(category_id)

        if category.transactions:
            raise HTTPException(
                status_code=409,
                detail="Category cannot be deleted while it has transactions",
            )

        self.db.delete(category)
        self.db.commit()

        return {"message": "Deleted successfully"}

    @staticmethod
    def _validate_type(type_: str) -> None:
        if type_ not in {"income", "expense"}:
            raise HTTPException(status_code=422, detail="Invalid category type")


DEFAULT_CATEGORIES = [
    {"name": "Moradia", "type": "expense", "color": "#ff1f1f"},
    {"name": "Alimentacao", "type": "expense", "color": "#f97316"},
    {"name": "Transporte", "type": "expense", "color": "#eab308"},
    {"name": "Saude", "type": "expense", "color": "#ec4863"},
    {"name": "Lazer", "type": "expense", "color": "#ff6200"},
    {"name": "Outros", "type": "expense", "color": "#6b7280"},
    {"name": "Salário", "type": "income", "color": "#22c55e"},
    {"name": "Freelance", "type": "income", "color": "#10b981"},
    {"name": "Investimentos", "type": "income", "color": "#3b82f6"},
    {"name": "Outros", "type": "income", "color": "#4b5563"},
]


def ensure_default_categories(db: Session, user_id: UUID) -> None:
    # Agora a comparação ignora acentos completamente
    existing = {
        (normalize_string(category.name), category.type)
        for category in db.query(Category).filter(Category.user_id == user_id).all()
    }

    for data in DEFAULT_CATEGORIES:
        key = (normalize_string(data["name"]), data["type"])
        if key in existing:
            continue

        db.add(
            Category(
                name=data["name"],
                type=data["type"],
                color=data["color"],
                user_id=user_id,
                is_default=True,
            )
        )
        existing.add(key)


def create_default_categories(db: Session, user_id: UUID) -> None:
    ensure_default_categories(db, user_id)
    db.commit()