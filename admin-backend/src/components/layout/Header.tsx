"use client"

import { useState, useEffect } from "react"
import { Bell, Menu, Moon, Search, Sun, User, Store, ExternalLink, LogOut } from "lucide-react"
import Link from "next/link"
import { useTheme } from "@/components/theme-provider"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
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
import { buttonVariants } from "@/components/ui/button"
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
    <header className="sticky top-0 z-30 flex h-14 w-full shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
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

        <div className="hidden md:flex items-center text-sm font-medium text-muted-foreground">
          <span className="text-foreground">{mounted ? t("nav.dashboard", "Dashboard") : "Dashboard"}</span>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        <div className="relative hidden lg:block w-56">
          <Search className={cn("absolute top-2.5 h-4 w-4 text-muted-foreground", isRtl ? "right-2.5" : "left-2.5")} />
          <Input
            type="search"
            placeholder={mounted ? t("common.search", "Search...") : "Search..."}
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
          <Button variant="outline" size="sm" className="hidden sm:flex gap-1.5 text-foreground/80 border-border/60 hover:border-primary/40 hover:text-primary hover:bg-primary/5 text-xs h-8 font-medium rounded-lg transition-all">
            <ExternalLink className="h-3.5 w-3.5" />
            <span>{mounted ? t("nav.view_store", "View Store") : "View Store"}</span>
          </Button>
          <Button variant="ghost" size="icon" className="sm:hidden text-muted-foreground hover:text-primary h-8 w-8">
            <ExternalLink className="h-4 w-4" />
            <span className="sr-only">View Store</span>
          </Button>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="cursor-pointer text-muted-foreground hover:text-foreground"
          title={mounted ? (resolvedTheme === "dark" ? "الوضع الفاتح · Light Mode" : "الوضع الداكن · Dark Mode") : "تبديل المظهر"}
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
          <PopoverTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "relative" })}>
            <Bell className="h-5 w-5" />
            <span className={cn("absolute top-2 h-2 w-2 rounded-full bg-primary", isRtl ? "left-2" : "right-2")} />
            <span className="sr-only">Notifications</span>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="end">
            <div className="p-4 border-b font-semibold">Notifications</div>
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
            <Button variant="ghost" className="w-full text-primary rounded-none p-3 h-auto font-medium">
              View All
            </Button>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-semibold text-sm overflow-hidden" })}>
            {user?.image ? (
              <img src={user.image} alt={user.name || "Admin"} className="w-full h-full object-cover" />
            ) : (
              <span>{initials}</span>
            )}
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-semibold leading-none text-foreground">{user?.name || "مدير النظام"}</p>
                  <p className="text-xs leading-none text-muted-foreground truncate">
                    {user?.email || "admin@smomo.shop"}
                  </p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => { window.location.href = "/admin/profile" }}
              className="cursor-pointer flex items-center gap-2"
            >
              <User className="mr-2 h-4 w-4" />
              <span>الملف الشخصي (Profile)</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>تسجيل الخروج (Sign Out)</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
