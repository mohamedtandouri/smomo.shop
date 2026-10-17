"use client"

import { useState, useEffect, useMemo } from "react"
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid 
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Percent, 
  TrendingUp, 
  Calendar, 
  BarChart2, 
  LineChart as LineChartIcon,
  Sparkles 
} from "lucide-react"

type MetricKey = "revenue" | "orders" | "visitors" | "conversion"
type TimeRange = "7d" | "30d"
type ChartType = "area" | "bar"

interface MetricConfig {
  label: string
  shortLabel: string
  unit: string
  prefix: string
  suffix: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  gradientId: string
  decimals: number
}

const METRICS: Record<MetricKey, MetricConfig> = {
  revenue: {
    label: "Revenue",
    shortLabel: "Rev",
    unit: "$",
    prefix: "$",
    suffix: "",
    icon: DollarSign,
    color: "var(--primary, #f43f5e)",
    gradientId: "gradRevenue",
    decimals: 0,
  },
  orders: {
    label: "Orders",
    shortLabel: "Orders",
    unit: "orders",
    prefix: "",
    suffix: " orders",
    icon: ShoppingBag,
    color: "#8b5cf6", // violet-500
    gradientId: "gradOrders",
    decimals: 0,
  },
  visitors: {
    label: "Store Visitors",
    shortLabel: "Visitors",
    unit: "visits",
    prefix: "",
    suffix: " visits",
    icon: Users,
    color: "#3b82f6", // blue-500
    gradientId: "gradVisitors",
    decimals: 0,
  },
  conversion: {
    label: "Conversion Rate",
    shortLabel: "Conv.",
    unit: "%",
    prefix: "",
    suffix: "%",
    icon: Percent,
    color: "#10b981", // emerald-500
    gradientId: "gradConversion",
    decimals: 2,
  },
}

// 7-day data breakdown
const DATA_7D = [
  { name: "Mon", date: "Mon, Sep 2", revenue: 3240, orders: 42, visitors: 1240, conversion: 3.39 },
  { name: "Tue", date: "Tue, Sep 3", revenue: 4120, orders: 56, visitors: 1480, conversion: 3.78 },
  { name: "Wed", date: "Wed, Sep 4", revenue: 3890, orders: 51, visitors: 1390, conversion: 3.67 },
  { name: "Thu", date: "Thu, Sep 5", revenue: 5260, orders: 74, visitors: 1820, conversion: 4.07 },
  { name: "Fri", date: "Fri, Sep 6", revenue: 6410, orders: 89, visitors: 2240, conversion: 3.97 },
  { name: "Sat", date: "Sat, Sep 7", revenue: 7850, orders: 112, visitors: 2790, conversion: 4.01 },
  { name: "Sun", date: "Sun, Sep 8", revenue: 6920, orders: 98, visitors: 2450, conversion: 4.00 },
]

// 30-day weekly aggregated data breakdown
const DATA_30D = [
  { name: "Week 1", date: "Aug 10 - Aug 16", revenue: 21500, orders: 310, visitors: 8900, conversion: 3.48 },
  { name: "Week 2", date: "Aug 17 - Aug 23", revenue: 26400, orders: 382, visitors: 10400, conversion: 3.67 },
  { name: "Week 3", date: "Aug 24 - Aug 30", revenue: 31200, orders: 445, visitors: 11800, conversion: 3.77 },
  { name: "Week 4", date: "Aug 31 - Sep 6",  revenue: 37690, orders: 522, visitors: 13410, conversion: 3.89 },
]

