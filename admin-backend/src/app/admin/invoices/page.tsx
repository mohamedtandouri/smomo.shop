"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import {
  Search,
  Download,
  Eye,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Printer,
  Package,
  X,
  RefreshCw,
  FileText,
  Building2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
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

interface OrderProduct {
  id: string
  name: string
  sku?: string | null
  price: number
  stock: number
  imageUrl?: string | null
}

interface OrderItemDetail {
  id: string
  quantity: number
  price: number
  product?: OrderProduct | null
}

interface OrderRecord {
  id: string
  orderNumber: string
  customerName: string | null
  customerEmail: string | null
  total: number
  subtotal?: number
  tax?: number
  discount?: number
  shippingFee?: number
  status: string
  note?: string | null
  createdAt: string
  items?: OrderItemDetail[]
  user?: {
    name: string
    email: string
  } | null
}

// قاموس ترجمة مخصص لصفحة الفوترة والطباعة الرسمية (يدعم العربية والإنجليزية والفرنسية)
const INVOICE_LABELS: Record<"ar" | "en" | "fr", Record<string, string>> = {
  ar: {
    title: "الفواتير والسجلات المالية",
    subtitle: "إدارة فواتير قاعدة البيانات الحية، متابعة مدفوعات العملاء، وتخصيص مخزون المنتجات.",
    refresh: "تحديث",
    create_invoice: "إنشاء فاتورة",
    total_billed: "إجمالي المبالغ المفوترة",
    from_orders: "من إجمالي {count} طلبات في قاعدة البيانات",
    paid_invoices: "الفواتير المدفوعة",
    paid_desc: "المعاملات المكتملة أو التي تم شحنها",
    pending_invoices: "قيد الانتظار / المعالجة",
    pending_desc: "بانتظار التجهيز أو تحصيل الدفعة",
    filter_all: "الكل",
    filter_paid: "مدفوعة",
    filter_pending: "قيد الانتظار",
    filter_overdue: "متأخرة / ملغاة",
    search_placeholder: "ابحث برقم الفاتورة، اسم العميل، أو رمز SKU...",
    loading: "جاري تحميل الفواتير من قاعدة البيانات...",
    no_invoices: "لا توجد فواتير مطابقة",
    no_invoices_sub: "جرب تعديل معايير البحث أو قم بإنشاء فاتورة جديدة.",
    col_id: "رقم الفاتورة",
    col_items: "المنتج / البيان",
    col_sku: "رمز SKU",
    col_units: "الوحدات",
    col_stock: "المخزون",
    col_date: "التاريخ",
    col_customer: "العميل",
    col_amount: "المبلغ",
    col_status: "الحالة",
    col_add_stock: "إضافة مخزون",
    col_action: "الإجراءات",
    add_btn: "إضافة",
    no_linked_item: "لا يوجد منتج مرتبط",
    status_paid: "مدفوعة",
    status_pending: "قيد الانتظار",
    status_overdue: "متأخرة",
    preview_invoice: "معاينة الفاتورة",
    print_download: "طباعة / تحميل PDF",
    invoice_heading: "فاتورة ضريبية / INVOICE",
    issue_date: "تاريخ الإصدار",
    order_ref: "مرجع الطلب",
    billed_to: "مُصدرة إلى العميل",
    payment_status: "حالة السداد",
    no_email: "لم يتم تحديد بريد إلكتروني",
    item_no: "#",
    item_desc: "الوصف / البيان",
    item_qty: "الكمية",
    item_unit_price: "سعر الوحدة",
    item_total: "الإجمالي",
    general_order: "طلب متجر عام",
    subtotal: "المجموع الفرعي",
    discount: "الخصم",
    shipping: "رسوم الشحن",
    tax: "الضريبة المضافة",
    total_due: "الإجمالي المستحق",
    notes_label: "ملاحظات الفاتورة",
    footer_thanks: "شكراً لتعاملكم مع متجر Smomo — هذه الفاتورة صادرة إلكترونياً ومعتمدة رسمياً.",
    close: "إغلاق",
    print_pdf_btn: "طباعة / حفظ كملف PDF",
    create_modal_title: "إنشاء فاتورة جديدة",
    create_modal_desc: "إنشاء سجل فوترة جديد وحفظه مباشرة في قاعدة البيانات.",
    customer_name_label: "اسم العميل *",
    customer_email_label: "البريد الإلكتروني للعميل",
    amount_label: "المبلغ ($) *",
    status_label: "الحالة",
    note_label: "ملاحظات الفاتورة / وصف الخدمة",
    save_invoice: "حفظ الفاتورة",
    cancel: "إلغاء",
  },
  en: {
    title: "Invoices",
    subtitle: "Live database billing records, track customer payments, and manage inventory stock allocations.",
    refresh: "Refresh",
    create_invoice: "Create Invoice",
    total_billed: "Total Billed Amount",
    from_orders: "From {count} total orders in database",
    paid_invoices: "Paid Invoices",
    paid_desc: "Processed or shipped transactions",
    pending_invoices: "Pending / Processing",
    pending_desc: "Awaiting fulfillment or payment capture",
    filter_all: "All",
    filter_paid: "Paid",
    filter_pending: "Pending",
    filter_overdue: "Overdue",
    search_placeholder: "Search by invoice, customer, SKU...",
    loading: "Loading live database invoices...",
    no_invoices: "No invoices found",
    no_invoices_sub: "Try adjusting your search criteria or create a new invoice.",
    col_id: "Invoice ID",
    col_items: "Name / Items",
    col_sku: "SKU",
    col_units: "Units",
    col_stock: "Stock",
    col_date: "Date",
    col_customer: "Customer",
    col_amount: "Amount",
    col_status: "Status",
    col_add_stock: "Add stock",
    col_action: "Action",
    add_btn: "Add",
    no_linked_item: "No linked item",
    status_paid: "Paid",
    status_pending: "Pending",
    status_overdue: "Overdue",
    preview_invoice: "Preview Invoice",
    print_download: "Print / Download PDF",
    invoice_heading: "INVOICE",
    issue_date: "Issue Date",
    order_ref: "Order Ref",
    billed_to: "Billed To",
    payment_status: "Payment Status",
    no_email: "No email provided",
    item_no: "#",
    item_desc: "Description",
    item_qty: "Qty",
    item_unit_price: "Unit Price",
    item_total: "Amount",
    general_order: "General Store Order",
    subtotal: "Subtotal",
    discount: "Discount",
    shipping: "Shipping Fee",
    tax: "Tax",
    total_due: "Total Due",
    notes_label: "Invoice Notes",
    footer_thanks: "Thank you for your business with Smomo Store Inc. — Official computer-generated invoice.",
    close: "Close",
    print_pdf_btn: "Print / Save PDF",
    create_modal_title: "Create New Invoice",
    create_modal_desc: "Generates a new billing record and stores it directly into the database.",
    customer_name_label: "Customer Name *",
    customer_email_label: "Customer Email",
    amount_label: "Amount ($) *",
    status_label: "Status",
    note_label: "Invoice Note / Item description",
    save_invoice: "Save Invoice",
    cancel: "Cancel",
  },
  fr: {
    title: "Factures",
    subtitle: "Registres de facturation en direct, suivi des paiements clients et gestion des stocks.",
    refresh: "Actualiser",
    create_invoice: "Créer une facture",
    total_billed: "Montant total facturé",
    from_orders: "Sur {count} commandes au total",
    paid_invoices: "Factures payées",
    paid_desc: "Transactions traitées ou expédiées",
    pending_invoices: "En attente / En cours",
    pending_desc: "En attente d'exécution ou de paiement",
    filter_all: "Tout",
    filter_paid: "Payées",
    filter_pending: "En attente",
    filter_overdue: "En retard",
    search_placeholder: "Rechercher par facture, client, SKU...",
    loading: "Chargement des factures...",
    no_invoices: "Aucune facture trouvée",
    no_invoices_sub: "Essayez de modifier vos critères de recherche ou créez-en une nouvelle.",
    col_id: "N° Facture",
    col_items: "Articles",
    col_sku: "SKU",
    col_units: "Unités",
    col_stock: "Stock",
    col_date: "Date",
    col_customer: "Client",
    col_amount: "Montant",
    col_status: "Statut",
    col_add_stock: "Ajouter stock",
    col_action: "Actions",
    add_btn: "Ajouter",
    no_linked_item: "Aucun article lié",
    status_paid: "Payée",
    status_pending: "En attente",
    status_overdue: "En retard",
    preview_invoice: "Aperçu de la facture",
    print_download: "Imprimer / Télécharger PDF",
    invoice_heading: "FACTURE",
    issue_date: "Date d'émission",
    order_ref: "Réf. Commande",
    billed_to: "Facturé à",
    payment_status: "Statut du paiement",
    no_email: "Aucun e-mail fourni",
    item_no: "#",
    item_desc: "Description",
    item_qty: "Qté",
    item_unit_price: "Prix unitaire",
    item_total: "Montant",
    general_order: "Commande générale",
    subtotal: "Sous-total",
    discount: "Remise",
    shipping: "Livraison",
    tax: "Taxe",
    total_due: "Total à payer",
    notes_label: "Notes de facturation",
    footer_thanks: "Merci pour votre confiance — Facture officielle générée électroniquement par Smomo Store.",
    close: "Fermer",
    print_pdf_btn: "Imprimer / Enregistrer PDF",
    create_modal_title: "Créer une nouvelle facture",
    create_modal_desc: "Génère un nouvel enregistrement de facturation dans la base de données.",
    customer_name_label: "Nom du client *",
    customer_email_label: "E-mail du client",
    amount_label: "Montant ($) *",
    status_label: "Statut",
    note_label: "Note / Description",
    save_invoice: "Enregistrer",
    cancel: "Annuler",
  },
}

