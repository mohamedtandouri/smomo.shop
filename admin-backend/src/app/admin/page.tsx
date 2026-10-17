"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, DollarSign, Package, ShoppingBag, Users, Loader2, Clock, CheckCircle2 } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { InteractiveAnalytics } from "@/components/admin/InteractiveAnalytics"
import { useLocaleStore } from "@/store/useLocaleStore"
import Link from "next/link"

const trafficData = [
  { name: "Organic Search", value: 4500, color: "#3b82f6" },
  { name: "Direct", value: 3200, color: "#8b5cf6" },
  { name: "Social Media", value: 1800, color: "#ec4899" },
  { name: "Referral", value: 1200, color: "#14b8a6" },
]

export default function DashboardPage() {
  const { t } = useLocaleStore()
  const [isMounted, setIsMounted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [statsData, setStatsData] = useState<{
    revenue: { total: number; formatted: string }
    orders: { total: number; newLast30Days: number }
    customers: { total: number; newLast30Days: number }
    products: { total: number; lowStock: number }
    salesChartData: { month: string; sales: number }[]
    recentOrders: any[]
    recentCustomers: any[]
  } | null>(null)

  useEffect(() => {
    setIsMounted(true)
    async function loadStats() {
      try {
        const res = await fetch("/api/stats")
        const data = await res.json()
        if (data.success && data.stats) {
          setStatsData(data.stats)
        }
      } catch (e) {
        console.error("Failed to load dashboard stats:", e)
      } finally {
        setLoading(false)
      }
    }
    loadStats()
  }, [])

  const salesData = statsData?.salesChartData?.length
    ? statsData.salesChartData
    : [
        { month: "Jan", sales: 0 },
        { month: "Feb", sales: 0 },
        { month: "Mar", sales: 0 },
        { month: "Apr", sales: 0 },
        { month: "May", sales: 0 },
        { month: "Jun", sales: 0 },
      ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("dashboard.welcome", "مرحباً بك مجدداً في لوحة التحكم")}
        </h1>
        <p className="text-muted-foreground">
          {t("dashboard.subtitle", "إليك نظرة مباشرة على أداء مبيعات متجرك ومخزونك وقاعدة عملائك.")}
        </p>
      </div>

      {/* KPI Cards Connected to Database */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="border border-border/70 bg-card hover:border-border transition-all duration-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.total_sales", "إجمالي المبيعات")}
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loading ? (
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              ) : (
                statsData?.revenue?.formatted || "$0.00"
              )}
            </div>
            <p className="text-xs text-emerald-500 flex items-center mt-1.5 font-medium">
              <ArrowUp className="h-3.5 w-3.5 me-1" /> بيانات حية من الطلبات
            </p>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="border border-border/70 bg-card hover:border-border transition-all duration-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.total_orders", "إجمالي الطلبات")}
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                statsData?.orders?.total || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1.5 font-medium">
              <span className="text-blue-500 font-semibold me-1">
                +{statsData?.orders?.newLast30Days || 0}
              </span>{" "}
              في آخر 30 يوماً
            </p>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="border border-border/70 bg-card hover:border-border transition-all duration-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.total_customers", "إجمالي العملاء")}
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-500">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                statsData?.customers?.total || 0
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1.5 font-medium">
              <span className="text-violet-500 font-semibold me-1">
                +{statsData?.customers?.newLast30Days || 0}
              </span>{" "}
              عميل مسجل جديد
            </p>
          </CardContent>
        </Card>

        {/* Total Products */}
        <Card className="border border-border/70 bg-card hover:border-border transition-all duration-200 shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("dashboard.total_products", "إجمالي المنتجات")}
            </CardTitle>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold tracking-tight text-foreground">
              {loading ? (
                <div className="h-8 w-16 bg-muted animate-pulse rounded" />
              ) : (
                statsData?.products?.total || 0
              )}
            </div>
            <p className="text-xs text-rose-500 flex items-center mt-1.5 font-medium">
              {statsData?.products?.lowStock || 0} منتجات بحاجة لمتابعة المخزون
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts & Real Activity */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 overflow-hidden border border-border/70 bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {t("dashboard.revenue_over_time", "الإيرادات مع مرور الوقت (شهرياً)")}
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 pt-0">
            {isMounted ? (
              <div dir="ltr" className="w-full">
                <ChartContainer
                  config={{ sales: { label: t("dashboard.total_sales", "المبيعات"), color: "#f43f5e" } }}
                  className="h-[350px] w-full mt-2"
                >
                  <AreaChart data={salesData} margin={{ top: 20, right: 25, left: 20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      stroke="var(--border)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      dy={6}
                      padding={{ left: 16, right: 16 }}
                      tick={{ fill: "var(--foreground)", fontSize: 12, fontWeight: 500 }}
                    />
                    <YAxis
                      stroke="var(--border)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `$${value}`}
                      width={65}
                      tickMargin={8}
                      tick={{ fill: "var(--foreground)", fontSize: 12, fontWeight: 500 }}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="#f43f5e"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#colorSales)"
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            ) : (
              <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground text-sm">
                <div className="animate-pulse bg-muted/40 rounded-lg w-[90%] h-[280px]" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real Activity from Database */}
        <Card className="lg:col-span-3 border border-border/70 bg-card shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-semibold">
              {t("dashboard.recent_activity", "آخر الطلبات المسجلة")}
            </CardTitle>
            <Link href="/admin/orders" className="text-xs text-primary hover:underline font-medium">
              عرض الكل
            </Link>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin mr-2" /> جاري التحديث...
              </div>
            ) : !statsData?.recentOrders?.length ? (
              <div className="text-center py-12 text-muted-foreground text-sm">
                لم يتم تسجيل أي طلبات بعد في المتجر.
              </div>
            ) : (
              <div className="space-y-4">
                {statsData.recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
                        <ShoppingBag className="h-4 w-4" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-foreground">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.customerName || "عميل غير مسجل"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">
                        ${Number(order.total).toFixed(2)}
                      </p>
                      <span className="inline-block text-[10px] px-2 py-0.5 rounded-full font-medium bg-muted text-muted-foreground">
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border border-border/70 bg-card shadow-xs">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              {t("dashboard.traffic_sources", "مصادر الزيارات")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isMounted ? (
              <div className="h-[300px] w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={trafficData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {trafficData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "8px",
                        color: "var(--foreground)",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)",
                      }}
                      itemStyle={{ color: "var(--foreground)", fontWeight: 500 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] w-full flex items-center justify-center">
                <div className="animate-pulse bg-muted/40 rounded-full w-44 h-44" />
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 mt-2">
              {trafficData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div className="flex-1 text-sm font-medium">{item.name}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <InteractiveAnalytics />
      </div>
    </div>
  )
}
