from datetime import datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage, ToolMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from sqlalchemy.orm import Session

from app.agente_ia.schemas import ChatRequest, ChatResponse
from app.agente_ia.tools import get_tools_for_user
from app.core.dependecies import get_db
from app.core.security import get_current_user

router = APIRouter(prefix="/ai", tags=["AI Agent"])

llm = ChatGoogleGenerativeAI(model="gemini-3.1-flash-lite", temperature=0.2)


def extract_text(content) -> str:
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return " ".join(
            [
                block.get("text", "")
                for block in content
                if isinstance(block, dict) and "text" in block
            ]
        )
    return str(content)


@router.post("/chat", response_model=ChatResponse)
def chat_with_agent(
    request: ChatRequest,
    db: Session = Depends(get_db),
    token_payload: dict = Depends(get_current_user),
):
    user_id = UUID(token_payload["sub"])
    user_metadata = token_payload.get("user_metadata", {})
    user_name = user_metadata.get("name") or user_metadata.get("full_name") or "Usuario"

    hoje = datetime.now()
    ontem = hoje - timedelta(days=1)

    system_instruction = f"""
    Voce e o assistente financeiro do sistema FinanceFlow.

    CONTEXTO ATUAL:
    - Usuario: {user_name}
    - Data de HOJE: {hoje.strftime('%Y-%m-%d')}
    - Data de ONTEM: {ontem.strftime('%Y-%m-%d')}
    - Moeda: BRL

    REGRAS DE CATEGORIZACAO (use os nomes exatos abaixo no parametro category_name):
    - 'Alimentacao': mercado, supermercado, padaria, restaurante, ifood, sorvete, lanche, comida.
    - 'Transporte': gasolina, posto, uber, onibus, metro, estacionamento, pedagio.
    - 'Saude': farmacia, remedio, medico, consulta, dentista.
    - 'Lazer': cinema, show, netflix, spotify, jogo, bar.
    - 'Moradia': aluguel, luz, agua, internet, condominio.
    - 'Salario': pagamento, adiantamento, holerite.
    - 'Outros': qualquer coisa que nao se encaixe acima.

    REGRAS DE ACAO:
    1. Se o usuario relatar um gasto, chame a ferramenta agent_add_transaction com type='expense'.
    2. Use date em YYYY-MM-DD.
    3. Para recorrencia mensal:
       - salario/assinatura sem prazo: use is_recurring=true.
       - compra parcelada: use is_recurring=true e recurrence_occurrences=<parcelas>.
       - mensalidade com data final: use is_recurring=true e recurrence_end_date=YYYY-MM-DD.
    4. Se o usuario nao informar data, use a data de HOJE.
    5. Se a ferramenta retornar erro, explique o problema com clareza.
    """

    messages_for_llm = [SystemMessage(content=system_instruction)]

    for msg in request.messages:
        if msg.role == "user":
            messages_for_llm.append(HumanMessage(content=msg.content))
        elif msg.role == "model":
            messages_for_llm.append(AIMessage(content=msg.content))

    available_tools = get_tools_for_user(db, user_id)
    llm_with_tools = llm.bind_tools(available_tools)

    try:
        ai_response = llm_with_tools.invoke(messages_for_llm)
    except Exception as exc:
        return {
            "role": "model",
            "content": f"Desculpe, tive um problema de conexao ao processar sua mensagem: {str(exc)}",
        }

    if ai_response.tool_calls:
        messages_for_llm.append(ai_response)
        ultimo_erro_ferramenta = None

        for tool_call in ai_response.tool_calls:
            matched_tool = next((t for t in available_tools if t.name == tool_call["name"]), None)
            if not matched_tool:
                continue

            try:
                tool_output = matched_tool.invoke(tool_call["args"])
                if "Erro" in str(tool_output):
                    ultimo_erro_ferramenta = str(tool_output)
            except Exception as exc:
                tool_output = f"Erro na execucao da ferramenta: {str(exc)}"
                ultimo_erro_ferramenta = tool_output

            messages_for_llm.append(
                ToolMessage(
                    tool_call_id=tool_call["id"],
                    content=str(tool_output),
                    name=tool_call["name"],
                )
            )

        try:
            final_response = llm_with_tools.invoke(messages_for_llm)
            texto_final = extract_text(final_response.content)
        except Exception as exc:
            texto_final = f"A acao foi realizada, mas ocorreu erro ao formular resposta: {str(exc)}"

        if not texto_final.strip():
            if ultimo_erro_ferramenta:
                texto_final = f"Ops! Tentei registrar, mas o sistema avisou: {ultimo_erro_ferramenta}"
            else:
                texto_final = "Processamento concluido. Posso ajudar com mais algo?"

        return {"role": "model", "content": texto_final}

    texto_direto = extract_text(ai_response.content)
    if not texto_direto.strip():
        texto_direto = "Nao entendi muito bem. Pode detalhar melhor a transacao que quer registrar?"

    return {"role": "model", "content": texto_direto}
