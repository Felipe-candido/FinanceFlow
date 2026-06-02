"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"
import { useAuth } from "@/contexts/authProvider"
import { getSettings } from "@/lib/api/settings"
import {
  mergeUserSettings,
  readLocalSettings,
  type UserSettings,
  writeLocalSettings,
} from "@/lib/user-settings"

export function UserSettingsThemeSync() {
  const { token } = useAuth()
  const { setTheme } = useTheme()

  useEffect(() => {
    const localSettings = readLocalSettings()
    if (localSettings) {
      setTheme(localSettings.theme)
    }
  }, [setTheme])

  useEffect(() => {
    if (!token) return

    let cancelled = false

    async function syncThemeFromAccount() {
      try {
        const response = await getSettings<Partial<UserSettings>>(token)
        if (cancelled) return

        const accountSettings = mergeUserSettings(response.data)
        writeLocalSettings(accountSettings)
        setTheme(accountSettings.theme)
      } catch (error) {
        console.error("Failed to sync account theme", error)
      }
    }

    syncThemeFromAccount()

    return () => {
      cancelled = true
    }
  }, [setTheme, token])

  return null
}
