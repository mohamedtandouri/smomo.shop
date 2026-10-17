"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function NewCouponPage() {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [discountType, setDiscountType] = useState<"PERCENTAGE" | "FIXED" | "FREE_SHIPPING">("PERCENTAGE")
  const [discountValue, setDiscountValue] = useState<string>("10")
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)

  const generateRandomCode = () => {
    const prefixes = ["SALE", "DISCOUNT", "SUMMER", "VIP", "OFF", "PROMO"]
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)]
    const randomNum = Math.floor(10 + Math.random() * 90)
    setCode(`${prefix}${randomNum}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!code.trim()) {
      toast.error("يرجى إدخال رمز الكوبون")
      return
    }

    const val = parseFloat(discountValue)
    if (discountType !== "FREE_SHIPPING" && (isNaN(val) || val <= 0)) {
      toast.error("يرجى إدخال قيمة خصم صحيحة أكبر من صفر")
      return
    }

    if (discountType === "PERCENTAGE" && val > 100) {
      toast.error("نسبة الخصم لا يمكن أن تتجاوز 100%")
      return
    }

    try {
      setLoading(true)
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountType,
          discountValue: discountType === "FREE_SHIPPING" ? 0 : val,
          isActive,
        }),
      })

      const data = await res.json()

      if (data.success) {
        toast.success("تم إنشاء كوبون الخصم بنجاح وحفظه في قاعدة البيانات")
        router.push("/admin/marketing/coupons")
      } else {
        toast.error(data.error || "فشل إنشاء الكوبون")
      }
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/marketing/coupons">
          <Button variant="ghost" size="icon" type="button">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">إنشاء كوبون جديد</h1>
          <p className="text-muted-foreground text-sm">أضف كود خصم جديد لعملائك يتم تخزينه مباشرة في قاعدة البيانات.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>رمز الكوبون (Coupon Code)</CardTitle>
              <CardDescription>
                الرمز الذي سيدخله العميل في صفحة الدفع للاستفادة من الخصم.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="coupon-code">كود الخصم</Label>
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="text-xs text-primary hover:underline font-medium flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> توليد كود عشوائي
                  </button>
                </div>
                <Input
                  id="coupon-code"
                  placeholder="مثال: SUMMER2026"
                  className="font-mono uppercase tracking-wider"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>قيمة الخصم ونوعه</CardTitle>
              <CardDescription>
                حدد نوع وقيمة التخفيض الممنوح للعميل.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>نوع الخصم</Label>
                  <Select
                    value={discountType}
                    onValueChange={(val: any) => setDiscountType(val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PERCENTAGE">نسبة مئوية (%)</SelectItem>
                      <SelectItem value="FIXED">مبلغ مالي ثابت ($)</SelectItem>
                      <SelectItem value="FREE_SHIPPING">شحن مجاني</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {discountType !== "FREE_SHIPPING" && (
                  <div className="space-y-2">
                    <Label htmlFor="discount-value">
                      {discountType === "PERCENTAGE" ? "نسبة الخصم (%)" : "قيمة الخصم ($)"}
                    </Label>
                    <Input
                      id="discount-value"
                      type="number"
                      min="1"
                      max={discountType === "PERCENTAGE" ? "100" : undefined}
                      placeholder={discountType === "PERCENTAGE" ? "20" : "15"}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      required
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>معاينة الكوبون</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-3 p-4 rounded-xl border bg-muted/30">
                <p className="font-bold text-xl text-primary font-mono">
                  {code || "YOUR_CODE"}
                </p>
                <div className="text-muted-foreground space-y-1 text-sm">
                  <p>
                    • {discountType === "PERCENTAGE"
                      ? `${discountValue || 0}% خصم على الطلب`
                      : discountType === "FREE_SHIPPING"
                      ? "إعفاء كامل من رسوم الشحن"
                      : `$${discountValue || 0} خصم مباشر`}
                  </p>
                  <p>• الحالة: {isActive ? "نشط فور الحفظ" : "معطل"}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                حفظ الكوبون في قاعدة البيانات
              </Button>
              <Link href="/admin/marketing/coupons" className="w-full">
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
