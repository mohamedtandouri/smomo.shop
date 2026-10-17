"use client"

import React, { useState } from "react"
import { Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLocaleStore } from "@/store/useLocaleStore"

export interface VariantOption {
  id: string
  name: string
  values: string[]
}

interface ProductVariantsBuilderProps {
  onChange?: (data: string) => void
}

export function ProductVariantsBuilder({ onChange }: ProductVariantsBuilderProps) {
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
