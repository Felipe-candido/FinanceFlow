"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import {
  ArrowRight,
  BarChart3,
  Check,
  Clock3,
  LayoutDashboard,
  Layers3,
  LineChart,
  Star,
  Wallet,
} from "lucide-react"
import { useAuth } from "@/contexts/authProvider"
import { createCheckoutSession } from "@/lib/api/payments"

const screenshots = [
  {
    id: "dashboard",
    label: "Dashboard",
    title: "Visão geral do seu mês",
    description:
      "Saldo atual, receitas, despesas e últimos lançamentos em uma interface limpa e intuitiva.",
    image: "/landing/dashboard-rendeu.png",
    alt: "Dashboard do Rendeu com saldo, receitas, despesas e transações recentes",
    bullets: [
      "Saldo, receitas e despesas em destaque",
      "Gráfico de gastos por categoria",
      "Últimas transações sempre à vista",
      "Ranking dos maiores gastos do mês",
    ],
  },
  {
    id: "transacoes",
    label: "Transações",
    title: "Gerencie cada centavo",
    description:
      "Adicione, edite e filtre transações com facilidade. Pesquise por nome, data, tipo ou categoria.",
    image: "/landing/transacoes-rendeu.png",
    alt: "Tela de transações do Rendeu com filtros e lista agrupada por data",
    bullets: [
      "Filtros por data, tipo e categoria",
      "Busca por nome ou descrição",
      "Histórico agrupado por data",
      "Recorrentes e parceladas automáticas",
    ],
  },
  {
    id: "orcamento",
    label: "Orçamentos",
    title: "Orçamentos que funcionam",
    description:
      "Defina limites por categoria e acompanhe o progresso em tempo real antes do gasto sair do controle.",
    image: "/landing/orcamento-rendeu.png",
    alt: "Tela de orçamentos do Rendeu com limite mensal e progresso por categoria",
    bullets: [
      "Limite mensal por categoria",
      "Alertas ao atingir o limite",
      "Progresso visual com barra de uso",
      "Metas e objetivos financeiros",
    ],
  },
  {
    id: "relatorios",
    label: "Relatórios",
    title: "Entenda sua evolução",
    description:
      "Relatórios dos últimos 6 meses com gráficos, diagnóstico de saúde financeira e ranking de despesas.",
    image: "/landing/relatorios-rendeu.png",
    alt: "Tela de relatórios do Rendeu com gráficos e diagnóstico financeiro",
    bullets: [
      "Evolução de receitas, despesas e saldo",
      "Diagnóstico de saúde financeira",
      "Indicadores-chave personalizados",
      "Ranking e distribuição de despesas",
    ],
  },
]

const featureCards = [
  {
    icon: LayoutDashboard,
    title: "Dashboard em tempo real",
    description:
      "Saldo, receitas e despesas do mês sempre visíveis para entender onde seu dinheiro foi parar.",
  },
  {
    icon: Clock3,
    title: "Transações recorrentes",
    description:
      "Cadastre assinaturas, salário e parcelas uma única vez. O Rendeu lança tudo automaticamente.",
  },
  {
    icon: Layers3,
    title: "Orçamentos por categoria",
    description:
      "Defina limites de gastos por categoria e acompanhe o progresso com alertas automáticos.",
  },
  {
    icon: BarChart3,
    title: "Relatórios detalhados",
    description:
      "Evolução, distribuição de gastos e indicadores financeiros em um relatório visual.",
  },
]

const steps = [
  ["01", "Crie sua conta", "Cadastro com email e senha. Sem burocracia e sem formulários longos."],
  ["02", "Defina categorias", "Categorias padrão já vêm configuradas. Personalize como quiser."],
  ["03", "Registre gastos", "Adicione receitas e despesas manualmente ou via assistente de IA."],
  ["04", "Acompanhe tudo", "Dashboard, relatórios e orçamentos atualizados em tempo real."],
]

const testimonials = [
  {
    quote:
      "Finalmente entendo para onde vai meu dinheiro todo mês. O dashboard é limpo e os relatórios mostram exatamente o que preciso.",
    name: "Marina Costa",
    role: "Empresária",
    initials: "MC",
  },
  {
    quote:
      "O sistema de orçamentos por categoria mudou minha relação com dinheiro. Sei exatamente quando estou gastando demais.",
    name: "Roberto Almeida",
    role: "Desenvolvedor",
    initials: "RA",
  },
  {
    quote:
      "Economizei R$800 por mês identificando gastos que nem sabia que tinha. A visualização por categoria é muito clara.",
    name: "Fernando Lima",
    role: "Professor",
    initials: "FL",
  },
]

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-sm leading-6 text-[#6b6860]">
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#ebf5ef] text-[#2d7a4f]">
        <Check className="size-3.5" strokeWidth={2.5} />
      </span>
      <span>{children}</span>
    </li>
  )
}

