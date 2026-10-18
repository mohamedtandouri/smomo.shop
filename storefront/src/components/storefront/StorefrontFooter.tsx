"use client"

import React from "react"
import Link from "next/link"
import { useLocaleStore, translateMenuLabel } from "@/store/useLocaleStore"
import type { StoreMenuItem } from "@/lib/store-storage"
import { Globe } from "lucide-react"

export interface NewsletterCmsConfig {
  enabled?: boolean
  badgeText?: string
  title?: string
  subtitle?: string
  highlightDiscount?: string
  inputPlaceholder?: string
  buttonText?: string
  buttonColor?: string
  gradientStart?: string
  gradientMiddle?: string
  gradientEnd?: string
  textColor?: string
  showGridOverlay?: boolean
  harmonizeWithFooter?: boolean
}

export interface FooterCmsConfig {
  brandName?: string
  brandLogoUrl?: string
  slogan?: string
  copyrightText?: string
  backgroundColor?: string
  accentColor?: string
  textColor?: string
  exploreTitle?: string
  supportTitle?: string
  contactTitle?: string
  socialLinks?: { id: string; code: string; label?: string; platform?: string; url: string; enabled?: boolean }[]
  exploreLinks?: { id: string; label: string; url: string }[]
  supportLinks?: { id: string; label: string; url: string }[]
  contact?: {
    email?: string
    phone?: string
    workingHours?: string
  }
  paymentMethods?: string[]
  customPaymentBadgeUrl?: string
  showSocial?: boolean
  showPaymentMethods?: boolean
  showCopyright?: boolean
}

interface StorefrontFooterProps {
  storeName?: string
  storeDescription?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  primaryColor?: string
  headerLinks?: StoreMenuItem[]
  footerLinks?: StoreMenuItem[]
  footerConfig?: FooterCmsConfig
  newsletterConfig?: NewsletterCmsConfig
}

// تعقيم النصوص والروابط ضد هجمات XSS
function cleanText(val: string | undefined | null, fallback = ""): string {
  if (!val) return fallback
  return String(val)
    .replace(/<[^>]*>?/gm, "")
    .replace(/javascript:/gi, "")
}

