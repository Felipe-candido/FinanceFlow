from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class CategoryBase(BaseModel):
    name: str
    type: str
    color: Optional[str] = None


class CategoryCreate(CategoryBase):
    pass


class CategoryResponse(CategoryBase):
    id: UUID

    model_config = {
        "from_attributes": True
    }