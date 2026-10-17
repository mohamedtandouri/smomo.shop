"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

interface ProductOption {
  id: string
  name: string
  price: number
  stock: number
}

export default function NewUpSellPage() {
  const router = useRouter()
  const [products, setProducts] = useState<ProductOption[]>([])
  const [loadingProducts, setLoadingProducts] = useState(true)

  const [name, setName] = useState("")
  const [targetProductId, setTargetProductId] = useState("")
  const [offerProductId, setOfferProductId] = useState("")
  const [discount, setDiscount] = useState("20")
  const [isActive, setIsActive] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoadingProducts(true)
        const res = await fetch("/api/products")
        const data = await res.json()
        if (data.success && data.products) {
          setProducts(data.products)
          if (data.products.length >= 2) {
            setTargetProductId(data.products[0].id)
            setOfferProductId(data.products[1].id)
          } else if (data.products.length === 1) {
            setTargetProductId(data.products[0].id)
          }
        }
      } catch {
        toast.error("فشل تحميل قائمة المنتجات")
      } finally {
        setLoadingProducts(false)
      }
    }
    loadProducts()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      toast.error("يرجى إدخال اسم العرض الترويجي")
      return
    }

    if (!targetProductId || !offerProductId) {
      toast.error("يرجى اختيار كلا المنتجين: المنتج الأساسي ومنتج العرض")
      return
    }

    if (targetProductId === offerProductId) {
      toast.error("لا يمكن أن يكون منتج العرض هو نفسه المنتج الأساسي")
      return
    }

    const discountNum = parseFloat(discount)
    if (isNaN(discountNum) || discountNum < 0 || discountNum > 100) {
      toast.error("نسبة الخصم يجب أن تكون بين 0 و 100%")
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch("/api/upsells", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          targetProductId,
          offerProductId,
          discount: discountNum,
          isActive,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success("تم إنشاء عرض البيع الإضافي بنجاح")
        router.push("/admin/marketing/upsells")
      } else {
        toast.error(data.error || "فشل إنشاء العرض")
      }
    } catch {
      toast.error("حدث خطأ أثناء حفظ العرض")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/marketing/upsells">
          <Button variant="ghost" size="icon" type="button">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إنشاء عرض بيع إضافي (Up Sell)</h1>
          <p className="text-muted-foreground text-sm">
            اقترح منتجاً مكملاً بخصم جذاب عندما يضع العميل منتجاً محدداً في سلته.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>بيانات العرض الأساسية</CardTitle>
              <CardDescription>حدد اسماً واضحاً للعرض لتمييزه في لوحة التحكم.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="offer-name">اسم العرض</Label>
                <Input
                  id="offer-name"
                  placeholder="مثال: خصم 20% على الغطاء الواقي عند شراء سماعات"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>الاستهداف والمنتجات</CardTitle>
              <CardDescription>اختر المنتج الذي يحفز العرض والمنتج الممنوح بالخصم.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingProducts ? (
                <div className="flex items-center justify-center py-6 text-muted-foreground text-sm">
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> جاري تحميل المنتجات...
                </div>
              ) : products.length < 2 ? (
                <div className="p-4 rounded-lg bg-amber-500/10 text-amber-600 text-sm">
                  يجب أن يتوفر منتجان على الأقل في متجرك لإنشاء عرض بيع إضافي.
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>المنتج المحفز (عندما يشتريه العميل)</Label>
                    <Select value={targetProductId} onValueChange={(val) => setTargetProductId(val || "")}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنتج الأساسي..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} (${Number(p.price).toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>منتج العرض (الذي يُقترح بسعر مخفض)</Label>
                    <Select value={offerProductId} onValueChange={(val) => setOfferProductId(val || "")}>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر منتج العرض الإضافي..." />
                      </SelectTrigger>
                      <SelectContent>
                        {products
                          .filter((p) => p.id !== targetProductId)
                          .map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name} (${Number(p.price).toFixed(2)})
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>نسبة الخصم والإعدادات</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="discount-val">نسبة الخصم على منتج العرض (%)</Label>
                <Input
                  id="discount-val"
                  type="number"
                  min="0"
                  max="100"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>حالة العرض</Label>
                <Select
                  value={isActive ? "active" : "inactive"}
                  onValueChange={(val) => setIsActive(val === "active")}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط ومفعل</SelectItem>
                    <SelectItem value="inactive">معطل مؤقتاً</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button
                type="submit"
                className="w-full"
                disabled={submitting || products.length < 2}
              >
                {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                حفظ العرض في قاعدة البيانات
              </Button>
              <Link href="/admin/marketing/upsells" className="w-full">
                <Button variant="outline" type="button" className="w-full">
                  إلغاء
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </form>
  )
}
