"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { 
  Search, 
  Filter, 
  Star, 
  Plus, 
  Pencil, 
  Trash2, 
  Loader2, 
  AlertTriangle, 
  Check, 
  X,
  MessageSquare,
  Sparkles
} from "lucide-react"
import { toast } from "sonner"

export interface ReviewItem {
  id: string
  productId: string
  customerName: string
  rating: number
  comment: string
  status: "APPROVED" | "PENDING" | "REJECTED" | string
  createdAt: string | Date
  updatedAt?: string | Date
  product?: {
    id: string
    name: string
    imageUrl?: string | null
    price: number
  } | null
  user?: {
    id: string
    name: string
    email: string
  } | null
}

interface ProductOption {
  id: string
  name: string
  price: number
  imageUrl?: string | null
}

// دالة تنسيق التاريخ بتنسيق YYYY-MM-DD المطابق للصورة
function formatDateString(dateInput: string | Date): string {
  try {
    const d = new Date(dateInput)
    if (isNaN(d.getTime())) return String(dateInput)
    return d.toISOString().split("T")[0]
  } catch (e) {
    return String(dateInput)
  }
}

export default function ProductReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([])
  const [products, setProducts] = useState<ProductOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [ratingFilter, setRatingFilter] = useState<string>("ALL")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  // حالة النافذة المنبثقة للتعديل (Edit Modal)
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [editCustomer, setEditCustomer] = useState("")
  const [editRating, setEditRating] = useState<number>(5)
  const [editComment, setEditComment] = useState("")
  const [editStatus, setEditStatus] = useState("APPROVED")

  // حالة بطاقة تأكيد الحذف (Delete Confirmation Card - بدون window.confirm)
  const [reviewToDelete, setReviewToDelete] = useState<ReviewItem | null>(null)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // حالة إضافة مراجعة جديدة (Create Modal)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newProductId, setNewProductId] = useState("")
  const [newCustomer, setNewCustomer] = useState("")
  const [newRating, setNewRating] = useState<number>(5)
  const [newComment, setNewComment] = useState("")
  const [newStatus, setNewStatus] = useState("APPROVED")

  // نجوم التقييم التفاعلية (Interactive Star Selector Component)
  const renderInteractiveStars = (
    currentRating: number,
    onSelectRating: (val: number) => void
  ) => {
    return (
      <div className="flex items-center gap-1.5 cursor-pointer">
        {[1, 2, 3, 4, 5].map((starVal) => (
          <button
            key={starVal}
            type="button"
            onClick={() => onSelectRating(starVal)}
            className="p-0.5 hover:scale-110 transition-transform focus:outline-none"
            title={`${starVal} star${starVal > 1 ? "s" : ""}`}
          >
            <Star
              className={`w-5 h-5 ${
                starVal <= currentRating
                  ? "fill-amber-500 text-amber-500"
                  : "text-gray-300 hover:text-amber-300"
              }`}
            />
          </button>
        ))}
        <span className="text-xs font-semibold text-muted-foreground ml-2">
          {currentRating} / 5 Stars
        </span>
      </div>
    )
  }

  // جلب قائمة المراجعات من الـ API
  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true)
      const params = new URLSearchParams()
      if (searchQuery.trim()) params.set("search", searchQuery.trim())
      if (ratingFilter !== "ALL") params.set("rating", ratingFilter)
      if (statusFilter !== "ALL") params.set("status", statusFilter)

      const res = await fetch(`/api/reviews?${params.toString()}`)
      const data = await res.json()

      if (data.success && Array.isArray(data.reviews)) {
        setReviews(data.reviews)
      } else {
        toast.error("Failed to load reviews from database")
      }
    } catch (err) {
      console.error("Error loading reviews:", err)
      toast.error("Network error while loading reviews")
    } finally {
      setIsLoading(false)
    }
  }, [searchQuery, ratingFilter, statusFilter])

  // جلب قائمة المنتجات لاختيارها في نافذة الإضافة
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products")
      const data = await res.json()
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products)
        if (data.products.length > 0 && !newProductId) {
          setNewProductId(data.products[0].id)
        }
      }
    } catch (e) {
      console.error("Error fetching products:", e)
    }
  }, [newProductId])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  // 1. فتح بطاقة التعديل (Open Edit Modal)
  const handleOpenEdit = (review: ReviewItem) => {
    setEditingReview(review)
    setEditCustomer(review.customerName)
    setEditRating(review.rating)
    setEditComment(review.comment || "")
    setEditStatus(review.status || "APPROVED")
    setIsEditModalOpen(true)
  }

  // حفظ التعديلات (Save Edit)
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingReview) return

    try {
      setIsUpdating(true)
      const res = await fetch(`/api/reviews/${editingReview.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: editCustomer,
          rating: editRating,
          comment: editComment,
          status: editStatus,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success("Review updated successfully")
        setIsEditModalOpen(false)
        fetchReviews()
      } else {
        toast.error(data.error || "Failed to update review")
      }
    } catch (err) {
      console.error("Error updating review:", err)
      toast.error("Network error while updating review")
    } finally {
      setIsUpdating(false)
    }
  }

  // 2. فتح بطاقة تأكيد الحذف (Open Delete Modal)
  const handleOpenDelete = (review: ReviewItem) => {
    setReviewToDelete(review)
    setIsDeleteModalOpen(true)
  }

  // تنفيذ الحذف النهائي (Confirm Delete)
  const handleConfirmDelete = async () => {
    if (!reviewToDelete) return

    try {
      setIsDeleting(true)
      const res = await fetch(`/api/reviews/${reviewToDelete.id}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (data.success) {
        toast.success("Review deleted successfully")
        setIsDeleteModalOpen(false)
        setReviewToDelete(null)
        fetchReviews()
      } else {
        toast.error(data.error || "Failed to delete review")
      }
    } catch (err) {
      console.error("Error deleting review:", err)
      toast.error("Network error while deleting review")
    } finally {
      setIsDeleting(false)
    }
  }

  // 3. إضافة مراجعة جديدة (Create Review)
  const handleCreateReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProductId) {
      toast.error("Please select a product")
      return
    }

    try {
      setIsCreating(true)
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: newProductId,
          customerName: newCustomer || "Customer",
          rating: newRating,
          comment: newComment,
          status: newStatus,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success("New review created successfully")
        setIsCreateModalOpen(false)
        setNewCustomer("")
        setNewRating(5)
        setNewComment("")
        setNewStatus("APPROVED")
        fetchReviews()
      } else {
        toast.error(data.error || "Failed to create review")
      }
    } catch (err) {
      console.error("Error creating review:", err)
      toast.error("Network error while creating review")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. TOP HEADER (مطابق تماماً للصورة المرفقة)                  */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Product Reviews</h1>
          <p className="text-muted-foreground text-sm">
            Manage and respond to customer reviews.
          </p>
        </div>

        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="h-9 gap-1.5 shadow-xs"
        >
          <Plus className="h-4 w-4" /> Add Review
        </Button>
      </div>

      {/* ========================================================= */}
      {/* 2. CARD WITH TOOLBAR & REVIEWS TABLE                      */}
      {/* ========================================================= */}
      <Card className="shadow-xs overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-base font-semibold">All Reviews</CardTitle>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {/* حقل البحث المطابق للصورة تماماً */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search reviews..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-muted/50 h-9 text-sm"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {/* زر الفلترة (Filter Button & Dropdown) */}
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors border border-input bg-background hover:bg-muted h-9 w-9"
                  title="Filter Reviews by Rating"
                >
                  <Filter className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs">Filter by Rating</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setRatingFilter("ALL")}
                    className={ratingFilter === "ALL" ? "font-semibold text-primary" : ""}
                  >
                    All Ratings
                  </DropdownMenuItem>
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <DropdownMenuItem
                      key={stars}
                      onClick={() => setRatingFilter(String(stars))}
                      className={`flex items-center justify-between ${
                        ratingFilter === String(stars) ? "font-semibold text-primary" : ""
                      }`}
                    >
                      <span className="flex items-center gap-1">
                        {stars} Stars
                      </span>
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: stars }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Product</TableHead>
                  <TableHead className="w-[160px]">Customer</TableHead>
                  <TableHead className="w-[140px]">Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead className="w-[120px]">Date</TableHead>
                  <TableHead className="w-[100px] text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Loading skeleton rows
                  Array.from({ length: 4 }).map((_, idx) => (
                    <TableRow key={`skeleton-${idx}`}>
                      <TableCell><div className="h-4 w-28 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-48 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell><div className="h-4 w-20 bg-muted animate-pulse rounded" /></TableCell>
                      <TableCell className="text-right"><div className="h-7 w-16 bg-muted animate-pulse rounded ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : reviews.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-40 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
                        <MessageSquare className="h-8 w-8 stroke-[1.5] opacity-40" />
                        <p className="font-medium text-sm">No reviews found</p>
                        <p className="text-xs">Try adjusting your search or rating filter.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  reviews.map((review) => {
                    const productName = review.product?.name || "Product"
                    const dateFormatted = formatDateString(review.createdAt)

                    return (
                      <TableRow key={review.id} className="hover:bg-muted/30 transition-colors">
                        {/* 1. Product (اسم المنتج) */}
                        <TableCell className="font-medium text-foreground">
                          {productName}
                        </TableCell>

                        {/* 2. Customer (اسم العميل) */}
                        <TableCell className="text-foreground">
                          {review.customerName}
                        </TableCell>

                        {/* 3. Rating (النجوم الذهبية المطابقة للصورة تماماً) */}
                        <TableCell>
                          <div className="flex items-center text-amber-500">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? "fill-current" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </TableCell>

                        {/* 4. Comment (نص التعليق) */}
                        <TableCell className="max-w-[280px] truncate text-foreground" title={review.comment}>
                          {review.comment || <span className="text-muted-foreground italic">No comment provided</span>}
                        </TableCell>

                        {/* 5. Date (التاريخ) */}
                        <TableCell className="text-muted-foreground font-mono text-xs">
                          {dateFormatted}
                        </TableCell>

                        {/* 6. Action (أزرار التعديل والحذف) */}
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(review)}
                              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                              title="Edit Review"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDelete(review)}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              title="Delete Review"
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
      {/* 3. EDIT REVIEW MODAL (بطاقة تعديل المراجعة)                  */}
      {/* ========================================================= */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Pencil className="h-4 w-4 text-primary" /> Edit Product Review
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify the customer review rating, comment, or approval status.
            </DialogDescription>
          </DialogHeader>

          {editingReview && (
            <form onSubmit={handleSaveEdit} className="space-y-3.5 py-1">
              <div className="p-3 bg-muted/40 rounded-lg border text-xs">
                <span className="text-muted-foreground">Product: </span>
                <strong className="text-foreground">{editingReview.product?.name || "Product"}</strong>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Customer Name <span className="text-destructive">*</span>
                </label>
                <Input
                  type="text"
                  required
                  value={editCustomer}
                  onChange={(e) => setEditCustomer(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Rating (Stars)
                </label>
                {renderInteractiveStars(editRating, setEditRating)}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">
                  Comment
                </label>
                <textarea
                  rows={3}
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  className="w-full p-2.5 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
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
                  <option value="APPROVED">Approved (معتمد)</option>
                  <option value="PENDING">Pending Review (قيد المراجعة)</option>
                  <option value="REJECTED">Rejected (مرفوض)</option>
                </select>
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
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 4. DELETE CONFIRMATION CARD (بطاقة تأكيد الحذف بدون Alert)    */}
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
                  Confirm Review Deletion
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                  Are you sure you want to delete this customer review?
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {reviewToDelete && (
            <div className="space-y-3 py-2">
              <div className="p-3.5 bg-muted/40 rounded-xl border border-border/70 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground text-sm">
                    {reviewToDelete.product?.name || "Product"}
                  </span>
                  <div className="flex items-center text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < reviewToDelete.rating ? "fill-current" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground pt-1.5 border-t border-border/50">
                  <span>By: <strong className="text-foreground">{reviewToDelete.customerName}</strong></span>
                  <p className="mt-1 italic text-foreground/80 line-clamp-2">"{reviewToDelete.comment}"</p>
                </div>
              </div>

              <div className="p-2.5 bg-destructive/5 rounded-lg border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>This action cannot be undone. The review will be permanently erased.</span>
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
              Yes, Delete Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* 5. CREATE REVIEW MODAL (إضافة مراجعة جديدة)                 */}
      {/* ========================================================= */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> Add New Review
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Add a customer review manually to any product in your store.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateReview} className="space-y-3.5 py-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Target Product <span className="text-destructive">*</span>
              </label>
              <select
                required
                value={newProductId}
                onChange={(e) => setNewProductId(e.target.value)}
                className="w-full h-9 px-2.5 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (${p.price.toFixed(2)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Customer Name <span className="text-destructive">*</span>
              </label>
              <Input
                type="text"
                placeholder="e.g. John Doe"
                required
                value={newCustomer}
                onChange={(e) => setNewCustomer(e.target.value)}
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Rating (Stars)
              </label>
              {renderInteractiveStars(newRating, setNewRating)}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-foreground">
                Comment <span className="text-destructive">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Customer's review feedback..."
                required
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="w-full p-2.5 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
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
                <option value="APPROVED">Approved (معتمد)</option>
                <option value="PENDING">Pending Review (قيد المراجعة)</option>
                <option value="REJECTED">Rejected (مرفوض)</option>
              </select>
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
                Add Review
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
