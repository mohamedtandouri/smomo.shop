import { NextRequest, NextResponse } from "next/server"
import { getStoreApps, saveStoreApps, StoreApp } from "@/lib/store-storage"
import { requireAdminSession } from "@/lib/auth-guard"

// GET /api/store/apps - جلب التطبيقات والربط البرمجي
export async function GET() {
  try {
    const apps = getStoreApps()
    return NextResponse.json({
      success: true,
      apps,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load apps" },
      { status: 500 }
    )
  }
}

// PUT /api/store/apps - تحديث حالة تطبيق أو مفاتيح API الخاصة به (محمي)
export async function PUT(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const { id, installed, apiKey, webhookUrl } = body

    if (!id) {
      return NextResponse.json(
        { success: false, error: "App ID is required" },
        { status: 400 }
      )
    }

    const apps = getStoreApps()
    const idx = apps.findIndex((a) => a.id === id)

    if (idx === -1) {
      return NextResponse.json(
        { success: false, error: "App not found" },
        { status: 404 }
      )
    }

    const current = apps[idx]
    const updated: StoreApp = {
      ...current,
      ...(installed !== undefined && { installed: Boolean(installed) }),
      ...(apiKey !== undefined && { apiKey: String(apiKey).trim() }),
      ...(webhookUrl !== undefined && { webhookUrl: String(webhookUrl).trim() }),
      updatedAt: new Date().toISOString(),
    }

    apps[idx] = updated
    saveStoreApps(apps)

    return NextResponse.json({
      success: true,
      message: `App ${current.name} updated successfully`,
      app: updated,
      apps,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update app settings" },
      { status: 500 }
    )
  }
}
