"use client"

import { useState, useRef, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  User,
  Mail,
  Phone,
  Shield,
  Key,
  Lock,
  Camera,
  Upload,
  Trash2,
  Save,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  History,
  Activity,
  Ban,
  Calendar,
  Sparkles,
  ExternalLink,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { updateAdminProfileAction } from "@/app/actions/auth"
import { useLocaleStore, LanguageCode } from "@/store/useLocaleStore"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// Multi-language dictionary (ar, en, fr) for User Profile Page
const PROFILE_I18N: Record<
  LanguageCode,
  {
    pageTitle: string
    pageSubtitle: string
    tabAccountSettings: string
    tabSecurityLogs: (count: number) => string
    userManagementBtn: string
    systemAdminBadge: string
    fullAccessAdminLabel: string
    avatarTooltip: string
    changePhotoOverlay: string
    activeAccountBadge: string
    instantPreviewBadge: string
    uploadNewAvatarTitle: string
    uploadNewAvatarHint: string
    choosePhotoBtn: string
    removePhotoBtn: string
    joinedDateLabel: string
    securityLevelLabel: string
    personalInfoTitle: string
    personalInfoDesc: string
    liveSyncBadge: string
    fullNameLabel: string
    fullNamePlaceholder: string
    emailLabel: string
    emailPlaceholder: string
    phoneLabel: string
    phonePlaceholder: string
    roleAndPermissionsLabel: string
    changePasswordTitle: string
    changePasswordDesc: string
    currentPasswordLabel: string
    newPasswordLabel: string
    newPasswordPlaceholder: string
    confirmPasswordLabel: string
    confirmPasswordPlaceholder: string
    passwordStrengthLabel: string
    strengthWeak: string
    strengthMedium: string
    strengthGood: string
    strengthVeryStrong: string
    unsavedChangesHint: string
    allDataSecuredHint: string
    viewStoreBtn: string
    saveChangesBtn: string
    savingBtn: string
    rateLimitCardTitle: string
    rateLimitCardValue: string
    rateLimitCardSub: string
    blockedDevicesTitle: string
    blockedDevicesSub: string
    encryptionTitle: string
    securityAuditTitle: string
    securityAuditDesc: string
    noSecurityLogs: string
    colType: string
    colSeverity: string
    colIp: string
    colAccount: string
    colDetails: string
    colTime: string
    valNameMin: string
    valNameMax: string
    valEmailReq: string
    valEmailInvalid: string
    valPhoneMax: string
    valPhoneFormat: string
    valCurrentPassReq: string
    valNewPassMin: string
    valPassMismatch: string
    toastInvalidImageType: string
    toastImageTooLarge: string
    toastSavedSuccess: string
    toastSaveFailed: string
    toastUnexpected: string
    dateLocale: string
  }
> = {
  ar: {
    pageTitle: "الملف الشخصي",
    pageSubtitle:
      "إدارة معلوماتك الشخصية، الصورة الرمزية، وإعدادات الأمان وكلمة المرور",
    tabAccountSettings: "إعدادات الحساب",
    tabSecurityLogs: (count) => `سجل الأمان (${count})`,
    userManagementBtn: "إدارة المستخدمين",
    systemAdminBadge: "مدير النظام (Admin)",
    fullAccessAdminLabel: "مدير النظام (Full Access Admin)",
    avatarTooltip: "انقر أو اسحب صورة لتحديث الصورة الشخصية",
    changePhotoOverlay: "تغيير الصورة",
    activeAccountBadge: "حساب نشط",
    instantPreviewBadge: "معاينة فورية جاهزة",
    uploadNewAvatarTitle: "رفع صورة شخصية جديدة",
    uploadNewAvatarHint:
      "اسحب وأفلت الصورة هنا أو اختر ملفاً (PNG, JPG, WEBP حتى 5MB)",
    choosePhotoBtn: "اختيار صورة",
    removePhotoBtn: "إزالة",
    joinedDateLabel: "تاريخ الانضمام:",
    securityLevelLabel: "مستوى الحماية:",
    personalInfoTitle: "البيانات الشخصية الأساسية",
    personalInfoDesc:
      "قم بتحديث الاسم الكامل، البريد الإلكتروني، ورقم الهاتف المرتبط بحسابك.",
    liveSyncBadge: "محدث فوري",
    fullNameLabel: "الاسم الكامل",
    fullNamePlaceholder: "أدخل الاسم الكامل",
    emailLabel: "البريد الإلكتروني",
    emailPlaceholder: "admin@smomo.shop",
    phoneLabel: "رقم الهاتف",
    phonePlaceholder: "+212 600-000000",
    roleAndPermissionsLabel: "الدور الوظيفي والصلاحية",
    changePasswordTitle: "تغيير كلمة المرور",
    changePasswordDesc:
      "اترك حقول كلمة المرور فارغة إذا كنت لا ترغب في تغييرها حالياً.",
    currentPasswordLabel: "كلمة المرور الحالية",
    newPasswordLabel: "كلمة المرور الجديدة",
    newPasswordPlaceholder: "8 أحرف على الأقل",
    confirmPasswordLabel: "تأكيد كلمة المرور الجديدة",
    confirmPasswordPlaceholder: "أعد كتابة كلمة المرور",
    passwordStrengthLabel: "قوة كلمة المرور:",
    strengthWeak: "ضعيفة",
    strengthMedium: "متوسطة",
    strengthGood: "جيدة",
    strengthVeryStrong: "قوية جداً",
    unsavedChangesHint:
      "لديك تغييرات غير محفوظة، انقر على «حفظ التغييرات» لتطبيقها.",
    allDataSecuredHint: "جميع بيانات حسابك محدثة ومؤمنة.",
    viewStoreBtn: "عرض المتجر",
    saveChangesBtn: "حفظ التغييرات",
    savingBtn: "جاري الحفظ...",
    rateLimitCardTitle: "حماية التخمين (Rate Limit)",
    rateLimitCardValue: "3 محاولات",
    rateLimitCardSub: "تبريد 5 دقائق عند الفشل",
    blockedDevicesTitle: "الأجهزة المحظورة حالياً",
    blockedDevicesSub: "محظور نهائياً لقفل الاختراق",
    encryptionTitle: "التشفير المعتمد",
    securityAuditTitle: "سجل أحداث الأمان الأخيرة (Security Audit)",
    securityAuditDesc:
      "تتبع مباشر لمحاولات تسجيل الدخول وتحديثات الملف الشخصي والصلاحيات",
    noSecurityLogs: "لا توجد أحداث أمان مسجلة حتى الآن.",
    colType: "النوع",
    colSeverity: "مستوى الخطورة",
    colIp: "عنوان الـ IP",
    colAccount: "الحساب",
    colDetails: "التفاصيل",
    colTime: "الوقت",
    valNameMin: "الاسم الكامل يجب أن يتكون من حرفين على الأقل",
    valNameMax: "الاسم الكامل طويل جداً",
    valEmailReq: "البريد الإلكتروني مطلوب",
    valEmailInvalid: "يرجى إدخال بريد إلكتروني صحيح",
    valPhoneMax: "رقم الهاتف طويل جداً",
    valPhoneFormat: "صيغة رقم الهاتف غير صحيحة (مثال: +212 600-000000)",
    valCurrentPassReq:
      "يرجى إدخال كلمة المرور الحالية لتأكيد تغيير كلمة المرور",
    valNewPassMin: "كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف",
    valPassMismatch: "تأكيد كلمة المرور غير مطابق لكلمة المرور الجديدة",
    toastInvalidImageType:
      "يرجى اختيار صورة بصيغة مدعومة (JPG, PNG, WEBP, GIF)",
    toastImageTooLarge: "حجم الصورة يتجاوز الحد الأقصى المسموح به (5MB)",
    toastSavedSuccess: "تم حفظ التغييرات وتحديث الملف الشخصي بنجاح!",
    toastSaveFailed: "فشل تحديث البيانات.",
    toastUnexpected: "حدث خطأ غير متوقع أثناء حفظ التغييرات.",
    dateLocale: "ar-EG",
  },
  en: {
    pageTitle: "User Profile",
    pageSubtitle:
      "Manage your personal details, profile avatar, security settings, and password",
    tabAccountSettings: "Account Settings",
    tabSecurityLogs: (count) => `Security Logs (${count})`,
    userManagementBtn: "User Management",
    systemAdminBadge: "System Admin",
    fullAccessAdminLabel: "System Admin (Full Access)",
    avatarTooltip: "Click or drag & drop an image to update your profile avatar",
    changePhotoOverlay: "Change Photo",
    activeAccountBadge: "Active Account",
    instantPreviewBadge: "Instant Preview Ready",
    uploadNewAvatarTitle: "Upload a New Avatar",
    uploadNewAvatarHint:
      "Drag & drop an image here or choose a file (PNG, JPG, WEBP up to 5MB)",
    choosePhotoBtn: "Choose Image",
    removePhotoBtn: "Remove",
    joinedDateLabel: "Joined Date:",
    securityLevelLabel: "Security Level:",
    personalInfoTitle: "Personal Information",
    personalInfoDesc:
      "Update your full name, email address, and phone number associated with your account.",
    liveSyncBadge: "Live Sync",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "Enter your full name",
    emailLabel: "Email Address",
    emailPlaceholder: "admin@smomo.shop",
    phoneLabel: "Phone Number",
    phonePlaceholder: "+212 600-000000",
    roleAndPermissionsLabel: "Role & Access Level",
    changePasswordTitle: "Change Password",
    changePasswordDesc:
      "Leave password fields blank if you do not wish to change your password right now.",
    currentPasswordLabel: "Current Password",
    newPasswordLabel: "New Password",
    newPasswordPlaceholder: "At least 8 characters",
    confirmPasswordLabel: "Confirm New Password",
    confirmPasswordPlaceholder: "Re-enter new password",
    passwordStrengthLabel: "Password Strength:",
    strengthWeak: "Weak",
    strengthMedium: "Fair",
    strengthGood: "Good",
    strengthVeryStrong: "Very Strong",
    unsavedChangesHint:
      'You have unsaved changes. Click "Save Changes" to apply them.',
    allDataSecuredHint: "All your account details are up to date and secured.",
    viewStoreBtn: "View Store",
    saveChangesBtn: "Save Changes",
    savingBtn: "Saving...",
    rateLimitCardTitle: "Brute-Force Protection (Rate Limit)",
    rateLimitCardValue: "3 Attempts",
    rateLimitCardSub: "5-minute cooldown on failure",
    blockedDevicesTitle: "Currently Blocked IPs",
    blockedDevicesSub: "Permanently blocked from intrusion",
    encryptionTitle: "Password Encryption",
    securityAuditTitle: "Recent Security Audit Events",
    securityAuditDesc:
      "Real-time tracking of login attempts, profile updates, and permission changes",
    noSecurityLogs: "No security events recorded yet.",
    colType: "Event Type",
    colSeverity: "Severity",
    colIp: "IP Address",
    colAccount: "Account",
    colDetails: "Details",
    colTime: "Timestamp",
    valNameMin: "Full name must be at least 2 characters",
    valNameMax: "Full name is too long",
    valEmailReq: "Email address is required",
    valEmailInvalid: "Please enter a valid email address",
    valPhoneMax: "Phone number is too long",
    valPhoneFormat: "Invalid phone number format (e.g., +212 600-000000)",
    valCurrentPassReq:
      "Please enter your current password to confirm password change",
    valNewPassMin: "New password must be at least 8 characters",
    valPassMismatch: "Password confirmation does not match the new password",
    toastInvalidImageType:
      "Please select a supported image format (JPG, PNG, WEBP, GIF)",
    toastImageTooLarge: "Image size exceeds the maximum allowed limit (5MB)",
    toastSavedSuccess: "Changes saved and profile updated successfully!",
    toastSaveFailed: "Failed to update profile data.",
    toastUnexpected: "An unexpected error occurred while saving changes.",
    dateLocale: "en-US",
  },
  fr: {
    pageTitle: "Profil Utilisateur",
    pageSubtitle:
      "Gérez vos informations personnelles, votre photo de profil et vos paramètres de sécurité",
    tabAccountSettings: "Paramètres du Compte",
    tabSecurityLogs: (count) => `Journal de Sécurité (${count})`,
    userManagementBtn: "Gestion des Utilisateurs",
    systemAdminBadge: "Administrateur (Admin)",
    fullAccessAdminLabel: "Administrateur Système (Accès Complet)",
    avatarTooltip: "Cliquez ou glissez une image pour modifier votre photo",
    changePhotoOverlay: "Modifier",
    activeAccountBadge: "Compte Actif",
    instantPreviewBadge: "Aperçu Instantané Prêt",
    uploadNewAvatarTitle: "Télécharger une nouvelle photo",
    uploadNewAvatarHint:
      "Glissez-déposez une image ici ou choisissez un fichier (PNG, JPG, WEBP max 5MB)",
    choosePhotoBtn: "Choisir une image",
    removePhotoBtn: "Supprimer",
    joinedDateLabel: "Date d'inscription :",
    securityLevelLabel: "Niveau de sécurité :",
    personalInfoTitle: "Informations Personnelles",
    personalInfoDesc:
      "Mettez à jour votre nom complet, adresse e-mail et numéro de téléphone.",
    liveSyncBadge: "Synchro Directe",
    fullNameLabel: "Nom Complet",
    fullNamePlaceholder: "Saisissez votre nom complet",
    emailLabel: "Adresse E-mail",
    emailPlaceholder: "admin@smomo.shop",
    phoneLabel: "Numéro de Téléphone",
    phonePlaceholder: "+212 600-000000",
    roleAndPermissionsLabel: "Rôle et Niveau d'Accès",
    changePasswordTitle: "Changer le Mot de Passe",
    changePasswordDesc:
      "Laissez ces champs vides si vous ne souhaitez pas modifier votre mot de passe.",
    currentPasswordLabel: "Mot de passe actuel",
    newPasswordLabel: "Nouveau mot de passe",
    newPasswordPlaceholder: "8 caractères minimum",
    confirmPasswordLabel: "Confirmer le mot de passe",
    confirmPasswordPlaceholder: "Ressaisissez le mot de passe",
    passwordStrengthLabel: "Force du mot de passe :",
    strengthWeak: "Faible",
    strengthMedium: "Moyen",
    strengthGood: "Bon",
    strengthVeryStrong: "Très Fort",
    unsavedChangesHint:
      "Modifications non enregistrées. Cliquez sur « Enregistrer » pour appliquer.",
    allDataSecuredHint: "Toutes vos informations sont à jour et sécurisées.",
    viewStoreBtn: "Voir la Boutique",
    saveChangesBtn: "Enregistrer les modifications",
    savingBtn: "Enregistrement...",
    rateLimitCardTitle: "Protection Brute-Force (Rate Limit)",
    rateLimitCardValue: "3 Tentatives",
    rateLimitCardSub: "Blocage de 5 minutes après échec",
    blockedDevicesTitle: "Appareils Bloqués",
    blockedDevicesSub: "Bloqués définitivement contre les intrusions",
    encryptionTitle: "Chiffrement Actif",
    securityAuditTitle: "Journal d'Audit de Sécurité Récent",
    securityAuditDesc:
      "Suivi en direct des connexions, modifications de profil et permissions",
    noSecurityLogs: "Aucun événement de sécurité enregistré.",
    colType: "Type",
    colSeverity: "Gravité",
    colIp: "Adresse IP",
    colAccount: "Compte",
    colDetails: "Détails",
    colTime: "Date / Heure",
    valNameMin: "Le nom complet doit comporter au moins 2 caractères",
    valNameMax: "Le nom complet est trop long",
    valEmailReq: "L'adresse e-mail est requise",
    valEmailInvalid: "Veuillez saisir une adresse e-mail valide",
    valPhoneMax: "Le numéro de téléphone est trop long",
    valPhoneFormat: "Format de téléphone invalide (ex: +212 600-000000)",
    valCurrentPassReq:
      "Veuillez saisir votre mot de passe actuel pour confirmer le changement",
    valNewPassMin: "Le nouveau mot de passe doit contenir au moins 8 caractères",
    valPassMismatch: "La confirmation ne correspond pas au nouveau mot de passe",
    toastInvalidImageType:
      "Veuillez choisir un format d'image supporté (JPG, PNG, WEBP, GIF)",
    toastImageTooLarge: "La taille de l'image dépasse la limite autorisée (5MB)",
    toastSavedSuccess: "Modifications enregistrées avec succès !",
    toastSaveFailed: "Échec de la mise à jour.",
    toastUnexpected: "Une erreur inattendue s'est produite.",
    dateLocale: "fr-FR",
  },
}

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
      createdAt: Date | string
      updatedAt: Date | string
    }
    profile: any
    securityLogs: any[]
    totalBlockedIps: number
  }
}

