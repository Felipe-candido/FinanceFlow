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
  description: string | null
  date: Date | string | null
  recurring_transaction_id?: string | null
  recurrence_sequence?: number | null
}

export interface Category {
  id: string
  name: string
  color: string
  type: "income" | "expense"
  is_default: boolean
}

export interface BudgetResponse {
  id: string
  category_id: string
  limit: number
  category: Category
  created_at: string
  updated_at: string
}

export interface RecurringTransaction {
  id: string
  description: string | null
  type: "income" | "expense"
  start_date: string
  amount: number
  category_id: string
  category: Category
  interval_months: number
  end_date: string | null
  total_occurrences: number | null
  generated_occurrences: number
  is_active: boolean
  created_at: string
  next_occurrence_date: string | null
}

export interface ProjectionPoint {
  date: string;
  balance: number;
}

export interface ProjectionData {
  current_balance: number;
  avg_daily_expense: number;
  projected_balance_in_30_days: number;
  days_until_zero: number | null;
  chart_data: ProjectionPoint[];
}

export type DashboardResponse = {
  total_income: number
  total_expense: number
  balance: number
  expenses_by_category: CategoryTotal[]
  income_by_category: CategoryTotal[]
  last_transactions: Transaction[]
  projection?: ProjectionData;
}
