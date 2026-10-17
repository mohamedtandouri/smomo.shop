"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  Search, 
  Filter, 
  Eye, 
  Plus, 
  Trash2, 
  Check, 
  Loader2, 
  Package, 
  Calendar, 
  DollarSign, 
  User, 
  X,
  ShoppingBag,
  AlertTriangle,
  ArrowRight
} from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { useLocaleStore } from "@/store/useLocaleStore"

export interface OrderItem {
  id: string
  orderNumber: string
  imageUrl?: string | null
  customerName?: string | null
  customerEmail?: string | null
  total: number
  status: string
  note?: string | null
  createdAt: string | Date
  user?: {
    name: string
    email: string
  } | null
}

const PRESET_PRODUCT_IMAGES = [
  { label: "iPhone 14 Pro Max", url: "/uploads/1033fcf8-15f9-4d72-b18b-8eb5bf115e52.webp" },
  { label: "Apple Watch Series 11", url: "/uploads/76f77d42-0019-42c3-b1b4-f90d04e15202.jpg" },
  { label: "iPhone 15 Pro", url: "/uploads/0bfca58b-364e-44a4-b52d-bbdd4536e532.webp" },
  { label: "Basic Blazer", url: "/uploads/9d37de92-c4b6-4164-8efd-c7bda3b3e1af.webp" },
]

