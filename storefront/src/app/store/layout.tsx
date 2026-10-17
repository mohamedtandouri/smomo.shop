import { StorefrontNavbar } from "@/components/storefront/StorefrontNavbar"
import { StorefrontFooter } from "@/components/storefront/StorefrontFooter"
import { getStoreSettings } from "@/app/actions/settings"
import { getStoreMenus, getStoreLanguages } from "@/lib/store-storage"
import { Wrench } from "lucide-react"
import Link from "next/link"

// إجبار التحديث الديناميكي لضمان مزامنة فورية مع تعديلات لوحة التحكم دون تخزين مؤقت قديم
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function generateMetadata() {
  const settings = await getStoreSettings()
  return {
    title: settings.storeName || "Smomo Shop",
    description: settings.storeDescription || "Welcome to our store",
  }
}

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  // جلب الإعدادات والقوائم واللغات مباشرة من قاعدة البيانات والتخزين المشترك مع لوحة التحكم
  const settings = await getStoreSettings()
  const menus = getStoreMenus()
  const languages = getStoreLanguages()
  const defaultLang = languages.find((l) => l.isDefault)?.code || "ar"

  // حالة وضع الصيانة (Maintenance Mode)
  if (settings.isMaintenanceMode) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-slate-200 shadow-xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
            <Wrench className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {settings.storeName} - Under Maintenance
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            We are currently upgrading our store to serve you better. We will be back online shortly!
          </p>
          {settings.contactEmail && (
            <p className="text-xs text-slate-400 pt-2 border-t border-slate-100">
              For urgent inquiries, please contact: <a href={`mailto:${settings.contactEmail}`} className="text-primary hover:underline">{settings.contactEmail}</a>
            </p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div 
      className="flex flex-col min-h-screen bg-background"
      style={{
        ["--store-primary" as any]: settings.primaryColor,
        ["--store-secondary" as any]: settings.secondaryColor,
      }}
    >
      {/* Dynamic Top Announcement Bar */}
      {settings.announcementActive && settings.announcementText && (
        <div 
          className="py-2.5 px-4 text-center text-xs font-semibold text-white transition-colors flex items-center justify-center gap-2 shadow-xs"
          style={{ backgroundColor: settings.primaryColor }}
        >
          {settings.announcementUrl ? (
            <Link href={settings.announcementUrl} className="hover:underline flex items-center gap-1.5">
              <span>{settings.announcementText}</span>
              <span className="opacity-80 text-[10px]">→</span>
            </Link>
          ) : (
            <span>{settings.announcementText}</span>
          )}
        </div>
      )}

      {/* Dynamic Navigation Bar */}
      <StorefrontNavbar 
        storeName={settings.storeName}
        logoUrl={settings.logoUrl}
        primaryColor={settings.primaryColor}
        headerLinks={menus.header}
        defaultLocale={defaultLang}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* Dynamic Footer */}
      <StorefrontFooter 
        storeName={settings.storeName}
        storeDescription={settings.storeDescription}
        contactEmail={settings.contactEmail}
        contactPhone={settings.contactPhone}
        primaryColor={settings.primaryColor}
        headerLinks={menus.header}
        footerLinks={menus.footer}
      />
    </div>
  )
}
