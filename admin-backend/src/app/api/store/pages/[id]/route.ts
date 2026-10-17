import { NextRequest, NextResponse } from "next/server"
import { getCustomPages, saveCustomPages } from "@/lib/store-storage"
import { requireAdminSession } from "@/lib/auth-guard"

// GET /api/store/pages/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const pages = getCustomPages()
    const page = pages.find((p) => p.id === id || p.slug === id)

    if (!page) {
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, page })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch page" },
      { status: 500 }
    )
  }
}

// PUT /api/store/pages/[id] - تعديل صفحة متجر
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    const body = await request.json()
    const { title, slug, content, status } = body

    const pages = getCustomPages()
    const pageIndex = pages.findIndex((p) => p.id === id)

    if (pageIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 }
      )
    }

    const current = pages[pageIndex]
    const updated = {
      ...current,
      title: title?.trim() || current.title,
      slug: slug ? slug.toLowerCase().trim().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "") : current.slug,
      content: content !== undefined ? content : current.content,
      status: status || current.status,
      lastUpdated: new Date().toISOString().split("T")[0],
    }

    pages[pageIndex] = updated
    saveCustomPages(pages)

    return NextResponse.json({
      success: true,
      message: "Page updated successfully",
      page: updated,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update page" },
      { status: 500 }
    )
  }
}

// DELETE /api/store/pages/[id] - حذف صفحة متجر
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const { id } = await params
    let pages = getCustomPages()
    const initialLength = pages.length

    pages = pages.filter((p) => p.id !== id && p.slug !== id)

    if (pages.length === initialLength) {
      return NextResponse.json(
        { success: false, error: "Page not found" },
        { status: 404 }
      )
    }

    saveCustomPages(pages)

    return NextResponse.json({
      success: true,
      message: "Page deleted successfully",
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete page" },
      { status: 500 }
    )
  }
}
