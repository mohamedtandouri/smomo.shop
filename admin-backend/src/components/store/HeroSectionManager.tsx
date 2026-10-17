"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Sparkles,
  Upload,
  Image as ImageIcon,
  Type,
  Link2,
  Palette,
  Eye,
  Save,
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Star,
  ArrowRight,
  Laptop,
  Smartphone,
  ExternalLink,
  Trash2,
  ShieldCheck,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  DEFAULT_HERO_SECTION,
  ALLOWED_HERO_IMAGE_TYPES,
  MAX_HERO_IMAGE_SIZE_BYTES,
  isValidHeroUrlOrPath,
  type HeroSectionData,
} from "@/lib/hero-config"
import { useLocaleStore, type LanguageCode } from "@/store/useLocaleStore"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

const PRESET_BG_COLORS = [
  { label: "Pure White", value: "#ffffff" },
  { label: "Soft Rose", value: "#fff1f2" },
  { label: "Warm Alabaster", value: "#f8fafc" },
  { label: "Soft Amber", value: "#fefce8" },
  { label: "Mint Breeze", value: "#f0fdf4" },
  { label: "Midnight Slate", value: "#0f172a" },
]

const PRESET_ACCENT_COLORS = [
  { label: "Smomo Rose", value: "#ff2d55" },
  { label: "Crimson Red", value: "#e11d48" },
  { label: "Royal Violet", value: "#7c3aed" },
  { label: "Ocean Blue", value: "#2563eb" },
  { label: "Emerald", value: "#059669" },
]

const HERO_I18N: Record<
  LanguageCode,
  {
    moduleTitle: string
    moduleSubtitle: string
    viewLiveStore: string
    resetDefaults: string
    saveChanges: string
    saving: string
    livePreviewTitle: string
    livePreviewSubtitle: string
    desktopView: string
    mobileView: string
    activeStatus: string
    hiddenStatus: string
    textSectionTitle: string
    textSectionDesc: string
    badgeLabel: string
    badgePlaceholder: string
    titleLabel: string
    titlePlaceholder: string
    highlightLabel: string
    highlightPlaceholder: string
    subtitleLabel: string
    subtitlePlaceholder: string
    ctaSectionTitle: string
    ctaSectionDesc: string
    primaryBtnTextLabel: string
    primaryBtnUrlLabel: string
    secondaryBtnTextLabel: string
    secondaryBtnUrlLabel: string
    imageAndColorsTitle: string
    imageAndColorsDesc: string
    dropzoneTitle: string
    dropzoneSub: string
    chooseImageBtn: string
    removeNewImageBtn: string
    imagePathLabel: string
    bgColorLabel: string
    accentColorLabel: string
    textColorLabel: string
    extrasTitle: string
    extrasDesc: string
    floatingValueLabel: string
    floatingTextLabel: string
    showFloatingSwitch: string
    showTrustSwitch: string
    heroActiveSwitch: string
    webpOptBadge: string
    unsavedHint: string
    syncedHint: string
    valTitleMin: string
    valTitleMax: string
    valHighlightMax: string
    valSubtitleMin: string
    valSubtitleMax: string
    valBadgeMax: string
    valBtnTextMin: string
    valBtnTextMax: string
    valBtnUrlInvalid: string
    valHexInvalid: string
    toastSaved: string
    toastReset: string
    toastInvalidType: string
    toastFileTooLarge: string
  }
