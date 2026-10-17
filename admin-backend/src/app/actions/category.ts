"use server"

import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { requireAdminSession } from "@/lib/auth-guard"
import { CategoryService } from "@/services/category.service"
import { categoryCreateSchema, categoryUpdateSchema } from "@/lib/validations"

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

async function saveImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null
  if (file.size > MAX_FILE_SIZE) {
    console.error("Category image exceeds 5MB")
    return null
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    console.error("Disallowed category image MIME type:", file.type)
    return null
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  
  const extMap: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  }
  const ext = extMap[file.type] || "png"
  const filename = `cat-${uuidv4()}.${ext}`
  const uploadDir = join(process.cwd(), "public", "uploads")
  
  try {
    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, filename), buffer)
    return `/uploads/${filename}`
  } catch (error) {
    console.error("Error saving file:", error)
    return null
  }
}

export async function getCategories() {
  try {
    return await CategoryService.getCategories()
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function createCategory(formData: FormData) {
  const auth = await requireAdminSession()
  if (!auth.authorized) {
    return { error: "غير مصرح: يجب تسجيل الدخول كمسؤول للنظام." }
  }

  const name = formData.get("name") as string
  const description = (formData.get("description") as string) || null
  const imageFile = formData.get("image") as File | null
  
  let imageUrl: string | null = null
  if (imageFile && imageFile.size > 0) {
    imageUrl = await saveImage(imageFile)
  }

  const validation = categoryCreateSchema.safeParse({
    name,
    description,
    imageUrl,
  })

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "بيانات التصنيف غير صالحة" }
  }

  try {
    const category = await CategoryService.createCategory(validation.data)
    revalidatePath("/admin/products/categories")
    revalidatePath("/store/products")
    return { success: true, category }
  } catch (error: any) {
    console.error("Error creating category:", error)
    return { error: error.message || "فشل إنشاء التصنيف" }
  }
}

export async function updateCategory(id: string, formData: FormData) {
  const auth = await requireAdminSession()
  if (!auth.authorized) {
    return { error: "غير مصرح: يجب تسجيل الدخول كمسؤول للنظام." }
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const imageFile = formData.get("image") as File | null
  
  let imageUrl: string | null = null
  if (imageFile && imageFile.size > 0) {
    imageUrl = await saveImage(imageFile)
  }

  const rawData: any = {}
  if (name !== undefined) rawData.name = name
  if (description !== undefined) rawData.description = description
  if (imageUrl) rawData.imageUrl = imageUrl

  const validation = categoryUpdateSchema.safeParse(rawData)
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "بيانات تحديث التصنيف غير صالحة" }
  }

  try {
    const category = await CategoryService.updateCategory(id, validation.data)
    revalidatePath("/admin/products/categories")
    revalidatePath("/store/products")
    return { success: true, category }
  } catch (error: any) {
    console.error("Error updating category:", error)
    return { error: error.message || "فشل تحديث التصنيف" }
  }
}

export async function deleteCategory(id: string) {
  const auth = await requireAdminSession()
  if (!auth.authorized) {
    return { error: "غير مصرح: يجب تسجيل الدخول كمسؤول للنظام." }
  }

  try {
    await CategoryService.deleteCategory(id)
    revalidatePath("/admin/products/categories")
    revalidatePath("/store/products")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting category:", error)
    return { error: error.message || "فشل حذف التصنيف" }
  }
}
