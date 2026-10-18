"use client"

/**
 * ============================================================================
 * وحدة إدارة الفوتر والنشرة البريدية وتناغم الخلفيات
 * (Footer & Newsletter CMS + Theme Harmonization + Unified Live Preview)
 * ============================================================================
 * تتضمن:
 * 1. نظام تناغم الخلفيات والألوان (Background & Theme Harmonization - Critical Fix)
 * 2. إدارة قسم النشرة البريدية (Newsletter Section CMS)
 * 3. العلامة التجارية ورفع الشعار وروابط التواصل الاجتماعي مع الأيقونات
 * 4. إدارة قوائم الروابط الديناميكية (Explore & Support) مع CRUD كامل + إعادة الترتيب (Reorder)
 * 5. معلومات الاتصال وشارات الدفع القابلة للتبديل والرفع
 * 6. معاينة حية موحدة (Storefront Header + Newsletter + Footer) محمية ضد XSS
 */

import React, { useState, useRef } from "react"
import { motion } from "framer-motion"
import {
  Mail,
  Sparkles,
  Upload,
  Trash2,
  Plus,
  Phone,
  Clock,
  AlertCircle,
  Eye,
  Share2,
  Compass,
  LifeBuoy,
  ArrowUp,
  ArrowDown,
  Palette,
  Check,
  Globe,
  CreditCard,
  Search,
  User,
  ShoppingCart,
  Grid,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  NewsletterConfig,
  FooterConfig,
  FooterSocialLink,
  FooterNavLink,
  DesktopHeaderConfig,
  NEWSLETTER_GRADIENT_PRESETS,
  THEME_HARMONY_PALETTES,
  SUPPORTED_PAYMENT_METHODS,
  sanitizeText,
  sanitizeUrl,
  isValidUrl,
  isValidEmail,
  isLightColor,
  validateImageMime,
} from "@/lib/theme-config"
import { ColorPickerField, ThemeToggleSwitch, XssProtectionBadge } from "./ThemeAtoms"

interface FooterNewsletterCMSProps {
  newsletter: NewsletterConfig
  footer: FooterConfig
  desktopHeader?: DesktopHeaderConfig
  onUpdateNewsletter: (updated: NewsletterConfig) => void
  onUpdateFooter: (updated: FooterConfig) => void
}