function Logo() {
  return (
    <span className="flex items-center gap-2 font-semibold text-[#1a1916]">
      <span className="flex size-8 items-center justify-center rounded-lg bg-[#2d7a4f] text-white">
        <Wallet className="size-4" />
      </span>
      Rendeu
    </span>
  )
}

function ScreenshotFrame({
  src,
  alt,
  className = "",
  priority = false,
}: {
  src: string
  alt: string
  className?: string
  priority?: boolean
}) {
  return (
    <div className={`overflow-hidden rounded-lg border border-[#e8e6e1] bg-white shadow-[0_12px_34px_rgba(0,0,0,0.08)] ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={1920}
        height={1080}
        priority={priority}
        className="h-auto w-full"
        sizes="(max-width: 768px) 92vw, 960px"
      />
    </div>
  )
}

function ProductStack() {
  const stack = [screenshots[3], screenshots[2], screenshots[1], screenshots[0]]

  return (
    <div className="relative mx-auto h-[520px] w-full max-w-[720px] sm:h-[600px] lg:h-[560px]">
      {stack.map((item, index) => {
        const positions = [
          "left-0 top-0 z-10 rotate-[-1.5deg]",
          "left-[9%] top-[88px] z-20 rotate-[-0.5deg]",
          "left-[18%] top-[176px] z-30 rotate-[0.7deg]",
          "left-[27%] top-[264px] z-40 rotate-0",
        ]

        return (
          <ScreenshotFrame
            key={item.id}
            src={item.image}
            alt={item.alt}
            priority={index === 3}
            className={`absolute w-[72%] transition-transform duration-300 hover:z-50 hover:scale-[1.04] ${positions[index]}`}
          />
        )
      })}
    </div>
  )
}

export default function LandingPage() {
  const router = useRouter()
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState(screenshots[0])
  const [checkoutLoading, setCheckoutLoading] = useState(false)
  const [checkoutError, setCheckoutError] = useState("")

  const startCheckout = async () => {
    setCheckoutError("")

    if (!token) {
      router.push("/register?checkout=1")
      return
    }

    setCheckoutLoading(true)
    try {
      const session = await createCheckoutSession(token)
      window.location.href = session.url
    } catch (error) {
      console.error("CHECKOUT ERROR:", error)
      setCheckoutError(
        error instanceof Error
          ? error.message
          : "Nao foi possivel iniciar o checkout",
      )
    } finally {
      setCheckoutLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-[#fafaf8] text-[#1a1916]">
      <header className="sticky top-0 z-50 border-b border-[#e8e6e1] bg-[#fafaf8]/90 px-5 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between">
          <Link href="/" aria-label="Rendeu">
            <Logo />
          </Link>

          <nav className="hidden items-center gap-8 text-sm text-[#6b6860] md:flex">
            <a href="#funcionalidades" className="hover:text-[#1a1916]">
              Funcionalidades
            </a>
            <a href="#como-funciona" className="hover:text-[#1a1916]">
              Como funciona
            </a>
            <a href="#planos" className="hover:text-[#1a1916]">
              Planos
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden text-sm text-[#6b6860] hover:text-[#1a1916] sm:inline">
              Entrar
            </Link>
            <Link
              href="/register?checkout=1"
              className="rounded-lg bg-[#2d7a4f] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#246040]"
            >
              Começar grátis
            </Link>
          </div>
        </div>
      </header>

      <section className="px-5 pb-0 pt-20 text-center">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-[#ebf5ef] px-4 py-1.5 text-sm font-medium text-[#2d7a4f]">
            <span className="size-1.5 rounded-full bg-[#2d7a4f]" />
            Grátis por 14 dias sem cartão
          </div>
          <h1 className="mx-auto max-w-3xl text-5xl font-semibold leading-tight text-[#1a1916] sm:text-6xl lg:text-7xl">
            Suas finanças, finalmente organizadas
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-[#6b6860]">
            Controle receitas, despesas e orçamentos em um só lugar. Simples o suficiente para usar todo dia.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register?checkout=1"
              className="inline-flex items-center gap-2 rounded-lg bg-[#2d7a4f] px-7 py-3.5 text-sm font-medium text-white transition-colors hover:bg-[#246040]"
            >
              Criar conta grátis
              <ArrowRight className="size-4" />
            </Link>
            <a
              href="#funcionalidades"
              className="rounded-lg border border-[#2d7a4f] px-7 py-3.5 text-sm font-medium text-[#2d7a4f] transition-colors hover:bg-[#ebf5ef]"
            >
              Ver funcionalidades
            </a>
          </div>
          <p className="mt-4 text-sm text-[#6b6860]">
            Sem cobrança durante o teste. Cancele quando quiser.
          </p>
          <ScreenshotFrame
            src="/landing/dashboard-rendeu.png"
            alt="Dashboard principal do Rendeu"
            priority
            className="mx-auto mt-16 max-w-5xl rounded-b-none"
          />
        </div>
      </section>

      <section className="border-y border-[#e8e6e1] bg-white px-5 py-10">
        <div className="mx-auto grid max-w-6xl gap-8 text-center sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["+10k", "Usuários ativos"],
            ["R$50M+", "Gerenciados mensalmente"],
            ["4,8/5", "Avaliação média"],
            ["99,9%", "Disponibilidade"],
          ].map(([number, label]) => (
            <div key={label} className="lg:border-r lg:border-[#e8e6e1] lg:last:border-r-0">
              <span className="block text-4xl font-semibold text-[#1a1916]">{number}</span>
              <span className="mt-1 block text-sm text-[#6b6860]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      <section id="funcionalidades" className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="max-w-2xl">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#2d7a4f]">
              Funcionalidades
            </span>
            <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Tudo que você precisa, nada que não precisa
            </h2>
            <p className="mt-5 text-lg leading-8 text-[#6b6860]">
              Ferramentas essenciais para quem quer ter controle real do próprio dinheiro sem complicação.
            </p>
          </div>

          <div className="mt-14 grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#2d7a4f]">
                O produto
              </span>
              <h3 className="mt-4 text-3xl font-semibold leading-tight">
                Uma visão completa das suas finanças
              </h3>
              <p className="mt-4 leading-7 text-[#6b6860]">
                A escada de telas agora aparece logo no início das funcionalidades, com mais deslocamento e menos sobreposição para cada área do app ficar visível.
              </p>
              <ul className="mt-8 space-y-3">
                <CheckItem>Dashboard com saldo, receitas e despesas do mês</CheckItem>
                <CheckItem>Histórico completo de transações com filtros</CheckItem>
                <CheckItem>Orçamentos mensais por categoria com alertas</CheckItem>
                <CheckItem>Relatórios visuais dos últimos 6 meses</CheckItem>
              </ul>
            </div>
            <ProductStack />
          </div>

          <div className="mt-20 grid overflow-hidden rounded-lg border border-[#e8e6e1] bg-[#e8e6e1] sm:grid-cols-2">
            {featureCards.map((feature) => (
              <div key={feature.title} className="bg-white p-8 sm:p-10">
                <div className="mb-5 flex size-11 items-center justify-center rounded-lg bg-[#ebf5ef] text-[#2d7a4f]">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6b6860]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="produto" className="bg-white px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#2d7a4f]">
            Explore o produto
          </span>
          <h2 className="mt-4 max-w-xl text-4xl font-semibold leading-tight sm:text-5xl">
            Cada tela, pensada para você
          </h2>

          <div className="mt-10 flex flex-wrap gap-2">
            {screenshots.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item)}
                className={`rounded-full border px-5 py-2 text-sm transition-colors ${
                  activeTab.id === item.id
                    ? "border-[#1a1916] bg-[#1a1916] text-white"
                    : "border-[#e8e6e1] bg-white text-[#6b6860] hover:border-[#1a1916] hover:text-[#1a1916]"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-12 grid items-center gap-12 lg:grid-cols-[0.75fr_1.25fr]">
            <div>
              <h3 className="text-3xl font-semibold leading-tight">{activeTab.title}</h3>
              <p className="mt-4 leading-7 text-[#6b6860]">{activeTab.description}</p>
              <ul className="mt-8 space-y-3">
                {activeTab.bullets.map((bullet) => (
                  <CheckItem key={bullet}>{bullet}</CheckItem>
                ))}
              </ul>
            </div>
            <ScreenshotFrame src={activeTab.image} alt={activeTab.alt} />
          </div>
        </div>
      </section>

      <section id="como-funciona" className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#2d7a4f]">
            Como funciona
          </span>
          <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-tight sm:text-5xl">
            Comece em menos de 5 minutos
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([number, title, description]) => (
              <div key={number}>
                <div className="mb-5 flex size-10 items-center justify-center rounded-lg bg-[#ebf5ef] text-sm font-semibold text-[#2d7a4f]">
                  {number}
                </div>
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#6b6860]">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f4f7f5] px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#2d7a4f]">
            Depoimentos
          </span>
          <h2 className="mt-4 max-w-lg text-4xl font-semibold leading-tight sm:text-5xl">
            O que nossos usuarios dizem
          </h2>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <article key={item.name} className="rounded-lg border border-[#e8e6e1] bg-white p-7">
                <div className="mb-5 flex gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="size-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm italic leading-7 text-[#1a1916]">"{item.quote}"</p>
                <div className="mt-7 flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-[#ebf5ef] text-xs font-semibold text-[#2d7a4f]">
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-[#6b6860]">{item.role}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="planos" className="px-5 py-24">
        <div className="mx-auto max-w-6xl text-center">
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#2d7a4f]">
            Planos
          </span>
          <h2 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
            Um preço simples, sem surpresas
          </h2>
          <p className="mx-auto mt-5 max-w-md leading-7 text-[#6b6860]">
            Acesso completo a todas as funcionalidades por um valor justo.
          </p>

          <div className="mx-auto mt-14 max-w-md overflow-hidden rounded-lg border border-[#e8e6e1] bg-white text-left shadow-[0_12px_34px_rgba(0,0,0,0.06)]">
            <div className="h-1 bg-[#2d7a4f]" />
            <div className="p-8 sm:p-10">
              <span className="rounded-full bg-[#ebf5ef] px-4 py-1.5 text-xs font-semibold text-[#2d7a4f]">
                14 dias grátis
              </span>
              <p className="mt-7 text-sm font-medium">Rendeu Pro</p>
              <div className="mt-2 text-5xl font-semibold">
                R$19<span className="text-2xl">,79</span>
              </div>
              <p className="mt-2 text-sm text-[#6b6860]">por mês, após o período de teste</p>
              <ul className="mt-8 space-y-3">
                {[
                  "Dashboard completo com gráficos",
                  "Transações ilimitadas",
                  "Orçamentos por categoria",
                  "Relatórios mensais detalhados",
                  "Transações recorrentes automáticas",
                  "Assistente de IA para lançamentos",
                  "Cancele quando quiser",
                ].map((item) => (
                  <CheckItem key={item}>{item}</CheckItem>
                ))}
              </ul>
              <button
                type="button"
                onClick={startCheckout}
                disabled={checkoutLoading}
                className="mt-9 block w-full rounded-lg bg-[#2d7a4f] px-7 py-3.5 text-center text-sm font-medium text-white transition-colors hover:bg-[#246040] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {checkoutLoading ? "Abrindo checkout..." : "Começar teste grátis"}
              </button>
              {checkoutError && (
                <p className="mt-3 text-center text-xs text-red-600">{checkoutError}</p>
              )}
              <p className="mt-4 text-center text-xs text-[#6b6860]">
                Sem cobrança durante os 14 dias de teste
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#1a1916] px-5 py-24 text-center text-white">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-4xl font-semibold leading-tight sm:text-6xl">
            Pronto para colocar as finanças em ordem?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-8 text-white/60">
            Comece hoje. Configure em 5 minutos. Veja resultados em 30 dias.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/register?checkout=1"
              className="rounded-lg bg-white px-7 py-3.5 text-sm font-medium text-[#1a1916] transition-opacity hover:opacity-90"
            >
              Criar conta grátis
            </Link>
            <a
              href="#produto"
              className="rounded-lg border border-white/30 px-7 py-3.5 text-sm font-medium text-white/75 transition-colors hover:border-white hover:text-white"
            >
              Ver o produto
            </a>
          </div>
          <p className="mt-5 text-xs text-white/40">
            14 dias grátis. Sem cobrança no teste. Cancele a qualquer momento.
          </p>
        </div>
      </section>

      <footer className="border-t border-[#e8e6e1] bg-white px-5 py-12">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <Logo />
          <p className="text-sm text-[#6b6860]">© 2026 Rendeu. Todos os direitos reservados.</p>
          <div className="flex gap-6 text-sm text-[#6b6860]">
            <a href="#" className="hover:text-[#1a1916]">
              Privacidade
            </a>
            <a href="#" className="hover:text-[#1a1916]">
              Termos
            </a>
            <a href="#" className="hover:text-[#1a1916]">
              Suporte
            </a>
          </div>
        </div>
      </footer>
    </main>
  )
}
