import { NextRequest, NextResponse } from "next/server"
import { getStoreFunnels, saveStoreFunnels, StoreFunnel } from "@/lib/store-storage"
import { requireAdminSession } from "@/lib/auth-guard"

// GET /api/store/funnels - جلب جميع مسارات البيع وصفحات الهبوط
export async function GET() {
  try {
    const funnels = getStoreFunnels()
    return NextResponse.json({
      success: true,
      funnels,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load funnels" },
      { status: 500 }
    )
  }
}

// POST /api/store/funnels - إنشاء مسار بيع جديد (محمي)
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const { name, status, steps } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Funnel name is required" },
        { status: 400 }
      )
    }

    const funnels = getStoreFunnels()
    const newFunnel: StoreFunnel = {
      id: `funnel_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: name.trim(),
      status: status === "Active" ? "Active" : "Draft",
      visitors: 0,
      conversionRate: "0.0%",
      revenue: "$0",
      steps: Array.isArray(steps) && steps.length > 0 ? steps : ["Landing Page", "Checkout", "Upsell", "Thank You"],
      createdAt: new Date().toISOString().split("T")[0],
    }

    funnels.unshift(newFunnel)
    saveStoreFunnels(funnels)

    return NextResponse.json(
      {
        success: true,
        message: "Sales funnel created successfully",
        funnel: newFunnel,
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create funnel" },
      { status: 500 }
    )
  }
}
