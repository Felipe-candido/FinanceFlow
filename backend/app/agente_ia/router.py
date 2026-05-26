from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from uuid import UUID

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, ToolMessage

from app.core.dependecies import get_db
from app.core.security import get_current_user
from app.agente_ia.schemas import ChatRequest, ChatResponse
from app.agente_ia.tools import get_tools_for_user

router = APIRouter(prefix="/ai", tags=["AI Agent"])

llm = ChatGoogleGenerativeAI(model="gemini-3.5-flash", temperature=0.2)

def extract_text(content) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return " ".join([b.get("text", "") for b in content if isinstance(b, dict) and "text" in b])
    return str(content)

@router.post("/chat", response_model=ChatResponse)
def chat_with_agent(
    request: ChatRequest,
    db: Session = Depends(get_db),
    token_payload: dict = Depends(get_current_user)
):
    user_id = UUID(token_payload["sub"])
    user_metadata = token_payload.get("user_metadata", {})
    user_name = user_metadata.get("name") or user_metadata.get("full_name") or "Usuário"

    current_date = datetime.now().strftime("%A, %d de %B de %Y")
    
    system_instruction = f"""
    Você é o assistente financeiro do sistema FinanceFlow.
    Contexto: Usuário {user_name}, Data {current_date}, Moeda BRL.
    Se o usuário solicitar registrar algo, use a ferramenta 'agent_add_transaction'.
    Se ele perguntar sobre gastos ou saldo, use 'agent_get_dashboard_summary'.
    """
    
    messages_for_llm = [SystemMessage(content=system_instruction)]
    
    for msg in request.messages:
        if msg.role == "user":
            messages_for_llm.append(HumanMessage(content=msg.content))
        elif msg.role == "model":
            messages_for_llm.append(AIMessage(content=msg.content))
            
    available_tools = get_tools_for_user(db, user_id)
    llm_with_tools = llm.bind_tools(available_tools)
    
    # 1. Primeira invocação
    ai_response = llm_with_tools.invoke(messages_for_llm)
    
    # 2. SE houver tool_calls, executamos e reinvocamos o LLM
    if ai_response.tool_calls:
        messages_for_llm.append(ai_response)
        
        for tool_call in ai_response.tool_calls:
            matched_tool = next((t for t in available_tools if t.name == tool_call["name"]), None)
            if matched_tool:
                tool_output = matched_tool.invoke(tool_call["args"])
                messages_for_llm.append(
                    ToolMessage(
                        tool_call_id=tool_call["id"],
                        content=str(tool_output),
                        name=tool_call["name"]
                    )
                )
        
        # Segunda invocação (Resposta final)
        final_response = llm_with_tools.invoke(messages_for_llm)
        return {"role": "model", "content": extract_text(final_response.content)}

    # 3. Se NÃO houver tool_calls, retorna o que o LLM respondeu direto
    return {"role": "model", "content": extract_text(ai_response.content)}