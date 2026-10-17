import { NextRequest, NextResponse } from "next/server"
import { getStoreFunnels, saveStoreFunnels } from "@/lib/store-storage"
import { requireAdminSession } from "@/lib/auth-guard"

// PUT /api/store/funnels/[id] - تعديل مسار بيع
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const body = await request.json()
    const { name, status, steps } = body

    const funnels = getStoreFunnels()
    const idx = funnels.findIndex((f) => f.id === id)

    if (idx === -1) {
      return NextResponse.json(
        { success: false, error: "Funnel not found" },
        { status: 404 }
      )
    }

    const current = funnels[idx]
    const updated = {
      ...current,
      name: name?.trim() || current.name,
      status: status || current.status,
      steps: Array.isArray(steps) ? steps : current.steps,
    }

    funnels[idx] = updated
    saveStoreFunnels(funnels)

    return NextResponse.json({
      success: true,
      message: "Funnel updated successfully",
      funnel: updated,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update funnel" },
      { status: 500 }
    )
  }
}

// DELETE /api/store/funnels/[id] - حذف مسار بيع
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    let funnels = getStoreFunnels()
    const initialLen = funnels.length

    funnels = funnels.filter((f) => f.id !== id)

    if (funnels.length === initialLen) {
      return NextResponse.json(
        { success: false, error: "Funnel not found" },
        { status: 404 }
      )
    }

    saveStoreFunnels(funnels)

    return NextResponse.json({
      success: true,
      message: "Funnel deleted successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete funnel" },
      { status: 500 }
    )
  }
}
