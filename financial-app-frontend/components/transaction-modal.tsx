"use client"

import React, { useEffect, useState } from "react"
import { Loader2, Trash2 } from "lucide-react"

import { useAuth } from "@/contexts/authProvider"
import { createTransaction, deleteTransaction, getCategories, updateTransaction } from "@/lib/api/transactions"
import { getApiUrl } from "@/lib/api/client"
import { getDateOnlyOrFallback } from "@/lib/date"
import type { Category, Transaction } from "@/lib/data"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

interface TransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (transaction: Transaction) => void
  onDelete?: (id: string) => void
  editingTransaction?: Transaction | null
}

type RecurrenceMode = "indefinite" | "fixed_count" | "until_date"
const todayDate = () => new Date().toISOString().split("T")[0]

function normalizeCategoryType(value: string | null | undefined): "income" | "expense" | null {
  const normalized = (value ?? "").trim().toLowerCase()

  if (["income", "receita", "entrada", "ganho"].includes(normalized)) {
    return "income"
  }

  if (["expense", "despesa", "saida", "gasto"].includes(normalized)) {
    return "expense"
  }

  return null
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
  const [date, setDate] = useState(todayDate())
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceMode, setRecurrenceMode] = useState<RecurrenceMode>("indefinite")
  const [recurrenceOccurrences, setRecurrenceOccurrences] = useState("12")
  const [recurrenceEndDate, setRecurrenceEndDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [categoriesError, setCategoriesError] = useState<string | null>(null)

  const isEditing = Boolean(editingTransaction?.id)

  const resetForm = () => {
    setType("expense")
    setAmount("")
    setCategory(undefined)
    setDescription("")
    setDate(todayDate())
    setIsRecurring(false)
    setRecurrenceMode("indefinite")
    setRecurrenceOccurrences("12")
    setRecurrenceEndDate("")
  }

  useEffect(() => {
    const syncUser = async () => {
      if (!token) return

      await fetch(getApiUrl("/auth/sync"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
    }

    const fetchCategories = async () => {
      if (!token) return

      try {
        setCategoriesLoading(true)
        setCategoriesError(null)

        let dataCategories = await getCategories(token)

        if (dataCategories.length === 0) {
          await syncUser()
          dataCategories = await getCategories(token)
        }

        setCategories(dataCategories)
      } catch (error) {
        console.error("Failed to fetch categories", error)
        setCategoriesError("Nao foi possivel carregar categorias.")
        setCategories([])
      } finally {
        setCategoriesLoading(false)
      }
    }

    if (open) {
      void fetchCategories()
    }
  }, [open, token])

  useEffect(() => {
    if (!open) return

    if (editingTransaction) {
      setType(editingTransaction.type === "income" ? "income" : "expense")
      setAmount(String(editingTransaction.amount))
      setCategory(editingTransaction.category?.id)
      setDescription(editingTransaction.description ?? "")
      setDate(getDateOnlyOrFallback(editingTransaction.date, todayDate()))
      setIsRecurring(Boolean(editingTransaction.recurring_transaction_id))
      setRecurrenceMode("indefinite")
      setRecurrenceOccurrences("12")
      setRecurrenceEndDate("")
      return
    }

    resetForm()
  }, [open, editingTransaction])

  const filteredCategories = categories.filter((cat) => normalizeCategoryType(cat.type) === type)
  const categoriesToDisplay = filteredCategories.length > 0 ? filteredCategories : categories
  const noCategoriesForSelectedType = categories.length > 0 && filteredCategories.length === 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!token || !category) return

    if (!isEditing && isRecurring && recurrenceMode === "until_date" && !recurrenceEndDate) {
      return
    }

    if (!isEditing && isRecurring && recurrenceMode === "fixed_count" && Number(recurrenceOccurrences) < 2) {
      return
    }

    try {
      setLoading(true)

      const transactionPayload = {
        date,
        type,
        amount: parseFloat(amount),
        category_id: category,
        description,
        ...(!isEditing && isRecurring
          ? {
              is_recurring: true,
              recurrence_interval_months: 1,
              recurrence_occurrences:
                recurrenceMode === "fixed_count" ? Number(recurrenceOccurrences) : undefined,
              recurrence_end_date: recurrenceMode === "until_date" ? recurrenceEndDate : undefined,
            }
          : {}),
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
              <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={(value) => setCategory(value)}>
                <SelectTrigger>
                  <SelectValue
                    placeholder={categoriesLoading ? "Carregando categorias..." : "Selecione uma categoria"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {categoriesToDisplay.length > 0 ? (
                    categoriesToDisplay.map((cat) => (
                      <SelectItem key={`cat-${cat.id}`} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="__empty__" disabled>
                      {categoriesError ? "Falha ao carregar categorias" : "Nenhuma categoria disponivel para este tipo"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              {categoriesError && (
                <p className="text-xs text-destructive">{categoriesError} Tente novamente em alguns segundos.</p>
              )}
              {!categoriesError && noCategoriesForSelectedType && (
                <p className="text-xs text-muted-foreground">
                  Nao encontrei categorias do tipo selecionado. Mostrando todas as categorias.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Descricao</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </div>

            {!isEditing && (
              <div className="space-y-3 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm">Recorrencia mensal</Label>
                    <p className="text-xs text-muted-foreground">Use para salario, assinaturas ou compras parceladas</p>
                  </div>
                  <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
                </div>

                {isRecurring && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>Tipo da recorrencia</Label>
                      <Select value={recurrenceMode} onValueChange={(value: RecurrenceMode) => setRecurrenceMode(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="indefinite">Indefinida</SelectItem>
                          <SelectItem value="fixed_count">Parcelada (quantidade)</SelectItem>
                          <SelectItem value="until_date">Ate uma data final</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {recurrenceMode === "fixed_count" && (
                      <div className="space-y-2">
                        <Label>Quantidade de parcelas</Label>
                        <Input
                          type="number"
                          min={2}
                          value={recurrenceOccurrences}
                          onChange={(e) => setRecurrenceOccurrences(e.target.value)}
                          required
                        />
                      </div>
                    )}

                    {recurrenceMode === "until_date" && (
                      <div className="space-y-2">
                        <Label>Data final da recorrencia</Label>
                        <Input
                          type="date"
                          value={recurrenceEndDate}
                          min={date}
                          onChange={(e) => setRecurrenceEndDate(e.target.value)}
                          required
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {isEditing && editingTransaction?.recurring_transaction_id && (
              <p className="text-xs text-muted-foreground">
                Esta transacao pertence a uma recorrencia mensal. A edicao afeta somente este lancamento.
              </p>
            )}
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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
