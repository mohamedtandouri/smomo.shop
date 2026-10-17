"use client"

import { useState, useEffect, useMemo, useTransition } from "react"
import { Plus, Trash2, Search, Tag, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Coupon {
  id: string
  code: string
  discountType: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING" | string
  discountValue: number | string
  isActive: boolean
  createdAt: string
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const fetchCoupons = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/coupons")
      const data = await res.json()
      if (data.success) {
        setCoupons(data.coupons || [])
      } else {
        toast.error(data.error || "فشل تحميل الكوبونات")
      }
    } catch {
      toast.error("حدث خطأ أثناء جلب الكوبونات")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCoupons()
  }, [])

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) =>
      c.code.toLowerCase().includes(search.toLowerCase())
    )
  }, [coupons, search])

  const toggleCouponStatus = async (coupon: Coupon) => {
    try {
      const res = await fetch(`/api/coupons/${coupon.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !coupon.isActive }),
      })
      const data = await res.json()
      if (data.success) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === coupon.id ? { ...c, isActive: !c.isActive } : c))
        )
        toast.success(coupon.isActive ? "تم تعطيل الكوبون" : "تم تفعيل الكوبون")
      } else {
        toast.error(data.error || "فشل تحديث حالة الكوبون")
      }
    } catch {
      toast.error("حدث خطأ أثناء تعديل الحالة")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من رغبتك في حذف هذا الكوبون؟")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== id))
        toast.success("تم حذف الكوبون بنجاح")
      } else {
        toast.error(data.error || "فشل حذف الكوبون")
      }
    } catch {
      toast.error("حدث خطأ أثناء حذف الكوبون")
    } finally {
      setDeletingId(null)
    }
  }

  const formatDiscount = (type: string, val: number | string) => {
    const num = Number(val)
    if (type === "PERCENTAGE") return `${num}% خصم`
    if (type === "FREE_SHIPPING") return "شحن مجاني"
    return `$${num.toFixed(2)} خصم ثابت`
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">كوبونات الخصم</h1>
          <p className="text-muted-foreground text-sm">
            إدارة وإنشاء أكواد الخصم والعروض الترويجية لمتجرك.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCoupons} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
          <Link href="/admin/marketing/coupons/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> إنشاء كوبون جديد
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4 bg-muted/20 border-b">
          <div className="flex items-center justify-between gap-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="البحث بكود الكوبون..."
                className="pl-9 bg-background"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              الإجمالي: <span className="font-semibold text-foreground">{filteredCoupons.length}</span> كوبون
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>كود الكوبون</TableHead>
                <TableHead>نوع الخصم وقيمته</TableHead>
                <TableHead>تاريخ الإنشاء</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    جاري تحميل الكوبونات من قاعدة البيانات...
                  </TableCell>
                </TableRow>
              ) : filteredCoupons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                    <Tag className="mx-auto h-8 w-8 mb-2 opacity-40" />
                    لا توجد كوبونات تطابق البحث أو لم يتم إنشاء أي كوبون بعد.
                  </TableCell>
                </TableRow>
              ) : (
                filteredCoupons.map((coupon) => (
                  <TableRow key={coupon.id} className="hover:bg-muted/30">
                    <TableCell className="font-bold tracking-wider font-mono text-primary">
                      {coupon.code}
                    </TableCell>
                    <TableCell className="text-foreground font-medium">
                      {formatDiscount(coupon.discountType, coupon.discountValue)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(coupon.createdAt).toLocaleDateString("ar-MA", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleCouponStatus(coupon)}
                        className="cursor-pointer transition-opacity hover:opacity-80"
                        title="انقر لتغيير الحالة"
                      >
                        {coupon.isActive ? (
                          <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 gap-1">
                            <CheckCircle className="h-3 w-3" /> نشط
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 gap-1">
                            <XCircle className="h-3 w-3" /> معطل
                          </Badge>
                        )}
                      </button>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        disabled={deletingId === coupon.id}
                        onClick={() => handleDelete(coupon.id)}
                        title="حذف الكوبون"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
