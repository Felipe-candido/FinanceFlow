"use client"

import React, { useState, useEffect } from "react"
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
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

interface Category {
  id: string
  name: string
  type: "income" | "expense"
  color?: string
}

interface TransactionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (transaction: any) => void
}

export function TransactionModal({
  open,
  onOpenChange,
  onSave,
}: TransactionModalProps) {
  const [type, setType] = useState<"income" | "expense">("expense")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)

  const [categories, setCategories] = useState<Category[]>([])

  // Busca categorias do backend
  useEffect(() => {
    console.log("useEffect modal rodou, open:", open)

    const fetchCategories = async () => {
      const { data } = await supabase.auth.getSession()
      const session = data.session
      if (!session) {
        console.error("No session found, cannot fetch categories")
        return
      }
      const response = await fetch("http://localhost:8000/categories/list", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      const dataCategories = await response.json()
      console.log("Fetched categories:", dataCategories)
      setCategories(dataCategories)
    }

    if (open) {
      fetchCategories()
    }
  }, [open])

  //Filtra por tipo (income ou expense)
  const filteredCategories = categories.filter(
    (cat) => cat.type === type
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data } = await supabase.auth.getSession()
    const session = data.session
    if (!session) {
      setLoading(false)
      return
    }

    await fetch("http://localhost:8000/transactions/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        date,
        type,
        amount: parseFloat(amount),
        category_id: category, 
        description,
      }),
    })

    setLoading(false)
    onOpenChange(false)

    // reset
    setType("expense")
    setAmount("")
    setCategory("")
    setDescription("")
    setDate(new Date().toISOString().split("T")[0])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nova Transação</DialogTitle>
          <DialogDescription>
            Adicione uma nova receita ou despesa
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">

            {/* Tipo */}
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

            {/* Valor */}
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

            {/* Categoria */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={category}
                onValueChange={(value) => setCategory(value)}
              >
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

            {/* Descrição */}
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Data */}
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

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
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