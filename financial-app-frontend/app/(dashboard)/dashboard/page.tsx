"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Plus } from "lucide-react"
import { mockTransactions, calculateBalance, getCategoryById } from "@/lib/data"
import { Progress } from "@/components/ui/progress"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useState } from "react"
import { TransactionModal } from "@/components/transaction-modal"
import type { Transaction } from "@/lib/data"
import { mock } from "node:test"

export default function DashboardPage() {
  const currentMonth = new Date().getMonth()
  const currentYear = new Date().getFullYear()
  const [ transactions, setTransactions] = useState<Transaction[] | null>(null)
  const { income, expenses, balance } = calculateBalance(transactions ?? [])
  const [modalOpen, setModalOpen] = useState(false)

  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions([...transactions, newTransaction])
  }

  // Calculate expenses by category
  const expensesByCategory = mockTransactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        const existing = acc.find((item) => item.category === t.category)
        if (existing) {
          existing.value += t.amount
        } else {
          const category = getCategoryById(t.category)
          acc.push({
            category: t.category,
            name: category?.name || t.category,
            value: t.amount,
            color: category?.color || "#6b7280",
          })
        }
        return acc
      },
      [] as { category: string; name: string; value: number; color: string }[],
    )
    .sort((a, b) => b.value - a.value)

  const recentTransactions = [...mockTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
    })
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header with balance */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Olá! 👋</h2>
          <p className="text-muted-foreground mt-1">Aqui está um resumo das suas finanças</p>
        </div>
        <Button size="lg" className="gap-2" onClick={() => setModalOpen(true)}>
          <Plus className="h-5 w-5" />
          Nova Transação
        </Button>
      </div>

      {/* Balance Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Atual</CardTitle>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(balance)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className={balance >= 0 ? "text-success" : "text-destructive"}>
                {balance >= 0 ? "+" : ""}
                {((balance / (income || 1)) * 100).toFixed(1)}%
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
            <div className="text-3xl font-bold text-success">{formatCurrency(income)}</div>
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
            <div className="text-3xl font-bold text-destructive">{formatCurrency(expenses)}</div>
            <p className="text-xs text-muted-foreground mt-1">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Recent Transactions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Expenses by Category Chart */}
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
                  <Pie
                    data={expensesByCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => entry.name}
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
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

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.map((transaction) => {
                const category = getCategoryById(transaction.category)
                return (
                  <div key={transaction.id} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center text-lg">
                      {category?.icon || "💰"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{formatDate(transaction.date)}</p>
                    </div>
                    <div
                      className={`font-semibold ${transaction.type === "income" ? "text-success" : "text-destructive"}`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                )
              })}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              Ver todas
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Maiores Gastos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expensesByCategory.slice(0, 4).map((item) => {
              const percentage = (item.value / expenses) * 100
              return (
                <div key={item.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(item.value)}</div>
                      <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  <Progress
                    value={percentage}
                    className="h-2"
                    style={{ ["--progress-background" as string]: item.color } as React.CSSProperties}
                  />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>


      {/* Transaction Modal */}
      <TransactionModal open={modalOpen} onOpenChange={setModalOpen} onSave={handleAddTransaction} />
    </div>
  )
}