function cleanUrl(val: string | undefined | null, fallback = "#"): string {
  if (!val) return fallback
  const trimmed = String(val).trim()
  if (/^(javascript|data|vbscript):/i.test(trimmed)) return fallback
  return trimmed.replace(/[<>"'`]/g, "")
}

function isLightColorHex(hexColor: string | undefined | null): boolean {
  if (!hexColor || !/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hexColor)) return false
  let hex = hexColor.trim().replace("#", "")
  if (hex.length === 3) {
    hex = hex.split("").map((c) => c + c).join("")
  }
  const r = parseInt(hex.substring(0, 2), 16)
  const g = parseInt(hex.substring(2, 4), 16)
  const b = parseInt(hex.substring(4, 6), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 150
}

export function StorefrontFooter({
  storeName = "StockBureaux",
  storeDescription,
  contactEmail = "contact@stockbureaux.com",
  contactPhone = "+2126663933445",
  primaryColor = "#ff2d55",
  headerLinks,
  footerLinks,
  footerConfig,
  newsletterConfig,
}: StorefrontFooterProps) {
  const { t } = useLocaleStore()

  const activeAccent = footerConfig?.accentColor || primaryColor || "#4F46E5"
  const activeBg = footerConfig?.backgroundColor || "#040711"
  const activeTextColor = footerConfig?.textColor || (isLightColorHex(activeBg) ? "#475569" : "#94A3B8")
  const isLightFooter = isLightColorHex(activeBg)

  const displayBrandName = cleanText(footerConfig?.brandName || storeName, "StockBureaux")
  const displaySlogan = cleanText(
    footerConfig?.slogan ||
      storeDescription ||
      t("store.hero_subtitle", "Votre espace de travail, vos règles")
  )
  const displayEmail = cleanText(footerConfig?.contact?.email || contactEmail, "contact@stockbureaux.com")
  const displayPhone = cleanText(footerConfig?.contact?.phone || contactPhone, "+2126663933445")
  const displayHours = cleanText(footerConfig?.contact?.workingHours, "24/7")

  // إعدادات النشرة البريدية المتناغمة
  const showNewsletter = newsletterConfig?.enabled !== false
  const newsletterGradStart = newsletterConfig?.gradientStart || "#2B0916"
  const newsletterGradMiddle = newsletterConfig?.gradientMiddle || "#0B0F1E"
  const newsletterGradEnd =
    newsletterConfig?.harmonizeWithFooter !== false
      ? activeBg
      : newsletterConfig?.gradientEnd || activeBg
  const isLightNewsletter = isLightColorHex(newsletterGradEnd)
  const newsletterButtonColor = newsletterConfig?.buttonColor || "#FF2D55"

  // روابط الاستكشاف من إعدادات الفوتر الديناميكية أو قائمة الهيدر
  const exploreItems =
    footerConfig?.exploreLinks && footerConfig.exploreLinks.length > 0
      ? footerConfig.exploreLinks.map((item, idx) => ({
          id: item.id || `exp-${idx}`,
          label: cleanText(item.label),
          url: cleanUrl(item.url, "/store"),
        }))
      : headerLinks && headerLinks.length > 0
      ? [...headerLinks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : [
          { id: "e1", label: "Home", url: "/store" },
          { id: "e2", label: "All Products", url: "/store/products" },
          { id: "e3", label: "Categories", url: "/store/categories" },
          { id: "e4", label: "About Us", url: "/store/about" },
          { id: "e5", label: "Contact Us", url: "/store/contact" },
        ]

  // روابط الدعم والصفحات القانونية من إعدادات الفوتر الديناميكية
  const supportItems =
    footerConfig?.supportLinks && footerConfig.supportLinks.length > 0
      ? footerConfig.supportLinks.map((item, idx) => ({
          id: item.id || `sup-${idx}`,
          label: cleanText(item.label),
          url: cleanUrl(item.url, "/store"),
        }))
      : footerLinks && footerLinks.length > 0
      ? [...footerLinks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      : [
          { id: "f1", label: "About Us", url: "/store/about" },
          { id: "f2", label: "Shipping Policy", url: "/store/shipping" },
          { id: "f3", label: "Privacy Policy", url: "/store/privacy" },
          { id: "f4", label: "FAQ", url: "/store/faq" },
        ]

  const socialItems =
    footerConfig?.socialLinks && footerConfig.socialLinks.length > 0
      ? footerConfig.socialLinks.filter((s) => s.enabled !== false)
      : [
          { id: "s1", code: "FB", label: "Facebook", url: "https://facebook.com", enabled: true },
          { id: "s2", code: "TW", label: "Twitter / X", url: "https://x.com", enabled: true },
          { id: "s3", code: "IG", label: "Instagram", url: "https://instagram.com", enabled: true },
          { id: "s4", code: "YT", label: "YouTube", url: "https://youtube.com", enabled: true },
        ]

  const paymentItems =
    footerConfig?.paymentMethods && footerConfig.paymentMethods.length > 0
      ? footerConfig.paymentMethods
      : ["VISA", "MASTERCARD", "PAYPAL", "APPLE PAY"]

  const renderSocialIcon = (code: string) => {
    const c = code.toUpperCase()
    if (c === "FB" || c.includes("FACE")) {
      return (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    }
    if (c === "TW" || c === "X") {
      return (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      )
    }
    if (c === "IG" || c.includes("INST")) {
      return (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      )
    }
    if (c === "YT" || c.includes("YOU")) {
      return (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
    }
    return <Globe className="w-3.5 h-3.5" />
  }

  // تسليط الضوء على نسبة الخصم في النشرة البريدية بأمان
  const renderHighlightedSubtitle = () => {
    const sub = cleanText(
      newsletterConfig?.subtitle,
      "Subscribe to our newsletter and get 15% off your first order, plus exclusive early access to new arrivals."
    )
    const highlight = cleanText(newsletterConfig?.highlightDiscount, "15% off")
    if (!highlight || !sub.includes(highlight)) {
      return <span>{sub}</span>
    }
    const parts = sub.split(highlight)
    return (
      <>
        {parts.map((p, idx) => (
          <React.Fragment key={idx}>
            {p}
            {idx < parts.length - 1 && (
              <strong className={`font-bold ${isLightNewsletter ? "text-slate-900" : "text-white"}`}>
                {highlight}
              </strong>
            )}
          </React.Fragment>
        ))}
      </>
    )
  }

  return (
    <footer className="font-sans">
      {/* 1. قسم النشرة البريدية المتناغم (Harmonized Newsletter Pre-Footer) */}
      {showNewsletter && (
        <section
          className="py-20 px-4 text-center relative overflow-hidden transition-colors"
          style={{
            background: `radial-gradient(circle at 18% 30%, ${newsletterGradStart} 0%, ${newsletterGradMiddle} 48%, ${newsletterGradEnd} 100%)`,
            color: newsletterConfig?.textColor || (isLightNewsletter ? "#0F172A" : "#FFFFFF"),
          }}
        >
          {/* خلفية الشبكة الهندسية (Architectural Grid Overlay) */}
          {newsletterConfig?.showGridOverlay !== false && (
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

          <div className="container mx-auto max-w-xl relative z-10 space-y-4">
            {newsletterConfig?.badgeText && (
              <span
                className={`inline-block px-3.5 py-1 rounded-full font-semibold text-[10px] border uppercase tracking-widest ${
                  isLightNewsletter
                    ? "bg-slate-900/5 text-slate-600 border-slate-300/80"
                    : "bg-white/5 text-gray-300 border-white/10"
                }`}
              >
                {cleanText(newsletterConfig.badgeText, "NEWSLETTER")}
              </span>
            )}

            <h2
              className={`text-3xl md:text-4xl font-extrabold tracking-tight ${
                isLightNewsletter ? "text-slate-900" : "text-white"
              }`}
            >
              {cleanText(newsletterConfig?.title, "Join The Club")}
            </h2>

            <p
              className={`text-sm md:text-base max-w-lg mx-auto leading-relaxed font-light ${
                isLightNewsletter ? "text-slate-600" : "text-gray-400"
              }`}
            >
              {renderHighlightedSubtitle()}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                alert("Thank you for subscribing!")
              }}
              className="pt-2 max-w-md mx-auto"
            >
              <div
                className={`flex flex-col sm:flex-row gap-2 p-1.5 rounded-2xl sm:rounded-full border ${
                  isLightNewsletter
                    ? "bg-white border-slate-200 shadow-sm"
                    : "bg-white/[0.04] border-white/10"
                }`}
              >
                <input
                  type="email"
                  required
                  placeholder={cleanText(newsletterConfig?.inputPlaceholder, "Enter your email address...")}
                  className={`flex-1 px-5 py-2.5 bg-transparent border-none outline-none text-xs md:text-sm font-light ${
                    isLightNewsletter
                      ? "text-slate-800 placeholder-slate-400"
                      : "text-white placeholder-gray-500"
                  }`}
                />
                <button
                  type="submit"
                  style={{ backgroundColor: newsletterButtonColor }}
                  className="px-6 py-2.5 text-white rounded-xl sm:rounded-full font-semibold text-xs md:text-sm shadow-md transition-transform hover:scale-102"
                >
                  {cleanText(newsletterConfig?.buttonText, "Subscribe")}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      {/* 2. قسم الفوتر الرئيسي (Main Footer Content) */}
      <div
        className={`pt-14 pb-8 transition-colors ${
          showNewsletter
            ? isLightFooter
              ? "border-t border-slate-200/80"
              : "border-t border-white/[0.06]"
            : ""
        }`}
        style={{
          backgroundColor: activeBg,
          color: activeTextColor,
        }}
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
            
            {/* Brand Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {footerConfig?.brandLogoUrl ? (
                  <div
                    role="img"
                    aria-label={displayBrandName}
                    suppressHydrationWarning
                    className="h-9 w-36 rounded-lg bg-contain bg-left bg-no-repeat shrink-0"
                    style={{ backgroundImage: `url("${footerConfig.brandLogoUrl}")` }}
                  />
                ) : (
                  <h3
                    className={`text-xl font-bold tracking-tight ${
                      isLightFooter ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {displayBrandName.toUpperCase()}
                    <span style={{ color: activeAccent }}>.</span>
                  </h3>
                )}
              </div>

              <p className="text-sm leading-relaxed max-w-xs font-light opacity-90">
                {displaySlogan}
              </p>

              {footerConfig?.showSocial !== false && socialItems.length > 0 && (
                <div className="flex items-center gap-2.5 pt-1">
                  {socialItems.map((social) => (
                    <a
                      key={social.id}
                      href={cleanUrl(social.url, "#")}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={cleanText(social.label || social.code)}
                      className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all hover:-translate-y-0.5 ${
                        isLightFooter
                          ? "bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-2xs"
                          : "bg-gray-900/90 border-gray-800 text-gray-400 hover:text-white"
                      }`}
                    >
                      {renderSocialIcon(social.code)}
                    </a>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Links (Explore) */}
            <div className="space-y-4">
              <h4
                className={`text-sm font-semibold ${
                  isLightFooter ? "text-slate-900" : "text-white"
                }`}
              >
                {cleanText(footerConfig?.exploreTitle, t("store.browse_categories", "Explore"))}
              </h4>
              <ul className="space-y-2.5 text-sm font-light">
                {exploreItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.url.startsWith("/") || item.url.startsWith("http") ? item.url : `/${item.url}`}
                      className="hover:opacity-100 opacity-90 transition-opacity flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full transition-colors shrink-0" style={{ backgroundColor: activeAccent }} />
                      <span>{translateMenuLabel(item.label, t)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service (Support) */}
            <div className="space-y-4">
              <h4
                className={`text-sm font-semibold ${
                  isLightFooter ? "text-slate-900" : "text-white"
                }`}
              >
                {cleanText(footerConfig?.supportTitle, t("store.support_247", "Support"))}
              </h4>
              <ul className="space-y-2.5 text-sm font-light">
                {supportItems.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={item.url.startsWith("/") || item.url.startsWith("http") ? item.url : `/${item.url}`}
                      className="hover:opacity-100 opacity-90 transition-opacity flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 rounded-full transition-colors shrink-0" style={{ backgroundColor: activeAccent }} />
                      <span>{translateMenuLabel(item.label, t)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className="space-y-4">
              <h4
                className={`text-sm font-semibold ${
                  isLightFooter ? "text-slate-900" : "text-white"
                }`}
              >
                {cleanText(footerConfig?.contactTitle, t("menu_label.contact_us", "Contact Us"))}
              </h4>
              <ul className="space-y-3 text-sm font-light">
                {displayEmail && (
                  <li className="flex gap-2 items-center flex-wrap">
                    <span className="font-medium" style={{ color: activeAccent }}>Email:</span>
                    <a
                      dir="ltr"
                      href={`mailto:${displayEmail}`}
                      className={`hover:underline transition-colors ${
                        isLightFooter ? "text-slate-800" : "text-gray-300"
                      }`}
                    >
                      {displayEmail}
                    </a>
                  </li>
                )}
                {displayPhone && (
                  <li className="flex gap-2 items-center flex-wrap">
                    <span className="font-medium" style={{ color: activeAccent }}>Phone:</span>
                    <span
                      dir="ltr"
                      className={`cursor-default ${
                        isLightFooter ? "text-slate-800" : "text-gray-300"
                      }`}
                    >
                      {displayPhone}
                    </span>
                  </li>
                )}
                <li className="flex gap-2">
                  <span className="font-medium" style={{ color: activeAccent }}>
                    {t("store.support_247", "Support")}:
                  </span>
                  <span className={`leading-relaxed ${isLightFooter ? "text-slate-800" : "text-gray-300"}`}>
                    {displayHours}
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Payment Method Badges */}
          <div
            className={`border-t pt-6 flex flex-col md:flex-row items-center justify-between text-xs gap-4 ${
              isLightFooter
                ? "border-slate-200/80 text-slate-500"
                : "border-white/[0.06] text-gray-500"
            }`}
          >
            {footerConfig?.showCopyright !== false ? (
              <p className="font-light">
                &copy; {new Date().getFullYear()}{" "}
                <span className={`font-medium ${isLightFooter ? "text-slate-800" : "text-gray-300"}`}>
                  {displayBrandName}
                </span>
                . {cleanText(footerConfig?.copyrightText) || t("store.rights_reserved", "All rights reserved.")}
              </p>
            ) : <span />}

            {footerConfig?.showPaymentMethods !== false && (
              <div>
                {footerConfig?.customPaymentBadgeUrl ? (
                  <div
                    role="img"
                    aria-label="Payment Badges"
                    suppressHydrationWarning
                    className="h-6 w-44 bg-contain bg-right bg-no-repeat"
                    style={{ backgroundImage: `url("${footerConfig.customPaymentBadgeUrl}")` }}
                  />
                ) : (
                  <div className="flex flex-wrap items-center gap-4 font-semibold tracking-wider uppercase text-[10px] opacity-75">
                    {paymentItems.map((pm) => (
                      <span key={pm} className="hover:opacity-100 transition-opacity">
                        {cleanText(pm)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
