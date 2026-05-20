import { apiFetch } from "@/lib/api/client"

export async function getSettings<T>(token: string) {
  return apiFetch<{ data: T }>("/settings", token)
}

export async function updateSettings<T>(token: string, data: T) {
  return apiFetch<{ data: T }>("/settings", token, {
    method: "PUT",
    body: JSON.stringify({ data }),
  })
}
