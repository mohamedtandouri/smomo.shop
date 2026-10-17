"use client"

import Link from "next/link"
import { Home, ArrowLeft, Search, CornerUpLeft } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function RootNotFound() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-2xl text-center space-y-8">
        {/* Visual Badge / Icon */}
        <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl animate-pulse" />
          <div className="relative w-28 h-28 rounded-3xl bg-muted/60 border border-border flex flex-col items-center justify-center shadow-lg backdrop-blur-sm">
            <span className="text-4xl font-extrabold tracking-tight text-primary">404</span>
            <Search className="w-6 h-6 text-muted-foreground mt-1" />
          </div>
        </div>

        {/* Headings */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            الصفحة غير موجودة · Page Not Found
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            عذراً، لم نتمكن من العثور على الصفحة التي تبحث عنها. قد يكون الرابط غير صحيح أو تم نقل الصفحة.
          </p>
          <p className="text-xs text-muted-foreground/80">
            The requested URL could not be found on this server. It might have been removed or temporarily unavailable.
          </p>
        </div>

        {/* Action Navigation Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link 
            href="/admin"
            className={cn(buttonVariants({ size: "lg" }), "gap-2 shadow-md")}
          >
            <Home className="w-4 h-4" />
            <span>لوحة التحكم · Dashboard</span>
          </Link>

          <button
            type="button"
            onClick={() => window.history.back()}
            className={cn(buttonVariants({ variant: "outline", size: "lg" }), "gap-2 cursor-pointer")}
          >
            <CornerUpLeft className="w-4 h-4" />
            <span>الرجوع للخلف · Go Back</span>
          </button>
        </div>

        {/* Helpful Popular Links */}
        <div className="pt-6 border-t border-border/60">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            روابط مقترحة · Quick Links
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <Link 
              href="/admin/products" 
              className="px-3.5 py-1.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/50"
            >
              📦 إدارة المنتجات (Products)
            </Link>
            <Link 
              href="/admin/orders" 
              className="px-3.5 py-1.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/50"
            >
              📋 إدارة الطلبات (Orders)
            </Link>
            <a 
              href="http://localhost:3001/store" 
              className="px-3.5 py-1.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/50"
            >
              🛍️ متجر الزبائن (Storefront)
            </a>
            <Link 
              href="/admin/settings" 
              className="px-3.5 py-1.5 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-border/50"
            >
              ⚙️ الإعدادات (Settings)
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
