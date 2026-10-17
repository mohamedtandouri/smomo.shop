"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, LogOut, LayoutDashboard, ShoppingBag, ChevronDown } from "lucide-react"
import { signOut } from "next-auth/react"
import { useLocaleStore } from "@/store/useLocaleStore"

export interface UserProfileDropdownProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

/**
 * UserProfileDropdown Component
 * 
 * حل متكامل لمشكلة فجوة التمرير (Hover Gap) عبر تطبيق نمط النقر المباشر (Click-to-Open).
 * يدعم إغلاق القائمة عند النقر الخارجي (Click Outside)، مفتاح Escape، وتغيير المسار.
 * متوافق بالكامل مع معايير الوصول (WAI-ARIA).
 */
export function UserProfileDropdown({ user }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()
  const { t } = useLocaleStore()

  // إغلاق القائمة تلقائياً عند تغيير الصفحة / المسار
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // الاستماع للنقر الخارجي (Click Outside) والضغط على مفتاح Escape
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
        // إعادة التركيز إلى زر الفتح لتسهيل الملاحة عبر لوحة المفاتيح
        triggerRef.current?.focus()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className="relative inline-block text-start">
      {/* مشغل القائمة (Trigger Button) - يعتمد على النقر بدلاً من Hover */}
      <button
        ref={triggerRef}
        type="button"
        onClick={toggleDropdown}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls="user-profile-menu"
        aria-label="قائمة الملف الشخصي"
        className={`p-2 text-gray-600 hover:text-gray-900 rounded-full transition-colors flex items-center justify-center cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
          isOpen ? "bg-gray-100 text-gray-900" : "hover:bg-gray-50"
        }`}
      >
        {user.image ? (
          <img
            src={user.image}
            alt={user.name || "User Avatar"}
            className="w-5 h-5 rounded-full object-cover"
          />
        ) : (
          <User className="w-[18px] h-[18px]" />
        )}
      </button>

      {/* حاوية القائمة المنسدلة (Dropdown Menu) - تظهر فقط عندما تكون isOpen = true */}
      {isOpen && (
        <div
          id="user-profile-menu"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="user-profile-button"
          className="absolute end-0 mt-2 w-52 bg-white border border-gray-100 rounded-xl shadow-lg py-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150 focus:outline-none"
        >
          {/* معلومات المستخدم المسجل */}
          <div className="px-4 py-2 border-b border-gray-50">
            <p className="text-[11px] font-medium text-gray-400">
              {t("common.profile", "Signed in as")}
            </p>
            <p className="text-sm font-semibold text-gray-800 truncate">
              {user.name || user.email || "User"}
            </p>
            {user.name && user.email && (
              <p className="text-xs text-gray-400 truncate mt-0.5">
                {user.email}
              </p>
            )}
          </div>

          {/* روابط القائمة */}
          <div className="py-1">
            <Link
              href="/store/dashboard"
              role="menuitem"
              onClick={handleClose}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-gray-400" />
              <span>{t("nav.dashboard", "Dashboard")}</span>
            </Link>

            <Link
              href="/store/dashboard/orders"
              role="menuitem"
              onClick={handleClose}
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-gray-400" />
              <span>{t("nav.orders", "My Orders")}</span>
            </Link>
          </div>

          {/* فاصل */}
          <div className="border-t border-gray-50 my-1" />

          {/* زر تسجيل الخروج */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              handleClose()
              signOut({ callbackUrl: "/store" })
            }}
            className="flex items-center gap-2.5 w-full text-start px-4 py-2 text-sm text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>{t("common.logout", "Sign Out")}</span>
          </button>
        </div>
      )}
    </div>
  )
}
