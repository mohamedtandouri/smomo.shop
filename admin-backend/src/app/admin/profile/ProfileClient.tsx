"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { 
  User, 
  Mail, 
  Phone, 
  Shield, 
  Key, 
  Lock, 
  Camera, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  History, 
  Activity, 
  Ban, 
  Calendar 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateAdminProfileAction } from "@/app/actions/auth"
import { toast } from "sonner"

interface ProfileClientProps {
  data: {
    user: {
      id: string
      name: string
      email: string
      phone: string | null
      role: string
      status: string
      imageUrl: string | null
      createdAt: Date
      updatedAt: Date
    }
    profile: any
    securityLogs: any[]
    totalBlockedIps: number
  }
}

export default function ProfileClient({ data }: ProfileClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"info" | "security" | "logs">("info")

  // بيانات النموذج
  const [name, setName] = useState(data.user.name)
  const [phone, setPhone] = useState(data.user.phone || "")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [avatar, setAvatar] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(data.user.imageUrl)

  const [saving, setSaving] = useState(false)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatar(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword && newPassword !== confirmPassword) {
      toast.error("كلمة المرور الجديدة وتأكيدها غير متطابقين.")
      return
    }

    setSaving(true)

    try {
      const formData = new FormData()
      formData.append("userId", data.user.id)
      formData.append("name", name)
      if (phone) formData.append("phone", phone)
      if (avatar) formData.append("avatar", avatar)
      if (currentPassword && newPassword) {
        formData.append("currentPassword", currentPassword)
        formData.append("newPassword", newPassword)
      }

      const res = await updateAdminProfileAction(formData)

      if (res.success) {
        toast.success("تم تحديث بيانات الملف الشخصي بنجاح!")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        router.refresh()
      } else {
        toast.error(res.error || "فشل تحديث البيانات.")
      }
    } catch (err) {
      toast.error("حدث خطأ غير متوقع أثناء الحفظ.")
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("ar-EG", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 max-w-6xl mx-auto font-sans" dir="rtl">
      {/* Header Profile Card */}
      <div className="relative overflow-hidden rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 left-0 h-28 bg-gradient-to-l from-primary/20 via-primary/5 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-6 pt-4">
          {/* Avatar with upload trigger */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-muted border-2 border-primary/20 shadow-md flex items-center justify-center overflow-hidden">
              {avatarPreview ? (
                <img src={avatarPreview} alt={name} className="w-full h-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 text-white rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="w-6 h-6" />
              <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </label>
          </div>

          {/* User Info & Badges */}
          <div className="flex-1 text-center sm:text-right space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                {name}
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                <Shield className="w-3.5 h-3.5" />
                <span>{data.user.role === "ADMIN" ? "مسؤول النظام (Admin)" : data.user.role}</span>
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{data.user.status}</span>
              </span>
            </div>

            <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-2">
              <Mail className="w-4 h-4 text-muted-foreground/70" />
              <span dir="ltr">{data.user.email}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-muted-foreground pt-1">
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>تاريخ الانضمام: {formatDate(data.user.createdAt)}</span>
              </span>
              <span>•</span>
              <span className="inline-flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span>الأجهزة المحظورة في النظام: {data.totalBlockedIps}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "info"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <User className="w-4 h-4" />
          <span>البيانات الأساسية</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "security"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <Key className="w-4 h-4" />
          <span>كلمة المرور والأمان</span>
        </button>

        <button
          onClick={() => setActiveTab("logs")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "logs"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          <History className="w-4 h-4" />
          <span>سجلات الأمان والأنشطة</span>
        </button>
      </div>

      {/* Tab 1: Personal Info */}
      {activeTab === "info" && (
        <form onSubmit={handleSave} className="space-y-6 bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">تعديل البيانات الأساسية</h2>
            <p className="text-xs text-muted-foreground">
              تنعكس هذه البيانات تلقائياً في شريط لوحة التحكم العلوي وملف الحساب الإداري.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                اسم المسؤول الكامل
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                البريد الإلكتروني (مؤمّن)
              </label>
              <Input
                type="email"
                value={data.user.email}
                disabled
                className="h-10 bg-muted/60 cursor-not-allowed opacity-80"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                رقم الهاتف
              </label>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+212 600-000000"
                className="h-10"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                صلاحية الحساب
              </label>
              <Input
                type="text"
                value={data.user.role}
                disabled
                className="h-10 bg-muted/60 cursor-not-allowed opacity-80"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={saving} className="gap-2 shadow-xs cursor-pointer">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>حفظ التعديلات</span>
            </Button>
          </div>
        </form>
      )}

      {/* Tab 2: Security & Password */}
      {activeTab === "security" && (
        <form onSubmit={handleSave} className="space-y-6 bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-foreground">تغيير كلمة المرور</h2>
            <p className="text-xs text-muted-foreground">
              تأكد من اختيار كلمة مرور قوية تتكون من 8 أحرف على الأقل لحماية لوحة التحكم.
            </p>
          </div>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                كلمة المرور الحالية
              </label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                كلمة المرور الجديدة
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-2">
                تأكيد كلمة المرور الجديدة
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="h-10"
                dir="ltr"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button 
              type="submit" 
              disabled={saving || !currentPassword || !newPassword} 
              className="gap-2 shadow-xs cursor-pointer"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              <span>تحديث كلمة المرور المشفرة</span>
            </Button>
          </div>
        </form>
      )}

      {/* Tab 3: Security Logs & Audit */}
      {activeTab === "logs" && (
        <div className="space-y-6">
          {/* Security Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold">حماية التخمين (Rate Limit)</span>
                <Shield className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">3 محاولات</p>
              <p className="text-xs text-muted-foreground">تبريد 5 دقائق عند الفشل</p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold">الأجهزة المحظورة حالياً</span>
                <Ban className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-bold text-rose-600">{data.totalBlockedIps}</p>
              <p className="text-xs text-muted-foreground">محظور نهائياً لقفل الاختراق</p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold">التشفير المعتمد</span>
                <Key className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">Bcrypt 10</p>
              <p className="text-xs text-muted-foreground">Salted One-Way Hash</p>
            </div>
          </div>

          {/* Security Logs Table */}
          <div className="rounded-3xl bg-card border border-border shadow-xs overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground">سجل أحداث الأمان الأخيرة (Security Audit)</h3>
                <p className="text-xs text-muted-foreground">تتبع مباشر لمحاولات تسجيل الدخول وأحداث الحظر</p>
              </div>
            </div>

            {data.securityLogs.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                لا توجد أحداث أمان مسجلة حتى الآن.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-right">
                  <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-3.5">النوع</th>
                      <th className="p-3.5">مستوى الخطورة</th>
                      <th className="p-3.5">عنوان الـ IP</th>
                      <th className="p-3.5">المستهدف</th>
                      <th className="p-3.5">التفاصيل</th>
                      <th className="p-3.5">الوقت</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.securityLogs.map((log: any) => (
                      <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3.5 font-semibold text-foreground">
                          {log.eventType}
                        </td>
                        <td className="p-3.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            log.severity === "CRITICAL"
                              ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                              : log.severity === "WARNING"
                              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                              : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                          }`}>
                            {log.severity}
                          </span>
                        </td>
                        <td className="p-3.5 font-mono text-muted-foreground" dir="ltr">
                          {log.ipAddress}
                        </td>
                        <td className="p-3.5 text-muted-foreground" dir="ltr">
                          {log.email || "-"}
                        </td>
                        <td className="p-3.5 text-muted-foreground max-w-xs truncate">
                          {log.details || "-"}
                        </td>
                        <td className="p-3.5 text-muted-foreground whitespace-nowrap" dir="ltr">
                          {formatDateTime(log.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
