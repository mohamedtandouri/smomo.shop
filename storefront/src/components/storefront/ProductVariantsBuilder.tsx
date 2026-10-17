"use client"

import React, { useState, useEffect } from "react"
import { Plus, X, Image as ImageIcon, Check } from "lucide-react"

// Types
export type AttributeType = "Color" | "Size" | "Length" | "Width" | "Weight"

export type VariantAttribute = {
  type: AttributeType
  values: string[]
}

export type VariantItem = {
  id: string
  options: Record<string, string> // e.g. { Color: "Red", Size: "M" }
  price: number
  stock: number
  imageUrl: string | null
}

const AVAILABLE_ATTRIBUTES: AttributeType[] = ["Color", "Size", "Length", "Width", "Weight"]

// Custom Toggle Component specifically for Attributes
const AttributeToggle = ({ 
  label, 
  checked, 
  onChange 
}: { 
  label: string; 
  checked: boolean; 
  onChange: (c: boolean) => void 
}) => (
  <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-muted/30 transition-colors">
    <span className="text-sm font-medium">{label}</span>
    <div 
      className={`w-9 h-5 rounded-full flex items-center p-0.5 cursor-pointer transition-colors duration-200 ${checked ? 'bg-[#ff2d55]' : 'bg-muted-foreground/30'}`}
      onClick={() => onChange(!checked)}
    >
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
  </div>
)

