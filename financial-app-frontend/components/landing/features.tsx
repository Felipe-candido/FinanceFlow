"use client"

import { 
  BarChart3, 
  Shield, 
  Smartphone, 
  Zap, 
  PiggyBank, 
  TrendingUp,
  Bell,
  CreditCard
} from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Dashboard Inteligente",
    description: "Visualize todas as suas finanças em um painel unificado com gráficos interativos e insights em tempo real.",
    color: "lime"
  },
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Criptografia de ponta e autenticação em duas etapas para proteger seus dados financeiros.",
    color: "cyan"
  },
  {
    icon: Smartphone,
    title: "Acesso em Qualquer Lugar",
    description: "Acesse pelo navegador em qualquer dispositivo, sincronizado em tempo real.",
    color: "lime"
  },
  {
    icon: Zap,
    title: "Categorização Inteligente",
    description: "Categorize transações de forma rápida e crie regras personalizadas para suas finanças.",
    color: "cyan"
  },
  {
    icon: PiggyBank,
    title: "Metas de Economia",
    description: "Defina objetivos financeiros e acompanhe seu progresso com projeções baseadas em seus hábitos.",
    color: "lime"
  },
  {
    icon: TrendingUp,
    title: "Relatórios Detalhados",
    description: "Receba relatórios completos sobre seus gastos e identifique oportunidades de economia.",
    color: "cyan"
  },
  {
    icon: Bell,
    title: "Alertas Personalizados",
    description: "Notificações inteligentes sobre vencimentos, gastos incomuns e lembretes importantes.",
    color: "lime"
  },
  {
    icon: CreditCard,
    title: "Controle de Cartões",
    description: "Gerencie seus gastos no cartão de crédito e débito com visualizações claras.",
    color: "cyan"
  }
]

export function Features() {
  return (
    <section id="modules" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d2a1c] to-[#0a1f15]" />
      
      {/* Accent Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#a3e635]/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#22d3ee]/30 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-[#a3e635] font-semibold tracking-wider text-sm mb-4">
            [ MÓDULOS PODEROSOS ]
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 text-balance">
            Tudo que você precisa para{" "}
            <span className="text-gradient-neon">dominar suas finanças</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Ferramentas profissionais simplificadas para você ter controle total 
            do seu dinheiro com facilidade e segurança.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-[#0d2a1c] border border-[#1f5c3d]/50 rounded-2xl p-6 hover:border-[#a3e635]/50 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Hover Glow */}
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                feature.color === 'lime' ? 'bg-[#a3e635]/5' : 'bg-[#22d3ee]/5'
              }`} />
              
              <div className="relative z-10">
                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  feature.color === 'lime' 
                    ? 'bg-[#a3e635]/10 text-[#a3e635]' 
                    : 'bg-[#22d3ee]/10 text-[#22d3ee]'
                }`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                
                {/* Content */}
                <h3 className="text-lg font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
