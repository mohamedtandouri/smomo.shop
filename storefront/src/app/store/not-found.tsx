import Link from "next/link"
import { PackageX, ShoppingBag, ShoppingCart, ArrowLeft, Sparkles } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function StoreNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <div className="max-w-xl mx-auto text-center space-y-8">
        {/* Visual Icon */}
        <div className="relative mx-auto w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[var(--store-primary,#ff2d55)]/10 blur-xl animate-pulse" />
          <div className="relative w-full h-full rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-md">
            <PackageX className="w-12 h-12 text-[var(--store-primary,#ff2d55)]" />
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-[var(--store-primary,#ff2d55)] border border-rose-200 dark:border-rose-900/50">
            <Sparkles className="w-3.5 h-3.5" />
            <span>عفواً، لم نجد ما تبحث عنه</span>
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            المنتج أو الصفحة غير متوفرة
          </h1>
          <p className="text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            قد يكون هذا المنتج قد نفد من المخزون، أو تم تغيير اسمه ورابطه، أو أن الرابط المطلوب غير صحيح.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            The item or page you requested could not be located in our store catalog.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link 
            href="/store/products"
            className={cn(buttonVariants({ size: "lg" }), "gap-2 text-white shadow-md hover:opacity-95 transition-opacity")}
            style={{ backgroundColor: "var(--store-primary, #ff2d55)" }}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>تصفح المنتجات · Browse Products</span>
          </Link>

          <Link 
            href="/store/cart"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>عربة التسوق · Cart</span>
          </Link>

          <Link 
            href="/store"
            className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "gap-2")}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>رئيسية المتجر · Store Home</span>
          </Link>
        </div>

        {/* Recommendations / Popular Links */}
        <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
            أقسام مقترحة للتسوق · Popular Store Sections
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link 
              href="/store/categories" 
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors font-medium"
            >
              🏷️ جميع التصنيفات (All Categories)
            </Link>
            <Link 
              href="/store/products" 
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors font-medium"
            >
              🔥 المنتجات المميزة (Featured Products)
            </Link>
            <Link 
              href="/store/contact" 
              className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors font-medium"
            >
              💬 مساعدة وتواصل (Customer Support)
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