export function FooterNewsletterCMS({
  newsletter,
  footer,
  desktopHeader,
  onUpdateNewsletter,
  onUpdateFooter,
}: FooterNewsletterCMSProps) {
  const logoInputRef = useRef<HTMLInputElement>(null)
  const paymentBadgeInputRef = useRef<HTMLInputElement>(null)

  const [activeCmsSection, setActiveCmsSection] = useState<
    "harmony" | "newsletter" | "brand" | "links" | "contact"
  >("harmony")

  const [uploadError, setUploadError] = useState<string | null>(null)

  // حالة إضافة رابط تواصل اجتماعي جديد
  const [newSocialCode, setNewSocialCode] = useState("")
  const [newSocialLabel, setNewSocialLabel] = useState("")
  const [newSocialUrl, setNewSocialUrl] = useState("")

  // حالة إضافة رابط في قائمة Explore
  const [newExploreLabel, setNewExploreLabel] = useState("")
  const [newExploreUrl, setNewExploreUrl] = useState("")

  // حالة إضافة رابط في قائمة Support
  const [newSupportLabel, setNewSupportLabel] = useState("")
  const [newSupportUrl, setNewSupportUrl] = useState("")

  // حالة إضافة وسيلة دفع مخصصة
  const [newPaymentMethod, setNewPaymentMethod] = useState("")

  // تطبيق قالب تناغم لوني موحد على كل من النشرة البريدية والفوتر
  const applyHarmonyPalette = (palette: (typeof THEME_HARMONY_PALETTES)[number]) => {
    onUpdateNewsletter({
      ...newsletter,
      gradientStart: palette.newsletterStart,
      gradientMiddle: palette.newsletterMiddle,
      gradientEnd: palette.newsletterEnd,
      textColor: palette.newsletterText,
      buttonColor: palette.buttonColor,
      harmonizeWithFooter: true,
    })
    onUpdateFooter({
      ...footer,
      backgroundColor: palette.footerBg,
      textColor: palette.footerText,
      accentColor: palette.footerAccent,
    })
  }

  // رفع شعار العلامة التجارية مع التحقق من نوع وحجم الصورة ومعاينة فورية
  const handleBrandLogoUpload = (file: File | undefined) => {
    if (!file) return
    setUploadError(null)
    const validation = validateImageMime(file, 3)
    if (!validation.valid) {
      setUploadError(validation.error || "Invalid image file.")
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        onUpdateFooter({
          ...footer,
          brandLogoUrl: result,
        })
      }
    }
    reader.readAsDataURL(file)
  }

  // رفع شريط شارات الدفع المخصص
  const handlePaymentBadgeUpload = (file: File | undefined) => {
    if (!file) return
    setUploadError(null)
    const validation = validateImageMime(file, 2)
    if (!validation.valid) {
      setUploadError(validation.error || "Invalid payment badge image.")
      return
    }
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        onUpdateFooter({
          ...footer,
          customPaymentBadgeUrl: result,
        })
      }
    }
    reader.readAsDataURL(file)
  }

  // إضافة رابط تواصل اجتماعي جديد
  const handleAddSocialLink = () => {
    const cleanCode = sanitizeText(newSocialCode, 4).toUpperCase().trim()
    const cleanLabel = sanitizeText(newSocialLabel || cleanCode, 30).trim()
    const cleanUrl = sanitizeUrl(newSocialUrl)
    if (!cleanCode) return

    const nextItem: FooterSocialLink = {
      id: `soc-${Date.now()}`,
      code: cleanCode,
      label: cleanLabel,
      url: cleanUrl,
      enabled: true,
    }

    onUpdateFooter({
      ...footer,
      socialLinks: [...footer.socialLinks, nextItem],
    })
    setNewSocialCode("")
    setNewSocialLabel("")
    setNewSocialUrl("")
  }

  // إضافة رابط إلى قائمة Explore
  const handleAddExploreLink = () => {
    const cleanLabel = sanitizeText(newExploreLabel, 50).trim()
    const cleanUrl = sanitizeUrl(newExploreUrl || "/store")
    if (!cleanLabel) return

    const nextItem: FooterNavLink = {
      id: `exp-${Date.now()}`,
      label: cleanLabel,
      url: cleanUrl,
    }
    onUpdateFooter({
      ...footer,
      exploreLinks: [...footer.exploreLinks, nextItem],
    })
    setNewExploreLabel("")
    setNewExploreUrl("")
  }

  // إعادة ترتيب عناصر قائمة Explore (أعلى / أسفل)
  const moveExploreLink = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= footer.exploreLinks.length) return
    const next = [...footer.exploreLinks]
    const [moved] = next.splice(index, 1)
    next.splice(targetIndex, 0, moved)
    onUpdateFooter({ ...footer, exploreLinks: next })
  }

  // إضافة رابط إلى قائمة Support
  const handleAddSupportLink = () => {
    const cleanLabel = sanitizeText(newSupportLabel, 50).trim()
    const cleanUrl = sanitizeUrl(newSupportUrl || "/store")
    if (!cleanLabel) return

    const nextItem: FooterNavLink = {
      id: `sup-${Date.now()}`,
      label: cleanLabel,
      url: cleanUrl,
    }
    onUpdateFooter({
      ...footer,
      supportLinks: [...footer.supportLinks, nextItem],
    })
    setNewSupportLabel("")
    setNewSupportUrl("")
  }

  // إعادة ترتيب عناصر قائمة Support (أعلى / أسفل)
  const moveSupportLink = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= footer.supportLinks.length) return
    const next = [...footer.supportLinks]
    const [moved] = next.splice(index, 1)
    next.splice(targetIndex, 0, moved)
    onUpdateFooter({ ...footer, supportLinks: next })
  }

  // تبديل تفعيل شارة دفع
  const togglePaymentMethod = (method: string) => {
    const exists = footer.paymentMethods.includes(method)
    const next = exists
      ? footer.paymentMethods.filter((m) => m !== method)
      : [...footer.paymentMethods, method]
    onUpdateFooter({ ...footer, paymentMethods: next })
  }

  // إضافة شارة دفع مخصصة
  const handleAddCustomPaymentMethod = () => {
    const clean = sanitizeText(newPaymentMethod, 24).toUpperCase().trim()
    if (!clean || footer.paymentMethods.includes(clean)) return
    onUpdateFooter({
      ...footer,
      paymentMethods: [...footer.paymentMethods, clean],
    })
    setNewPaymentMethod("")
  }

  // استرجاع أيقونة منصة التواصل الاجتماعي المناسبة (SVG)
  const renderSocialPlatformIcon = (code: string, className = "w-3.5 h-3.5") => {
    const upper = code.toUpperCase()
    if (upper === "FB" || upper.includes("FACE")) {
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    }
    if (upper === "TW" || upper === "X") {
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    }
    if (upper === "IG" || upper.includes("INST")) {
      return (
        <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      )
    }
    if (upper === "YT" || upper.includes("YOU")) {
      return (
        <svg className={className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    }
    return <Globe className={className} />
  }

  // تنسيق نص النشرة البريدية مع إبراز عبارة الخصم بأمان (بدون dangerouslySetInnerHTML)
  const renderHighlightedSubtitle = (
    subtitleRaw: string,
    highlightRaw: string,
    isLightBg: boolean
  ) => {
    const safeSub = sanitizeText(subtitleRaw, 280)
    const safeHighlight = sanitizeText(highlightRaw, 40)
    if (!safeHighlight || !safeSub.includes(safeHighlight)) {
      return <span>{safeSub}</span>
    }
    const parts = safeSub.split(safeHighlight)
    return (
      <>
        {parts.map((part, idx) => (
          <React.Fragment key={idx}>
            {part}
            {idx < parts.length - 1 && (
              <strong className={`font-bold ${isLightBg ? "text-slate-900" : "text-white"}`}>
                {safeHighlight}
              </strong>
            )}
          </React.Fragment>
        ))}
      </>
    )
  }

  const emailValid = !footer.contact.email || isValidEmail(footer.contact.email)
  const isLightNewsletter = isLightColor(newsletter.gradientEnd)
  const isLightFooter = isLightColor(footer.backgroundColor)

  return (
    <div className="space-y-8">
      {/* =================================================================== */}
      {/* شريط التنقل الداخلي لأقسام إدارة الفوتر والنشرة البريدية            */}
      {/* =================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-gray-50/90 p-2 rounded-xl border border-gray-200/80">
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "harmony", label: "1. Theme Harmonization", icon: Palette },
            { id: "newsletter", label: "2. Newsletter CMS", icon: Mail },
            { id: "brand", label: "3. Brand & Logo", icon: Sparkles },
            { id: "links", label: "4. Social & Nav CRUD", icon: Compass },
            { id: "contact", label: "5. Contact & Payments", icon: CreditCard },
          ].map((tab) => {
            const Icon = tab.icon
            const isActive = activeCmsSection === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveCmsSection(tab.id as any)}
                className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#BE123C] text-white shadow-xs"
                    : "text-gray-600 hover:bg-white hover:text-gray-900"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        <XssProtectionBadge />
      </div>

      {/* تنبيه أخطاء رفع الصور إن وجد */}
      {uploadError && (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-2.5 text-xs text-red-700">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{uploadError}</span>
          </div>
          <button
            type="button"
            onClick={() => setUploadError(null)}
            className="font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* =================================================================== */}
      {/* القسم 1: توحيد وتناغم الخلفيات والألوان (Background Harmonization)   */}
      {/* =================================================================== */}
      {activeCmsSection === "harmony" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 bg-gray-50/40 p-5 rounded-2xl border border-gray-100"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/70 pb-3.5">
            <div>
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Palette className="w-4 h-4 text-[#E11D48]" />
                Background & Theme Harmonization (Seamless Newsletter + Footer Sync)
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Unify the Newsletter gradient and Footer background so they blend seamlessly without harsh visual seams, while enforcing WCAG-compliant text contrast.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-semibold shrink-0">
              <Check className="w-3.5 h-3.5" />
              {newsletter.gradientEnd.toLowerCase() === footer.backgroundColor.toLowerCase()
                ? "Seamless Background Synced"
                : "Custom Split Colors"}
            </span>
          </div>

          {/* القوالب الموحدة الجاهزة */}
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-gray-700 block">
              One-Click Unified Theme Palettes (Newsletter + Footer)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {THEME_HARMONY_PALETTES.map((palette) => {
                const isSelected =
                  newsletter.gradientStart.toLowerCase() === palette.newsletterStart.toLowerCase() &&
                  footer.backgroundColor.toLowerCase() === palette.footerBg.toLowerCase()
                return (
                  <button
                    key={palette.id}
                    type="button"
                    onClick={() => applyHarmonyPalette(palette)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? "border-[#E11D48] ring-2 ring-[#E11D48]/20 bg-white shadow-xs"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div>
                      <div
                        className="h-10 w-full rounded-lg mb-2.5 relative overflow-hidden border border-black/10 flex items-end p-1.5"
                        style={{
                          background: `linear-gradient(135deg, ${palette.newsletterStart} 0%, ${palette.newsletterMiddle} 55%, ${palette.footerBg} 100%)`,
                        }}
                      >
                        <div className="flex items-center gap-1 ml-auto">
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-2xs"
                            style={{ backgroundColor: palette.buttonColor }}
                            title="Newsletter Button"
                          />
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-white/40 shadow-2xs"
                            style={{ backgroundColor: palette.footerAccent }}
                            title="Footer Accent"
                          />
                        </div>
                      </div>
                      <div className="text-xs font-bold text-gray-900 flex items-center justify-between">
                        <span>{palette.name}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#E11D48] shrink-0" />}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1 leading-snug">
                        {palette.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* مفاتيح التحكم في التناغم اللوني والشبكة الهندسية */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <ThemeToggleSwitch
              label="Lock Newsletter Base to Footer Background"
              description="Automatically keeps Newsletter bottom gradient identical to Footer background for a 100% seamless transition"
              checked={newsletter.harmonizeWithFooter !== false}
              onChange={(checked) => {
                onUpdateNewsletter({
                  ...newsletter,
                  harmonizeWithFooter: checked,
                  gradientEnd: checked ? footer.backgroundColor : newsletter.gradientEnd,
                })
              }}
            />

            <ThemeToggleSwitch
              label="Architectural Grid Overlay"
              description="Render the subtle geometric grid pattern across the Newsletter & Footer backdrop"
              checked={newsletter.showGridOverlay !== false}
              onChange={(checked) =>
                onUpdateNewsletter({ ...newsletter, showGridOverlay: checked })
              }
            />
          </div>

          {/* محرر الألوان الموحد السريع */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <ColorPickerField
              label="Unified Base Background (Newsletter End & Footer)"
              value={footer.backgroundColor}
              onChange={(hex) => {
                const light = isLightColor(hex)
                onUpdateFooter({
                  ...footer,
                  backgroundColor: hex,
                  textColor: light ? "#475569" : "#94A3B8",
                })
                if (newsletter.harmonizeWithFooter !== false) {
                  onUpdateNewsletter({
                    ...newsletter,
                    gradientEnd: hex,
                    textColor: light ? "#0F172A" : "#FFFFFF",
                  })
                }
              }}
            />
            <ColorPickerField
              label="Newsletter Ambient Glow (Top-Left)"
              value={newsletter.gradientStart}
              onChange={(hex) => onUpdateNewsletter({ ...newsletter, gradientStart: hex })}
            />
            <ColorPickerField
              label="Footer Accent Color (Links & Labels)"
              value={footer.accentColor}
              onChange={(hex) => onUpdateFooter({ ...footer, accentColor: hex })}
            />
          </div>
        </motion.div>
      )}

      {/* =================================================================== */}
      {/* القسم 2: إدارة النشرة البريدية (Newsletter Section CMS)             */}
      {/* =================================================================== */}
      {activeCmsSection === "newsletter" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 bg-gray-50/40 p-5 rounded-2xl border border-gray-100"
        >
          <div className="flex items-center justify-between border-b border-gray-200/70 pb-3">
            <div>
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#E11D48]" />
                Newsletter Banner Configuration
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                Customize the pre-footer newsletter signup banner, button color, and background gradient.
              </p>
            </div>
            <ThemeToggleSwitch
              label="Show Newsletter"
              checked={newsletter.enabled}
              onChange={(checked) => onUpdateNewsletter({ ...newsletter, enabled: checked })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Badge Label</label>
              <Input
                value={newsletter.badgeText}
                onChange={(e) =>
                  onUpdateNewsletter({
                    ...newsletter,
                    badgeText: sanitizeText(e.target.value, 30),
                  })
                }
                placeholder="NEWSLETTER"
                className="bg-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Main Heading</label>
              <Input
                value={newsletter.title}
                onChange={(e) =>
                  onUpdateNewsletter({
                    ...newsletter,
                    title: sanitizeText(e.target.value, 80),
                  })
                }
                placeholder="Join The Club"
                className="bg-white text-xs font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Highlighted Discount Text</label>
              <Input
                value={newsletter.highlightDiscount}
                onChange={(e) =>
                  onUpdateNewsletter({
                    ...newsletter,
                    highlightDiscount: sanitizeText(e.target.value, 30),
                  })
                }
                placeholder="15% off"
                className="bg-white text-xs"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">Subtitle Description</label>
            <textarea
              rows={2}
              value={newsletter.subtitle}
              onChange={(e) =>
                onUpdateNewsletter({
                  ...newsletter,
                  subtitle: sanitizeText(e.target.value, 260),
                })
              }
              placeholder="Subscribe to our newsletter and get 15% off your first order..."
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Email Input Placeholder</label>
              <Input
                value={newsletter.inputPlaceholder}
                onChange={(e) =>
                  onUpdateNewsletter({
                    ...newsletter,
                    inputPlaceholder: sanitizeText(e.target.value, 60),
                  })
                }
                placeholder="Enter your email address..."
                className="bg-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Subscribe Button Text</label>
              <Input
                value={newsletter.buttonText}
                onChange={(e) =>
                  onUpdateNewsletter({
                    ...newsletter,
                    buttonText: sanitizeText(e.target.value, 30),
                  })
                }
                placeholder="Subscribe"
                className="bg-white text-xs font-semibold"
              />
            </div>
          </div>

          {/* اختيار تدرج الخلفية ولون الزر */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-semibold text-gray-700 block">
              Background Gradient Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {NEWSLETTER_GRADIENT_PRESETS.map((preset) => {
                const isSelected =
                  newsletter.gradientStart.toLowerCase() === preset.start.toLowerCase() &&
                  newsletter.gradientEnd.toLowerCase() === preset.end.toLowerCase()
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => {
                      const light = isLightColor(preset.end)
                      onUpdateNewsletter({
                        ...newsletter,
                        gradientStart: preset.start,
                        gradientMiddle: preset.middle,
                        gradientEnd: preset.end,
                        textColor: light ? "#0F172A" : "#FFFFFF",
                      })
                      if (newsletter.harmonizeWithFooter !== false) {
                        onUpdateFooter({
                          ...footer,
                          backgroundColor: preset.end,
                          textColor: light ? "#475569" : "#94A3B8",
                        })
                      }
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? "border-[#E11D48] ring-2 ring-[#E11D48]/20 bg-white"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div
                      className="h-7 w-full rounded-lg mb-1.5 shadow-inner border border-black/10"
                      style={{
                        background: `linear-gradient(135deg, ${preset.start} 0%, ${preset.middle} 50%, ${preset.end} 100%)`,
                      }}
                    />
                    <span className="text-[11px] font-semibold text-gray-700 block truncate">
                      {preset.name}
                    </span>
                  </button>
                )
              })}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <ColorPickerField
                label="Subscribe button color"
                value={newsletter.buttonColor}
                onChange={(hex) => onUpdateNewsletter({ ...newsletter, buttonColor: hex })}
              />
              <ColorPickerField
                label="Gradient start (Glow)"
                value={newsletter.gradientStart}
                onChange={(hex) => onUpdateNewsletter({ ...newsletter, gradientStart: hex })}
              />
              <ColorPickerField
                label="Gradient base (Bottom)"
                value={newsletter.gradientEnd}
                onChange={(hex) => {
                  onUpdateNewsletter({ ...newsletter, gradientEnd: hex })
                  if (newsletter.harmonizeWithFooter !== false) {
                    onUpdateFooter({ ...footer, backgroundColor: hex })
                  }
                }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* =================================================================== */}
      {/* القسم 3: العلامة التجارية والشعار والسلوجان (Brand & Slogan CMS)     */}
      {/* =================================================================== */}
      {activeCmsSection === "brand" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 bg-gray-50/40 p-5 rounded-2xl border border-gray-100"
        >
          <div className="border-b border-gray-200/70 pb-3">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#E11D48]" />
              Brand Identity, Store Logo Upload & Tagline
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload your store logo (validated for PNG, WebP, JPEG, SVG), customize brand title, tagline, and footer colors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* رفع الشعار مع السحب والإفلات والتحقق من الصيغة */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-700 block">
                Store Logo (Drag & Drop Image Uploader)
              </label>
              <div
                onClick={() => logoInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  handleBrandLogoUpload(e.dataTransfer.files?.[0])
                }}
                className="border-2 border-dashed border-gray-200 hover:border-[#E11D48] rounded-xl p-6 bg-white text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[148px]"
              >
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/png,image/webp,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={(e) => handleBrandLogoUpload(e.target.files?.[0])}
                />

                {footer.brandLogoUrl ? (
                  <div className="space-y-3">
                    <div
                      role="img"
                      aria-label={footer.brandName}
                      className="h-12 w-40 mx-auto bg-contain bg-center bg-no-repeat"
                      style={{ backgroundImage: `url("${footer.brandLogoUrl}")` }}
                    />
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-[11px] text-gray-500">Click to replace</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          onUpdateFooter({ ...footer, brandLogoUrl: "" })
                        }}
                        className="text-[11px] text-red-600 font-semibold hover:underline"
                      >
                        Remove logo
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Upload className="w-7 h-7 text-gray-400 mb-2" />
                    <p className="text-xs font-semibold text-gray-700">
                      Click or drag & drop store logo
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      MIME Validated: PNG, WebP, JPEG, SVG (Max 3MB)
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* حقول اسم العلامة التجارية والسلوجان */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Brand Title</label>
                <Input
                  value={footer.brandName}
                  onChange={(e) =>
                    onUpdateFooter({
                      ...footer,
                      brandName: sanitizeText(e.target.value, 50),
                    })
                  }
                  placeholder="StockBureaux"
                  className="bg-white text-xs font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Brand Tagline / Slogan</label>
                <Input
                  value={footer.slogan}
                  onChange={(e) =>
                    onUpdateFooter({
                      ...footer,
                      slogan: sanitizeText(e.target.value, 140),
                    })
                  }
                  placeholder="Votre espace de travail, vos règles"
                  className="bg-white text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Copyright Notice Text</label>
                <Input
                  value={footer.copyrightText}
                  onChange={(e) =>
                    onUpdateFooter({
                      ...footer,
                      copyrightText: sanitizeText(e.target.value, 100),
                    })
                  }
                  placeholder="All rights reserved."
                  className="bg-white text-xs"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <ColorPickerField
              label="Footer background color"
              value={footer.backgroundColor}
              onChange={(hex) => {
                onUpdateFooter({ ...footer, backgroundColor: hex })
                if (newsletter.harmonizeWithFooter !== false) {
                  onUpdateNewsletter({ ...newsletter, gradientEnd: hex })
                }
              }}
            />
            <ColorPickerField
              label="Footer accent color (Dots & Labels)"
              value={footer.accentColor}
              onChange={(hex) => onUpdateFooter({ ...footer, accentColor: hex })}
            />
            <ColorPickerField
              label="Footer body text color"
              value={footer.textColor}
              onChange={(hex) => onUpdateFooter({ ...footer, textColor: hex })}
            />
          </div>
        </motion.div>
      )}

      {/* =================================================================== */}
      {/* القسم 4: إدارة الروابط الديناميكية (Social + Explore/Support CRUD)   */}
      {/* =================================================================== */}
      {activeCmsSection === "links" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* أ) روابط التواصل الاجتماعي مع الأيقونات والتفعيل (Social Links) */}
          <div className="bg-gray-50/40 p-5 rounded-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between border-b border-gray-200/70 pb-3">
              <div>
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-[#E11D48]" />
                  Social Media Links Manager (Facebook, Twitter/X, Instagram, YouTube)
                </h4>
                <p className="text-xs text-gray-500">
                  Toggle visibility, edit destination URLs, or add new social channels with automatic icons.
                </p>
              </div>
              <ThemeToggleSwitch
                label="Show Social Links"
                checked={footer.showSocial}
                onChange={(checked) => onUpdateFooter({ ...footer, showSocial: checked })}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {footer.socialLinks.map((soc) => {
                const valid = isValidUrl(soc.url)
                const isEnabled = soc.enabled !== false
                return (
                  <div
                    key={soc.id}
                    className={`flex items-center gap-2 bg-white p-2.5 rounded-xl border transition-all shadow-2xs ${
                      isEnabled ? "border-gray-200" : "border-gray-100 opacity-60"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        const updated = footer.socialLinks.map((item) =>
                          item.id === soc.id
                            ? { ...item, enabled: item.enabled === false ? true : false }
                            : item
                        )
                        onUpdateFooter({ ...footer, socialLinks: updated })
                      }}
                      title={isEnabled ? "Click to disable" : "Click to enable"}
                      className={`w-10 h-9 rounded-lg flex items-center justify-center gap-1 text-xs font-bold shrink-0 cursor-pointer transition-colors ${
                        isEnabled
                          ? "bg-gray-900 text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {renderSocialPlatformIcon(soc.code, "w-3.5 h-3.5")}
                    </button>

                    <input
                      type="text"
                      value={soc.code}
                      maxLength={4}
                      onChange={(e) => {
                        const updated = footer.socialLinks.map((item) =>
                          item.id === soc.id
                            ? { ...item, code: sanitizeText(e.target.value, 4).toUpperCase() }
                            : item
                        )
                        onUpdateFooter({ ...footer, socialLinks: updated })
                      }}
                      className="w-12 h-8 rounded-lg border border-gray-200 bg-gray-50 text-gray-800 font-bold text-xs text-center uppercase shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        dir="ltr"
                        value={soc.url}
                        onChange={(e) => {
                          const updated = footer.socialLinks.map((item) =>
                            item.id === soc.id
                              ? { ...item, url: sanitizeUrl(e.target.value) }
                              : item
                          )
                          onUpdateFooter({ ...footer, socialLinks: updated })
                        }}
                        placeholder="https://..."
                        className={`w-full h-8 px-2.5 rounded-lg border text-xs font-mono ${
                          valid ? "border-gray-200 text-gray-700" : "border-red-300 text-red-600"
                        }`}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateFooter({
                          ...footer,
                          socialLinks: footer.socialLinks.filter((i) => i.id !== soc.id),
                        })
                      }
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete social link"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* إضافة رابط تواصل اجتماعي جديد */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200/60">
              <Input
                value={newSocialCode}
                onChange={(e) => setNewSocialCode(e.target.value)}
                placeholder="Code (FB, TW, IG, YT)"
                maxLength={4}
                className="w-40 bg-white text-xs uppercase font-bold"
              />
              <Input
                value={newSocialLabel}
                onChange={(e) => setNewSocialLabel(e.target.value)}
                placeholder="Platform name (e.g. LinkedIn)"
                className="w-44 bg-white text-xs"
              />
              <Input
                value={newSocialUrl}
                onChange={(e) => setNewSocialUrl(e.target.value)}
                placeholder="https://..."
                dir="ltr"
                className="flex-1 min-w-[180px] bg-white text-xs font-mono"
              />
              <Button
                type="button"
                onClick={handleAddSocialLink}
                className="bg-[#BE123C] hover:bg-[#9f0f32] text-white text-xs h-9 px-4 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Add Social
              </Button>
            </div>
          </div>

          {/* ب) قوائم التنقل في الفوتر: Explore & Support (Full CRUD + Reorder) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* عمود Explore */}
            <div className="bg-gray-50/40 p-5 rounded-2xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200/70 pb-2.5">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#E11D48]" />
                  <Input
                    value={footer.exploreTitle}
                    onChange={(e) =>
                      onUpdateFooter({
                        ...footer,
                        exploreTitle: sanitizeText(e.target.value, 30),
                      })
                    }
                    className="h-8 w-36 bg-white text-xs font-bold"
                  />
                </div>
                <span className="text-[11px] text-gray-400">
                  {footer.exploreLinks.length} links (Add / Edit / Reorder / Delete)
                </span>
              </div>

              <div className="space-y-2">
                {footer.exploreLinks.map((link, idx) => {
                  const valid = isValidUrl(link.url)
                  return (
                    <div
                      key={link.id}
                      className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-gray-200"
                    >
                      {/* أزرار إعادة الترتيب (Reorder Up/Down) */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveExploreLink(idx, "up")}
                          className="p-0.5 text-gray-400 hover:text-gray-800 disabled:opacity-25 cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === footer.exploreLinks.length - 1}
                          onClick={() => moveExploreLink(idx, "down")}
                          className="p-0.5 text-gray-400 hover:text-gray-800 disabled:opacity-25 cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <Input
                        value={link.label}
                        onChange={(e) => {
                          const updated = footer.exploreLinks.map((item) =>
                            item.id === link.id
                              ? { ...item, label: sanitizeText(e.target.value, 50) }
                              : item
                          )
                          onUpdateFooter({ ...footer, exploreLinks: updated })
                        }}
                        placeholder="Label"
                        className="h-8 text-xs flex-1"
                      />
                      <Input
                        value={link.url}
                        dir="ltr"
                        onChange={(e) => {
                          const updated = footer.exploreLinks.map((item) =>
                            item.id === link.id
                              ? { ...item, url: sanitizeUrl(e.target.value) }
                              : item
                          )
                          onUpdateFooter({ ...footer, exploreLinks: updated })
                        }}
                        placeholder="/store/..."
                        className={`h-8 text-xs font-mono flex-1 ${
                          valid ? "" : "border-red-300 text-red-600"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateFooter({
                            ...footer,
                            exploreLinks: footer.exploreLinks.filter((i) => i.id !== link.id),
                          })
                        }
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                        title="Delete link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-200/60">
                <Input
                  value={newExploreLabel}
                  onChange={(e) => setNewExploreLabel(e.target.value)}
                  placeholder="Link title (e.g. New Arrivals)"
                  className="h-8 bg-white text-xs flex-1"
                />
                <Input
                  value={newExploreUrl}
                  dir="ltr"
                  onChange={(e) => setNewExploreUrl(e.target.value)}
                  placeholder="/store/products"
                  className="h-8 bg-white text-xs font-mono flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddExploreLink}
                  className="bg-[#BE123C] hover:bg-[#9f0f32] text-white text-xs h-8 px-3 rounded-lg shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* عمود Support */}
            <div className="bg-gray-50/40 p-5 rounded-2xl border border-gray-100 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-200/70 pb-2.5">
                <div className="flex items-center gap-2">
                  <LifeBuoy className="w-4 h-4 text-[#E11D48]" />
                  <Input
                    value={footer.supportTitle}
                    onChange={(e) =>
                      onUpdateFooter({
                        ...footer,
                        supportTitle: sanitizeText(e.target.value, 30),
                      })
                    }
                    className="h-8 w-36 bg-white text-xs font-bold"
                  />
                </div>
                <span className="text-[11px] text-gray-400">
                  {footer.supportLinks.length} links (Add / Edit / Reorder / Delete)
                </span>
              </div>

              <div className="space-y-2">
                {footer.supportLinks.map((link, idx) => {
                  const valid = isValidUrl(link.url)
                  return (
                    <div
                      key={link.id}
                      className="flex items-center gap-1.5 bg-white p-2 rounded-xl border border-gray-200"
                    >
                      {/* أزرار إعادة الترتيب (Reorder Up/Down) */}
                      <div className="flex flex-col gap-0.5 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveSupportLink(idx, "up")}
                          className="p-0.5 text-gray-400 hover:text-gray-800 disabled:opacity-25 cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === footer.supportLinks.length - 1}
                          onClick={() => moveSupportLink(idx, "down")}
                          className="p-0.5 text-gray-400 hover:text-gray-800 disabled:opacity-25 cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </button>
                      </div>

                      <Input
                        value={link.label}
                        onChange={(e) => {
                          const updated = footer.supportLinks.map((item) =>
                            item.id === link.id
                              ? { ...item, label: sanitizeText(e.target.value, 50) }
                              : item
                          )
                          onUpdateFooter({ ...footer, supportLinks: updated })
                        }}
                        placeholder="Label"
                        className="h-8 text-xs flex-1"
                      />
                      <Input
                        value={link.url}
                        dir="ltr"
                        onChange={(e) => {
                          const updated = footer.supportLinks.map((item) =>
                            item.id === link.id
                              ? { ...item, url: sanitizeUrl(e.target.value) }
                              : item
                          )
                          onUpdateFooter({ ...footer, supportLinks: updated })
                        }}
                        placeholder="/store/..."
                        className={`h-8 text-xs font-mono flex-1 ${
                          valid ? "" : "border-red-300 text-red-600"
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateFooter({
                            ...footer,
                            supportLinks: footer.supportLinks.filter((i) => i.id !== link.id),
                          })
                        }
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 cursor-pointer"
                        title="Delete link"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-200/60">
                <Input
                  value={newSupportLabel}
                  onChange={(e) => setNewSupportLabel(e.target.value)}
                  placeholder="Link title (e.g. Track Order)"
                  className="h-8 bg-white text-xs flex-1"
                />
                <Input
                  value={newSupportUrl}
                  dir="ltr"
                  onChange={(e) => setNewSupportUrl(e.target.value)}
                  placeholder="/store/faq"
                  className="h-8 bg-white text-xs font-mono flex-1"
                />
                <Button
                  type="button"
                  onClick={handleAddSupportLink}
                  className="bg-[#BE123C] hover:bg-[#9f0f32] text-white text-xs h-8 px-3 rounded-lg shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* =================================================================== */}
      {/* القسم 5: معلومات الاتصال وشارات الدفع (Contact Info & Payments)     */}
      {/* =================================================================== */}
      {activeCmsSection === "contact" && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5 bg-gray-50/40 p-5 rounded-2xl border border-gray-100"
        >
          <div className="border-b border-gray-200/70 pb-3">
            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-[#E11D48]" />
              Contact Information, Copyright & Payment Method Badges
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              Configure customer support email, phone number, support hours, and toggle or upload supported payment method badges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                Support Email Address
              </label>
              <Input
                dir="ltr"
                value={footer.contact.email}
                onChange={(e) =>
                  onUpdateFooter({
                    ...footer,
                    contact: {
                      ...footer.contact,
                      email: sanitizeText(e.target.value, 80),
                    },
                  })
                }
                placeholder="contact@stockbureaux.com"
                className={`bg-white text-xs ${
                  emailValid ? "" : "border-red-300 ring-1 ring-red-200"
                }`}
              />
              {!emailValid && (
                <p className="text-[11px] text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> Invalid email format
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                Phone / WhatsApp Number
              </label>
              <Input
                dir="ltr"
                value={footer.contact.phone}
                onChange={(e) =>
                  onUpdateFooter({
                    ...footer,
                    contact: {
                      ...footer.contact,
                      phone: sanitizeText(e.target.value, 40),
                    },
                  })
                }
                placeholder="+2126663933445"
                className="bg-white text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                Support / Working Hours
              </label>
              <Input
                value={footer.contact.workingHours}
                onChange={(e) =>
                  onUpdateFooter({
                    ...footer,
                    contact: {
                      ...footer.contact,
                      workingHours: sanitizeText(e.target.value, 40),
                    },
                  })
                }
                placeholder="24/7"
                className="bg-white text-xs"
              />
            </div>
          </div>

          {/* شارات وسائل الدفع (Payment Badges Toggles & Uploader) */}
          <div className="bg-white p-4 rounded-xl border border-gray-200/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h5 className="text-xs font-bold text-gray-900">Supported Payment Method Badges</h5>
                <p className="text-[11px] text-gray-500">
                  Click badges to toggle visibility in the footer bottom bar, or add custom payment methods.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#BE123C]">
                {footer.paymentMethods.length} active
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {Array.from(new Set([...SUPPORTED_PAYMENT_METHODS, ...footer.paymentMethods])).map(
                (method) => {
                  const isActive = footer.paymentMethods.includes(method)
                  return (
                    <button
                      key={method}
                      type="button"
                      onClick={() => togglePaymentMethod(method)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide uppercase border transition-all cursor-pointer ${
                        isActive
                          ? "bg-rose-50 text-[#BE123C] border-rose-200 shadow-2xs"
                          : "bg-gray-50 text-gray-400 border-gray-200 hover:text-gray-700"
                      }`}
                    >
                      {isActive && <Check className="w-3 h-3" />}
                      <span>{method}</span>
                    </button>
                  )
                }
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100">
              <Input
                value={newPaymentMethod}
                onChange={(e) => setNewPaymentMethod(e.target.value)}
                placeholder="Add custom badge (e.g. KLARNA, CMI)"
                className="h-8 bg-gray-50 text-xs max-w-xs uppercase font-semibold"
              />
              <Button
                type="button"
                onClick={handleAddCustomPaymentMethod}
                className="bg-[#BE123C] hover:bg-[#9f0f32] text-white text-xs h-8 px-3 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Badge
              </Button>

              <input
                ref={paymentBadgeInputRef}
                type="file"
                accept="image/png,image/webp,image/jpeg,image/svg+xml"
                className="hidden"
                onChange={(e) => handlePaymentBadgeUpload(e.target.files?.[0])}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => paymentBadgeInputRef.current?.click()}
                className="text-xs h-8 px-3 rounded-lg ml-auto"
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" />
                {footer.customPaymentBadgeUrl ? "Replace Payment Strip Image" : "Upload Custom Payment Icons"}
              </Button>
              {footer.customPaymentBadgeUrl && (
                <button
                  type="button"
                  onClick={() => onUpdateFooter({ ...footer, customPaymentBadgeUrl: "" })}
                  className="text-xs text-red-600 font-semibold hover:underline"
                >
                  Remove image
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <ThemeToggleSwitch
              label="Show Payment Method Badges"
              description="Display selected payment methods in the footer bottom bar"
              checked={footer.showPaymentMethods}
              onChange={(checked) =>
                onUpdateFooter({ ...footer, showPaymentMethods: checked })
              }
            />
            <ThemeToggleSwitch
              label="Show Copyright Notice"
              description="Display dynamic year, brand name, and copyright text"
              checked={footer.showCopyright}
              onChange={(checked) =>
                onUpdateFooter({ ...footer, showCopyright: checked })
              }
            />
          </div>
        </motion.div>
      )}

      {/* =================================================================== */}
      {/* المعاينة الحية الموحدة (Storefront Header + Newsletter + Footer)    */}
      {/* مطابقة 100% للصورة الثانية المرفقة مع تحديث لحظي وتناغم الخلفيات     */}
      {/* =================================================================== */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-[#E11D48]" />
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Unified Storefront Live Preview (Header + Harmonized Newsletter & Footer)
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-500">
            <Grid className="w-3.5 h-3.5 text-[#E11D48]" />
            <span>Real-time synchronized preview</span>
          </div>
        </div>

        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-2xl">
          {/* 0. شريط الهيدر العلوي للمتجر (Storefront Navbar Preview - مطابق للصورة 2) */}
          <div
            style={{
              backgroundColor: desktopHeader?.background || "#FFFFFF",
              borderBottom:
                desktopHeader?.borderEnabled !== false
                  ? `1px solid ${desktopHeader?.borderColor || "#F0F0F0"}`
                  : "none",
            }}
            className="px-6 py-3.5 flex items-center justify-between gap-4 transition-colors"
          >
            {/* شعار المتجر على اليسار */}
            <div className="flex items-center gap-2.5">
              {footer.brandLogoUrl ? (
                <div
                  role="img"
                  aria-label={sanitizeText(footer.brandName, 50)}
                  className="h-8 w-36 bg-contain bg-left bg-no-repeat"
                  style={{ backgroundImage: `url("${footer.brandLogoUrl}")` }}
                />
              ) : (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-700 to-teal-600 flex items-center justify-center text-white font-black text-xs shadow-xs">
                    S
                  </div>
                  <span
                    className="text-base font-bold tracking-tight"
                    style={{ color: desktopHeader?.buttonsColor || "#111827" }}
                  >
                    {sanitizeText(footer.brandName || "StockBureaux", 40)}
                  </span>
                </div>
              )}
            </div>

            {/* روابط التنقل الوسطى */}
            <div className="hidden md:flex items-center gap-6 text-xs font-medium">
              {(footer.exploreLinks.length > 0
                ? footer.exploreLinks
                : [
                    { id: "1", label: "Home", url: "/store" },
                    { id: "2", label: "All Products", url: "/store/products" },
                    { id: "3", label: "Categories", url: "/store/categories" },
                    { id: "4", label: "About Us", url: "/store/about" },
                    { id: "5", label: "Contact Us", url: "/store/contact" },
                  ]
              ).map((navItem, idx) => (
                <span
                  key={navItem.id}
                  style={{
                    color:
                      idx === 0
                        ? desktopHeader?.activeLinkColor || footer.accentColor || "#4F46E5"
                        : desktopHeader?.textColor || "#4B5563",
                  }}
                  className={idx === 0 ? "font-semibold" : "hover:opacity-80"}
                >
                  {sanitizeText(navItem.label, 30)}
                </span>
              ))}
            </div>

            {/* أدوات الهيدر اليمنى (EUR, US, Search, User, Cart) */}
            <div
              className="flex items-center gap-2.5"
              style={{ color: desktopHeader?.buttonsColor || "#111827" }}
            >
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-gray-200 bg-gray-50/80 text-gray-700">
                <span className="text-[9px] text-gray-400">EU</span>{" "}
                <span className="text-[#E11D48] font-bold">EUR</span> (€)
              </span>
              <span className="hidden sm:inline-flex items-center text-[10px] font-semibold px-2 py-1 rounded-full border border-gray-200 bg-gray-50/80 text-gray-700">
                US
              </span>
              <Search className="w-4 h-4 opacity-75" />
              <div className="w-5 h-5 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-[10px] font-bold text-amber-900">
                <User className="w-3 h-3" />
              </div>
              <ShoppingCart className="w-4 h-4 opacity-85" />
            </div>
          </div>

          {/* 1. معاينة قسم النشرة البريدية المتناغم مع الفوتر (Harmonized Newsletter Preview) */}
          {newsletter.enabled && (
            <div
              className="py-16 px-6 text-center relative overflow-hidden transition-colors"
              style={{
                background: `radial-gradient(circle at 18% 30%, ${newsletter.gradientStart} 0%, ${newsletter.gradientMiddle} 48%, ${
                  newsletter.harmonizeWithFooter !== false
                    ? footer.backgroundColor
                    : newsletter.gradientEnd
                } 100%)`,
                color: newsletter.textColor || (isLightNewsletter ? "#0F172A" : "#FFFFFF"),
              }}
            >
              {/* الشبكة الهندسية الخلفية (Architectural Grid Overlay) */}
              {newsletter.showGridOverlay !== false && (
                <div
                  aria-hidden="true"
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    backgroundImage: isLightNewsletter
                      ? "linear-gradient(to right, rgba(15,23,42,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.06) 1px, transparent 1px)"
                      : "linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)",
                    backgroundSize: "40px 40px",
                  }}
                />
              )}

              <div className="max-w-xl mx-auto relative z-10 space-y-4">
                {newsletter.badgeText && (
                  <span
                    className={`inline-block px-3.5 py-1 rounded-full font-semibold text-[10px] border uppercase tracking-widest ${
                      isLightNewsletter
                        ? "bg-slate-900/5 text-slate-600 border-slate-300/80"
                        : "bg-white/5 text-gray-300 border-white/10"
                    }`}
                  >
                    {sanitizeText(newsletter.badgeText, 30)}
                  </span>
                )}

                <h2
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                    isLightNewsletter ? "text-slate-900" : "text-white"
                  }`}
                >
                  {sanitizeText(newsletter.title, 80)}
                </h2>

                <p
                  className={`text-xs sm:text-sm max-w-md mx-auto leading-relaxed font-light ${
                    isLightNewsletter ? "text-slate-600" : "text-gray-400"
                  }`}
                >
                  {renderHighlightedSubtitle(
                    newsletter.subtitle,
                    newsletter.highlightDiscount,
                    isLightNewsletter
                  )}
                </p>

                <div className="pt-3 max-w-md mx-auto">
                  <div
                    className={`flex flex-col sm:flex-row gap-2 p-1.5 rounded-2xl sm:rounded-full border ${
                      isLightNewsletter
                        ? "bg-white border-slate-200 shadow-sm"
                        : "bg-white/[0.04] border-white/10"
                    }`}
                  >
                    <input
                      type="email"
                      readOnly
                      placeholder={sanitizeText(newsletter.inputPlaceholder, 60)}
                      className={`flex-1 px-4 py-2.5 bg-transparent border-none outline-none text-xs ${
                        isLightNewsletter
                          ? "text-slate-800 placeholder-slate-400"
                          : "text-white placeholder-gray-500"
                      }`}
                    />
                    <button
                      type="button"
                      style={{ backgroundColor: newsletter.buttonColor || "#FF2D55" }}
                      className="px-6 py-2.5 text-white rounded-xl sm:rounded-full font-semibold text-xs shadow-md transition-transform hover:scale-102"
                    >
                      {sanitizeText(newsletter.buttonText || "Subscribe", 30)}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. معاينة قسم الفوتر المتناغم (Harmonized Footer Preview - مطابق للصورة 2) */}
          <div
            className={`pt-12 pb-8 px-6 sm:px-10 border-t transition-colors ${
              isLightFooter ? "border-slate-200/80" : "border-white/[0.06]"
            }`}
            style={{
              backgroundColor: footer.backgroundColor || "#040711",
              color: footer.textColor || (isLightFooter ? "#475569" : "#94A3B8"),
            }}
          >
            <div className="max-w-5xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                {/* العمود 1: العلامة التجارية والسلوجان والتواصل الاجتماعي */}
                <div className="space-y-3.5">
                  {footer.brandLogoUrl ? (
                    <div
                      role="img"
                      aria-label={sanitizeText(footer.brandName, 50)}
                      className="h-9 w-36 bg-contain bg-left bg-no-repeat"
                      style={{ backgroundImage: `url("${footer.brandLogoUrl}")` }}
                    />
                  ) : (
                    <h3
                      className={`text-lg font-extrabold tracking-tight ${
                        isLightFooter ? "text-slate-900" : "text-white"
                      }`}
                    >
                      {sanitizeText(footer.brandName || "StockBureaux", 50).toUpperCase()}
                      <span style={{ color: footer.accentColor || "#4F46E5" }}>.</span>
                    </h3>
                  )}

                  <p className="text-xs leading-relaxed opacity-90">
                    {sanitizeText(footer.slogan, 140)}
                  </p>

                  {footer.showSocial && footer.socialLinks.filter((s) => s.enabled !== false).length > 0 && (
                    <div className="flex items-center gap-2.5 pt-1">
                      {footer.socialLinks
                        .filter((s) => s.enabled !== false)
                        .map((soc) => (
                          <span
                            key={soc.id}
                            title={`${sanitizeText(soc.label, 30)} (${sanitizeUrl(soc.url)})`}
                            className={`w-8 h-8 rounded-full border flex items-center justify-center text-[10px] font-bold transition-colors ${
                              isLightFooter
                                ? "bg-white border-slate-200 text-slate-600 hover:text-slate-900"
                                : "bg-gray-900/90 border-gray-800 text-gray-400 hover:text-white"
                            }`}
                          >
                            {sanitizeText(soc.code, 4)}
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* العمود 2: Explore */}
                <div className="space-y-3">
                  <h4
                    className={`text-xs font-bold ${
                      isLightFooter ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {sanitizeText(footer.exploreTitle || "Explore", 30)}
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {footer.exploreLinks.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-2 hover:opacity-100 opacity-90 transition-opacity"
                      >
                        <span
                          className="w-1 h-1 rounded-full shrink-0"
                          style={{ backgroundColor: footer.accentColor || "#4F46E5" }}
                        />
                        <span>{sanitizeText(item.label, 50)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* العمود 3: Support */}
                <div className="space-y-3">
                  <h4
                    className={`text-xs font-bold ${
                      isLightFooter ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {sanitizeText(footer.supportTitle || "Support", 30)}
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {footer.supportLinks.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-2 hover:opacity-100 opacity-90 transition-opacity"
                      >
                        <span
                          className="w-1 h-1 rounded-full shrink-0"
                          style={{ backgroundColor: footer.accentColor || "#4F46E5" }}
                        />
                        <span>{sanitizeText(item.label, 50)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* العمود 4: Contact Us */}
                <div className="space-y-3">
                  <h4
                    className={`text-xs font-bold ${
                      isLightFooter ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {sanitizeText(footer.contactTitle || "Contact Us", 30)}
                  </h4>
                  <ul className="space-y-2.5 text-xs">
                    {footer.contact.email && (
                      <li className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="font-semibold"
                          style={{ color: footer.accentColor || "#4F46E5" }}
                        >
                          Email:
                        </span>
                        <span
                          dir="ltr"
                          className={isLightFooter ? "text-slate-700" : "text-gray-300"}
                        >
                          {sanitizeText(footer.contact.email, 80)}
                        </span>
                      </li>
                    )}
                    {footer.contact.phone && (
                      <li className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="font-semibold"
                          style={{ color: footer.accentColor || "#4F46E5" }}
                        >
                          Phone:
                        </span>
                        <span
                          dir="ltr"
                          className={isLightFooter ? "text-slate-700" : "text-gray-300"}
                        >
                          {sanitizeText(footer.contact.phone, 40)}
                        </span>
                      </li>
                    )}
                    {footer.contact.workingHours && (
                      <li className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className="font-semibold"
                          style={{ color: footer.accentColor || "#4F46E5" }}
                        >
                          Support:
                        </span>
                        <span className={isLightFooter ? "text-slate-700" : "text-gray-300"}>
                          {sanitizeText(footer.contact.workingHours, 40)}
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* الشريط السفلي للفوتر: حقوق النشر ووسائل الدفع */}
              <div
                className={`border-t pt-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] ${
                  isLightFooter
                    ? "border-slate-200/80 text-slate-500"
                    : "border-white/[0.06] text-gray-500"
                }`}
              >
                {footer.showCopyright ? (
                  <p>
                    &copy; {new Date().getFullYear()}{" "}
                    <span
                      className={`font-semibold ${
                        isLightFooter ? "text-slate-800" : "text-gray-300"
                      }`}
                    >
                      {sanitizeText(footer.brandName || "StockBureaux", 50)}
                    </span>
                    . {sanitizeText(footer.copyrightText || "All rights reserved.", 100)}
                  </p>
                ) : (
                  <span />
                )}

                {footer.showPaymentMethods && (
                  <div className="flex items-center gap-4">
                    {footer.customPaymentBadgeUrl ? (
                      <div
                        role="img"
                        aria-label="Accepted Payment Methods"
                        className="h-6 w-48 bg-contain bg-right bg-no-repeat"
                        style={{ backgroundImage: `url("${footer.customPaymentBadgeUrl}")` }}
                      />
                    ) : (
                      <div className="flex flex-wrap items-center gap-4 font-semibold tracking-wider uppercase text-[10px] opacity-75">
                        {footer.paymentMethods.map((method) => (
                          <span key={method}>{sanitizeText(method, 20)}</span>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
