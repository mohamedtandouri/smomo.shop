import Link from "next/link"
import { Lock, LogIn, UserPlus, Home } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Unauthorized() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-md w-full text-center space-y-6 bg-card border border-border rounded-3xl p-8 sm:p-10 shadow-xl">
        {/* Lock Icon */}
        <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20 shadow-sm">
          <Lock className="w-10 h-10" />
        </div>

        {/* Headings */}
        <div className="space-y-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary">
            Error 401 · تسجيل الدخول مطلوب
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            يرجى تسجيل الدخول للمتابعة
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            تحتاج إلى تسجيل الدخول لحسابك للوصول إلى هذه الصفحة أو إدارة طلباتك ومشترياتك.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
          <Link 
            href="/store/login"
            className={cn(buttonVariants({ size: "default" }), "w-full sm:w-auto gap-2 shadow-sm")}
          >
            <LogIn className="w-4 h-4" />
            <span>تسجيل الدخول · Sign In</span>
          </Link>

          <Link 
            href="/store/register"
            className={cn(buttonVariants({ variant: "outline", size: "default" }), "w-full sm:w-auto gap-2")}
          >
            <UserPlus className="w-4 h-4" />
            <span>حساب جديد · Register</span>
          </Link>
        </div>

        <div className="pt-4 border-t border-border">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>العودة للصفحة الرئيسية · Home</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
