"use client"

/**
 * ============================================================================
 * مكون السحب والإفلات التفاعلي للهيدر (Interactive Header Drag & Drop Builder)
 * ============================================================================
 * يتيح للمستخدم سحب عناصر الهيدر (Logo, Search, User, Cart, Currency, Language)
 * وإعادة ترتيبها أو إفلاتها في منطقة "Drop unwanted items here" لإخفائها
 * مع تأثيرات حركية سلسة باستخدام Framer Motion.
 */

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Menu,
  Search,
  User,
  ShoppingCart,
  Globe,
  Coins,
  GripVertical,
  RotateCcw,
  EyeOff,
  Plus,
} from "lucide-react"
import {
  HeaderItemId,
  HEADER_DRAGGABLE_ITEMS,
  MobileHeaderConfig,
  DesktopHeaderConfig,
  sanitizeText,
} from "@/lib/theme-config"
import { ColorPickerField, ThemeToggleSwitch } from "./ThemeAtoms"

interface HeaderDragDropBuilderProps {
  mode: "mobile" | "desktop"
  mobileConfig: MobileHeaderConfig
  desktopConfig: DesktopHeaderConfig
  brandName: string
  brandLogoUrl?: string
  onUpdateMobile: (updated: MobileHeaderConfig) => void
  onUpdateDesktop: (updated: DesktopHeaderConfig) => void
}

