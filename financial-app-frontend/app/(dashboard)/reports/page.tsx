"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { CategoryTotal, DashboardResponse, Transaction } from "@/lib/data"
import { getDashboardData } from "@/lib/api/reports"
import { useAuth } from "@/contexts/authProvider"
import { formatDatePtBr } from "@/lib/date"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Download,
  LineChart as LineChartIcon,
  PiggyBank,
  Target,
  Wallet,
} from "lucide-react"

const MONTHS = [
  { label: "Janeiro", value: 1 },
  { label: "Fevereiro", value: 2 },
  { label: "Marco", value: 3 },
  { label: "Abril", value: 4 },
  { label: "Maio", value: 5 },
  { label: "Junho", value: 6 },
  { label: "Julho", value: 7 },
  { label: "Agosto", value: 8 },
  { label: "Setembro", value: 9 },
  { label: "Outubro", value: 10 },
  { label: "Novembro", value: 11 },
  { label: "Dezembro", value: 12 },
]

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
const CURRENT_YEAR = new Date().getFullYear()
const YEARS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR]

type MonthlyEntry = {
  month: string
  period: string
  receitas: number
  despesas: number
  saldo: number
  economia: number
}

type Period = {
  month: number
  year: number
}

function getLast6Months(month?: number, year?: number) {
  const now = new Date()
  const baseMonth = month ?? now.getMonth() + 1
  const baseYear = year ?? now.getFullYear()

  return Array.from({ length: 6 }, (_, index) => {
    const offset = 5 - index
    const date = new Date(baseYear, baseMonth - 1 - offset, 1)

    return {
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    }
  })
}

function getPeriodLabel(period?: Period) {
  if (!period) return ""

  return `${MONTHS[period.month - 1]?.label ?? ""} de ${period.year}`
}

