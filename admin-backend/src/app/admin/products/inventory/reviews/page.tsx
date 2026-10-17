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
  Plus,
  RefreshCw,
  ArrowLeft,
  ClipboardList,
  Check,
  Trash2,
} from "lucide-react"

interface InventoryReview {
  id: string
  dbId?: string
  reviewId: string
  product: string
  sku: string
  expected: number
  actual: number
  status: "matched" | "discrepancy"
  date: string
  notes?: string
}

interface ProductOption {
  id: string
  name: string
  sku: string
  stock: number
}

export default function InventoryReviewsPage() {
  const [reviews, setReviews] = useState<InventoryReview[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  // Modal State for "New Review"
  const [isNewReviewOpen, setIsNewReviewOpen] = useState(false)
  const [availableProducts, setAvailableProducts] = useState<ProductOption[]>([])
  const [selectedProductId, setSelectedProductId] = useState<string>("")
  const [customProduct, setCustomProduct] = useState("")
  const [customSku, setCustomSku] = useState("")
  const [expectedCount, setExpectedCount] = useState<number>(100)
  const [actualCount, setActualCount] = useState<number>(100)
  const [reviewNotes, setReviewNotes] = useState("")
  const [reconcileStock, setReconcileStock] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Fetch reviews from API
  const fetchReviews = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/inventory/reviews")
      const data = await res.json()
      if (data.success) {
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error("Failed to load inventory reviews:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch products for the New Review modal dropdown
  const fetchProductsForReview = async () => {
    try {
      const res = await fetch("/api/products")
      const data = await res.json()
      if (data.success && data.products) {
        setAvailableProducts(
          data.products.map((p: any) => ({
            id: p.id,
            name: p.name,
            sku: p.sku || `SKU-${p.id.slice(0, 5)}`,
            stock: p.stock,
          }))
        )
        if (data.products.length > 0 && !selectedProductId) {
          setSelectedProductId(data.products[0].id)
          setExpectedCount(data.products[0].stock)
          setActualCount(data.products[0].stock)
        }
      }
    } catch (e) {
      console.error("Error fetching products:", e)
    }
  }

  useEffect(() => {
    fetchReviews()
    fetchProductsForReview()
  }, [])

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [notification])

  // Filter reviews client-side
  const filteredReviews = useMemo(() => {
    return reviews.filter((rev) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !q ||
        rev.id.toLowerCase().includes(q) ||
        rev.product.toLowerCase().includes(q) ||
        rev.sku.toLowerCase().includes(q) ||
        rev.status.toLowerCase().includes(q)

      const matchesStatus =
        statusFilter === "ALL" || rev.status === statusFilter

      return matchesQuery && matchesStatus
    })
  }, [reviews, searchQuery, statusFilter])

  // Handle New Review submission
  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const selectedProd = availableProducts.find((p) => p.id === selectedProductId)

    const payload = {
      productId: selectedProd ? selectedProd.id : null,
      productName: selectedProd ? selectedProd.name : customProduct || "Audited Product",
      sku: selectedProd ? selectedProd.sku : customSku || "SKU-AUDIT",
      expected: Number(expectedCount),
      actual: Number(actualCount),
      status: Number(expectedCount) === Number(actualCount) ? "matched" : "discrepancy",
      notes: reviewNotes,
      reconcileStock,
    }

    try {
      const res = await fetch("/api/inventory/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (result.success) {
        setNotification({
          type: "success",
          message: `Inventory Review ${result.review.reviewId} created successfully.`,
        })
        setIsNewReviewOpen(false)
        setReviewNotes("")
        await fetchReviews()
      } else {
        setNotification({
          type: "error",
          message: result.error || "Failed to create review.",
        })
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Network error occurred.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete review
  const handleDeleteReview = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory/reviews/${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        setNotification({
          type: "success",
          message: `Review ${id} deleted successfully.`,
        })
        setReviews((prev) => prev.filter((r) => r.id !== id))
      }
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Failed to delete review.",
      })
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

      {/* Header matching exact layout from Screenshot 2 */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/products/inventory"
              className="text-muted-foreground hover:text-foreground text-xs inline-flex items-center mb-1"
            >
              <ArrowLeft className="h-3 w-3 mr-1" /> Back to Inventory
            </Link>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Inventory Reviews</h1>
          <p className="text-muted-foreground text-sm">Monitor and reconcile stock discrepancies.</p>
        </div>
        <Button
          onClick={() => setIsNewReviewOpen(true)}
          className="bg-[#E11D48] hover:bg-[#BE123C] text-white shadow-sm"
        >
          New Review
        </Button>
      </div>

      {/* Main Table Card matching Screenshot 2 */}
      <Card className="rounded-xl border shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-lg font-semibold">Recent Reviews</CardTitle>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* Search Bar */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-muted/40 border-gray-200 h-9"
                />
              </div>

              {/* Status Filter */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-muted h-9 w-9 border-gray-200 cursor-pointer ${
                    statusFilter !== "ALL" ? "border-rose-400 bg-rose-50/50" : ""
                  }`}
                  title="Filter by discrepancy status"
                >
                  <Filter className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setStatusFilter("ALL")}>
                    All Reviews
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("matched")}>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 inline-block" />
                    Matched
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setStatusFilter("discrepancy")}>
                    <span className="w-2 h-2 rounded-full bg-rose-500 mr-2 inline-block" />
                    Discrepancy
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Refresh Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={fetchReviews}
                className="h-9 w-9 border-gray-200"
                title="Refresh Reviews"
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
                  <TableHead className="font-semibold text-foreground">Review ID</TableHead>
                  <TableHead className="font-semibold text-foreground">Product</TableHead>
                  <TableHead className="font-semibold text-foreground">SKU</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Expected</TableHead>
                  <TableHead className="text-right font-semibold text-foreground">Actual</TableHead>
                  <TableHead className="font-semibold text-foreground">Status</TableHead>
                  <TableHead className="font-semibold text-foreground">Date</TableHead>
                  <TableHead className="text-right font-semibold text-foreground w-[70px]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && reviews.length === 0 ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      <TableCell><div className="h-4 w-20 bg-muted rounded" /></TableCell>
                      <TableCell><div className="h-4 w-36 bg-muted rounded" /></TableCell>
                      <TableCell><div className="h-4 w-16 bg-muted rounded" /></TableCell>
                      <TableCell className="text-right"><div className="h-4 w-12 bg-muted rounded ml-auto" /></TableCell>
                      <TableCell className="text-right"><div className="h-4 w-12 bg-muted rounded ml-auto" /></TableCell>
                      <TableCell><div className="h-5 w-24 bg-muted rounded-full" /></TableCell>
                      <TableCell><div className="h-4 w-24 bg-muted rounded" /></TableCell>
                      <TableCell><div className="h-6 w-8 bg-muted rounded ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredReviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">
                      <ClipboardList className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      No inventory reviews found matching your search.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredReviews.map((review) => (
                    <TableRow key={review.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground">
                        {review.id}
                      </TableCell>
                      <TableCell>{review.product}</TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {review.sku}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {review.expected}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {review.actual}
                      </TableCell>
                      <TableCell>
                        {review.status === "matched" ? (
                          <Badge
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium px-2.5 py-0.5 rounded-full inline-flex items-center"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                            Matched
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-rose-50 text-rose-700 border-rose-200 font-medium px-2.5 py-0.5 rounded-full inline-flex items-center"
                          >
                            <AlertCircle className="w-3.5 h-3.5 mr-1.5 text-rose-600" />
                            Discrepancy
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {review.date}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteReview(review.id)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-50"
                          title="Delete Review"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
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

      {/* New Review Dialog Modal */}
      <Dialog open={isNewReviewOpen} onOpenChange={setIsNewReviewOpen}>
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleCreateReview}>
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold flex items-center gap-2">
                <ClipboardList className="h-5 w-5 text-[#E11D48]" />
                Record Inventory Review
              </DialogTitle>
              <DialogDescription>
                Compare expected physical warehouse count against actual counts to detect stock discrepancies.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-3">
              {/* Product Select */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Select Product</label>
                <select
                  className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-rose-500"
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value)
                    const prod = availableProducts.find((p) => p.id === e.target.value)
                    if (prod) {
                      setExpectedCount(prod.stock)
                      setActualCount(prod.stock)
                    }
                  }}
                >
                  {availableProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.sku}) — Recorded Stock: {p.stock}
                    </option>
                  ))}
                </select>
              </div>

              {/* Expected vs Actual */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Expected Count</label>
                  <Input
                    type="number"
                    min="0"
                    value={expectedCount}
                    onChange={(e) => setExpectedCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="font-bold text-center h-10"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Actual Physical Count</label>
                  <Input
                    type="number"
                    min="0"
                    value={actualCount}
                    onChange={(e) => setActualCount(Math.max(0, parseInt(e.target.value) || 0))}
                    className="font-bold text-center h-10"
                    required
                  />
                </div>
              </div>

              {/* Computed Outcome Badge Preview */}
              <div className="p-3 bg-muted/40 rounded-lg border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Audit Outcome:</span>
                {Number(expectedCount) === Number(actualCount) ? (
                  <Badge
                    variant="outline"
                    className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs px-2.5 py-0.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                    Matched (Difference: 0)
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-rose-50 text-rose-700 border-rose-200 text-xs px-2.5 py-0.5"
                  >
                    <AlertCircle className="w-3.5 h-3.5 mr-1 text-rose-600" />
                    Discrepancy (Diff: {Number(actualCount) - Number(expectedCount)})
                  </Badge>
                )}
              </div>

              {/* Reconcile Stock Checkbox */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="reconcile"
                  checked={reconcileStock}
                  onChange={(e) => setReconcileStock(e.target.checked)}
                  className="rounded border-gray-300 text-rose-600 focus:ring-rose-500 h-4 w-4"
                />
                <label htmlFor="reconcile" className="text-xs text-foreground font-medium cursor-pointer">
                  Sync product warehouse stock to actual count ({actualCount} units)
                </label>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Audit Notes (Optional)</label>
                <Input
                  placeholder="e.g. 2 units damaged during shipping / shelf verified"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="text-sm h-9"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewReviewOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#E11D48] hover:bg-[#BE123C] text-white"
              >
                {isSubmitting ? "Recording..." : "Save Audit"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
