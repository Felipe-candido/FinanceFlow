"use client"

import { Button } from "@/components/ui/button"
import { Bell, Search } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { authService } from "@/lib/auth"
import { useState, useEffect } from "react"

type User = {
  name: string
  last_name?: string
  email: string
}

export function DashboardHeader() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {

    async function loadUser() {
      const user = await authService.getUser()
      if (!user) return

      const userData = await authService.getProfile(user.id)
      setUser(userData)
    }

    loadUser()
  }, [])

  
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6">
        <div className="flex-1">
          <h1 className="text-xl font-semibold">Dashboard</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search className="h-5 w-5" />
            <span className="sr-only">Buscar</span>
          </Button>
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary"></span>
            <span className="sr-only">Notificações</span>
          </Button>
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary text-primary-foreground font-medium">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
