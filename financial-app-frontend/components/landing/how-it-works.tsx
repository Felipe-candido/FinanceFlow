"use client"

const steps = [
  {
    number: "01",
    title: "Crie sua conta",
    description: "Cadastro rápido em menos de 2 minutos. Sem burocracia, sem complicação.",
    accent: "lime"
  },
  {
    number: "02",
    title: "Adicione suas finanças",
    description: "Registre suas despesas e receitas de forma rápida e organize por categorias.",
    accent: "cyan"
  },
  {
    number: "03",
    title: "Visualize tudo",
    description: "Acesse dashboards intuitivos com todas as suas finanças em tempo real.",
    accent: "lime"
  },
  {
    number: "04",
    title: "Alcance suas metas",
    description: "Use insights inteligentes para economizar mais e conquistar seus objetivos.",
    accent: "cyan"
  }
]

export function HowItWorks() {
  return (
    <section id="how-it-works" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0a1f15]" />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, #a3e635 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="inline-block text-[#22d3ee] font-semibold tracking-wider text-sm mb-4">
            [ COMO FUNCIONA ]
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 text-balance">
            Comece a controlar suas finanças{" "}
            <span className="text-[#22d3ee]">em 4 passos simples</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1f5c3d] to-transparent hidden lg:block" />
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Card */}
                <div className="relative bg-[#0d2a1c] border border-[#1f5c3d]/50 rounded-2xl p-8 text-center group hover:border-[#a3e635]/50 transition-all duration-300">
                  {/* Number */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 text-2xl font-bold ${
                    step.accent === 'lime' 
                      ? 'bg-[#a3e635]/10 text-[#a3e635] border-2 border-[#a3e635]/30' 
                      : 'bg-[#22d3ee]/10 text-[#22d3ee] border-2 border-[#22d3ee]/30'
                  }`}>
                    {step.number}
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow - Hidden on last item and mobile */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#a3e635]">
                      <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
