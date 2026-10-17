import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdminSession } from "@/lib/auth-guard"

// GET /api/store/settings - جلب إعدادات المتجر العامة (متاح للمتجر واللوحة)
export async function GET() {
  try {
    let settings = await db.storeSettings.findUnique({
      where: { id: "store_config" }
    })

    if (!settings) {
      settings = await db.storeSettings.create({
        data: {
          id: "store_config",
          storeName: "Smomo",
          storeDescription: "Your premium online store",
          currency: "USD",
          primaryColor: "#ff2d55",
          secondaryColor: "#111827",
          accentColor: "#3b82f6",
          announcementActive: true,
          announcementText: "Welcome to Smomo! Free delivery on orders over $50",
          isMaintenanceMode: false,
        }
      })
    }

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error: any) {
    console.error("Error fetching store settings:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch store settings" },
      { status: 500 }
    )
  }
}

// PUT /api/store/settings - تحديث إعدادات المتجر (محمي: للمدراء فقط)
export async function PUT(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const {
      storeName,
      storeDescription,
      contactEmail,
      contactPhone,
      currency,
      primaryColor,
      secondaryColor,
      accentColor,
      announcementActive,
      announcementText,
      announcementUrl,
      isMaintenanceMode,
      logoUrl,
      faviconUrl,
    } = body

    const updated = await db.storeSettings.upsert({
      where: { id: "store_config" },
      update: {
        ...(storeName !== undefined && { storeName: storeName.trim() }),
        ...(storeDescription !== undefined && { storeDescription }),
        ...(contactEmail !== undefined && { contactEmail }),
        ...(contactPhone !== undefined && { contactPhone }),
        ...(currency !== undefined && { currency }),
        ...(primaryColor !== undefined && { primaryColor }),
        ...(secondaryColor !== undefined && { secondaryColor }),
        ...(accentColor !== undefined && { accentColor }),
        ...(announcementActive !== undefined && { announcementActive: Boolean(announcementActive) }),
        ...(announcementText !== undefined && { announcementText }),
        ...(announcementUrl !== undefined && { announcementUrl }),
        ...(isMaintenanceMode !== undefined && { isMaintenanceMode: Boolean(isMaintenanceMode) }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(faviconUrl !== undefined && { faviconUrl }),
      },
      create: {
        id: "store_config",
        storeName: storeName?.trim() || "Smomo",
        storeDescription: storeDescription || "Your premium online store",
        currency: currency || "USD",
        primaryColor: primaryColor || "#ff2d55",
        secondaryColor: secondaryColor || "#111827",
        accentColor: accentColor || "#3b82f6",
        announcementActive: Boolean(announcementActive),
        announcementText: announcementText || "",
        announcementUrl: announcementUrl || "",
        isMaintenanceMode: Boolean(isMaintenanceMode),
        logoUrl: logoUrl || null,
        faviconUrl: faviconUrl || null,
      }
    })

    return NextResponse.json({
      success: true,
      message: "تم تحديث إعدادات المتجر بنجاح",
      settings: updated,
    })
  } catch (error: any) {
    console.error("Error updating store settings:", error)
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update store settings" },
      { status: 500 }
    )
  }
}