// Dynamic Input for Attribute Values (like tags)
const AttributeValuesInput = ({ 
  attribute, 
  values, 
  onChange 
}: { 
  attribute: AttributeType; 
  values: string[]; 
  onChange: (values: string[]) => void 
}) => {
  const [inputValue, setInputValue] = useState("")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = inputValue.trim()
      if (val && !values.includes(val)) {
        onChange([...values, val])
      }
      setInputValue("")
    }
  }

  const removeValue = (valToRemove: string) => {
    onChange(values.filter(v => v !== valToRemove))
  }

  return (
    <div className="p-4 border border-border rounded-lg bg-muted/10 space-y-3 animate-in fade-in slide-in-from-top-2">
      <label className="text-sm font-medium text-foreground">{attribute} Values</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {values.map(val => (
          <div key={val} className="flex items-center gap-1.5 px-3 py-1 bg-background border border-border rounded-full text-sm">
            <span>{val}</span>
            <button type="button" onClick={() => removeValue(val)} className="text-muted-foreground hover:text-destructive transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Type ${attribute.toLowerCase()} and press Enter...`}
          className="flex-1 px-3 py-2 text-sm border border-border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/20 focus:border-[#ff2d55]"
        />
        <button 
          type="button"
          onClick={() => {
            const val = inputValue.trim()
            if (val && !values.includes(val)) {
              onChange([...values, val])
              setInputValue("")
            }
          }}
          className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-md hover:bg-secondary/80 transition-colors"
        >
          Add
        </button>
      </div>
    </div>
  )
}

// Image Swatch Thumbnail Uploader Component
const ImageSwatch = ({ 
  imageUrl, 
  onImageChange 
}: { 
  imageUrl: string | null; 
  onImageChange: (url: string | null) => void 
}) => {
  // Simulate image upload by asking for URL for this demo, or file picker
  const handleClick = () => {
    const url = window.prompt("Enter image URL for this variant (e.g., https://picsum.photos/200):", imageUrl || "")
    if (url !== null) {
      onImageChange(url || null)
    }
  }

  return (
    <div 
      onClick={handleClick}
      className={`w-10 h-10 rounded-md border flex items-center justify-center cursor-pointer overflow-hidden transition-all relative group ${imageUrl ? 'border-primary ring-1 ring-primary' : 'border-dashed border-muted-foreground/50 hover:bg-muted/50'}`}
      title="Set variant image"
    >
      {imageUrl ? (
        <>
          <img src={imageUrl} alt="Variant" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/40 items-center justify-center hidden group-hover:flex">
            <ImageIcon className="w-4 h-4 text-white" />
          </div>
        </>
      ) : (
        <ImageIcon className="w-4 h-4 text-muted-foreground" />
      )}
    </div>
  )
}

export function ProductVariantsBuilder({ 
  onChange 
}: { 
  onChange: (variantsData: string) => void 
}) {
  // Active attributes selected by the user
  const [activeAttributes, setActiveAttributes] = useState<VariantAttribute[]>([])
  
  // Generated variant combinations
  const [variants, setVariants] = useState<VariantItem[]>([])

  // Toggle an attribute on/off
  const toggleAttribute = (type: AttributeType, isEnabled: boolean) => {
    if (isEnabled) {
      setActiveAttributes([...activeAttributes, { type, values: [] }])
    } else {
      setActiveAttributes(activeAttributes.filter(a => a.type !== type))
    }
  }

  // Update values for a specific attribute
  const updateAttributeValues = (type: AttributeType, values: string[]) => {
    setActiveAttributes(activeAttributes.map(a => 
      a.type === type ? { ...a, values } : a
    ))
  }

  // Generate combinations whenever activeAttributes change
  useEffect(() => {
    // Only process attributes that have at least one value
    const validAttributes = activeAttributes.filter(a => a.values.length > 0)
    
    if (validAttributes.length === 0) {
      setVariants([])
      onChange(JSON.stringify([]))
      return
    }

    // Helper to generate cartesian product of arrays
    const generateCombinations = (attributes: VariantAttribute[]): Record<string, string>[] => {
      if (attributes.length === 0) return []
      if (attributes.length === 1) {
        return attributes[0].values.map(val => ({ [attributes[0].type]: val }))
      }
      
      const rest = generateCombinations(attributes.slice(1))
      const current = attributes[0]
      const combinations: Record<string, string>[] = []
      
      current.values.forEach(val => {
        rest.forEach(combo => {
          combinations.push({ [current.type]: val, ...combo })
        })
      })
      
      return combinations
    }

    const combinations = generateCombinations(validAttributes)
    
    // Merge new combinations with existing variant data (preserve price/stock/image if combo already existed)
    const newVariants: VariantItem[] = combinations.map(combo => {
      // Create a unique ID based on the combination (e.g. "Color:Red-Size:M")
      const comboId = Object.entries(combo).sort((a,b) => a[0].localeCompare(b[0])).map(([k,v]) => `${k}:${v}`).join("-")
      
      // Find if this variant already exists in state
      const existing = variants.find(v => v.id === comboId)
      
      return existing || {
        id: comboId,
        options: combo,
        price: 0,
        stock: 0,
        imageUrl: null
      }
    })

    setVariants(newVariants)
  }, [activeAttributes]) // Intentionally omitting variants from dependency to avoid infinite loop

  // Sync with parent form whenever variants update
  useEffect(() => {
    onChange(JSON.stringify({
      attributes: activeAttributes,
      variants: variants
    }))
  }, [variants, activeAttributes, onChange])

  const updateVariant = (id: string, field: keyof VariantItem, value: any) => {
    setVariants(variants.map(v => v.id === id ? { ...v, [field]: value } : v))
  }

  return (
    <div className="space-y-6">
      {/* 1. Attribute Toggles */}
      <div>
        <h4 className="text-sm font-semibold text-foreground mb-3">1. Select variant attributes</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {AVAILABLE_ATTRIBUTES.map(attr => (
            <AttributeToggle 
              key={attr}
              label={attr}
              checked={activeAttributes.some(a => a.type === attr)}
              onChange={(checked) => toggleAttribute(attr, checked)}
            />
          ))}
        </div>
      </div>

      {/* 2. Dynamic Input Fields for Active Attributes */}
      {activeAttributes.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-foreground mb-2">2. Configure attribute values</h4>
          {activeAttributes.map(attr => (
            <AttributeValuesInput 
              key={attr.type}
              attribute={attr.type}
              values={attr.values}
              onChange={(values) => updateAttributeValues(attr.type, values)}
            />
          ))}
        </div>
      )}

      {/* 3. Generated Variants Table */}
      {variants.length > 0 && (
        <div className="animate-in fade-in duration-500">
          <h4 className="text-sm font-semibold text-foreground mb-3">3. Generated Variants ({variants.length})</h4>
          <div className="border border-border rounded-lg overflow-x-auto bg-card">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-medium text-muted-foreground w-16 text-center">Image</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Variant Combination</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground w-32">Price (+/-)</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground w-32">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {variants.map(variant => (
                  <tr key={variant.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 flex justify-center">
                      <ImageSwatch 
                        imageUrl={variant.imageUrl} 
                        onImageChange={(url) => updateVariant(variant.id, "imageUrl", url)} 
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {Object.entries(variant.options).map(([key, val]) => (
                          <span key={key} className="px-2 py-0.5 bg-secondary text-secondary-foreground text-xs rounded font-medium">
                            {val}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <input 
                          type="number" 
                          min="0"
                          step="0.01"
                          value={variant.price || ""}
                          onChange={(e) => updateVariant(variant.id, "price", parseFloat(e.target.value) || 0)}
                          className="w-full pl-7 pr-3 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#ff2d55]" 
                          placeholder="0.00"
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input 
                        type="number" 
                        min="0"
                        value={variant.stock || ""}
                        onChange={(e) => updateVariant(variant.id, "stock", parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 border border-border rounded text-sm focus:outline-none focus:ring-1 focus:ring-[#ff2d55]" 
                        placeholder="0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
