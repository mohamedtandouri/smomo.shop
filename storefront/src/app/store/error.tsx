"use client"

import { useEffect, useState } from "react"
import { AlertCircle, RefreshCw, ShoppingBag, MessageSquare, ChevronDown, ChevronUp } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    console.error("Storefront Error Caught:", error)
  }, [error])

  return (
    <div className="container mx-auto px-4 py-16 sm:py-24">
      <div className="max-w-lg mx-auto text-center space-y-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-lg">
        {/* Error Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200 dark:border-amber-900/40">
          <AlertCircle className="w-10 h-10" />
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300">
            تنبيه في المتجر · Store Notice
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            عذراً، حدث خطأ أثناء تصفح المتجر
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            واجهنا مشكلة بسيطة أثناء تحميل هذه الصفحة. طلباتك ومحتويات سلتك محفوظة بأمان.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Button 
            onClick={() => reset()} 
            size="lg" 
            className="gap-2 text-white shadow-md cursor-pointer"
            style={{ backgroundColor: "var(--store-primary, #ff2d55)" }}
          >
            <RefreshCw className="w-4 h-4" />
            <span>إعادة المحاولة · Try Again</span>
          </Button>

          <Link 
            href="/store/products"
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2")}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>تصفح المنتجات · Products</span>
          </Link>

          <Link 
            href="/store/contact"
            className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "gap-2")}
          >
            <MessageSquare className="w-4 h-4" />
            <span>الدعم الفني · Support</span>
          </Link>
        </div>

        {/* Diagnostic Accordion */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-left">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center justify-between w-full text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium py-1 transition-colors cursor-pointer"
          >
            <span>تفاصيل فنية (Diagnostic details)</span>
            {showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showDetails && (
            <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-500 dark:text-slate-400 space-y-1 overflow-x-auto text-left break-all">
              {error?.digest && (
                <div>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Digest: </span>
                  {error.digest}
                </div>
              )}
              <div>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Message: </span>
                {error?.message || "Internal error occurred."}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
