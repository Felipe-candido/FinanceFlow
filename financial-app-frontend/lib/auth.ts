// Mock authentication utilities
// In production, this would integrate with a real backend
import { supabase } from "./supabase/client" 

type UserData = {
  name: string
  email: string
  password: string
}

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))


export const authService = {
  
  async register({name, email, password}: UserData) {
     
    // CRIA USUARIO NO SUPABASE AUTH
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })

    if (error) throw error
    if (!data.user) throw new Error("USER NOT CREATED")

    // CRIA O PERFIL COM OS DADOS ADICIONAIS
    const { error: profileError} = await supabase
      .from("users")
      .insert({
        id: data.user.id,
        name: name,
        email: email,
      })

    if (profileError) throw profileError

    console.log("USER CREATED:", data.user)

    return data.user  
  },


  async login(email: string, password: string){
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    console.log("USER LOGGED IN:", data.user)
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


  async getProfile(userId: string){
    const { data, error} = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single()

      console.log("USER PROFILE:", data)

      if (error) throw error
      return data
  }

 
}
