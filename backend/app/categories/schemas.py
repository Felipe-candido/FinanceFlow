from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class CategoryBase(BaseModel):
    name: str
    type: str
    color: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    color: Optional[str] = None


class CategoryResponse(CategoryBase):
    id: UUID
    is_default: bool

    model_config = {
        "from_attributes": True
    }
