'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const handleAuth = async () => {
      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        router.replace('/login')
        return
      }

      const user = data.session.user

      // (opcional) sincronizar usuário com backend
      await fetch('http://localhost:8000/auth/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${data.session.access_token}`,
        },
      })

      router.replace('/dashboard')
    }

    handleAuth()
  }, [router, searchParams])

  return <p>Autenticando...</p>
}
