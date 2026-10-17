"use client"

import { useState } from "react"
import { ShoppingCart, Plus, Minus, Check } from "lucide-react"
import { useCartStore } from "@/store/useCartStore"

interface AddToCartButtonProps {
  product: {
    id: string
    name: string
    price: number
    stock: number
  }
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState(false)
  const addToCart = useCartStore((state) => state.addToCart)

  const handleAdd = () => {
    addToCart({
      id: product.id,
      productId: product.id,
      title: product.name,
      price: product.price,
      image: `https://picsum.photos/seed/${product.id}/400/400`,
      quantity
    })
    
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (product.stock === 0) {
    return (
      <button disabled className="w-full py-3 px-4 bg-gray-200 text-gray-500 font-bold rounded-md cursor-not-allowed">
        Out of Stock
      </button>
    )
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-gray-700">Quantity</span>
        <div className="flex items-center border border-gray-300 rounded-md">
          <button 
            type="button"
            className="p-2 text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1}
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="w-10 text-center text-sm font-semibold">{quantity}</span>
          <button 
            type="button"
            className="p-2 text-gray-600 hover:bg-gray-100 transition-colors"
            onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
            disabled={quantity >= product.stock}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <span className="text-xs text-gray-500">
          {product.stock} available
        </span>
      </div>

      {/* Add Button */}
      <button 
        onClick={handleAdd}
        className={`w-full py-3 px-4 flex items-center justify-center gap-2 font-bold rounded-md transition-all ${
          added 
            ? 'bg-green-500 text-white' 
            : 'bg-[#ff2d55] text-white hover:bg-[#e6224c] shadow-md shadow-[#ff2d55]/20'
        }`}
      >
        {added ? (
          <>
            <Check className="w-5 h-5" /> Added to Cart
          </>
        ) : (
          <>
            <ShoppingCart className="w-5 h-5" /> Add to Cart - ${(product.price * quantity).toFixed(2)}
          </>
        )}
      </button>
    </div>
  )
}
