import { NextRequest, NextResponse } from "next/server"
import { getStoreLanguages, saveStoreLanguages, StoreLanguageItem } from "@/lib/store-storage"
import { requireAdminSession } from "@/lib/auth-guard"

export const dynamic = "force-dynamic"

// GET /api/store/languages - جلب قائمة اللغات وإعداداتها
export async function GET() {
  try {
    const languages = getStoreLanguages()
    return NextResponse.json({
      success: true,
      languages,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load store languages" },
      { status: 500 }
    )
  }
}

// POST /api/store/languages - إضافة لغة جديدة للمتجر
export async function POST(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const code = String(body.code ?? "").trim().toLowerCase()
    const name = String(body.name ?? "").trim()
    const nativeName = String(body.nativeName ?? name).trim()
    const direction = body.direction === "RTL" ? "RTL" : "LTR"
    const flag = String(body.flag ?? "🌐").trim()

    if (!code || !name) {
      return NextResponse.json(
        { success: false, error: "Language code and name are required" },
        { status: 400 }
      )
    }

    const languages = getStoreLanguages()
    if (languages.some((l) => l.code.toLowerCase() === code)) {
      return NextResponse.json(
        { success: false, error: "This language code already exists" },
        { status: 400 }
      )
    }

    const newLang: StoreLanguageItem = {
      code,
      name,
      nativeName,
      direction,
      isDefault: false,
      enabled: true,
      completion: Number.isFinite(Number(body.completion)) ? Number(body.completion) : 100,
      flag,
    }

    languages.push(newLang)
    saveStoreLanguages(languages)

    return NextResponse.json(
      {
        success: true,
        message: "Language added successfully",
        languages,
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add language" },
      { status: 500 }
    )
  }
}

// PUT /api/store/languages - تحديث اللغة الافتراضية أو تفعيل/تعطيل لغة
export async function PUT(request: NextRequest) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return auth.response

  try {
    const body = await request.json()
    const code = String(body.code ?? "").trim().toLowerCase()
    const { makeDefault, enabled } = body

    if (!code) {
      return NextResponse.json(
        { success: false, error: "Language code is required" },
        { status: 400 }
      )
    }

    let languages = getStoreLanguages()
    const target = languages.find((l) => l.code.toLowerCase() === code)

    if (!target) {
      return NextResponse.json(
        { success: false, error: "Language not found" },
        { status: 404 }
      )
    }

    if (makeDefault === true) {
      // تعيين اللغة المختارة كافتراضية وتفعيلها تلقائياً
      languages = languages.map((l) => ({
        ...l,
        isDefault: l.code.toLowerCase() === code,
        enabled: l.code.toLowerCase() === code ? true : l.enabled,
      }))
    } else if (enabled !== undefined) {
      // منع تعطيل اللغة الافتراضية الحالية
      if (target.isDefault && Boolean(enabled) === false) {
        return NextResponse.json(
          {
            success: false,
            error: "Cannot disable the default language. Set another language as default first.",
          },
          { status: 400 }
        )
      }

      languages = languages.map((l) =>
        l.code.toLowerCase() === code ? { ...l, enabled: Boolean(enabled) } : l
      )
    }

    saveStoreLanguages(languages)

    return NextResponse.json({
      success: true,
      message: "Language settings saved successfully",
      languages,
    })
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update language settings" },
      { status: 500 }
    )
  }
}
