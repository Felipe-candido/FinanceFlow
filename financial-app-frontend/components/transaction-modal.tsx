"use client"

import React, { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Trash2 } from "lucide-react"
import type { Category, Transaction } from "@/lib/data"
import {
  createTransaction,
  deleteTransaction,
  getCategories,
  updateTransaction,
} from "@/lib/api/transactions"
import { useAuth } from "@/contexts/authProvider"

interface TransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (transaction: Transaction) => void
  onDelete?: (id: string) => void
  editingTransaction?: Transaction | null
}

function getDateOnly(date: string | Date) {
  if (typeof date === "string") {
    return date.split("T")[0]
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function TransactionModal({
  open,
  onOpenChange,
  onSave,
  onDelete,
  editingTransaction,
}: TransactionModalProps) {
  const { token } = useAuth()
  const [type, setType] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const isEditing = Boolean(editingTransaction?.id)

  const resetForm = () => {
    setType("expense")
    setAmount("")
    setCategory(undefined)
    setDescription("")
    setDate(new Date().toISOString().split("T")[0])
  }

  useEffect(() => {
    const fetchCategories = async () => {
      if (!token) return

      try {
        const dataCategories = await getCategories(token)
        setCategories(dataCategories)
      } catch (error) {
        console.error("Failed to fetch categories", error)
      }
    }

    if (open) {
      fetchCategories()
    }
  }, [open, token])

  useEffect(() => {
    if (!open) return

    if (editingTransaction) {
      setType(editingTransaction.type === "income" ? "income" : "expense")
      setAmount(String(editingTransaction.amount))
      setCategory(editingTransaction.category?.id)
      setDescription(editingTransaction.description ?? "")
      setDate(getDateOnly(editingTransaction.date))
      return
    }

    resetForm()
  }, [open, editingTransaction])

  const filteredCategories = categories.filter((cat) => cat.type === type)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token || !category) return

    try {
      setLoading(true)

      const transactionPayload = {
        date,
        type,
        amount: parseFloat(amount),
        category_id: category,
        description,
      }

      const savedTransaction =
        isEditing && editingTransaction?.id
          ? await updateTransaction(token, editingTransaction.id, transactionPayload)
          : await createTransaction(token, transactionPayload)

      onSave(savedTransaction)
      onOpenChange(false)

      if (!isEditing) {
        resetForm()
      }
    } catch (error) {
      console.error("Failed to save transaction", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!token || !editingTransaction?.id) return

    try {
      setDeleting(true)
      await deleteTransaction(token, editingTransaction.id)
      onDelete?.(editingTransaction.id)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to delete transaction", error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Transacao" : "Nova Transacao"}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Atualize os dados da transacao" : "Adicione uma nova receita ou despesa"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select
                value={type}
                onValueChange={(value: "income" | "expense") => {
                  setType(value)
                  setCategory(undefined)
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Receita</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Valor</Label>
              <Input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={(value) => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={`cat-${cat.id}`} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Descricao</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <div>
              {isEditing && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={loading || deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </>
                  )}
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>

              <Button type="submit" disabled={loading || deleting}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
