"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { v4 as uuidv4 } from "uuid"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"]
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

async function verifyAdmin() {
  const session = await getServerSession(authOptions)
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    return false
  }
  return true
}

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
    return `/uploads/${filename}`
  } catch (error) {
    console.error("Error saving file:", error)
    return null
  }
}

export async function createProduct(formData: FormData) {
  if (!(await verifyAdmin())) {
    return { error: "غير مصرح: يجب تسجيل الدخول كمسؤول للنظام." }
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = parseFloat(formData.get("price") as string) || 0
  const stock = parseInt(formData.get("stock") as string) || 0
  
  const imageFile = formData.get("image") as File | null
  let imageUrl = formData.get("imageUrl") as string | null
  
  if (imageFile && imageFile.size > 0) {
    imageUrl = await saveImage(imageFile)
  }
  
  let categoryId = formData.get("categoryId") as string
  
  if (!name) {
    return { error: "اسم المنتج مطلوب" }
  }

  if (categoryId === "") {
    categoryId = undefined as any
  }

  try {
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        stock,
        ...(imageUrl ? { imageUrl } : {}),
        categoryId: categoryId || undefined,
      },
    })
    
    revalidatePath("/admin/products")
    
    return { success: true, productId: product.id }
  } catch (error) {
    console.error("Error creating product:", error)
    return { error: "فشل إنشاء المنتج" }
  }
}

export async function deleteProduct(productId: string) {
  if (!(await verifyAdmin())) {
    return { error: "غير مصرح: يجب تسجيل الدخول كمسؤول للنظام." }
  }

  try {
    await prisma.orderItem.deleteMany({
      where: { productId },
    })
    
    await prisma.review.deleteMany({
      where: { productId },
    })

    await prisma.product.delete({
      where: { id: productId },
    })
    
    revalidatePath("/admin/products")
    
    return { success: true }
  } catch (error) {
    console.error("Error deleting product:", error)
    return { error: "فشل حذف المنتج" }
  }
}

export async function updateProduct(productId: string, formData: FormData) {
  if (!(await verifyAdmin())) {
    return { error: "غير مصرح: يجب تسجيل الدخول كمسؤول للنظام." }
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const price = parseFloat(formData.get("price") as string) || 0
  const stock = parseInt(formData.get("stock") as string) || 0
  const imageFile = formData.get("image") as File | null
  let imageUrl = formData.get("imageUrl") as string | null
  
  if (imageFile && imageFile.size > 0) {
    imageUrl = await saveImage(imageFile)
  }
  
  let categoryId = formData.get("categoryId") as string
  
  if (!name) {
    return { error: "اسم المنتج مطلوب" }
  }

  if (categoryId === "") {
    categoryId = undefined as any
  }

  try {
    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name,
        description,
        price,
        stock,
        ...(imageUrl ? { imageUrl } : {}),
        categoryId: categoryId || undefined,
      },
    })
    
    revalidatePath("/admin/products")
    
    return { success: true, productId: product.id }
  } catch (error) {
    console.error("Error updating product:", error)
    return { error: "فشل تحديث المنتج" }
  }
}

export async function duplicateProduct(productId: string) {
  if (!(await verifyAdmin())) {
    return { error: "غير مصرح: يجب تسجيل الدخول كمسؤول للنظام." }
  }

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    })

    if (!existingProduct) {
      return { error: "المنتج غير موجود" }
    }

    const duplicatedProduct = await prisma.product.create({
      data: {
        name: `${existingProduct.name} - Copy`,
        description: existingProduct.description,
        price: existingProduct.price,
        stock: existingProduct.stock,
        imageUrl: existingProduct.imageUrl,
        categoryId: existingProduct.categoryId,
      },
    })

    revalidatePath("/admin/products")

    return { success: true, productId: duplicatedProduct.id }
  } catch (error) {
    console.error("Error duplicating product:", error)
    return { error: "فشل نسخ المنتج" }
  }
}
