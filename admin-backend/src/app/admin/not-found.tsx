import Link from "next/link"
import { FileQuestion, LayoutDashboard, Package, ShoppingCart, Settings, ArrowLeft } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AdminNotFound() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
      <div className="max-w-xl w-full text-center space-y-6 bg-card border border-border rounded-3xl p-8 sm:p-12 shadow-sm">
        {/* Visual Badge */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground shadow-xs">
          <FileQuestion className="w-10 h-10 text-primary" />
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-muted text-foreground border border-border">
            <span>Admin Error 404</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            العنصر الإداري غير موجود · Resource Not Found
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            لم يتم العثور على السجل المطلوب (المنتج، الطلب، أو الصفحة الإدارية) في قاعدة البيانات. قد يكون قد تم حذفه مسبقاً.
          </p>
          <p className="text-xs text-muted-foreground/80">
            The requested admin item, record, or URL could not be located.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link 
            href="/admin"
            className={cn(buttonVariants({ size: "default" }), "gap-2 shadow-xs")}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>لوحة التحكم · Overview</span>
          </Link>

          <Link 
            href="/admin/products"
            className={cn(buttonVariants({ variant: "outline", size: "default" }), "gap-2")}
          >
            <Package className="w-4 h-4" />
            <span>المنتجات · Products</span>
          </Link>

          <Link 
            href="/admin/orders"
            className={cn(buttonVariants({ variant: "outline", size: "default" }), "gap-2")}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>الطلبات · Orders</span>
          </Link>
        </div>

        {/* Fast shortcuts row */}
        <div className="pt-6 border-t border-border flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <Link href="/admin/settings" className="hover:text-foreground inline-flex items-center gap-1 transition-colors">
            <Settings className="w-3.5 h-3.5" />
            <span>إعدادات المتجر · Settings</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
