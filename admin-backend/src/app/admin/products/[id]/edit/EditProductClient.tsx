"use client"

import React, { useState } from "react"
import { 
  ChevronUp, 
  ChevronDown, 
  Sparkles, 
  UploadCloud, 
  Info, 
  Check, 
  Save 
} from "lucide-react"
import { RichTextEditor } from "@/components/ui/rich-text-editor"
import { updateProduct } from "@/app/actions/product"
import { getCategories } from "@/app/actions/category"
import { useRouter } from "next/navigation"
import { useLocaleStore } from "@/store/useLocaleStore"

type Product = {
  id: string
  name: string
  description?: string | null
  price: number
  stock: number
  categoryId?: string | null
}

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

export default function EditProductClient({ initialProduct }: { initialProduct: Product }) {
  const { t } = useLocaleStore()
  const [trackInventory, setTrackInventory] = useState(true)
  const [imageName, setImageName] = useState<string | null>(null)
  const [description, setDescription] = useState(initialProduct.description || "")
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  const [categories, setCategories] = useState<{id: string, name: string}[]>([])

  React.useEffect(() => {
    getCategories().then(setCategories)
  }, [])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsPending(true)
    
    const formData = new FormData(e.currentTarget)
    formData.append("description", description)
    
    const result = await updateProduct(initialProduct.id, formData)
    
    if (result.success) {
      router.push("/admin/products")
      router.refresh()
    } else {
      alert(result.error || "Something went wrong")
      setIsPending(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-[1400px] mx-auto pb-24 font-sans text-foreground pt-6 px-4 md:px-6">
      <h1 className="text-2xl font-bold mb-6 text-foreground">{t("product_edit.title", "Edit product")}</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-9 space-y-4">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm text-card-foreground">
            <div className="space-y-4">
              <input 
                type="text" 
                name="name"
                required
                defaultValue={initialProduct.name}
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
                <select name="categoryId" defaultValue={initialProduct.categoryId || ""} className="w-full px-4 py-2.5 border border-border rounded-md appearance-none bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all text-foreground">
                  <option value="">{t("product_create.select_category", "Select a category (Optional)")}</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-muted-foreground absolute end-4 top-3.5 pointer-events-none" />
              </div>

              <RichTextEditor 
                value={description}
                onChange={setDescription}
                placeholder={t("create_order.note_placeholder", "Type something")}
              />
            </div>
          </div>

          <SectionCard title={t("product_create.pricing", "Pricing")}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">{t("product_create.price", "Price")}</label>
                <input type="number" name="price" step="0.01" defaultValue={initialProduct.price} required className="w-full px-4 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all" />
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
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="bg-card border border-border rounded-lg p-5 shadow-sm text-card-foreground">
            <h3 className="font-semibold mb-4 text-sm">{t("product_create.inventory", "Inventory")}</h3>
            <div className="space-y-3">
              <CustomCheckbox 
                checked={trackInventory} 
                onChange={setTrackInventory} 
                label={t("product_create.track_inventory", "Track inventory")} 
              />
              <input type="number" name="stock" defaultValue={initialProduct.stock} placeholder={t("product_create.add_inventory", "Add inventory")} className="w-full px-3 py-2 border border-border bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55] transition-all" />
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 start-0 end-0 p-4 border-t border-border bg-background/80 backdrop-blur-md z-50 flex justify-end shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] px-4 md:px-8">
        <div className="w-full max-w-[1400px] mx-auto flex justify-end">
          <button type="submit" disabled={isPending} className="flex items-center gap-2 px-8 py-2.5 bg-[#ff2d55] text-white font-medium rounded-md hover:bg-[#e6224c] transition-colors shadow-md disabled:opacity-50">
            <Save className="w-4 h-4" /> {isPending ? t("product_create.saving", "Saving...") : t("common.save", "Save Changes")}
          </button>
        </div>
      </div>
    </form>
  )
}
