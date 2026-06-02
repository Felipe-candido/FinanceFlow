import { apiFetch } from "@/lib/api/client"
import type { Category, RecurringTransaction, Transaction } from "@/lib/data"

type TransactionPayload = {
      date: string
      type: "income" | "expense"
      amount: number
      category_id: string
      description: string
      is_recurring?: boolean
      recurrence_interval_months?: number
      recurrence_occurrences?: number
      recurrence_end_date?: string
}

type CategoryPayload = {
      name: string
      type: "income" | "expense"
      color?: string
}

export async function getCategories(token: string) {
      return apiFetch<Category[]>("/categories/list", token)
}

export async function getTransactions(token: string) {
      return apiFetch<Transaction[]>("/transactions/list", token)
}

export async function getRecurringTransactions(token: string) {
      return apiFetch<RecurringTransaction[]>("/transactions/recurring/list", token)
}

export async function createTransaction(token: string, transaction: TransactionPayload) {
      return apiFetch<Transaction>("/transactions/add", token, {
            method: "POST",
            body: JSON.stringify(transaction),
      })
}

export async function updateTransaction(token: string, idTransaction: string, transaction: Partial<TransactionPayload>) {
      return apiFetch<Transaction>(`/transactions/update/${idTransaction}`, token, {
            method: "PUT",
            body: JSON.stringify(transaction),
      })
}

export async function deleteTransaction(token:string, idTransaction: string) {
      return apiFetch<{ message: string }>(`/transactions/${idTransaction}`, token, {
            method: "DELETE",
      })
}

export async function updateRecurringTransactionStatus(
      token: string,
      idRecurringTransaction: string,
      isActive: boolean,
) {
      return apiFetch<RecurringTransaction>(`/transactions/recurring/${idRecurringTransaction}`, token, {
            method: "PATCH",
            body: JSON.stringify({ is_active: isActive }),
      })
}

export async function deleteRecurringTransaction(token: string, idRecurringTransaction: string) {
      return apiFetch<{ message: string }>(`/transactions/recurring/${idRecurringTransaction}`, token, {
            method: "DELETE",
      })
}

export async function createCategory(token: string, category: CategoryPayload) {
      return apiFetch<Category>("/categories", token, {
            method: "POST",
            body: JSON.stringify(category),
      })
}

export async function updateCategory(token: string, id: string, category: Partial<CategoryPayload>) {
      return apiFetch<Category>(`/categories/${id}`, token, {
            method: "PUT",
            body: JSON.stringify(category),
      })
}

export async function deleteCategory(token: string, id: string) {
      return apiFetch<{ message: string }>(`/categories/${id}`, token, {
            method: "DELETE",
      })
}
