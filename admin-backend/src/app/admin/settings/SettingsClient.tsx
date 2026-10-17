"use client"

import { useState } from "react"
import { 
  Store, 
  Palette, 
  DollarSign, 
  Megaphone, 
  ShieldAlert, 
  Save, 
  Upload, 
  Check, 
  AlertCircle 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { updateStoreSettings } from "@/app/actions/settings"
import { toast } from "sonner"

interface SettingsClientProps {
  initialSettings: {
    id: string
    storeName: string
    storeDescription: string | null
    logoUrl: string | null
    primaryColor: string
    secondaryColor: string
    accentColor: string
    currency: string
    contactEmail: string | null
    contactPhone: string | null
    announcementActive: boolean
    announcementText: string | null
    announcementUrl: string | null
    isMaintenanceMode: boolean
  }
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [isPending, setIsPending] = useState(false)
  const [storeName, setStoreName] = useState(initialSettings.storeName)
  const [storeDescription, setStoreDescription] = useState(initialSettings.storeDescription || "")
  const [contactEmail, setContactEmail] = useState(initialSettings.contactEmail || "")
  const [contactPhone, setContactPhone] = useState(initialSettings.contactPhone || "")
  const [currency, setCurrency] = useState(initialSettings.currency)
  const [primaryColor, setPrimaryColor] = useState(initialSettings.primaryColor)
  const [secondaryColor, setSecondaryColor] = useState(initialSettings.secondaryColor)
  const [announcementActive, setAnnouncementActive] = useState(initialSettings.announcementActive)
  const [announcementText, setAnnouncementText] = useState(initialSettings.announcementText || "")
  const [announcementUrl, setAnnouncementUrl] = useState(initialSettings.announcementUrl || "/store/products")
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(initialSettings.isMaintenanceMode)
  
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(initialSettings.logoUrl)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)

    const formData = new FormData()
    formData.append("storeName", storeName)
    formData.append("storeDescription", storeDescription)
    formData.append("contactEmail", contactEmail)
    formData.append("contactPhone", contactPhone)
    formData.append("currency", currency)
    formData.append("primaryColor", primaryColor)
    formData.append("secondaryColor", secondaryColor)
    formData.append("announcementActive", String(announcementActive))
    formData.append("announcementText", announcementText)
    formData.append("announcementUrl", announcementUrl)
    formData.append("isMaintenanceMode", String(isMaintenanceMode))

    if (logoFile) {
      formData.append("logo", logoFile)
    } else if (logoPreview) {
      formData.append("logoUrl", logoPreview)
    }

    try {
      const result = await updateStoreSettings(formData)
      if (result.success) {
        toast.success("Store settings updated successfully! Changes are live on your storefront.")
      } else {
        toast.error(result.error || "Failed to update settings")
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Store Settings & Customization</h1>
          <p className="text-muted-foreground text-sm">
            Control your branding, visual theme, currency, and marketing announcements.
          </p>
        </div>
        <Button type="submit" disabled={isPending} className="gap-2 shrink-0">
          <Save className="h-4 w-4" />
          {isPending ? "Saving changes..." : "Save All Changes"}
        </Button>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General & Identity</TabsTrigger>
          <TabsTrigger value="theming">Colors & Theme</TabsTrigger>
          <TabsTrigger value="announcement">Announcement Bar</TabsTrigger>
          <TabsTrigger value="system">Maintenance & System</TabsTrigger>
        </TabsList>

        {/* 1. General & Identity */}
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Identity</CardTitle>
              <CardDescription>
                Basic details that appear on the storefront header, page titles, and receipts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="storeName">Store Name</Label>
                  <Input 
                    id="storeName" 
                    value={storeName} 
                    onChange={(e) => setStoreName(e.target.value)} 
                    placeholder="e.g. Smomo Shop"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="currency">Base Currency</Label>
                  <select 
                    id="currency"
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="USD">USD ($) - US Dollar</option>
                    <option value="EUR">EUR (€) - Euro</option>
                    <option value="MAD">MAD (د.م) - Moroccan Dirham</option>
                    <option value="SAR">SAR (ر.س) - Saudi Riyal</option>
                    <option value="GBP">GBP (£) - British Pound</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="storeDescription">Store Description / Tagline</Label>
                <Input 
                  id="storeDescription" 
                  value={storeDescription} 
                  onChange={(e) => setStoreDescription(e.target.value)} 
                  placeholder="e.g. Premium gadgets and daily essentials with fast shipping"
                />
              </div>

              {/* Logo Upload */}
              <div className="space-y-2 pt-2 border-t">
                <Label>Store Logo</Label>
                <div className="flex items-center gap-6">
                  <div className="h-16 w-32 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted/20 overflow-hidden">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Store logo" className="h-full w-full object-contain p-1" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-xs text-muted-foreground">
                        <Store className="h-5 w-5 mb-1" />
                        <span>No Logo</span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 text-xs font-medium border rounded-md hover:bg-muted/50 transition-colors">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Logo Image</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoChange} 
                        className="hidden" 
                      />
                    </label>
                    <p className="text-[11px] text-muted-foreground mt-1">Recommended: Transparent PNG or SVG, max 2MB.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t">
                <div className="space-y-1.5">
                  <Label htmlFor="contactEmail">Customer Support Email</Label>
                  <Input 
                    id="contactEmail" 
                    type="email"
                    value={contactEmail} 
                    onChange={(e) => setContactEmail(e.target.value)} 
                    placeholder="support@smomo.shop"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="contactPhone">Contact Phone Number</Label>
                  <Input 
                    id="contactPhone" 
                    value={contactPhone} 
                    onChange={(e) => setContactPhone(e.target.value)} 
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 2. Colors & Theme */}
        <TabsContent value="theming" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Branding & Color Theme</CardTitle>
              <CardDescription>
                Customize the visual accent colors. These values are injected dynamically into the storefront.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Primary Color */}
                <div className="space-y-3 p-4 border rounded-xl bg-card">
                  <Label className="text-sm font-semibold flex items-center justify-between">
                    <span>Primary Brand Color</span>
                    <span className="font-mono text-xs text-muted-foreground">{primaryColor}</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">Used for buttons, links, active badges, and banners.</p>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-16 p-0 border-0 rounded cursor-pointer bg-transparent"
                    />
                    <Input 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)} 
                      className="font-mono text-xs uppercase"
                    />
                  </div>
                </div>

                {/* Secondary Color */}
                <div className="space-y-3 p-4 border rounded-xl bg-card">
                  <Label className="text-sm font-semibold flex items-center justify-between">
                    <span>Dark / Secondary Color</span>
                    <span className="font-mono text-xs text-muted-foreground">{secondaryColor}</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">Used for dark sections, footers, and contrast headers.</p>
                  <div className="flex items-center gap-3">
                    <input 
                      type="color" 
                      value={secondaryColor} 
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-10 w-16 p-0 border-0 rounded cursor-pointer bg-transparent"
                    />
                    <Input 
                      value={secondaryColor} 
                      onChange={(e) => setSecondaryColor(e.target.value)} 
                      className="font-mono text-xs uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="p-4 rounded-xl border bg-muted/30 space-y-3">
                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Preview</Label>
                <div className="flex flex-wrap items-center gap-4">
                  <button 
                    type="button"
                    className="px-4 py-2 rounded-lg text-white font-medium text-sm transition-opacity"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Add to Cart
                  </button>
                  <div 
                    className="px-3 py-1 rounded-full text-xs font-semibold"
                    style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
                  >
                    15% Discount Active
                  </div>
                  <span className="text-sm font-bold" style={{ color: primaryColor }}>
                    $49.99
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 3. Announcement Bar */}
        <TabsContent value="announcement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Announcement Bar</CardTitle>
              <CardDescription>
                Display a promotional header on top of the storefront for discounts and shipping updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between p-4 border rounded-xl bg-muted/20">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Activate Announcement Bar</Label>
                  <p className="text-xs text-muted-foreground">
                    When enabled, this bar appears at the very top of all store pages.
                  </p>
                </div>
                <div 
                  onClick={() => setAnnouncementActive(!announcementActive)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${announcementActive ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${announcementActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="announcementText">Announcement Text</Label>
                <Input 
                  id="announcementText"
                  value={announcementText} 
                  onChange={(e) => setAnnouncementText(e.target.value)} 
                  placeholder="e.g. Free delivery on orders over $50! Use code WELCOME10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="announcementUrl">Target Link (Optional)</Label>
                <Input 
                  id="announcementUrl"
                  value={announcementUrl} 
                  onChange={(e) => setAnnouncementUrl(e.target.value)} 
                  placeholder="/store/products"
                />
              </div>

              {announcementActive && announcementText && (
                <div className="mt-4 p-3 text-center text-xs font-semibold text-white rounded-lg shadow-sm" style={{ backgroundColor: primaryColor }}>
                  {announcementText}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 4. Maintenance & System */}
        <TabsContent value="system" className="space-y-6">
          <Card className="border-amber-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <ShieldAlert className="h-5 w-5 text-amber-500" />
                Store Maintenance Mode
              </CardTitle>
              <CardDescription>
                Temporarily close the store to regular visitors while performing updates or inventory audits.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-xl bg-amber-500/5">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Enable Maintenance Mode</Label>
                  <p className="text-xs text-muted-foreground">
                    Visitors will see a "Under Maintenance" message. Admin dashboard remains accessible.
                  </p>
                </div>
                <div 
                  onClick={() => setIsMaintenanceMode(!isMaintenanceMode)}
                  className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${isMaintenanceMode ? 'bg-amber-500' : 'bg-muted-foreground/30'}`}
                >
                  <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${isMaintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </form>
  )
}
