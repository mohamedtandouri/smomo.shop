"use client"

import { useState, useEffect, Suspense } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { 
  Shield, 
  ShieldAlert, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Store 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { authenticateAdminAction, getClientSecurityStatus } from "@/app/actions/auth"

function AdminLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/admin"
  const registered = searchParams.get("registered")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkingSecurity, setCheckingSecurity] = useState(true)

  // حالات الأمان
  const [isBlocked, setIsBlocked] = useState(false)
  const [isCoolingDown, setIsCoolingDown] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // فحص أمني عند تحميل الصفحة
  useEffect(() => {
    async function checkSecurity() {
      try {
        const res = await getClientSecurityStatus()
        if (res.isBlocked) {
          setIsBlocked(true)
          setErrorMessage(res.message || "تم حظر هذا الجهاز لأسباب أمنية.")
        } else if (res.isCoolingDown) {
          setIsCoolingDown(true)
          setCooldownRemaining(res.remainingSeconds)
          setErrorMessage(res.message || "لقد استنفدت محاولات الدخول، يرجى الانتظار 5 دقائق.")
        }
      } catch (err) {
        console.error("Security check failed:", err)
      } finally {
        setCheckingSecurity(false)
      }
    }
    checkSecurity()
  }, [])

  // مؤقت التنازلي لفترة التبريد (Cool-down Timer)
  useEffect(() => {
    if (cooldownRemaining <= 0) {
      if (isCoolingDown) {
        setIsCoolingDown(false)
        setErrorMessage(null)
      }
      return
    }

    const timer = setInterval(() => {
      setCooldownRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setIsCoolingDown(false)
          setErrorMessage(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [cooldownRemaining, isCoolingDown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMessage("يرجى إدخال البريد الإلكتروني وكلمة المرور.")
      return
    }

    setErrorMessage(null)
    setLoading(true)

    try {
      // 1. فحص الحماية من التخمين والتحقق من صلاحيات المدير عبر Server Action
      const authResult = await authenticateAdminAction({ email, password })

      if (!authResult.success) {
        if (authResult.isBlocked) {
          setIsBlocked(true)
          setErrorMessage(authResult.error || "تم حظر جهازك نهائياً لمحاولات دخول متكررة غير مصرح بها.")
        } else if (authResult.isCoolingDown) {
          setIsCoolingDown(true)
          setCooldownRemaining(authResult.remainingSeconds || 300)
          setErrorMessage(authResult.error || "لقد استنفدت محاولاتك، يرجى الانتظار 5 دقائق.")
        } else {
          setErrorMessage(authResult.error || "بيانات الدخول غير صحيحة.")
        }
        setLoading(false)
        return
      }

      // 2. إنشاء الجلسة الرسمية عبر NextAuth
      const signInRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (signInRes?.error) {
        setErrorMessage(signInRes.error)
        setLoading(false)
      } else {
        // انتقال سلس للوحة التحكم
        window.location.href = callbackUrl
      }
    } catch (err: any) {
      setErrorMessage("حدث خطأ غير متوقع أثناء المعالجة.")
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  // إذا كان الجهاز محظوراً بالكامل
  if (isBlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 font-sans">
        <div className="max-w-md w-full bg-slate-900 border border-rose-900/60 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-20 h-20 rounded-2xl bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center justify-center mx-auto shadow-inner">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/15 text-rose-400">
              Security Lockout · حظر أمني
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              تم حظر الوصول إلى لوحة التحكم
            </h1>
            <p className="text-sm text-slate-400 leading-relaxed">
              تم رصد محاولات دخول متكررة فاشلة من هذا الجهاز. تم قفل الوصول تماماً وتدوين بيانات الاتصال في سجلات الأمان (Security Logs).
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-500 font-mono">
            Error Code: SEC_IP_PERM_BAN · Brute-Force Shield Active
          </div>
          <p className="text-xs text-slate-500">
            إذا كنت مالك النظام الشرعي، يرجى فك الحظر يدوياً من قاعدة البيانات أو التواصل مع مسؤول البنية التحتية.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 font-sans antialiased relative overflow-hidden">
      {/* Background visual gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 mx-auto">
            <Store className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            لوحة تحكم التاجر · Seller Area
          </h2>
          <p className="text-sm text-slate-400">
            تسجيل دخول آمن لإدارة المتجر والطلبات
          </p>
        </div>

        <div className="mt-8 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Security Badge */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 mb-6">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>نظام الحماية ضد التخمين نشط</span>
            </div>
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-semibold">
              Protected
            </span>
          </div>

          {registered && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-950/40 border border-emerald-800/50 rounded-xl text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>تم إنشاء حساب المسؤول بنجاح! يمكنك الآن تسجيل الدخول.</span>
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-rose-950/40 border border-rose-900/50 rounded-xl text-rose-300 text-xs leading-relaxed">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">{errorMessage}</div>
            </div>
          )}

          {isCoolingDown ? (
            /* Cooldown Warning Screen */
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center mx-auto animate-pulse">
                <Clock className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">الحساب مقفل مؤقتاً</h3>
                <p className="text-xs text-slate-400">
                  تم إيقاف محاولات الدخول لمدة 5 دقائق بعد 3 إخفاقات متتالية.
                </p>
              </div>
              <div className="text-3xl font-mono font-bold text-amber-400 tracking-wider">
                {formatTime(cooldownRemaining)}
              </div>
              <p className="text-[11px] text-slate-500">
                سيتم إعادة إتاحة النموذج تلقائياً عند انتهاء المؤقت.
              </p>
            </div>
          ) : (
            /* Login Form */
            <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  البريد الإلكتروني للإدارة
                </label>
                <div className="relative">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@smomo.shop"
                    disabled={loading || checkingSecurity}
                    required
                    className="bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-600 pl-10 pr-3 h-11 text-left focus-visible:ring-primary focus-visible:border-primary"
                    dir="ltr"
                  />
                  <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    كلمة المرور
                  </label>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading || checkingSecurity}
                    required
                    className="bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-600 pl-10 pr-3 h-11 text-left focus-visible:ring-primary focus-visible:border-primary"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || checkingSecurity}
                className="w-full h-11 text-sm font-semibold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground gap-2 cursor-pointer transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق الآمن...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>دخول لوحة التحكم</span>
                  </>
                )}
              </Button>
            </form>
          )}

          {/* Registration Link */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
            <span>ليس لديك حساب مسؤول؟ </span>
            <Link 
              href="/admin/register" 
              className="font-semibold text-primary hover:underline hover:text-primary/90 transition-colors"
            >
              إنشاء حساب جديد
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
      <AdminLoginForm />
    </Suspense>
  )
}
