"use client"

export const SETTINGS_KEY = "financeflow:settings:v1"
export const BUDGETS_KEY = "financeflow:budgets:v1"

export type Theme = "light" | "dark"

export type UserSettings = {
  displayName: string
  theme: Theme
  language: string
  currency: string
  monthStartDay: string
  savingsTargetPercent: string
  budgetWarningPercent: string
  notifications: boolean
  emailNotifications: boolean
  pushNotifications: boolean
  budgetAlerts: boolean
  monthlySummary: boolean
  privacyMode: boolean
}

export const defaultSettings: UserSettings = {
  displayName: "",
  theme: "light",
  language: "pt-BR",
  currency: "BRL",
  monthStartDay: "1",
  savingsTargetPercent: "20",
  budgetWarningPercent: "80",
  notifications: true,
  emailNotifications: true,
  pushNotifications: false,
  budgetAlerts: true,
  monthlySummary: true,
  privacyMode: false,
}

function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark"
}

function toStringSetting(value: unknown, fallback: string) {
  if (typeof value === "string") return value
  if (typeof value === "number" && Number.isFinite(value)) return String(value)
  return fallback
}

function toBooleanSetting(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback
}

export function mergeUserSettings(data?: Partial<UserSettings> | null): UserSettings {
  return {
    displayName: toStringSetting(data?.displayName, defaultSettings.displayName),
    theme: isTheme(data?.theme) ? data.theme : defaultSettings.theme,
    language: toStringSetting(data?.language, defaultSettings.language),
    currency: toStringSetting(data?.currency, defaultSettings.currency),
    monthStartDay: toStringSetting(data?.monthStartDay, defaultSettings.monthStartDay),
    savingsTargetPercent: toStringSetting(
      data?.savingsTargetPercent,
      defaultSettings.savingsTargetPercent,
    ),
    budgetWarningPercent: toStringSetting(
      data?.budgetWarningPercent,
      defaultSettings.budgetWarningPercent,
    ),
    notifications: toBooleanSetting(data?.notifications, defaultSettings.notifications),
    emailNotifications: toBooleanSetting(
      data?.emailNotifications,
      defaultSettings.emailNotifications,
    ),
    pushNotifications: toBooleanSetting(data?.pushNotifications, defaultSettings.pushNotifications),
    budgetAlerts: toBooleanSetting(data?.budgetAlerts, defaultSettings.budgetAlerts),
    monthlySummary: toBooleanSetting(data?.monthlySummary, defaultSettings.monthlySummary),
    privacyMode: toBooleanSetting(data?.privacyMode, defaultSettings.privacyMode),
  }
}

export function readLocalSettings() {
  if (typeof window === "undefined") return null

  try {
    const storedSettings = window.localStorage.getItem(SETTINGS_KEY)
    return storedSettings ? mergeUserSettings(JSON.parse(storedSettings)) : null
  } catch (error) {
    console.error("Failed to read local settings", error)
    return null
  }
}

export function writeLocalSettings(settings: UserSettings) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

export function parsePercentSetting(
  value: string,
  fallback: string,
  min = 0,
  max = 100,
) {
  const parsed = Number(value)
  const fallbackValue = Number(fallback)
  const safeValue = Number.isFinite(parsed) ? parsed : fallbackValue

  return Math.min(Math.max(safeValue, min), max)
}
