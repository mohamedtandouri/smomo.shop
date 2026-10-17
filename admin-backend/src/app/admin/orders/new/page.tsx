"use client"

import { Search, Save, Plus, Trash2, Package } from "lucide-react"
import { createOrder } from "@/app/actions/orderActions"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLocaleStore } from "@/store/useLocaleStore"

interface ProductItem {
  id: string
  name: string
  price: number
  stock: number
  imageUrl?: string
  sku?: string
}

interface SelectedItem {
  product: ProductItem
  quantity: number
}

export default function CreateOrderPage() {
  const router = useRouter()
  const { t } = useLocaleStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [discount, setDiscount] = useState(0)
  const [shippingFee, setShippingFee] = useState(0)
  const [customerName, setCustomerName] = useState("")
  const [customerEmail, setCustomerEmail] = useState("")
  const [note, setNote] = useState("")
  const [tags, setTags] = useState("")

  // Dynamic Product Selection
  const [availableProducts, setAvailableProducts] = useState<ProductItem[]>([])
  const [searchProductQuery, setSearchProductQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([])

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.products)) {
          setAvailableProducts(data.products)
        }
      })
      .catch((err) => console.error("Failed to load products for order creation:", err))
  }, [])

  function addProductToOrder(product: ProductItem) {
    setSelectedItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + 1) }
            : item
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
    setSearchProductQuery("")
  }

  function removeProductFromOrder(productId: string) {
    setSelectedItems((prev) => prev.filter((item) => item.product.id !== productId))
  }

  function updateItemQuantity(productId: string, quantity: number) {
    setSelectedItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const validQty = Math.max(1, Math.min(item.product.stock, quantity))
          return { ...item, quantity: validQty }
        }
        return item
      })
    )
  }

  const subtotal = selectedItems.reduce(
    (acc, item) => acc + Number(item.product.price) * item.quantity,
    0
  )
  const total = Math.max(0, subtotal - discount + Number(shippingFee))

  const filteredProducts = searchProductQuery.trim()
    ? availableProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
          (p.sku && p.sku.toLowerCase().includes(searchProductQuery.toLowerCase()))
      )
    : []

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!customerName.trim()) {
      alert("يرجى إدخال اسم العميل")
      return
    }

    setIsSubmitting(true)

    const formData = new FormData()
    formData.append("customerName", customerName.trim())
    if (customerEmail.trim()) formData.append("customerEmail", customerEmail.trim())
    formData.append("discount", discount.toString())
    formData.append("shippingFee", shippingFee.toString())
    if (note.trim()) formData.append("note", note.trim())
    if (tags.trim()) formData.append("tags", tags.trim())

    if (selectedItems.length > 0) {
      const itemsPayload = selectedItems.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }))
      formData.append("items", JSON.stringify(itemsPayload))
    }

    const result = await createOrder(formData)
    setIsSubmitting(false)

    if (result.success) {
      router.push("/admin/orders")
    } else {
      alert("خطأ: " + result.error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full min-h-[calc(100vh-theme(spacing.24))] relative">
      <div className="space-y-6 flex-1 pb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t("create_order.title", "Create order")}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            إضافة طلب جديد وربطه بالمنتجات والمخزون الحقيقي مباشرة
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column (Forms & Table) */}
          <div className="flex-1 space-y-6">
            <div className="bg-card border rounded-xl shadow-sm p-4 sm:p-6 space-y-6">
              {/* Product Search & Dropdown Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  {t("create_order.search_products", "Search for products")}
                </label>
                <div className="relative">
                  <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={searchProductQuery}
                    onChange={(e) => setSearchProductQuery(e.target.value)}
                    placeholder={t("create_order.search_products", "ابحث باسم المنتج أو الـ SKU...")}
                    className="w-full ps-9 pe-4 py-2.5 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />

                  {filteredProducts.length > 0 && (
                    <div className="absolute start-0 end-0 top-full mt-1.5 bg-card border rounded-lg shadow-xl max-h-60 overflow-y-auto z-30 divide-y">
                      {filteredProducts.map((product) => (
                        <div
                          key={product.id}
                          onClick={() => addProductToOrder(product)}
                          className="p-3 flex items-center justify-between hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded bg-muted flex items-center justify-center overflow-hidden shrink-0">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-4 h-4 text-muted-foreground" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{product.name}</p>
                              <p className="text-xs text-muted-foreground">
                                SKU: {product.sku || "N/A"} | المخزون: {product.stock}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-primary">{Number(product.price).toFixed(2)} USD</span>
                            <button
                              type="button"
                              className="p-1 rounded bg-primary/10 text-primary hover:bg-primary/20"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Items Table */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">المنتجات المحددة في الطلب</h3>
                {selectedItems.length === 0 ? (
                  <div className="border border-dashed rounded-lg p-6 text-center text-muted-foreground text-sm">
                    لم يتم اختيار منتجات بعد. استخدم حقل البحث أعلاه لإضافة المنتجات.
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-x-auto">
                    <table className="w-full text-sm text-start">
                      <thead className="bg-muted/50 border-b">
                        <tr>
                          <th className="px-4 py-3 font-medium text-muted-foreground text-start">المنتج</th>
                          <th className="px-4 py-3 font-medium text-muted-foreground text-start">السعر الرسمي</th>
                          <th className="px-4 py-3 font-medium text-muted-foreground text-start">الكمية</th>
                          <th className="px-4 py-3 font-medium text-muted-foreground text-start">المجموع</th>
                          <th className="px-4 py-3 font-medium text-muted-foreground text-center">إجراء</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {selectedItems.map((item) => (
                          <tr key={item.product.id}>
                            <td className="px-4 py-3">
                              <p className="font-medium text-foreground">{item.product.name}</p>
                              <p className="text-xs text-muted-foreground">SKU: {item.product.sku || "N/A"}</p>
                            </td>
                            <td className="px-4 py-3 text-foreground font-mono">
                              {Number(item.product.price).toFixed(2)} USD
                            </td>
                            <td className="px-4 py-3">
                              <input
                                type="number"
                                min={1}
                                max={item.product.stock}
                                value={item.quantity}
                                onChange={(e) =>
                                  updateItemQuantity(item.product.id, parseInt(e.target.value) || 1)
                                }
                                className="w-20 px-2 py-1 bg-background border rounded text-sm text-center"
                              />
                            </td>
                            <td className="px-4 py-3 text-foreground font-semibold font-mono">
                              {(Number(item.product.price) * item.quantity).toFixed(2)} USD
                            </td>
                            <td className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => removeProductFromOrder(item.product.id)}
                                className="text-destructive hover:opacity-80 p-1"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Discount & Shipping Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">{t("create_order.discount", "Discount")}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-transparent border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">{t("create_order.shipping_fee", "Shipping fee")}</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={shippingFee}
                    onChange={(e) => setShippingFee(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-transparent border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Financial Calculation Breakdown Table */}
              <div className="border rounded-md overflow-x-auto bg-muted/20">
                <table className="w-full text-sm text-start">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-start">المجموع الفرعي</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-start">الخصم</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-start">مصاريف الشحن</th>
                      <th className="px-4 py-3 font-medium text-muted-foreground text-start">الإجمالي الصافي</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-4 text-foreground font-mono">{subtotal.toFixed(2)} USD</td>
                      <td className="px-4 py-4 text-destructive font-mono">-{discount.toFixed(2)} USD</td>
                      <td className="px-4 py-4 text-foreground font-mono">+{Number(shippingFee).toFixed(2)} USD</td>
                      <td className="px-4 py-4 text-primary font-bold font-mono text-base">{total.toFixed(2)} USD</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">{t("create_order.note", "Note")}</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  placeholder={t("create_order.note_placeholder", "أضف ملاحظات التوصيل أو معلومات الطلب هنا...")}
                  className="w-full px-3 py-2 bg-transparent border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-y"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Right Column (Customer & Tags) */}
          <div className="w-full lg:w-[320px] space-y-6 shrink-0">
            {/* Customer Details Card */}
            <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-foreground">بيانات العميل</h3>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">اسم العميل *</label>
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="مثال: محمد العمري"
                    className="w-full px-3 py-2 bg-transparent border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full px-3 py-2 bg-transparent border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Tags Card */}
            <div className="bg-card border rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-foreground">{t("create_order.tags", "Tags")}</h3>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="VIP, Manual, Priority"
                className="w-full px-3 py-2 bg-transparent border rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 -mx-4 sm:-mx-6 lg:-mx-8 -mb-4 sm:-mb-6 lg:-mb-8 mt-auto bg-card border-t p-4 flex justify-end z-20">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm text-sm disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isSubmitting ? t("common.loading", "جاري الحفظ...") : t("create_order.save", "حفظ الطلب")}
        </button>
      </div>
    </form>
  )
}
