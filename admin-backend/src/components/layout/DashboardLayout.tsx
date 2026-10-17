"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { Sidebar } from "./Sidebar"
import { Header } from "./Header"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"
import { useLocaleStore } from "@/store/useLocaleStore"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { direction } = useLocaleStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const isRtl = isMounted && direction === "rtl"

  // التحقق مما إذا كانت الصفحة الحالية صفحة مصادقة أو صفحة مستقلة (Login / Register / Unauthorized)
  const isAuthPage = 
    pathname === "/admin/login" || 
    pathname?.startsWith("/admin/login/") || 
    pathname === "/admin/register" || 
    pathname?.startsWith("/admin/register/") || 
    pathname === "/admin/unauthorized" || 
    pathname?.startsWith("/admin/unauthorized/")

  useEffect(() => {
    setIsMounted(true)
    try {
      const stored = localStorage.getItem("smomo_sidebar_pinned")
      if (stored !== null) {
        setIsPinned(stored === "true")
      }
    } catch {
      // Ignore localStorage security errors in private browsing
    }
  }, [])

  const handleTogglePin = () => {
    const newState = !isPinned
    setIsPinned(newState)
    try {
      localStorage.setItem("smomo_sidebar_pinned", String(newState))
    } catch {
      // Ignore
    }
  }

  // إذا كانت الصفحة صفحة تسجيل دخول أو إنشاء حساب: عرض المحتوى بكامل الشاشة دون القائمة الجانبية والشريط العلوي
  if (isAuthPage) {
    return (
      <div className="min-h-screen w-full bg-background" dir={direction}>
        {children}
      </div>
    )
  }

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden" dir={direction}>
      <div className="flex h-full w-full overflow-hidden bg-background">
        {/* Desktop Sidebar spacing & Fixed wrapper */}
        <div 
          className={cn(
            "hidden md:block shrink-0",
            isMounted ? "transition-[width] duration-300 ease-in-out" : "",
            isPinned ? "w-64" : "w-16"
          )} 
          aria-hidden="true" 
        />
        <div 
          className={cn(
            "hidden md:block fixed top-0 bottom-0 z-40 h-full transition-[left,right] duration-300",
            isRtl ? "right-0" : "left-0"
          )}
        >
          <Sidebar isDesktop={true} isPinned={isPinned} onTogglePin={handleTogglePin} />
        </div>

        {/* Mobile Sidebar: Render only after mount on mobile screens to prevent Portal hydration crashes */}
        {isMounted && !isDesktop && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetContent side={isRtl ? "right" : "left"} className="p-0 w-64 border-r-0 border-l-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <Sidebar isDesktop={false} />
            </SheetContent>
          </Sheet>
        )}

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden w-full min-w-0 transition-all duration-300">
          <Header onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto bg-muted/20 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
