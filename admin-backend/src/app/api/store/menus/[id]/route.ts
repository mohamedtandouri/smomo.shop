import { NextRequest, NextResponse } from "next/server"
import { getStoreMenus, saveStoreMenus } from "@/lib/store-storage"
import { requireAdminSession } from "@/lib/auth-guard"

// DELETE /api/store/menus/[id] - حذف عنصر قائمة
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const menus = getStoreMenus()

    const initialHeaderLen = menus.header.length
    const initialFooterLen = menus.footer.length

    menus.header = menus.header.filter((m) => m.id !== id)
    menus.footer = menus.footer.filter((m) => m.id !== id)

    if (menus.header.length === initialHeaderLen && menus.footer.length === initialFooterLen) {
      return NextResponse.json(
        { success: false, error: "Menu item not found" },
        { status: 404 }
      )
    }

    saveStoreMenus(menus)

    return NextResponse.json({
      success: true,
      message: "Menu item deleted successfully",
      menus,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete menu item" },
      { status: 500 }
    )
  }
}

// PUT /api/store/menus/[id] - تعديل عنصر قائمة
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const body = await request.json()
    const { label, url } = body

    const menus = getStoreMenus()
    let found = false

    menus.header = menus.header.map((m) => {
      if (m.id === id) {
        found = true
        return {
          ...m,
          label: label !== undefined ? String(label).trim() : m.label,
          url: url !== undefined ? String(url).trim() : m.url,
        }
      }
      return m
    })

    menus.footer = menus.footer.map((m) => {
      if (m.id === id) {
        found = true
        return {
          ...m,
          label: label !== undefined ? String(label).trim() : m.label,
          url: url !== undefined ? String(url).trim() : m.url,
        }
      }
      return m
    })

    if (!found) {
      return NextResponse.json(
        { success: false, error: "Menu item not found" },
        { status: 404 }
      )
    }

    saveStoreMenus(menus)

    return NextResponse.json({
      success: true,
      message: "Menu item updated successfully",
      menus,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update menu item" },
      { status: 500 }
    )
  }
}
