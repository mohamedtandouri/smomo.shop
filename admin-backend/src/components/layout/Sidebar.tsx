"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  BarChart,
  FileText,
  Settings,
  Grid,
  ChevronDown,
  TrendingUp,
  Menu,
  ShoppingCart,
  AlertCircle,
  PlusCircle,
  Folder,
  Star,
  Store,
  List,
  Plus,
  Tag,
  Ticket,
  Megaphone,
  BarChart3,
  Palette,
  LayoutTemplate,
  Globe,
  Filter,
} from "lucide-react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useLocaleStore } from "@/store/useLocaleStore"

type MenuItem = {
  name: string
  key: string
  icon: React.ElementType
  href: string
  badge?: string
  subItems?: { name: string; key: string; href: string; icon?: React.ElementType }[]
}

const menuItems: MenuItem[] = [
  { name: "Dashboard", key: "nav.dashboard", icon: LayoutDashboard, href: "/admin" },
  { 
    name: "Orders", 
    key: "nav.orders",
    icon: ShoppingBag, 
    href: "/admin/orders",
    subItems: [
      { name: "All Orders", key: "nav.all_orders", href: "/admin/orders", icon: Package },
      { name: "New Order", key: "nav.new_order", href: "/admin/orders/new", icon: ShoppingCart },
      { name: "Abandoned Carts", key: "nav.abandoned_carts", href: "/admin/orders/abandoned", icon: AlertCircle },
    ]
  },
  { 
    name: "Products", 
    key: "nav.products",
    icon: Package, 
    href: "/admin/products",
    subItems: [
      { name: "All Products", key: "nav.all_products", href: "/admin/products", icon: Package },
      { name: "New Product", key: "nav.new_product", href: "/admin/products/new", icon: PlusCircle },
      { name: "Categories", key: "nav.categories", href: "/admin/products/categories", icon: Folder },
      { name: "Reviews", key: "nav.reviews", href: "/admin/products/reviews", icon: Star },
      { name: "Inventory", key: "nav.inventory", href: "/admin/products/inventory", icon: Store },
    ]
  },
  { 
    name: "Marketing", 
    key: "nav.marketing",
    icon: Megaphone, 
    href: "/admin/marketing",
    subItems: [
      { name: "Overview", key: "nav.overview", href: "/admin/marketing", icon: LayoutDashboard },
      { name: "Coupons", key: "nav.coupons", href: "/admin/marketing/coupons", icon: Tag },
      { name: "Up Sells", key: "nav.upsells", href: "/admin/marketing/upsells", icon: TrendingUp },
    ]
  },
  { 
    name: "Store", 
    key: "nav.store",
    icon: Store, 
    href: "/admin/store",
    subItems: [
      { name: "Store", key: "nav.store", href: "/admin/store", icon: Store },
      { name: "Theme", key: "nav.theme", href: "/admin/store/theme", icon: Palette },
      { name: "Themes", key: "nav.themes", href: "/admin/store/themes", icon: LayoutTemplate },
      { name: "Menus", key: "nav.menus", href: "/admin/store/menus", icon: Menu },
      { name: "Languages", key: "nav.languages", href: "/admin/store/languages", icon: Globe },
      { name: "Pages", key: "nav.pages", href: "/admin/store/pages", icon: FileText },
      { name: "Funnels", key: "nav.funnels", href: "/admin/store/funnels", icon: Filter },
    ]
  },
  { name: "Customers", key: "nav.customers", icon: Users, href: "/admin/customers" },
  { name: "Analytics", key: "nav.analytics", icon: BarChart3, href: "/admin/analytics" },
  { name: "Insights", key: "nav.insights", icon: BarChart, href: "/admin/insights" },
  { name: "Invoices", key: "nav.invoices", icon: FileText, href: "/admin/invoices" },
  { name: "Apps", key: "nav.apps", icon: Grid, href: "/admin/apps" },
  { name: "Settings", key: "nav.settings", icon: Settings, href: "/admin/settings" },
]

