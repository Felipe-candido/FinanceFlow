"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { categories } from "@/lib/data"
import { Loader2 } from "lucide-react"

interface BudgetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (budget: any) => void
  editingBudget?: any
}

export function BudgetModal({ open, onOpenChange, onSave, editingBudget }: BudgetModalProps) {
  const [category, setCategory] = useState(editingBudget?.category || "")
  const [limit, setLimit] = useState(editingBudget?.limit?.toString() || "")
  const [loading, setLoading] = useState(false)

  const expenseCategories = categories.filter((cat) => cat.type === "expense")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 500))

    onSave({
      id: editingBudget?.id || Date.now().toString(),
      category,
      limit: Number.parseFloat(limit),
      spent: editingBudget?.spent || 0,
    })

    setLoading(false)
    onOpenChange(false)

    if (!editingBudget) {
      setCategory("")
      setLimit("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{editingBudget ? "Editar Orçamento" : "Novo Orçamento"}</DialogTitle>
          <DialogDescription>Defina um limite de gastos para uma categoria</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">Limite Mensal</Label>
              <Input
                id="limit"
                type="number"
                step="0.01"
                placeholder="0,00"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Valor máximo que deseja gastar nesta categoria por mês</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
