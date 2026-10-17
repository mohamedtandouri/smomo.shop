"use server"

import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { requireAdminSession } from "@/lib/auth-guard"
import { ProductService } from "@/services/product.service"
import { productCreateSchema, productUpdateSchema } from "@/lib/validations"
import { safeDecimal } from "@/lib/finance"

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

async function saveImage(file: File | null): Promise<string | null> {
  if (!file || file.size === 0) return null
  if (file.size > MAX_FILE_SIZE) {
    console.error("Image file size exceeds limit (5MB)")
    return null
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    console.error("Disallowed image MIME type:", file.type)
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
  const filename = `${uuidv4()}.${ext}`
  const uploadDir = join(process.cwd(), "public", "uploads")
  
  try {
    await mkdir(uploadDir, { recursive: true })
    await writeFile(join(uploadDir, filename), buffer)

    // نسخ صورة المنتج أيضاً إلى مجلد public/uploads الخاص بواجهة المتجر (storefront) لضمان ظهورها فوراً
    try {
      const storefrontUploadDir = join(process.cwd(), "..", "storefront", "public", "uploads")
      await mkdir(storefrontUploadDir, { recursive: true })
      await writeFile(join(storefrontUploadDir, filename), buffer)
    } catch {
      // تجاهل الخطأ في حال عدم وجود مجلد المتجر المنفصل
    }

    return `/uploads/${filename}`
  } catch (error) {
    console.error("Error saving file:", error)
    return null
  }
}

export async function createProduct(formData: FormData) {
  const auth = await requireAdminSession()
  if (!auth.authorized) {
    return { error: "غير مصرح: يجب تسجيل الدخول كمسؤول للنظام." }
  }

  const name = formData.get("name") as string
  const description = (formData.get("description") as string) || null
  const sku = (formData.get("sku") as string) || null
  const price = parseFloat(formData.get("price") as string) || 0
  const compareAtPrice = formData.get("compareAtPrice") ? parseFloat(formData.get("compareAtPrice") as string) : null
  const stock = parseInt(formData.get("stock") as string) || 0
  
  const imageFile = formData.get("image") as File | null
  let imageUrl = (formData.get("imageUrl") as string) || null
  
  if (imageFile && imageFile.size > 0) {
    const saved = await saveImage(imageFile)
    if (saved) imageUrl = saved
  }
  
  let categoryId = formData.get("categoryId") as string
  if (categoryId === "") categoryId = null as any

  // التحقق عبر Zod
  const validation = productCreateSchema.safeParse({
    name,
    sku,
    description,
    price,
    compareAtPrice,
    stock,
    imageUrl,
    categoryId,
  })

  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "بيانات المنتج غير صالحة" }
  }

  try {
    const product = await ProductService.createProduct(validation.data)
    revalidatePath("/admin/products")
    revalidatePath("/store/products")
    return { success: true, productId: product.id }
  } catch (error: any) {
    console.error("Error creating product:", error)
    return { error: error.message || "فشل إنشاء المنتج" }
  }
}

export async function deleteProduct(productId: string) {
  const auth = await requireAdminSession()
  if (!auth.authorized) {
    return { error: "غير مصرح: يجب تسجيل الدخول كمسؤول للنظام." }
  }

  try {
    await ProductService.deleteProduct(productId)
    revalidatePath("/admin/products")
    revalidatePath("/store/products")
    return { success: true }
  } catch (error: any) {
    console.error("Error deleting product:", error)
    return { error: error.message || "فشل حذف المنتج" }
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  const auth = await requireAdminSession()
  if (!auth.authorized) {
    return { error: "غير مصرح: يجب تسجيل الدخول كمسؤول للنظام." }
  }

  const name = formData.get("name") as string
  const description = (formData.get("description") as string) || null
  const sku = (formData.get("sku") as string) || null
  const price = formData.get("price") ? parseFloat(formData.get("price") as string) : undefined
  const compareAtPrice = formData.get("compareAtPrice") ? parseFloat(formData.get("compareAtPrice") as string) : null
  const stock = formData.get("stock") !== null ? parseInt(formData.get("stock") as string) : undefined
  const imageFile = formData.get("image") as File | null
  let imageUrl = formData.get("imageUrl") as string | null
  
  if (imageFile && imageFile.size > 0) {
    const saved = await saveImage(imageFile)
    if (saved) imageUrl = saved
  }
  
  let categoryId = formData.get("categoryId") as string
  if (categoryId === "") categoryId = null as any

  const rawData: any = {}
  if (name !== undefined) rawData.name = name
  if (description !== undefined) rawData.description = description
  if (sku !== undefined) rawData.sku = sku
  if (price !== undefined) rawData.price = price
  if (compareAtPrice !== undefined) rawData.compareAtPrice = compareAtPrice
  if (stock !== undefined) rawData.stock = stock
  if (imageUrl !== null && imageUrl !== undefined) rawData.imageUrl = imageUrl
  if (categoryId !== undefined) rawData.categoryId = categoryId

  const validation = productUpdateSchema.safeParse(rawData)
  if (!validation.success) {
    return { error: validation.error.issues[0]?.message || "بيانات تحديث المنتج غير صالحة" }
  }

  try {
    const product = await ProductService.updateProduct(productId, validation.data)
    revalidatePath("/admin/products")
    revalidatePath("/store/products")
    return { success: true, productId: product.id }
  } catch (error: any) {
    console.error("Error updating product:", error)
    return { error: error.message || "فشل تحديث المنتج" }
  }
}

export async function duplicateProduct(productId: string) {
  const auth = await requireAdminSession()
  if (!auth.authorized) {
    return { error: "غير مصرح: يجب تسجيل الدخول كمسؤول للنظام." }
  }

  try {
    const existing = await ProductService.getProductById(productId)
    if (!existing) {
      return { error: "المنتج غير موجود" }
    }

    const duplicated = await ProductService.createProduct({
      name: `${existing.name} - Copy`,
      description: existing.description,
      sku: existing.sku ? `${existing.sku}-COPY` : null,
      price: existing.price,
      compareAtPrice: (existing as any).compareAtPrice || null,
      stock: existing.stock,
      imageUrl: existing.imageUrl,
      categoryId: existing.categoryId,
    })

    revalidatePath("/admin/products")
    revalidatePath("/store/products")
    return { success: true, productId: duplicated.id }
  } catch (error: any) {
    console.error("Error duplicating product:", error)
    return { error: error.message || "فشل نسخ المنتج" }
  }
}
