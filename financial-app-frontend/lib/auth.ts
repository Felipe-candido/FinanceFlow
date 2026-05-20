import { getApiUrl } from "@/lib/api/client"
import { supabase } from "./supabase/client"

type UserData = {
  name: string
  email: string
  password: string
}

async function syncBackendUser(accessToken?: string) {
  if (!accessToken) return

  await fetch(getApiUrl("/auth/sync"), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })
}

export const authService = {
  async register({ name, email, password }: UserData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    })

    if (error) throw error
    if (!data.user) throw new Error("User not created")

    await syncBackendUser(data.session?.access_token)

    return data.user
  },

  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    await syncBackendUser(data.session?.access_token)

    return data.user
  },

  async logout() {
    await supabase.auth.signOut()
  },

  async getUser() {
    const { data, error } = await supabase.auth.getUser()
    if (error) return null
    return data.user
  },

  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

    if (error) throw error
    return data
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    })

    if (error) throw error
  },
}
