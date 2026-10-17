import Link from "next/link"
import { ShieldAlert, LogIn, ArrowLeft } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function AdminUnauthorizedPage() {
  return (
    <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
      <div className="max-w-md w-full text-center space-y-6 bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-sm">
        <div className="mx-auto w-20 h-20 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20 shadow-xs">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-destructive/15 text-destructive">
            Admin Security · 403 Forbidden
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            غير مصرح بالدخول للوحة التحكم
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            حسابك الحالي لا يمتلك صلاحيات مدير النظام (Admin) للوصول إلى هذا القسم. يرجى تسجيل الدخول بحساب مسؤول.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Link 
            href="/admin/login?callbackUrl=/admin"
            className={cn(buttonVariants({ size: "default" }), "w-full sm:w-auto gap-2 shadow-xs")}
          >
            <LogIn className="w-4 h-4" />
            <span>تسجيل دخول المسؤول · Admin Login</span>
          </Link>

          <a 
            href="http://localhost:3001/store"
            className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full sm:w-auto gap-2")}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>متجر الزبائن · Storefront</span>
          </a>
        </div>
      </div>
    </div>
  )
}
