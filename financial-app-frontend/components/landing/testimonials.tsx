"use client"

import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Marina Costa",
    role: "Empresária",
    content: "O Rendeu transformou completamente minha relação com dinheiro. Agora tenho clareza total sobre para onde vai cada centavo.",
    rating: 5,
    avatar: "MC"
  },
  {
    name: "Roberto Almeida",
    role: "Desenvolvedor",
    content: "Finalmente consegui organizar minhas finanças de forma simples. Os gráficos e relatórios são muito intuitivos!",
    rating: 5,
    avatar: "RA"
  },
  {
    name: "Juliana Santos",
    role: "Designer",
    content: "Os relatórios visuais são lindos e me ajudam a entender meus gastos de forma intuitiva. Recomendo para todos!",
    rating: 5,
    avatar: "JS"
  },
  {
    name: "Carlos Eduardo",
    role: "Consultor",
    content: "Ter uma visão clara de todas as minhas despesas e receitas mudou minha forma de planejar o futuro financeiro.",
    rating: 5,
    avatar: "CE"
  },
  {
    name: "Ana Beatriz",
    role: "Médica",
    content: "Com a rotina corrida, precisava de algo prático. O Rendeu me ajuda a manter tudo organizado sem perder tempo.",
    rating: 5,
    avatar: "AB"
  },
  {
    name: "Fernando Lima",
    role: "Professor",
    content: "Consegui economizar R$ 800 por mês identificando gastos desnecessários que nem sabia que tinha. Ferramenta essencial!",
    rating: 5,
    avatar: "FL"
  }
]

export function Testimonials() {
  return (
    <section id="community" className="relative py-24 lg:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1f15] via-[#0d2a1c] to-[#0a1f15]" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-[#a3e635] font-semibold tracking-wider text-sm mb-4">
            [ COMUNIDADE ]
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 text-balance">
            Milhares de pessoas já{" "}
            <span className="text-[#22d3ee]">transformaram</span> suas finanças
          </h2>
          <p className="text-gray-400 text-lg">
            Veja o que nossos usuários estão falando sobre a experiência com o Rendeu.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-[#0d2a1c] border border-[#1f5c3d]/50 rounded-2xl p-6 hover:border-[#a3e635]/30 transition-all duration-300"
            >
              {/* Rating */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#a3e635] text-[#a3e635]" />
                ))}
              </div>
              
              {/* Content */}
              <p className="text-gray-300 leading-relaxed mb-6">
                &ldquo;{testimonial.content}&rdquo;
              </p>
              
              {/* Author */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#a3e635] to-[#22d3ee] flex items-center justify-center text-[#0a1f15] font-semibold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-white font-medium">{testimonial.name}</p>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { value: "10K+", label: "Usuários Ativos" },
            { value: "R$ 50M+", label: "Gerenciados" },
            { value: "4.8", label: "Avaliação Média" },
            { value: "99.9%", label: "Uptime" }
          ].map((stat, index) => (
            <div key={index} className="text-center p-6 bg-[#143d29]/50 rounded-xl border border-[#1f5c3d]/30">
              <p className="text-3xl lg:text-4xl font-bold text-gradient-neon mb-2">
                {stat.value}
              </p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
