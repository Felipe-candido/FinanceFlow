"use client"

import type React from "react"

import { useEffect, useMemo, useState } from "react"
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
import type { Category } from "@/lib/data"
import { Loader2 } from "lucide-react"

export interface Budget {
  id: string
  categoryId: string
  limit: number
}

interface BudgetModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (budget: Budget) => void
  categories: Category[]
  usedCategoryIds: string[]
  editingBudget?: Budget
}

export function BudgetModal({
  open,
  onOpenChange,
  onSave,
  categories,
  usedCategoryIds,
  editingBudget,
}: BudgetModalProps) {
  const [categoryId, setCategoryId] = useState("")
  const [limit, setLimit] = useState("")
  const [loading, setLoading] = useState(false)

  const availableCategories = useMemo(() => {
    return categories.filter(
      (category) =>
        category.type === "expense" &&
        (!usedCategoryIds.includes(category.id) || category.id === editingBudget?.categoryId),
    )
  }, [categories, editingBudget?.categoryId, usedCategoryIds])

  useEffect(() => {
    if (!open) return

    setCategoryId(editingBudget?.categoryId ?? "")
    setLimit(editingBudget?.limit ? String(editingBudget.limit) : "")
  }, [editingBudget, open])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!categoryId || !limit) return

    setLoading(true)

    onSave({
      id: editingBudget?.id ?? globalThis.crypto?.randomUUID?.() ?? Date.now().toString(),
      categoryId,
      limit: Number.parseFloat(limit),
    })

    setLoading(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>{editingBudget ? "Editar orcamento" : "Novo orcamento"}</DialogTitle>
          <DialogDescription>Defina um limite mensal para uma categoria de despesa.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      <span className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                        <span>{category.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableCategories.length === 0 && (
                <p className="text-xs text-muted-foreground">Todas as categorias de despesa ja possuem orcamento.</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">Limite mensal</Label>
              <Input
                id="limit"
                type="number"
                min="0"
                step="0.01"
                placeholder="0,00"
                value={limit}
                onChange={(event) => setLimit(event.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">Use um limite realista para controlar o gasto do mes.</p>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || availableCategories.length === 0}>
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
