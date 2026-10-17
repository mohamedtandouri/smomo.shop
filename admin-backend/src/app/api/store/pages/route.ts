import { NextRequest, NextResponse } from "next/server"
import { getCustomPages, saveCustomPages, CustomStorePage } from "@/lib/store-storage"
import { requireAdminSession } from "@/lib/auth-guard"

// GET /api/store/pages - جلب جميع صفحات المتجر الثابتة والمخصصة
export async function GET() {
  try {
    const pages = getCustomPages()
    return NextResponse.json({
      success: true,
      pages,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load store pages" },
      { status: 500 }
    )
  }
}

// POST /api/store/pages - إنشاء صفحة متجر جديدة (محمي)
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const { title, slug, content, status } = body

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Page title is required" },
        { status: 400 }
      )
    }

    const pages = getCustomPages()
    const pageSlug = (slug || title).toLowerCase().trim().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, "")

    // التحقق من تكرار الرابط المختصر
    if (pages.some((p) => p.slug === pageSlug)) {
      return NextResponse.json(
        { success: false, error: "A page with this slug already exists" },
        { status: 409 }
      )
    }

    const newPage: CustomStorePage = {
      id: `page_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: title.trim(),
      slug: pageSlug,
      content: content?.trim() || "",
      status: status === "draft" ? "draft" : "published",
      lastUpdated: new Date().toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
    }

    pages.unshift(newPage)
    saveCustomPages(pages)

    return NextResponse.json(
      {
        success: true,
        message: "Page created successfully",
        page: newPage,
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create store page" },
      { status: 500 }
    )
  }
}
