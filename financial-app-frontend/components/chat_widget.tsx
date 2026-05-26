"use client"

import { useState, useRef, useEffect } from "react"
import { MessageCircle, X, Send, Loader2, Bot } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/authProvider"
import { sendChatMessage, ChatMessage } from "@/lib/api/chat"

interface ChatWidgetProps {
  onTransactionAdded?: () => void; // Para recarregar o dashboard quando o bot adicionar algo
}

export function ChatWidget({ onTransactionAdded }: ChatWidgetProps) {
  const { token } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "model", content: "Olá! Sou seu assistente FinanceFlow. Como posso ajudar com suas finanças hoje?" }
  ])
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Rola para o final quando uma nova mensagem chega
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || !token || isLoading) return

    const userMsg: ChatMessage = { role: "user", content: input }
    const newMessages = [...messages, userMsg]
    
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)

    try {
      // Envia todo o histórico para o backend stateless
      const aiResponse = await sendChatMessage({ 
        token, 
        messages: newMessages 
      })
      
      setMessages([...newMessages, aiResponse])
      
      // Se a resposta contiver palavras-chave indicando que ele salvou algo, avisa o Dashboard para recarregar
      if (aiResponse.content.toLowerCase().includes("adicionada") || aiResponse.content.toLowerCase().includes("sucesso")) {
        onTransactionAdded?.()
      }
      
    } catch (error) {
      console.error("Erro no chat:", error)
      setMessages([...newMessages, { role: "model", content: "Desculpe, tive um problema ao processar sua mensagem. Tente novamente." }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <Card className="w-80 sm:w-96 h-[500px] mb-4 shadow-xl flex flex-col border-2 border-primary/20 animate-in slide-in-from-bottom-5">
          <CardHeader className="p-4 border-b bg-muted/30 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-md flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              Assistente IA
            </CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          <CardContent className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm ${
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-muted rounded-tl-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted max-w-[85%] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processando...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          <div className="p-3 border-t bg-background">
            <div className="flex items-center gap-2 relative">
              <input 
                type="text" 
                placeholder="Ex: Gastei R$ 40 com almoço..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isLoading}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button size="icon" disabled={!input.trim() || isLoading} onClick={handleSend} className="shrink-0">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {!isOpen && (
        <Button 
          onClick={() => setIsOpen(true)} 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}