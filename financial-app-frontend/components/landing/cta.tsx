"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  return (
    <section className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f15] via-[#143d29] to-[#0d2a1c]" />
      
      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#a3e635]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#22d3ee]/10 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <span className="inline-block bg-[#a3e635]/10 text-[#a3e635] font-semibold tracking-wider text-sm px-4 py-2 rounded-full mb-8 border border-[#a3e635]/30">
          ⚡ OFERTA LIMITADA
        </span>

        {/* Headline */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 text-balance">
          Comece a transformar suas{" "}
          <span className="text-gradient-neon">finanças hoje</span>
        </h2>
        
        <p className="text-gray-400 text-lg lg:text-xl max-w-2xl mx-auto mb-10">
          Junte-se a milhares de pessoas que já estão no controle total de suas 
          finanças pessoais. Teste grátis por 14 dias, sem compromisso.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            size="lg"
            className="bg-[#a3e635] text-[#0a1f15] hover:bg-[#84cc16] font-bold text-lg px-10 py-7 glow-lime transition-all duration-300 group"
          >
            Começar Meu Trial Grátis
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            size="lg"
            variant="outline"
            className="border-2 border-white/30 text-white hover:border-[#22d3ee] hover:text-[#22d3ee] font-semibold text-lg px-10 py-7 bg-transparent transition-all duration-300"
          >
            Agendar Demonstração
          </Button>
        </div>

        {/* Trust Elements */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#a3e635]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-gray-300 text-sm">Dados 100% seguros</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#22d3ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <span className="text-gray-300 text-sm">Sem cartão de crédito</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#a3e635]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-300 text-sm">Setup em 2 minutos</span>
          </div>
        </div>
      </div>
    </section>
  )
}
