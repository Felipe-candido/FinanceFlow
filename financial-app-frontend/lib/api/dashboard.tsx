import { getApiUrl } from "@/lib/api/client"

export async function getDashboardData(params: {
  token: string
  month?: number
  year?: number
  category?: string
  start_date?: string
  end_date?: string
}) {
  const searchParams = new URLSearchParams()

  if (params.month !== undefined) {
    searchParams.append("month", String(params.month))
  }

  if (params.year !== undefined) {
    searchParams.append("year", String(params.year))
  }

  if (params.category) {
    searchParams.append("category", params.category)
  }

  if (params.start_date) {
    searchParams.append("start_date", params.start_date)
  }

  if (params.end_date) {
    searchParams.append("end_date", params.end_date)
  }

  const url =
    searchParams.toString().length > 0
      ? `${getApiUrl("/dashboard/summary")}?${searchParams.toString()}`
      : getApiUrl("/dashboard/summary")

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${params.token}`,
      "Content-Type": "application/json",
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard data")
  }

  return await response.json()
}
