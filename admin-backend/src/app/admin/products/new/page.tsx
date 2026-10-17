"use client"

import React, { useState } from "react"
import { 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  UploadCloud, 
  Video, 
  Info, 
  Search, 
  Check, 
  Save, 
  Plus,
  Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { createProduct } from "@/app/actions/product"
import { getCategories } from "@/app/actions/category"
import { useRouter } from "next/navigation"
import { useLocaleStore } from "@/store/useLocaleStore"

interface VariantOption {
  id: string
  name: string
  values: string[]
}

const ProductVariantsBuilder = ({ onChange }: { onChange?: (data: string) => void }) => {
  const { t } = useLocaleStore()
  const [options, setOptions] = useState<VariantOption[]>([
    { id: "1", name: "Size", values: ["S", "M", "L"] }
  ])

  const addOption = () => {
    const newOptions = [
      ...options,
      { id: Date.now().toString(), name: "", values: [""] }
    ]
    setOptions(newOptions)
    if (onChange) onChange(JSON.stringify(newOptions))
  }

  const removeOption = (id: string) => {
    const newOptions = options.filter(opt => opt.id !== id)
    setOptions(newOptions)
    if (onChange) onChange(JSON.stringify(newOptions))
  }

  const updateOptionName = (id: string, name: string) => {
    const newOptions = options.map(opt => opt.id === id ? { ...opt, name } : opt)
    setOptions(newOptions)
    if (onChange) onChange(JSON.stringify(newOptions))
  }

  const updateOptionValues = (id: string, valuesStr: string) => {
    const vals = valuesStr.split(",").map(v => v.trim()).filter(Boolean)
    const newOptions = options.map(opt => opt.id === id ? { ...opt, values: vals } : opt)
    setOptions(newOptions)
    if (onChange) onChange(JSON.stringify(newOptions))
  }

  return (
    <div className="space-y-4">
      {options.map((opt) => (
        <div key={opt.id} className="p-3 border border-border rounded-lg bg-muted/20 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <Input 
            placeholder={t("product_create.variants", "Option (e.g. Size, Color)")} 
            defaultValue={opt.name}
            onChange={(e) => updateOptionName(opt.id, e.target.value)}
            className="sm:w-1/3 bg-background"
          />
          <Input 
            placeholder={t("create_order.tags_placeholder", "Values comma-separated (e.g. S, M, L)")}
            defaultValue={opt.values.join(", ")}
            onChange={(e) => updateOptionValues(opt.id, e.target.value)}
            className="flex-1 bg-background"
          />
          <Button 
            type="button" 
            variant="ghost" 
            size="icon" 
            className="text-muted-foreground hover:text-destructive shrink-0"
            onClick={() => removeOption(opt.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={addOption}
        className="flex items-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" />
        {t("common.edit", "Add Option")}
      </Button>
    </div>
  )
}

// Custom Toggle Switch
const CustomToggle = ({ checked, onChange }: { checked: boolean; onChange: (c: boolean) => void }) => (
  <div 
    className={`w-11 h-6 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-200 ${checked ? 'bg-[#ff2d55]' : 'bg-muted'}`}
    onClick={() => onChange(!checked)}
  >
    <div className={`bg-white dark:bg-gray-200 w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </div>
)

// Custom Checkbox
const CustomCheckbox = ({ checked, onChange, label }: { checked: boolean; onChange: (c: boolean) => void; label: string }) => (
  <div 
    className={`flex items-center gap-3 p-3 rounded-md border cursor-pointer transition-colors ${checked ? 'bg-[#ff2d55]/10 border-[#ff2d55]/30' : 'bg-muted/50 border-border'}`}
    onClick={() => onChange(!checked)}
  >
    <div className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${checked ? 'bg-[#ff2d55] border-[#ff2d55]' : 'bg-background border-border'}`}>
      {checked && <Check className="w-3.5 h-3.5 text-white" />}
    </div>
    <span className="text-sm font-medium text-foreground">{label}</span>
  </div>
)

// Collapsible Section Card
const SectionCard = ({ 
  title, 
  children, 
  defaultOpen = true, 
  rightElement 
}: { 
  title: string; 
  children: React.ReactNode; 
  defaultOpen?: boolean;
  rightElement?: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden mb-4 shadow-sm text-card-foreground">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <div className="text-muted-foreground">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
          <h3 className="font-semibold">{title}</h3>
        </div>
        {rightElement && (
          <div onClick={(e) => e.stopPropagation()}>
            {rightElement}
          </div>
        )}
      </div>
      
      {isOpen && (
        <div className="p-4 pt-0 border-t border-border mt-2">
          {children}
        </div>
      )}
    </div>
  )
}

export default function CreateProductPage() {
  const { t } = useLocaleStore()

  // State for toggles
  const [variantsEnabled, setVariantsEnabled] = useState(false)
  const [relatedProductsEnabled, setRelatedProductsEnabled] = useState(false)
  const [cloakingEnabled, setCloakingEnabled] = useState(true)
  const [customSettingsEnabled, setCustomSettingsEnabled] = useState(false)
  
  // State for checkboxes
  const [onStore, setOnStore] = useState(true)
  const [trackInventory, setTrackInventory] = useState(true)

  const [imageName, setImageName] = useState<string | null>(null)

  const [description, setDescription] = useState("")
  const [variantsData, setVariantsData] = useState<string>("[]")
  
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()
  
  // Categories state
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])

  React.useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    
    const formData = new FormData(e.currentTarget)
    formData.append("description", description)
    formData.append("variantsData", variantsData)
    
    const result = await createProduct(formData)
    
    if (result.success) {
      router.push("/admin/products")
    } else {
      alert(result.error || "Something went wrong")
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[1400px] mx-auto pb-24 font-sans text-foreground pt-6 px-4 md:px-6">
      <h1 className="text-2xl font-bold mb-6 text-foreground">{t("product_create.title", "Create product")}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ================= Main Content - 75% / col-span-9 ================= */}
        <div className="lg:col-span-9 space-y-4">
          
          {/* Basic Info */}
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm text-card-foreground">
            <div className="space-y-4">
              <input 
                type="text" 
                name="name"
                required
                placeholder={t("product_create.name_placeholder", "Name ( Ex: blue summer shirt... )")}
                className="w-full px-4 py-2.5 border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all text-sm"
              />
              
              <div className="flex border border-border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-[#ff2d55]/20 focus-within:border-[#ff2d55] transition-all">
                <span className="bg-muted px-4 py-2.5 text-sm text-muted-foreground border-e border-border hidden sm:block">
                  https://smomo.shop/products/
                </span>
                <input 
                  type="text" 
                  placeholder={t("product_create.meta_slug", "Slug")}
                  className="flex-1 px-4 py-2.5 outline-none text-sm min-w-0 bg-background"
                />
              </div>
              
              <div className="relative">
                <select name="categoryId" defaultValue="" className="w-full px-4 py-2.5 border border-border rounded-md appearance-none bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all text-foreground">
                  <option value="">{t("product_create.select_category", "Select a category (Optional)")}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-muted-foreground absolute end-4 top-3.5 pointer-events-none" />
              </div>

              {/* Rich Text Editor */}
              <RichTextEditor 
                value={description}
                onChange={setDescription}
                placeholder={t("create_order.note_placeholder", "Type something")}
              />
            </div>
          </div>

          {/* Pricing */}
          <SectionCard title={t("product_create.pricing", "Pricing")}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("product_create.price", "Price")}</label>
                <input type="number" name="price" step="0.01" required className="w-full px-4 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("product_create.compare_price", "Compare at price")}</label>
                <input type="text" className="w-full px-4 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("product_create.cost_price", "Cost price")}</label>
                <input type="text" className="w-full px-4 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all" />
              </div>
            </div>
          </SectionCard>

          {/* Images */}
          <SectionCard 
            title={t("product_create.images", "Images")} 
            rightElement={
              <div className="flex items-center gap-2">
                <input 
                  type="file" 
                  name="image" 
                  id="image-upload" 
                  className="hidden" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setImageName(file.name);
                  }}
                />
                <button type="button" className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-300 text-xs font-medium rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors border border-purple-100 dark:border-purple-800/30">
                  <Sparkles className="w-3.5 h-3.5" /> {t("product_create.generate_ai", "Generate")}
                </button>
                <button 
                  type="button" 
                  onClick={() => document.getElementById('image-upload')?.click()}
                  className="flex items-center gap-1.5 px-4 py-1.5 bg-[#ff2d55] text-white text-xs font-medium rounded-md hover:bg-[#e6224c] transition-colors shadow-sm"
                >
                  <UploadCloud className="w-3.5 h-3.5" /> {t("product_create.upload_images", "Upload images")}
                </button>
                <button type="button" className="flex items-center gap-1.5 px-4 py-1.5 bg-[#ff2d55] text-white text-xs font-medium rounded-md hover:bg-[#e6224c] transition-colors shadow-sm">
                  <Video className="w-3.5 h-3.5" /> {t("product_create.add_video", "Add video link")}
                </button>
              </div>
            }
          >
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-md flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex flex-col">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">{t("product_create.image_hint", "Note: For best visual appearance, use a product image with a size of 800x800.")}</p>
                {imageName && <p className="text-xs text-green-600 mt-1 font-bold">Selected: {imageName}</p>}
              </div>
            </div>
          </SectionCard>

          {/* Variants */}
          <SectionCard 
            title={t("product_create.variants", "Variants")} 
            defaultOpen={true}
            rightElement={<CustomToggle checked={variantsEnabled} onChange={setVariantsEnabled} />}
          >
            {variantsEnabled ? (
              <div className="mt-4 border-t border-border pt-4">
                <ProductVariantsBuilder onChange={setVariantsData} />
              </div>
            ) : (
              <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-md flex items-start gap-2">
                <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">Variants not enabled</p>
              </div>
            )}
          </SectionCard>

          {/* Related products */}
          <SectionCard 
            title={t("product_create.related_products", "Related products")} 
            defaultOpen={true}
            rightElement={<CustomToggle checked={relatedProductsEnabled} onChange={setRelatedProductsEnabled} />}
          >
            <div className="mt-2">
              <label className="block text-sm font-medium text-foreground mb-2">{t("product_create.add_related", "Add related products")}</label>
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute start-3 top-2.5" />
                <input 
                  type="text" 
                  placeholder={t("product_create.search_products", "Search for products")} 
                  className="w-full ps-9 pe-4 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all" 
                />
              </div>
            </div>
          </SectionCard>

          {/* Cloaking */}
          <SectionCard 
            title={t("product_create.cloaking", "Cloaking")} 
            defaultOpen={true}
            rightElement={<CustomToggle checked={cloakingEnabled} onChange={setCloakingEnabled} />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  {t("product_create.allowed_countries", "Allowed countries")} <Info className="w-3 h-3 text-muted-foreground" />
                </label>
                <div className="relative">
                  <select defaultValue="" className="w-full px-4 py-2 border border-border bg-background rounded-md appearance-none text-sm focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all text-muted-foreground">
                    <option value="">{t("product_create.search_countries", "Search for Countries")}</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-muted-foreground absolute end-3 top-2.5 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                  {t("products.product", "Product")}
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 text-muted-foreground absolute start-3 top-2.5" />
                  <input 
                    type="text" 
                    placeholder={t("product_create.search_products", "Search for products")} 
                    className="w-full ps-9 pe-4 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all" 
                  />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* Advanced options */}
          <SectionCard 
            title={t("product_create.advanced_options", "Advanced options")} 
            defaultOpen={true}
          >
            <div className="flex items-center justify-between mt-2 p-4 border border-border rounded-md bg-muted/50">
              <span className="text-sm font-medium text-foreground">{t("product_create.custom_settings", "Custom product settings")}</span>
              <CustomToggle checked={customSettingsEnabled} onChange={setCustomSettingsEnabled} />
            </div>
          </SectionCard>

          {/* SEO */}
          <SectionCard title={t("product_create.seo", "SEO")} defaultOpen={true}>
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("product_create.meta_slug", "Meta slug")}</label>
                  <input type="text" placeholder="Slug" className="w-full px-4 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("product_create.meta_title", "Meta title")}</label>
                  <input type="text" placeholder="Title" className="w-full px-4 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("product_create.meta_desc", "Meta description")}</label>
                <textarea placeholder="Description" rows={3} className="w-full px-4 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all resize-none"></textarea>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("product_create.meta_images", "Meta images")}</label>
                <div className="border-2 border-dashed border-border rounded-lg p-8 flex flex-col items-center justify-center bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
                  <UploadCloud className="w-8 h-8 text-muted-foreground mb-2" />
                  <span className="text-sm font-medium text-muted-foreground">{t("product_create.choose_file", "Choose file to upload")}</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* ================= Sidebar - 25% / col-span-3 ================= */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Visibility */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm text-card-foreground">
            <h3 className="font-semibold mb-4 text-sm">{t("product_create.visibility", "Visibility")}</h3>
            <CustomCheckbox 
              checked={onStore} 
              onChange={setOnStore} 
              label={t("product_create.online_store", "Online store")} 
            />
          </div>

          {/* Storage details */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm text-card-foreground">
            <h3 className="font-semibold mb-4 text-sm">{t("product_create.storage_details", "Storage details")}</h3>
            <div className="space-y-3">
              <input type="text" placeholder={t("product_create.sku", "SKU")} className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all" />
              <input type="text" placeholder={t("product_create.barcode", "Barcode")} className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all" />
              <input type="text" placeholder={t("product_create.weight", "Weight")} className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all" />
            </div>
          </div>

          {/* Inventory */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm text-card-foreground">
            <h3 className="font-semibold mb-4 text-sm">{t("product_create.inventory", "Inventory")}</h3>
            <div className="space-y-3">
              <CustomCheckbox 
                checked={trackInventory} 
                onChange={setTrackInventory} 
                label={t("product_create.track_inventory", "Track inventory")} 
              />
              <input type="number" name="stock" defaultValue="1" placeholder={t("product_create.add_inventory", "Add inventory")} className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all" />
            </div>
          </div>

          {/* Category */}
          <SectionCard title={t("product_create.category", "Category")} defaultOpen={true}>
            <div className="mt-2 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-muted-foreground absolute start-3 top-2.5" />
                <input 
                  type="text" 
                  placeholder={t("product_create.search_categories", "Search categories")} 
                  className="w-full ps-9 pe-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all" 
                />
              </div>
              <button type="button" className="flex items-center gap-1 text-[#ff2d55] text-xs font-medium hover:underline">
                <Plus className="w-3 h-3" /> {t("product_create.add_new_category", "Add a new category")}
              </button>
            </div>
          </SectionCard>

          {/* Vendors */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm text-card-foreground">
            <h3 className="font-semibold mb-4 text-sm">{t("product_create.vendors", "Vendors")}</h3>
            <input 
              type="text" 
              placeholder={t("create_order.tags_placeholder", "Type in (comma separated)")} 
              className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all" 
            />
          </div>

        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 start-0 end-0 p-4 border-t border-border bg-background/80 backdrop-blur-md z-50 flex justify-end shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] px-4 md:px-8">
        <div className="w-full max-w-[1400px] mx-auto flex justify-end">
          <button type="submit" disabled={isPending} className="flex items-center gap-2 px-8 py-2.5 bg-[#ff2d55] text-white font-medium rounded-md hover:bg-[#e6224c] transition-colors shadow-md disabled:opacity-50">
            <Save className="w-4 h-4" /> {isPending ? t("product_create.saving", "Saving...") : t("product_create.save_product", "Save Product")}
          </button>
        </div>
      </div>
    </form>
  )
}