export function InteractiveAnalytics() {
  const [activeMetric, setActiveMetric] = useState<MetricKey>("revenue")
  const [timeRange, setTimeRange] = useState<TimeRange>("7d")
  const [chartType, setChartType] = useState<ChartType>("area")
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const currentDataset = useMemo(() => {
    return timeRange === "7d" ? DATA_7D : DATA_30D
  }, [timeRange])

  const metricConfig = METRICS[activeMetric]

  // Calculate summary metrics
  const stats = useMemo(() => {
    const values = currentDataset.map((d) => d[activeMetric])
    const total = activeMetric === "conversion"
      ? values.reduce((acc, v) => acc + v, 0) / values.length
      : values.reduce((acc, v) => acc + v, 0)

    const maxVal = Math.max(...values)
    const peakIndex = values.indexOf(maxVal)
    const peakItem = currentDataset[peakIndex]
    const avg = values.reduce((acc, v) => acc + v, 0) / values.length

    // Simulated growth rates
    const growthRates: Record<MetricKey, { val: string; isPositive: boolean }> = {
      revenue: { val: "+16.8%", isPositive: true },
      orders: { val: "+12.4%", isPositive: true },
      visitors: { val: "+21.3%", isPositive: true },
      conversion: { val: "+0.52%", isPositive: true },
    }

    return {
      total,
      maxVal,
      peakLabel: peakItem ? peakItem.name : "",
      avg,
      growth: growthRates[activeMetric],
    }
  }, [currentDataset, activeMetric])

  const formatValue = (val: number, metric: MetricKey) => {
    const cfg = METRICS[metric]
    if (metric === "revenue") {
      return `${cfg.prefix}${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
    }
    if (metric === "conversion") {
      return `${val.toFixed(2)}${cfg.suffix}`
    }
    return `${cfg.prefix}${val.toLocaleString()}`
  }

  return (
    <Card className="flex flex-col justify-between overflow-hidden shadow-xs transition-all duration-200 hover:shadow-md border border-border/70 bg-card">
      {/* Header Section */}
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold tracking-tight">Interactive Analytics</CardTitle>
              <Badge variant="outline" className="gap-1 bg-primary/5 text-primary text-[11px] font-medium border-primary/20">
                <Sparkles className="h-3 w-3" /> Live Trends
              </Badge>
            </div>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Interactive store telemetry and multi-metric insights
            </CardDescription>
          </div>

          {/* Controls: TimeRange & ChartType */}
          <div className="flex items-center gap-1.5">
            {/* TimeRange Selector */}
            <div className="bg-muted/70 dark:bg-muted/40 p-0.5 rounded-lg flex text-xs">
              <button
                type="button"
                onClick={() => setTimeRange("7d")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  timeRange === "7d"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                7D
              </button>
              <button
                type="button"
                onClick={() => setTimeRange("30d")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  timeRange === "30d"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                30D
              </button>
            </div>

            {/* Chart Type Toggle */}
            <div className="bg-muted/70 dark:bg-muted/40 p-0.5 rounded-lg flex text-xs">
              <button
                type="button"
                onClick={() => setChartType("area")}
                title="Area Chart"
                className={`p-1 rounded-md transition-all ${
                  chartType === "area"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LineChartIcon className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setChartType("bar")}
                title="Bar Chart"
                className={`p-1 rounded-md transition-all ${
                  chartType === "bar"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <BarChart2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Metric Selector Pills */}
        <div className="grid grid-cols-4 gap-1.5 mt-3 pt-2 border-t border-border/50">
          {(Object.keys(METRICS) as MetricKey[]).map((key) => {
            const config = METRICS[key]
            const Icon = config.icon
            const isSelected = activeMetric === key

            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveMetric(key)}
                className={`flex flex-col items-start p-2 rounded-lg text-left transition-all relative overflow-hidden ${
                  isSelected
                    ? "bg-primary/10 border border-primary/30 text-foreground"
                    : "bg-muted/30 hover:bg-muted/60 border border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex items-center gap-1 text-[11px] font-medium leading-none">
                  <Icon className="h-3 w-3 shrink-0" />
                  <span className="truncate">{config.shortLabel}</span>
                </div>
                <div className="mt-1 text-xs sm:text-sm font-semibold tracking-tight text-foreground truncate w-full">
                  {key === "revenue" && (timeRange === "7d" ? "$37.7k" : "$116.8k")}
                  {key === "orders" && (timeRange === "7d" ? "524" : "1,659")}
                  {key === "visitors" && (timeRange === "7d" ? "13.4k" : "44.5k")}
                  {key === "conversion" && (timeRange === "7d" ? "3.85%" : "3.71%")}
                </div>
              </button>
            )
          })}
        </div>
      </CardHeader>

      {/* Chart Canvas */}
      <CardContent className="pt-0 pb-3 flex-1 flex flex-col justify-between">
        <div dir="ltr" className="h-[210px] w-full">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              {chartType === "area" ? (
                <AreaChart
                  data={currentDataset}
                  margin={{ top: 12, right: 15, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id={metricConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={metricConfig.color} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={metricConfig.color} stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                  <XAxis
                    dataKey="name"
                    stroke="var(--border)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={4}
                    tick={{ fill: "var(--foreground)", fontSize: 11 }}
                  />
                  <YAxis
                    stroke="var(--border)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={42}
                    tick={{ fill: "var(--foreground)", fontSize: 11 }}
                    tickFormatter={(val) => {
                      if (activeMetric === "revenue") return `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`
                      if (activeMetric === "visitors") return val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
                      if (activeMetric === "conversion") return `${val}%`
                      return val
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null
                      const item = payload[0].payload
                      return (
                        <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
                          <p className="font-semibold text-foreground mb-1">{item.date || item.name}</p>
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: metricConfig.color }}
                            />
                            <span className="text-muted-foreground">{metricConfig.label}:</span>
                            <span className="font-bold text-foreground">
                              {formatValue(item[activeMetric], activeMetric)}
                            </span>
                          </div>
                        </div>
                      )
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={activeMetric}
                    stroke={metricConfig.color}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill={`url(#${metricConfig.gradientId})`}
                    activeDot={{ r: 5, strokeWidth: 2, stroke: "hsl(var(--background))" }}
                    isAnimationActive={true}
                  />
                </AreaChart>
              ) : (
                <BarChart
                  data={currentDataset}
                  margin={{ top: 12, right: 15, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.6} />
                  <XAxis
                    dataKey="name"
                    stroke="var(--border)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    dy={4}
                    tick={{ fill: "var(--foreground)", fontSize: 11 }}
                  />
                  <YAxis
                    stroke="var(--border)"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={42}
                    tick={{ fill: "var(--foreground)", fontSize: 11 }}
                    tickFormatter={(val) => {
                      if (activeMetric === "revenue") return `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`
                      if (activeMetric === "visitors") return val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val
                      if (activeMetric === "conversion") return `${val}%`
                      return val
                    }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null
                      const item = payload[0].payload
                      return (
                        <div className="bg-popover/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg text-xs">
                          <p className="font-semibold text-foreground mb-1">{item.date || item.name}</p>
                          <div className="flex items-center gap-2">
                            <span
                              className="h-2 w-2 rounded-full"
                              style={{ backgroundColor: metricConfig.color }}
                            />
                            <span className="text-muted-foreground">{metricConfig.label}:</span>
                            <span className="font-bold text-foreground">
                              {formatValue(item[activeMetric], activeMetric)}
                            </span>
                          </div>
                        </div>
                      )
                    }}
                  />
                  <Bar
                    dataKey={activeMetric}
                    fill={metricConfig.color}
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={true}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          ) : (
            <div className="h-full w-full flex items-center justify-center">
              <div className="animate-pulse bg-muted/40 rounded-lg w-full h-[180px]" />
            </div>
          )}
        </div>

        {/* Micro-metrics Footer */}
        <div className="grid grid-cols-3 gap-2 pt-2.5 mt-1 border-t border-border/50 text-[11px]">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Daily Average</span>
            <span className="font-semibold text-foreground truncate">
              {formatValue(stats.avg, activeMetric)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-muted-foreground">Peak ({stats.peakLabel})</span>
            <span className="font-semibold text-foreground truncate">
              {formatValue(stats.maxVal, activeMetric)}
            </span>
          </div>
          <div className="flex flex-col items-end text-right">
            <span className="text-muted-foreground">Period Growth</span>
            <span className="font-semibold text-emerald-500 flex items-center gap-0.5">
              <TrendingUp className="h-3 w-3 inline" /> {stats.growth.val}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