export function Sidebar({ 
  className, 
  isDesktop = true,
  isPinned = false,
  onTogglePin
}: { 
  className?: string, 
  isDesktop?: boolean,
  isPinned?: boolean,
  onTogglePin?: () => void
}) {
  const pathname = usePathname()
  const { t, direction } = useLocaleStore()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Automatically open menus that contain the active path and close others
  useEffect(() => {
    const activeMenus: Record<string, boolean> = {}
    menuItems.forEach(item => {
      if (item.subItems) {
        if (item.subItems.some(sub => sub.href === pathname)) {
          activeMenus[item.name] = true
        }
      }
    })
    setOpenMenus(activeMenus)
  }, [pathname])

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => {
      if (prev[name]) {
        return {}
      }
      return { [name]: true }
    })
  }

  const isRtl = isMounted && direction === "rtl"

  return (
    <div 
      className={cn(
        "group flex h-full flex-col bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-in-out overflow-hidden custom-scrollbar",
        isRtl ? "border-l border-r-0" : "border-r border-l-0",
        isDesktop 
          ? (isPinned ? "w-64" : "w-16 hover:w-64") 
          : "w-64",
        className
      )}
    >
      <div className="flex h-14 items-center justify-between px-4 border-b shrink-0 transition-all duration-300">
        <div className="flex items-center gap-3 font-bold text-xl tracking-tight shrink-0">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-rose-600 text-white shadow-sm">
            <Store className="h-4.5 w-4.5" />
          </div>
          <span 
            className={cn(
              "logo-text whitespace-nowrap transition-opacity duration-300 tracking-tight",
              isDesktop && !isPinned ? "opacity-0 group-hover:opacity-100" : "opacity-100"
            )}
          >
            Smomo
          </span>
        </div>
        {isDesktop && (
          <button 
            onClick={onTogglePin}
            className={cn(
              "text-muted-foreground hover:text-foreground transition-opacity shrink-0 outline-none p-1 rounded-md hover:bg-muted/60",
              !isPinned ? "opacity-0 group-hover:opacity-100" : "opacity-100"
            )}
            title={isPinned ? "Collapse sidebar" : "Expand sidebar"}
          >
            <Menu className="h-[18px] w-[18px]" />
          </button>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto py-2 px-3 space-y-0.5 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
          const isOpen = openMenus[item.name]
          const label = isMounted ? t(item.key, item.name) : item.name

          return (
            <div key={item.name}>
              {item.subItems ? (
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={cn(
                    "w-full flex items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition-colors outline-none",
                    isActive || isOpen
                      ? "text-foreground font-semibold" 
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                  aria-expanded={isOpen}
                >
                  <div className="flex items-center gap-3 w-full">
                    <item.icon 
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-colors", 
                        (isActive || isOpen) ? "text-primary" : "text-muted-foreground"
                      )} 
                    />
                    <span 
                      className={cn(
                        "whitespace-nowrap truncate transition-opacity duration-300 text-left rtl:text-right flex-1",
                        isDesktop && !isPinned ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                      )}
                    >
                      {label}
                    </span>
                  </div>
                  <div 
                    className={cn(
                      "flex items-center gap-2 shrink-0 transition-opacity duration-300",
                      isDesktop && !isPinned ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                    )}
                  >
                    {item.badge && (
                      <span className="px-2 py-0.5 text-[10px] rounded-full font-bold bg-primary/10 text-primary border border-primary/20">
                        {item.badge}
                      </span>
                    )}
                    <ChevronDown className={cn("h-4 w-4 transition-transform duration-300 opacity-50", isOpen && "rotate-180")} />
                  </div>
                </button>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-2.5 py-2 text-sm font-medium transition-colors outline-none",
                    isActive 
                      ? "bg-primary/10 text-primary font-semibold shadow-xs" 
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}
                >
                  <div className="flex items-center gap-3 w-full">
                    <item.icon 
                      className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-colors", 
                        isActive ? "text-primary" : "text-muted-foreground"
                      )} 
                    />
                    <span 
                      className={cn(
                        "whitespace-nowrap truncate transition-opacity duration-300 text-left rtl:text-right flex-1",
                        isDesktop && !isPinned ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                      )}
                    >
                      {label}
                    </span>
                  </div>
                </Link>
              )}

              <AnimatePresence initial={false}>
                {item.subItems && isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className={cn(
                      "relative py-1 space-y-0.5 transition-[padding] duration-300",
                      isRtl 
                        ? (isDesktop && !isPinned ? "pr-0 group-hover:pr-[40px] pl-2" : "pr-[40px] pl-2")
                        : (isDesktop && !isPinned ? "pl-0 group-hover:pl-[40px] pr-2" : "pl-[40px] pr-2")
                    )}>
                      {/* Main vertical line for the sub-menu */}
                      <div className={cn(
                        "absolute top-0 bottom-[20px] w-[1px] bg-border/60 transition-opacity duration-300",
                        isRtl ? "right-[21px]" : "left-[21px]",
                        isDesktop && !isPinned ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                      )} />
                        
                        {item.subItems.map((subItem, index) => {
                          const activeIndex = item.subItems!.findIndex(sub => pathname === sub.href)
                          const isSubActive = index === activeIndex
                          const isAboveActive = activeIndex !== -1 && index < activeIndex
                          
                          return (
                            <Link
                              key={subItem.name}
                              href={subItem.href}
                              className={cn(
                                "relative flex items-center gap-3 px-2.5 py-1.5 text-sm rounded-lg transition-all duration-300 outline-none",
                                  isSubActive 
                                    ? cn(
                                        "text-primary font-medium",
                                        isDesktop && !isPinned ? "bg-transparent group-hover:bg-primary/5" : "bg-primary/5"
                                      )
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                              >
                                {/* Active line filler (above active item) */}
                                {isAboveActive && (
                                  <div 
                                    className={cn(
                                      "absolute top-[-4px] bottom-[-4px] w-[2px] bg-primary z-10 transition-opacity duration-300",
                                      isRtl ? "right-[-19px]" : "left-[-19px]",
                                      isDesktop && !isPinned ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                                    )} 
                                  />
                                )}
                                
                                {/* Active gap filler (for the active item itself) */}
                                {isSubActive && (
                                  <div 
                                    className={cn(
                                      "absolute top-[-4px] h-[4px] w-[2px] bg-primary z-10 transition-opacity duration-300",
                                      isRtl ? "right-[-19px]" : "left-[-19px]",
                                      isDesktop && !isPinned ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                                    )} 
                                  />
                                )}

                                {/* Branch indicator */}
                                <div 
                                  className={cn(
                                    "absolute top-0 h-[16px] w-[19px] bg-transparent transition-opacity duration-300",
                                    isRtl 
                                      ? "right-[-19px] rounded-br-[12px]" 
                                      : "left-[-19px] rounded-bl-[12px]",
                                    isSubActive 
                                      ? (isRtl ? "border-r-2 border-b-2 border-primary z-10" : "border-l-2 border-b-2 border-primary z-10")
                                      : (isRtl ? "border-r border-b border-border/60" : "border-l border-b border-border/60"),
                                    isDesktop && !isPinned ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                                  )} 
                                />
                                
                                {subItem.icon && (
                                  <subItem.icon 
                                    className={cn(
                                      "h-[18px] w-[18px] shrink-0 transition-colors duration-300",
                                      isSubActive ? "text-primary" : "text-muted-foreground"
                                    )} 
                                  />
                                )}
                                
                                <span 
                                  className={cn(
                                    "whitespace-nowrap transition-opacity duration-300",
                                    isDesktop && !isPinned ? "opacity-0 group-hover:opacity-100" : "opacity-100"
                                  )}
                                >
                                  {isMounted ? t(subItem.key, subItem.name) : subItem.name}
                                </span>
                              </Link>
                            )
                          })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
