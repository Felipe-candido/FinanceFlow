"use client"

import { Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

const features = [
  "Dashboard completo com gráficos interativos",
  "Categorização inteligente de transações",
  "Metas de economia personalizadas",
  "Relatórios detalhados mensais",
  "Alertas e notificações personalizadas",
  "Controle de cartões de crédito e débito",
  "Acesso em qualquer dispositivo",
  "Criptografia e segurança de dados",
  "Suporte por email prioritário",
  "Atualizações e novos recursos inclusos"
]

export function Pricing() {
  return (
    <section id="plans" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0d2a1c]" />
      
      {/* Accent Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a3e635]/30 to-transparent" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-[#22d3ee] font-semibold tracking-wider text-sm mb-4">
            [ PLANO SIMPLES ]
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 text-balance">
            Um plano completo,{" "}
            <span className="text-[#a3e635]">sem surpresas</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Acesso a todas as funcionalidades por um preço justo. Comece com 14 dias grátis.
          </p>
        </div>

        {/* Single Pricing Card */}
        <div className="relative max-w-xl mx-auto">
          {/* Glow Effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#a3e635]/20 to-[#22d3ee]/20 rounded-3xl blur-xl" />
          
          <div className="relative bg-gradient-to-b from-[#1a4a32] to-[#143d29] border-2 border-[#a3e635]/50 rounded-2xl p-8 lg:p-10">
            {/* Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-[#a3e635] text-[#0a1f15] text-sm font-bold px-4 py-1.5 rounded-full flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                14 DIAS GRÁTIS
              </span>
            </div>

            {/* Plan Header */}
            <div className="text-center mb-8 pt-4">
              <h3 className="text-2xl font-bold text-white mb-2">Rendeu Pro</h3>
              <p className="text-gray-400 text-sm mb-6">Tudo que você precisa para dominar suas finanças</p>
              
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl lg:text-6xl font-bold text-[#a3e635]">
                  R$ 19,79
                </span>
                <span className="text-gray-400 text-lg">/mês</span>
              </div>
              
              <p className="text-gray-500 text-sm mt-2">
                Após o período de teste gratuito
              </p>
            </div>

            {/* Features List */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#a3e635]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-[#a3e635]" />
                  </div>
                  <span className="text-gray-300 text-sm">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <Button 
              size="lg"
              className="w-full bg-[#a3e635] text-[#0a1f15] hover:bg-[#84cc16] font-bold text-lg py-6 glow-lime transition-all duration-300"
            >
              Começar Trial Grátis de 14 Dias
            </Button>

            {/* Trust Note */}
            <p className="text-center text-gray-500 text-xs mt-4">
              Sem necessidade de cartão de crédito para começar
            </p>
          </div>
        </div>

        {/* Additional Trust Elements */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-gray-500 text-sm">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#a3e635]" />
            <span>Cancele quando quiser</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#a3e635]" />
            <span>Sem taxas escondidas</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-[#a3e635]" />
            <span>Suporte incluso</span>
          </div>
        </div>
      </div>
    </section>
  )
}
