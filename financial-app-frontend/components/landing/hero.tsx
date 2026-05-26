"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

export function Hero() {
  return (
    <section className="relative min-h-screen pt-20 lg:pt-0 flex items-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1f15] via-[#0d2a1c] to-[#143d29]" />
      
      {/* Animated Gradient Orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#a3e635]/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-[#22d3ee]/10 rounded-full blur-3xl animate-pulse delay-1000" />
      
      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#a3e635 1px, transparent 1px), linear-gradient(90deg, #a3e635 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight tracking-tight">
              DOMINE SUAS{" "}
              <span className="text-gradient-neon">FINANÇAS PESSOAIS</span>{" "}
              COM CLAREZA E{" "}
              <span className="text-[#22d3ee]">SEGURANÇA TOTAL</span>
            </h1>
            
            <p className="mt-6 text-xl lg:text-2xl font-semibold text-[#a3e635]">
              CONTROLE SEU FLUXO DE CAIXA AGORA.
            </p>
            
            <p className="mt-4 text-gray-400 text-lg max-w-xl mx-auto lg:mx-0">
              A plataforma completa para gerenciar suas finanças pessoais com inteligência, 
              segurança e visualizações poderosas.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button 
                asChild
                size="lg"
                className="bg-[#a3e635] text-[#0a1f15] hover:bg-[#84cc16] font-bold text-lg px-8 py-6 glow-lime transition-all duration-300 group"
              >
                <Link href="/register">
                  [ Começar Teste Grátis ]
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              
              <Button 
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white/30 text-white hover:border-[#22d3ee] hover:text-[#22d3ee] font-semibold text-lg px-8 py-6 bg-transparent transition-all duration-300 group"
              >
                <Link href="#how-it-works">
                  <Play className="mr-2 w-5 h-5" />
                  [ Ver Como Funciona ]
                </Link>
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center gap-6 justify-center lg:justify-start">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#a3e635] rounded-full animate-pulse" />
                <span className="text-gray-400 text-sm">14 dias grátis</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#22d3ee] rounded-full animate-pulse" />
                <span className="text-gray-400 text-sm">+10.000 usuários</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#a3e635] rounded-full animate-pulse" />
                <span className="text-gray-400 text-sm">Dados seguros</span>
              </div>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative">
            {/* Glow Effect Behind Image */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#a3e635]/20 to-[#22d3ee]/20 blur-3xl transform scale-110" />
            
            {/* Dashboard Preview */}
            <div className="relative rounded-2xl border border-[#1f5c3d]/50 bg-[#0d2a1c]/80 backdrop-blur-sm p-4 shadow-2xl">
              {/* Browser Bar */}
              <div className="flex items-center gap-2 pb-4 border-b border-[#1f5c3d]/30">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <div className="ml-4 flex-1 h-6 bg-[#143d29] rounded-md flex items-center px-3">
                  <span className="text-xs text-gray-500">app.financeflow.com</span>
                </div>
              </div>
              
              {/* Dashboard Content */}
              <div className="mt-4 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">Saldo Total</p>
                    <p className="text-3xl font-bold text-white">R$ 45.892,00</p>
                  </div>
                  <div className="flex items-center gap-2 bg-[#a3e635]/10 text-[#a3e635] px-3 py-1 rounded-full">
                    <span className="text-sm font-semibold">+12.5%</span>
                  </div>
                </div>
                
                {/* Chart Preview */}
                <div className="h-40 flex items-end gap-2 pt-4">
                  {[40, 65, 45, 80, 55, 90, 70, 85, 60, 95, 75, 88].map((height, i) => (
                    <div 
                      key={i} 
                      className="flex-1 rounded-t-sm transition-all duration-300"
                      style={{ 
                        height: `${height}%`,
                        background: i % 2 === 0 
                          ? 'linear-gradient(to top, #a3e635, #84cc16)' 
                          : 'linear-gradient(to top, #22d3ee, #06b6d4)'
                      }}
                    />
                  ))}
                </div>
                
                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#1f5c3d]/30">
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Receitas</p>
                    <p className="text-[#a3e635] font-semibold">R$ 8.450</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Despesas</p>
                    <p className="text-[#22d3ee] font-semibold">R$ 3.280</p>
                  </div>
                  <div className="text-center">
                    <p className="text-gray-400 text-xs">Economia</p>
                    <p className="text-white font-semibold">R$ 5.170</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Card - Income */}
            <div className="absolute -left-8 top-1/4 bg-[#143d29] border border-[#1f5c3d] rounded-xl p-4 shadow-xl hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#a3e635]/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#a3e635]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Receita Mensal</p>
                  <p className="text-lg font-bold text-[#a3e635]">+R$ 12.450</p>
                </div>
              </div>
            </div>

            {/* Floating Card - Savings */}
            <div className="absolute -right-4 bottom-1/4 bg-[#143d29] border border-[#1f5c3d] rounded-xl p-4 shadow-xl hidden lg:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#22d3ee]/20 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#22d3ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Meta Atingida</p>
                  <p className="text-lg font-bold text-[#22d3ee]">87%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}