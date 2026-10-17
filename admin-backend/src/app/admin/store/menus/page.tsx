"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Menu as MenuIcon,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Check,
  Link as LinkIcon,
  RefreshCw,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

interface MenuItem {
  id: string
  label: string
  url: string
}

export default function MenusManagerPage() {
  const [activeMenuTab, setActiveMenuTab] = useState<"header" | "footer">("header")
  const [headerMenu, setHeaderMenu] = useState<MenuItem[]>([])
  const [footerMenu, setFooterMenu] = useState<MenuItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Add Item States
  const [newItemLabel, setNewItemLabel] = useState("")
  const [newItemUrl, setNewItemUrl] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  // Edit Item States
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [editLabel, setEditLabel] = useState("")
  const [editUrl, setEditUrl] = useState("")
  const [isEditing, setIsEditing] = useState(false)

  // Delete State
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchMenus = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/store/menus")
      const data = await res.json()
      if (data.success && data.menus) {
        setHeaderMenu(data.menus.header || [])
        setFooterMenu(data.menus.footer || [])
      } else {
        toast.error("Failed to load store navigation menus")
      }
    } catch (err) {
      console.error("Error fetching menus:", err)
      toast.error("Network error while loading menus")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMenus()
  }, [fetchMenus])

  // Handle Add Item
  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newItemLabel.trim() || !newItemUrl.trim()) {
      toast.error("Both label and URL are required")
      return
    }

    try {
      setIsAdding(true)
      const res = await fetch("/api/store/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location: activeMenuTab,
          label: newItemLabel.trim(),
          url: newItemUrl.trim(),
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`Added link to ${activeMenuTab} menu`)
        setNewItemLabel("")
        setNewItemUrl("")
        if (data.menus) {
          setHeaderMenu(data.menus.header)
          setFooterMenu(data.menus.footer)
        } else {
          fetchMenus()
        }
      } else {
        toast.error(data.error || "Failed to add menu item")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to add menu item")
    } finally {
      setIsAdding(false)
    }
  }

  // Handle Edit Item
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingItem || !editLabel.trim() || !editUrl.trim()) return

    try {
      setIsEditing(true)
      const res = await fetch(`/api/store/menus/${editingItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: editLabel.trim(),
          url: editUrl.trim(),
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success("Menu link updated successfully")
        setEditingItem(null)
        if (data.menus) {
          setHeaderMenu(data.menus.header)
          setFooterMenu(data.menus.footer)
        } else {
          fetchMenus()
        }
      } else {
        toast.error(data.error || "Failed to update menu item")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update menu item")
    } finally {
      setIsEditing(false)
    }
  }

  // Handle Delete Item
  const handleDeleteItem = async () => {
    if (!itemToDelete) return
    try {
      setIsDeleting(true)
      const res = await fetch(`/api/store/menus/${itemToDelete.id}`, {
        method: "DELETE",
      })

      const data = await res.json()
      if (data.success) {
        toast.success("Menu link removed successfully")
        setItemToDelete(null)
        if (data.menus) {
          setHeaderMenu(data.menus.header)
          setFooterMenu(data.menus.footer)
        } else {
          fetchMenus()
        }
      } else {
        toast.error(data.error || "Failed to delete menu item")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete menu item")
    } finally {
      setIsDeleting(false)
    }
  }

  const currentList = activeMenuTab === "header" ? headerMenu : footerMenu

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <MenuIcon className="h-6 w-6 text-primary" />
            Navigation Menus Manager
          </h1>
          <p className="text-muted-foreground text-sm">
            Live database management for store navigation headers, mobile menus, and footer link sections.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => fetchMenus()} disabled={isLoading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <button
          onClick={() => setActiveMenuTab("header")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeMenuTab === "header"
              ? "bg-primary text-white shadow-xs"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>Main Header Menu</span>
          <Badge variant="secondary" className="bg-white/20 text-white font-mono text-xs">
            {headerMenu.length}
          </Badge>
        </button>
        <button
          onClick={() => setActiveMenuTab("footer")}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeMenuTab === "footer"
              ? "bg-primary text-white shadow-xs"
              : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>Footer Links Menu</span>
          <Badge variant="secondary" className="bg-white/20 text-white font-mono text-xs">
            {footerMenu.length}
          </Badge>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Links List Column */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader className="py-4 bg-muted/20 border-b">
              <CardTitle className="text-base font-semibold">
                {activeMenuTab === "header" ? "Active Header Links" : "Active Footer Links"}
              </CardTitle>
              <CardDescription className="text-xs">
                Links are rendered live on your storefront.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="p-8 flex justify-center items-center text-muted-foreground gap-2">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-sm">Loading navigation items...</span>
                </div>
              ) : currentList.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  No links added to this menu yet. Use the form on the right to add one.
                </div>
              ) : (
                <div className="space-y-2">
                  {currentList.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-muted-foreground w-5 text-center">
                          {index + 1}
                        </span>
                        <div>
                          <div className="font-medium text-sm text-foreground">{item.label}</div>
                          <div className="text-xs font-mono text-muted-foreground flex items-center gap-1 mt-0.5">
                            <LinkIcon className="h-3 w-3" />
                            {item.url}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit Link"
                          onClick={() => {
                            setEditingItem(item)
                            setEditLabel(item.label)
                            setEditUrl(item.url)
                          }}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          title="Remove Link"
                          onClick={() => setItemToDelete(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Add Link Form Column */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="py-4 bg-muted/20 border-b">
              <CardTitle className="text-base font-semibold">
                Add {activeMenuTab === "header" ? "Header" : "Footer"} Link
              </CardTitle>
              <CardDescription className="text-xs">
                Enter title and route URL.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground">Menu Label *</label>
                  <Input
                    required
                    placeholder="e.g. Best Sellers or Contact Us"
                    value={newItemLabel}
                    onChange={(e) => setNewItemLabel(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-foreground">Link URL *</label>
                  <Input
                    required
                    placeholder="e.g. /store/products or /store/faq"
                    value={newItemUrl}
                    onChange={(e) => setNewItemUrl(e.target.value)}
                    className="mt-1 font-mono text-xs"
                  />
                </div>

                <Button type="submit" disabled={isAdding} className="w-full gap-2">
                  {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Add to Menu
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Link Modal */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Menu Link</DialogTitle>
            <DialogDescription>
              Update navigation title or destination URL.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSaveEdit} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground">Menu Label</label>
              <Input
                required
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground">Destination URL</label>
              <Input
                required
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="mt-1 font-mono text-xs"
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isEditing} className="gap-2">
                {isEditing && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Menu Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{itemToDelete?.label}" from the navigation menu?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button variant="outline" onClick={() => setItemToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={isDeleting} onClick={handleDeleteItem} className="gap-2">
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
