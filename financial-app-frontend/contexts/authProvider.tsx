"use client"

import { createContext, useContext, useEffect, useState } from "react"
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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getSession()

      const session = data.session

      if (!session) {
        setLoading(false)
        return
      }

      const res = await fetch("http://localhost:8000/auth/me", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      console.log("RES DAQUI:", res)

      const userData = await res.json()
      setUser(userData)
      setLoading(false)
    }

    loadUser()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)