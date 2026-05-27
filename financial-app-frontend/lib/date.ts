export function getDateOnly(value: string | Date | null | undefined): string | null {
  if (!value) return null

  if (typeof value === "string") {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      return null
    }

    return value.includes("T") ? value.split("T")[0] : parsed.toISOString().split("T")[0]
  }

  if (Number.isNaN(value.getTime())) {
    return null
  }

  const year = value.getFullYear()
  const month = String(value.getMonth() + 1).padStart(2, "0")
  const day = String(value.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function getDateOnlyOrFallback(
  value: string | Date | null | undefined,
  fallback: string,
): string {
  return getDateOnly(value) ?? fallback
}

export function formatDatePtBr(
  value: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions,
): string {
  const dateOnly = getDateOnly(value)
  if (!dateOnly) {
    return "Data invalida"
  }

  const [year, month, day] = dateOnly.split("-").map(Number)
  const parsed = new Date(year, month - 1, day)

  if (Number.isNaN(parsed.getTime())) {
    return "Data invalida"
  }

  return parsed.toLocaleDateString("pt-BR", options)
}
