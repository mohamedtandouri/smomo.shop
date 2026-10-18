"use client"

/**
 * ============================================================================
 * الوحدة المتكاملة لإعدادات الهيدر والفوتر والنشرة البريدية
 * (Header / Footer / Newsletter Settings Module - Organism)
 * ============================================================================
 * تجمع بين:
 * 1. تنبيه المعلومات الأزرق (Blue Info Alert Banner)
 * 2. نظام التبويبات الخمسة (Mobile header, Desktop header, Footer, Desktop notice bar, Mobile notice bar)
 * 3. واجهة السحب والإفلات للهيدر (HeaderDragDropBuilder)
 * 4. نظام إدارة محتوى الفوتر والنشرة البريدية (FooterNewsletterCMS)
 * 5. إعدادات شريط الإشعارات العلوي (Notice Bar Config)
 */

import React, { useState } from "react"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import {
  HeaderFooterSettingsConfig,
  NoticeBarConfig,
  sanitizeText,
  sanitizeUrl,
} from "@/lib/theme-config"
import { InfoAlertBanner, ColorPickerField, ThemeToggleSwitch } from "./ThemeAtoms"
import { HeaderDragDropBuilder } from "./HeaderDragDropBuilder"
import { FooterNewsletterCMS } from "./FooterNewsletterCMS"

export type HeaderFooterSubTab =
  | "mobile_header"
  | "desktop_header"
  | "footer"
  | "desktop_notice"
  | "mobile_notice"

interface HeaderFooterSettingsModuleProps {
  settings: HeaderFooterSettingsConfig
  onChange: (updated: HeaderFooterSettingsConfig) => void
}

export function HeaderFooterSettingsModule({
  settings,
  onChange,
}: HeaderFooterSettingsModuleProps) {
  const [subTab, setSubTab] = useState<HeaderFooterSubTab>("mobile_header")

  const tabs: { id: HeaderFooterSubTab; label: string }[] = [
    { id: "mobile_header", label: "Mobile header" },
    { id: "desktop_header", label: "Desktop header" },
    { id: "footer", label: "Footer" },
    { id: "desktop_notice", label: "Desktop notice bar" },
    { id: "mobile_notice", label: "Mobile notice bar" },
  ]

  const renderNoticeBarEditor = (
    mode: "desktop" | "mobile",
    noticeConfig: NoticeBarConfig,
    onUpdateNotice: (next: NoticeBarConfig) => void
  ) => (
    <motion.div
      key={mode}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
    >
      <ThemeToggleSwitch
        label={`Enable ${mode === "desktop" ? "Desktop" : "Mobile"} Notice Bar`}
        description="Display a promotional announcement strip at the very top of the store"
        checked={noticeConfig.enabled}
        onChange={(checked) => onUpdateNotice({ ...noticeConfig, enabled: checked })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Announcement Text</label>
          <Input
            value={noticeConfig.text}
            onChange={(e) =>
              onUpdateNotice({
                ...noticeConfig,
                text: sanitizeText(e.target.value, 160),
              })
            }
            placeholder="Free express shipping on all orders over $50!"
            className="bg-white text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-700">Action Link URL (Optional)</label>
          <Input
            dir="ltr"
            value={noticeConfig.linkUrl}
            onChange={(e) =>
              onUpdateNotice({
                ...noticeConfig,
                linkUrl: sanitizeUrl(e.target.value),
              })
            }
            placeholder="/store/products"
            className="bg-white text-xs font-mono"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ColorPickerField
          label="Notice bar background"
          value={noticeConfig.background}
          onChange={(hex) => onUpdateNotice({ ...noticeConfig, background: hex })}
        />
        <ColorPickerField
          label="Notice bar text color"
          value={noticeConfig.textColor}
          onChange={(hex) => onUpdateNotice({ ...noticeConfig, textColor: hex })}
        />
      </div>

      {/* معاينة حية لشريط الإشعارات */}
      <div className="space-y-1.5 pt-2">
        <span className="text-xs font-medium text-gray-500 block">Live Notice Bar Preview</span>
        <div
          style={{
            backgroundColor: noticeConfig.background || "#BE123C",
            color: noticeConfig.textColor || "#FFFFFF",
          }}
          className="rounded-xl py-2.5 px-4 text-center text-xs font-semibold shadow-xs transition-colors"
        >
          {sanitizeText(noticeConfig.text || "Free express shipping on all orders over $50!", 160)}
          {noticeConfig.linkUrl && <span className="ml-1.5 opacity-80">→</span>}
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-5">
      {/* صندوق التنبيه الأزرق الثاني المطابق للصورة الأولى */}
      <InfoAlertBanner message={settings.removeFooterBarNotice} />

      {/* البطاقة الرئيسية لإعدادات الهيدر والفوتر */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs space-y-6">
        {/* شريط التبويبات العلوية مع مؤشر متحرك (Framer Motion Underline) */}
        <div className="flex items-center gap-6 border-b border-gray-200 pb-0 text-sm overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isSelected = subTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id)}
                className={`pb-3 font-medium whitespace-nowrap relative transition-colors cursor-pointer ${
                  isSelected
                    ? "text-[#BE123C] font-semibold"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {tab.label}
                {isSelected && (
                  <motion.span
                    layoutId="headerFooterActiveTabLine"
                    className="absolute left-0 right-0 bottom-0 h-[2.5px] bg-[#E11D48] rounded-t-full"
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* محتوى التبويب المختار */}
        {(subTab === "mobile_header" || subTab === "desktop_header") && (
          <HeaderDragDropBuilder
            mode={subTab === "mobile_header" ? "mobile" : "desktop"}
            mobileConfig={settings.mobileHeader}
            desktopConfig={settings.desktopHeader}
            brandName={settings.footer.brandName}
            brandLogoUrl={settings.footer.brandLogoUrl}
            onUpdateMobile={(mobileHeader) =>
              onChange({ ...settings, mobileHeader })
            }
            onUpdateDesktop={(desktopHeader) =>
              onChange({ ...settings, desktopHeader })
            }
          />
        )}

        {subTab === "footer" && (
          <FooterNewsletterCMS
            newsletter={settings.newsletter}
            footer={settings.footer}
            desktopHeader={settings.desktopHeader}
            onUpdateNewsletter={(newsletter) =>
              onChange({ ...settings, newsletter })
            }
            onUpdateFooter={(footer) => onChange({ ...settings, footer })}
          />
        )}

        {subTab === "desktop_notice" &&
          renderNoticeBarEditor(
            "desktop",
            settings.desktopNoticeBar,
            (desktopNoticeBar) => onChange({ ...settings, desktopNoticeBar })
          )}

        {subTab === "mobile_notice" &&
          renderNoticeBarEditor(
            "mobile",
            settings.mobileNoticeBar,
            (mobileNoticeBar) => onChange({ ...settings, mobileNoticeBar })
          )}
      </div>
    </div>
  )
}
