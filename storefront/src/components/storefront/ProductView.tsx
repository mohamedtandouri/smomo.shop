"use client"

import React, { useState, useRef } from "react"
import Link from "next/link"
import { 
  Star, 
  ShoppingCart, 
  Check, 
  ZoomIn, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Heart, 
  Minus, 
  Plus, 
  ChevronRight, 
  ArrowLeft,
  Share2,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  Cpu,
  Layers,
  Battery,
  Send,
  Loader2
} from "lucide-react"
import { useCartStore } from "@/store/useCartStore"
import { useCurrencyStore } from "@/store/useCurrencyStore"
import { useLocaleStore } from "@/store/useLocaleStore"
import { toast } from "sonner"

export interface ProductType {
  id: string
  name: string
  description?: string | null
  price: number
  compareAtPrice?: number | null
  stock: number
  imageUrl?: string | null
  category?: {
    id: string
    name: string
  } | null
}

export interface ReviewType {
  id: string
  customerName?: string | null
  rating: number
  comment?: string | null
  createdAt: string | Date
}

interface ProductViewProps {
  product: ProductType
  relatedProducts: ProductType[]
  initialReviews: ReviewType[]
}

export function ProductView({ product, relatedProducts, initialReviews }: ProductViewProps) {
  const { formatPrice } = useCurrencyStore()
  const { t } = useLocaleStore()

  // 1. صور ومعرض المنتج
  const baseImage = product.imageUrl || "/uploads/1033fcf8-15f9-4d72-b18b-8eb5bf115e52.webp"
  
  // صور المعرض المتنوعة
  const galleryImages = [
    { label: "Main View", url: baseImage },
    { label: "Front Angle", url: "/uploads/0bfca58b-364e-44a4-b52d-bbdd4536e532.webp" },
    { label: "Detail View", url: "/uploads/aedb1697-1422-46c1-bd0d-2066b1131aff.jpg" },
    { label: "Side View", url: "/uploads/23f80e0c-10db-48ca-b86d-19f44a6cf090.jpg" },
  ]

  const [activeImage, setActiveImage] = useState<string>(baseImage)

  // 2. متغيرات الألوان (Color Variants) مع ربط كل لون بصورة مخصصة تتغير تلقائياً
  const COLOR_VARIANTS = [
    { 
      name: "Space Black", 
      hex: "#1f2022", 
      image: "/uploads/1033fcf8-15f9-4d72-b18b-8eb5bf115e52.webp" 
    },
    { 
      name: "Deep Purple", 
      hex: "#493f54", 
      image: "/uploads/0bfca58b-364e-44a4-b52d-bbdd4536e532.webp" 
    },
    { 
      name: "Silver", 
      hex: "#e2e4e1", 
      image: "/uploads/23f80e0c-10db-48ca-b86d-19f44a6cf090.jpg" 
    },
    { 
      name: "Gold", 
      hex: "#f4e8ce", 
      image: "/uploads/aedb1697-1422-46c1-bd0d-2066b1131aff.jpg" 
    },
  ]

  const [selectedColor, setSelectedColor] = useState(COLOR_VARIANTS[0].name)

  // 3. متغيرات السعة / المقاسات (Storage/Size Variants)
  const STORAGE_VARIANTS = [
    { label: "128 GB", priceDelta: 0 },
    { label: "256 GB", priceDelta: 99 },
    { label: "512 GB", priceDelta: 249 },
    { label: "1 TB", priceDelta: 399 },
  ]

  const [selectedStorage, setSelectedStorage] = useState(STORAGE_VARIANTS[0].label)

  // حساب السعر النهائي مع المقارنة بالسعر الأصلي الحقيقي من قاعدة البيانات
  const activeStorageDelta = STORAGE_VARIANTS.find(s => s.label === selectedStorage)?.priceDelta || 0
  const currentPrice = Number(product.price) + activeStorageDelta
  // استخدام compareAtPrice الحقيقي من قاعدة البيانات بدلاً من المضاعف الوهمي
  const originalPrice = product.compareAtPrice ? Number(product.compareAtPrice) + activeStorageDelta : null
  const hasDiscount = originalPrice !== null && originalPrice > currentPrice
  const discountPercent = hasDiscount && originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0

  // 4. آلية الزووم التفاعلي (Interactive Zoom Lens on Mouse Move)
  const [isHovering, setIsHovering] = useState(false)
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 })
  const imageContainerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return
    const rect = imageContainerRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))
    setZoomCoords({ x, y })
  }

  // اختيار اللون وتغيير الصورة تلقائياً
  const handleColorSelect = (variant: typeof COLOR_VARIANTS[0]) => {
    setSelectedColor(variant.name)
    setActiveImage(variant.image)
  }

  // 5. عربة التسوق والمفضلة
  const [quantity, setQuantity] = useState(1)
  const [isAdded, setIsAdded] = useState(false)
  const [isWishlisted, setIsWishlisted] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)

  const handleAddToCart = () => {
    addToCart({
      id: `${product.id}-${selectedColor}-${selectedStorage}`,
      productId: product.id,
      title: `${product.name} (${selectedColor}, ${selectedStorage})`,
      price: currentPrice,
      image: activeImage,
      quantity,
    })
    setIsAdded(true)
    toast.success("Added to your shopping cart!")
    setTimeout(() => setIsAdded(false), 2000)
  }

  // 6. التقييمات والمراجعات (5-Star Reviews & Form)
  const [reviews, setReviews] = useState<ReviewType[]>(initialReviews)
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews" | "shipping">("description")
  
  // نموذج إضافة مراجعة جديدة
  const [reviewerName, setReviewerName] = useState("")
  const [newRating, setNewRating] = useState(5)
  const [reviewerComment, setReviewerComment] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewerName.trim() || !reviewerComment.trim()) {
      toast.error("Please fill in your name and review comment")
      return
    }

    try {
      setIsSubmittingReview(true)
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          customerName: reviewerName.trim(),
          rating: newRating,
          comment: reviewerComment.trim(),
          status: "APPROVED",
        }),
      })

      const data = await res.json()
      if (data.success && data.review) {
        toast.success("Thank you! Your 5-star review has been published.")
        setReviews([data.review, ...reviews])
        setReviewerName("")
        setReviewerComment("")
        setNewRating(5)
      } else {
        toast.error(data.error || "Failed to submit review")
      }
    } catch (err) {
      toast.error("Network error while submitting review")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  // حساب متوسط التقييم
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "5.0"

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 1. مسار التنقل (Breadcrumbs) */}
      <nav className="flex items-center text-xs sm:text-sm text-gray-500 mb-6 flex-wrap gap-1">
        <Link href="/store" className="hover:text-gray-900 transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 mx-0.5 text-gray-400" />
        <Link href="/store/products" className="hover:text-gray-900 transition-colors">Products</Link>
        <ChevronRight className="w-3.5 h-3.5 mx-0.5 text-gray-400" />
        {product.category && (
          <>
            <span className="hover:text-gray-900 text-gray-600">{product.category.name}</span>
            <ChevronRight className="w-3.5 h-3.5 mx-0.5 text-gray-400" />
          </>
        )}
        <span className="text-gray-900 font-medium truncate max-w-[200px] sm:max-w-none">{product.name}</span>
      </nav>

      {/* زر العودة */}
      <Link 
        href="/store/products" 
        className="inline-flex items-center text-xs sm:text-sm font-medium text-[#ff2d55] hover:text-[#e6224c] mb-6 group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-0.5" /> Back to products
      </Link>

      {/* ========================================================= */}
      {/* 2. MAIN PRODUCT HERO (معرض الصور + تفاصيل المتغيرات)       */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start mb-16">
        
        {/* عمود المعرض (Image Gallery Column) - 6 أعمدة */}
        <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4">
          
          {/* شريط الصور المصغرة على اليسار (Vertical Thumbnails Strip on the Left) */}
          <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto sm:max-h-[460px] pb-2 sm:pb-0 shrink-0">
            {galleryImages.map((img, idx) => {
              const isSelected = activeImage === img.url
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(img.url)}
                  className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl overflow-hidden border p-1 bg-white transition-all cursor-pointer shrink-0 ${
                    isSelected 
                      ? "border-[#ff2d55] ring-2 ring-[#ff2d55]/30 shadow-xs" 
                      : "border-gray-200 hover:border-gray-300 opacity-80 hover:opacity-100"
                  }`}
                  title={img.label}
                >
                  <div
                    role="img"
                    aria-label={img.label}
                    className="w-full h-full bg-cover bg-center rounded-lg"
                    style={{ backgroundImage: `url("${img.url}")` }}
                  />
                </button>
              )
            })}
          </div>

          {/* الصورة الكبيرة الرئيسية متوسطة الحجم مع زووم تفاعلي بالماوس */}
          <div className="flex-1 flex justify-center">
            <div
              ref={imageContainerRef}
              onMouseMove={handleMouseMove}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              suppressHydrationWarning
              className="relative w-full max-w-[460px] aspect-square rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden flex items-center justify-center cursor-crosshair group"
            >
              {/* شارة توضيح الزووم */}
              <div className="absolute top-3 left-3 z-10 bg-white/80 backdrop-blur-xs text-gray-700 border border-gray-200/80 px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1 shadow-xs pointer-events-none opacity-90 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="w-3.5 h-3.5 text-[#ff2d55]" /> Hover to zoom
              </div>

              {/* شارة الخصم المميزة */}
              {discountPercent > 0 && (
                <div className="absolute top-3 right-3 z-10 bg-[#ff2d55] text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-xs">
                  -{discountPercent}% OFF
                </div>
              )}

              {/* الصورة مع تأثير الزووم المكبر عند موضع الماوس */}
              <div
                role="img"
                aria-label={product.name}
                suppressHydrationWarning
                style={{
                  backgroundImage: `url("${activeImage}")`,
                  transform: isHovering ? "scale(2.2)" : "scale(1)",
                  transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                  transition: isHovering ? "none" : "transform 0.3s cubic-bezier(0.2, 0, 0.2, 1)",
                }}
                className="w-full h-full bg-cover bg-center select-none pointer-events-none"
              />
            </div>
          </div>
        </div>

        {/* عمود بيانات المنتج والمتغيرات والشراء (Info & Variants Column) - 6 أعمدة */}
        <div className="lg:col-span-6 flex flex-col space-y-5">
          
          {/* العنوان ونجوم التقييم الخمسة */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight leading-snug">
              {product.name}
            </h1>

            {/* نجوم التقييم الخمسة مع عدد المراجعات */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <span className="text-xs font-bold text-gray-800">{avgRating}</span>
              <span className="text-xs text-gray-400">•</span>
              <button 
                onClick={() => setActiveTab("reviews")} 
                className="text-xs text-[#ff2d55] hover:underline font-medium"
              >
                ({reviews.length} customer reviews)
              </button>
            </div>
          </div>

          {/* السعر الحالي + السعر الحقيقي المخصوم منه + شارة التوفير */}
          <div className="p-4 rounded-xl bg-gray-50/80 border border-gray-200/70 space-y-2">
            <div className="flex items-baseline gap-3 flex-wrap">
              {/* السعر الحالي */}
              <span className="text-3xl font-extrabold text-[#ff2d55]">
                {formatPrice(currentPrice)}
              </span>

              {/* السعر الحقيقي الأصلي المشطوب (Strikethrough Price) - يظهر فقط إن وجد تخفيض حقيقي */}
              {hasDiscount && originalPrice && (
                <>
                  <span className="text-lg text-gray-400 line-through font-medium">
                    {formatPrice(originalPrice)}
                  </span>

                  {/* شارة التوفير المالي الحقيقية */}
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-emerald-200">
                    {t("common.save", "Save")} {formatPrice(originalPrice - currentPrice)} ({discountPercent}%)
                  </span>
                </>
              )}
            </div>

            {/* حالة التوفر في المخزن */}
            <div className="flex items-center gap-2 pt-1 text-xs">
              {product.stock > 0 ? (
                <>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="font-semibold text-emerald-700">In Stock</span>
                  <span className="text-gray-400">({product.stock} units available)</span>
                </>
              ) : (
                <span className="font-semibold text-rose-600">Out of Stock</span>
              )}
            </div>
          </div>

          {/* متغيرات الألوان (Colors) مع تغيير الصورة عند النقر */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-800">
                Color: <span className="text-[#ff2d55] font-normal">{selectedColor}</span>
              </span>
              <span className="text-gray-500">Clicking switches image</span>
            </div>
            <div className="flex items-center gap-3">
              {COLOR_VARIANTS.map((c) => {
                const isSelected = selectedColor === c.name
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => handleColorSelect(c)}
                    className={`relative w-9 h-9 rounded-full transition-all flex items-center justify-center cursor-pointer shadow-xs ${
                      isSelected 
                        ? "ring-2 ring-offset-2 ring-[#ff2d55] scale-105" 
                        : "hover:scale-105 border border-gray-300"
                    }`}
                    style={{ backgroundColor: c.hex }}
                    title={c.name}
                  >
                    {isSelected && (
                      <Check className={`w-4 h-4 ${c.name === "Silver" || c.name === "Gold" ? "text-gray-900" : "text-white"}`} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* متغيرات السعة / المقاسات (Storage / Sizes) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-gray-800">
                Storage: <span className="text-[#ff2d55] font-normal">{selectedStorage}</span>
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {STORAGE_VARIANTS.map((s) => {
                const isSelected = selectedStorage === s.label
                return (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => setSelectedStorage(s.label)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? "border-[#ff2d55] bg-[#ff2d55]/5 text-[#ff2d55] ring-1 ring-[#ff2d55]"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <span>{s.label}</span>
                    {s.priceDelta > 0 && (
                      <span className="text-[10px] text-gray-400 font-normal">+{formatPrice(s.priceDelta)}</span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* قسم زر أضف إلى السلة المصغر والأنيق (Compact Add-to-Cart & Quantity) */}
          <div className="pt-2 border-t border-gray-200 space-y-3">
            <div className="flex items-center gap-3">
              {/* محدد الكمية المدمج */}
              <div className="flex items-center border border-gray-200 rounded-lg bg-white h-10 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="px-2.5 h-full text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold text-gray-900">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="px-2.5 h-full text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors disabled:opacity-40"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* زر أضف إلى السلة المصغر كما طلب المستخدم تماماً */}
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`flex-1 h-10 px-5 rounded-lg font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer ${
                  isAdded
                    ? "bg-emerald-600 text-white"
                    : "bg-[#ff2d55] text-white hover:bg-[#e6224c] active:scale-[0.99]"
                }`}
              >
                {isAdded ? (
                  <>
                    <Check className="w-4 h-4" /> {t("common.success", "Added to Cart")}
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" /> {t("store.add_to_cart", "Add to Cart")} — {formatPrice(currentPrice * quantity)}
                  </>
                )}
              </button>

              {/* زر المفضلة */}
              <button
                type="button"
                onClick={() => {
                  setIsWishlisted(!isWishlisted)
                  toast.success(isWishlisted ? "Removed from wishlist" : "Saved to your wishlist!")
                }}
                className={`h-10 w-10 rounded-lg border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                  isWishlisted
                    ? "border-rose-200 bg-rose-50 text-[#ff2d55]"
                    : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
                }`}
                title="Add to Wishlist"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>

          {/* مزايا الضمان والتوصيل الموثوقة */}
          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2.5 text-xs text-gray-600">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-gray-900 leading-tight">1-Year Warranty</p>
                <p className="text-[11px] text-gray-400">Full manufacturer guarantee</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-gray-600">
              <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <p className="font-bold text-gray-900 leading-tight">Fast Express Delivery</p>
                <p className="text-[11px] text-gray-400">Arrives in 2-4 business days</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. DETAILED PRODUCT TABS (الوصف والمواصفات والتقييمات)     */}
      {/* ========================================================= */}
      <div className="mb-16">
        {/* التبويبات */}
        <div className="flex items-center border-b border-gray-200 space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("description")}
            className={`pb-3.5 text-sm font-bold transition-colors shrink-0 cursor-pointer ${
              activeTab === "description"
                ? "border-b-2 border-[#ff2d55] text-[#ff2d55]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Product Overview & Description
          </button>
          <button
            onClick={() => setActiveTab("specs")}
            className={`pb-3.5 text-sm font-bold transition-colors shrink-0 cursor-pointer ${
              activeTab === "specs"
                ? "border-b-2 border-[#ff2d55] text-[#ff2d55]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`pb-3.5 text-sm font-bold transition-colors shrink-0 cursor-pointer flex items-center gap-1.5 ${
              activeTab === "reviews"
                ? "border-b-2 border-[#ff2d55] text-[#ff2d55]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Customer Reviews ({reviews.length})
          </button>
          <button
            onClick={() => setActiveTab("shipping")}
            className={`pb-3.5 text-sm font-bold transition-colors shrink-0 cursor-pointer ${
              activeTab === "shipping"
                ? "border-b-2 border-[#ff2d55] text-[#ff2d55]"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Shipping & Return Policy
          </button>
        </div>

        {/* محتوى التبويبات */}
        <div className="py-6">
          {/* 1. تبويب الوصف (Description Tab) */}
          {activeTab === "description" && (
            <div className="space-y-6">
              {/* مميزات سريعة (Feature Highlights) */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <Cpu className="w-5 h-5 text-[#ff2d55] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">A16 Bionic Chip</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Ultra-fast performance and advanced energy efficiency.</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-[#ff2d55] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Dynamic Island</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Magical new way to interact with alerts and live activities.</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <Layers className="w-5 h-5 text-[#ff2d55] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">48MP Pro Camera</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Quad-pixel sensor capturing 4x higher resolution photos.</p>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                  <Battery className="w-5 h-5 text-[#ff2d55] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">All-Day Battery</h4>
                    <p className="text-[11px] text-gray-500 mt-0.5">Up to 29 hours video playback on a single charge.</p>
                  </div>
                </div>
              </div>

              {/* محتوى الوصف الأصلي المكتوب للمنتج */}
              <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed">
                {product.description ? (
                  <div dangerouslySetInnerHTML={{ __html: product.description }} />
                ) : (
                  <p>Experience unmatched smartphone power with pro-grade cameras and stunning Super Retina XDR display.</p>
                )}
              </div>
            </div>
          )}

          {/* 2. تبويب المواصفات التقنية (Specifications Tab) */}
          {activeTab === "specs" && (
            <div className="max-w-2xl">
              <table className="w-full text-xs text-left border-collapse">
                <tbody>
                  {[
                    { spec: "Display", val: "6.7-inch Super Retina XDR OLED display with ProMotion 120Hz" },
                    { spec: "Resolution", val: "2796-by-1290-pixel resolution at 460 ppi" },
                    { spec: "Processor", val: "Apple A16 Bionic chip (6-core CPU, 5-core GPU)" },
                    { spec: "Rear Camera", val: "Pro camera system: 48MP Main, 12MP Ultra Wide, 12MP 3x Telephoto" },
                    { spec: "Front Camera", val: "12MP TrueDepth front camera with autofocus" },
                    { spec: "Video Recording", val: "4K video recording at 24 fps, 25 fps, 30 fps, or 60 fps" },
                    { spec: "Water Resistance", val: "Rated IP68 (maximum depth of 6 meters up to 30 minutes)" },
                    { spec: "OS Version", val: "iOS 17 with Dynamic Island and StandBy Mode" },
                  ].map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50/70" : "bg-white"}>
                      <td className="py-2.5 px-4 font-bold text-gray-800 w-1/3 border-b border-gray-100">{row.spec}</td>
                      <td className="py-2.5 px-4 text-gray-600 border-b border-gray-100">{row.val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. تبويب التقييمات والمراجعات الخمس نجوم (Reviews Tab) */}
          {activeTab === "reviews" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* عمود إحصائيات التقييم + نموذج إضافة تقييم (5 أعمدة) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* ملخص التقييم */}
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-200/80 text-center space-y-2">
                  <div className="text-4xl font-extrabold text-gray-900">{avgRating}</div>
                  <div className="flex items-center justify-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-5 h-5 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">Based on {reviews.length} customer reviews</p>
                </div>

                {/* نموذج كتابة تقييم جديد */}
                <form onSubmit={handleSubmitReview} className="p-5 rounded-2xl border border-gray-200 bg-white space-y-3.5 shadow-2xs">
                  <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-[#ff2d55]" /> Write a Review
                  </h4>

                  {/* اختيار النجوم التفاعلي */}
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Your Rating</label>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setNewRating(s)}
                          className="p-1 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              s <= newRating
                                ? "fill-amber-500 text-amber-500"
                                : "text-gray-300 hover:text-amber-300"
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-amber-600 ml-2">{newRating} Stars</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. David Wilson"
                      value={reviewerName}
                      onChange={(e) => setReviewerName(e.target.value)}
                      className="w-full h-9 px-3 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff2d55]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700">Your Feedback</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="What did you like about this product?"
                      value={reviewerComment}
                      onChange={(e) => setReviewerComment(e.target.value)}
                      className="w-full p-2.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#ff2d55] resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full h-9 bg-[#ff2d55] text-white hover:bg-[#e6224c] rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                  >
                    {isSubmittingReview ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" /> Submit Review
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* عمود عرض المراجعات المكتوبة (7 أعمدة) */}
              <div className="lg:col-span-7 space-y-4">
                {reviews.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 border border-dashed rounded-2xl">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">Be the first to review this product!</p>
                  </div>
                ) : (
                  reviews.map((r, i) => {
                    const displayName = r.customerName || "Customer"
                    return (
                      <div key={r.id || i} className="p-4 rounded-xl border border-gray-100 bg-white shadow-2xs space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-700 font-bold text-xs flex items-center justify-center">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-gray-900">{displayName}</span>
                              <span className="ml-1.5 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-semibold">
                                Verified Purchase
                              </span>
                            </div>
                          </div>
                          <span className="text-[11px] text-gray-400 font-mono">
                            {new Date(r.createdAt).toISOString().split("T")[0]}
                          </span>
                        </div>

                      {/* النجوم الخمس */}
                      <div className="flex items-center text-amber-500">
                        {Array.from({ length: 5 }).map((_, s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s < r.rating ? "fill-amber-500 text-amber-500" : "text-gray-200"
                            }`}
                          />
                        ))}
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed">
                        {r.comment}
                      </p>
                    </div>
                  )
                })
              )}
              </div>

            </div>
          )}

          {/* 4. تبويب الشحن والضمان (Shipping & Returns Tab) */}
          {activeTab === "shipping" && (
            <div className="max-w-2xl space-y-4 text-xs text-gray-600 leading-relaxed">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#ff2d55]" /> Express Shipping
                </h4>
                <p>We provide fast and tracked express shipping worldwide. Domestic orders are delivered in 2 to 4 business days.</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                  <RotateCcw className="w-4 h-4 text-[#ff2d55]" /> 30-Day Money-Back Guarantee
                </h4>
                <p>If you're not completely satisfied with your purchase, return it in its original packaging within 30 days for a full refund.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. CROSS-SELLING & UP-SELLING (منتجات ذات صلة ومقترحات)   */}
      {/* ========================================================= */}
      {relatedProducts.length > 0 && (
        <div className="pt-10 border-t border-gray-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Frequently Bought Together
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Customers who viewed this item also bought these accessories
              </p>
            </div>
            <Link 
              href="/store/products" 
              className="text-xs font-bold text-[#ff2d55] hover:underline"
            >
              View All Products
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map((rel) => (
              <div
                key={rel.id}
                className="group bg-white rounded-xl border border-gray-200/80 p-3.5 flex flex-col justify-between hover:shadow-md hover:border-gray-300 transition-all"
              >
                <Link href={`/store/products/${rel.id}`} className="block overflow-hidden rounded-lg aspect-square mb-3 bg-gray-50">
                  <div
                    role="img"
                    aria-label={rel.name}
                    suppressHydrationWarning
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                    style={{
                      backgroundImage: `url("${rel.imageUrl || `https://picsum.photos/seed/${rel.id}/400/400`}")`,
                    }}
                  />
                </Link>

                <div className="space-y-1">
                  <Link href={`/store/products/${rel.id}`} className="block text-xs font-bold text-gray-900 line-clamp-1 hover:text-[#ff2d55]">
                    {rel.name}
                  </Link>
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-3 h-3 fill-amber-500 text-amber-500" />
                    ))}
                  </div>
                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="text-sm font-extrabold text-[#ff2d55]">
                      {formatPrice(rel.price)}
                    </span>
                    <span className="text-[11px] text-gray-400 line-through">
                      {formatPrice(rel.price * 1.25)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    addToCart({
                      id: rel.id,
                      title: rel.name,
                      price: rel.price,
                      image: rel.imageUrl || `https://picsum.photos/seed/${rel.id}/400/400`,
                      quantity: 1,
                    })
                    toast.success(`Added ${rel.name} to cart!`)
                  }}
                  className="mt-3 w-full py-1.5 px-3 rounded-lg text-xs font-semibold border border-[#ff2d55]/30 text-[#ff2d55] bg-[#ff2d55]/5 hover:bg-[#ff2d55] hover:text-white transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <ShoppingCart className="w-3 h-3" /> Quick Add
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
