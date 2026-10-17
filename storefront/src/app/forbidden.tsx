import Link from "next/link"
import { ShieldAlert, LogIn, Home } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Forbidden() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full text-center space-y-6 bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-xl">
        {/* Shield Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center border border-destructive/20 shadow-sm">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-destructive/15 text-destructive">
            Error 403 · ممنوع الوصول
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            تم رفض الوصول · Access Forbidden
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            ليس لديك الصلاحيات الكافية لعرض هذه الصفحة أو المورد. يرجى تسجيل الدخول بحساب يمتلك امتيازات الإدارة.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Link 
            href="/store/login"
            className={cn(buttonVariants({ size: "default" }), "w-full sm:w-auto gap-2 shadow-sm")}
          >
            <LogIn className="w-4 h-4" />
            <span>تسجيل الدخول · Login</span>
          </Link>

          <Link 
            href="/"
            className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full sm:w-auto gap-2")}
          >
            <Home className="w-4 h-4" />
            <span>الصفحة الرئيسية · Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
