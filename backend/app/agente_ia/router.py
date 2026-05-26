from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
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

    hoje = datetime.now()
    ontem = hoje - timedelta(days=1)
    
    # 1. PROMPT TURBINADO COM MAPEAMENTO DE PALAVRAS-CHAVE
    system_instruction = f"""
    Você é o assistente financeiro do sistema FinanceFlow.
    
    CONTEXTO ATUAL:
    - Usuário: {user_name}
    - Data de HOJE: {hoje.strftime('%Y-%m-%d')}
    - Data de ONTEM: {ontem.strftime('%Y-%m-%d')}
    - Moeda: BRL
    
    REGRAS DE CATEGORIZAÇÃO (Use APENAS os nomes EXATOS abaixo no parâmetro category_name):
    - 'Alimentacao': mercado, supermercado, padaria, restaurante, ifood, sorvete, lanche, comida.
    - 'Transporte': gasolina, posto, uber, onibus, metro, estacionamento, pedagio.
    - 'Saude': farmacia, remedio, medico, consulta, dentista.
    - 'Lazer': cinema, show, netflix, spotify, jogo, bar.
    - 'Moradia': aluguel, luz, agua, internet, condominio.
    - 'Salario': pagamento, adiantamento, holerite.
    - 'Outros': qualquer coisa que não se encaixe acima.
    
    REGRAS DE AÇÃO:
    1. Se o usuário relatar um gasto, CHAME a ferramenta 'agent_add_transaction' usando o tipo 'expense' e tente deduzir a categoria com base nas regras acima.
    2. Use as datas do contexto para formatar 'date' como YYYY-MM-DD.
    3. Se a ferramenta retornar um Erro, avise o usuário qual foi o problema.
    """
    
    messages_for_llm = [SystemMessage(content=system_instruction)]
    
    for msg in request.messages:
        if msg.role == "user":
            messages_for_llm.append(HumanMessage(content=msg.content))
        elif msg.role == "model":
            messages_for_llm.append(AIMessage(content=msg.content))
            
    available_tools = get_tools_for_user(db, user_id)
    llm_with_tools = llm.bind_tools(available_tools)
    
    # 1. Primeira invocação com Try/Except
    try:
        ai_response = llm_with_tools.invoke(messages_for_llm)
    except Exception as e:
        return {"role": "model", "content": f"Desculpe, tive um problema de conexão ao processar sua mensagem: {str(e)}"}
    
    if ai_response.tool_calls:
        messages_for_llm.append(ai_response)
        ultimo_erro_ferramenta = None 
        
        for tool_call in ai_response.tool_calls:
            matched_tool = next((t for t in available_tools if t.name == tool_call["name"]), None)
            if matched_tool:
                try:
                    tool_output = matched_tool.invoke(tool_call["args"])
                    if "Erro" in str(tool_output):
                        ultimo_erro_ferramenta = str(tool_output)
                except Exception as e:
                    tool_output = f"Erro na execução da ferramenta: {str(e)}"
                    ultimo_erro_ferramenta = tool_output
                    
                messages_for_llm.append(
                    ToolMessage(
                        tool_call_id=tool_call["id"],
                        content=str(tool_output),
                        name=tool_call["name"]
                    )
                )
        
        # 2. Segunda invocação (Resposta final) com Try/Except
        try:
            final_response = llm_with_tools.invoke(messages_for_llm)
            texto_final = extract_text(final_response.content)
        except Exception as e:
            texto_final = f"A ação foi realizada, mas ocorreu um erro ao formular a resposta: {str(e)}"
        
        # 3. FALLBACK DINÂMICO E TRANSPARENTE
        if not texto_final.strip():
            if ultimo_erro_ferramenta:
                texto_final = f"Ops! Tentei registrar, mas o sistema avisou: {ultimo_erro_ferramenta}"
            else:
                texto_final = "Processamento concluído. Posso ajudar com mais algo?"
                
        return {"role": "model", "content": texto_final}

    # 4. Retorno direto caso não use ferramentas
    texto_direto = extract_text(ai_response.content)
    if not texto_direto.strip():
        texto_direto = "Não entendi muito bem. Pode detalhar melhor a transação que quer registrar?"
        
    return {"role": "model", "content": texto_direto}