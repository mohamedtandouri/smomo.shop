"use client"

import { useState, useEffect } from "react"
import { useCartStore } from "@/store/useCartStore"
import { createOrder } from "@/app/actions/checkout"
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ orderNumber: string } | null>(null)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return <div className="p-8 text-center">Loading...</div>

  if (success) {
    return (
      <div className="container mx-auto px-4 py-24 text-center max-w-lg">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order number is <span className="font-bold text-gray-900">{success.orderNumber}</span>.
        </p>
        <Link 
          href="/store/products" 
          className="inline-flex items-center justify-center bg-[#ff2d55] text-white px-8 py-3 rounded-md font-medium hover:bg-[#e6224c] transition-colors"
        >
          Continue Shopping
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h1>
        <Link href="/store/products" className="text-[#ff2d55] hover:underline">Go back to shopping</Link>
      </div>
    )
  }

  const subtotal = getTotalPrice()
  const shippingFee = subtotal > 50 ? 0 : 10
  const total = subtotal + shippingFee

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    const res = await createOrder(
      formData, 
      items.map(i => ({ 
        id: i.id, 
        productId: i.productId || (i.id.includes("-") ? i.id.split("-")[0] : i.id),
        quantity: i.quantity, 
        price: i.price 
      }))
    )
    
    if (res.success && res.orderNumber) {
      clearCart()
      setSuccess({ orderNumber: res.orderNumber })
    } else {
      setError(res.error || "Something went wrong")
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Checkout Form */}
        <div className="flex-1">
          <form id="checkout-form" onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md flex items-center gap-3">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            )}

            {/* Contact Info */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input required name="name" type="text" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ff2d55] focus:border-[#ff2d55] outline-none transition-all" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input required name="email" type="email" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ff2d55] focus:border-[#ff2d55] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                    <input name="phone" type="tel" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ff2d55] focus:border-[#ff2d55] outline-none transition-all" />
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <input required name="address" type="text" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ff2d55] focus:border-[#ff2d55] outline-none transition-all" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input required name="city" type="text" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ff2d55] focus:border-[#ff2d55] outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                    <input required name="postal" type="text" className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#ff2d55] focus:border-[#ff2d55] outline-none transition-all" />
                  </div>
                </div>
              </div>
            </div>

          </form>
        </div>

        {/* Order Summary sidebar */}
        <div className="w-full lg:w-96 shrink-0 space-y-6">
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
            
            {/* Items list (mini) */}
            <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded bg-gray-200 shrink-0 border border-gray-300">
                    <img src={item.image} alt={item.title} className="w-full h-full object-cover rounded" />
                    <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.title}</p>
                    <p className="text-xs text-gray-500">${item.price.toFixed(2)}</p>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-4 text-sm mb-6 border-t border-gray-200 pt-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span className="font-medium text-gray-900">{shippingFee === 0 ? 'Free' : `$${shippingFee.toFixed(2)}`}</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-8 border-t border-gray-200 pt-6">
              <span className="text-lg font-bold text-gray-900">Total</span>
              <span className="text-2xl font-black text-[#ff2d55]">${total.toFixed(2)}</span>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#ff2d55] text-white py-4 rounded-lg font-bold hover:bg-[#e6224c] transition-colors disabled:opacity-70 shadow-lg shadow-[#ff2d55]/20"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              ) : (
                'Place Order'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
