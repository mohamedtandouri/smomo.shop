"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Edit2,
  Package,
  Plus,
  Minus,
  Check,
} from "lucide-react"
import { useLocaleStore } from "@/store/useLocaleStore"

interface InventoryItem {
  id: string
  product: string
  name: string
  sku: string
  stock: number
  price: number
  imageUrl?: string
  status: "in_stock" | "low_stock" | "out_of_stock"
  lastUpdated: string
}

interface InventoryStats {
  totalUnits: number
  totalUnitsFormatted: string
  growthRate: string
  lowStockItems: number
  lowStockSubtitle: string
  outOfStockItems: number
  outOfStockSubtitle: string
}

export default function InventoryPage() {
  const { t } = useLocaleStore()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [stats, setStats] = useState<InventoryStats>({
    totalUnits: 12450,
    totalUnitsFormatted: "12,450",
    growthRate: "+2.5% from last month",
    lowStockItems: 24,
    lowStockSubtitle: "Needs attention soon",
    outOfStockItems: 3,
    outOfStockSubtitle: "Revenue loss potential",
  })
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  // Modal State for "Update Stock"
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null)
  const [newStock, setNewStock] = useState<number>(0)
  const [isSaving, setIsSaving] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Fetch Inventory Data
  const fetchInventory = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/inventory")
      const data = await res.json()
      if (data.success) {
        setItems(data.items || [])
        if (data.stats) {
          setStats(data.stats)
        }
      }
    } catch (error) {
      console.error("Failed to load inventory:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchInventory()
  }, [])

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Filtered Items (Client-side fast search & filter)
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !q ||
        item.product.toLowerCase().includes(q) ||
        item.sku.toLowerCase().includes(q)

      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter

      return matchesQuery && matchesStatus
    })
  }, [items, searchQuery, statusFilter])

  // Handle opening stock edit modal
  const handleOpenEdit = (item?: InventoryItem) => {
    if (item) {
      setSelectedProduct(item)
      setNewStock(item.stock)
    } else if (items.length > 0) {
      setSelectedProduct(items[0])
      setNewStock(items[0].stock)
    }
    setIsUpdateModalOpen(true)
  }

  // Handle saving updated stock
  const handleSaveStock = async () => {
    if (!selectedProduct) return
    setIsSaving(true)
    try {
      const res = await fetch(`/api/products/${selectedProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: Number(newStock) }),
      })
      const result = await res.json()

      if (result.success) {
        setNotification({
          type: "success",
          message: `Stock for "${selectedProduct.product}" updated to ${newStock} units.`,
        })
        setIsUpdateModalOpen(false)
        // Refresh live data to update both table and stats cards
        await fetchInventory()
      } else {
        setNotification({
          type: "error",
          message: result.error || "Failed to update stock.",
        })
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Network error occurred.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`flex items-center justify-between px-4 py-3 rounded-lg border text-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-rose-50 text-rose-800 border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <Check className="h-4 w-4 text-emerald-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-muted-foreground hover:text-foreground text-xs font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header matching exact layout from Screenshot 1 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("inventory.management", "Inventory Management")}</h1>
          <p className="text-muted-foreground text-sm">{t("inventory.subtitle", "Monitor your stock levels and inventory reviews.")}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/products/inventory/reviews">
            <Button variant="outline" className="border-gray-200">
              {t("inventory.view_reviews", "View Reviews")}
            </Button>
          </Link>
          <Button
            onClick={() => handleOpenEdit()}
            className="bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-sm"
          >
            {t("inventory.update_stock", "Update Stock")}
          </Button>
        </div>
      </div>

      {/* Top 3 Metric Cards matching exact numbers and styles */}
      <div className="grid gap-6 sm:grid-cols-3">
        {/* Card 1: Total Units */}
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("inventory.total_units", "Total Units")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats.totalUnits.toLocaleString()}
            </div>
            <p className="text-xs text-emerald-500 flex items-center mt-1 font-medium">
              <TrendingUp className="h-3.5 w-3.5 me-1" /> {stats.growthRate}
            </p>
          </CardContent>
        </Card>

        {/* Card 2: Low Stock Items */}
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("inventory.low_stock", "Low Stock Items")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {loading ? "..." : stats.lowStockItems}
            </div>
            <p className="text-xs text-amber-500 flex items-center mt-1 font-medium">
              {stats.lowStockSubtitle}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Out of Stock */}
        <Card className="rounded-xl border shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{t("inventory.out_of_stock", "Out of Stock")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {loading ? "..." : stats.outOfStockItems}
            </div>
            <p className="text-xs text-rose-500 flex items-center mt-1 font-medium">
              <TrendingDown className="h-3.5 w-3.5 me-1" /> {stats.outOfStockSubtitle}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card: Current Stock */}
      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg font-semibold">{t("inventory.current_stock", "Current Stock")}</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={t("common.search", "Search inventory...")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-9 bg-muted/40 border-gray-200 h-9"
                />
              </div>

              {/* Status Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-muted h-9 w-9 border-gray-200 cursor-pointer ${
                    statusFilter !== "ALL" ? "border-rose-400 bg-rose-50/50" : ""
                  }`}
                  title="Filter by status"
                >
                  <Filter className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>
                    {t("orders.all_statuses", "All Statuses")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("in_stock")}>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 me-2 inline-block" />
                    {t("inventory.in_stock", "In Stock")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("low_stock")}>
                    <span className="w-2 h-2 rounded-full bg-amber-500 me-2 inline-block" />
                    {t("inventory.low_stock", "Low Stock")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("out_of_stock")}>
                    <span className="w-2 h-2 rounded-full bg-rose-500 me-2 inline-block" />
                    {t("inventory.out_of_stock", "Out of Stock")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={fetchInventory}
                className="h-9 w-9 border-gray-200"
                title="Refresh Inventory"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-rose-500" : ""}`} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/20">
                <TableRow>
                  <TableHead className="font-semibold text-foreground">{t("products.product", "Product")}</TableHead>
                  <TableHead className="font-semibold text-foreground">SKU</TableHead>
                  <TableHead className="text-end font-semibold text-foreground">{t("products.inventory", "Stock Level")}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t("products.status", "Status")}</TableHead>
                  <TableHead className="font-semibold text-foreground">{t("orders.date", "Last Updated")}</TableHead>
                  <TableHead className="text-end font-semibold text-foreground w-[90px]">{t("products.action", "Action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && items.length === 0 ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell><div className="h-4 w-36 bg-muted rounded" /></TableCell>
                      <TableCell><div className="h-4 w-16 bg-muted rounded" /></TableCell>
                      <TableCell className="text-right"><div className="h-4 w-10 bg-muted rounded ml-auto" /></TableCell>
                      <TableCell><div className="h-5 w-20 bg-muted rounded-full" /></TableCell>
                      <TableCell><div className="h-4 w-24 bg-muted rounded" /></TableCell>
                      <TableCell><div className="h-6 w-12 bg-muted rounded ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                      <Package className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      No inventory items found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground">
                        {item.product}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {item.sku}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {item.stock.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {item.status === "in_stock" && (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium px-2.5 py-0.5 rounded-full inline-flex items-center"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 me-1.5 text-emerald-600" />
                            {t("inventory.in_stock", "In Stock")}
                          </Badge>
                        )}
                        {item.status === "low_stock" && (
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 font-medium px-2.5 py-0.5 rounded-full inline-flex items-center"
                          >
                            <AlertCircle className="w-3.5 h-3.5 me-1.5 text-amber-600" />
                            {t("inventory.low_stock", "Low Stock")}
                          </Badge>
                        )}
                        {item.status === "out_of_stock" && (
                          <Badge
                            variant="outline"
                            className="bg-rose-50 text-rose-700 border-rose-200 font-medium px-2.5 py-0.5 rounded-full inline-flex items-center"
                          >
                            <AlertCircle className="w-3.5 h-3.5 me-1.5 text-rose-600" />
                            {t("inventory.out_of_stock", "Out of Stock")}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {item.lastUpdated}
                      </TableCell>
                      <TableCell className="text-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenEdit(item)}
                          className="h-8 px-2 text-muted-foreground hover:text-[#E11D48] hover:bg-rose-50"
                          title={t("common.edit", "Edit Stock")}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dynamic Modal Dialog for "Update Stock" */}
      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Package className="h-5 w-5 text-[#E11D48]" />
              {t("inventory.update_stock", "Update Stock Level")}
            </DialogTitle>
            <DialogDescription>
              {t("inventory.subtitle", "Adjust units in warehouse for real-time inventory tracking and automatic status recalculation.")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-3">
            {/* Product Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("products.product", "Select Product")}</label>
              <select
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-rose-500"
                value={selectedProduct?.id || ""}
                onChange={(e) => {
                  const prod = items.find((p) => p.id === e.target.value)
                  if (prod) {
                    setSelectedProduct(prod)
                    setNewStock(prod.stock)
                  }
                }}
              >
                {items.map((prod) => (
                  <option key={prod.id} value={prod.id}>
                    {prod.product} ({prod.sku}) — {t("inventory.current_stock", "Current")}: {prod.stock}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Stock vs New Stock Display */}
            {selectedProduct && (
              <div className="p-3 bg-muted/40 rounded-lg border flex items-center justify-between text-xs">
                <div>
                  <span className="text-muted-foreground block">SKU</span>
                  <span className="font-mono font-semibold">{selectedProduct.sku}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t("inventory.current_stock", "Current Units")}</span>
                  <span className="font-semibold text-sm">{selectedProduct.stock}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">{t("products.status", "New Status")}</span>
                  <span className="font-semibold">
                    {newStock <= 0 ? (
                      <span className="text-rose-600">{t("inventory.out_of_stock", "Out of Stock")}</span>
                    ) : newStock <= 20 ? (
                      <span className="text-amber-600">{t("inventory.low_stock", "Low Stock")}</span>
                    ) : (
                      <span className="text-emerald-600">{t("inventory.in_stock", "In Stock")}</span>
                    )}
                  </span>
                </div>
              </div>
            )}

            {/* Stock Count Stepper */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("inventory.total_units", "Stock Units")}</label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => setNewStock((prev) => Math.max(0, prev - 10))}
                  title="-10 Units"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Input
                  type="number"
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(Math.max(0, parseInt(e.target.value) || 0))}
                  className="text-center font-bold text-lg h-10"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="h-10 w-10 shrink-0"
                  onClick={() => setNewStock((prev) => prev + 10)}
                  title="+10 Units"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex justify-between gap-1 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 px-2 text-rose-600"
                  onClick={() => setNewStock(0)}
                >
                  {t("inventory.out_of_stock", "Set to 0 (Out of Stock)")}
                </Button>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => setNewStock((prev) => prev + 50)}
                  >
                    +50
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs h-7 px-2"
                    onClick={() => setNewStock((prev) => prev + 100)}
                  >
                    +100
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsUpdateModalOpen(false)}
              disabled={isSaving}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleSaveStock}
              disabled={isSaving || !selectedProduct}
              className="bg-[#E11D48] hover:bg-[#BE123C] text-white"
            >
              {isSaving ? t("common.loading", "Saving...") : t("common.save", "Save Stock")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
