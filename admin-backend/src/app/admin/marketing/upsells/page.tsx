"use client"

import { useState, useEffect } from "react"
import { Plus, Trash2, TrendingUp, RefreshCw, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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

interface UpSellItem {
  id: string
  name: string
  targetProductId: string
  offerProductId: string
  discount: number | string
  isActive: boolean
  targetProduct?: { id: string; name: string; price: number; imageUrl?: string } | null
  offerProduct?: { id: string; name: string; price: number; imageUrl?: string } | null
}

export default function UpSellsPage() {
  const [upsells, setUpsells] = useState<UpSellItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchUpsells = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/upsells")
      const data = await res.json()
      if (data.success) {
        setUpsells(data.upsells || [])
      } else {
        toast.error(data.error || "فشل تحميل عروض البيع الإضافي")
      }
    } catch {
      toast.error("حدث خطأ أثناء جلب عروض البيع الإضافي")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUpsells()
  }, [])

  const toggleStatus = async (item: UpSellItem) => {
    try {
      const res = await fetch(`/api/upsells/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !item.isActive }),
      })
      const data = await res.json()
      if (data.success) {
        setUpsells((prev) =>
          prev.map((u) => (u.id === item.id ? { ...u, isActive: !u.isActive } : u))
        )
        toast.success(item.isActive ? "تم تعطيل العرض" : "تم تفعيل العرض")
      } else {
        toast.error(data.error || "فشل تعديل حالة العرض")
      }
    } catch {
      toast.error("حدث خطأ أثناء تعديل الحالة")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا العرض الترويجي؟")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/upsells/${id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        setUpsells((prev) => prev.filter((u) => u.id !== id))
        toast.success("تم حذف عرض البيع الإضافي بنجاح")
      } else {
        toast.error(data.error || "فشل حذف العرض")
      }
    } catch {
      toast.error("حدث خطأ أثناء حذف العرض")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">عروض البيع الإضافي (Up Sells)</h1>
          <p className="text-muted-foreground text-sm">
            ارفع متوسط قيمة الطلب (AOV) باقتراح منتجات مكملة وتخفيضات خاصة عند الشراء.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchUpsells} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            تحديث
          </Button>
          <Link href="/admin/marketing/upsells/new">
            <Button className="gap-2">
              <Plus className="h-4 w-4" /> إنشاء عرض إضافي
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>اسم العرض</TableHead>
                <TableHead>المنتج الأساسي (المحفز)</TableHead>
                <TableHead>المنتج الإضافي المعروض</TableHead>
                <TableHead>نسبة الخصم</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    جاري تحميل عروض البيع الإضافي من قاعدة البيانات...
                  </TableCell>
                </TableRow>
              ) : upsells.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    <TrendingUp className="mx-auto h-8 w-8 mb-2 opacity-40" />
                    لا توجد عروض بيع إضافي منشأة بعد. ابدأ بإنشاء أول عرض لرفع أرباح متجرك!
                  </TableCell>
                </TableRow>
              ) : (
                upsells.map((u) => (
                  <TableRow key={u.id} className="hover:bg-muted/30">
                    <TableCell className="font-semibold text-foreground">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.targetProduct ? (
                        <span className="font-medium text-foreground">{u.targetProduct.name}</span>
                      ) : (
                        <span className="italic text-xs">منتج غير متوفر (ID: {u.targetProductId})</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.offerProduct ? (
                        <span className="font-medium text-foreground">{u.offerProduct.name}</span>
                      ) : (
                        <span className="italic text-xs">منتج غير متوفر (ID: {u.offerProductId})</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-emerald-600">
                      %{Number(u.discount)} خصم
                    </TableCell>
                    <TableCell>
                      <button
                        onClick={() => toggleStatus(u)}
                        className="cursor-pointer transition-opacity hover:opacity-80"
                        title="انقر لتعديل الحالة"
                      >
                        {u.isActive ? (
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
                        disabled={deletingId === u.id}
                        onClick={() => handleDelete(u.id)}
                        title="حذف العرض"
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
