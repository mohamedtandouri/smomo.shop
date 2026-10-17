"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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
import {
  Filter,
  Plus,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Users,
  CheckCircle2,
  Sparkles,
  Layers,
  Zap,
  Trash2,
  Edit2,
  RefreshCw,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

interface FunnelItem {
  id: string
  name: string
  status: "Active" | "Draft" | "Archived"
  visitors: number
  conversionRate: string
  revenue: string
  steps: string[]
  createdAt?: string
}

export default function FunnelsManagerPage() {
  const [funnels, setFunnels] = useState<FunnelItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newFunnelName, setNewFunnelName] = useState("")
  const [newFunnelStatus, setNewFunnelStatus] = useState<"Active" | "Draft">("Active")
  const [isSaving, setIsSaving] = useState(false)

  // Edit Modal
  const [editingFunnel, setEditingFunnel] = useState<FunnelItem | null>(null)
  const [editName, setEditName] = useState("")
  const [editStatus, setEditStatus] = useState<"Active" | "Draft">("Active")
  const [isUpdating, setIsUpdating] = useState(false)

  // Delete State
  const [funnelToDelete, setFunnelToDelete] = useState<FunnelItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchFunnels = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/store/funnels")
      const data = await res.json()
      if (data.success && Array.isArray(data.funnels)) {
        setFunnels(data.funnels)
      } else {
        toast.error("Failed to load sales funnels")
      }
    } catch (err) {
      console.error("Error loading funnels:", err)
      toast.error("Network error while loading funnels")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFunnels()
  }, [fetchFunnels])

  // Summary Metrics
  const metrics = useMemo(() => {
    const activeCount = funnels.filter((f) => f.status === "Active").length
    const draftCount = funnels.filter((f) => f.status === "Draft").length
    let totalRev = 0
    funnels.forEach((f) => {
      const num = parseFloat(f.revenue.replace(/[^0-9.]/g, "")) || 0
      totalRev += num
    })

    return {
      activeCount,
      draftCount,
      totalRevenue: totalRev,
    }
  }, [funnels])

  // Create Funnel
  const handleCreateFunnel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFunnelName.trim()) {
      toast.error("Funnel name is required")
      return
    }

    try {
      setIsSaving(true)
      const res = await fetch("/api/store/funnels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newFunnelName.trim(),
          status: newFunnelStatus,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success("Sales funnel created successfully")
        setIsCreateOpen(false)
        setNewFunnelName("")
        fetchFunnels()
      } else {
        toast.error(data.error || "Failed to create funnel")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create funnel")
    } finally {
      setIsSaving(false)
    }
  }

  // Update Funnel
  const handleUpdateFunnel = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingFunnel || !editName.trim()) return

    try {
      setIsUpdating(true)
      const res = await fetch(`/api/store/funnels/${editingFunnel.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          status: editStatus,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success("Funnel updated successfully")
        setEditingFunnel(null)
        fetchFunnels()
      } else {
        toast.error(data.error || "Failed to update funnel")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update funnel")
    } finally {
      setIsUpdating(false)
    }
  }

  // Delete Funnel
  const handleDeleteFunnel = async () => {
    if (!funnelToDelete) return
    try {
      setIsDeleting(true)
      const res = await fetch(`/api/store/funnels/${funnelToDelete.id}`, {
        method: "DELETE",
      })

      const data = await res.json()
      if (data.success) {
        toast.success("Funnel removed successfully")
        setFunnelToDelete(null)
        fetchFunnels()
      } else {
        toast.error(data.error || "Failed to delete funnel")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete funnel")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Filter className="h-6 w-6 text-primary" />
            Sales Funnels & Landing Pages
          </h1>
          <p className="text-muted-foreground text-sm">
            Live database management for conversion flows, express checkout funnels, and targeted product pages.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchFunnels()} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2 bg-primary">
            <Plus className="h-4 w-4" />
            Create New Funnel
          </Button>
        </div>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="rounded-xl border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Total Funnel Revenue</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground font-mono">
              ${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-emerald-600 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" /> Dynamic funnel sales
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Active Live Funnels</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-primary font-mono">
              {metrics.activeCount} Live
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.draftCount} drafts in development
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-xs">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Average Conversion</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-2xl font-bold text-foreground font-mono">9.8%</div>
            <p className="text-xs text-muted-foreground mt-1">Compared to 2.4% standard store average</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnels List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Your Sales Funnels ({funnels.length})</h3>

        {isLoading ? (
          <div className="p-12 flex justify-center items-center text-muted-foreground gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm">Loading sales funnels...</span>
          </div>
        ) : funnels.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground border rounded-xl bg-card">
            <Filter className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm font-medium">No sales funnels created yet.</p>
            <p className="text-xs mt-1">Click "Create New Funnel" to launch your first high-converting flow.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {funnels.map((funnel) => (
              <Card key={funnel.id} className="rounded-xl border shadow-xs overflow-hidden hover:border-primary/40 transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-foreground">{funnel.name}</h4>
                        <Badge
                          className={
                            funnel.status === "Active"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                              : "bg-muted text-muted-foreground"
                          }
                        >
                          {funnel.status === "Active" ? (
                            <span className="flex items-center gap-1">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              Active
                            </span>
                          ) : (
                            "Draft"
                          )}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">ID: {funnel.id}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 text-xs"
                        onClick={() => {
                          setEditingFunnel(funnel)
                          setEditName(funnel.name)
                          setEditStatus(funnel.status === "Active" ? "Active" : "Draft")
                        }}
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-xs text-destructive hover:bg-destructive/10"
                        onClick={() => setFunnelToDelete(funnel)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Flow Steps Visualizer */}
                  <div className="pt-4 space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Funnel Steps Flow
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {funnel.steps.map((step, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-muted/60 text-xs font-medium text-foreground border">
                            <span className="w-4 h-4 rounded-full bg-primary/20 text-primary text-[10px] flex items-center justify-center font-bold">
                              {idx + 1}
                            </span>
                            {step}
                          </div>
                          {idx < funnel.steps.length - 1 && (
                            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Sales Funnel</DialogTitle>
            <DialogDescription>
              Launch a targeted one-product checkout or bundle accelerator flow.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateFunnel} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground">Funnel Name *</label>
              <Input
                required
                placeholder="e.g. Black Friday Flash Funnel"
                value={newFunnelName}
                onChange={(e) => setNewFunnelName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Initial Status</label>
              <select
                value={newFunnelStatus}
                onChange={(e) => setNewFunnelStatus(e.target.value as "Active" | "Draft")}
                className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Active">Active (Live in store)</option>
                <option value="Draft">Draft (Hidden)</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="gap-2">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Funnel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingFunnel} onOpenChange={(open) => !open && setEditingFunnel(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Sales Funnel</DialogTitle>
            <DialogDescription>
              Update funnel name and live activation status.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateFunnel} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground">Funnel Name</label>
              <Input
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as "Active" | "Draft")}
                className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="Active">Active</option>
                <option value="Draft">Draft</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingFunnel(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating} className="gap-2">
                {isUpdating && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Modal */}
      <Dialog open={!!funnelToDelete} onOpenChange={(open) => !open && setFunnelToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Sales Funnel</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{funnelToDelete?.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setFunnelToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={isDeleting} onClick={handleDeleteFunnel} className="gap-2">
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
