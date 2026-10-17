"use client"

import { useState, useEffect, useCallback } from "react"
import { 
  Download, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Target, 
  BarChart3,
  ArrowUpRight,
  RefreshCw,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import { toast } from "sonner"

interface AnalyticsData {
  range: string
  kpis: {
    grossRevenue: number
    aov: number
    conversionRate: number
    abandonmentRate: number
    totalOrders: number
    totalCustomers: number
    abandonedCartsCount: number
    roas: string
  }
  monthlyPerformance: Array<{
    month: string
    revenue: number
    profit: number
    adSpend: number
  }>
  channelBreakdown: Array<{
    channel: string
    revenue: number
    share: string
    color: string
  }>
  topProducts: Array<{
    id: string
    name: string
    sku: string
    category: string
    views: number
    sales: number
    conversion: string
    revenue: string
  }>
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d")
  const [isMounted, setIsMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)

  const fetchAnalytics = useCallback(async (range: string) => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/analytics?range=${range}`)
      const json = await res.json()
      if (json.success) {
        setData(json)
      } else {
        toast.error("Failed to load analytics from database")
      }
    } catch (err) {
      console.error("Error fetching analytics:", err)
      toast.error("Network error while loading analytics")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    setIsMounted(true)
    fetchAnalytics(timeRange)
  }, [fetchAnalytics, timeRange])

  // Export CSV
  const handleExportCSV = () => {
    if (!data) return
    const headers = "Product Name,SKU,Category,Views,Units Sold,Conversion,Total Revenue\n"
    const rows = data.topProducts
      .map(
        (p) =>
          `"${p.name.replace(/"/g, '""')}","${p.sku}","${p.category}",${p.views},${p.sales},"${p.conversion}","${p.revenue}"`
      )
      .join("\n")
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `store-analytics-${timeRange}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success("Analytics CSV exported successfully")
  }

  const kpis = data?.kpis || {
    grossRevenue: 0,
    aov: 0,
    conversionRate: 0,
    abandonmentRate: 0,
    totalOrders: 0,
    totalCustomers: 0,
    abandonedCartsCount: 0,
    roas: "5.8x",
  }

  const monthlyPerformance = data?.monthlyPerformance || []
  const channelBreakdown = data?.channelBreakdown || []
  const topProducts = data?.topProducts || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics & Reports</h1>
          <p className="text-muted-foreground text-sm">
            Live database telemetry on revenue, customer orders, conversions, and catalog performance.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-muted p-1 rounded-lg flex text-xs font-medium">
            <button
              onClick={() => setTimeRange("7d")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                timeRange === "7d" ? "bg-background shadow-xs text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange("30d")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                timeRange === "30d" ? "bg-background shadow-xs text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange("90d")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                timeRange === "90d" ? "bg-background shadow-xs text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              90 Days
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchAnalytics(timeRange)} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportCSV} disabled={!data || topProducts.length === 0} className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Gross Revenue</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mt-2" />
            ) : (
              <>
                <div className="text-2xl font-bold font-mono">
                  ${kpis.grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-emerald-500 flex items-center mt-1 font-medium">
                  <TrendingUp className="h-3 w-3 mr-1" /> From {kpis.totalOrders} completed orders
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Order Value (AOV)</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <ShoppingCart className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mt-2" />
            ) : (
              <>
                <div className="text-2xl font-bold font-mono">
                  ${kpis.aov.toFixed(2)}
                </div>
                <p className="text-xs text-emerald-500 flex items-center mt-1 font-medium">
                  <TrendingUp className="h-3 w-3 mr-1" /> Dynamic cart value
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Store Conversion Rate</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Target className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mt-2" />
            ) : (
              <>
                <div className="text-2xl font-bold font-mono">
                  {kpis.conversionRate.toFixed(2)}%
                </div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  {kpis.abandonedCartsCount} carts currently pending recovery
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Registered Customers</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mt-2" />
            ) : (
              <>
                <div className="text-2xl font-bold font-mono">
                  {kpis.totalCustomers}
                </div>
                <p className="text-xs text-emerald-500 flex items-center mt-1 font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> Active buyer profiles
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Revenue Growth Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Revenue vs Advertising Spend</CardTitle>
            <CardDescription>Live revenue trend aggregated from database orders</CardDescription>
          </CardHeader>
          <CardContent>
            {isMounted && !isLoading ? (
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyPerformance} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip 
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`, undefined]}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="var(--primary)" strokeWidth={2} fill="url(#revenueGrad)" />
                    <Area type="monotone" dataKey="adSpend" name="Ad Spend" stroke="#94a3b8" strokeWidth={2} fill="none" strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Channel */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Revenue by Channel</CardTitle>
            <CardDescription>Estimated revenue acquisition breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {isMounted && !isLoading ? (
              <div className="space-y-4 pt-2">
                {channelBreakdown.map((item) => (
                  <div key={item.channel} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-foreground">{item.channel}</span>
                      <span className="text-muted-foreground font-mono">${item.revenue.toLocaleString()} ({item.share})</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                      <div 
                        className="h-2 rounded-full transition-all duration-500" 
                        style={{ width: item.share, backgroundColor: item.color }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[260px] w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Products Table */}
      <Card>
        <CardHeader className="py-4 bg-muted/20 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-base font-semibold">Top Performing Products</CardTitle>
              <CardDescription className="text-xs">Live catalog performance ranked by customer views & sales</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex justify-center items-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : topProducts.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No products available in the database yet.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Units Sold</TableHead>
                  <TableHead>Conversion</TableHead>
                  <TableHead className="text-right">Total Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((prod) => (
                  <TableRow key={prod.sku} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">
                      <div>
                        <p className="font-medium">{prod.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{prod.sku}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">{prod.category}</TableCell>
                    <TableCell className="text-sm font-mono">{prod.views.toLocaleString()}</TableCell>
                    <TableCell className="text-sm font-mono font-medium">{prod.sales}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs text-emerald-600 border-emerald-500/20 bg-emerald-500/5">
                        {prod.conversion}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-sm font-mono text-foreground">
                      {prod.revenue}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
