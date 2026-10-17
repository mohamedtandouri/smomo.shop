"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  Search, 
  CreditCard, 
  Mail, 
  BarChart3, 
  Settings, 
  MessageCircle, 
  Share2, 
  RefreshCw, 
  Loader2, 
  Check, 
  X,
  Key
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface AppIntegration {
  id: string
  name: string
  description: string
  category: string
  installed: boolean
  apiKey?: string
  webhookUrl?: string
}

export default function AppsPage() {
  const [apps, setApps] = useState<AppIntegration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Configuration Modal
  const [selectedApp, setSelectedApp] = useState<AppIntegration | null>(null)
  const [configApiKey, setConfigApiKey] = useState("")
  const [configWebhook, setConfigWebhook] = useState("")
  const [isSavingConfig, setIsSavingConfig] = useState(false)

  const fetchApps = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/store/apps")
      const data = await res.json()
      if (data.success && Array.isArray(data.apps)) {
        setApps(data.apps)
      } else {
        toast.error("Failed to load integrations")
      }
    } catch (err) {
      console.error("Error fetching apps:", err)
      toast.error("Network error while loading apps")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchApps()
  }, [fetchApps])

  // Toggle Install / Uninstall
  const handleToggleInstall = async (app: AppIntegration) => {
    const nextState = !app.installed
    try {
      const res = await fetch("/api/store/apps", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: app.id,
          installed: nextState,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(nextState ? `${app.name} installed successfully` : `${app.name} uninstalled`)
        fetchApps()
      } else {
        toast.error(data.error || "Failed to update app status")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update app")
    }
  }

  // Save Settings Modal
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedApp) return

    try {
      setIsSavingConfig(true)
      const res = await fetch("/api/store/apps", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedApp.id,
          apiKey: configApiKey.trim(),
          webhookUrl: configWebhook.trim(),
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Settings saved successfully to database")
        setSelectedApp(null)
        fetchApps()
      } else {
        toast.error(data.error || "Failed to save settings")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings")
    } finally {
      setIsSavingConfig(false)
    }
  }

  const getAppIcon = (id: string) => {
    switch (id) {
      case "stripe":
        return <CreditCard className="h-6 w-6 text-blue-500" />
      case "mailchimp":
        return <Mail className="h-6 w-6 text-yellow-500" />
      case "analytics":
        return <BarChart3 className="h-6 w-6 text-orange-500" />
      case "whatsapp":
        return <MessageCircle className="h-6 w-6 text-emerald-500" />
      default:
        return <Share2 className="h-6 w-6 text-purple-500" />
    }
  }

  const filteredApps = apps.filter((app) => {
    const q = searchQuery.toLowerCase().trim()
    return q === "" || app.name.toLowerCase().includes(q) || app.description.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Apps & Integrations</h1>
          <p className="text-muted-foreground text-sm">
            Live database management for payment gateways, marketing tools, and analytics tracking.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchApps()} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background w-full h-9"
            />
          </div>
        </div>
      </div>

      {/* Apps Grid */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center text-muted-foreground gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm">Loading store integrations...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="p-12 text-center text-muted-foreground border rounded-xl bg-card">
          <p className="text-sm font-medium">No applications found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredApps.map((app) => (
            <Card key={app.id} className="hover:shadow-md transition-shadow flex flex-col justify-between">
              <CardHeader className="pb-4 flex flex-row items-start justify-between">
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  {getAppIcon(app.id)}
                </div>
                {app.installed ? (
                  <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 uppercase text-[10px] tracking-wide">
                    Installed
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground uppercase text-[10px] tracking-wide">
                    Available
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="flex-1">
                <CardTitle className="mb-1 text-base">{app.name}</CardTitle>
                <div className="text-xs text-muted-foreground font-mono mb-2">{app.category}</div>
                <CardDescription className="line-clamp-2 text-xs leading-relaxed">
                  {app.description}
                </CardDescription>
              </CardContent>
              <CardFooter className="pt-2 border-t flex gap-2">
                {app.installed ? (
                  <>
                    <Button
                      variant="outline"
                      className="flex-1 text-xs"
                      onClick={() => {
                        setSelectedApp(app)
                        setConfigApiKey(app.apiKey || "")
                        setConfigWebhook(app.webhookUrl || "")
                      }}
                    >
                      <Settings className="mr-1.5 h-3.5 w-3.5" /> Configure
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-destructive hover:bg-destructive/10"
                      onClick={() => handleToggleInstall(app)}
                    >
                      Uninstall
                    </Button>
                  </>
                ) : (
                  <Button className="w-full text-xs" onClick={() => handleToggleInstall(app)}>
                    Install App
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Configuration Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configure {selectedApp?.name}</DialogTitle>
            <DialogDescription>
              Save credentials and endpoint parameters directly into the persistent storage.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveSettings} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Key className="h-3.5 w-3.5 text-primary" /> API Key / Token / Secret
              </label>
              <Input
                placeholder="Enter API Key or Public Token"
                value={configApiKey}
                onChange={(e) => setConfigApiKey(e.target.value)}
                className="mt-1 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Webhook URL / Endpoint</label>
              <Input
                placeholder="https://yourstore.com/api/webhooks"
                value={configWebhook}
                onChange={(e) => setConfigWebhook(e.target.value)}
                className="mt-1 font-mono text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setSelectedApp(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSavingConfig} className="gap-2">
                {isSavingConfig && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Settings
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
