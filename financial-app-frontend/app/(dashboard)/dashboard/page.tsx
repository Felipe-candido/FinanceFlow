"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { ArrowDownRight, ArrowUpRight, Plus, TrendingUp, Wallet, CalendarDays } from "lucide-react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"

import { ChatWidget } from "@/components/chat_widget"
import { TransactionModal } from "@/components/transaction-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/authProvider"
import { getDashboardData } from "@/lib/api/dashboard"
import { formatDatePtBr } from "@/lib/date"
import type { CategoryTotal, DashboardResponse, Transaction } from "@/lib/data"

export default function DashboardPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const { token } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null)
  const [, setLoading] = useState(true)
  
  const expensesData: CategoryTotal[] = dashboardData?.expenses_by_category ?? []
  const recentTransactions = dashboardData?.last_transactions ?? []
  const projection = dashboardData?.projection

  const loadData = useCallback(async () => {
    if (!token) return

    try {
      setLoading(true)
      const data = await getDashboardData({ token })
      setDashboardData(data)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }, [token])

  const handleAddTransaction = async (_newTransaction: Transaction) => {
    await loadData()
  }

  useEffect(() => {
    if (token) {
      void loadData()
    }
  }, [token, loadData])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateValue: string | Date | null) => {
    return formatDatePtBr(dateValue, {
      day: "2-digit",
      month: "short",
    })
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Olá!</h2>
          <p className="text-muted-foreground mt-1">Aqui está o resumo e a projeção do seu bolso.</p>
        </div>
        <Button size="lg" className="gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="h-5 w-5" />
          Nova Transação
        </Button>
      </div>

      {/* TOP KPI CARDS (Balance, Income, Expense) */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Atual</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(dashboardData?.balance ?? 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className={dashboardData?.balance && dashboardData.balance >= 0 ? "text-success" : "text-destructive"}>
                {dashboardData?.balance && dashboardData.balance >= 0 ? "+" : ""}
                {dashboardData && dashboardData.total_income > 0
                  ? ((dashboardData.balance / dashboardData.total_income) * 100).toFixed(1)
                  : "0"}
                %
              </span>{" "}
              do total de receitas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Receitas</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-success/10 flex items-center justify-center">
              <ArrowUpRight className="h-5 w-5 text-success" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success">{formatCurrency(dashboardData?.total_income ?? 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Despesas</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <ArrowDownRight className="h-5 w-5 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{formatCurrency(dashboardData?.total_expense ?? 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* NEW SECTION: 30-DAY PROJECTION & RUNWAY */}
      {projection && (
        <div className="grid gap-4 md:grid-cols-3">
          
          {/* Predictive Area Chart (Takes up 2/3 of the row) */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Projeção de Saldo (Próximos 30 Dias)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projection.chart_data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(val) => formatDate(val)}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={30}
                    />
                    <YAxis 
                      tickFormatter={(val) => `R$ ${val}`}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      width={80}
                    />
                    <Tooltip 
                      labelFormatter={(label) => formatDate(label as string)}
                      formatter={(value: number) => [formatCurrency(value), "Saldo Previsto"]}
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "0.5rem",
                      }}
                      itemStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="balance" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorBalance)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Runway Card (Takes up 1/3 of the row) */}
          <Card className="flex flex-col justify-center bg-card">
            <CardHeader className="items-center pb-2 text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg font-medium text-foreground">Fôlego Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              {projection.days_until_zero !== null ? (
                <>
                  <div className="text-6xl font-bold text-primary mb-3">
                    {projection.days_until_zero}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    dias até o seu saldo zerar se você mantiver o ritmo atual de gastos.
                  </p>
                </>
              ) : (
                <>
                  <div className="text-4xl font-bold text-success mb-3 mt-4">
                    Seguro
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Suas receitas superam suas despesas médias. Excelente trabalho!
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* MIDDLE SECTION (Pie Chart & Recent Transactions) */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={expensesData} dataKey="total" nameKey="category" cx="50%" cy="50%" outerRadius={80}>
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
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction: Transaction) => (
                <div key={transaction.id} className="flex items-center gap-4">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-lg text-white font-bold"
                    style={{ backgroundColor: transaction.category?.color ?? "#eee" }}
                  >
                    {transaction.category?.name?.charAt(0).toUpperCase() ?? "$"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{transaction.description || "Sem descrição"}</p>
                    <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                  </div>

                  <div className={`font-semibold ${transaction.type === "income" ? "text-success" : "text-destructive"}`}>
                    {transaction.type === "income" ? "+" : "-"}
                    {formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              Ver todas
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* BOTTOM SECTION (Top Expenses Progress Bars) */}
      <Card>
        <CardHeader>
          <CardTitle>Maiores Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData?.expenses_by_category?.slice(0, 4).map((item: CategoryTotal) => {
              const percentage = dashboardData.total_expense > 0 ? (item.total / dashboardData.total_expense) * 100 : 0

              return (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="font-medium">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(item.total)}</div>
                      <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  {/* Applied the category color to the progress bar indicator via inline style */}
                  <Progress 
                    value={percentage} 
                    className="h-2" 
                    indicatorColor={item.color}
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <TransactionModal open={modalOpen} onOpenChange={setModalOpen} onSave={handleAddTransaction} />
      <ChatWidget onTransactionAdded={() => void loadData()} />
    </div>
  )
}