"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CategoryTotal, DashboardResponse } from "@/lib/data"
import { getDashboardData } from "@/lib/api/reports"
import { useAuth } from "@/contexts/authProvider"
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts"
import { TrendingUp, TrendingDown, Calendar, Download } from "lucide-react"

const MONTHS = [
  { label: "Janeiro", value: 1 },
  { label: "Fevereiro", value: 2 },
  { label: "Março", value: 3 },
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

function getLast6Months(month?: number, year?: number) {
  const now = new Date()
  const baseMonth = month ?? now.getMonth() + 1
  const baseYear = year ?? now.getFullYear()

  const months = []
  for (let i = 5; i >= 0; i--) {
    let m = baseMonth - i
    let y = baseYear
    if (m <= 0) {
      m += 12
      y -= 1
    }
    months.push({ month: m, year: y })
  }
  return months
}

type MonthlyEntry = { month: string; receitas: number; despesas: number }

export default function ReportsPage() {
  const [chartType, setChartType] = useState<"bar" | "line">("bar")
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [loadingMain, setLoadingMain] = useState(false)
  const [loadingChart, setLoadingChart] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined)
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined)
  const [monthlyData, setMonthlyData] = useState<MonthlyEntry[]>([])
  const cache = useRef<Record<string, any>>({})

  const { token } = useAuth()

  const incomeData: CategoryTotal[] = dashboardData?.income_by_category ?? []
  const expensesData: CategoryTotal[] = dashboardData?.expenses_by_category ?? []
  const balance = dashboardData?.balance ?? 0
  const totalIncome = dashboardData?.total_income ?? 0
  const totalExpense = dashboardData?.total_expense ?? 0
  const balancePercent = totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : "0"

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)

  async function loadMainData(month?: number, year?: number) {
    if (!token) return
    try {
      setLoadingMain(true)
      const data = await getDashboardData({ token, month, year })
      setDashboardData(data)
    } catch (error) {
      console.error("Error loading main data:", error)
    } finally {
      setLoadingMain(false)
    }
  }

  async function loadChartData(month?: number, year?: number) {
    if (!token) return
    try {
      setLoadingChart(true)
      const last6 = getLast6Months(month, year)
      const results = await Promise.all(
        last6.map((m) => {
          const key = `${m.month}-${m.year}`
          if (cache.current[key]) return Promise.resolve(cache.current[key])
          return getDashboardData({ token, month: m.month, year: m.year }).then((data) => {
            cache.current[key] = data
            return data
          })
        })
      )
      setMonthlyData(
        last6.map((m, index) => ({
          month: MONTH_LABELS[m.month - 1],
          receitas: results[index]?.total_income ?? 0,
          despesas: results[index]?.total_expense ?? 0,
        }))
      )
    } catch (error) {
      console.error("Error loading chart data:", error)
    } finally {
      setLoadingChart(false)
    }
  }

  useEffect(() => {
    if (!token) return
    loadMainData(selectedMonth, selectedYear)
    loadChartData(selectedMonth, selectedYear)
  }, [token, selectedMonth, selectedYear])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="bg-card border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
          <p className="text-muted-foreground mt-1">Análise detalhada das suas finanças</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={selectedMonth !== undefined ? String(selectedMonth) : "all"}
            onValueChange={(value) => setSelectedMonth(value === "all" ? undefined : Number(value))}
          >
            <SelectTrigger className="w-[150px]">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <SelectValue placeholder="Mês" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Mês atual</SelectItem>
              {MONTHS.map((m) => (
                <SelectItem key={m.value} value={String(m.value)}>{m.label}</SelectItem>
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
              {YEARS.map((y) => (
                <SelectItem key={y} value={String(y)}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2 bg-transparent">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Receitas</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            {loadingMain ? (
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total de Despesas</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            {loadingMain ? (
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
            ) : (
              <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpense)}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo do Período</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            {loadingMain ? (
              <div className="h-8 w-32 bg-muted rounded animate-pulse" />
            ) : (
              <>
                <div className="text-2xl font-bold">{formatCurrency(balance)}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  <span className={balance >= 0 ? "text-success" : "text-destructive"}>
                    {balance >= 0 ? "+" : ""}{balancePercent}%
                  </span>{" "}
                  de economia
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monthly Evolution Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Evolução Mensal</CardTitle>
            <Select value={chartType} onValueChange={(value: any) => setChartType(value)}>
              <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="bar">Barras</SelectItem>
                <SelectItem value="line">Linhas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loadingChart ? (
            <div className="h-[350px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                <span className="text-sm">Carregando gráfico...</span>
              </div>
            </div>
          ) : (
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "bar" ? (
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="receitas" fill="hsl(var(--success))" name="Receitas" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="despesas" fill="hsl(var(--destructive))" name="Despesas" radius={[8, 8, 0, 0]} />
                  </BarChart>
                ) : (
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line type="monotone" dataKey="receitas" stroke="hsl(var(--success))" strokeWidth={3} name="Receitas" dot={{ fill: "hsl(var(--success))", r: 4 }} />
                    <Line type="monotone" dataKey="despesas" stroke="hsl(var(--destructive))" strokeWidth={3} name="Despesas" dot={{ fill: "hsl(var(--destructive))", r: 4 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Despesas por Categoria</CardTitle></CardHeader>
          <CardContent>
            {loadingMain ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : (
              <>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensesData}
                        dataKey="total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={(entry) => entry.category}
                      >
                        {expensesData.map((entry, index) => (
                          <Cell key={index} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "0.5rem",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {expensesData.slice(0, 4).map((item) => (
                    <div key={item.category} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.category}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Receitas por Categoria</CardTitle></CardHeader>
          <CardContent>
            {loadingMain ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              </div>
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incomeData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis dataKey="category" type="category" stroke="hsl(var(--muted-foreground))" fontSize={12} width={80} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Bar dataKey="total" radius={[0, 8, 8, 0]}>
                      {incomeData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento por Categoria */}
      <Card>
        <CardHeader><CardTitle>Detalhamento por Categoria</CardTitle></CardHeader>
        <CardContent>
          {loadingMain ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-2 w-full bg-muted rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {expensesData.map((item) => {
                const percentage = totalExpense > 0 ? (item.total / totalExpense) * 100 : 0
                return (
                  <div key={item.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-medium">{item.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{formatCurrency(item.total)}</div>
                        <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%`, backgroundColor: item.color }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}