"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getApiUrl } from "@/lib/api/client"
import { supabase } from "@/lib/supabase/client"

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        router.replace("/login")
        return
      }

      await fetch(getApiUrl("/auth/sync"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
      })

      router.replace("/dashboard")
    }

    handleAuth()
  }, [router])

  return <p>Autenticando...</p>
}
