"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { getCategoryById } from "@/lib/mock-data"
import { BudgetModal } from "@/components/budget-modal"
import { Plus, TrendingUp, AlertCircle, CheckCircle2, Pencil, Trash2 } from "lucide-react"

interface Budget {
  id: string
  category: string
  limit: number
  spent: number
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([
    { id: "1", category: "food", limit: 800, spent: 165.8 },
    { id: "2", category: "transport", limit: 300, spent: 50 },
    { id: "3", category: "entertainment", limit: 200, spent: 89.9 },
    { id: "4", category: "housing", limit: 1500, spent: 1200 },
  ])

  const [modalOpen, setModalOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | undefined>(undefined)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const handleSaveBudget = (budget: Budget) => {
    if (editingBudget) {
      setBudgets(budgets.map((b) => (b.id === budget.id ? budget : b)))
    } else {
      setBudgets([...budgets, budget])
    }
    setEditingBudget(undefined)
  }

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
    setModalOpen(true)
  }

  const handleDeleteBudget = (id: string) => {
    setBudgets(budgets.filter((b) => b.id !== id))
  }

  const handleNewBudget = () => {
    setEditingBudget(undefined)
    setModalOpen(true)
  }

  const getBudgetStatus = (spent: number, limit: number) => {
    const percentage = (spent / limit) * 100
    if (percentage >= 100) return { status: "exceeded", color: "destructive", icon: AlertCircle }
    if (percentage >= 80) return { status: "warning", color: "warning", icon: AlertCircle }
    return { status: "good", color: "success", icon: CheckCircle2 }
  }

  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
  const totalRemaining = totalBudget - totalSpent

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Orçamentos</h2>
          <p className="text-muted-foreground mt-1">Gerencie seus limites de gastos por categoria</p>
        </div>
        <Button size="lg" className="gap-2" onClick={handleNewBudget}>
          <Plus className="h-5 w-5" />
          Novo Orçamento
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Orçamento Total</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
            <p className="text-xs text-muted-foreground mt-1">{budgets.length} categorias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Gasto</CardTitle>
            <TrendingUp className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalSpent)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((totalSpent / totalBudget) * 100).toFixed(1)}% do orçamento
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Disponível</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalRemaining)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {((totalRemaining / totalBudget) * 100).toFixed(1)}% restante
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Progresso Geral</CardTitle>
          <CardDescription>Visão geral do uso do orçamento total</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progresso</span>
              <span className="font-medium">
                {formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}
              </span>
            </div>
            <Progress value={(totalSpent / totalBudget) * 100} className="h-3" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            {((totalSpent / totalBudget) * 100).toFixed(1)}% do orçamento utilizado
          </div>
        </CardContent>
      </Card>

      {/* Budgets List */}
      <div className="space-y-4">
        {budgets.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Nenhum orçamento definido</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm mb-4">
                Comece criando orçamentos para controlar seus gastos por categoria
              </p>
              <Button onClick={handleNewBudget}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Orçamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          budgets.map((budget) => {
            const category = getCategoryById(budget.category)
            const percentage = (budget.spent / budget.limit) * 100
            const budgetStatus = getBudgetStatus(budget.spent, budget.limit)
            const StatusIcon = budgetStatus.icon
            const remaining = budget.limit - budget.spent

            return (
              <Card key={budget.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: `${category?.color}20` }}
                      >
                        {category?.icon || "💰"}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{category?.name || budget.category}</CardTitle>
                        <CardDescription className="mt-1">
                          {formatCurrency(budget.spent)} de {formatCurrency(budget.limit)}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`${
                          budgetStatus.color === "destructive"
                            ? "border-destructive/50 text-destructive"
                            : budgetStatus.color === "warning"
                              ? "border-warning/50 text-warning"
                              : "border-success/50 text-success"
                        }`}
                      >
                        <StatusIcon className="mr-1 h-3 w-3" />
                        {percentage.toFixed(0)}%
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
                  <Progress
                    value={percentage}
                    className="h-3"
                    style={{ ["--progress-background" as string]: category?.color } as React.CSSProperties}
                  />
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Restante</span>
                    <span className={`font-semibold ${remaining >= 0 ? "text-success" : "text-destructive"}`}>
                      {formatCurrency(Math.abs(remaining))}
                      {remaining < 0 && " acima do limite"}
                    </span>
                  </div>
                  {percentage >= 80 && (
                    <div
                      className={`flex items-start gap-2 p-3 rounded-lg border ${
                        percentage >= 100 ? "bg-destructive/5 border-destructive/20" : "bg-warning/5 border-warning/20"
                      }`}
                    >
                      <AlertCircle
                        className={`h-4 w-4 mt-0.5 ${percentage >= 100 ? "text-destructive" : "text-warning"}`}
                      />
                      <p className={`text-sm ${percentage >= 100 ? "text-destructive" : "text-warning"}`}>
                        {percentage >= 100
                          ? "Você ultrapassou o limite definido para esta categoria."
                          : "Atenção! Você está próximo do limite desta categoria."}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* Budget Modal */}
      <BudgetModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        onSave={handleSaveBudget}
        editingBudget={editingBudget}
      />
    </div>
  )
}
