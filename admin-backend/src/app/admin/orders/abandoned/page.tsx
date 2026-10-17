"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { 
  Clock, 
  Mail, 
  Search, 
  RefreshCw, 
  Plus, 
  Pencil, 
  Trash2, 
  AlertTriangle, 
  Check, 
  Loader2, 
  Send,
  DollarSign,
  ShoppingCart,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { toast } from "sonner"
import { useLocaleStore } from "@/store/useLocaleStore"

export interface AbandonedCartItem {
  id: string
  userId?: string | null
  customerName: string
  customerEmail: string
  customerPhone?: string | null
  itemsCount: number
  totalValue: number
  abandonedAt: string | Date
  status: "ABANDONED" | "CONTACTED" | "WAITING_REPLY" | "EMAIL_SENT" | "RECOVERED" | string
  recoveryEmailSentAt?: string | Date | null
  notes?: string | null
  items?: Array<{
    id: string
    quantity: number
    price: number
    product?: {
      id: string
      name: string
      price: number
      imageUrl?: string | null
    }
  }>
  createdAt?: string | Date
  updatedAt?: string | Date
}

interface CartMetrics {
  totalPotentialRevenue: number
  totalCarts: number
  abandonedCount: number
  emailSentCount: number
  recoveredCount: number
}

// دالة مساعدة لتنسيق الوقت المنقضي بدقة مطابقة للصورة تماماً
function formatAbandonedTime(dateInput: string | Date, t: (key: string, fallback?: string) => string) {
  const date = new Date(dateInput)
  const now = new Date()
  const diffMs = Math.max(0, now.getTime() - date.getTime())
  const diffMin = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) {
    const mins = Math.max(1, diffMin)
    return { 
      text: t("abandoned.mins_ago", `${mins} mins ago`).replace("{mins}", String(mins)), 
      isRecent: true 
    }
  } else if (diffHours < 24) {
    return { 
      text: t("abandoned.hours_ago", `${diffHours} hrs ago`).replace("{hours}", String(diffHours)), 
      isRecent: true 
    }
  } else if (diffDays === 1) {
    return { 
      text: t("abandoned.day_ago", "1 day ago"), 
      isRecent: false 
    }
  } else {
    return { 
      text: t("abandoned.days_ago", `${diffDays} days ago`).replace("{days}", String(diffDays)), 
      isRecent: false 
    }
  }
}

