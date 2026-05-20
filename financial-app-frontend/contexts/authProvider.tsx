"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { getApiUrl } from "@/lib/api/client"
import { supabase } from "@/lib/supabase/client"

type User = {
  id: string
  email: string
  name?: string
  last_name?: string
}

type AuthContextType = {
  user: User | null
  loading: boolean
  token: string
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  token: "",
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState("")

  useEffect(() => {
    async function loadUser(session: Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"]) {
      if (!session) {
        setUser(null)
        setLoading(false)
        return
      }

      try {
        const res = await fetch(getApiUrl("/auth/me"), {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        setUser(res.ok ? await res.json() : null)
      } catch (error) {
        console.error("Failed to load user:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setToken(session?.access_token || "")
      loadUser(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "INITIAL_SESSION"
        ) {
          setToken(session?.access_token || "")
          loadUser(session)
        }

        if (event === "SIGNED_OUT") {
          setUser(null)
          setToken("")
          setLoading(false)
        }
      },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, token }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
