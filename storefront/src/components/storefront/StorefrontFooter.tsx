"use client"

import Link from "next/link"
import { useLocaleStore, translateMenuLabel } from "@/store/useLocaleStore"
import { StoreMenuItem } from "@/lib/store-storage"

interface StorefrontFooterProps {
  storeName?: string
  storeDescription?: string | null
  contactEmail?: string | null
  contactPhone?: string | null
  primaryColor?: string
  headerLinks?: StoreMenuItem[]
  footerLinks?: StoreMenuItem[]
}

export function StorefrontFooter({
  storeName = "Smomo",
  storeDescription,
  contactEmail = "support@smomo.shop",
  contactPhone = "+1 (555) 123-4567",
  primaryColor = "#ff2d55",
  headerLinks,
  footerLinks,
}: StorefrontFooterProps) {
  const { t } = useLocaleStore()

  // روابط الاستكشاف من قائمة الهيدر الديناميكية
  const exploreItems = (headerLinks && headerLinks.length > 0)
    ? [...headerLinks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [
        { id: "e1", label: "Home", url: "/store", order: 1 },
        { id: "e2", label: "Products", url: "/store/products", order: 2 },
        { id: "e3", label: "Categories", url: "/store/categories", order: 3 },
        { id: "e4", label: "About Us", url: "/store/about", order: 4 },
      ]

  // روابط الدعم والصفحات القانونية من قائمة الفوتر الديناميكية
  const supportItems = (footerLinks && footerLinks.length > 0)
    ? [...footerLinks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [
        { id: "f1", label: "Contact Us", url: "/store/contact", order: 1 },
        { id: "f2", label: "FAQs", url: "/store/faq", order: 2 },
        { id: "f3", label: "Shipping & Returns", url: "/store/shipping", order: 3 },
        { id: "f4", label: "Privacy Policy", url: "/store/privacy", order: 4 },
      ]

  return (
    <footer className="bg-gray-950 pt-16 pb-8 border-t border-gray-900 text-gray-400 font-sans">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white tracking-tight">
              {storeName.toUpperCase()}<span style={{ color: primaryColor }}>.</span>
            </h3>
            <p className="text-sm leading-relaxed max-w-xs font-light text-gray-400">
              {storeDescription || t("store.hero_subtitle", "Your ultimate destination for premium lifestyle products. We combine quality, affordability, and exceptional customer service.")}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a href="#" className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center hover:text-white transition-all hover:-translate-y-1"><span className="text-[10px] font-semibold">FB</span></a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center hover:text-white transition-all hover:-translate-y-1"><span className="text-[10px] font-semibold">TW</span></a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center hover:text-white transition-all hover:-translate-y-1"><span className="text-[10px] font-semibold">IG</span></a>
              <a href="#" className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center hover:text-white transition-all hover:-translate-y-1"><span className="text-[10px] font-semibold">YT</span></a>
            </div>
          </div>

          {/* Quick Links (Dynamic from Header Menu) */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">{t("store.browse_categories", "Explore")}</h4>
            <ul className="space-y-2.5 text-sm font-light">
              {exploreItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.url.startsWith("/") || item.url.startsWith("http") ? item.url : `/${item.url}`}
                    className="hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-700 transition-colors" style={{ backgroundColor: primaryColor }} />
                    <span>{translateMenuLabel(item.label, t)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service (Dynamic from Footer Menu) */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">{t("store.support_247", "Support")}</h4>
            <ul className="space-y-2.5 text-sm font-light">
              {supportItems.map((item) => (
                <li key={item.id}>
                  <Link
                    href={item.url.startsWith("/") || item.url.startsWith("http") ? item.url : `/${item.url}`}
                    className="hover:text-white transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1 h-1 rounded-full bg-gray-700 transition-colors" style={{ backgroundColor: primaryColor }} />
                    <span>{translateMenuLabel(item.label, t)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">{t("menu_label.contact_us", "Contact")}</h4>
            <ul className="space-y-3 text-sm font-light">
              {contactEmail && (
                <li className="flex gap-2 items-center">
                  <span className="font-medium" style={{ color: primaryColor }}>Email:</span>
                  <a dir="ltr" href={`mailto:${contactEmail}`} className="hover:text-white transition-colors">{contactEmail}</a>
                </li>
              )}
              {contactPhone && (
                <li className="flex gap-2 items-center">
                  <span className="font-medium" style={{ color: primaryColor }}>Phone:</span>
                  <span dir="ltr" className="hover:text-white transition-colors cursor-default">{contactPhone}</span>
                </li>
              )}
              <li className="flex gap-2">
                <span className="font-medium" style={{ color: primaryColor }}>{t("store.support_247", "Support")}:</span>
                <span className="leading-relaxed">24/7</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-900 pt-6 flex flex-col md:flex-row items-center justify-between text-xs">
          <p className="font-light text-gray-500">
            &copy; {new Date().getFullYear()} <span className="text-gray-300 font-medium">{storeName}</span>. {t("store.rights_reserved", "All rights reserved.")}
          </p>
          <div className="flex gap-4 mt-4 md:mt-0 font-medium text-gray-700 tracking-wide">
            <span className="hover:text-gray-400 cursor-pointer transition-colors">VISA</span>
            <span className="hover:text-gray-400 cursor-pointer transition-colors">MASTERCARD</span>
            <span className="hover:text-gray-400 cursor-pointer transition-colors">PAYPAL</span>
            <span className="hover:text-gray-400 cursor-pointer transition-colors">APPLE PAY</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