export default function ReportsPage() {
  const [chartType, setChartType] = useState<"bar" | "line">("bar")
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [loadingMain, setLoadingMain] = useState(false)
  const [loadingChart, setLoadingChart] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined)
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined)
  const [monthlyData, setMonthlyData] = useState<MonthlyEntry[]>([])
  const cache = useRef<Record<string, DashboardResponse>>({})
  const { token } = useAuth()

  const incomeData: CategoryTotal[] = dashboardData?.income_by_category ?? []
  const expensesData: CategoryTotal[] = dashboardData?.expenses_by_category ?? []
  const recentTransactions: Transaction[] = dashboardData?.last_transactions ?? []
  const balance = dashboardData?.balance ?? 0
  const totalIncome = dashboardData?.total_income ?? 0
  const totalExpense = dashboardData?.total_expense ?? 0

  const expenseRatio = totalIncome > 0 ? (totalExpense / totalIncome) * 100 : 0
  const savingsRate = totalIncome > 0 ? (balance / totalIncome) * 100 : 0
  const topExpense = expensesData[0]
  const topIncome = incomeData[0]

  const previousMonth = monthlyData.at(-2)
  const currentMonth = monthlyData.at(-1)
  const balanceTrend = previousMonth && currentMonth ? currentMonth.saldo - previousMonth.saldo : 0
  const chartEndPeriod = useMemo(() => {
    const periods = getLast6Months(selectedMonth, selectedYear)

    return periods.at(-1)
  }, [selectedMonth, selectedYear])
  const averageExpense =
    monthlyData.length > 0
      ? monthlyData.reduce((total, month) => total + month.despesas, 0) / monthlyData.length
      : 0

  const financialStatus = useMemo(() => {
    if (totalIncome === 0 && totalExpense === 0) {
      return {
        label: "Sem dados no periodo",
        tone: "secondary" as const,
        text: "Registre receitas e despesas para gerar uma analise mais precisa.",
      }
    }

    if (savingsRate >= 20) {
      return {
        label: "Saude financeira forte",
        tone: "default" as const,
        text: "Voce esta mantendo uma boa margem entre receitas e despesas.",
      }
    }

    if (savingsRate >= 0) {
      return {
        label: "Periodo equilibrado",
        tone: "secondary" as const,
        text: "O saldo esta positivo, mas ainda existe pouco espaco para reserva.",
      }
    }

    return {
      label: "Atencao ao orcamento",
      tone: "destructive" as const,
      text: "As despesas passaram das receitas neste periodo.",
    }
  }, [savingsRate, totalExpense, totalIncome])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  const formatPercent = (value: number) =>
    new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 1,
      minimumFractionDigits: 1,
    }).format(value)

  const formatDate = (date: string | Date | null) => {
    return formatDatePtBr(date, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  }

  async function loadMainData(month?: number, year?: number) {
    if (!token) return

    try {
      setLoadingMain(true)
      const data = await getDashboardData({ token, month, year })
      setDashboardData(data)
    } catch (error) {
      console.error("Error loading reports data:", error)
    } finally {
      setLoadingMain(false)
    }
  }

  async function loadChartData(month?: number, year?: number) {
    if (!token) return

    try {
      setLoadingChart(true)
      const last6 = getLast6Months(month, year)
      const results = await Promise.allSettled(
        last6.map((period) => {
          const key = `${period.month}-${period.year}`

          if (cache.current[key]) {
            return Promise.resolve(cache.current[key])
          }

          return getDashboardData({ token, month: period.month, year: period.year }).then((data) => {
            cache.current[key] = data
            return data
          })
        }),
      )

      setMonthlyData(
        last6.map((period, index) => {
          const result = results[index]
          const data = result.status === "fulfilled" ? result.value : null
          const income = data?.total_income ?? 0
          const expense = data?.total_expense ?? 0
          const balanceValue = income - expense

          return {
            month: MONTH_LABELS[period.month - 1],
            period: `${MONTH_LABELS[period.month - 1]}/${String(period.year).slice(-2)}`,
            receitas: income,
            despesas: expense,
            saldo: balanceValue,
            economia: income > 0 ? (balanceValue / income) * 100 : 0,
          }
        }),
      )
    } catch (error) {
      console.error("Error loading monthly reports:", error)
      setMonthlyData([])
    } finally {
      setLoadingChart(false)
    }
  }

  useEffect(() => {
    if (!token) return

    loadMainData(selectedMonth, selectedYear)
    loadChartData(selectedMonth, selectedYear)
  }, [token, selectedMonth, selectedYear])

  const exportCsv = () => {
    if (!dashboardData) return

    const selectedPeriod = `${selectedMonth ?? new Date().getMonth() + 1}/${selectedYear ?? CURRENT_YEAR}`
    const categoryRows = [
      ...expensesData.map((item) => ["Despesa", item.category, item.total]),
      ...incomeData.map((item) => ["Receita", item.category, item.total]),
    ]
    const rows = [
      ["Periodo", selectedPeriod],
      ["Receitas", totalIncome],
      ["Despesas", totalExpense],
      ["Saldo", balance],
      ["Taxa de economia", `${formatPercent(savingsRate)}%`],
      [],
      ["Tipo", "Categoria", "Total"],
      ...categoryRows,
    ]

    const csv = rows
      .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(";"))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = "relatorio-financeiro.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null

    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg">
        <p className="mb-2 font-medium">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.dataKey} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.dataKey === "economia" ? `${formatPercent(entry.value)}%` : formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatorios</h2>
          <p className="mt-1 text-muted-foreground">Analise financeira pessoal do periodo</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={selectedMonth !== undefined ? String(selectedMonth) : "all"}
            onValueChange={(value) => setSelectedMonth(value === "all" ? undefined : Number(value))}
          >
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <SelectValue placeholder="Mes" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Mes atual</SelectItem>
              {MONTHS.map((month) => (
                <SelectItem key={month.value} value={String(month.value)}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedYear !== undefined ? String(selectedYear) : "all"}
            onValueChange={(value) => setSelectedYear(value === "all" ? undefined : Number(value))}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Ano atual</SelectItem>
              {YEARS.map((year) => (
                <SelectItem key={year} value={String(year)}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2 bg-transparent" onClick={exportCsv} disabled={!dashboardData}>
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receitas</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            {loadingMain ? (
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            ) : (
              <div className="break-words text-xl font-bold text-success md:text-2xl">{formatCurrency(totalIncome)}</div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {loadingMain ? (
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            ) : (
              <div className="break-words text-xl font-bold text-destructive md:text-2xl">{formatCurrency(totalExpense)}</div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loadingMain ? (
              <div className="h-8 w-32 animate-pulse rounded bg-muted" />
            ) : (
              <div className={`break-words text-xl font-bold md:text-2xl ${balance >= 0 ? "text-success" : "text-destructive"}`}>
                {formatCurrency(balance)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="min-w-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Economia</CardTitle>
            <PiggyBank className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loadingMain ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted" />
            ) : (
              <>
                <div className={`break-words text-xl font-bold md:text-2xl ${savingsRate >= 0 ? "text-success" : "text-destructive"}`}>
                  {formatPercent(savingsRate)}%
                </div>
                <p className="mt-1 text-xs text-muted-foreground">do total recebido</p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Evolucao dos ultimos 6 meses</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Receitas, despesas e saldo ate {getPeriodLabel(chartEndPeriod)}
                </p>
              </div>
              <Select value={chartType} onValueChange={(value: "bar" | "line") => setChartType(value)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bar">Barras</SelectItem>
                  <SelectItem value="line">Linhas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loadingChart ? (
              <div className="flex h-[340px] items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  <span className="text-sm">Carregando grafico...</span>
                </div>
              </div>
            ) : monthlyData.length === 0 ? (
              <div className="flex h-[340px] items-center justify-center text-sm text-muted-foreground">
                Nao foi possivel carregar a evolucao mensal
              </div>
            ) : (
              <div className="h-[340px]">
                <ResponsiveContainer width="100%" height="100%">
                  {chartType === "bar" ? (
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      
                      {/* Receitas: Verde */}
                      <Bar dataKey="receitas" fill="#22c55e" name="Receitas" radius={[6, 6, 0, 0]} />
                      
                      {/* Despesas: Vermelho */}
                      <Bar dataKey="despesas" fill="#ef4444" name="Despesas" radius={[6, 6, 0, 0]} />
                      
                      {/* Saldo: Lógica condicional (Azul/Laranja) */}
                      <Bar dataKey="saldo" name="Saldo" radius={[6, 6, 0, 0]}>
                        {monthlyData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.saldo >= 0 ? "#3b82f6" : "#f97316"} 
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  ) : (
                    // ... (mantenha o LineChart se desejar, ou atualize as cores lá também)
                    <LineChart data={monthlyData}>
                      {/* Sugestão: atualize as cores das linhas para combinar */}
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="period" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line type="monotone" dataKey="receitas" stroke="#22c55e" strokeWidth={3} name="Receitas" dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="despesas" stroke="#ef4444" strokeWidth={3} name="Despesas" dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="saldo" stroke="#3b82f6" strokeWidth={3} name="Saldo" dot={{ r: 4 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle>Diagnostico</CardTitle>
                <Badge variant={financialStatus.tone}>{financialStatus.label}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{financialStatus.text}</p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Comprometimento da renda</span>
                  <span className="font-medium">{formatPercent(expenseRatio)}%</span>
                </div>
                <Progress value={Math.min(expenseRatio, 100)} />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="h-4 w-4" />
                    Maior despesa
                  </div>
                  <p className="mt-2 font-semibold">{topExpense?.category ?? "Sem despesas"}</p>
                  <p className="text-sm text-muted-foreground">{formatCurrency(topExpense?.total ?? 0)}</p>
                </div>

                <div className="rounded-lg border p-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <LineChartIcon className="h-4 w-4" />
                    Tendencia do saldo
                  </div>
                  <p className={`mt-2 font-semibold ${balanceTrend >= 0 ? "text-success" : "text-destructive"}`}>
                    {balanceTrend >= 0 ? "+" : ""}
                    {formatCurrency(balanceTrend)}
                  </p>
                  <p className="text-sm text-muted-foreground">vs. mes anterior</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Indicadores chave</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Media de despesas</span>
                <span className="font-semibold">{formatCurrency(averageExpense)}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Receita principal</span>
                <span className="font-semibold">{topIncome?.category ?? "Sem receitas"}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Categorias com gasto</span>
                <span className="font-semibold">{expensesData.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuicao das despesas</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMain ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : expensesData.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                Nenhuma despesa no periodo
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expensesData}
                      dataKey="total"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={95}
                      paddingAngle={2}
                    >
                      {expensesData.map((entry) => (
                        <Cell key={entry.category} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ranking de despesas</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMain ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    <div className="h-2 w-full animate-pulse rounded bg-muted" />
                  </div>
                ))}
              </div>
            ) : expensesData.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                Nenhuma categoria para analisar
              </div>
            ) : (
              <div className="space-y-4">
                {expensesData.map((item) => {
                  const percentage = totalExpense > 0 ? (item.total / totalExpense) * 100 : 0

                  return (
                    <div key={item.category} className="space-y-2">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-2">
                          <div className="h-3 w-3 flex-shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="truncate font-medium">{item.category}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">{formatCurrency(item.total)}</div>
                          <div className="text-xs text-muted-foreground">{formatPercent(percentage)}%</div>
                        </div>
                      </div>
                      <Progress value={Math.min(percentage, 100)} />
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Receitas por categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMain ? (
              <div className="flex h-[300px] items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            ) : incomeData.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                Nenhuma receita no periodo
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeData} layout="vertical" margin={{ left: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={90} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="total" radius={[0, 6, 6, 0]}>
                      {incomeData.map((entry) => (
                        <Cell key={entry.category} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ultimas transacoes</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMain ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="h-12 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : recentTransactions.length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                Nenhuma transacao recente
              </div>
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center gap-3 rounded-lg border p-3">
                    <div
                      className="h-10 w-10 flex-shrink-0 rounded-lg"
                      style={{ backgroundColor: `${transaction.category?.color ?? "#94a3b8"}30` }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{transaction.description || "Sem descricao"}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.category?.name} - {formatDate(transaction.date)}
                      </p>
                    </div>
                    <div className={`font-semibold ${transaction.type === "income" ? "text-success" : "text-destructive"}`}>
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {expenseRatio > 80 && (
        <Card className="border-destructive/40">
          <CardContent className="flex gap-3 pt-6">
            <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
            <div>
              <p className="font-semibold">Despesas acima de 80% da renda</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Este periodo tem pouco espaco para reserva. Revise as maiores categorias de gasto antes de assumir novos compromissos.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
