"use client"

/**
 * ============================================================================
 * المكونات الذرية والجزيئية لوحدة إعدادات القالب (Atomic Design - Atoms & Molecules)
 * ============================================================================
 */

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Info, AlertCircle, ShieldCheck } from "lucide-react"
import { isValidHexColor } from "@/lib/theme-config"

/**
 * 1. مكون صندوق المعلومات الأزرق العصري (Modern Blue Info Alert Banner)
 * يطابق التصميم المرفق في الصورة الأولى تماماً
 */
interface InfoAlertBannerProps {
  message: string
  className?: string
}

export function InfoAlertBanner({ message, className = "" }: InfoAlertBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-3 bg-[#F3F8FF] border border-[#BFDBFE] text-[#1D4ED8] px-4 py-3 rounded-xl text-xs sm:text-sm shadow-2xs ${className}`}
    >
      <div className="w-5 h-5 rounded-full bg-blue-100/80 flex items-center justify-center shrink-0">
        <Info className="h-3.5 w-3.5 text-[#2563EB]" />
      </div>
      <span className="font-medium leading-relaxed">{message}</span>
    </motion.div>
  )
}

/**
 * 2. مكون منتقي الألوان المخصص (Custom HEX Color Picker Field)
 * يعرض مربع معاينة اللون مع حقل إدخال كود HEX والتحقق الفوري من الصيغة
 */
interface ColorPickerFieldProps {
  label: string
  value: string
  onChange: (hex: string) => void
  disabled?: boolean
}

export function ColorPickerField({
  label,
  value,
  onChange,
  disabled = false,
}: ColorPickerFieldProps) {
  const [localInput, setLocalInput] = useState(value || "#FFFFFF")
  const [isInvalid, setIsInvalid] = useState(false)

  useEffect(() => {
    setLocalInput(value || "#FFFFFF")
    setIsInvalid(false)
  }, [value])

  const handleTextChange = (raw: string) => {
    // السماح فقط بمحارف HEX القياسية والـ #
    const formatted = raw.startsWith("#") ? raw.toUpperCase() : `#${raw.toUpperCase()}`
    const cleaned = formatted.replace(/[^#0-9A-F]/g, "").slice(0, 7)
    setLocalInput(cleaned)

    if (isValidHexColor(cleaned)) {
      setIsInvalid(false)
      onChange(cleaned)
    } else {
      setIsInvalid(true)
    }
  }

  const safeColorValue = isValidHexColor(localInput) ? localInput : isValidHexColor(value) ? value : "#FFFFFF"

  return (
    <div
      className={`flex flex-col gap-1 p-3 rounded-xl border bg-white transition-all ${
        isInvalid
          ? "border-red-300 ring-2 ring-red-100"
          : "border-gray-100 hover:border-gray-200 shadow-2xs"
      } ${disabled ? "opacity-50 pointer-events-none" : ""}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium text-gray-700">{label}</span>

        <div className="flex items-center gap-2">
          {/* مربع اختيار اللون التفاعلي */}
          <label className="relative w-7 h-7 rounded-md border border-gray-300 overflow-hidden cursor-pointer shadow-2xs shrink-0 transition-transform hover:scale-105">
            <input
              type="color"
              value={safeColorValue.length === 4
                ? `#${safeColorValue[1]}${safeColorValue[1]}${safeColorValue[2]}${safeColorValue[2]}${safeColorValue[3]}${safeColorValue[3]}`
                : safeColorValue}
              onChange={(e) => {
                const upper = e.target.value.toUpperCase()
                setLocalInput(upper)
                setIsInvalid(false)
                onChange(upper)
              }}
              className="sr-only"
            />
            <span
              className="block w-full h-full"
              style={{ backgroundColor: safeColorValue }}
            />
          </label>

          {/* حقل كود HEX النصي */}
          <input
            type="text"
            dir="ltr"
            value={localInput}
            onChange={(e) => handleTextChange(e.target.value)}
            maxLength={7}
            placeholder="#FFFFFF"
            className="w-24 h-8 px-2.5 rounded-lg border border-gray-200 bg-white font-mono text-xs font-medium text-gray-800 uppercase focus:outline-none focus:ring-2 focus:ring-[#E11D48]/20 focus:border-[#E11D48]"
          />
        </div>
      </div>

      {isInvalid && (
        <div className="flex items-center gap-1 text-[11px] text-red-600 pt-0.5">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>صيغة HEX غير صالحة (مثال: #FFFFFF)</span>
        </div>
      )}
    </div>
  )
}

/**
 * 3. مفتاح التبديل الأنيق (Animated Theme Toggle Switch)
 * يطابق مفتاح Header border الوردي/الأحمر في الصورة الأولى
 */
interface ThemeToggleSwitchProps {
  label: string
  description?: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function ThemeToggleSwitch({
  label,
  description,
  checked,
  onChange,
}: ThemeToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-gray-100 hover:border-gray-200 bg-white shadow-2xs transition-all">
      <div className="space-y-0.5">
        <span className="text-xs font-medium text-gray-700 block">{label}</span>
        {description && (
          <span className="text-[11px] text-gray-400 block">{description}</span>
        )}
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#E11D48]/30 ${
          checked ? "bg-[#E11D48]" : "bg-gray-200"
        }`}
      >
        <motion.span
          layout
          transition={{ type: "spring", stiffness: 500, damping: 35 }}
          className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md ring-0 ${
            checked ? "translate-x-5 rtl:-translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  )
}

/**
 * 4. شارة الحماية ضد هجمات XSS (XSS Protection Indicator Badge)
 */
export function XssProtectionBadge() {
  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
      <span>XSS Sanitized Live Preview</span>
    </div>
  )
}