export function HeaderDragDropBuilder({
  mode,
  mobileConfig,
  desktopConfig,
  brandName,
  brandLogoUrl,
  onUpdateMobile,
  onUpdateDesktop,
}: HeaderDragDropBuilderProps) {
  const [draggedItem, setDraggedItem] = useState<HeaderItemId | null>(null)
  const [dragSource, setDragSource] = useState<"active" | "hidden" | null>(null)
  const [isOverHiddenZone, setIsOverHiddenZone] = useState(false)
  const [isOverActiveZone, setIsOverActiveZone] = useState(false)

  const currentConfig = mode === "mobile" ? mobileConfig : desktopConfig
  const activeItems = currentConfig.activeItems
  const hiddenItems = currentConfig.hiddenItems

  // تحديث قوائم العناصر النشطة والمخفية
  const updateItems = (newActive: HeaderItemId[], newHidden: HeaderItemId[]) => {
    if (mode === "mobile") {
      onUpdateMobile({
        ...mobileConfig,
        activeItems: newActive,
        hiddenItems: newHidden,
      })
    } else {
      onUpdateDesktop({
        ...desktopConfig,
        activeItems: newActive,
        hiddenItems: newHidden,
      })
    }
  }

  // إخفاء عنصر ونقله إلى منطقة العناصر غير المرغوبة
  const moveItemToHidden = (itemId: HeaderItemId) => {
    if (!activeItems.includes(itemId)) return
    const nextActive = activeItems.filter((id) => id !== itemId)
    const nextHidden = hiddenItems.includes(itemId) ? hiddenItems : [...hiddenItems, itemId]
    updateItems(nextActive, nextHidden)
  }

  // استعادة عنصر من منطقة الإخفاء إلى شريط الهيدر النشط
  const restoreItemToActive = (itemId: HeaderItemId) => {
    const nextHidden = hiddenItems.filter((id) => id !== itemId)
    const nextActive = activeItems.includes(itemId) ? activeItems : [...activeItems, itemId]
    updateItems(nextActive, nextHidden)
  }

  // إعادة ترتيب العناصر داخل الهيدر النشط عند السحب فوق عنصر آخر
  const reorderActiveItem = (draggedId: HeaderItemId, targetId: HeaderItemId) => {
    if (draggedId === targetId) return
    const list = [...activeItems]
    const fromIdx = list.indexOf(draggedId)
    const toIdx = list.indexOf(targetId)
    if (fromIdx === -1 || toIdx === -1) return
    list.splice(fromIdx, 1)
    list.splice(toIdx, 0, draggedId)
    updateItems(list, hiddenItems)
  }

  // استرجاع أيقونة كل عنصر في الهيدر
  const renderItemIcon = (itemId: HeaderItemId, color?: string) => {
    const style = color ? { color } : undefined
    switch (itemId) {
      case "logo":
        return (
          <div className="flex items-center gap-2" style={style}>
            <Menu className="h-4 w-4 shrink-0" />
            <span className="text-xs font-semibold tracking-tight">Logo</span>
          </div>
        )
      case "search":
        return <Search className="h-4 w-4" style={style} />
      case "user":
        return <User className="h-4 w-4" style={style} />
      case "cart":
        return <ShoppingCart className="h-4 w-4" style={style} />
      case "currency":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
            <Coins className="h-3 w-3" /> EUR (€)
          </span>
        )
      case "language":
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
            <Globe className="h-3 w-3" /> US
          </span>
        )
      default:
        return null
    }
  }

  const getItemLabel = (itemId: HeaderItemId) => {
    return HEADER_DRAGGABLE_ITEMS.find((i) => i.id === itemId)?.label || itemId
  }

  const hasLogoInActive = activeItems.includes("logo")
  const utilityItemsInActive = activeItems.filter((item) => item !== "logo")

  return (
    <div className="space-y-6">
      {/* =================================================================== */}
      {/* 1. منطقة الهيدر التفاعلية (Active Navbar Drag Bar - مطابقة للصورة 1) */}
      {/* =================================================================== */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-gray-500">
            {mode === "mobile"
              ? "Active Mobile Navbar Layout (Drag items to reorder or hide)"
              : "Active Desktop Header Layout (Drag items to reorder or hide)"}
          </span>
          {hiddenItems.length > 0 && (
            <button
              type="button"
              onClick={() =>
                updateItems(
                  mode === "mobile"
                    ? ["logo", "search", "user", "cart"]
                    : ["logo", "currency", "language", "search", "user", "cart"],
                  []
                )
              }
              className="inline-flex items-center gap-1 text-xs font-medium text-[#BE123C] hover:underline"
            >
              <RotateCcw className="w-3 h-3" />
              Restore default items
            </button>
          )}
        </div>

        <motion.div
          onDragOver={(e) => {
            e.preventDefault()
            setIsOverActiveZone(true)
          }}
          onDragLeave={() => setIsOverActiveZone(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsOverActiveZone(false)
            if (draggedItem && dragSource === "hidden") {
              restoreItemToActive(draggedItem)
            }
            setDraggedItem(null)
            setDragSource(null)
          }}
          style={{
            backgroundColor: currentConfig.background || "#FFFFFF",
            borderColor: currentConfig.borderEnabled
              ? currentConfig.borderColor || "#F0F0F0"
              : "#E5E7EB",
          }}
          className={`rounded-xl p-3.5 flex items-center justify-between transition-all shadow-2xs border ${
            isOverActiveZone ? "ring-2 ring-[#E11D48]/30 border-[#E11D48]" : "border-gray-200"
          }`}
        >
          {/* الجانب الأيسر: عنصر الشعار والقائمة (Logo) */}
          <div className="flex items-center gap-3">
            <AnimatePresence mode="popLayout">
              {hasLogoInActive ? (
                <motion.div
                  key="logo"
                  layout
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.96 }}
                  draggable
                  onDragStart={() => {
                    setDraggedItem("logo")
                    setDragSource("active")
                  }}
                  onDragEnd={() => {
                    setDraggedItem(null)
                    setDragSource(null)
                    setIsOverHiddenZone(false)
                  }}
                  title="Drag to 'Drop unwanted items here' to hide Logo"
                  className="flex items-center gap-2 border border-dashed border-gray-300 hover:border-[#E11D48] rounded-lg px-3.5 py-2 cursor-grab active:cursor-grabbing bg-white/90 shadow-2xs select-none group"
                >
                  {renderItemIcon("logo", currentConfig.buttonsColor)}
                </motion.div>
              ) : (
                <div className="text-xs text-gray-400 italic px-2 py-1 border border-dashed border-gray-200 rounded-lg">
                  Logo hidden
                </div>
              )}
            </AnimatePresence>

            {/* روابط سطح المكتب في حال كان الوضع Desktop */}
            {mode === "desktop" && (
              <div className="hidden md:flex items-center gap-4 pl-4 text-xs font-medium text-gray-500">
                <span style={{ color: desktopConfig.activeLinkColor || "#4F46E5" }} className="font-semibold">
                  Home
                </span>
                <span>All Products</span>
                <span>Categories</span>
                <span>About Us</span>
                <span>Contact Us</span>
              </div>
            )}
          </div>

          {/* الجانب الأيمن: أيقونات الأدوات (Search, User, Cart, Currency, Language) */}
          <div className="flex items-center gap-1.5 border border-dashed border-gray-300 rounded-lg px-3 py-1.5 min-h-[38px] bg-white/90">
            <AnimatePresence mode="popLayout">
              {utilityItemsInActive.length > 0 ? (
                utilityItemsInActive.map((itemId) => (
                  <motion.div
                    key={itemId}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.75 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.92 }}
                    draggable
                    onDragStart={() => {
                      setDraggedItem(itemId)
                      setDragSource("active")
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      if (draggedItem && draggedItem !== "logo" && dragSource === "active") {
                        reorderActiveItem(draggedItem, itemId)
                      }
                    }}
                    onDragEnd={() => {
                      setDraggedItem(null)
                      setDragSource(null)
                      setIsOverHiddenZone(false)
                    }}
                    title={`Drag ${getItemLabel(itemId)} to reorder or drop below to hide`}
                    className={`p-1.5 rounded-md cursor-grab active:cursor-grabbing hover:bg-gray-100/80 transition-colors flex items-center justify-center ${
                      draggedItem === itemId ? "opacity-40 bg-rose-50" : ""
                    }`}
                  >
                    {renderItemIcon(itemId, currentConfig.buttonsColor)}
                  </motion.div>
                ))
              ) : (
                <span className="text-[11px] text-gray-400 px-2">All action icons hidden</span>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* =================================================================== */}
      {/* 2. منطقة إفلات العناصر غير المرغوبة (Drop Unwanted Items Here)     */}
      {/* =================================================================== */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-gray-500 block">
          Drop unwanted items here
        </label>

        <motion.div
          onDragOver={(e) => {
            e.preventDefault()
            setIsOverHiddenZone(true)
          }}
          onDragLeave={() => setIsOverHiddenZone(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsOverHiddenZone(false)
            if (draggedItem && dragSource === "active") {
              moveItemToHidden(draggedItem)
            }
            setDraggedItem(null)
            setDragSource(null)
          }}
          animate={{
            scale: isOverHiddenZone ? 1.01 : 1,
            borderColor: isOverHiddenZone ? "#E11D48" : "#E5E7EB",
            backgroundColor: isOverHiddenZone ? "rgba(255, 241, 242, 0.65)" : "rgba(249, 250, 251, 0.55)",
          }}
          transition={{ duration: 0.18 }}
          className="border-2 border-dashed rounded-xl min-h-[104px] p-4 flex flex-col items-center justify-center text-center transition-colors"
        >
          {hiddenItems.length === 0 ? (
            <div className="space-y-1 pointer-events-none">
              <p className="text-xs text-gray-400 font-medium">
                {mode === "mobile"
                  ? "Drag and drop here to hide from mobile navbar"
                  : "Drag and drop here to hide from desktop header"}
              </p>
            </div>
          ) : (
            <div className="w-full space-y-3">
              <p className="text-[11px] text-gray-400">
                Hidden items (drag back to navbar or click to restore):
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <AnimatePresence>
                  {hiddenItems.map((itemId) => (
                    <motion.div
                      key={itemId}
                      layout
                      initial={{ opacity: 0, y: 8, scale: 0.9 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      draggable
                      onDragStart={() => {
                        setDraggedItem(itemId)
                        setDragSource("hidden")
                      }}
                      onDragEnd={() => {
                        setDraggedItem(null)
                        setDragSource(null)
                        setIsOverActiveZone(false)
                      }}
                      onClick={() => restoreItemToActive(itemId)}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-[#E11D48] text-xs font-medium text-gray-700 shadow-2xs cursor-pointer group"
                    >
                      <GripVertical className="w-3.5 h-3.5 text-gray-400" />
                      <EyeOff className="w-3.5 h-3.5 text-rose-500" />
                      <span>{getItemLabel(itemId)}</span>
                      <span className="ml-1 inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-semibold group-hover:underline">
                        <Plus className="w-3 h-3" /> Restore
                      </span>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* =================================================================== */}
      {/* 3. إعدادات ألوان وحدود الهيدر (Header Colors & Border Controls)     */}
      {/* =================================================================== */}
      {mode === "mobile" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <ColorPickerField
            label="Header background"
            value={mobileConfig.background}
            onChange={(hex) => onUpdateMobile({ ...mobileConfig, background: hex })}
          />

          <ColorPickerField
            label="Header buttons color"
            value={mobileConfig.buttonsColor}
            onChange={(hex) => onUpdateMobile({ ...mobileConfig, buttonsColor: hex })}
          />

          <ThemeToggleSwitch
            label="Header border"
            checked={mobileConfig.borderEnabled}
            onChange={(checked) => onUpdateMobile({ ...mobileConfig, borderEnabled: checked })}
          />

          <ColorPickerField
            label="Header border color"
            value={mobileConfig.borderColor}
            disabled={!mobileConfig.borderEnabled}
            onChange={(hex) => onUpdateMobile({ ...mobileConfig, borderColor: hex })}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          <ColorPickerField
            label="Header background"
            value={desktopConfig.background}
            onChange={(hex) => onUpdateDesktop({ ...desktopConfig, background: hex })}
          />

          <ColorPickerField
            label="Header buttons color"
            value={desktopConfig.buttonsColor}
            onChange={(hex) => onUpdateDesktop({ ...desktopConfig, buttonsColor: hex })}
          />

          <ColorPickerField
            label="Navigation text color"
            value={desktopConfig.textColor}
            onChange={(hex) => onUpdateDesktop({ ...desktopConfig, textColor: hex })}
          />

          <ColorPickerField
            label="Active link highlight color"
            value={desktopConfig.activeLinkColor}
            onChange={(hex) => onUpdateDesktop({ ...desktopConfig, activeLinkColor: hex })}
          />

          <ThemeToggleSwitch
            label="Header border"
            checked={desktopConfig.borderEnabled}
            onChange={(checked) => onUpdateDesktop({ ...desktopConfig, borderEnabled: checked })}
          />

          <ColorPickerField
            label="Header border color"
            value={desktopConfig.borderColor}
            disabled={!desktopConfig.borderEnabled}
            onChange={(hex) => onUpdateDesktop({ ...desktopConfig, borderColor: hex })}
          />

          <div className="md:col-span-2">
            <ThemeToggleSwitch
              label="Sticky header on scroll"
              description="Keep the desktop navigation bar fixed at the top when customers scroll"
              checked={desktopConfig.sticky}
              onChange={(checked) => onUpdateDesktop({ ...desktopConfig, sticky: checked })}
            />
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. معاينة حية مصغرة للهيدر (Live Sanitized Header Preview)           */}
      {/* =================================================================== */}
      <div className="pt-2 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-600">
            Live {mode === "mobile" ? "Mobile" : "Desktop"} Header Preview
          </span>
          <span className="text-[11px] text-gray-400">
            Updates automatically as you drag items or pick colors
          </span>
        </div>

        <div
          style={{
            backgroundColor: currentConfig.background || "#FFFFFF",
            borderBottom: currentConfig.borderEnabled
              ? `2px solid ${currentConfig.borderColor || "#F0F0F0"}`
              : "none",
          }}
          className="rounded-xl px-5 py-3.5 shadow-sm border border-gray-200/80 flex items-center justify-between transition-all"
        >
          {/* الشعار في المعاينة الحية */}
          <div className="flex items-center gap-3">
            {hasLogoInActive && (
              <div className="flex items-center gap-2.5">
                {mode === "mobile" && (
                  <Menu className="w-5 h-5" style={{ color: currentConfig.buttonsColor }} />
                )}
                {brandLogoUrl ? (
                  <div
                    role="img"
                    aria-label={sanitizeText(brandName, 60)}
                    className="h-7 w-28 bg-contain bg-left bg-no-repeat"
                    style={{ backgroundImage: `url("${brandLogoUrl}")` }}
                  />
                ) : (
                  <span
                    className="text-base font-extrabold tracking-tight"
                    style={{ color: currentConfig.buttonsColor }}
                  >
                    {sanitizeText(brandName || "StockBureaux", 40)}
                    <span className="text-[#E11D48]">.</span>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* روابط سطح المكتب في المعاينة */}
          {mode === "desktop" && (
            <div
              className="hidden sm:flex items-center gap-6 text-xs font-medium"
              style={{ color: desktopConfig.textColor || "#4B5563" }}
            >
              <span
                className="font-semibold"
                style={{ color: desktopConfig.activeLinkColor || "#4F46E5" }}
              >
                Home
              </span>
              <span>All Products</span>
              <span>Categories</span>
              <span>About Us</span>
              <span>Contact Us</span>
            </div>
          )}

          {/* الأيقونات النشطة في المعاينة */}
          <div className="flex items-center gap-3">
            {utilityItemsInActive.map((itemId) => (
              <div key={itemId} className="flex items-center">
                {renderItemIcon(itemId, currentConfig.buttonsColor)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
