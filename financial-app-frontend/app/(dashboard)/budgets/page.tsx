"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { BudgetModal, type Budget } from "@/components/budget-modal"
import type { Category, CategoryTotal, DashboardResponse } from "@/lib/data"
import { getCategories } from "@/lib/api/transactions"
import { getDashboardData } from "@/lib/api/reports"
import { useAuth } from "@/contexts/authProvider"
import {
  AlertCircle,
  ArrowDownRight,
  CheckCircle2,
  Gauge,
  Pencil,
  PiggyBank,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react"

const STORAGE_KEY = "financeflow:budgets:v1"
const SAVINGS_GOAL_PERCENT = 20
const MAX_HEALTHY_USAGE = 80

type BudgetStatus = "good" | "warning" | "exceeded"

type BudgetView = Budget & {
  category?: Category
  spent: number
  remaining: number
  percentage: number
  status: BudgetStatus
}

function safePercentage(value: number, total: number) {
  if (total <= 0) return 0
  return (value / total) * 100
}

function getBudgetStatus(percentage: number): BudgetStatus {
  if (percentage >= 100) return "exceeded"
  if (percentage >= MAX_HEALTHY_USAGE) return "warning"
  return "good"
}

function getStatusStyles(status: BudgetStatus) {
  if (status === "exceeded") {
    return {
      label: "Acima do limite",
      badge: "border-destructive/50 text-destructive",
      icon: AlertCircle,
    }
  }

  if (status === "warning") {
    return {
      label: "Em atencao",
      badge: "border-warning/50 text-warning",
      icon: AlertCircle,
    }
  }

  return {
    label: "No plano",
    badge: "border-success/50 text-success",
    icon: CheckCircle2,
  }
}

export default function BudgetsPage() {
  const { token } = useAuth()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [budgetsLoaded, setBudgetsLoaded] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>(undefined)

  useEffect(() => {
    try {
      const storedBudgets = window.localStorage.getItem(STORAGE_KEY)

      if (storedBudgets) {
        setBudgets(JSON.parse(storedBudgets))
      }
    } catch (error) {
      console.error("Failed to load stored budgets", error)
    } finally {
      setBudgetsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!budgetsLoaded) return

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(budgets))
  }, [budgets, budgetsLoaded])

  useEffect(() => {
    async function loadBudgetContext() {
      if (!token) return

      try {
        setLoading(true)
        const [categoriesData, dashboard] = await Promise.all([
          getCategories(token),
          getDashboardData({ token }),
        ])

        setCategories(categoriesData)
        setDashboardData(dashboard)
      } catch (error) {
        console.error("Failed to load budget data", error)
      } finally {
        setLoading(false)
      }
    }

    loadBudgetContext()
  }, [token])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    }).format(value)
  }

  const expensesByCategory = useMemo(() => {
    const totals = new Map<string, number>()
    const expenses: CategoryTotal[] = dashboardData?.expenses_by_category ?? []

    expenses.forEach((item) => {
      totals.set(item.category, item.total)
    })

    return totals
  }, [dashboardData])

  const categoryById = useMemo(() => {
    const categoriesMap = new Map<string, Category>()

    categories.forEach((category) => {
      categoriesMap.set(category.id, category)
    })

    return categoriesMap
  }, [categories])

  const budgetViews = useMemo<BudgetView[]>(() => {
    return budgets
      .map((budget) => {
        const category = categoryById.get(budget.categoryId)
        const spent = category ? expensesByCategory.get(category.name) ?? 0 : 0
        const percentage = safePercentage(spent, budget.limit)
        const remaining = budget.limit - spent

        return {
          ...budget,
          category,
          spent,
          remaining,
          percentage,
          status: getBudgetStatus(percentage),
        }
      })
      .sort((a, b) => b.percentage - a.percentage)
  }, [budgets, categoryById, expensesByCategory])

  const totalBudget = budgetViews.reduce((sum, budget) => sum + budget.limit, 0)
  const totalSpent = budgetViews.reduce((sum, budget) => sum + budget.spent, 0)
  const totalRemaining = totalBudget - totalSpent
  const totalIncome = dashboardData?.total_income ?? 0
  const balance = dashboardData?.balance ?? 0
  const budgetUsage = safePercentage(totalSpent, totalBudget)
  const plannedBudgetRatio = safePercentage(totalBudget, totalIncome)
  const savingsGoal = totalIncome * (SAVINGS_GOAL_PERCENT / 100)
  const savingsGoalProgress = safePercentage(Math.max(balance, 0), savingsGoal)
  const healthyBudgets = budgetViews.filter((budget) => budget.status === "good").length
  const warningBudgets = budgetViews.filter((budget) => budget.status === "warning").length
  const exceededBudgets = budgetViews.filter((budget) => budget.status === "exceeded").length
  const usedCategoryIds = budgets.map((budget) => budget.categoryId)

  const monthlyDiagnosis = useMemo(() => {
    if (budgets.length === 0) {
      return "Crie limites para as principais categorias de despesa para acompanhar seu mes com mais clareza."
    }

    if (exceededBudgets > 0) {
      return "Priorize reduzir ou revisar os limites das categorias acima do planejado."
    }

    if (warningBudgets > 0) {
      return "Algumas categorias estao perto do limite. Evite novos gastos nelas ate o fechamento do mes."
    }

    if (balance >= savingsGoal && savingsGoal > 0) {
      return "Seu orcamento esta saudavel e a meta de reserva do mes esta no caminho certo."
    }

    return "O plano esta controlado. Acompanhe a meta de reserva para fechar o mes com folga."
  }, [balance, budgets.length, exceededBudgets, savingsGoal, warningBudgets])

  const handleSaveBudget = (budget: Budget) => {
    setBudgets((currentBudgets) => {
      const exists = currentBudgets.some((currentBudget) => currentBudget.id === budget.id)

      if (exists) {
        return currentBudgets.map((currentBudget) =>
          currentBudget.id === budget.id ? budget : currentBudget,
        )
      }

      return [...currentBudgets, budget]
    })

    setEditingBudget(undefined)
  }

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
    setModalOpen(true)
  }

  const handleDeleteBudget = (id: string) => {
    setBudgets((currentBudgets) => currentBudgets.filter((budget) => budget.id !== id))
  }

  const handleNewBudget = () => {
    setEditingBudget(undefined)
    setModalOpen(true)
  }

  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open)

    if (!open) {
      setEditingBudget(undefined)
    }
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orcamentos</h2>
          <p className="mt-1 text-muted-foreground">Planeje limites, metas e objetivos para o mes atual</p>
        </div>
        <Button size="lg" className="gap-2" onClick={handleNewBudget}>
          <Plus className="h-5 w-5" />
          Novo orcamento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Limite planejado</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            ) : (
              <>
                <div className="break-words text-2xl font-bold">{formatCurrency(totalBudget)}</div>
                <p className="mt-1 text-xs text-muted-foreground">{budgets.length} categorias com limite</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gasto no mes</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            ) : (
              <>
                <div className="break-words text-2xl font-bold text-destructive">{formatCurrency(totalSpent)}</div>
                <p className="mt-1 text-xs text-muted-foreground">{formatPercent(budgetUsage)}% do limite usado</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Disponivel</CardTitle>
            <Wallet className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            ) : (
              <>
                <div className={`break-words text-2xl font-bold ${totalRemaining >= 0 ? "text-success" : "text-destructive"}`}>
                  {formatCurrency(totalRemaining)}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {totalRemaining >= 0 ? "restante no plano" : "acima do planejado"}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Meta de reserva</CardTitle>
            <PiggyBank className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            ) : (
              <>
                <div className="break-words text-2xl font-bold">{formatCurrency(savingsGoal)}</div>
                <p className="mt-1 text-xs text-muted-foreground">{SAVINGS_GOAL_PERCENT}% das receitas do mes</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Plano geral do mes</CardTitle>
            <CardDescription>{monthlyDiagnosis}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-muted-foreground">Uso do orcamento</span>
                <span className="font-medium">
                  {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
                </span>
              </div>
              <Progress value={Math.min(budgetUsage, 100)} className="h-3" />
              <p className="text-sm text-muted-foreground">{formatPercent(budgetUsage)}% do limite mensal utilizado</p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Gauge className="h-4 w-4" />
                  Plano vs renda
                </div>
                <p className="mt-2 text-lg font-semibold">{formatPercent(plannedBudgetRatio)}%</p>
                <p className="text-xs text-muted-foreground">da renda planejada em limites</p>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  Categorias saudaveis
                </div>
                <p className="mt-2 text-lg font-semibold">{healthyBudgets} de {budgetViews.length}</p>
                <p className="text-xs text-muted-foreground">abaixo de {MAX_HEALTHY_USAGE}% do limite</p>
              </div>

              <div className="rounded-lg border p-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  Alertas
                </div>
                <p className="mt-2 text-lg font-semibold">{warningBudgets + exceededBudgets}</p>
                <p className="text-xs text-muted-foreground">categorias exigem atencao</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Objetivos</CardTitle>
            <CardDescription>Metas praticas para organizar as financas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Reserva mensal</span>
                <span className="font-medium">{formatPercent(savingsGoalProgress)}%</span>
              </div>
              <Progress value={Math.min(savingsGoalProgress, 100)} />
              <p className="text-xs text-muted-foreground">
                {formatCurrency(Math.max(balance, 0))} de {formatCurrency(savingsGoal)}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Manter gastos abaixo de 80%</span>
                <span className="font-medium">{formatPercent(Math.min(budgetUsage, 100))}%</span>
              </div>
              <Progress value={Math.min(budgetUsage, 100)} />
              <p className="text-xs text-muted-foreground">Ideal para preservar margem antes do fim do mes.</p>
            </div>

            <div className="rounded-lg border p-3">
              <p className="text-sm font-medium">Proxima acao recomendada</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {exceededBudgets > 0
                  ? "Revise as categorias acima do limite e reduza gastos variaveis."
                  : warningBudgets > 0
                    ? "Congele gastos nas categorias em atencao ate o proximo fechamento."
                    : "Defina limites para todas as categorias recorrentes de despesa."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold">Limites por categoria</h3>
            <p className="text-sm text-muted-foreground">Ordenado pelas categorias que mais consomem o limite.</p>
          </div>
          <Badge variant="outline">
            {healthyBudgets} ok · {warningBudgets} em atencao · {exceededBudgets} acima
          </Badge>
        </div>

        {budgetViews.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-1 text-lg font-semibold">Nenhum orcamento definido</h3>
              <p className="mb-4 max-w-sm text-center text-sm text-muted-foreground">
                Comece criando limites para as categorias que mais impactam seu mes.
              </p>
              <Button onClick={handleNewBudget}>
                <Plus className="mr-2 h-4 w-4" />
                Criar primeiro orcamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {budgetViews.map((budget) => {
              const statusStyle = getStatusStyles(budget.status)
              const StatusIcon = statusStyle.icon

              return (
                <Card key={budget.id}>
                  <CardHeader>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `${budget.category?.color ?? "#94a3b8"}20` }}
                        >
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: budget.category?.color ?? "#94a3b8" }} />
                        </div>
                        <div className="min-w-0">
                          <CardTitle className="truncate text-lg">{budget.category?.name ?? "Categoria removida"}</CardTitle>
                          <CardDescription className="mt-1">
                            {formatCurrency(budget.spent)} de {formatCurrency(budget.limit)}
                          </CardDescription>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={statusStyle.badge}>
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {formatPercent(budget.percentage)}%
                        </Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditBudget(budget)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteBudget(budget.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Progress value={Math.min(budget.percentage, 100)} className="h-3" />
                    <div className="grid gap-3 text-sm sm:grid-cols-3">
                      <div>
                        <p className="text-muted-foreground">Restante</p>
                        <p className={`font-semibold ${budget.remaining >= 0 ? "text-success" : "text-destructive"}`}>
                          {formatCurrency(Math.abs(budget.remaining))}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Status</p>
                        <p className="font-semibold">{statusStyle.label}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Limite diario sugerido</p>
                        <p className="font-semibold">{formatCurrency(Math.max(budget.remaining, 0) / 30)}</p>
                      </div>
                    </div>

                    {budget.status !== "good" && (
                      <div
                        className={`flex items-start gap-2 rounded-lg border p-3 ${
                          budget.status === "exceeded"
                            ? "border-destructive/20 bg-destructive/5"
                            : "border-warning/20 bg-warning/5"
                        }`}
                      >
                        <AlertCircle
                          className={`mt-0.5 h-4 w-4 ${
                            budget.status === "exceeded" ? "text-destructive" : "text-warning"
                          }`}
                        />
                        <p className={`text-sm ${budget.status === "exceeded" ? "text-destructive" : "text-warning"}`}>
                          {budget.status === "exceeded"
                            ? "Esta categoria ultrapassou o limite. Replaneje o mes ou reduza gastos futuros."
                            : "Esta categoria esta proxima do limite. Evite novos gastos ate o fechamento."}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <BudgetModal
        open={modalOpen}
        onOpenChange={handleModalOpenChange}
        onSave={handleSaveBudget}
        categories={categories}
        usedCategoryIds={usedCategoryIds}
        editingBudget={editingBudget}
      />
    </div>
  )
}
