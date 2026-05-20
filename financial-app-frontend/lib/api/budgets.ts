import { apiFetch } from "@/lib/api/client"
import type { BudgetResponse } from "@/lib/data"

export type BudgetPayload = {
  category_id: string
  limit: number
}

export async function getBudgets(token: string) {
  return apiFetch<BudgetResponse[]>("/budgets", token)
}

export async function createBudget(token: string, budget: BudgetPayload) {
  return apiFetch<BudgetResponse>("/budgets", token, {
    method: "POST",
    body: JSON.stringify(budget),
  })
}

export async function updateBudget(token: string, id: string, budget: BudgetPayload) {
  return apiFetch<BudgetResponse>(`/budgets/${id}`, token, {
    method: "PUT",
    body: JSON.stringify(budget),
  })
}

export async function deleteBudget(token: string, id: string) {
  return apiFetch<{ message: string }>(`/budgets/${id}`, token, {
    method: "DELETE",
  })
}
