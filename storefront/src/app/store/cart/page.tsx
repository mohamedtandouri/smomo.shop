"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react"
import { useCartStore } from "@/store/useCartStore"
import { useCurrencyStore } from "@/store/useCurrencyStore"
import { useLocaleStore } from "@/store/useLocaleStore"

export default function CartPage() {
  const [isMounted, setIsMounted] = useState(false)
  const { items, removeFromCart, updateQuantity, getTotalPrice } = useCartStore()
  const { formatPrice } = useCurrencyStore()
  const { t } = useLocaleStore()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return <div className="container mx-auto px-4 py-16 text-center">{t("common.loading", "Loading cart...")}</div>
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-lg">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <ShoppingBag className="w-10 h-10 text-gray-400" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("store.cart", "Your cart is empty")}</h1>
        <p className="text-gray-500 mb-8">
          Looks like you haven't added anything to your cart yet. Browse our products and find something you love!
        </p>
        <Link 
          href="/store/products" 
          className="inline-flex items-center justify-center bg-[#ff2d55] text-white px-8 py-3 rounded-md font-medium hover:bg-[#e6224c] transition-colors"
        >
          {t("store.products", "Start Shopping")}
        </Link>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t("store.cart", "Shopping Cart")}</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="flex-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-gray-50 border-b border-gray-200 text-sm font-semibold text-gray-500 uppercase">
              <div className="col-span-6">{t("store.products", "Product")}</div>
              <div className="col-span-2 text-center">{t("store.price", "Price")}</div>
              <div className="col-span-2 text-center">{t("store.quantity", "Quantity")}</div>
              <div className="col-span-2 text-right">Total</div>
            </div>

            {/* Item Rows */}
            <ul className="divide-y divide-gray-200">
              {items.map((item) => (
                <li key={item.id} className="p-4 sm:p-6 flex flex-col md:grid md:grid-cols-12 gap-4 items-center">
                  {/* Product Info */}
                  <div className="col-span-6 flex items-center gap-4 w-full">
                    <Link href={`/store/products/${encodeURIComponent(item.productId || item.id.split("-")[0])}`} className="shrink-0">
                      <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden border border-gray-200">
                        <img 
                          src={item.image || `https://picsum.photos/seed/${item.id}/200/200`} 
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link href={`/store/products/${encodeURIComponent(item.productId || item.id.split("-")[0])}`} className="font-semibold text-gray-900 hover:text-[#ff2d55] truncate block">
                        {item.title}
                      </Link>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center gap-1 mt-2 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" /> {t("common.delete", "Remove")}
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-2 text-center hidden md:block text-gray-600 font-medium">
                    {formatPrice(item.price)}
                  </div>

                  {/* Quantity */}
                  <div className="col-span-2 flex justify-center w-full md:w-auto mt-4 md:mt-0">
                    <div className="flex items-center border border-gray-300 rounded-md">
                      <button 
                        type="button"
                        className="p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button 
                        type="button"
                        className="p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="col-span-2 text-right w-full md:w-auto mt-2 md:mt-0 flex justify-between md:block font-bold text-gray-900">
                    <span className="md:hidden text-gray-500 font-normal">Subtotal:</span>
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="flex justify-between items-center px-2">
             <Link href="/store/products" className="text-[#ff2d55] font-medium hover:underline flex items-center gap-2">
                {t("common.back", "Continue Shopping")}
             </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">{t("nav.orders", "Order Summary")}</h2>
            
            <div className="space-y-4 text-sm mb-6 border-b border-gray-200 pb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900">{formatPrice(getTotalPrice())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t("inventory.management", "Shipping")}</span>
                <span className="font-medium text-gray-900">{t("store.free_shipping", "Free Shipping")}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-bold text-gray-900">Estimated Total</span>
              <span className="text-2xl font-black text-[#ff2d55]">{formatPrice(getTotalPrice())}</span>
            </div>

            <Link 
              href="/store/checkout" 
              className="w-full flex items-center justify-center gap-2 bg-[#ff2d55] text-white py-4 rounded-lg font-bold hover:bg-[#e6224c] transition-colors shadow-lg shadow-[#ff2d55]/20"
            >
              {t("store.checkout", "Proceed to Checkout")} <ArrowRight className="w-5 h-5" />
            </Link>

            <div className="mt-6 text-xs text-gray-500 text-center flex items-center justify-center gap-2">
              <span>Secure checkout powered by Stripe</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

