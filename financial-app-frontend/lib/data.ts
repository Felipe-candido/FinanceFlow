export type CategoryTotal = {
  category: string
  total: number
  color: string
}

export interface Transaction {
  id?: string 
  type: string
  amount: number
  category: Category
  description: string
  date: Date | string
}

export interface Category {
  id: string
  name: string
  color: string
  type: "income" | "expense"
  is_default: boolean
}

export type DashboardResponse = {
  total_income: number
  total_expense: number
  balance: number
  expenses_by_category: CategoryTotal[]
  income_by_category: CategoryTotal[]
  last_transactions: Transaction[]
}