export default function ProfileClient({ data }: ProfileClientProps) {
  const router = useRouter()
  const { update: updateSession } = useSession()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { language, direction } = useLocaleStore()
  const isRtl = direction === "rtl"
  const copy = PROFILE_I18N[language] || PROFILE_I18N.en

  const [activeView, setActiveView] = useState<"profile" | "logs">("profile")

  // Avatar Upload with Instant Preview state
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    data.user.imageUrl
  )
  const [removeAvatarFlag, setRemoveAvatarFlag] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  // Password visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const profileFormSchema = useMemo(
    () =>
      z
        .object({
          name: z
            .string()
            .trim()
            .min(2, copy.valNameMin)
            .max(80, copy.valNameMax),
          email: z
            .string()
            .trim()
            .min(1, copy.valEmailReq)
            .email(copy.valEmailInvalid),
          phone: z
            .string()
            .trim()
            .max(30, copy.valPhoneMax)
            .refine(
              (val) => !val || /^[+\d\s()-]{6,25}$/.test(val),
              copy.valPhoneFormat
            )
            .optional()
            .or(z.literal("")),
          currentPassword: z.string().optional().or(z.literal("")),
          newPassword: z.string().optional().or(z.literal("")),
          confirmPassword: z.string().optional().or(z.literal("")),
        })
        .superRefine((formData, ctx) => {
          const hasNewPass = Boolean(
            formData.newPassword && formData.newPassword.trim().length > 0
          )
          const hasConfirmPass = Boolean(
            formData.confirmPassword && formData.confirmPassword.trim().length > 0
          )

          if (hasNewPass || hasConfirmPass) {
            if (
              !formData.currentPassword ||
              formData.currentPassword.trim().length === 0
            ) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: copy.valCurrentPassReq,
                path: ["currentPassword"],
              })
            }

            if (!formData.newPassword || formData.newPassword.length < 8) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: copy.valNewPassMin,
                path: ["newPassword"],
              })
            }

            if (formData.newPassword !== formData.confirmPassword) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: copy.valPassMismatch,
                path: ["confirmPassword"],
              })
            }
          }
        }),
    [copy]
  )

  type ProfileFormValues = z.infer<typeof profileFormSchema>

  const {
    register,
    handleSubmit,
    watch,
    resetField,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: data.user.name || "",
      email: data.user.email || "",
      phone: data.user.phone || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  const watchedName = watch("name")
  const watchedEmail = watch("email")
  const watchedNewPassword = watch("newPassword")

  const processSelectedFile = (file: File) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      toast.error(copy.toastInvalidImageType)
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(copy.toastImageTooLarge)
      return
    }

    setAvatarFile(file)
    setRemoveAvatarFlag(false)
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processSelectedFile(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processSelectedFile(file)
    }
  }

  const handleRemoveAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
    setRemoveAvatarFlag(true)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      const formData = new FormData()
      formData.append("userId", data.user.id)
      formData.append("name", values.name.trim())
      formData.append("email", values.email.trim().toLowerCase())
      formData.append("phone", values.phone?.trim() || "")

      if (removeAvatarFlag) {
        formData.append("removeAvatar", "true")
      }
      if (avatarFile) {
        formData.append("avatar", avatarFile)
      }

      if (values.newPassword && values.newPassword.trim().length > 0) {
        formData.append("currentPassword", values.currentPassword || "")
        formData.append("newPassword", values.newPassword)
        formData.append("confirmPassword", values.confirmPassword || "")
      }

      const res = await updateAdminProfileAction(formData)

      if (res.success && res.user) {
        toast.success(copy.toastSavedSuccess)
        resetField("currentPassword")
        resetField("newPassword")
        resetField("confirmPassword")
        setAvatarFile(null)
        setRemoveAvatarFlag(false)

        try {
          await updateSession({
            name: res.user.name,
            email: res.user.email,
            image: res.user.imageUrl,
          })
        } catch {
          // Ignore session update error if unauthenticated
        }

        router.refresh()
      } else {
        toast.error(res.error || copy.toastSaveFailed)
      }
    } catch {
      toast.error(copy.toastUnexpected)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString(copy.dateLocale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleString(copy.dateLocale, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPasswordStrength = (pass?: string) => {
    if (!pass) return { score: 0, label: "", color: "bg-muted" }
    let score = 0
    if (pass.length >= 8) score++
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score++
    if (/\d/.test(pass)) score++
    if (/[^A-Za-z0-9]/.test(pass)) score++

    if (score <= 1)
      return { score: 1, label: copy.strengthWeak, color: "bg-rose-500" }
    if (score === 2)
      return { score: 2, label: copy.strengthMedium, color: "bg-amber-500" }
    if (score === 3)
      return { score: 3, label: copy.strengthGood, color: "bg-blue-500" }
    return { score: 4, label: copy.strengthVeryStrong, color: "bg-emerald-500" }
  }

  const strength = getPasswordStrength(watchedNewPassword)

  const initials = (watchedName || data.user.name || "AD")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="space-y-6 pb-10 font-sans" dir={direction}>
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {copy.pageTitle}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {copy.pageSubtitle}
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-xl bg-muted/60 p-1 border border-border/60">
            <button
              type="button"
              onClick={() => setActiveView("profile")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                activeView === "profile"
                  ? "bg-card text-primary shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <User className="h-3.5 w-3.5" />
              <span>{copy.tabAccountSettings}</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView("logs")}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                activeView === "logs"
                  ? "bg-card text-primary shadow-xs border border-border/60"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <History className="h-3.5 w-3.5" />
              <span>{copy.tabSecurityLogs(data.securityLogs.length)}</span>
            </button>
          </div>

          <Link href="/users">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-foreground/90 border-border/80 hover:border-primary/40 hover:text-primary hover:bg-primary/5 text-xs h-9 px-3.5 font-semibold rounded-xl transition-all"
            >
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>{copy.userManagementBtn}</span>
            </Button>
          </Link>
        </div>
      </div>

      {activeView === "profile" ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Avatar Upload Card & Account Summary */}
            <div className="lg:col-span-4 space-y-6">
              <Card className="overflow-hidden border border-border/80 bg-card shadow-xs rounded-2xl">
                <div
                  className={cn(
                    "h-24 relative",
                    isRtl
                      ? "bg-gradient-to-l from-primary/20 via-rose-500/10 to-slate-100 dark:to-slate-900"
                      : "bg-gradient-to-r from-primary/20 via-rose-500/10 to-slate-100 dark:to-slate-900"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-3",
                      isRtl ? "left-3" : "right-3"
                    )}
                  >
                    <Badge
                      variant="outline"
                      className="bg-card/90 backdrop-blur-xs text-primary border-primary/25 text-[11px] font-semibold gap-1 px-2.5 py-0.5"
                    >
                      <Shield className="h-3 w-3" />
                      <span>
                        {data.user.role === "ADMIN"
                          ? copy.systemAdminBadge
                          : data.user.role}
                      </span>
                    </Badge>
                  </div>
                </div>

                <CardContent className="pt-0 pb-6 px-6">
                  {/* Avatar Preview Circle */}
                  <div className="-mt-12 mb-4 flex flex-col items-center text-center">
                    <div
                      onDragOver={(e) => {
                        e.preventDefault()
                        setIsDragging(true)
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "relative group h-28 w-28 rounded-full bg-muted border-4 border-card shadow-md flex items-center justify-center overflow-hidden cursor-pointer transition-all",
                        isDragging && "ring-4 ring-primary/40 scale-105"
                      )}
                      title={copy.avatarTooltip}
                    >
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt={watchedName || data.user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-primary/15 to-rose-500/10 text-primary font-bold text-2xl">
                          {initials}
                        </div>
                      )}

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/55 text-white flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Camera className="h-6 w-6 mb-1" />
                        <span className="text-[10px] font-semibold">
                          {copy.changePhotoOverlay}
                        </span>
                      </div>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />

                    <h2 className="mt-3 text-lg font-bold text-foreground">
                      {watchedName || data.user.name}
                    </h2>
                    <p
                      className="text-xs text-muted-foreground font-mono mt-0.5"
                      dir="ltr"
                    >
                      {watchedEmail || data.user.email}
                    </p>

                    <div className="mt-2.5 flex flex-wrap items-center justify-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{copy.activeAccountBadge}</span>
                      </span>
                      {avatarFile && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                          <Sparkles className="w-3 h-3" />
                          <span>{copy.instantPreviewBadge}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Avatar Upload Action Box */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={cn(
                      "rounded-xl border-2 border-dashed p-4 text-center transition-colors",
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border/80 bg-muted/30 hover:border-primary/40"
                    )}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                        <Upload className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-semibold text-foreground">
                          {copy.uploadNewAvatarTitle}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {copy.uploadNewAvatarHint}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="h-8 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10 hover:text-primary rounded-lg gap-1.5 cursor-pointer"
                        >
                          <Camera className="h-3.5 w-3.5" />
                          <span>{copy.choosePhotoBtn}</span>
                        </Button>
                        {avatarPreview && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleRemoveAvatar}
                            className="h-8 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg gap-1 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            <span>{copy.removePhotoBtn}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Account Meta Info */}
                  <div className="mt-5 pt-4 border-t border-border/60 space-y-2.5 text-xs">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary/80" />
                        <span>{copy.joinedDateLabel}</span>
                      </span>
                      <span className="font-medium text-foreground">
                        {formatDate(data.user.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{copy.securityLevelLabel}</span>
                      </span>
                      <span className="font-medium text-foreground">
                        Bcrypt + Rate Limit
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Personal Info + Password Change Form */}
            <div className="lg:col-span-8 space-y-6">
              {/* Personal Info Section */}
              <Card className="border border-border/80 bg-card shadow-xs rounded-2xl">
                <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base font-bold flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span>{copy.personalInfoTitle}</span>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {copy.personalInfoDesc}
                      </CardDescription>
                    </div>
                    <Badge
                      variant="secondary"
                      className="text-[11px] bg-primary/10 text-primary border-0"
                    >
                      {copy.liveSyncBadge}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="profile-name"
                        className="text-xs font-semibold text-foreground"
                      >
                        {copy.fullNameLabel} <span className="text-primary">*</span>
                      </Label>
                      <div className="relative">
                        <User
                          className={cn(
                            "absolute top-2.5 h-4 w-4 text-muted-foreground pointer-events-none",
                            isRtl ? "right-3" : "left-3"
                          )}
                        />
                        <Input
                          id="profile-name"
                          type="text"
                          placeholder={copy.fullNamePlaceholder}
                          className={cn(
                            "h-10 bg-muted/20 focus:bg-background rounded-xl transition-all",
                            isRtl ? "pr-9 pl-3" : "pl-9 pr-3",
                            errors.name &&
                              "border-destructive focus-visible:ring-destructive/30"
                          )}
                          {...register("name")}
                        />
                      </div>
                      {errors.name && (
                        <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{errors.name.message}</span>
                        </p>
                      )}
                    </div>

                    {/* Email Address */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="profile-email"
                        className="text-xs font-semibold text-foreground"
                      >
                        {copy.emailLabel} <span className="text-primary">*</span>
                      </Label>
                      <div className="relative">
                        <Mail
                          className={cn(
                            "absolute top-2.5 h-4 w-4 text-muted-foreground pointer-events-none",
                            isRtl ? "right-3" : "left-3"
                          )}
                        />
                        <Input
                          id="profile-email"
                          type="email"
                          dir="ltr"
                          placeholder={copy.emailPlaceholder}
                          className={cn(
                            "h-10 text-left bg-muted/20 focus:bg-background rounded-xl transition-all",
                            isRtl ? "pr-9 pl-3" : "pl-9 pr-3",
                            errors.email &&
                              "border-destructive focus-visible:ring-destructive/30"
                          )}
                          {...register("email")}
                        />
                      </div>
                      {errors.email && (
                        <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{errors.email.message}</span>
                        </p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="profile-phone"
                        className="text-xs font-semibold text-foreground"
                      >
                        {copy.phoneLabel}
                      </Label>
                      <div className="relative">
                        <Phone
                          className={cn(
                            "absolute top-2.5 h-4 w-4 text-muted-foreground pointer-events-none",
                            isRtl ? "right-3" : "left-3"
                          )}
                        />
                        <Input
                          id="profile-phone"
                          type="tel"
                          dir="ltr"
                          placeholder={copy.phonePlaceholder}
                          className={cn(
                            "h-10 text-left bg-muted/20 focus:bg-background rounded-xl transition-all",
                            isRtl ? "pr-9 pl-3" : "pl-9 pr-3",
                            errors.phone &&
                              "border-destructive focus-visible:ring-destructive/30"
                          )}
                          {...register("phone")}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{errors.phone.message}</span>
                        </p>
                      )}
                    </div>

                    {/* Role Read-Only Display */}
                    <div className="space-y-2">
                      <Label className="text-xs font-semibold text-foreground">
                        {copy.roleAndPermissionsLabel}
                      </Label>
                      <div className="relative">
                        <Shield
                          className={cn(
                            "absolute top-2.5 h-4 w-4 text-primary pointer-events-none",
                            isRtl ? "right-3" : "left-3"
                          )}
                        />
                        <Input
                          type="text"
                          value={
                            data.user.role === "ADMIN"
                              ? copy.fullAccessAdminLabel
                              : data.user.role
                          }
                          disabled
                          className={cn(
                            "h-10 bg-muted/50 text-muted-foreground rounded-xl cursor-not-allowed",
                            isRtl ? "pr-9 pl-3" : "pl-9 pr-3"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Change Password Section */}
              <Card className="border border-border/80 bg-card shadow-xs rounded-2xl">
                <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
                  <div className="space-y-1">
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <Key className="h-4 w-4 text-primary" />
                      <span>{copy.changePasswordTitle}</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      {copy.changePasswordDesc}
                    </CardDescription>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Current Password */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="profile-current-password"
                        className="text-xs font-semibold text-foreground"
                      >
                        {copy.currentPasswordLabel}
                      </Label>
                      <div className="relative">
                        <Lock
                          className={cn(
                            "absolute top-2.5 h-4 w-4 text-muted-foreground pointer-events-none",
                            isRtl ? "right-3" : "left-3"
                          )}
                        />
                        <Input
                          id="profile-current-password"
                          type={showCurrentPassword ? "text" : "password"}
                          dir="ltr"
                          placeholder="••••••••"
                          className={cn(
                            "h-10 pr-9 pl-9 bg-muted/20 focus:bg-background rounded-xl",
                            errors.currentPassword &&
                              "border-destructive focus-visible:ring-destructive/30"
                          )}
                          {...register("currentPassword")}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowCurrentPassword(!showCurrentPassword)
                          }
                          className={cn(
                            "absolute top-2.5 text-muted-foreground hover:text-foreground cursor-pointer",
                            isRtl ? "left-3" : "right-3"
                          )}
                          tabIndex={-1}
                        >
                          {showCurrentPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{errors.currentPassword.message}</span>
                        </p>
                      )}
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="profile-new-password"
                        className="text-xs font-semibold text-foreground"
                      >
                        {copy.newPasswordLabel}
                      </Label>
                      <div className="relative">
                        <Key
                          className={cn(
                            "absolute top-2.5 h-4 w-4 text-muted-foreground pointer-events-none",
                            isRtl ? "right-3" : "left-3"
                          )}
                        />
                        <Input
                          id="profile-new-password"
                          type={showNewPassword ? "text" : "password"}
                          dir="ltr"
                          placeholder={copy.newPasswordPlaceholder}
                          className={cn(
                            "h-10 pr-9 pl-9 bg-muted/20 focus:bg-background rounded-xl",
                            errors.newPassword &&
                              "border-destructive focus-visible:ring-destructive/30"
                          )}
                          {...register("newPassword")}
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className={cn(
                            "absolute top-2.5 text-muted-foreground hover:text-foreground cursor-pointer",
                            isRtl ? "left-3" : "right-3"
                          )}
                          tabIndex={-1}
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {watchedNewPassword && (
                        <div className="space-y-1 pt-0.5">
                          <div className="flex gap-1 h-1.5">
                            {[1, 2, 3, 4].map((step) => (
                              <div
                                key={step}
                                className={cn(
                                  "flex-1 rounded-full transition-colors",
                                  step <= strength.score
                                    ? strength.color
                                    : "bg-muted"
                                )}
                              />
                            ))}
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {copy.passwordStrengthLabel}{" "}
                            <span className="font-semibold text-foreground">
                              {strength.label}
                            </span>
                          </p>
                        </div>
                      )}
                      {errors.newPassword && (
                        <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{errors.newPassword.message}</span>
                        </p>
                      )}
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="profile-confirm-password"
                        className="text-xs font-semibold text-foreground"
                      >
                        {copy.confirmPasswordLabel}
                      </Label>
                      <div className="relative">
                        <Lock
                          className={cn(
                            "absolute top-2.5 h-4 w-4 text-muted-foreground pointer-events-none",
                            isRtl ? "right-3" : "left-3"
                          )}
                        />
                        <Input
                          id="profile-confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          dir="ltr"
                          placeholder={copy.confirmPasswordPlaceholder}
                          className={cn(
                            "h-10 pr-9 pl-9 bg-muted/20 focus:bg-background rounded-xl",
                            errors.confirmPassword &&
                              "border-destructive focus-visible:ring-destructive/30"
                          )}
                          {...register("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className={cn(
                            "absolute top-2.5 text-muted-foreground hover:text-foreground cursor-pointer",
                            isRtl ? "left-3" : "right-3"
                          )}
                          tabIndex={-1}
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-xs text-destructive flex items-center gap-1 font-medium">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                          <span>{errors.confirmPassword.message}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Action Bar Footer with "View Store" matching Save Changes Button */}
                  <div className="pt-4 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-xs text-muted-foreground">
                      {isDirty || avatarFile || removeAvatarFlag
                        ? copy.unsavedChangesHint
                        : copy.allDataSecuredHint}
                    </p>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                      <Link href="http://localhost:3001" target="_blank">
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2 text-foreground/90 border-border/80 hover:border-primary/50 hover:text-primary hover:bg-primary/5 text-xs h-10 px-4 font-semibold rounded-xl shadow-2xs transition-all cursor-pointer"
                        >
                          <ExternalLink className="h-4 w-4 text-primary" />
                          <span>{copy.viewStoreBtn}</span>
                        </Button>
                      </Link>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="gap-2 bg-primary hover:bg-[#be123c] text-white border border-primary/20 text-xs sm:text-sm h-10 px-6 font-semibold rounded-xl shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 transition-all cursor-pointer"
                      >
                        {isSubmitting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        <span>
                          {isSubmitting ? copy.savingBtn : copy.saveChangesBtn}
                        </span>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      ) : (
        /* Security Logs View */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold">
                  {copy.rateLimitCardTitle}
                </span>
                <Shield className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">
                {copy.rateLimitCardValue}
              </p>
              <p className="text-xs text-muted-foreground">
                {copy.rateLimitCardSub}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold">
                  {copy.blockedDevicesTitle}
                </span>
                <Ban className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-bold text-rose-600">
                {data.totalBlockedIps}
              </p>
              <p className="text-xs text-muted-foreground">
                {copy.blockedDevicesSub}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-card border border-border shadow-xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs font-semibold">
                  {copy.encryptionTitle}
                </span>
                <Key className="w-4 h-4 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">Bcrypt 10</p>
              <p className="text-xs text-muted-foreground">
                Salted One-Way Hash
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-card border border-border shadow-xs overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-foreground">
                  {copy.securityAuditTitle}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {copy.securityAuditDesc}
                </p>
              </div>
            </div>

            {data.securityLogs.length === 0 ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                {copy.noSecurityLogs}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table
                  className={cn(
                    "w-full text-xs",
                    isRtl ? "text-right" : "text-left"
                  )}
                >
                  <thead className="bg-muted/50 text-muted-foreground border-b border-border">
                    <tr>
                      <th className="p-3.5">{copy.colType}</th>
                      <th className="p-3.5">{copy.colSeverity}</th>
                      <th className="p-3.5">{copy.colIp}</th>
                      <th className="p-3.5">{copy.colAccount}</th>
                      <th className="p-3.5">{copy.colDetails}</th>
                      <th className="p-3.5">{copy.colTime}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {data.securityLogs.map((log: any) => (
                      <tr
                        key={log.id}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-3.5 font-semibold text-foreground">
                          {log.eventType}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              log.severity === "CRITICAL"
                                ? "bg-rose-500/10 text-rose-500 border border-rose-500/20"
                                : log.severity === "WARNING"
                                ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                                : "bg-blue-500/10 text-blue-500 border border-blue-500/20"
                            }`}
                          >
                            {log.severity}
                          </span>
                        </td>
                        <td
                          className="p-3.5 font-mono text-muted-foreground"
                          dir="ltr"
                        >
                          {log.ipAddress}
                        </td>
                        <td className="p-3.5 text-muted-foreground" dir="ltr">
                          {log.email || "-"}
                        </td>
                        <td className="p-3.5 text-muted-foreground max-w-xs truncate">
                          {log.details || "-"}
                        </td>
                        <td
                          className="p-3.5 text-muted-foreground whitespace-nowrap"
                          dir="ltr"
                        >
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