export default function AbandonedCartsPage() {
  const { t, language } = useLocaleStore()
  const [carts, setCarts] = useState<AbandonedCartItem[]>([])
  const [metrics, setMetrics] = useState<CartMetrics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  // حالة إرسال البريد الفردي
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null)

  // حالة النافذة المنبثقة للاسترجاع الجماعي (Bulk Recovery Modal)
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [isSendingBulk, setIsSendingBulk] = useState(false)
  const [bulkDiscountCode, setBulkDiscountCode] = useState("COMEBACK10")

  // حالة بطاقة التعديل (Edit Modal)
  const [editingCart, setEditingCart] = useState<AbandonedCartItem | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editName, setEditName] = useState("")
  const [editEmail, setEditEmail] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editItems, setEditItems] = useState(1)
  const [editTotal, setEditTotal] = useState("0")
  const [editStatus, setEditStatus] = useState("ABANDONED")
  const [editNotes, setEditNotes] = useState("")

  // حالة بطاقة تأكيد الحذف (Custom Delete Modal - بدون window.confirm)
  const [cartToDelete, setCartToDelete] = useState<AbandonedCartItem | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // حالة إنشاء عربة مهجورة جديدة (Create Modal)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newItems, setNewItems] = useState(1)
  const [newTotal, setNewTotal] = useState("99.00")
  const [newStatus, setNewStatus] = useState("ABANDONED")
  const [newNotes, setNewNotes] = useState("")

  // جلب البيانات من الـ API
  const fetchCarts = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (statusFilter !== "ALL") params.set("status", statusFilter)

      const res = await fetch(`/api/abandoned-carts?${params.toString()}`)
      const data = await res.json()

      if (data.success && Array.isArray(data.carts)) {
        setCarts(data.carts)
        if (data.metrics) setMetrics(data.metrics)
      } else {
        toast.error("Failed to load abandoned carts from database")
      }
    } catch (err) {
      console.error("Error loading carts:", err)
      toast.error("Network error while loading abandoned carts")
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, statusFilter])

  useEffect(() => {
    fetchCarts()
  }, [fetchCarts])

  // 1. إرسال بريد استرجاع لعربة واحدة (Send Email Action)
  const handleSendEmail = async (cart: AbandonedCartItem) => {
    try {
      setSendingEmailId(cart.id)
      const res = await fetch("/api/abandoned-carts/send-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId: cart.id }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success(`Recovery email sent to ${cart.customerEmail}!`)
        // تحديث محلي فوري للحالة لتجنب الوميض
        setCarts((prev) =>
          prev.map((c) =>
            c.id === cart.id
              ? { ...c, status: "EMAIL_SENT", recoveryEmailSentAt: new Date() }
              : c
          )
        )
      } else {
        toast.error(data.error || "Failed to send recovery email")
      }
    } catch (err) {
      console.error("Error sending email:", err)
      toast.error("Network error while sending email")
    } finally {
      setSendingEmailId(null)
    }
  }

  // 2. إرسال استرجاع جماعي (Send Bulk Recovery)
  const handleConfirmBulkRecovery = async () => {
    try {
      setIsSendingBulk(true)
      const res = await fetch("/api/abandoned-carts/send-recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulk: true,
          discountCode: bulkDiscountCode,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success(data.message || `Recovery emails sent to all abandoned carts!`)
        setIsBulkModalOpen(false)
        fetchCarts()
      } else {
        toast.error(data.error || "Failed to send bulk emails")
      }
    } catch (err) {
      console.error("Error sending bulk recovery:", err)
      toast.error("Network error while sending bulk emails")
    } finally {
      setIsSendingBulk(false)
    }
  }

  // 3. فتح بطاقة التعديل (Open Edit Modal)
  const handleOpenEdit = (cart: AbandonedCartItem) => {
    setEditingCart(cart)
    setEditName(cart.customerName)
    setEditEmail(cart.customerEmail)
    setEditPhone(cart.customerPhone || "")
    setEditItems(cart.itemsCount)
    setEditTotal(cart.totalValue.toString())
    setEditStatus(cart.status)
    setEditNotes(cart.notes || "")
    setIsEditModalOpen(true)
  }

  // حفظ التعديلات (Save Edit)
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCart) return

    try {
      setIsUpdating(true)
      const res = await fetch(`/api/abandoned-carts/${editingCart.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: editName,
          customerEmail: editEmail,
          customerPhone: editPhone,
          itemsCount: Number(editItems),
          totalValue: parseFloat(editTotal),
          status: editStatus,
          notes: editNotes,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success("Cart updated successfully")
        setIsEditModalOpen(false)
        fetchCarts()
      } else {
        toast.error(data.error || "Failed to update cart")
      }
    } catch (err) {
      console.error("Error updating cart:", err)
      toast.error("Network error while updating cart")
    } finally {
      setIsUpdating(false)
    }
  }

  // 4. فتح بطاقة تأكيد الحذف (Open Delete Modal)
  const handleOpenDelete = (cart: AbandonedCartItem) => {
    setCartToDelete(cart)
    setIsDeleteModalOpen(true)
  }

  // تنفيذ الحذف النهائي (Confirm Delete)
  const handleConfirmDelete = async () => {
    if (!cartToDelete) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/abandoned-carts/${cartToDelete.id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (data.success) {
        toast.success("Abandoned cart deleted successfully")
        setIsDeleteModalOpen(false)
        setCartToDelete(null)
        fetchCarts()
      } else {
        toast.error(data.error || "Failed to delete cart")
      }
    } catch (err) {
      console.error("Error deleting cart:", err)
      toast.error("Network error while deleting cart")
    } finally {
      setIsDeleting(false)
    }
  }

  // 5. إضافة عربة مهجورة جديدة (Create Cart)
  const handleCreateCart = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsCreating(true)
      const res = await fetch("/api/abandoned-carts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: newName,
          customerEmail: newEmail,
          customerPhone: newPhone,
          itemsCount: Number(newItems),
          totalValue: parseFloat(newTotal),
          status: newStatus,
          notes: newNotes,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success("New abandoned cart created")
        setIsCreateModalOpen(false)
        setNewName("")
        setNewEmail("")
        setNewPhone("")
        setNewItems(1)
        setNewTotal("99.00")
        setNewStatus("ABANDONED")
        setNewNotes("")
        fetchCarts()
      } else {
        toast.error(data.error || "Failed to create cart")
      }
    } catch (err) {
      console.error("Error creating cart:", err)
      toast.error("Network error while creating cart")
    } finally {
      setIsCreating(false)
    }
  }

  // شارة الحالة (Status Badge)
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case "RECOVERED":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-xs font-medium">
            {t("abandoned.status_recovered", "Recovered")}
          </Badge>
        )
      case "CONTACTED":
        return (
          <Badge variant="outline" className="bg-purple-500/10 text-purple-600 border-purple-500/20 text-xs font-medium">
            {t("abandoned.status_contacted", "Contacted")}
          </Badge>
        )
      case "WAITING_REPLY":
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600 border-orange-500/20 text-xs font-medium">
            {t("abandoned.status_waiting", "Waiting")}
          </Badge>
        )
      case "EMAIL_SENT":
        return (
          <Badge variant="outline" className="bg-sky-500/10 text-sky-600 border-sky-500/20 text-xs font-medium">
            {t("abandoned.status_email_sent", "Email Sent")}
          </Badge>
        )
      case "ABANDONED":
      default:
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-600 border-rose-500/20 text-xs font-medium">
            {t("abandoned.status_abandoned", "Abandoned")}
          </Badge>
        )
    }
  }

  // حساب عدد العربات المؤهلة للاسترجاع (التي حالتها ABANDONED)
  const eligibleRecoveryCount = useMemo(() => {
    return carts.filter((c) => c.status === "ABANDONED").length
  }, [carts])

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. TOP HEADER (مطابق تماماً للتصميم في الصورة المرفقة)         */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("abandoned.title", "Abandoned Carts")}</h1>
          <p className="text-muted-foreground text-sm">
            {t("abandoned.subtitle", "Recover lost sales by reaching out to these customers.")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="text-xs h-9"
          >
            <Plus className="me-1.5 h-3.5 w-3.5" /> {t("abandoned.add_lead", "Add Lead +")}
          </Button>

          <Button
            variant="outline"
            className="h-9 font-medium shadow-xs"
            onClick={() => setIsBulkModalOpen(true)}
          >
            <Mail className="me-2 h-4 w-4" /> {t("abandoned.send_bulk", "Send Bulk Recovery")}
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. SEARCH & FILTER TOOLBAR                                */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder={t("abandoned.search_placeholder", "Search by customer or email...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ps-9 pe-8 h-9 text-sm bg-background"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {[
            { key: "ALL", label: t("abandoned.all_carts", "All Carts"), count: metrics?.totalCarts },
            { key: "ABANDONED", label: t("abandoned.status_abandoned", "Abandoned"), count: metrics?.abandonedCount },
            { key: "CONTACTED", label: t("abandoned.status_contacted", "Contacted") },
            { key: "WAITING_REPLY", label: t("abandoned.status_waiting", "Waiting") },
            { key: "EMAIL_SENT", label: t("abandoned.status_email_sent", "Email Sent"), count: metrics?.emailSentCount },
            { key: "RECOVERED", label: t("abandoned.status_recovered", "Recovered"), count: metrics?.recoveredCount },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 flex items-center gap-1.5 ${
                statusFilter === tab.key
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    statusFilter === tab.key
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background text-muted-foreground"
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}

          <Button
            variant="ghost"
            size="icon"
            onClick={fetchCarts}
            disabled={isLoading}
            className="h-8 w-8 text-muted-foreground hover:text-foreground ms-1"
            title="Refresh"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. DYNAMIC DATA TABLE (مطابق للتصميم في الصورة 100%)       */}
      {/* ========================================================= */}
      <Card className="shadow-xs overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[200px]">{t("abandoned.table_customer", "Customer")}</TableHead>
                  <TableHead className="w-[240px]">{t("abandoned.table_contact", "Contact")}</TableHead>
                  <TableHead className="w-[120px]">{t("abandoned.table_items", "Items")}</TableHead>
                  <TableHead className="w-[140px]">{t("abandoned.table_total", "Total Value")}</TableHead>
                  <TableHead className="w-[160px]">{t("abandoned.table_abandoned", "Abandoned")}</TableHead>
                  <TableHead className="text-end w-[200px]">{t("abandoned.table_action", "Action")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // حالة التحميل (Loading skeleton rows)
                  Array.from({ length: 3 }).map((_, idx) => (
                    <TableRow key={`skeleton-${idx}`}>
                      <TableCell><div className="h-4 w-28 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-36 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-16 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell className="text-right"><div className="h-7 w-24 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : carts.length === 0 ? (
                  // حالة عدم وجود بيانات (Empty state)
                  <TableRow>
                    <TableCell colSpan={6} className="h-48 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                        <ShoppingCart className="h-8 w-8 stroke-[1.5] opacity-40" />
                        <p className="font-medium text-sm">{t("abandoned.no_carts", "No abandoned carts found")}</p>
                        <p className="text-xs">{t("orders.no_match", "Try adjusting your search query or filter criteria.")}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  // عرض البيانات الديناميكية القادمة من الـ Database
                  carts.map((cart) => {
                    const timeInfo = formatAbandonedTime(cart.abandonedAt, t)
                    const isSendingThisEmail = sendingEmailId === cart.id

                    return (
                      <TableRow key={cart.id} className="hover:bg-muted/30 transition-colors">
                        {/* Customer */}
                        <TableCell>
                          <div className="flex flex-col gap-1 items-start">
                            <span className="font-medium text-foreground">{cart.customerName}</span>
                            {cart.status !== "ABANDONED" && renderStatusBadge(cart.status)}
                          </div>
                        </TableCell>

                        {/* Contact */}
                        <TableCell>
                          <div className="flex flex-col text-xs">
                            <span className="text-muted-foreground">{cart.customerEmail}</span>
                            {cart.customerPhone && (
                              <span className="text-[11px] text-muted-foreground/80 font-mono mt-0.5">
                                {cart.customerPhone}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Items */}
                        <TableCell className="text-foreground">
                          {cart.itemsCount} {cart.itemsCount === 1 ? t("abandoned.item", "item") : t("abandoned.items", "items")}
                        </TableCell>

                        {/* Total Value */}
                        <TableCell className="font-medium text-foreground">
                          ${cart.totalValue.toFixed(2)}
                        </TableCell>

                        {/* Abandoned */}
                        <TableCell>
                          <div
                            className={`flex items-center ${
                              timeInfo.isRecent
                                ? "text-destructive font-medium"
                                : "text-muted-foreground"
                            }`}
                          >
                            <Clock className="me-1.5 h-4 w-4 shrink-0" />
                            <span>{timeInfo.text}</span>
                          </div>
                        </TableCell>

                        {/* Action */}
                        <TableCell className="text-end">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* زر Send Email الوردي */}
                            <Button
                              variant="secondary"
                              size="sm"
                              disabled={isSendingThisEmail}
                              onClick={() => handleSendEmail(cart)}
                              className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors font-medium text-xs h-8 px-3"
                            >
                              {isSendingThisEmail ? (
                                <>
                                  <Loader2 className="me-1.5 h-3.5 w-3.5 animate-spin" /> {t("common.loading", "Sending...")}
                                </>
                              ) : (
                                t("abandoned.send_email", "Send Email")
                              )}
                            </Button>

                            {/* زر التعديل (Edit) */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(cart)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                              title={t("common.edit", "Edit Details")}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>

                            {/* زر الحذف (Delete) */}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDelete(cart)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title={t("common.delete", "Delete Record")}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* 4. BULK RECOVERY MODAL (بطاقة تأكيد الاسترجاع الجماعي)       */}
      {/* ========================================================= */}
      <Dialog open={isBulkModalOpen} onOpenChange={setIsBulkModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold text-foreground">
                  Send Bulk Recovery Emails
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Reach out to all customers with abandoned carts automatically.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="p-3.5 bg-muted/40 rounded-xl border border-border/70 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Eligible Abandoned Carts:</span>
                <span className="font-semibold text-foreground text-sm">{eligibleRecoveryCount} customer(s)</span>
              </div>
              <div className="flex items-center justify-between pt-1.5 border-t border-border/50">
                <span className="text-muted-foreground">Total Recoverable Value:</span>
                <span className="font-semibold text-primary text-sm">
                  ${(metrics?.totalPotentialRevenue || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Incentive Discount Code
              </label>
              <Input
                type="text"
                placeholder="e.g. COMEBACK10"
                value={bulkDiscountCode}
                onChange={(e) => setBulkDiscountCode(e.target.value.toUpperCase())}
                className="h-9 text-sm uppercase tracking-wider font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                This code will be highlighted in the recovery email body to increase checkout rate.
              </p>
            </div>
          </div>

          <DialogFooter className="flex items-center justify-end gap-2 pt-2 border-t">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSendingBulk}
              onClick={() => setIsBulkModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isSendingBulk || eligibleRecoveryCount === 0}
              onClick={handleConfirmBulkRecovery}
              className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isSendingBulk ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Dispathing Emails...
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" /> Dispatch to {eligibleRecoveryCount} Carts
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 5. EDIT CART MODAL (بطاقة تعديل بيانات العربة أو حالتها)     */}
      {/* ========================================================= */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Pencil className="h-4 w-4 text-primary" /> Edit Abandoned Cart
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update the customer details, total value, or recovery status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-3 py-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Customer Name <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Customer Email <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Items Count
                </label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={editItems}
                  onChange={(e) => setEditItems(Number(e.target.value))}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Total Value ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={editTotal}
                  onChange={(e) => setEditTotal(e.target.value)}
                  className="h-9 text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Customer Phone <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                type="tel"
                placeholder="+1 555-0199"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                className="w-full h-9 px-2.5 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ABANDONED">{t("abandoned.status_abandoned", "Abandoned")}</option>
                <option value="CONTACTED">{t("abandoned.status_contacted", "Contacted")}</option>
                <option value="WAITING_REPLY">{t("abandoned.status_waiting", "Waiting Reply")}</option>
                <option value="EMAIL_SENT">{t("abandoned.status_email_sent", "Email Sent")}</option>
                <option value="RECOVERED">{t("abandoned.status_recovered", "Recovered")}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Follow-up Notes <span className="text-xs text-muted-foreground font-normal">(Internal)</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Spoke with customer via WhatsApp, offered 10% coupon..."
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                className="w-full p-2 bg-background border border-input rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <DialogFooter className="pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isUpdating}
                onClick={() => setIsEditModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isUpdating}
                className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isUpdating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Save Changes
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 6. DELETE CONFIRMATION CARD (بطاقة تأكيد الحذف بدون Alert)    */}
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
                  Confirm Cart Deletion
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Are you sure you want to delete this abandoned cart record?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {cartToDelete && (
            <div className="space-y-3 py-2">
              <div className="p-3.5 bg-muted/40 rounded-xl border border-border/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground text-sm">
                    {cartToDelete.customerName}
                  </span>
                  {renderStatusBadge(cartToDelete.status)}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground pt-1.5 border-t border-border/50">
                  <span>{cartToDelete.customerEmail}</span>
                  <span className="font-semibold text-foreground text-sm">
                    ${cartToDelete.totalValue.toFixed(2)} ({cartToDelete.itemsCount} items)
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-destructive/5 rounded-lg border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>This action cannot be undone. The record will be permanently erased.</span>
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
              Cancel
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
              Yes, Delete Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 7. CREATE NEW ABANDONED CART MODAL                         */}
      {/* ========================================================= */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> Add Abandoned Cart Lead
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Manually add an abandoned customer cart to follow up.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCart} className="space-y-3 py-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Customer Name <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. John Doe"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Customer Email <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                placeholder="e.g. john@example.com"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Items Count
                </label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={newItems}
                  onChange={(e) => setNewItems(Number(e.target.value))}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Total Value ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={newTotal}
                  onChange={(e) => setNewTotal(e.target.value)}
                  className="h-9 text-sm font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Customer Phone <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </label>
              <Input
                type="tel"
                placeholder="e.g. +1 555-0199"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Status
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full h-9 px-2.5 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="ABANDONED">{t("abandoned.status_abandoned", "Abandoned")}</option>
                <option value="CONTACTED">{t("abandoned.status_contacted", "Contacted")}</option>
                <option value="WAITING_REPLY">{t("abandoned.status_waiting", "Waiting Reply")}</option>
                <option value="EMAIL_SENT">{t("abandoned.status_email_sent", "Email Sent")}</option>
                <option value="RECOVERED">{t("abandoned.status_recovered", "Recovered")}</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Notes <span className="text-xs text-muted-foreground font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Customer hesitated on shipping fee..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="w-full p-2 bg-background border border-input rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            <DialogFooter className="pt-2 border-t">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isCreating}
                onClick={() => setIsCreateModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isCreating}
                className="text-xs gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isCreating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                Add Record
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
