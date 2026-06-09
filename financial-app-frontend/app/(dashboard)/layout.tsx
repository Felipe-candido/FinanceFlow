"use client"

import type React from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardMobileNav } from "@/components/dashboard-mobile-nav"
import { Loader2 } from "lucide-react"
import { createCheckoutSession } from "@/lib/api/payments"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    async function checkSubscription() {
      // 1. Pega a sessão atual do usuário
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        router.push("/login")
        return
      }

      // 2. Busca o perfil do usuário no banco (Supabase) para ver o status
      const { data: profile, error } = await supabase
        .from("users") 
        .select("subscription_status")
        .eq("id", session.user.id)
        .single()

      if (error || !profile) {
        console.error("Erro ao buscar perfil:", error)
        router.push("/login")
        return
      }

      // 3. Regra de Negócio: Quem pode acessar o Dashboard?
      const validStatuses = ["trialing", "active"]
      const hasAccess = validStatuses.includes(profile.subscription_status)

      if (!hasAccess) {
        // Se o status for nulo (conta nova), 'canceled' ou 'past_due', manda pro checkout
        try {
          const checkout = await createCheckoutSession(session.access_token)
          window.location.href = checkout.url
        } catch (err) {
          console.error("Erro ao gerar checkout de bloqueio", err)
          // Opcional: redirecionar para uma página amigável de "Assinatura Pendente"
        }
      } else {
        // Usuário pagante ou no trial! Libera o acesso.
        setIsAuthorized(true)
      }
    }

    checkSubscription()
  }, [router])

  // Enquanto verifica no banco de dados, mostra um loading (evita que o dashboard pisque na tela)
  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="ml-3 font-medium">Verificando assinatura...</p>
      </div>
    )
  }
  
  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-6">{children}</main>
        <DashboardMobileNav />
      </div>
    </div>
  )
}
