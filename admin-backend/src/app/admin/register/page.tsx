"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  UserPlus, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  Image as ImageIcon, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle, 
  ShieldCheck, 
  Store,
  Check
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { registerAdminAction } from "@/app/actions/auth"

export default function AdminRegisterPage() {
  const router = useRouter()

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("حجم الصورة كبير جداً. يرجى اختيار صورة أقل من 5 ميغابايت.")
        return
      }
      setError(null)
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("كلمات المرور غير متطابقة.")
      return
    }

    if (password.length < 8) {
      setError("كلمة المرور يجب ألا تقل عن 8 أحرف لضمان أمان حساب الإدارة.")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      if (phone) formData.append("phone", phone)
      formData.append("password", password)
      formData.append("confirmPassword", confirmPassword)
      if (avatar) formData.append("avatar", avatar)

      const result = await registerAdminAction(formData)

      if (!result.success) {
        setError(result.error || "فشل إنشاء الحساب.")
        setLoading(false)
      } else {
        router.push("/admin/login?registered=true")
      }
    } catch (err: any) {
      console.error("Register form submission error:", err)
      setError(err?.message || "حدث خطأ غير متوقع أثناء إرسال البيانات.")
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-slate-950 text-slate-100 font-sans antialiased relative overflow-hidden">
      {/* Visual background lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 mx-auto">
            <Store className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            إنشاء حساب مسؤول جديد
          </h2>
          <p className="text-sm text-slate-400">
            تسجيل مدير جديد في لوحة تحكم متجر Smomo
          </p>
        </div>

        <div className="mt-8 bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {/* Security Banner */}
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-400 mb-6">
            <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            <span>تشفير كلمات المرور عبر Bcrypt وتفعيل سياسات الأمان الصارمة</span>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-rose-950/40 border border-rose-900/50 rounded-xl text-rose-300 text-xs leading-relaxed">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
            {/* Avatar Upload */}
            <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-950/40 border border-slate-800">
              <div className="relative w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-6 h-6 text-slate-400" />
                )}
              </div>
              <div className="flex-1 space-y-1">
                <label className="block text-xs font-semibold text-slate-300 cursor-pointer">
                  صورة الملف الشخصي (اختياري)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                الاسم الكامل
              </label>
              <div className="relative">
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="محمد علي"
                  required
                  disabled={loading}
                  className="bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-600 pl-10 pr-3 h-10 text-right focus-visible:ring-primary focus-visible:border-primary"
                />
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@smomo.shop"
                  required
                  disabled={loading}
                  className="bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-600 pl-10 pr-3 h-10 text-left focus-visible:ring-primary focus-visible:border-primary"
                  dir="ltr"
                />
                <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                رقم الهاتف (اختياري)
              </label>
              <div className="relative">
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+212 600-000000"
                  disabled={loading}
                  className="bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-600 pl-10 pr-3 h-10 text-left focus-visible:ring-primary focus-visible:border-primary"
                  dir="ltr"
                />
                <Phone className="absolute left-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                كلمة المرور (8 أحرف كحد أدنى)
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-600 pl-10 pr-3 h-10 text-left focus-visible:ring-primary focus-visible:border-primary"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-3 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                تأكيد كلمة المرور
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="bg-slate-950/70 border-slate-800 text-white placeholder:text-slate-600 pl-10 pr-3 h-10 text-left focus-visible:ring-primary focus-visible:border-primary"
                  dir="ltr"
                />
                <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500 pointer-events-none" />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 text-sm font-semibold shadow-md bg-primary hover:bg-primary/90 text-primary-foreground gap-2 cursor-pointer transition-all mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري إنشاء الحساب المشفر...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>تأكيد إنشاء الحساب الإداري</span>
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800/80 text-center text-xs text-slate-400">
            <span>لديك حساب بالفعل؟ </span>
            <Link 
              href="/admin/login" 
              className="font-semibold text-primary hover:underline hover:text-primary/90 transition-colors"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