> = {
  ar: {
    moduleTitle: "إدارة قسم الهيرو (Hero Section)",
    moduleSubtitle:
      "تحكم كامل في المحتوى النصي، الأزرار التفاعلية، الألوان، والصورة الرئيسية في واجهة المتجر مع معاينة حية فورية",
    viewLiveStore: "عرض المتجر المباشر",
    resetDefaults: "استعادة الافتراضي",
    saveChanges: "حفظ التغييرات",
    saving: "جاري الحفظ والتحسين...",
    livePreviewTitle: "المعاينة المباشرة (Live Preview)",
    livePreviewSubtitle: "تظهر التغييرات فوراً كما سيراها زوار المتجر قبل الحفظ",
    desktopView: "سطح المكتب",
    mobileView: "الجوال",
    activeStatus: "مفعّل في المتجر",
    hiddenStatus: "مخفي مؤقتاً",
    textSectionTitle: "المحتوى النصي والعناوين",
    textSectionDesc: "العنوان الرئيسي، الكلمة المميزة، والوصف التسويقي لقسم الهيرو",
    badgeLabel: "نص الشارة العلوية (Badge)",
    badgePlaceholder: "مثال: Premium E-Commerce Experience",
    titleLabel: "العنوان الرئيسي (Title)",
    titlePlaceholder: "مثال: Elevate Your",
    highlightLabel: "التكملة المميزة باللون (Highlight)",
    highlightPlaceholder: "مثال: Lifestyle.",
    subtitleLabel: "العنوان الفرعي / الوصف (Subtitle)",
    subtitlePlaceholder: "اكتب وصفاً جذاباً يوضح مزايا متجرك ومنتجاتك...",
    ctaSectionTitle: "أزرار الدعوة لاتخاذ إجراء (CTA Buttons)",
    ctaSectionDesc: "تخصيص نصوص وروابط الأزرار التفاعلية في قسم الهيرو",
    primaryBtnTextLabel: "نص الزر الرئيسي",
    primaryBtnUrlLabel: "رابط الزر الرئيسي (URL)",
    secondaryBtnTextLabel: "نص الزر الثانوي (اختياري)",
    secondaryBtnUrlLabel: "رابط الزر الثانوي (URL)",
    imageAndColorsTitle: "الصورة الرئيسية والألوان",
    imageAndColorsDesc:
      "ارفع صورة الهيرو (يتم ضغطها وتحويلها تلقائياً إلى WebP) وخصص ألوان الخلفية والتمييز",
    dropzoneTitle: "اسحب وأفلت صورة الهيرو هنا أو انقر للاختيار",
    dropzoneSub: "يدعم PNG, WebP, JPG (بحد أقصى 5MB) — يتم تحسينها تلقائياً عبر Sharp",
    chooseImageBtn: "اختيار صورة جديدة",
    removeNewImageBtn: "إلغاء الصورة المختارة",
    imagePathLabel: "مسار الصورة الحالي (Image Path)",
    bgColorLabel: "لون خلفية القسم (Background Color)",
    accentColorLabel: "لون التمييز والزر (Accent Color)",
    textColorLabel: "لون العنوان الرئيسي (Text Color)",
    extrasTitle: "الشارة العائمة وعناصر الثقة",
    extrasDesc: "إعدادات البطاقة العائمة على الصورة ومؤشرات الموثوقية السفلية",
    floatingValueLabel: "الرقم الإحصائي (مثال: 10k+)",
    floatingTextLabel: "عنوان الشارة (مثال: Happy Customers)",
    showFloatingSwitch: "إظهار شارة العملاء العائمة على الصورة",
    showTrustSwitch: "إظهار شارات الثقة (متوفر، شحن 24 ساعة، دفع آمن)",
    heroActiveSwitch: "تفعيل عرض قسم الهيرو في الصفحة الرئيسية",
    webpOptBadge: "تحسين تلقائي للصور (WebP)",
    unsavedHint: "لديك تعديلات غير محفوظة في المعاينة المباشرة — اضغط «حفظ التغييرات» لاعتمادها.",
    syncedHint: "جميع إعدادات قسم الهيرو محفوظة ومتزامنة مع واجهة المتجر.",
    valTitleMin: "العنوان الرئيسي يجب أن يتكون من حرفين على الأقل",
    valTitleMax: "العنوان الرئيسي لا يجب أن يتجاوز 80 حرفاً",
    valHighlightMax: "النص المميز لا يجب أن يتجاوز 50 حرفاً",
    valSubtitleMin: "العنوان الفرعي يجب أن يتكون من 10 أحرف على الأقل",
    valSubtitleMax: "العنوان الفرعي لا يجب أن يتجاوز 260 حرفاً",
    valBadgeMax: "نص الشارة لا يجب أن يتجاوز 60 حرفاً",
    valBtnTextMin: "نص الزر يجب أن يتكون من حرفين على الأقل",
    valBtnTextMax: "نص الزر لا يجب أن يتجاوز 40 حرفاً",
    valBtnUrlInvalid: "يرجى إدخال رابط URL صحيح (https://...) أو مسار يبدأ بـ / (مثل /store/products)",
    valHexInvalid: "يرجى إدخال كود لون Hex صحيح (مثال: #ffffff)",
    toastSaved: "تم حفظ وتحديث قسم الهيرو في المتجر بنجاح!",
    toastReset: "تمت استعادة الإعدادات الافتراضية لقسم الهيرو!",
    toastInvalidType: "صيغة الملف غير مدعومة. يرجى اختيار صورة WebP أو PNG أو JPG.",
    toastFileTooLarge: "حجم الصورة يتجاوز الحد الأقصى المسموح به (5MB).",
  },
  en: {
    moduleTitle: "Hero Section Manager",
    moduleSubtitle:
      "Full control over storefront hero headlines, CTA buttons, colors, and optimized hero imagery with real-time live preview",
    viewLiveStore: "View Live Store",
    resetDefaults: "Reset Defaults",
    saveChanges: "Save Changes",
    saving: "Saving & Optimizing...",
    livePreviewTitle: "Interactive Live Preview",
    livePreviewSubtitle: "See your changes in real time before publishing to the storefront",
    desktopView: "Desktop",
    mobileView: "Mobile",
    activeStatus: "Active on Storefront",
    hiddenStatus: "Hidden",
    textSectionTitle: "Headlines & Text Content",
    textSectionDesc: "Configure the badge, main title, highlighted text, and subtitle",
    badgeLabel: "Top Badge Text",
    badgePlaceholder: "e.g., Premium E-Commerce Experience",
    titleLabel: "Main Title",
    titlePlaceholder: "e.g., Elevate Your",
    highlightLabel: "Highlighted Title Word(s)",
    highlightPlaceholder: "e.g., Lifestyle.",
    subtitleLabel: "Subtitle / Description",
    subtitlePlaceholder: "Write a compelling description of your store and products...",
    ctaSectionTitle: "Call-To-Action (CTA) Buttons",
    ctaSectionDesc: "Customize button labels and destination URLs",
    primaryBtnTextLabel: "Primary Button Text",
    primaryBtnUrlLabel: "Primary Button URL",
    secondaryBtnTextLabel: "Secondary Button Text (Optional)",
    secondaryBtnUrlLabel: "Secondary Button URL",
    imageAndColorsTitle: "Hero Image & Color Palette",
    imageAndColorsDesc:
      "Upload a hero image (automatically optimized to WebP) and customize background and accent colors",
    dropzoneTitle: "Drag & drop your hero image here, or click to browse",
    dropzoneSub: "Supports WebP, PNG, JPG (Max 5MB) — Auto-optimized via Sharp",
    chooseImageBtn: "Choose New Image",
    removeNewImageBtn: "Discard Selected Image",
    imagePathLabel: "Current Image Path / URL",
    bgColorLabel: "Background Color",
    accentColorLabel: "Accent / Button Color",
    textColorLabel: "Heading Text Color",
    extrasTitle: "Floating Badge & Trust Indicators",
    extrasDesc: "Configure the floating social proof card and bottom trust badges",
    floatingValueLabel: "Metric Value (e.g., 10k+)",
    floatingTextLabel: "Metric Label (e.g., Happy Customers)",
    showFloatingSwitch: "Display floating customer badge over hero image",
    showTrustSwitch: "Display trust indicators (In Stock, 24h Delivery, Secure Checkout)",
    heroActiveSwitch: "Enable Hero Section on storefront homepage",
    webpOptBadge: "Auto WebP Image Optimization",
    unsavedHint: 'You have unsaved changes in the live preview — click "Save Changes" to publish.',
    syncedHint: "All Hero Section settings are saved and synced with your live storefront.",
    valTitleMin: "Main title must be at least 2 characters",
    valTitleMax: "Main title cannot exceed 80 characters",
    valHighlightMax: "Highlighted text cannot exceed 50 characters",
    valSubtitleMin: "Subtitle must be at least 10 characters",
    valSubtitleMax: "Subtitle cannot exceed 260 characters",
    valBadgeMax: "Badge text cannot exceed 60 characters",
    valBtnTextMin: "Button text must be at least 2 characters",
    valBtnTextMax: "Button text cannot exceed 40 characters",
    valBtnUrlInvalid: "Enter a valid URL (https://...) or internal path starting with / (e.g., /store/products)",
    valHexInvalid: "Enter a valid Hex color code (e.g., #ffffff)",
    toastSaved: "Hero Section updated and published to storefront!",
    toastReset: "Hero Section restored to default settings!",
    toastInvalidType: "Unsupported image format. Please upload WebP, PNG, or JPG.",
    toastFileTooLarge: "Image size exceeds the 5MB maximum limit.",
  },
  fr: {
    moduleTitle: "Gestionnaire de la Section Hero",
    moduleSubtitle:
      "Contrôle complet des titres, boutons d'action, couleurs et image principale avec aperçu en direct",
    viewLiveStore: "Voir la Boutique",
    resetDefaults: "Réinitialiser",
    saveChanges: "Enregistrer",
    saving: "Enregistrement...",
    livePreviewTitle: "Aperçu en Direct (Live Preview)",
    livePreviewSubtitle: "Visualisez vos modifications en temps réel avant de sauvegarder",
    desktopView: "Bureau",
    mobileView: "Mobile",
    activeStatus: "Actif sur la boutique",
    hiddenStatus: "Masqué",
    textSectionTitle: "Contenu Textuel et Titres",
    textSectionDesc: "Configurez le badge, le titre principal, le mot en surbrillance et le sous-titre",
    badgeLabel: "Texte du Badge Supérieur",
    badgePlaceholder: "ex: Premium E-Commerce Experience",
    titleLabel: "Titre Principal",
    titlePlaceholder: "ex: Elevate Your",
    highlightLabel: "Texte en Surbrillance",
    highlightPlaceholder: "ex: Lifestyle.",
    subtitleLabel: "Sous-titre / Description",
    subtitlePlaceholder: "Décrivez votre boutique et vos produits...",
    ctaSectionTitle: "Boutons d'Action (CTA)",
    ctaSectionDesc: "Personnalisez le texte et les liens des boutons",
    primaryBtnTextLabel: "Texte du Bouton Principal",
    primaryBtnUrlLabel: "Lien du Bouton Principal (URL)",
    secondaryBtnTextLabel: "Texte du Bouton Secondaire",
    secondaryBtnUrlLabel: "Lien du Bouton Secondaire (URL)",
    imageAndColorsTitle: "Image Hero et Palette de Couleurs",
    imageAndColorsDesc:
      "Téléchargez une image (optimisée automatiquement en WebP) et personnalisez les couleurs",
    dropzoneTitle: "Glissez-déposez l'image ici ou cliquez pour parcourir",
    dropzoneSub: "Formats WebP, PNG, JPG (Max 5 Mo) — Optimisation WebP automatique",
    chooseImageBtn: "Choisir une image",
    removeNewImageBtn: "Annuler l'image choisie",
    imagePathLabel: "Chemin de l'image (Image Path)",
    bgColorLabel: "Couleur d'arrière-plan",
    accentColorLabel: "Couleur d'accentuation",
    textColorLabel: "Couleur du titre",
    extrasTitle: "Badge Flottant et Indicateurs de Confiance",
    extrasDesc: "Configurez la carte client flottante et les badges de réassurance",
    floatingValueLabel: "Valeur statistique (ex: 10k+)",
    floatingTextLabel: "Libellé du badge (ex: Happy Customers)",
    showFloatingSwitch: "Afficher le badge client flottant sur l'image",
    showTrustSwitch: "Afficher les indicateurs de confiance",
    heroActiveSwitch: "Activer la section Hero sur la page d'accueil",
    webpOptBadge: "Optimisation WebP Automatique",
    unsavedHint: "Modifications non enregistrées — cliquez sur « Enregistrer » pour publier.",
    syncedHint: "Tous les paramètres Hero sont synchronisés avec la boutique.",
    valTitleMin: "Le titre principal doit comporter au moins 2 caractères",
    valTitleMax: "Le titre ne doit pas dépasser 80 caractères",
    valHighlightMax: "Le texte en surbrillance ne doit pas dépasser 50 caractères",
    valSubtitleMin: "Le sous-titre doit comporter au moins 10 caractères",
    valSubtitleMax: "Le sous-titre ne doit pas dépasser 260 caractères",
    valBadgeMax: "Le badge ne doit pas dépasser 60 caractères",
    valBtnTextMin: "Le texte du bouton doit comporter au moins 2 caractères",
    valBtnTextMax: "Le texte du bouton ne doit pas dépasser 40 caractères",
    valBtnUrlInvalid: "Saisissez une URL valide (https://...) ou un chemin commençant par /",
    valHexInvalid: "Saisissez un code couleur Hex valide (ex: #ffffff)",
    toastSaved: "Section Hero mise à jour avec succès !",
    toastReset: "Paramètres par défaut restaurés !",
    toastInvalidType: "Format non supporté. Utilisez WebP, PNG ou JPG.",
    toastFileTooLarge: "La taille de l'image dépasse la limite de 5 Mo.",
  },
}

