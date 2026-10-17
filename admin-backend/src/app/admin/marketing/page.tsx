"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { 
  Megaphone, 
  Tag, 
  TrendingUp, 
  Plus, 
  ArrowUpRight, 
  Ticket, 
  Percent, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  ArrowRight,
  RefreshCw,
  Loader2,
  Package
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

interface CampaignRow {
  id: string
  name: string
  type: string
  reach: string
  conversions: string
  discount: string
  status: boolean
  createdAt: string
  href: string
}

export default function MarketingPage() {
  const [coupons, setCoupons] = useState<any[]>([])
  const [upsells, setUpsells] = useState<any[]>([])
  const [orders, setOrders] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchMarketingData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [couponsRes, upsellsRes, ordersRes] = await Promise.all([
        fetch("/api/coupons").then((r) => r.json()).catch(() => ({ coupons: [] })),
        fetch("/api/upsells").then((r) => r.json()).catch(() => ({ upsells: [] })),
        fetch("/api/orders").then((r) => r.json()).catch(() => ({ orders: [] })),
      ])

      if (couponsRes.success && Array.isArray(couponsRes.coupons)) {
        setCoupons(couponsRes.coupons)
      }
      if (upsellsRes.success && Array.isArray(upsellsRes.upsells)) {
        setUpsells(upsellsRes.upsells)
      }
      if (ordersRes.success && Array.isArray(ordersRes.orders)) {
        setOrders(ordersRes.orders)
      }
    } catch (err) {
      console.error("Failed to load marketing data:", err)
      toast.error("Failed to load marketing promotions from database")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMarketingData()
  }, [fetchMarketingData])

  const activeCoupons = coupons.filter((c) => c.isActive)
  const activeUpsells = upsells.filter((u) => u.isActive)
  const totalActivePromotions = activeCoupons.length + activeUpsells.length

  const totalDiscountsGiven = orders.reduce((sum, o) => sum + Number(o.discount || 0), 0)

  // Unified Campaigns Table
  const combinedCampaigns: CampaignRow[] = [
    ...coupons.map((c) => ({
      id: c.id,
      name: `Coupon: ${c.code}`,
      type: "Discount Coupon",
      reach: "Storewide",
      conversions: c.discountType === "PERCENTAGE" ? `${c.discountValue}% off` : `$${c.discountValue} off`,
      discount: c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `$${c.discountValue}`,
      status: c.isActive,
      createdAt: new Date(c.createdAt).toLocaleDateString(),
      href: "/admin/marketing/coupons",
    })),
    ...upsells.map((u) => ({
      id: u.id,
      name: u.name,
      type: "Post-Purchase Up Sell",
      reach: u.targetProduct?.name ? `On: ${u.targetProduct.name}` : "Checkout Offer",
      conversions: u.offerProduct?.name ? `Offer: ${u.offerProduct.name}` : "Product Addon",
      discount: `$${u.discount} OFF`,
      status: u.isActive,
      createdAt: "Active Rule",
      href: "/admin/marketing/upsells",
    })),
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Marketing Overview</h1>
          <p className="text-muted-foreground text-sm">
            Live database campaigns, coupon discount codes, and post-purchase upsell strategies.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchMarketingData()} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/admin/marketing/coupons/new">
            <Button variant="outline" className="gap-2">
              <Ticket className="h-4 w-4" />
              New Coupon
            </Button>
          </Link>
          <Link href="/admin/marketing/upsells/new">
            <Button className="gap-2">
              <TrendingUp className="h-4 w-4" />
              New Up Sell
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Campaigns</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Megaphone className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mt-2" />
            ) : (
              <>
                <div className="text-2xl font-bold font-mono">{totalActivePromotions} Running</div>
                <p className="text-xs text-emerald-500 flex items-center mt-1 font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> {activeCoupons.length} coupons, {activeUpsells.length} upsells
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Coupons</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Tag className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mt-2" />
            ) : (
              <>
                <div className="text-2xl font-bold font-mono">{coupons.length} Created</div>
                <p className="text-xs text-muted-foreground flex items-center mt-1">
                  {activeCoupons.length} currently enabled for shoppers
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Discounts Given</CardTitle>
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
                  ${totalDiscountsGiven.toFixed(2)}
                </div>
                <p className="text-xs text-emerald-500 flex items-center mt-1 font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> From completed order checkouts
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Up Sell Offers</CardTitle>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <Percent className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mt-2" />
            ) : (
              <>
                <div className="text-2xl font-bold font-mono">{upsells.length} Defined</div>
                <p className="text-xs text-emerald-500 flex items-center mt-1 font-medium">
                  <ArrowUpRight className="h-3 w-3 mr-1" /> {activeUpsells.length} active in cart
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feature Navigation Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Ticket className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">
                {activeCoupons.length} Active in DB
              </Badge>
            </div>
            <CardTitle className="mt-4">Discount Coupons</CardTitle>
            <CardDescription>
              Create percentage or fixed-amount coupon codes stored directly in your database.
            </CardDescription>
          </CardHeader>
          <CardFooter className="border-t pt-4 flex justify-between">
            <span className="text-xs text-muted-foreground">{coupons.length} Total coupons in database</span>
            <Link href="/admin/marketing/coupons">
              <Button variant="ghost" size="sm" className="gap-1.5 text-primary hover:text-primary">
                Manage Coupons <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
              <Badge variant="outline" className="text-emerald-600 border-emerald-500/20 bg-emerald-500/5">
                {activeUpsells.length} Active Rules
              </Badge>
            </div>
            <CardTitle className="mt-4">Post-Purchase Up Sells</CardTitle>
            <CardDescription>
              Display targeted recommendations and discounted add-ons linked to live catalog items.
            </CardDescription>
          </CardHeader>
          <CardFooter className="border-t pt-4 flex justify-between">
            <span className="text-xs text-muted-foreground">{upsells.length} Total rules in database</span>
            <Link href="/admin/marketing/upsells">
              <Button variant="ghost" size="sm" className="gap-1.5 text-primary hover:text-primary">
                Manage Up Sells <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      {/* Live Campaigns Table */}
      <Card>
        <CardHeader className="py-4 bg-muted/20 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-base font-semibold">Live Promotional Campaigns</CardTitle>
              <CardDescription className="text-xs">Database-driven promotions across coupons and cart upsells</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex justify-center items-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : combinedCampaigns.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Package className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
              <p className="text-sm font-medium">No marketing promotions created yet.</p>
              <p className="text-xs mt-1">Add a new coupon or upsell rule to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Campaign Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Target Scope</TableHead>
                  <TableHead>Offer / Discount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {combinedCampaigns.map((campaign) => (
                  <TableRow key={campaign.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                        {campaign.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{campaign.type}</TableCell>
                    <TableCell className="text-sm">{campaign.reach}</TableCell>
                    <TableCell className="font-semibold text-sm font-mono">{campaign.discount}</TableCell>
                    <TableCell>
                      {campaign.status ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" /> Disabled
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={campaign.href}>
                        <Button variant="ghost" size="sm" className="h-8 text-xs text-primary">
                          Manage
                        </Button>
                      </Link>
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
