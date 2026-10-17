import { NextRequest, NextResponse } from "next/server"
import { getStoreMenus, saveStoreMenus, MenuItem } from "@/lib/store-storage"
import { requireAdminSession } from "@/lib/auth-guard"

// GET /api/store/menus - جلب قوائم التنقل (الهيدر والفوتر)
export async function GET() {
  try {
    const menus = getStoreMenus()
    return NextResponse.json({
      success: true,
      menus,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load store menus" },
      { status: 500 }
    )
  }
}

// POST /api/store/menus - إضافة عنصر تنقل جديد (محمي)
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const { location, label, url } = body

    if (!location || (location !== "header" && location !== "footer")) {
      return NextResponse.json(
        { success: false, error: "Location must be 'header' or 'footer'" },
        { status: 400 }
      )
    }

    if (!label || typeof label !== "string" || !label.trim()) {
      return NextResponse.json(
        { success: false, error: "Menu item label is required" },
        { status: 400 }
      )
    }

    if (!url || typeof url !== "string" || !url.trim()) {
      return NextResponse.json(
        { success: false, error: "Menu item URL is required" },
        { status: 400 }
      )
    }

    const menus = getStoreMenus()
    const newItem: MenuItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      label: label.trim(),
      url: url.trim(),
    }

    if (location === "header") {
      menus.header.push(newItem)
    } else {
      menus.footer.push(newItem)
    }

    saveStoreMenus(menus)

    return NextResponse.json(
      {
        success: true,
        message: "Menu item added successfully",
        item: newItem,
        menus,
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add menu item" },
      { status: 500 }
    )
  }
}
