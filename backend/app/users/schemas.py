from pydantic import BaseModel
from uuid import UUID

class UserSchema(BaseModel):
    id: UUID
    email: str
    name: str | None
    last_name: str | None

    class Config:
        from_attributes = True