interface HeroSectionManagerProps {
  compact?: boolean
}

export function HeroSectionManager({ compact = false }: HeroSectionManagerProps) {
  const { language, direction } = useLocaleStore()
  const isRtl = direction === "rtl"
  const copy = HERO_I18N[language] || HERO_I18N.en

  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [localImagePreview, setLocalImagePreview] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [lastOptimization, setLastOptimization] = useState<{
    originalSize: number
    optimizedSize: number
    savedPercent: number
    width?: number
    height?: number
    format: string
  } | null>(null)

  const formSchema = useMemo(
    () =>
      z.object({
        badgeText: z.string().trim().max(60, copy.valBadgeMax).optional().or(z.literal("")),
        title: z.string().trim().min(2, copy.valTitleMin).max(80, copy.valTitleMax),
        highlightText: z
          .string()
          .trim()
          .max(50, copy.valHighlightMax)
          .optional()
          .or(z.literal("")),
        subtitle: z
          .string()
          .trim()
          .min(10, copy.valSubtitleMin)
          .max(260, copy.valSubtitleMax),
        buttonText: z
          .string()
          .trim()
          .min(2, copy.valBtnTextMin)
          .max(40, copy.valBtnTextMax),
        buttonUrl: z
          .string()
          .trim()
          .min(1, copy.valBtnUrlInvalid)
          .max(255)
          .refine(isValidHeroUrlOrPath, copy.valBtnUrlInvalid),
        secondaryButtonText: z
          .string()
          .trim()
          .max(40, copy.valBtnTextMax)
          .optional()
          .or(z.literal("")),
        secondaryButtonUrl: z
          .string()
          .trim()
          .max(255)
          .refine((val) => !val || isValidHeroUrlOrPath(val), copy.valBtnUrlInvalid)
          .optional()
          .or(z.literal("")),
        imagePath: z.string().trim().min(1),
        backgroundColor: z.string().trim().regex(HEX_COLOR_REGEX, copy.valHexInvalid),
        accentColor: z.string().trim().regex(HEX_COLOR_REGEX, copy.valHexInvalid),
        textColor: z.string().trim().regex(HEX_COLOR_REGEX, copy.valHexInvalid),
        floatingBadgeValue: z.string().trim().max(15).optional().or(z.literal("")),
        floatingBadgeLabel: z.string().trim().max(40).optional().or(z.literal("")),
        showFloatingBadge: z.boolean(),
        showTrustBadges: z.boolean(),
        isActive: z.boolean(),
      }),
    [copy]
  )

  type FormValues = z.infer<typeof formSchema>

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      badgeText: DEFAULT_HERO_SECTION.badgeText,
      title: DEFAULT_HERO_SECTION.title,
      highlightText: DEFAULT_HERO_SECTION.highlightText,
      subtitle: DEFAULT_HERO_SECTION.subtitle,
      buttonText: DEFAULT_HERO_SECTION.buttonText,
      buttonUrl: DEFAULT_HERO_SECTION.buttonUrl,
      secondaryButtonText: DEFAULT_HERO_SECTION.secondaryButtonText,
      secondaryButtonUrl: DEFAULT_HERO_SECTION.secondaryButtonUrl,
      imagePath: DEFAULT_HERO_SECTION.imagePath,
      backgroundColor: DEFAULT_HERO_SECTION.backgroundColor,
      accentColor: DEFAULT_HERO_SECTION.accentColor,
      textColor: DEFAULT_HERO_SECTION.textColor,
      floatingBadgeValue: DEFAULT_HERO_SECTION.floatingBadgeValue,
      floatingBadgeLabel: DEFAULT_HERO_SECTION.floatingBadgeLabel,
      showFloatingBadge: DEFAULT_HERO_SECTION.showFloatingBadge,
      showTrustBadges: DEFAULT_HERO_SECTION.showTrustBadges,
      isActive: DEFAULT_HERO_SECTION.isActive,
    },
  })

  // Watch all fields for real-time Live Preview
  const watched = watch()

  // Load current Hero configuration via GET /api/store/hero
  useEffect(() => {
    let active = true
    async function fetchHero() {
      setLoadingInitial(true)
      try {
        const res = await fetch("/api/store/hero", { cache: "no-store" })
        const data = await res.json()
        if (active && data.success && data.hero) {
          const h: HeroSectionData = data.hero
          reset({
            badgeText: h.badgeText ?? DEFAULT_HERO_SECTION.badgeText,
            title: h.title ?? DEFAULT_HERO_SECTION.title,
            highlightText: h.highlightText ?? DEFAULT_HERO_SECTION.highlightText,
            subtitle: h.subtitle ?? DEFAULT_HERO_SECTION.subtitle,
            buttonText: h.buttonText ?? DEFAULT_HERO_SECTION.buttonText,
            buttonUrl: h.buttonUrl ?? DEFAULT_HERO_SECTION.buttonUrl,
            secondaryButtonText:
              h.secondaryButtonText ?? DEFAULT_HERO_SECTION.secondaryButtonText,
            secondaryButtonUrl:
              h.secondaryButtonUrl ?? DEFAULT_HERO_SECTION.secondaryButtonUrl,
            imagePath: h.imagePath ?? DEFAULT_HERO_SECTION.imagePath,
            backgroundColor: h.backgroundColor ?? DEFAULT_HERO_SECTION.backgroundColor,
            accentColor: h.accentColor ?? DEFAULT_HERO_SECTION.accentColor,
            textColor: h.textColor ?? DEFAULT_HERO_SECTION.textColor,
            floatingBadgeValue:
              h.floatingBadgeValue ?? DEFAULT_HERO_SECTION.floatingBadgeValue,
            floatingBadgeLabel:
              h.floatingBadgeLabel ?? DEFAULT_HERO_SECTION.floatingBadgeLabel,
            showFloatingBadge:
              typeof h.showFloatingBadge === "boolean" ? h.showFloatingBadge : true,
            showTrustBadges:
              typeof h.showTrustBadges === "boolean" ? h.showTrustBadges : true,
            isActive: typeof h.isActive === "boolean" ? h.isActive : true,
          })
        }
      } catch (err) {
        console.error("Failed to fetch hero config:", err)
      } finally {
        if (active) setLoadingInitial(false)
      }
    }
    fetchHero()
    return () => {
      active = false
    }
  }, [reset])

  // Process selected or dropped image file
  const handleSelectImageFile = (file: File) => {
    if (
      !ALLOWED_HERO_IMAGE_TYPES.includes(
        file.type as (typeof ALLOWED_HERO_IMAGE_TYPES)[number]
      )
    ) {
      toast.error(copy.toastInvalidType)
      return
    }
    if (file.size > MAX_HERO_IMAGE_SIZE_BYTES) {
      toast.error(copy.toastFileTooLarge)
      return
    }

    setSelectedFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setLocalImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDiscardSelectedImage = () => {
    setSelectedFile(null)
    setLocalImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Submit form via PUT /api/store/hero (multipart/form-data)
  const onSubmit = async (values: FormValues) => {
    try {
      const formData = new FormData()
      formData.append("badgeText", values.badgeText || "")
      formData.append("title", values.title)
      formData.append("highlightText", values.highlightText || "")
      formData.append("subtitle", values.subtitle)
      formData.append("buttonText", values.buttonText)
      formData.append("buttonUrl", values.buttonUrl)
      formData.append("secondaryButtonText", values.secondaryButtonText || "")
      formData.append("secondaryButtonUrl", values.secondaryButtonUrl || "")
      formData.append("imagePath", values.imagePath)
      formData.append("backgroundColor", values.backgroundColor)
      formData.append("accentColor", values.accentColor)
      formData.append("textColor", values.textColor)
      formData.append("floatingBadgeValue", values.floatingBadgeValue || "")
      formData.append("floatingBadgeLabel", values.floatingBadgeLabel || "")
      formData.append("showFloatingBadge", String(values.showFloatingBadge))
      formData.append("showTrustBadges", String(values.showTrustBadges))
      formData.append("isActive", String(values.isActive))

      if (selectedFile) {
        formData.append("image", selectedFile)
      }

      const res = await fetch("/api/store/hero", {
        method: "PUT",
        body: formData,
      })

      const result = await res.json()
      if (!res.ok || !result.success) {
        toast.error(result.error || "Failed to update Hero Section")
        return
      }

      const updated: HeroSectionData = result.hero
      reset({
        badgeText: updated.badgeText,
        title: updated.title,
        highlightText: updated.highlightText,
        subtitle: updated.subtitle,
        buttonText: updated.buttonText,
        buttonUrl: updated.buttonUrl,
        secondaryButtonText: updated.secondaryButtonText,
        secondaryButtonUrl: updated.secondaryButtonUrl,
        imagePath: updated.imagePath,
        backgroundColor: updated.backgroundColor,
        accentColor: updated.accentColor,
        textColor: updated.textColor,
        floatingBadgeValue: updated.floatingBadgeValue,
        floatingBadgeLabel: updated.floatingBadgeLabel,
        showFloatingBadge: updated.showFloatingBadge,
        showTrustBadges: updated.showTrustBadges,
        isActive: updated.isActive,
      })

      setSelectedFile(null)
      setLocalImagePreview(null)
      if (result.optimization) {
        setLastOptimization(result.optimization)
      }
      toast.success(copy.toastSaved)
    } catch (error: any) {
      toast.error(error.message || "Unexpected error while saving Hero Section")
    }
  }

  // Reset to default hero settings
  const handleResetDefaults = async () => {
    try {
      const res = await fetch("/api/store/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset" }),
      })
      const result = await res.json()
      if (res.ok && result.success && result.hero) {
        const h: HeroSectionData = result.hero
        reset({
          badgeText: h.badgeText,
          title: h.title,
          highlightText: h.highlightText,
          subtitle: h.subtitle,
          buttonText: h.buttonText,
          buttonUrl: h.buttonUrl,
          secondaryButtonText: h.secondaryButtonText,
          secondaryButtonUrl: h.secondaryButtonUrl,
          imagePath: h.imagePath,
          backgroundColor: h.backgroundColor,
          accentColor: h.accentColor,
          textColor: h.textColor,
          floatingBadgeValue: h.floatingBadgeValue,
          floatingBadgeLabel: h.floatingBadgeLabel,
          showFloatingBadge: h.showFloatingBadge,
          showTrustBadges: h.showTrustBadges,
          isActive: h.isActive,
        })
        setSelectedFile(null)
        setLocalImagePreview(null)
        setLastOptimization(null)
        toast.success(copy.toastReset)
      }
    } catch {
      toast.error("Failed to reset Hero Section")
    }
  }

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    return `${(bytes / 1024).toFixed(1)} KB`
  }

  const effectivePreviewImage =
    localImagePreview || watched.imagePath || "/hero_products.png"

  if (loadingInitial) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
        <p className="text-xs font-medium">{copy.saving}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 font-sans" dir={direction}>
      {/* Top Header (unless embedded in compact mode) */}
      {!compact && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-2xs shrink-0">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                {copy.moduleTitle}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                {copy.moduleSubtitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="gap-1.5 text-xs h-9 px-3.5 rounded-xl cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{copy.resetDefaults}</span>
            </Button>

            <Link href="http://localhost:3001/store" target="_blank">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-foreground/90 border-border/80 hover:border-primary/50 hover:text-primary hover:bg-primary/5 text-xs h-9 px-3.5 font-semibold rounded-xl cursor-pointer"
              >
                <ExternalLink className="h-3.5 w-3.5 text-primary" />
                <span>{copy.viewLiveStore}</span>
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 1. REAL-TIME INTERACTIVE LIVE PREVIEW (المعاينة المباشرة)           */}
      {/* =================================================================== */}
      <Card className="border border-border/80 bg-card shadow-xs rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-5 bg-muted/30 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Eye className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-sm sm:text-base font-bold">
                    {copy.livePreviewTitle}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-semibold px-2 py-0.5",
                      watched.isActive
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                    )}
                  >
                    {watched.isActive ? copy.activeStatus : copy.hiddenStatus}
                  </Badge>
                </div>
                <CardDescription className="text-xs">
                  {copy.livePreviewSubtitle}
                </CardDescription>
              </div>
            </div>

            {/* Viewport Switcher (Desktop / Mobile) */}
            <div className="flex items-center gap-2">
              <div className="inline-flex rounded-xl bg-background p-1 border border-border/70 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setPreviewViewport("desktop")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    previewViewport === "desktop"
                      ? "bg-primary text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Laptop className="h-3.5 w-3.5" />
                  <span>{copy.desktopView}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewViewport("mobile")}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer",
                    previewViewport === "mobile"
                      ? "bg-primary text-white shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Smartphone className="h-3.5 w-3.5" />
                  <span>{copy.mobileView}</span>
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 bg-slate-100/70 dark:bg-slate-900/50 flex justify-center">
          {/* Simulated Storefront Browser Frame */}
          <div
            dir="ltr"
            className={cn(
              "w-full rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg overflow-hidden transition-all duration-300",
              previewViewport === "mobile" ? "max-w-[390px]" : "max-w-5xl"
            )}
            style={{
              backgroundColor: watched.backgroundColor || "#ffffff",
            }}
          >
            {/* Browser Top Bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-100/90 border-b border-gray-200 text-xs text-gray-500">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>
              <div className="px-3 py-0.5 rounded-md bg-white border border-gray-200 text-[11px] font-mono text-gray-600 truncate max-w-xs">
                http://localhost:3001/store
              </div>
              <div className="text-[10px] font-semibold text-gray-400">
                {previewViewport === "mobile" ? "390px" : "1280px"}
              </div>
            </div>

            {/* Storefront Hero Section Live Render */}
            <section
              className="relative overflow-hidden transition-colors duration-300"
              style={{
                backgroundColor: watched.backgroundColor || "#ffffff",
              }}
            >
              {/* Subtle Ambient Glow */}
              <div
                className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[110px] opacity-25 pointer-events-none"
                style={{ backgroundColor: watched.accentColor || "#ff2d55" }}
              />

              <div
                className={cn(
                  "mx-auto px-6 relative z-10",
                  previewViewport === "mobile" ? "py-8" : "py-10 md:py-14"
                )}
              >
                <div
                  className={cn(
                    "grid gap-8 items-center",
                    previewViewport === "mobile"
                      ? "grid-cols-1"
                      : "grid-cols-1 lg:grid-cols-2"
                  )}
                >
                  {/* Left Column: Text & CTAs */}
                  <div className="max-w-xl text-left">
                    {watched.badgeText && (
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-4 shadow-2xs border"
                        style={{
                          backgroundColor: `${watched.accentColor || "#ff2d55"}12`,
                          borderColor: `${watched.accentColor || "#ff2d55"}30`,
                          color: watched.accentColor || "#ff2d55",
                        }}
                      >
                        <Star
                          className="w-3 h-3"
                          style={{
                            fill: watched.accentColor || "#ff2d55",
                            color: watched.accentColor || "#ff2d55",
                          }}
                        />
                        <span>{watched.badgeText}</span>
                      </div>
                    )}

                    <h2
                      className={cn(
                        "font-bold tracking-tight leading-tight mb-4",
                        previewViewport === "mobile"
                          ? "text-2xl"
                          : "text-3xl md:text-4xl"
                      )}
                      style={{
                        color: watched.textColor || "#111827",
                      }}
                    >
                      {watched.title || "Elevate Your"}{" "}
                      {watched.highlightText && (
                        <>
                          <br className="hidden md:block" />
                          <span
                            style={{
                              color: watched.accentColor || "#ff2d55",
                            }}
                          >
                            {watched.highlightText}
                          </span>
                        </>
                      )}
                    </h2>

                    <p
                      className={cn(
                        "mb-6 leading-relaxed opacity-80",
                        previewViewport === "mobile" ? "text-xs" : "text-sm md:text-base"
                      )}
                      style={{
                        color: watched.textColor || "#111827",
                      }}
                    >
                      {watched.subtitle ||
                        "Discover our curated collection of premium products."}
                    </p>

                    <div className="flex flex-wrap items-center gap-3">
                      <span
                        className="inline-flex items-center justify-center text-white px-5 py-2.5 rounded-full font-medium text-xs sm:text-sm shadow-md transition-transform hover:scale-105 cursor-pointer"
                        style={{
                          backgroundColor: watched.accentColor || "#ff2d55",
                        }}
                      >
                        <span className="flex items-center gap-2">
                          {watched.buttonText || "Shop Collection"}
                          <ArrowRight className="w-4 h-4" />
                        </span>
                      </span>

                      {watched.secondaryButtonText && (
                        <span className="inline-flex items-center justify-center bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-full font-medium text-xs sm:text-sm shadow-2xs cursor-pointer">
                          {watched.secondaryButtonText}
                        </span>
                      )}
                    </div>

                    {watched.showTrustBadges && (
                      <div
                        className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-medium opacity-75"
                        style={{ color: watched.textColor || "#111827" }}
                      >
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-500" /> In Stock
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-blue-500" /> 24h Delivery
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-purple-500" /> Secure Checkout
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column: Hero Image & Floating Badge */}
                  <div
                    className={cn(
                      "relative w-full",
                      previewViewport === "mobile"
                        ? "h-[240px]"
                        : "h-[300px] md:h-[340px]"
                    )}
                  >
                    <div
                      className="absolute inset-0 rounded-[1.75rem] transform rotate-2 scale-105 -z-10 opacity-20"
                      style={{
                        backgroundColor: watched.accentColor || "#ff2d55",
                      }}
                    />
                    <img
                      src={effectivePreviewImage}
                      alt={watched.title || "Hero Preview"}
                      className="w-full h-full object-cover rounded-[1.75rem] shadow-lg ring-1 ring-gray-900/5 bg-gray-50"
                    />

                    {watched.showFloatingBadge &&
                      (watched.floatingBadgeValue || watched.floatingBadgeLabel) && (
                        <div className="absolute -bottom-3 left-3 md:bottom-5 md:-left-4 bg-white/95 backdrop-blur-xs p-3 rounded-xl shadow-md border border-gray-100">
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border"
                              style={{
                                backgroundColor: `${watched.accentColor || "#ff2d55"}12`,
                                borderColor: `${watched.accentColor || "#ff2d55"}30`,
                                color: watched.accentColor || "#ff2d55",
                              }}
                            >
                              {watched.floatingBadgeValue || "10k+"}
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-gray-800">
                                {watched.floatingBadgeLabel || "Happy Customers"}
                              </p>
                              <div className="flex text-yellow-400">
                                <Star className="fill-current w-2.5 h-2.5" />
                                <Star className="fill-current w-2.5 h-2.5" />
                                <Star className="fill-current w-2.5 h-2.5" />
                                <Star className="fill-current w-2.5 h-2.5" />
                                <Star className="fill-current w-2.5 h-2.5" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </CardContent>
      </Card>

      {/* =================================================================== */}
      {/* 2. INTERACTIVE FORM (Text, CTA Links, Drag & Drop Image, Colors)     */}
      {/* =================================================================== */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left / Main Form Column: Headlines + CTA Buttons */}
          <div className="lg:col-span-7 space-y-6">
            {/* Headlines & Text Content Card */}
            <Card className="border border-border/80 bg-card shadow-xs rounded-2xl">
              <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Type className="h-4 w-4 text-primary" />
                  <span>{copy.textSectionTitle}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {copy.textSectionDesc}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-4">
                {/* Badge Text */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hero-badge" className="text-xs font-semibold">
                      {copy.badgeLabel}
                    </Label>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {(watched.badgeText || "").length}/60
                    </span>
                  </div>
                  <Input
                    id="hero-badge"
                    placeholder={copy.badgePlaceholder}
                    className={cn(
                      "h-10 rounded-xl",
                      errors.badgeText && "border-destructive"
                    )}
                    {...register("badgeText")}
                  />
                  {errors.badgeText && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{errors.badgeText.message}</span>
                    </p>
                  )}
                </div>

                {/* Main Title + Highlighted Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="hero-title" className="text-xs font-semibold">
                        {copy.titleLabel} <span className="text-primary">*</span>
                      </Label>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {(watched.title || "").length}/80
                      </span>
                    </div>
                    <Input
                      id="hero-title"
                      placeholder={copy.titlePlaceholder}
                      className={cn(
                        "h-10 rounded-xl",
                        errors.title && "border-destructive"
                      )}
                      {...register("title")}
                    />
                    {errors.title && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{errors.title.message}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="hero-highlight"
                        className="text-xs font-semibold"
                      >
                        {copy.highlightLabel}
                      </Label>
                      <span className="text-[11px] text-muted-foreground font-mono">
                        {(watched.highlightText || "").length}/50
                      </span>
                    </div>
                    <Input
                      id="hero-highlight"
                      placeholder={copy.highlightPlaceholder}
                      className={cn(
                        "h-10 rounded-xl",
                        errors.highlightText && "border-destructive"
                      )}
                      {...register("highlightText")}
                    />
                    {errors.highlightText && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{errors.highlightText.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Subtitle */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hero-subtitle" className="text-xs font-semibold">
                      {copy.subtitleLabel} <span className="text-primary">*</span>
                    </Label>
                    <span className="text-[11px] text-muted-foreground font-mono">
                      {(watched.subtitle || "").length}/260
                    </span>
                  </div>
                  <Textarea
                    id="hero-subtitle"
                    rows={3}
                    placeholder={copy.subtitlePlaceholder}
                    className={cn(
                      "rounded-xl resize-none",
                      errors.subtitle && "border-destructive"
                    )}
                    {...register("subtitle")}
                  />
                  {errors.subtitle && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      <span>{errors.subtitle.message}</span>
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Call-to-Action Buttons Card */}
            <Card className="border border-border/80 bg-card shadow-xs rounded-2xl">
              <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-primary" />
                  <span>{copy.ctaSectionTitle}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {copy.ctaSectionDesc}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                {/* Primary Button */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="hero-btn-text"
                      className="text-xs font-semibold"
                    >
                      {copy.primaryBtnTextLabel}{" "}
                      <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="hero-btn-text"
                      placeholder="Shop Collection"
                      className={cn(
                        "h-10 rounded-xl",
                        errors.buttonText && "border-destructive"
                      )}
                      {...register("buttonText")}
                    />
                    {errors.buttonText && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{errors.buttonText.message}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="hero-btn-url" className="text-xs font-semibold">
                      {copy.primaryBtnUrlLabel}{" "}
                      <span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="hero-btn-url"
                      dir="ltr"
                      placeholder="/store/products"
                      className={cn(
                        "h-10 rounded-xl text-left font-mono text-xs",
                        errors.buttonUrl && "border-destructive"
                      )}
                      {...register("buttonUrl")}
                    />
                    {errors.buttonUrl && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{errors.buttonUrl.message}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Secondary Button */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-border/50">
                  <div className="space-y-1.5">
                    <Label
                      htmlFor="hero-sec-btn-text"
                      className="text-xs font-semibold"
                    >
                      {copy.secondaryBtnTextLabel}
                    </Label>
                    <Input
                      id="hero-sec-btn-text"
                      placeholder="Browse Categories"
                      className={cn(
                        "h-10 rounded-xl",
                        errors.secondaryButtonText && "border-destructive"
                      )}
                      {...register("secondaryButtonText")}
                    />
                    {errors.secondaryButtonText && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{errors.secondaryButtonText.message}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="hero-sec-btn-url"
                      className="text-xs font-semibold"
                    >
                      {copy.secondaryBtnUrlLabel}
                    </Label>
                    <Input
                      id="hero-sec-btn-url"
                      dir="ltr"
                      placeholder="/store/categories"
                      className={cn(
                        "h-10 rounded-xl text-left font-mono text-xs",
                        errors.secondaryButtonUrl && "border-destructive"
                      )}
                      {...register("secondaryButtonUrl")}
                    />
                    {errors.secondaryButtonUrl && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                        <span>{errors.secondaryButtonUrl.message}</span>
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Floating Badge & Visibility Controls */}
            <Card className="border border-border/80 bg-card shadow-xs rounded-2xl">
              <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>{copy.extrasTitle}</span>
                </CardTitle>
                <CardDescription className="text-xs">
                  {copy.extrasDesc}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {copy.floatingValueLabel}
                    </Label>
                    <Input
                      placeholder="10k+"
                      className="h-10 rounded-xl"
                      {...register("floatingBadgeValue")}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {copy.floatingTextLabel}
                    </Label>
                    <Input
                      placeholder="Happy Customers"
                      className="h-10 rounded-xl"
                      {...register("floatingBadgeLabel")}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      {copy.showFloatingSwitch}
                    </span>
                    <Switch
                      checked={watched.showFloatingBadge}
                      onChange={(e) =>
                        setValue("showFloatingBadge", e.target.checked, {
                          shouldDirty: true,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">
                      {copy.showTrustSwitch}
                    </span>
                    <Switch
                      checked={watched.showTrustBadges}
                      onChange={(e) =>
                        setValue("showTrustBadges", e.target.checked, {
                          shouldDirty: true,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary">
                      {copy.heroActiveSwitch}
                    </span>
                    <Switch
                      checked={watched.isActive}
                      onChange={(e) =>
                        setValue("isActive", e.target.checked, {
                          shouldDirty: true,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Drag & Drop Image Upload + Color Pickers */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="border border-border/80 bg-card shadow-xs rounded-2xl">
              <CardHeader className="border-b border-border/60 bg-muted/20 pb-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      <ImageIcon className="h-4 w-4 text-primary" />
                      <span>{copy.imageAndColorsTitle}</span>
                    </CardTitle>
                    <CardDescription className="text-xs mt-0.5">
                      {copy.imageAndColorsDesc}
                    </CardDescription>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] gap-1 shrink-0"
                  >
                    <Zap className="h-3 w-3" />
                    <span>{copy.webpOptBadge}</span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-6 space-y-5">
                {/* Drag & Drop Upload Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    const file = e.dataTransfer.files?.[0]
                    if (file) handleSelectImageFile(file)
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative group rounded-2xl border-2 border-dashed p-5 text-center transition-all cursor-pointer",
                    isDragging
                      ? "border-primary bg-primary/5 ring-4 ring-primary/15"
                      : "border-border/80 bg-muted/25 hover:border-primary/50 hover:bg-muted/40"
                  )}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/webp,image/png,image/jpeg,image/jpg"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleSelectImageFile(file)
                    }}
                  />

                  <div className="relative mx-auto w-full h-44 rounded-xl overflow-hidden bg-background border border-border mb-3 shadow-2xs">
                    <img
                      src={effectivePreviewImage}
                      alt="Selected Hero"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1.5">
                      <Upload className="h-6 w-6" />
                      <span className="text-xs font-semibold">
                        {copy.chooseImageBtn}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-foreground">
                    {copy.dropzoneTitle}
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {copy.dropzoneSub}
                  </p>

                  {selectedFile && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[180px]">
                        {selectedFile.name} ({formatBytes(selectedFile.size)})
                      </span>
                      <button
                        type="button"
                        onClick={handleDiscardSelectedImage}
                        className="text-destructive hover:underline ms-1 cursor-pointer"
                        title={copy.removeNewImageBtn}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}

                  {lastOptimization && !selectedFile && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 text-[11px] font-semibold border border-emerald-500/20">
                      <Zap className="h-3.5 w-3.5" />
                      <span>
                        WebP Optimized: {formatBytes(lastOptimization.optimizedSize)}
                        {lastOptimization.width && lastOptimization.height
                          ? ` (${lastOptimization.width}×${lastOptimization.height})`
                          : ""}
                        {lastOptimization.savedPercent > 0
                          ? ` • Saved ${lastOptimization.savedPercent}%`
                          : ""}
                      </span>
                    </div>
                  )}
                </div>

                {/* Manual Image Path / URL Input */}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="hero-image-path"
                    className="text-xs font-semibold"
                  >
                    {copy.imagePathLabel}
                  </Label>
                  <Input
                    id="hero-image-path"
                    dir="ltr"
                    placeholder="/hero_products.png"
                    className="h-9 rounded-xl text-left font-mono text-xs"
                    {...register("imagePath")}
                  />
                </div>

                {/* Color Pickers Section */}
                <div className="space-y-4 pt-3 border-t border-border/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                    <Palette className="h-4 w-4 text-primary" />
                    <span>{copy.bgColorLabel}</span>
                  </div>

                  {/* Background Color Picker + Swatches */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        value={
                          HEX_COLOR_REGEX.test(watched.backgroundColor || "")
                            ? watched.backgroundColor
                            : "#ffffff"
                        }
                        onChange={(e) =>
                          setValue("backgroundColor", e.target.value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                        className="h-10 w-12 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                      />
                      <Input
                        dir="ltr"
                        placeholder="#ffffff"
                        className={cn(
                          "h-10 rounded-xl font-mono text-xs text-left uppercase",
                          errors.backgroundColor && "border-destructive"
                        )}
                        {...register("backgroundColor")}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {PRESET_BG_COLORS.map((swatch) => (
                        <button
                          key={swatch.value}
                          type="button"
                          onClick={() =>
                            setValue("backgroundColor", swatch.value, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                          title={swatch.label}
                          className={cn(
                            "h-6 w-6 rounded-full border transition-transform hover:scale-110 cursor-pointer",
                            watched.backgroundColor?.toLowerCase() ===
                              swatch.value.toLowerCase()
                              ? "ring-2 ring-primary ring-offset-2"
                              : "border-gray-300"
                          )}
                          style={{ backgroundColor: swatch.value }}
                        />
                      ))}
                    </div>
                    {errors.backgroundColor && (
                      <p className="text-xs text-destructive">
                        {errors.backgroundColor.message}
                      </p>
                    )}
                  </div>

                  {/* Accent Color Picker + Swatches */}
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs font-semibold">
                      {copy.accentColorLabel}
                    </Label>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        value={
                          HEX_COLOR_REGEX.test(watched.accentColor || "")
                            ? watched.accentColor
                            : "#ff2d55"
                        }
                        onChange={(e) =>
                          setValue("accentColor", e.target.value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                        className="h-10 w-12 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                      />
                      <Input
                        dir="ltr"
                        placeholder="#ff2d55"
                        className={cn(
                          "h-10 rounded-xl font-mono text-xs text-left uppercase",
                          errors.accentColor && "border-destructive"
                        )}
                        {...register("accentColor")}
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {PRESET_ACCENT_COLORS.map((swatch) => (
                        <button
                          key={swatch.value}
                          type="button"
                          onClick={() =>
                            setValue("accentColor", swatch.value, {
                              shouldValidate: true,
                              shouldDirty: true,
                            })
                          }
                          title={swatch.label}
                          className={cn(
                            "h-6 w-6 rounded-full border transition-transform hover:scale-110 cursor-pointer",
                            watched.accentColor?.toLowerCase() ===
                              swatch.value.toLowerCase()
                              ? "ring-2 ring-primary ring-offset-2"
                              : "border-gray-300"
                          )}
                          style={{ backgroundColor: swatch.value }}
                        />
                      ))}
                    </div>
                    {errors.accentColor && (
                      <p className="text-xs text-destructive">
                        {errors.accentColor.message}
                      </p>
                    )}
                  </div>

                  {/* Text Color Picker */}
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs font-semibold">
                      {copy.textColorLabel}
                    </Label>
                    <div className="flex items-center gap-2.5">
                      <input
                        type="color"
                        value={
                          HEX_COLOR_REGEX.test(watched.textColor || "")
                            ? watched.textColor
                            : "#111827"
                        }
                        onChange={(e) =>
                          setValue("textColor", e.target.value, {
                            shouldValidate: true,
                            shouldDirty: true,
                          })
                        }
                        className="h-10 w-12 rounded-lg border border-border cursor-pointer bg-transparent p-0.5"
                      />
                      <Input
                        dir="ltr"
                        placeholder="#111827"
                        className={cn(
                          "h-10 rounded-xl font-mono text-xs text-left uppercase",
                          errors.textColor && "border-destructive"
                        )}
                        {...register("textColor")}
                      />
                    </div>
                    {errors.textColor && (
                      <p className="text-xs text-destructive">
                        {errors.textColor.message}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sticky / Bottom Action Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-card border border-border/80 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2
              className={cn(
                "h-4 w-4 shrink-0",
                isDirty || selectedFile ? "text-amber-500" : "text-emerald-500"
              )}
            />
            <span>
              {isDirty || selectedFile ? copy.unsavedHint : copy.syncedHint}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleResetDefaults}
              disabled={isSubmitting}
              className="gap-1.5 text-xs h-10 px-4 rounded-xl cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>{copy.resetDefaults}</span>
            </Button>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-primary hover:bg-[#be123c] text-white text-xs sm:text-sm h-10 px-6 font-semibold rounded-xl shadow-sm shadow-primary/20 hover:shadow-md hover:shadow-primary/30 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isSubmitting ? copy.saving : copy.saveChanges}</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
