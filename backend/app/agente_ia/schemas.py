from pydantic import BaseModel, Field
from typing import List, Literal

class MessageItem(BaseModel):
    role: Literal["user", "model", "system", "tool"]
    content: str
    
class ChatRequest(BaseModel):
    messages: List[MessageItem] = Field(
        ..., 
        description="Array contendo o histórico da conversa, terminando com a mensagem atual do usuário."
    )
    # Opcional: podemos receber o timezone do frontend no futuro para formatação de datas
    # timezone: str = "America/Sao_Paulo"

class ChatResponse(BaseModel):
    role: str = "model"
    content: str