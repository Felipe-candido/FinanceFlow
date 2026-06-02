"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TransactionModal } from "@/components/transaction-modal"
import { Plus, Search, Filter, ArrowUpDown, Trash2, PauseCircle, PlayCircle, Repeat2 } from "lucide-react"
import type { Transaction, Category, RecurringTransaction } from "@/lib/data"
import  {
  deleteRecurringTransaction,
  deleteTransaction,
  getCategories,
  getRecurringTransactions,
  getTransactions,
  updateRecurringTransactionStatus,
} from "@/lib/api/transactions"
import { useAuth } from "@/contexts/authProvider"
import { formatDatePtBr, getDateOnly } from "@/lib/date"

export default function TransactionsPage() {
  const [ transactions, setTransactions] = useState<Transaction[] | null>(null)
  const [ recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"date" | "amount">("date")
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [confirmDeleteRecurringId, setConfirmDeleteRecurringId] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[] | []>([])
  const { token } = useAuth()
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")

  async function loadCategories() {
    if (!token) return
    
    try{
      const data = await getCategories(token)

      setCategories(data)
    
    }catch(error){
      console.error("Failed to load categories", error)     
    }
  }

  async function loadTransactions() {
    if (!token) return

    try {
      const data = await getTransactions(token)
      setTransactions(data)
    } catch (error) {
      console.error("Failed to load transactions", error)
    }
  }

  async function loadRecurringTransactions() {
    if (!token) return

    try {
      const data = await getRecurringTransactions(token)
      setRecurringTransactions(data)
    } catch (error) {
      console.error("Failed to load recurring transactions", error)
    }
  }

  useEffect(() => {
    if(token){
      loadCategories()
      loadTransactions()
      loadRecurringTransactions()
    }
  }, [token]) 


  const filteredTransactions = useMemo(() => {
    let filtered = [...(transactions || [])]

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (t) =>
          (t.description ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.category?.name ?? "").toLowerCase().includes(searchQuery.toLowerCase()),
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
        const dateA = getDateOnly(a.date)
        const dateB = getDateOnly(b.date)
        const timeA = dateA ? new Date(dateA).getTime() : 0
        const timeB = dateB ? new Date(dateB).getTime() : 0

        return timeB - timeA
      } else {
        return b.amount - a.amount
      }
    })

    if (startDate){
      filtered = filtered.filter((t) => {
        const transactionDate = getDateOnly(t.date)
        return Boolean(transactionDate && transactionDate >= startDate)
      })
    }

    if (endDate){
      filtered = filtered.filter((t) => {
        const transactionDate = getDateOnly(t.date)
        return Boolean(transactionDate && transactionDate <= endDate)
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
      console.error("Failed to delete transaction:", error)
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
    void loadRecurringTransactions()
  }

  const handleToggleRecurringTransaction = async (recurringTransaction: RecurringTransaction) => {
    if (!token) return

    try {
      const updatedRecurringTransaction = await updateRecurringTransactionStatus(
        token,
        recurringTransaction.id,
        !recurringTransaction.is_active,
      )

      setRecurringTransactions((currentRecurringTransactions) =>
        currentRecurringTransactions.map((currentRecurringTransaction) =>
          currentRecurringTransaction.id === updatedRecurringTransaction.id
            ? updatedRecurringTransaction
            : currentRecurringTransaction,
        ),
      )
      setConfirmDeleteRecurringId(null)
      void loadTransactions()
    } catch (error) {
      console.error("Failed to update recurring transaction", error)
    }
  }

  const handleDeleteRecurringTransaction = async (id: string) => {
    if (!token) return

    if (confirmDeleteRecurringId !== id) {
      setConfirmDeleteRecurringId(id)
      return
    }

    try {
      await deleteRecurringTransaction(token, id)
      setRecurringTransactions((currentRecurringTransactions) =>
        currentRecurringTransactions.filter((recurringTransaction) => recurringTransaction.id !== id),
      )
      setConfirmDeleteRecurringId(null)
      void loadTransactions()
    } catch (error) {
      console.error("Failed to delete recurring transaction", error)
    }
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

  const formatDate = (dateValue: string | Date | null) => {
    return formatDatePtBr(dateValue, {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  }

  const formatShortDate = (dateValue: string | Date | null) => {
    return formatDatePtBr(dateValue, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const activeRecurringTransactions = recurringTransactions.filter((transaction) => transaction.is_active).length
  const inactiveRecurringTransactions = recurringTransactions.length - activeRecurringTransactions

  // Group transactions by date
  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {}
    filteredTransactions.forEach((transaction) => {
      const dateKey = getDateOnly(transaction.date) ?? "sem-data"
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

      <Tabs defaultValue="transactions" className="space-y-4">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-fit">
          <TabsTrigger value="transactions">Lançamentos</TabsTrigger>
          <TabsTrigger value="recurring" className="gap-2">
            Recorrentes
            {recurringTransactions.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[11px]">
                {recurringTransactions.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
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

          <div className="space-y-4">
            {Object.entries(groupedTransactions).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="mb-1 text-lg font-semibold">Nenhuma transação encontrada</h3>
                  <p className="max-w-sm text-center text-sm text-muted-foreground">
                    Tente ajustar os filtros ou adicione uma nova transação
                  </p>
                </CardContent>
              </Card>
            ) : (
              Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
                <Card key={date}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-medium text-muted-foreground">
                      {date === "sem-data" ? "Sem data" : formatDate(date)}
                    </CardTitle>
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
                            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                            style={{ backgroundColor: `${transaction.category?.color}20` }}
                          >
                            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: transaction.category?.color }} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{transaction.description || "Sem descricao"}</p>
                            <div className="mt-1 flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {transaction.category?.name}
                              </Badge>
                              {transaction.recurring_transaction_id && (
                                <Badge variant="secondary" className="gap-1 text-xs">
                                  <Repeat2 className="h-3 w-3" />
                                  Recorrente
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`text-lg font-semibold ${transaction.type === "income" ? "text-success" : "text-destructive"}`}
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
        </TabsContent>

        <TabsContent value="recurring" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Séries ativas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{activeRecurringTransactions}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Pausadas ou encerradas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{inactiveRecurringTransactions}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total mensal ativo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    recurringTransactions
                      .filter((transaction) => transaction.is_active)
                      .reduce((sum, transaction) => {
                        return transaction.type === "income"
                          ? sum + transaction.amount
                          : sum - transaction.amount
                      }, 0),
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {recurringTransactions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                  <Repeat2 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-1 text-lg font-semibold">Nenhuma recorrência criada</h3>
                <p className="max-w-sm text-center text-sm text-muted-foreground">
                  Ao adicionar uma nova transação, ative a opção de recorrência mensal para criar uma série.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {recurringTransactions.map((recurringTransaction) => (
                <Card key={recurringTransaction.id}>
                  <CardContent className="space-y-4 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-center gap-3">
                        <div
                          className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `${recurringTransaction.category?.color}20` }}
                        >
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: recurringTransaction.category?.color }}
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold">
                            {recurringTransaction.description || "Sem descricao"}
                          </p>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <Badge variant="outline">{recurringTransaction.category?.name}</Badge>
                            <Badge variant={recurringTransaction.is_active ? "default" : "secondary"}>
                              {recurringTransaction.is_active ? "Ativa" : "Pausada"}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <p
                        className={`text-lg font-semibold ${recurringTransaction.type === "income" ? "text-success" : "text-destructive"}`}
                      >
                        {recurringTransaction.type === "income" ? "+" : "-"}
                        {formatCurrency(recurringTransaction.amount)}
                      </p>
                    </div>

                    <div className="grid gap-3 text-sm sm:grid-cols-3">
                      <div>
                        <p className="text-muted-foreground">Início</p>
                        <p className="font-medium">{formatShortDate(recurringTransaction.start_date)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Geradas</p>
                        <p className="font-medium">
                          {recurringTransaction.generated_occurrences}
                          {recurringTransaction.total_occurrences ? ` de ${recurringTransaction.total_occurrences}` : ""}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Próxima</p>
                        <p className="font-medium">
                          {recurringTransaction.next_occurrence_date
                            ? formatShortDate(recurringTransaction.next_occurrence_date)
                            : "Sem próxima"}
                        </p>
                      </div>
                    </div>

                    {recurringTransaction.end_date && (
                      <p className="text-sm text-muted-foreground">
                        Encerra em {formatShortDate(recurringTransaction.end_date)}.
                      </p>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                      <Button
                        type="button"
                        variant="outline"
                        className="gap-2 bg-transparent"
                        onClick={() => handleToggleRecurringTransaction(recurringTransaction)}
                      >
                        {recurringTransaction.is_active ? (
                          <>
                            <PauseCircle className="h-4 w-4" />
                            Pausar
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4" />
                            Reativar
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="gap-2 text-destructive hover:text-destructive"
                        onClick={() => handleDeleteRecurringTransaction(recurringTransaction.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        {confirmDeleteRecurringId === recurringTransaction.id ? "Confirmar exclusão" : "Excluir série"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

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