export default function InvoicesPage() {
  const { language, direction } = useLocaleStore()
  const lang = (language === "ar" || language === "fr" ? language : "en") as "ar" | "en" | "fr"
  const L = INVOICE_LABELS[lang]

  const [orders, setOrders] = useState<OrderRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")

  // Stock update state for table rows
  const [stockAddAmount, setStockAddAmount] = useState<{ [key: string]: number }>({})
  const [isUpdatingStock, setIsUpdatingStock] = useState<string | null>(null)

  // Invoice View Modal
  const [selectedInvoice, setSelectedInvoice] = useState<OrderRecord | null>(null)
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false)

  // Create Invoice Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newCustomerName, setNewCustomerName] = useState("")
  const [newCustomerEmail, setNewCustomerEmail] = useState("")
  const [newAmount, setNewAmount] = useState("120.00")
  const [newStatus, setNewStatus] = useState("Pending")
  const [newNote, setNewNote] = useState("")

  // جلب الفواتير الحية من قاعدة البيانات
  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/orders", { cache: "no-store" })
      const data = await res.json()
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders)
      } else {
        toast.error("Failed to load invoices from database")
      }
    } catch (err) {
      console.error("Error loading invoices:", err)
      toast.error("Network error while loading invoices")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  // دالة تنفيذ الطباعة أو التحميل كملف PDF بشكل كامل دون اقتطاع
  const handleTriggerPrint = useCallback((orderToPrint?: OrderRecord) => {
    if (orderToPrint) {
      setSelectedInvoice(orderToPrint)
      setIsInvoiceModalOpen(true)
      // الانتظار لحظة حتى يكتمل رسم النافذة في DOM ثم استدعاء طباعة المتصفح مع تفعيل @media print
      setTimeout(() => {
        window.print()
      }, 250)
    } else {
      window.print()
    }
  }, [])

  // Filter & Search logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const q = searchQuery.toLowerCase().trim()
      const invId = `inv-${order.orderNumber}`.toLowerCase()
      const orderNum = (order.orderNumber || "").toLowerCase()
      const custName = (order.customerName || order.user?.name || "").toLowerCase()
      const primaryProduct = (order.items?.[0]?.product?.name || "").toLowerCase()
      const primarySku = (order.items?.[0]?.product?.sku || "").toLowerCase()

      const matchesSearch =
        q === "" ||
        invId.includes(q) ||
        orderNum.includes(q) ||
        custName.includes(q) ||
        primaryProduct.includes(q) ||
        primarySku.includes(q)

      const orderStatus = order.status.toLowerCase()
      let matchesFilter = true
      if (filter === "Paid") {
        matchesFilter = orderStatus === "paid" || orderStatus === "delivered" || orderStatus === "shipped"
      } else if (filter === "Pending") {
        matchesFilter = orderStatus === "pending" || orderStatus === "processing"
      } else if (filter === "Overdue") {
        matchesFilter = orderStatus === "cancelled" || orderStatus === "overdue"
      }

      return matchesSearch && matchesFilter
    })
  }, [orders, searchQuery, filter])

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalAmount = orders.reduce((sum, o) => sum + Number(o.total || 0), 0)
    const paidCount = orders.filter((o) => {
      const s = o.status.toLowerCase()
      return s === "paid" || s === "delivered" || s === "shipped"
    }).length
    const pendingCount = orders.filter((o) => {
      const s = o.status.toLowerCase()
      return s === "pending" || s === "processing"
    }).length

    return {
      totalAmount,
      totalCount: orders.length,
      paidCount,
      pendingCount,
    }
  }, [orders])

  // Stock Add Action
  const handleAddStock = async (productId?: string) => {
    if (!productId) {
      toast.error("No associated product found for this invoice item")
      return
    }
    const qty = stockAddAmount[productId] || 0
    if (qty <= 0) {
      toast.error("Please enter a valid quantity greater than 0")
      return
    }

    try {
      setIsUpdatingStock(productId)
      const res = await fetch("/api/inventory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          adjustment: qty,
          type: "ADD",
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(`+${qty}`)
        setStockAddAmount((prev) => ({ ...prev, [productId]: 0 }))
        fetchInvoices()
      } else {
        toast.error(data.error || "Failed to update inventory")
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to update inventory")
    } finally {
      setIsUpdatingStock(null)
    }
  }

  // Create Invoice Action
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCustomerName.trim()) {
      toast.error("Customer name is required")
      return
    }
    const amt = parseFloat(newAmount)
    if (isNaN(amt) || amt < 0) {
      toast.error("Please enter a valid invoice amount")
      return
    }

    try {
      setIsCreating(true)
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: newCustomerName.trim(),
          customerEmail: newCustomerEmail.trim() || null,
          total: amt,
          status: newStatus,
          note: newNote.trim() || null,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success("Invoice created successfully")
        setIsCreateModalOpen(false)
        setNewCustomerName("")
        setNewCustomerEmail("")
        setNewAmount("120.00")
        setNewNote("")
        fetchInvoices()
      } else {
        toast.error(data.error || "Failed to create invoice")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to create invoice")
    } finally {
      setIsCreating(false)
    }
  }

  // Format Status Badge
  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase()
    if (s === "paid" || s === "delivered" || s === "shipped") {
      return (
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 gap-1">
          <CheckCircle className="h-3 w-3" /> {L.status_paid}
        </Badge>
      )
    }
    if (s === "pending" || s === "processing") {
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 gap-1">
          <Clock className="h-3 w-3" /> {L.status_pending}
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 gap-1">
        <AlertCircle className="h-3 w-3" /> {L.status_overdue}
      </Badge>
    )
  }

  const filterTabs = [
    { key: "All", label: L.filter_all },
    { key: "Paid", label: L.filter_paid },
    { key: "Pending", label: L.filter_pending },
    { key: "Overdue", label: L.filter_overdue },
  ]

  return (
    <div className="space-y-6 no-print">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{L.title}</h1>
          <p className="text-muted-foreground text-sm">{L.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchInvoices()} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            {L.refresh}
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-primary">
            <Plus className="h-4 w-4" /> {L.create_invoice}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">{L.total_billed}</CardDescription>
            <CardTitle dir="ltr" className="text-2xl font-bold text-foreground font-mono inline-block">
              ${metrics.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            {L.from_orders.replace("{count}", String(metrics.totalCount))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">{L.paid_invoices}</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 font-mono">
              {metrics.paidCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            {L.paid_desc}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">{L.pending_invoices}</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600 font-mono">
              {metrics.pendingCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            {L.pending_desc}
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="py-4 bg-muted/20 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2 bg-muted/50 p-1 rounded-lg">
              {filterTabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    filter === tab.key
                      ? "bg-background shadow-xs text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={L.search_placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9 bg-background w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">{L.loading}</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Package className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="font-semibold text-foreground">{L.no_invoices}</h3>
              <p className="text-sm mt-1">{L.no_invoices_sub}</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>{L.col_id}</TableHead>
                  <TableHead>{L.col_items}</TableHead>
                  <TableHead>{L.col_sku}</TableHead>
                  <TableHead>{L.col_units}</TableHead>
                  <TableHead>{L.col_stock}</TableHead>
                  <TableHead>{L.col_date}</TableHead>
                  <TableHead>{L.col_customer}</TableHead>
                  <TableHead>{L.col_amount}</TableHead>
                  <TableHead>{L.col_status}</TableHead>
                  <TableHead>{L.col_add_stock}</TableHead>
                  <TableHead className="text-end">{L.col_action}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const primaryProduct = order.items?.[0]?.product
                  const productId = primaryProduct?.id
                  const invoiceCode = `INV-${order.orderNumber}`
                  const customerDisplay = order.customerName || order.user?.name || "Guest Customer"
                  const formattedDate = new Date(order.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                  const itemsCount = order.items?.reduce((sum, it) => sum + (it.quantity || 1), 0) || 1
                  const stockCount = primaryProduct?.stock ?? "-"

                  return (
                    <TableRow key={order.id} className="hover:bg-muted/30">
                      <TableCell dir="ltr" className="font-mono font-medium text-xs text-primary">
                        {invoiceCode}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        <div className="max-w-[180px] truncate" title={primaryProduct?.name || order.note || "Standard Order"}>
                          {primaryProduct?.name || order.note || "Standard Order"}
                        </div>
                      </TableCell>
                      <TableCell dir="ltr" className="font-mono text-xs text-muted-foreground">
                        {primaryProduct?.sku || `SKU-${order.id.slice(0, 5).toUpperCase()}`}
                      </TableCell>
                      <TableCell dir="ltr" className="font-mono text-sm">{itemsCount}</TableCell>
                      <TableCell dir="ltr" className="font-mono text-sm">
                        {typeof stockCount === "number" ? (
                          <Badge variant="outline" className={stockCount < 5 ? "text-rose-600 border-rose-200" : "text-foreground"}>
                            {stockCount}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell dir="ltr" className="text-muted-foreground text-xs">{formattedDate}</TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{customerDisplay}</div>
                        {order.customerEmail && (
                          <div dir="ltr" className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {order.customerEmail}
                          </div>
                        )}
                      </TableCell>
                      <TableCell dir="ltr" className="font-semibold text-sm font-mono text-foreground">
                        ${Number(order.total || 0).toFixed(2)}
                      </TableCell>
                      <TableCell>{renderStatusBadge(order.status)}</TableCell>
                      <TableCell>
                        {productId ? (
                          <div className="flex items-center gap-1.5">
                            <Input
                              type="number"
                              min="1"
                              placeholder="0"
                              value={stockAddAmount[productId] || ""}
                              onChange={(e) =>
                                setStockAddAmount((prev) => ({
                                  ...prev,
                                  [productId]: parseInt(e.target.value) || 0,
                                }))
                              }
                              className="w-16 h-8 text-xs font-mono"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-xs"
                              disabled={isUpdatingStock === productId}
                              onClick={() => handleAddStock(productId)}
                            >
                              {isUpdatingStock === productId ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                L.add_btn
                              )}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">{L.no_linked_item}</span>
                        )}
                      </TableCell>
                      <TableCell className="text-end">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title={L.preview_invoice}
                            className="text-muted-foreground hover:text-primary"
                            onClick={() => {
                              setSelectedInvoice(order)
                              setIsInvoiceModalOpen(true)
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            title={L.print_download}
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => handleTriggerPrint(order)}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ====================================================================
          نافذة معاينة وطباعة الفاتورة المرنة (Responsive Invoice Preview Modal)
          ==================================================================== */}
      <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
        <DialogContent
          dir={direction}
          showCloseButton={false}
          className="invoice-preview-modal max-w-4xl w-[94vw] max-h-[90vh] overflow-y-auto overflow-x-hidden p-0 gap-0 rounded-2xl border shadow-2xl"
        >
          {selectedInvoice && (
            <div className="flex flex-col w-full min-w-0">
              {/* شريط علوي لأزرار التحكم بالمعاينة والطباعة (يختفي تلقائياً عند الطباعة) */}
              <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 bg-muted/80 backdrop-blur-md px-6 py-3.5 border-b print:hidden no-print">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-primary" />
                  <DialogTitle className="text-base font-bold text-foreground">
                    {L.preview_invoice} — <span dir="ltr" className="font-mono text-primary">INV-{selectedInvoice.orderNumber}</span>
                  </DialogTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleTriggerPrint()}
                    className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                  >
                    <Printer className="h-4 w-4" />
                    <span>{L.print_pdf_btn}</span>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsInvoiceModalOpen(false)}
                    className="gap-1.5"
                  >
                    <X className="h-4 w-4" />
                    <span>{L.close}</span>
                  </Button>
                </div>
              </div>

              {/* منطقة الفاتورة القابلة للطباعة بالكامل دون قص (#invoice-printable-area) */}
              <div
                id="invoice-printable-area"
                className="p-6 sm:p-8 md:p-10 space-y-8 bg-white text-slate-900 w-full min-w-0"
              >
                {/* 1. ترويسة الفاتورة وشعار الشركة (Header Section) */}
                <div className="invoice-header-section flex flex-col sm:flex-row justify-between items-start gap-6 border-b border-slate-200 pb-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
                        S
                      </div>
                      <div>
                        <h2 className="text-xl font-extrabold tracking-tight text-slate-900">
                          Smomo Store Inc.
                        </h2>
                        <p dir="ltr" className="text-xs text-slate-500">
                          contact@smomo.shop • www.smomo.shop
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-end space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-50 text-rose-700 font-bold text-sm border border-rose-200">
                      <FileText className="h-4 w-4" />
                      <span>{L.invoice_heading}</span>
                    </div>
                    <div className="pt-1 space-y-0.5 text-xs text-slate-600">
                      <div>
                        <span className="font-semibold text-slate-700">{L.col_id}: </span>
                        <span dir="ltr" className="font-mono font-bold text-slate-900">
                          INV-{selectedInvoice.orderNumber}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-700">{L.issue_date}: </span>
                        <span dir="ltr" className="font-mono">
                          {new Date(selectedInvoice.createdAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. بيانات العميل وحالة الدفع (Billing & Status Section) */}
                <div className="invoice-billing-section grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-xl border border-slate-200/80">
                  <div className="space-y-1">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      {L.billed_to}
                    </span>
                    <div className="text-base font-bold text-slate-900">
                      {selectedInvoice.customerName || selectedInvoice.user?.name || "Customer"}
                    </div>
                    <div dir="ltr" className="text-xs text-slate-600 font-mono inline-block">
                      {selectedInvoice.customerEmail || selectedInvoice.user?.email || L.no_email}
                    </div>
                  </div>

                  <div className="sm:text-end space-y-1.5 flex flex-col sm:items-end justify-center">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                      {L.payment_status}
                    </span>
                    <div>{renderStatusBadge(selectedInvoice.status)}</div>
                    <div className="text-xs text-slate-500">
                      <span>{L.order_ref}: </span>
                      <span dir="ltr" className="font-mono font-semibold text-slate-700">
                        #{selectedInvoice.orderNumber}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. جدول عناصر الفاتورة الكامل (Items Table) */}
                <div className="border border-slate-200 rounded-xl overflow-x-auto print:overflow-visible">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-slate-700">
                        <th className="py-3 px-4 text-start font-bold w-12">{L.item_no}</th>
                        <th className="py-3 px-4 text-start font-bold">{L.item_desc}</th>
                        <th className="py-3 px-4 text-center font-bold w-24">{L.item_qty}</th>
                        <th className="py-3 px-4 text-end font-bold w-32">{L.item_unit_price}</th>
                        <th className="py-3 px-4 text-end font-bold w-36">{L.item_total}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                        selectedInvoice.items.map((it, idx) => {
                          const unitPrice = Number(it.price || 0)
                          const qty = Number(it.quantity || 1)
                          const lineTotal = unitPrice * qty
                          return (
                            <tr key={it.id || idx} className="invoice-avoid-break hover:bg-slate-50/60">
                              <td dir="ltr" className="py-3.5 px-4 font-mono text-xs text-slate-500">
                                {idx + 1}
                              </td>
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-slate-900 break-words">
                                  {it.product?.name || `Item #${idx + 1}`}
                                </div>
                                {it.product?.sku && (
                                  <div dir="ltr" className="text-xs font-mono text-slate-500 mt-0.5 inline-block">
                                    SKU: {it.product.sku}
                                  </div>
                                )}
                              </td>
                              <td dir="ltr" className="py-3.5 px-4 text-center font-mono font-medium text-slate-800">
                                {qty}
                              </td>
                              <td dir="ltr" className="py-3.5 px-4 text-end font-mono text-slate-700">
                                ${unitPrice.toFixed(2)}
                              </td>
                              <td dir="ltr" className="py-3.5 px-4 text-end font-mono font-bold text-slate-900">
                                ${lineTotal.toFixed(2)}
                              </td>
                            </tr>
                          )
                        })
                      ) : (
                        <tr className="invoice-avoid-break">
                          <td dir="ltr" className="py-3.5 px-4 font-mono text-xs text-slate-500">
                            1
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {selectedInvoice.note || L.general_order}
                          </td>
                          <td dir="ltr" className="py-3.5 px-4 text-center font-mono font-medium text-slate-800">
                            1
                          </td>
                          <td dir="ltr" className="py-3.5 px-4 text-end font-mono text-slate-700">
                            ${Number(selectedInvoice.total || 0).toFixed(2)}
                          </td>
                          <td dir="ltr" className="py-3.5 px-4 text-end font-mono font-bold text-slate-900">
                            ${Number(selectedInvoice.total || 0).toFixed(2)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 4. ملخص المبالغ والإجمالي النهائي (Totals Breakdown Section) */}
                <div className="invoice-totals-section flex flex-col sm:flex-row justify-between items-start gap-6 pt-2">
                  <div className="max-w-sm space-y-1.5">
                    {selectedInvoice.note && (
                      <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                        <span className="font-bold text-slate-800 block mb-1">{L.notes_label}:</span>
                        <p className="leading-relaxed">{selectedInvoice.note}</p>
                      </div>
                    )}
                  </div>

                  <div className="w-full sm:w-80 bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-2.5 text-sm">
                    <div className="flex justify-between items-center text-slate-600">
                      <span>{L.subtotal}:</span>
                      <span dir="ltr" className="font-mono font-medium text-slate-900">
                        ${Number(selectedInvoice.subtotal || selectedInvoice.total || 0).toFixed(2)}
                      </span>
                    </div>

                    {Number(selectedInvoice.discount || 0) > 0 && (
                      <div className="flex justify-between items-center text-emerald-700">
                        <span>{L.discount}:</span>
                        <span dir="ltr" className="font-mono font-medium">
                          -${Number(selectedInvoice.discount).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {Number(selectedInvoice.shippingFee || 0) > 0 && (
                      <div className="flex justify-between items-center text-slate-600">
                        <span>{L.shipping}:</span>
                        <span dir="ltr" className="font-mono font-medium text-slate-900">
                          +${Number(selectedInvoice.shippingFee).toFixed(2)}
                        </span>
                      </div>
                    )}

                    {Number(selectedInvoice.tax || 0) > 0 && (
                      <div className="flex justify-between items-center text-slate-600">
                        <span>{L.tax}:</span>
                        <span dir="ltr" className="font-mono font-medium text-slate-900">
                          +${Number(selectedInvoice.tax).toFixed(2)}
                        </span>
                      </div>
                    )}

                    <div className="border-t border-slate-300 pt-3 flex justify-between items-center font-extrabold text-base text-slate-900">
                      <span>{L.total_due}:</span>
                      <span dir="ltr" className="font-mono text-lg text-rose-600">
                        ${Number(selectedInvoice.total || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. تذييل الفاتورة الرسمي (Official Footer Section) */}
                <div className="invoice-footer-section border-t border-slate-200 pt-5 text-center text-xs text-slate-500 space-y-1">
                  <p className="font-medium text-slate-700">{L.footer_thanks}</p>
                  <p dir="ltr" className="font-mono text-[11px] text-slate-400">
                    Smomo Store Inc. • Invoice ID: INV-{selectedInvoice.orderNumber}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Invoice Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{L.create_modal_title}</DialogTitle>
            <DialogDescription>{L.create_modal_desc}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateInvoice} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground">{L.customer_name_label}</label>
              <Input
                required
                placeholder="e.g. John Doe or Acme Corp"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">{L.customer_email_label}</label>
              <Input
                dir="ltr"
                type="email"
                placeholder="customer@example.com"
                value={newCustomerEmail}
                onChange={(e) => setNewCustomerEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">{L.amount_label}</label>
                <Input
                  dir="ltr"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="mt-1 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-foreground">{L.status_label}</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="Processing">Processing</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered (Paid)</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">{L.note_label}</label>
              <Input
                placeholder="e.g. Consulting services or custom batch order"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="mt-1"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                {L.cancel}
              </Button>
              <Button type="submit" disabled={isCreating} className="gap-2">
                {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                {L.save_invoice}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
