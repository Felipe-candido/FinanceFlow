"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { authService } from "@/lib/auth"
import { useAuth } from "@/contexts/authProvider"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Database,
  Download,
  Globe,
  Loader2,
  LogOut,
  Moon,
  PiggyBank,
  Save,
  Shield,
  Smartphone,
  Sun,
  Target,
  User,
  WalletCards,
} from "lucide-react"

const SETTINGS_KEY = "financeflow:settings:v1"
const BUDGETS_KEY = "financeflow:budgets:v1"

type Theme = "light" | "dark"

type Settings = {
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

const defaultSettings: Settings = {
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

const navItems = [
  { id: "profile", label: "Perfil", icon: User },
  { id: "preferences", label: "Preferencias", icon: Globe },
  { id: "finance", label: "Financas", icon: WalletCards },
  { id: "notifications", label: "Alertas", icon: Bell },
  { id: "privacy", label: "Dados", icon: Shield },
]

function getInitials(name?: string, email?: string) {
  const source = name?.trim() || email?.trim() || "Usuario"
  const parts = source.split(" ").filter(Boolean)

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }

  return source.slice(0, 2).toUpperCase()
}

export default function SettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [settingsLoaded, setSettingsLoaded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [confirmClearData, setConfirmClearData] = useState(false)

  useEffect(() => {
    try {
      const storedSettings = window.localStorage.getItem(SETTINGS_KEY)

      if (storedSettings) {
        setSettings((current) => ({
          ...current,
          ...JSON.parse(storedSettings),
        }))
      }
    } catch (error) {
      console.error("Failed to load settings", error)
    } finally {
      setSettingsLoaded(true)
    }
  }, [])

  useEffect(() => {
    if (!settingsLoaded || settings.displayName) return

    setSettings((current) => ({
      ...current,
      displayName: user?.name ?? "",
    }))
  }, [settings.displayName, settingsLoaded, user?.name])

  useEffect(() => {
    if (!settingsLoaded) return

    document.documentElement.classList.toggle("dark", settings.theme === "dark")
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  }, [settings, settingsLoaded])

  const profileName = settings.displayName || user?.name || "Usuario"
  const profileEmail = user?.email || ""
  const financeSummary = useMemo(() => {
    return [
      {
        label: "Meta de reserva",
        value: `${settings.savingsTargetPercent}%`,
        helper: "da renda mensal",
      },
      {
        label: "Alerta de orcamento",
        value: `${settings.budgetWarningPercent}%`,
        helper: "do limite usado",
      },
      {
        label: "Fechamento",
        value: `Dia ${settings.monthStartDay}`,
        helper: "inicio do ciclo",
      },
    ]
  }, [settings.budgetWarningPercent, settings.monthStartDay, settings.savingsTargetPercent])

  const updateSetting = <Key extends keyof Settings>(key: Key, value: Settings[Key]) => {
    setSaved(false)
    setSettings((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const handleSaveSettings = async () => {
    setSaving(true)
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
    await new Promise((resolve) => setTimeout(resolve, 400))
    setSaving(false)
    setSaved(true)
  }

  const handleLogout = async () => {
    await authService.logout()
    router.push("/login")
  }

  const handleExportData = () => {
    const payload = {
      exported_at: new Date().toISOString(),
      settings,
      budgets: JSON.parse(window.localStorage.getItem(BUDGETS_KEY) || "[]"),
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = "financeflow-configuracoes.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleClearLocalData = () => {
    if (!confirmClearData) {
      setConfirmClearData(true)
      return
    }

    window.localStorage.removeItem(SETTINGS_KEY)
    window.localStorage.removeItem(BUDGETS_KEY)
    setSettings(defaultSettings)
    setConfirmClearData(false)
    setSaved(false)
  }

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configuracoes</h2>
          <p className="mt-1 text-muted-foreground">Preferencias essenciais da conta e do app financeiro</p>
        </div>

        <div className="flex items-center gap-2">
          {saved && <Badge variant="outline">Salvo</Badge>}
          <Button className="gap-2" onClick={handleSaveSettings} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Salvar
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <Card className="h-fit lg:sticky lg:top-6">
          <CardContent className="p-4">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon

                return (
                  <button
                    key={item.id}
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    onClick={() => scrollToSection(item.id)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card id="profile" className="scroll-mt-6">
            <CardHeader>
              <CardTitle>Perfil</CardTitle>
              <CardDescription>Informacoes basicas usadas dentro do FinanceFlow</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="h-20 w-20">
                  <AvatarFallback className="bg-primary text-xl text-primary-foreground">
                    {getInitials(profileName, profileEmail)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold">{profileName}</p>
                  <p className="truncate text-sm text-muted-foreground">{profileEmail || "Email nao disponivel"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">A foto de perfil ainda nao esta conectada ao backend.</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome de exibicao</Label>
                  <Input
                    id="name"
                    value={settings.displayName}
                    placeholder={user?.name || "Seu nome"}
                    onChange={(event) => updateSetting("displayName", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email da conta</Label>
                  <Input id="email" type="email" value={profileEmail} disabled />
                  <p className="text-xs text-muted-foreground">Alteracao de email precisa ser feita pela autenticacao.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="preferences" className="scroll-mt-6">
            <CardHeader>
              <CardTitle>Aparencia e regiao</CardTitle>
              <CardDescription>Configure como valores, idioma e tema aparecem no app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <Label className="text-base">Tema</Label>
                  <p className="text-sm text-muted-foreground">Alterna entre claro e escuro neste dispositivo.</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => updateSetting("theme", settings.theme === "light" ? "dark" : "light")}
                  className="bg-transparent"
                  aria-label="Alternar tema"
                >
                  {settings.theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Idioma</Label>
                  <Select value={settings.language} onValueChange={(value) => updateSetting("language", value)}>
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt-BR">Portugues (Brasil)</SelectItem>
                      <SelectItem value="en-US">English (United States)</SelectItem>
                      <SelectItem value="es-ES">Espanol</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Moeda padrao</Label>
                  <Select value={settings.currency} onValueChange={(value) => updateSetting("currency", value)}>
                    <SelectTrigger id="currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BRL">Real brasileiro (BRL)</SelectItem>
                      <SelectItem value="USD">Dolar americano (USD)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="finance" className="scroll-mt-6">
            <CardHeader>
              <CardTitle>Preferencias financeiras</CardTitle>
              <CardDescription>Metas e regras usadas em orcamentos e relatorios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                {financeSummary.map((item) => (
                  <div key={item.label} className="rounded-lg border p-4">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="mt-2 text-2xl font-bold">{item.value}</p>
                    <p className="text-xs text-muted-foreground">{item.helper}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="savingsTarget">Meta de reserva mensal (%)</Label>
                  <Input
                    id="savingsTarget"
                    type="number"
                    min="0"
                    max="100"
                    value={settings.savingsTargetPercent}
                    onChange={(event) => updateSetting("savingsTargetPercent", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budgetWarning">Alerta de orcamento (%)</Label>
                  <Input
                    id="budgetWarning"
                    type="number"
                    min="1"
                    max="100"
                    value={settings.budgetWarningPercent}
                    onChange={(event) => updateSetting("budgetWarningPercent", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="monthStart">Dia inicial do mes financeiro</Label>
                  <Input
                    id="monthStart"
                    type="number"
                    min="1"
                    max="28"
                    value={settings.monthStartDay}
                    onChange={(event) => updateSetting("monthStartDay", event.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="notifications" className="scroll-mt-6">
            <CardHeader>
              <CardTitle>Alertas e notificacoes</CardTitle>
              <CardDescription>Escolha quais sinais financeiros voce quer acompanhar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SettingSwitch
                label="Notificacoes gerais"
                description="Habilita comunicacoes e avisos dentro do app."
                checked={settings.notifications}
                onCheckedChange={(checked) => updateSetting("notifications", checked)}
                icon={Bell}
              />

              <Separator />

              <SettingSwitch
                label="Alertas de orcamento"
                description="Avise quando uma categoria se aproximar do limite definido."
                checked={settings.budgetAlerts}
                onCheckedChange={(checked) => updateSetting("budgetAlerts", checked)}
                icon={Target}
                disabled={!settings.notifications}
              />

              <Separator />

              <SettingSwitch
                label="Resumo mensal por email"
                description="Receba um fechamento com saldo, gastos e categorias principais."
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => updateSetting("emailNotifications", checked)}
                icon={CalendarDays}
                disabled={!settings.notifications}
              />

              <Separator />

              <SettingSwitch
                label="Notificacoes push"
                description="Receba alertas no dispositivo quando essa integracao estiver disponivel."
                checked={settings.pushNotifications}
                onCheckedChange={(checked) => updateSetting("pushNotifications", checked)}
                icon={Smartphone}
                disabled={!settings.notifications}
              />
            </CardContent>
          </Card>

          <Card id="privacy" className="scroll-mt-6">
            <CardHeader>
              <CardTitle>Dados e privacidade</CardTitle>
              <CardDescription>Controle dados locais e sessoes deste dispositivo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <SettingSwitch
                label="Modo privacidade"
                description="Oculta valores financeiros em telas compartilhadas quando a interface suportar."
                checked={settings.privacyMode}
                onCheckedChange={(checked) => updateSetting("privacyMode", checked)}
                icon={Shield}
              />

              <Separator />

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="flex items-start gap-3">
                    <Download className="mt-0.5 h-5 w-5 text-primary" />
                    <div className="flex-1">
                      <p className="font-medium">Exportar configuracoes</p>
                      <p className="mt-1 text-sm text-muted-foreground">Baixe um JSON com preferencias e orcamentos locais.</p>
                      <Button variant="outline" className="mt-3 bg-transparent" onClick={handleExportData}>
                        Exportar
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                  <div className="flex items-start gap-3">
                    <Database className="mt-0.5 h-5 w-5 text-destructive" />
                    <div className="flex-1">
                      <p className="font-medium">Limpar dados locais</p>
                      <p className="mt-1 text-sm text-muted-foreground">Remove configuracoes e orcamentos salvos neste navegador.</p>
                      <Button variant="destructive" className="mt-3" onClick={handleClearLocalData}>
                        {confirmClearData ? "Confirmar limpeza" : "Limpar dados"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/50">
            <CardHeader>
              <CardTitle className="text-destructive">Sessao</CardTitle>
              <CardDescription>Acoes de acesso da conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium">Sair da conta</p>
                  <p className="mt-1 text-sm text-muted-foreground">Voce sera redirecionado para a tela de login.</p>
                </div>
                <Button variant="destructive" onClick={handleLogout} className="gap-2 sm:w-auto">
                  <LogOut className="h-4 w-4" />
                  Sair
                </Button>
              </div>

              <div className="flex items-start gap-3 rounded-lg border p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Exclusao permanente de conta ainda nao esta conectada a uma rota segura no backend. Mantive fora da acao direta para evitar perda acidental de dados.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function SettingSwitch({
  label,
  description,
  checked,
  onCheckedChange,
  icon: Icon,
  disabled,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  icon: React.ComponentType<{ className?: string }>
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <Icon className="mt-1 h-4 w-4 flex-shrink-0 text-muted-foreground" />
        <div>
          <Label className="text-base">{label}</Label>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
    </div>
  )
}
