// lib/api/chat.ts
export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface ChatMessage {
  role: "user" | "model" | "system" | "tool";
  content: string;
}

interface ChatRequest {
  token: string;
  messages: ChatMessage[];
}

export async function sendChatMessage({
  token,
  messages,
}: ChatRequest): Promise<ChatMessage> {
  const response = await fetch(`${API_URL}/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!response.ok) {
    throw new Error("Erro ao comunicar com o Agente de IA");
  }

  return response.json();
}