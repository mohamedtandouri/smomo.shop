"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { ShoppingCart, Menu, X, Search, User } from "lucide-react"
import { useCartStore } from "@/store/useCartStore"
import { useLocaleStore, translateMenuLabel } from "@/store/useLocaleStore"
import { LanguageSelector } from "@/components/layout/LanguageSelector"
import { CurrencySelector } from "@/components/layout/CurrencySelector"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { UserProfileDropdown } from "./UserProfileDropdown"
import { StoreMenuItem } from "@/lib/store-storage"

export interface HeaderBarConfigProps {
  activeItems?: string[]
  hiddenItems?: string[]
  background?: string
  buttonsColor?: string
  textColor?: string
  activeLinkColor?: string
  borderEnabled?: boolean
  borderColor?: string
  sticky?: boolean
}

interface StorefrontNavbarProps {
  storeName?: string
  logoUrl?: string | null
  primaryColor?: string
  headerLinks?: StoreMenuItem[]
  defaultLocale?: string
  headerConfig?: HeaderBarConfigProps
  mobileConfig?: HeaderBarConfigProps
}

export function StorefrontNavbar({ 
  storeName = "Smomo", 
  logoUrl, 
  primaryColor = "#ff2d55",
  headerLinks,
  headerConfig,
  mobileConfig,
}: StorefrontNavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const { t } = useLocaleStore()
  
  const cartItemCount = useCartStore((state) => state.getTotalItems())

  const isSticky = headerConfig?.sticky !== false
  const activeBg = headerConfig?.background || "#FFFFFF"
  const activeButtonsColor = headerConfig?.buttonsColor || "#111827"
  const activeTextColor = headerConfig?.textColor || "#4B5563"
  const activeLinkColor = headerConfig?.activeLinkColor || primaryColor || "#4F46E5"
  const hasBorder = headerConfig?.borderEnabled !== false
  const borderColor = headerConfig?.borderColor || "#F0F0F0"

  const hiddenDesktop = headerConfig?.hiddenItems || []
  const hiddenMobile = mobileConfig?.hiddenItems || []

  const showLogo = !hiddenDesktop.includes("logo")
  const showSearch = !hiddenDesktop.includes("search")
  const showUser = !hiddenDesktop.includes("user")
  const showCart = !hiddenDesktop.includes("cart")
  const showCurrency = !hiddenDesktop.includes("currency")
  const showLanguage = !hiddenDesktop.includes("language")

  useEffect(() => {
    const timer = setTimeout(() => setIsMounted(true), 0)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  // استخدام روابط الهيدر الديناميكية القادمة من لوحة التحكم مع ترجمة التسميات تلقائياً
  const navLinks = (headerLinks && headerLinks.length > 0)
    ? [...headerLinks]
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((item) => ({
          id: item.id,
          name: translateMenuLabel(item.label, t),
          href: item.url.startsWith("/") || item.url.startsWith("http") ? item.url : `/${item.url}`,
        }))
    : [
        { id: "home", name: t("store.home", "Home"), href: "/store" },
        { id: "products", name: t("store.products", "Products"), href: "/store/products" },
        { id: "categories", name: t("store.categories", "Categories"), href: "/store/categories" },
      ]

  return (
    <header 
      className={`w-full transition-all duration-300 ${isSticky ? 'sticky top-0 z-50' : 'relative z-30'} ${
        isScrolled ? 'backdrop-blur-md shadow-xs py-0' : 'py-0'
      }`}
      style={{
        backgroundColor: activeBg,
        borderBottom: hasBorder ? `1px solid ${borderColor}` : "none",
      }}
    >
      <div className="container mx-auto px-4 max-w-6xl h-16 flex items-center justify-between">
        {/* Dynamic Logo / Store Name */}
        {showLogo ? (
          <Link href="/store" className="flex items-center gap-2 group">
            {logoUrl && !logoError ? (
              <img 
                src={logoUrl} 
                alt={storeName} 
                onError={() => setLogoError(true)}
                className="h-9 max-w-[160px] object-contain" 
              />
            ) : (
              <span 
                className="text-xl font-bold tracking-tight"
                style={{ color: activeButtonsColor }}
              >
                {storeName.toUpperCase()}<span style={{ color: activeLinkColor }}>.</span>
              </span>
            )}
          </Link>
        ) : <div />}

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/store' && pathname?.startsWith(link.href))
            return (
              <Link 
                key={link.id || link.href} 
                href={link.href} 
                style={isActive ? { color: activeLinkColor } : { color: activeTextColor }}
                className={`text-sm font-medium transition-all hover:-translate-y-0.5 ${isActive ? 'font-semibold' : 'hover:opacity-90'}`}
              >
                {link.name}
              </Link>
            )
          })}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2" style={{ color: activeButtonsColor }}>
          {/* Currency & Language selectors */}
          <div className="hidden sm:flex items-center gap-1.5 mr-1">
            {showCurrency && <CurrencySelector variant="compact" />}
            {showLanguage && <LanguageSelector variant="compact" />}
          </div>

          {showSearch && (
            <button 
              className="p-2 hover:bg-black/5 rounded-full transition-all hidden sm:block" 
              aria-label="Search"
              style={{ color: activeButtonsColor }}
            >
              <Search className="w-[18px] h-[18px]" />
            </button>
          )}
          
          {showUser && (
            session ? (
              <div className="hidden sm:block">
                <UserProfileDropdown user={session.user || {}} />
              </div>
            ) : (
              <Link 
                href="/store/login" 
                className="text-xs font-semibold px-3 py-2 rounded-lg hover:bg-black/5 transition-all hidden sm:block"
                style={{ color: activeButtonsColor }}
              >
                {t("common.profile", "Login")}
              </Link>
            )
          )}

          {/* Cart Icon */}
          {showCart && (
            <Link 
              href="/store/cart" 
              className="relative p-2 rounded-full transition-all hover:bg-black/5" 
              aria-label="Shopping Cart"
              style={{ color: activeButtonsColor }}
            >
              <ShoppingCart className="w-[20px] h-[20px]" />
              {isMounted && cartItemCount > 0 && (
                <span 
                  className="absolute top-0.5 right-0.5 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-xs animate-in zoom-in-50"
                  style={{ backgroundColor: activeLinkColor }}
                >
                  {cartItemCount}
                </span>
              )}
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            className="p-2 md:hidden ml-1"
            style={{ color: activeButtonsColor }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-gray-100 bg-white/95 backdrop-blur-md px-4 pt-2 pb-6 space-y-3">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href !== '/store' && pathname?.startsWith(link.href))
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={isActive ? { color: primaryColor } : {}}
                  className={`px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-gray-50 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  {link.name}
                </Link>
              )
            })}
          </nav>
          <div className="border-t border-gray-100 pt-3 flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <CurrencySelector variant="compact" />
              <LanguageSelector variant="compact" />
            </div>
          </div>
          <div className="border-t border-gray-100 pt-2 flex flex-col gap-2">
            {session ? (
              <>
                <Link 
                  href="/store/dashboard" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <User className="w-4 h-4" /> My Account ({session.user?.name || 'User'})
                </Link>
                <button 
                  onClick={() => { signOut({ callbackUrl: "/store" }); setIsMobileMenuOpen(false); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link 
                href="/store/login" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-sm font-semibold text-center text-white rounded-md"
                style={{ backgroundColor: primaryColor }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
