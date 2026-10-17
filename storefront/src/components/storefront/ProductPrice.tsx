"use client"

import { useCurrencyStore } from "@/store/useCurrencyStore"
import { useEffect, useState } from "react"

export function ProductPrice({ 
  price, 
  originalPrice, 
  className = "text-[#ff2d55] font-bold text-lg",
  originalClassName = "text-xs text-gray-400 line-through font-normal ml-2",
  showOriginal = false,
}: { 
  price: number
  originalPrice?: number
  className?: string
  originalClassName?: string
  showOriginal?: boolean
}) {
  const { formatPrice } = useCurrencyStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span className={className}>${price.toFixed(2)}</span>
  }

  return (
    <span className="inline-flex items-baseline gap-1">
      <span className={className}>{formatPrice(price)}</span>
      {showOriginal && originalPrice && originalPrice > price && (
        <span className={originalClassName}>
          {formatPrice(originalPrice)}
        </span>
      )}
    </span>
  )
}
