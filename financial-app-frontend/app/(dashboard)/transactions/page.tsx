"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TransactionModal } from "@/components/transaction-modal"
import { Plus, Search, Filter, ArrowUpDown, Trash2 } from "lucide-react"
import type { Transaction, Category } from "@/lib/data"
import  { getCategories, getTransactions, deleteTransaction } from "@/lib/api/transactions"
import { useAuth } from "@/contexts/authProvider"

function getDateOnly(date: string | Date) {
  if (typeof date === "string") {
    return date.split("T")[0]
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export default function TransactionsPage() {
  const [ transactions, setTransactions] = useState<Transaction[] | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "amount">("date")
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [categories, setCategories] = useState<Category[] | []>([])
  const { token } = useAuth()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  async function loadCategories() {
    if (!token) return
    
    try{
      const data = await getCategories(token)
      console.log("CATEGORIES", data)

      setCategories(data)
    
    }catch(error){
      console.error("Failed to load categories", error)     
    }
  }

  async function loadTransactions() {
    if (!token) return

    try {
      const data = await getTransactions(token)
      console.log("TRANSACTIONS", data)
      setTransactions(data)
    } catch (error) {
      console.error("Failed to load transactions", error)
    }
  }

  useEffect(() => {
    if(token){
      loadCategories()
      loadTransactions()
    }
  }, [token]) 


  const filteredTransactions = useMemo(() => {
    let filtered = [...(transactions || [])]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.category.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType)
    }

    // Filter by category
    if (filterCategory !== "all") {
      filtered = filtered.filter((t) => t.category.id === filterCategory)
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === "date") {
        return new Date(b.date).getTime() - new Date(a.date).getTime()
      } else {
        return b.amount - a.amount
      }
    })

    if (startDate){
      filtered = filtered.filter((t) => {
        const transactionDate = getDateOnly(t.date)
        return transactionDate >= startDate
      })
    }

    if (endDate){
      filtered = filtered.filter((t) => {
        const transactionDate = getDateOnly(t.date)
        return transactionDate <= endDate
      })
    }

    return filtered
  }, [transactions, searchQuery, filterType, filterCategory, sortBy, startDate, endDate])


  const removeTransactionFromState = (id: string) => {
    setTransactions((currentTransactions) =>
      (currentTransactions || []).filter((transaction) => transaction.id !== id),
    )
  }

  const handleDeleteTransaction = async (id: string) => {
    try{
      await deleteTransaction(token, id)
      removeTransactionFromState(id)
    }catch(error){
      console.log("deu ruim aqui:", error)
    }
  }

  const handleSaveTransaction = (savedTransaction: Transaction) => {
    setTransactions((currentTransactions) => {
      const current = currentTransactions || []

      if (savedTransaction.id && current.some((transaction) => transaction.id === savedTransaction.id)) {
        return current.map((transaction) =>
          transaction.id === savedTransaction.id ? savedTransaction : transaction,
        )
      }

      return [...current, savedTransaction]
    })
  }

  const handleModalOpenChange = (open: boolean) => {
    setModalOpen(open)

    if (!open) {
      setSelectedTransaction(null)
    }
  }


  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    const [year, month, day] = getDateOnly(dateString).split("-").map(Number)

    return new Date(year, month - 1, day).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {}
    filteredTransactions.forEach((transaction) => {
      const dateKey = getDateOnly(transaction.date)
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(transaction)
    })
    return groups
  }, [filteredTransactions])

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Transações</h2>
          <p className="text-muted-foreground mt-1">Gerencie todas as suas transações</p>
        </div>
        <Button
          size="lg"
          className="gap-2"
          onClick={() => {
            setSelectedTransaction(null)
            setModalOpen(true)
          }}
        >
          <Plus className="h-5 w-5" />
          Nova Transação
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar transações..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />


            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as categorias" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as categorias</SelectItem>
                {(categories).map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                     {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger>
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Ordenar por data</SelectItem>
                <SelectItem value="amount">Ordenar por valor</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-4">
        {Object.entries(groupedTransactions).length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Nenhuma transação encontrada</h3>
              <p className="text-sm text-muted-foreground text-center max-w-sm">
                Tente ajustar os filtros ou adicione uma nova transação
              </p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
            <Card key={date}>
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-medium text-muted-foreground">{formatDate(date)}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {dayTransactions.map((transaction) => {
                  return (
                    <div
                      key={transaction.id}
                      className="flex cursor-pointer items-center gap-4 rounded-lg border bg-card p-3 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      role="button"
                      tabIndex={0}
                      onClick={() => {
                        setSelectedTransaction(transaction)
                        setModalOpen(true)
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault()
                          setSelectedTransaction(transaction)
                          setModalOpen(true)
                        }
                      }}
                    >
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                        style={{ backgroundColor: `${transaction.category?.color}20` }}
                      >
                        💰
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{transaction.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {transaction.category?.name}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className={`font-semibold text-lg ${transaction.type === "income" ? "text-success" : "text-destructive"}`}
                        >
                          {transaction.type === "income" ? "+" : "-"}
                          {formatCurrency(transaction.amount)}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleDeleteTransaction((transaction.id) || "")
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        open={modalOpen}
        onOpenChange={handleModalOpenChange}
        onSave={handleSaveTransaction}
        onDelete={removeTransactionFromState}
        editingTransaction={selectedTransaction}
      />
    </div>
  )
}
