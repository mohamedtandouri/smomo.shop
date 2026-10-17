"use client"

import { useState, useEffect } from "react"
import {
  Bell,
  Menu,
  Moon,
  Search,
  Sun,
  User,
  Store,
  ExternalLink,
  LogOut,
  ShieldCheck,
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useTheme } from "@/components/theme-provider"
import { useSession, signOut } from "next-auth/react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { LanguageSelector } from "@/components/layout/LanguageSelector"
import { CurrencySelector } from "@/components/layout/CurrencySelector"
import { useLocaleStore } from "@/store/useLocaleStore"
import { cn } from "@/lib/utils"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const { setTheme, resolvedTheme } = useTheme()
  const { data: session } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { t, direction } = useLocaleStore()
  const isRtl = direction === "rtl"

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
  }

  const isProfileActive =
    pathname === "/profile" ||
    pathname?.startsWith("/profile/") ||
    pathname === "/admin/profile" ||
    pathname?.startsWith("/admin/profile/")

  const isUsersActive =
    pathname === "/users" ||
    pathname?.startsWith("/users/") ||
    pathname === "/admin/users" ||
    pathname?.startsWith("/admin/users/")

  const getActiveSectionLabel = () => {
    if (!mounted) return "لوحة التحكم"
    if (isProfileActive) return t("nav.profile", "الملف الشخصي")
    if (isUsersActive) return t("nav.users", "إدارة المستخدمين")
    if (pathname?.startsWith("/admin/orders")) return t("nav.orders", "الطلبات")
    if (pathname?.startsWith("/admin/products")) return t("nav.products", "المنتجات")
    if (pathname?.startsWith("/admin/customers")) return t("nav.customers", "العملاء")
    if (pathname?.startsWith("/admin/marketing")) return t("nav.marketing", "التسويق")
    if (pathname?.startsWith("/admin/store")) return t("nav.store", "المتجر")
    if (pathname?.startsWith("/admin/settings")) return t("nav.settings", "الإعدادات")
    if (pathname?.startsWith("/admin/analytics")) return t("nav.analytics", "التحليلات")
    if (pathname?.startsWith("/admin/insights")) return t("nav.insights", "الرؤى والتقارير")
    if (pathname?.startsWith("/admin/invoices")) return t("nav.invoices", "الفواتير")
    if (pathname?.startsWith("/admin/apps")) return t("nav.apps", "التطبيقات")
    return t("nav.dashboard", "لوحة التحكم")
  }

  const user = session?.user
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "AD"

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur-xs px-4 sm:px-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden shrink-0"
          onClick={onMenuClick}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Sidebar</span>
        </Button>

        {/* Mobile Logo */}
        <div className="flex items-center gap-2 md:hidden font-bold text-lg tracking-tight shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-rose-600 text-white shadow-sm">
            <Store className="h-4 w-4" />
          </div>
          <span>Smomo</span>
        </div>

        <div className="hidden md:flex items-center gap-2.5 text-sm font-medium text-muted-foreground">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            <span>{getActiveSectionLabel()}</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="relative hidden lg:block w-56">
          <Search
            className={cn(
              "absolute top-2.5 h-4 w-4 text-muted-foreground",
              isRtl ? "right-2.5" : "left-2.5"
            )}
          />
          <Input
            type="search"
            placeholder={mounted ? t("common.search", "بحث...") : "بحث..."}
            className={cn(
              "w-full bg-muted/40 border border-border/50 hover:border-border focus:border-primary/50 focus-visible:ring-1 text-xs rounded-lg transition-all",
              isRtl ? "pr-9 pl-3 text-right" : "pl-9 pr-3 text-left"
            )}
          />
        </div>

        {/* Multi-Language Selector */}
        <LanguageSelector />

        {/* Multi-Currency Selector */}
        <CurrencySelector />

        <Link href="http://localhost:3001" target="_blank" title="Go to Storefront">
          <Button
            variant="outline"
            size="sm"
            className="hidden sm:flex gap-1.5 text-foreground/90 border-border/70 hover:border-primary/50 hover:text-primary hover:bg-primary/5 text-xs h-8 px-3 font-semibold rounded-lg shadow-2xs transition-all"
          >
            <ExternalLink className="h-3.5 w-3.5 text-primary" />
            <span>{mounted ? t("nav.view_store", "View Store") : "View Store"}</span>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="sm:hidden text-muted-foreground hover:text-primary h-8 w-8"
          >
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">View Store</span>
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="cursor-pointer text-muted-foreground hover:text-foreground"
          title={
            mounted
              ? resolvedTheme === "dark"
                ? "الوضع الفاتح · Light Mode"
                : "الوضع الداكن · Dark Mode"
              : "تبديل المظهر"
          }
        >
          {mounted ? (
            resolvedTheme === "dark" ? (
              <Moon className="h-[1.2rem] w-[1.2rem] text-indigo-400 transition-all duration-200" />
            ) : (
              <Sun className="h-[1.2rem] w-[1.2rem] text-amber-500 transition-all duration-200" />
            )
          ) : (
            <Sun className="h-[1.2rem] w-[1.2rem] opacity-60" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>

        <Popover>
          <PopoverTrigger
            className={buttonVariants({
              variant: "ghost",
              size: "icon",
              className: "relative",
            })}
          >
            <Bell className="h-5 w-5" />
            <span
              className={cn(
                "absolute top-2 h-2 w-2 rounded-full bg-primary",
                isRtl ? "left-2" : "right-2"
              )}
            />
            <span className="sr-only">Notifications</span>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b font-semibold">
              {mounted ? t("common.notifications", "الإشعارات") : "الإشعارات"}
            </div>
            <div className="max-h-80 overflow-y-auto">
              <div className="p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer">
                <p className="text-sm font-medium">New Order #1003</p>
                <p className="text-xs text-muted-foreground mt-1">Just now</p>
              </div>
              <div className="p-4 border-b hover:bg-muted/50 transition-colors cursor-pointer">
                <p className="text-sm font-medium">Product stock running low</p>
                <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
              </div>
            </div>
            <Button
              variant="ghost"
              className="w-full text-primary rounded-none p-3 h-auto font-medium"
            >
              View All
            </Button>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              "h-8 w-8 rounded-full font-semibold text-sm overflow-hidden transition-all cursor-pointer",
              isProfileActive
                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background shadow-sm"
                : "bg-primary/10 hover:bg-primary/20 text-primary"
            )}
            title={mounted ? t("nav.profile", "Profile") : "Profile"}
          >
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || "Admin"}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{initials}</span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-60 p-1.5" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal px-2 py-2">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-bold leading-none text-foreground">
                    {user?.name || (mounted ? t("common.profile", "Admin") : "Admin")}
                  </p>
                  <p
                    className="text-xs leading-none text-muted-foreground truncate"
                    dir="ltr"
                  >
                    {user?.email || "admin@smomo.shop"}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => router.push("/profile")}
              className={cn(
                "cursor-pointer flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 transition-colors",
                isProfileActive
                  ? "bg-primary/10 text-primary font-semibold focus:bg-primary/15 focus:text-primary"
                  : "text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <User
                  className={cn(
                    "h-4 w-4",
                    isProfileActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>{mounted ? t("nav.profile", "Profile") : "Profile"}</span>
              </div>
              {isProfileActive && (
                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
              )}
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => router.push("/users")}
              className={cn(
                "cursor-pointer flex items-center justify-between gap-2 rounded-lg px-2.5 py-2 mt-0.5 transition-colors",
                isUsersActive
                  ? "bg-primary/10 text-primary font-semibold focus:bg-primary/15 focus:text-primary"
                  : "text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck
                  className={cn(
                    "h-4 w-4",
                    isUsersActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span>{mounted ? t("nav.users", "User Management") : "User Management"}</span>
              </div>
              {isUsersActive && (
                <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2 rounded-lg px-2.5 py-2"
            >
              <LogOut className="h-4 w-4" />
              <span>{mounted ? t("common.logout", "Sign Out") : "Sign Out"}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
