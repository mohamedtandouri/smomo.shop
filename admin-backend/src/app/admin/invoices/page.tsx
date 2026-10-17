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
  TrendingUp,
  FileText
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

export default function InvoicesPage() {
  const { t } = useLocaleStore()
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

  // Fetch real orders from database via API
  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/orders")
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

      // Map DB statuses to Invoice Filter tabs
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

  // Stock Add Action (persists directly to Product stock in DB)
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
        toast.success(`Added +${qty} units to product inventory`)
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

  // Create Invoice Action (persists directly to Order table in DB)
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
        toast.success("Invoice created successfully in database")
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
        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          <CheckCircle className="h-3 w-3 mr-1" /> Paid
        </Badge>
      )
    }
    if (s === "pending" || s === "processing") {
      return (
        <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <Clock className="h-3 w-3 mr-1" /> Pending
        </Badge>
      )
    }
    return (
      <Badge variant="secondary" className="bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
        <AlertCircle className="h-3 w-3 mr-1" /> Overdue
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground text-sm">
            Live database billing records, track customer payments, and manage inventory stock allocations.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchInvoices()} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-primary">
            <Plus className="h-4 w-4" /> Create Invoice
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Billed Amount</CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground font-mono">
              ${metrics.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            From {metrics.totalCount} total orders in database
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Paid Invoices</CardDescription>
            <CardTitle className="text-2xl font-bold text-emerald-600 font-mono">
              {metrics.paidCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Processed or shipped transactions
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Pending / Processing</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-600 font-mono">
              {metrics.pendingCount}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 text-xs text-muted-foreground">
            Awaiting fulfillment or payment capture
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="py-4 bg-muted/20 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex gap-2 bg-muted/50 p-1 rounded-lg">
              {["All", "Paid", "Pending", "Overdue"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    filter === f ? "bg-background shadow-xs text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by invoice, customer, SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 text-muted-foreground gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Loading live database invoices...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Package className="h-10 w-10 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="font-semibold text-foreground">No invoices found</h3>
              <p className="text-sm mt-1">Try adjusting your search criteria or create a new invoice.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Invoice ID</TableHead>
                  <TableHead>Name / Items</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Add stock</TableHead>
                  <TableHead className="text-right">Action</TableHead>
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
                      <TableCell className="font-mono font-medium text-xs text-primary">
                        {invoiceCode}
                      </TableCell>
                      <TableCell className="font-medium text-sm">
                        <div className="max-w-[180px] truncate" title={primaryProduct?.name || order.note || "Standard Order"}>
                          {primaryProduct?.name || order.note || "Standard Order"}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {primaryProduct?.sku || `SKU-${order.id.slice(0, 5).toUpperCase()}`}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{itemsCount}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {typeof stockCount === "number" ? (
                          <Badge variant="outline" className={stockCount < 5 ? "text-rose-600 border-rose-200" : "text-foreground"}>
                            {stockCount}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{formattedDate}</TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{customerDisplay}</div>
                        {order.customerEmail && (
                          <div className="text-xs text-muted-foreground truncate max-w-[140px]">
                            {order.customerEmail}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-semibold text-sm font-mono text-foreground">
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
                                "Add"
                              )}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No linked item</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            title="View Invoice"
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
                            title="Print / Download"
                            className="text-muted-foreground hover:text-foreground"
                            onClick={() => {
                              setSelectedInvoice(order)
                              setIsInvoiceModalOpen(true)
                            }}
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

      {/* Invoice Details & Print Modal */}
      <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedInvoice && (
            <div className="space-y-6 pt-2">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-primary" />
                    <h2 className="text-xl font-bold">INVOICE</h2>
                  </div>
                  <p className="text-sm font-mono text-muted-foreground mt-1">
                    INV-{selectedInvoice.orderNumber}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">Smomo Store Inc.</div>
                  <div className="text-xs text-muted-foreground">contact@smomo.shop</div>
                  <div className="text-xs text-muted-foreground">
                    Date: {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* Bill To & Status */}
              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
                <div>
                  <span className="text-xs font-semibold uppercase text-muted-foreground block mb-1">
                    Billed To:
                  </span>
                  <div className="font-semibold text-foreground">
                    {selectedInvoice.customerName || selectedInvoice.user?.name || "Customer"}
                  </div>
                  <div className="text-muted-foreground text-xs mt-0.5">
                    {selectedInvoice.customerEmail || "No email provided"}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold uppercase text-muted-foreground block mb-1">
                    Payment Status:
                  </span>
                  {renderStatusBadge(selectedInvoice.status)}
                </div>
              </div>

              {/* Items Table */}
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40">
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-center">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedInvoice.items && selectedInvoice.items.length > 0 ? (
                      selectedInvoice.items.map((it, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {it.product?.name || `Item #${idx + 1}`}
                            {it.product?.sku && (
                              <span className="block text-xs font-mono text-muted-foreground">
                                SKU: {it.product.sku}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-mono">{it.quantity}</TableCell>
                          <TableCell className="text-right font-mono">${Number(it.price).toFixed(2)}</TableCell>
                          <TableCell className="text-right font-mono font-semibold">
                            ${(Number(it.price) * it.quantity).toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell className="font-medium">
                          {selectedInvoice.note || "General Store Order"}
                        </TableCell>
                        <TableCell className="text-center font-mono">1</TableCell>
                        <TableCell className="text-right font-mono">
                          ${Number(selectedInvoice.total).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-mono font-semibold">
                          ${Number(selectedInvoice.total).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Financial Breakdown */}
              <div className="flex justify-end">
                <div className="w-64 space-y-2 text-sm font-mono">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal:</span>
                    <span>${Number(selectedInvoice.subtotal || selectedInvoice.total).toFixed(2)}</span>
                  </div>
                  {Number(selectedInvoice.discount || 0) > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount:</span>
                      <span>-${Number(selectedInvoice.discount).toFixed(2)}</span>
                    </div>
                  )}
                  {Number(selectedInvoice.tax || 0) > 0 && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax:</span>
                      <span>+${Number(selectedInvoice.tax).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-base text-foreground">
                    <span>Total Due:</span>
                    <span>${Number(selectedInvoice.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-4 border-t">
                <Button variant="outline" onClick={() => setIsInvoiceModalOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => window.print()} className="gap-2">
                  <Printer className="h-4 w-4" /> Print / Save PDF
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Invoice Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Generates a new billing record and stores it directly into the database.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateInvoice} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground">Customer Name *</label>
              <Input
                required
                placeholder="e.g. John Doe or Acme Corp"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Customer Email</label>
              <Input
                type="email"
                placeholder="customer@example.com"
                value={newCustomerEmail}
                onChange={(e) => setNewCustomerEmail(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-foreground">Amount ($) *</label>
                <Input
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
                <label className="text-xs font-semibold text-foreground">Status</label>
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
              <label className="text-xs font-semibold text-foreground">Invoice Note / Item description</label>
              <Input
                placeholder="e.g. Consulting services or custom batch order"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="mt-1"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating} className="gap-2">
                {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                Save Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