export default function OrdersPage() {
  const { t, language } = useLocaleStore()
  const [orders, setOrders] = useState<OrderItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  // View / Edit Modal State
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [editStatus, setEditStatus] = useState<string>("")
  const [isUpdating, setIsUpdating] = useState(false)

  // Status Change Confirmation Modal State (بطاقة تأكيد التعديل)
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false)

  // Delete Confirmation Modal State (بطاقة تأكيد الحذف)
  const [orderToDelete, setOrderToDelete] = useState<OrderItem | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Create Order Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState("")
  const [newCustomerEmail, setNewCustomerEmail] = useState("")
  const [newTotal, setNewTotal] = useState<string>("99.99")
  const [newStatus, setNewStatus] = useState<string>("Processing")
  const [newImageUrl, setNewImageUrl] = useState<string>(PRESET_PRODUCT_IMAGES[0].url)
  const [newNote, setNewNote] = useState("")

  // Fetch orders from database via API
  const fetchOrders = async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/orders")
      const data = await res.json()
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders)
      } else {
        toast.error("Failed to load orders from database")
      }
    } catch (err) {
      console.error("Error fetching orders:", err)
      toast.error("Network error while loading orders")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const orderNum = order.orderNumber?.toLowerCase() || ""
      const custName = (order.customerName || order.user?.name || "").toLowerCase()
      const query = searchQuery.toLowerCase().trim()

      const matchesSearch = query === "" || orderNum.includes(query) || custName.includes(query)
      const matchesStatus = statusFilter === "ALL" || order.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
  }, [orders, searchQuery, statusFilter])

  // Status Badge with exact visual colors
  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase()
    switch (s) {
      case "processing":
        return (
          <Badge
            variant="outline"
            className="bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-950/60 dark:text-yellow-400 dark:border-yellow-800/60 font-medium px-2.5 py-0.5"
          >
            {t("orders.processing", "Processing")}
          </Badge>
        )
      case "shipped":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800/60 font-medium px-2.5 py-0.5"
          >
            {t("orders.shipped", "Shipped")}
          </Badge>
        )
      case "delivered":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800/60 font-medium px-2.5 py-0.5"
          >
            {t("orders.delivered", "Delivered")}
          </Badge>
        )
      case "cancelled":
        return (
          <Badge
            variant="outline"
            className="bg-red-100 text-red-800 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800/60 font-medium px-2.5 py-0.5"
          >
            {t("orders.cancelled", "Cancelled")}
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-muted text-muted-foreground">
            {status}
          </Badge>
        )
    }
  }

  // Format date nicely matching screenshot
  const formatOrderDate = (dateVal: string | Date) => {
    try {
      const d = new Date(dateVal)
      if (isNaN(d.getTime())) return String(dateVal)

      const now = new Date()
      const isToday = d.toDateString() === now.toDateString()

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const isYesterday = d.toDateString() === yesterday.toDateString()

      const localeCode = language === "ar" ? "ar-SA" : language === "fr" ? "fr-FR" : "en-US"
      const timeStr = d.toLocaleTimeString(localeCode, { hour: "numeric", minute: "2-digit" })

      if (isToday) {
        const todayWord = language === "ar" ? "اليوم" : language === "fr" ? "Aujourd'hui" : "Today"
        return `${todayWord}, ${timeStr}`
      }
      if (isYesterday) {
        return language === "ar" ? "أمس" : language === "fr" ? "Hier" : "Yesterday"
      }

      return d.toLocaleDateString(localeCode, { month: "short", day: "numeric", year: "numeric" })
    } catch {
      return String(dateVal)
    }
  }

  // Open Edit / View Modal
  const handleOpenViewModal = (order: OrderItem) => {
    setSelectedOrder(order)
    setEditStatus(order.status)
    setIsViewModalOpen(true)
  }

  // Prompt Status Update Confirmation Modal
  const handlePromptUpdateStatus = () => {
    if (!selectedOrder) return
    if (editStatus === selectedOrder.status) return
    setIsStatusConfirmOpen(true)
  }

  // Execute Status Update via API
  const handleExecuteUpdateStatus = async () => {
    if (!selectedOrder) return

    try {
      setIsUpdating(true)
      const res = await fetch(`/api/orders/${selectedOrder.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: editStatus }),
      })
      const data = await res.json()

      if (data.success && data.order) {
        // Immediate state update without page reload
        setOrders((prev) =>
          prev.map((ord) => (ord.id === selectedOrder.id ? { ...ord, status: editStatus } : ord))
        )
        setSelectedOrder((prev) => (prev ? { ...prev, status: editStatus } : null))
        toast.success(`Order ${selectedOrder.orderNumber} status updated to ${editStatus}`)
        setIsStatusConfirmOpen(false)
        setIsViewModalOpen(false)
      } else {
        toast.error(data.error || "Failed to update order status")
      }
    } catch (err) {
      console.error("Error updating order:", err)
      toast.error("Failed to communicate with server")
    } finally {
      setIsUpdating(false)
    }
  }

  // Prompt Delete Confirmation Modal (بدون نافذة المتصفح الافتراضية)
  const handlePromptDelete = (order: OrderItem) => {
    setOrderToDelete(order)
    setIsDeleteModalOpen(true)
  }

  // Execute Order Deletion via API
  const handleConfirmDelete = async () => {
    if (!orderToDelete) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/orders/${orderToDelete.id}`, {
        method: "DELETE",
      })
      const data = await res.json()

      if (data.success) {
        setOrders((prev) => prev.filter((ord) => ord.id !== orderToDelete.id))
        toast.success(`Order ${orderToDelete.orderNumber} deleted successfully`)
        setIsDeleteModalOpen(false)
        if (selectedOrder?.id === orderToDelete.id) {
          setIsViewModalOpen(false)
        }
        setOrderToDelete(null)
      } else {
        toast.error(data.error || "Failed to delete order")
      }
    } catch (err) {
      console.error("Error deleting order:", err)
      toast.error("Failed to delete order")
    } finally {
      setIsDeleting(false)
    }
  }

  // Create Order via API
  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newCustomerName.trim()) {
      toast.error("Please enter a customer name")
      return
    }

    const parsedTotal = parseFloat(newTotal)
    if (isNaN(parsedTotal) || parsedTotal < 0) {
      toast.error("Please enter a valid positive total amount")
      return
    }

    try {
      setIsCreating(true)
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: newCustomerName.trim(),
          customerEmail: newCustomerEmail.trim() || undefined,
          total: parsedTotal,
          status: newStatus,
          imageUrl: newImageUrl,
          note: newNote.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (data.success && data.order) {
        // Prepend new order dynamically to state
        setOrders((prev) => [data.order, ...prev])
        toast.success(`Order ${data.order.orderNumber} created successfully!`)
        setIsCreateModalOpen(false)
        // Reset form
        setNewCustomerName("")
        setNewCustomerEmail("")
        setNewTotal("99.99")
        setNewStatus("Processing")
        setNewNote("")
      } else {
        toast.error(data.error || "Failed to create order")
      }
    } catch (err) {
      console.error("Error creating order:", err)
      toast.error("Failed to communicate with server")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("orders.title", "Orders")}</h1>
          <p className="text-muted-foreground text-sm">{t("orders.subtitle", "Manage and track your customer orders.")}</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
        >
          <Plus className="h-4 w-4" /> {t("orders.create_order", "Create Order")}
        </Button>
      </div>

      {/* Main Table Card */}
      <Card className="border shadow-xs overflow-hidden">
        {/* Table Toolbar: Search & Filter */}
        <CardHeader className="py-3 px-4 bg-muted/20 border-b">
          <div className="flex flex-wrap justify-between items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("orders.search_placeholder", "Search orders...")}
                className="ps-9 pe-9 bg-background h-9 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute end-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger className={buttonVariants({ variant: "outline", size: "sm", className: "h-9 gap-1.5 cursor-pointer" })}>
                  <Filter className="h-3.5 w-3.5" />
                  <span>{t("common.filter", "Filter")}</span>
                  {statusFilter !== "ALL" && (
                    <Badge variant="secondary" className="ms-1 px-1.5 py-0 text-[10px] bg-primary/10 text-primary">
                      {statusFilter}
                    </Badge>
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuLabel className="text-xs text-muted-foreground">{t("orders.filter_by_status", "Filter by Status")}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => setStatusFilter("ALL")}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <span>{t("orders.all_statuses", "All Statuses")}</span>
                    {statusFilter === "ALL" && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setStatusFilter("Processing")}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-yellow-500" />
                      <span>{t("orders.processing", "Processing")}</span>
                    </div>
                    {statusFilter === "Processing" && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setStatusFilter("Shipped")}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-blue-500" />
                      <span>{t("orders.shipped", "Shipped")}</span>
                    </div>
                    {statusFilter === "Shipped" && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setStatusFilter("Delivered")}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      <span>{t("orders.delivered", "Delivered")}</span>
                    </div>
                    {statusFilter === "Delivered" && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setStatusFilter("Cancelled")}
                    className="flex items-center justify-between cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      <span>{t("orders.cancelled", "Cancelled")}</span>
                    </div>
                    {statusFilter === "Cancelled" && <Check className="h-4 w-4 text-primary" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {statusFilter !== "ALL" && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setStatusFilter("ALL")} 
                  className="h-9 text-xs text-muted-foreground hover:text-foreground"
                >
                  {t("orders.clear_filter", "Clear filter")}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        {/* Table Content */}
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="border-b">
                <TableHead className="font-semibold text-xs text-muted-foreground w-28">{t("orders.order_id", "Order ID")}</TableHead>
                <TableHead className="font-semibold text-xs text-muted-foreground w-16">{t("orders.item", "Item")}</TableHead>
                <TableHead className="font-semibold text-xs text-muted-foreground">{t("orders.date", "Date")}</TableHead>
                <TableHead className="font-semibold text-xs text-muted-foreground">{t("orders.customer", "Customer")}</TableHead>
                <TableHead className="font-semibold text-xs text-muted-foreground">{t("orders.total", "Total")}</TableHead>
                <TableHead className="font-semibold text-xs text-muted-foreground">{t("orders.status", "Status")}</TableHead>
                <TableHead className="font-semibold text-xs text-muted-foreground text-end">{t("orders.action", "Action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading Skeleton Rows
                Array.from({ length: 5 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell><div className="h-4 w-20 bg-muted/50 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-8 w-8 bg-muted/50 rounded-lg animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-24 bg-muted/50 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-32 bg-muted/50 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-4 w-16 bg-muted/50 rounded animate-pulse" /></TableCell>
                    <TableCell><div className="h-6 w-20 bg-muted/50 rounded-full animate-pulse" /></TableCell>
                    <TableCell className="text-right"><div className="h-7 w-7 bg-muted/50 rounded-md ml-auto animate-pulse" /></TableCell>
                  </TableRow>
                ))
              ) : filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const customerDisplay = order.customerName || order.user?.name || "Guest Customer"
                  return (
                    <TableRow 
                      key={order.id} 
                      className="hover:bg-muted/30 transition-colors border-b last:border-0"
                    >
                      {/* Order ID */}
                      <TableCell className="font-semibold text-sm text-foreground">
                        {order.orderNumber}
                      </TableCell>

                      {/* Image (img) Thumbnail */}
                      <TableCell className="py-2">
                        <div className="h-9 w-9 rounded-lg border border-border/80 bg-muted/40 overflow-hidden flex items-center justify-center shrink-0">
                          {order.imageUrl ? (
                            <img
                              src={order.imageUrl}
                              alt={order.orderNumber}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none"
                              }}
                            />
                          ) : (
                            <Package className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatOrderDate(order.createdAt)}
                      </TableCell>

                      {/* Customer */}
                      <TableCell className="text-sm font-medium text-foreground">
                        {customerDisplay}
                      </TableCell>

                      {/* Total */}
                      <TableCell className="text-sm font-semibold text-foreground">
                        ${order.total.toFixed(2)}
                      </TableCell>

                      {/* Status Badge */}
                      <TableCell>
                        {getStatusBadge(order.status)}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-1">
                          {/* View & Edit Status Button */}
                          <Button
                            variant="ghost"
                            size="icon"
                            title={t("common.view", "View")}
                            onClick={() => handleOpenViewModal(order)}
                            className="h-8 w-8 text-primary hover:text-primary/90 hover:bg-primary/10 rounded-md transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {/* Delete Button (Opens custom confirmation card) */}
                          <Button
                            variant="ghost"
                            size="icon"
                            title={t("common.delete", "Delete")}
                            onClick={() => handlePromptDelete(order)}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingBag className="h-10 w-10 text-muted-foreground/40 mb-1" />
                      <p className="font-medium text-base text-foreground">{t("orders.no_orders_found", "No orders found")}</p>
                      <p className="text-xs text-muted-foreground max-w-sm">
                        {searchQuery || statusFilter !== "ALL"
                          ? t("orders.no_match", "No orders match your current search or status filter.")
                          : t("orders.no_orders_recorded", "You have not recorded any orders yet.")}
                      </p>
                      {(searchQuery || statusFilter !== "ALL") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setSearchQuery("")
                            setStatusFilter("ALL")
                          }}
                        >
                          {t("orders.clear_all_filters", "Clear all filters")}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 1. VIEW & EDIT STATUS MODAL (Dialog)                       */}
      {/* ========================================================= */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-between pe-4">
              <DialogTitle className="text-lg font-bold flex items-center gap-2">
                <span>{t("orders.order_id", "Order")} {selectedOrder?.orderNumber}</span>
                {selectedOrder && getStatusBadge(selectedOrder.status)}
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("orders.subtitle", "View order details and update order status.")}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 py-2">
              {/* Thumbnail & Key Details */}
              <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl border border-border/60">
                <div className="h-14 w-14 rounded-lg bg-background border overflow-hidden flex items-center justify-center shrink-0">
                  {selectedOrder.imageUrl ? (
                    <img
                      src={selectedOrder.imageUrl}
                      alt={selectedOrder.orderNumber}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Package className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground truncate">
                    <User className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    {selectedOrder.customerName || selectedOrder.user?.name || "Guest Customer"}
                  </div>
                  {selectedOrder.customerEmail && (
                    <div className="text-xs text-muted-foreground truncate">
                      {selectedOrder.customerEmail}
                    </div>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs">
                    <span className="font-semibold text-primary">
                      ${selectedOrder.total.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">
                      {formatOrderDate(selectedOrder.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-foreground">
                  {t("orders.update_status", "Update Order Status")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "Processing", label: "Processing", color: "border-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-950/40" },
                    { val: "Shipped", label: "Shipped", color: "border-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40" },
                    { val: "Delivered", label: "Delivered", color: "border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40" },
                    { val: "Cancelled", label: "Cancelled", color: "border-red-300 hover:bg-red-50 dark:hover:bg-red-950/40" },
                  ].map((item) => (
                    <button
                      key={item.val}
                      type="button"
                      onClick={() => setEditStatus(item.val)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-xs font-medium transition-all ${
                        editStatus.toLowerCase() === item.val.toLowerCase()
                          ? "ring-2 ring-primary border-primary bg-primary/5 font-semibold"
                          : `bg-card ${item.color}`
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {getStatusBadge(item.val)}
                      </div>
                      {editStatus.toLowerCase() === item.val.toLowerCase() && (
                        <Check className="h-3.5 w-3.5 text-primary" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Note */}
              {selectedOrder.note && (
                <div className="p-3 bg-muted/20 border rounded-lg text-xs space-y-1">
                  <div className="font-medium text-muted-foreground">{t("orders.note", "Order Note")}:</div>
                  <div className="text-foreground">{selectedOrder.note}</div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex flex-row justify-between items-center gap-2 pt-2 border-t">
            {selectedOrder && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePromptDelete(selectedOrder)}
                className="text-destructive hover:bg-destructive/10 text-xs gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" /> {t("common.delete", "Delete")}
              </Button>
            )}
            <div className="flex items-center gap-2 ms-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsViewModalOpen(false)}
                className="text-xs"
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                size="sm"
                onClick={handlePromptUpdateStatus}
                disabled={isUpdating || editStatus === selectedOrder?.status}
                className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Check className="h-3.5 w-3.5" />
                {t("common.save", "Save")}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 2. STATUS UPDATE CONFIRMATION CARD (بطاقة تأكيد التعديل)   */}
      {/* ========================================================= */}
      <Dialog open={isStatusConfirmOpen} onOpenChange={setIsStatusConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {t("orders.confirm_status_title", "Confirm Status Update")}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {t("orders.confirm_status_desc", "Are you sure you want to update the status of this order?")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-3 py-2">
              <div className="p-3.5 bg-muted/40 rounded-xl border border-border/70 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground text-sm">{selectedOrder.orderNumber}</span>
                  <span className="text-muted-foreground font-medium">
                    {selectedOrder.customerName || selectedOrder.user?.name || "Guest"}
                  </span>
                </div>

                {/* Transition Card */}
                <div className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div className="flex flex-col items-start gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t("orders.previous", "Previous")}</span>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div className="flex items-center justify-center h-7 w-7 rounded-full bg-muted/60">
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground rtl:rotate-180" />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{t("orders.new_status", "New Status")}</span>
                    {getStatusBadge(editStatus)}
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={() => setIsStatusConfirmOpen(false)}
              className="text-xs"
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isUpdating}
              onClick={handleExecuteUpdateStatus}
              className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              {t("common.save", "Confirm & Save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 3. DELETE CONFIRMATION CARD (بطاقة تأكيد الحذف)            */}
      {/* ========================================================= */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  {t("orders.confirm_delete_title", "Confirm Order Deletion")}
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  {t("orders.confirm_delete_desc", "Are you sure you want to delete this order?")}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {orderToDelete && (
            <div className="space-y-3 py-2">
              <div className="p-3.5 bg-muted/40 rounded-xl border border-border/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground text-sm">{orderToDelete.orderNumber}</span>
                  {getStatusBadge(orderToDelete.status)}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1.5 border-t border-border/50">
                  <span>{t("orders.customer", "Customer")}: <strong className="text-foreground">{orderToDelete.customerName || orderToDelete.user?.name || "Guest Customer"}</strong></span>
                  <span className="font-semibold text-foreground text-sm">${orderToDelete.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-2.5 bg-destructive/5 rounded-lg border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{t("orders.delete_warning", "This action cannot be undone. The order will be permanently erased.")}</span>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isDeleting}
              onClick={() => setIsDeleteModalOpen(false)}
              className="text-xs"
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isDeleting}
              onClick={handleConfirmDelete}
              className="text-xs gap-1.5"
            >
              {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              {t("orders.confirm_delete_btn", "Yes, Delete Order")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 4. CREATE ORDER MODAL (Dialog)                             */}
      {/* ========================================================= */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" /> {t("orders.create_order", "Create New Order")}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {t("orders.create_desc", "Add a new order directly to the database.")}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateOrder} className="space-y-3.5 py-1">
            {/* Customer Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                {t("orders.customer_name", "Customer Name")} <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. Sarah Jenkins"
                required
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Customer Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                {t("orders.customer_email", "Customer Email")} <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                type="email"
                placeholder="e.g. customer@example.com"
                value={newCustomerEmail}
                onChange={(e) => setNewCustomerEmail(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            {/* Total & Status Row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {t("orders.total_amount", "Total Amount ($)")} <span className="text-destructive">*</span>
                </label>
                <div className="relative">
                  <span className="absolute start-2.5 top-2 text-muted-foreground text-sm">$</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    required
                    value={newTotal}
                    onChange={(e) => setNewTotal(e.target.value)}
                    className="ps-6 h-9 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  {t("orders.status", "Status")}
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full h-9 px-2.5 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Processing">{t("orders.processing", "Processing")}</option>
                  <option value="Shipped">{t("orders.shipped", "Shipped")}</option>
                  <option value="Delivered">{t("orders.delivered", "Delivered")}</option>
                  <option value="Cancelled">{t("orders.cancelled", "Cancelled")}</option>
                </select>
              </div>
            </div>

            {/* Product / Order Thumbnail Preset */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                {t("orders.product_image", "Order Thumbnail Image")}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {PRESET_PRODUCT_IMAGES.map((img) => (
                  <button
                    key={img.url}
                    type="button"
                    onClick={() => setNewImageUrl(img.url)}
                    className={`relative rounded-lg overflow-hidden border p-0.5 transition-all aspect-square flex items-center justify-center bg-muted/20 ${
                      newImageUrl === img.url
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-border hover:border-muted-foreground/50"
                    }`}
                  >
                    <img src={img.url} alt={img.label} className="h-full w-full object-cover rounded-md" />
                    {newImageUrl === img.url && (
                      <div className="absolute top-1 end-1 bg-primary text-white rounded-full p-0.5">
                        <Check className="h-2.5 w-2.5" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Order Note */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                {t("orders.note", "Order Note")} <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Expedited delivery requested"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full p-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <DialogFooter className="pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-xs"
              >
                {t("common.cancel", "Cancel")}
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCreating}
                className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                {t("orders.create_order", "Create Order")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
