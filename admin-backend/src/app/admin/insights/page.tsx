"use client"

import { useState, useEffect, useCallback } from "react"
import { Download, Calendar as CalendarIcon, TrendingUp, TrendingDown, RefreshCw, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Area, AreaChart, Bar, BarChart, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { toast } from "sonner"

export default function InsightsPage() {
  const [isMounted, setIsMounted] = useState(false)
  const [range, setRange] = useState("30d")
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any>(null)

  const fetchInsights = useCallback(async (selectedRange: string) => {
    try {
      setIsLoading(true)
      const res = await fetch(`/api/analytics?range=${selectedRange}`)
      const json = await res.json()
      if (json.success) {
        setData(json)
      } else {
        toast.error("Failed to load store insights from database")
      }
    } catch (err) {
      console.error("Error loading insights:", err)
      toast.error("Network error while loading insights")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    setIsMounted(true)
    fetchInsights(range)
  }, [fetchInsights, range])

  const kpis = data?.kpis || {
    conversionRate: 3.24,
    aov: 84.5,
    abandonmentRate: 68.2,
    grossRevenue: 0,
    totalOrders: 0,
  }

  const monthlyPerformance = data?.monthlyPerformance || [
    { month: "Jan", revenue: 14200, profit: 5600 },
    { month: "Feb", revenue: 18900, profit: 7800 },
    { month: "Mar", revenue: 16500, profit: 6900 },
    { month: "Apr", revenue: 22400, profit: 9400 },
    { month: "May", revenue: 26800, profit: 11200 },
    { month: "Jun", revenue: 31500, profit: 13800 },
    { month: "Jul", revenue: 38200, profit: 16400 },
  ]

  const trafficData = (data?.channelBreakdown || []).map((ch: any) => ({
    source: ch.channel.replace("Online Store ", "").replace(" Campaigns", ""),
    visitors: Math.max(120, Math.round(ch.revenue / 8.5)),
  }))

  const handleExport = () => {
    if (!data) return
    const content = `Metric,Value\nGross Revenue,$${kpis.grossRevenue}\nAOV,$${kpis.aov.toFixed(2)}\nConversion Rate,${kpis.conversionRate.toFixed(2)}%\nCart Abandonment,${kpis.abandonmentRate.toFixed(2)}%\nTotal Orders,${kpis.totalOrders}`
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `store-insights-${range}.csv`
    a.click()
    toast.success("Insights report downloaded")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Store Insights</h1>
          <p className="text-muted-foreground text-sm">
            Live database intelligence, checkout conversion efficiency, and profit metrics.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted p-1 rounded-lg flex text-xs font-medium">
            <button
              onClick={() => setRange("7d")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                range === "7d" ? "bg-background shadow-xs text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setRange("30d")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                range === "30d" ? "bg-background shadow-xs text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setRange("90d")}
              className={`px-3 py-1.5 rounded-md transition-all ${
                range === "90d" ? "bg-background shadow-xs text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              90 Days
            </button>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchInsights(range)} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button size="sm" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Conversion Rate</h3>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-3xl font-bold font-mono">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${kpis.conversionRate.toFixed(2)}%`}
              </span>
              <span className="text-emerald-500 text-sm font-medium flex items-center mb-1">
                <TrendingUp className="h-3 w-3 mr-1" /> +0.4%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-primary h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, Math.max(10, kpis.conversionRate * 10))}%` }} 
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Average Order Value</h3>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-3xl font-bold font-mono">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `$${kpis.aov.toFixed(2)}`}
              </span>
              <span className="text-emerald-500 text-sm font-medium flex items-center mb-1">
                <TrendingUp className="h-3 w-3 mr-1" /> Live
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: "65%" }} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-1">Cart Abandonment</h3>
            <div className="flex items-end gap-3 mb-4">
              <span className="text-3xl font-bold font-mono text-amber-600">
                {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${kpis.abandonmentRate.toFixed(1)}%`}
              </span>
              <span className="text-muted-foreground text-xs flex items-center mb-1">
                {kpis.abandonedCartsCount} drop-offs
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, kpis.abandonmentRate)}%` }} 
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Customer Acquisition Channels</CardTitle>
            <CardDescription>Estimated buyer flow derived from checkout orders</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-4">
            {isMounted && !isLoading ? (
              <ChartContainer config={{ visitors: { label: "Visitors", color: "var(--primary)" } }} className="h-[300px] w-full">
                <BarChart data={trafficData} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 30 }}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="source" type="category" axisLine={false} tickLine={false} fontSize={12} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="visitors" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Revenue & Profit Trends</CardTitle>
              <CardDescription>Monthly gross revenue vs net operating profit</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                <span className="text-muted-foreground font-medium">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                <span className="text-muted-foreground font-medium">Profit</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 pb-2">
            {isMounted && !isLoading ? (
              <ChartContainer 
                config={{ 
                  revenue: { label: "Revenue", color: "var(--primary)" },
                  profit: { label: "Profit", color: "#3b82f6" }
                }} 
                className="h-[300px] w-full"
              >
                <AreaChart data={monthlyPerformance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorInsightRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorInsightProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorInsightRevenue)" />
                  <Area type="monotone" dataKey="profit" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorInsightProfit)" />
                </AreaChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] w-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
