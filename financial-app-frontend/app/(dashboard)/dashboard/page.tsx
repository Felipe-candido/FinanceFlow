"use client"

import type React from "react"
import { useCallback, useEffect, useState } from "react"
import { ArrowDownRight, ArrowUpRight, Plus, TrendingUp, Wallet } from "lucide-react"
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

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
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ola!</h2>
          <p className="text-muted-foreground mt-1">Aqui esta um resumo das suas financas</p>
        </div>
        <Button size="lg" className="gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="h-5 w-5" />
          Nova Transacao
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2">
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
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
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
            <p className="text-xs text-muted-foreground mt-1">Este mes</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Gastos por Categoria
            </CardTitle>
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
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transacoes Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction: Transaction) => (
                <div key={transaction.id} className="flex items-center gap-4">
                  <div
                    className="h-10 w-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: transaction.category?.color ?? "#eee" }}
                  >
                    $
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{transaction.description || "Sem descricao"}</p>
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
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="font-medium">{item.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(item.total)}</div>
                      <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  <Progress value={percentage} className="h-2" />
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
