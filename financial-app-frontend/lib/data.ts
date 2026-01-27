// Mock data for the finance app

export interface Transaction {
  id: string
  type: "income" | "expense"
  amount: number
  category: string
  description: string
  date: string
  account: string
}

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  type: "income" | "expense"
}

export const categories: Category[] = [
  // Income categories
  { id: "salary", name: "Salário", icon: "💼", color: "#10b981", type: "income" },
  { id: "freelance", name: "Freelance", icon: "💻", color: "#3b82f6", type: "income" },
  { id: "investments", name: "Investimentos", icon: "📈", color: "#8b5cf6", type: "income" },
  { id: "other-income", name: "Outros", icon: "💰", color: "#06b6d4", type: "income" },

  // Expense categories
  { id: "food", name: "Alimentação", icon: "🍔", color: "#f59e0b", type: "expense" },
  { id: "transport", name: "Transporte", icon: "🚗", color: "#3b82f6", type: "expense" },
  { id: "housing", name: "Moradia", icon: "🏠", color: "#8b5cf6", type: "expense" },
  { id: "health", name: "Saúde", icon: "🏥", color: "#ec4899", type: "expense" },
  { id: "education", name: "Educação", icon: "📚", color: "#06b6d4", type: "expense" },
  { id: "entertainment", name: "Lazer", icon: "🎮", color: "#f43f5e", type: "expense" },
  { id: "shopping", name: "Compras", icon: "🛍️", color: "#a855f7", type: "expense" },
  { id: "bills", name: "Contas", icon: "📄", color: "#64748b", type: "expense" },
  { id: "other-expense", name: "Outros", icon: "💸", color: "#6b7280", type: "expense" },
]

export const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "income",
    amount: 5000,
    category: "salary",
    description: "Salário mensal",
    date: "2026-01-01",
    account: "Banco Principal",
  },
  {
    id: "2",
    type: "expense",
    amount: 120.5,
    category: "food",
    description: "Supermercado",
    date: "2026-01-02",
    account: "Cartão de Crédito",
  },
  {
    id: "3",
    type: "expense",
    amount: 50,
    category: "transport",
    description: "Combustível",
    date: "2026-01-03",
    account: "Banco Principal",
  },
  {
    id: "4",
    type: "expense",
    amount: 1200,
    category: "housing",
    description: "Aluguel",
    date: "2026-01-01",
    account: "Banco Principal",
  },
  {
    id: "5",
    type: "income",
    amount: 800,
    category: "freelance",
    description: "Projeto web",
    date: "2026-01-04",
    account: "Banco Principal",
  },
  {
    id: "6",
    type: "expense",
    amount: 89.9,
    category: "entertainment",
    description: "Netflix e Spotify",
    date: "2026-01-05",
    account: "Cartão de Crédito",
  },
  {
    id: "7",
    type: "expense",
    amount: 45.3,
    category: "food",
    description: "Restaurante",
    date: "2026-01-05",
    account: "Cartão de Crédito",
  },
  {
    id: "8",
    type: "expense",
    amount: 200,
    category: "health",
    description: "Farmácia",
    date: "2026-01-06",
    account: "Banco Principal",
  },
]

export const getCategoryById = (id: string) => {
  return categories.find((cat) => cat.id === id)
}

export const getTransactionsByMonth = (month: number, year: number) => {
  return mockTransactions.filter((t) => {
    const date = new Date(t.date)
    return date.getMonth() === month && date.getFullYear() === year
  })
}

export const calculateBalance = (transactions: Transaction[]) => {
  const income = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const expenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  return {
    income,
    expenses,
    balance: income - expenses,
  }
}
