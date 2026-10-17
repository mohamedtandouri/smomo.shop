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
    return await prisma.category.findMany({
      orderBy: { name: 'asc' }
    })
  } catch (error) {
    console.error("Error fetching categories:", error)
    return []
  }
}

export async function createCategory(formData: FormData) {
  if (!(await verifyAdmin())) {
    return { error: "غير مصرح: يجب تسجيل الدخول كمسؤول للنظام." }
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const imageFile = formData.get("image") as File | null
  
  let imageUrl: string | null = null
  if (imageFile && imageFile.size > 0) {
    imageUrl = await saveImage(imageFile)
  }

  if (!name || !name.trim()) {
    return { error: "اسم التصنيف مطلوب" }
  }

  try {
    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        imageUrl
      }
    })
    
    revalidatePath("/admin/products/categories")
    return { success: true, category }
  } catch (error) {
    console.error("Error creating category:", error)
    return { error: "فشل إنشاء التصنيف" }
  }
}

export async function updateCategory(id: string, formData: FormData) {
  if (!(await verifyAdmin())) {
    return { error: "غير مصرح: يجب تسجيل الدخول كمسؤول للنظام." }
  }

  const name = formData.get("name") as string
  const description = formData.get("description") as string
  const imageFile = formData.get("image") as File | null
  
  let imageUrl: string | null = null
  if (imageFile && imageFile.size > 0) {
    imageUrl = await saveImage(imageFile)
  }

  try {
    const dataToUpdate: any = {
      name: name?.trim(),
      description: description?.trim() || null,
    }
    if (imageUrl) {
      dataToUpdate.imageUrl = imageUrl
    }

    const category = await prisma.category.update({
      where: { id },
      data: dataToUpdate
    })
    
    revalidatePath("/admin/products/categories")
    return { success: true, category }
  } catch (error) {
    console.error("Error updating category:", error)
    return { error: "فشل تحديث التصنيف" }
  }
}

export async function deleteCategory(id: string) {
  if (!(await verifyAdmin())) {
    return { error: "غير مصرح: يجب تسجيل الدخول كمسؤول للنظام." }
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { products: true }
    })

    if (category && category.products.length > 0) {
      await prisma.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: null }
      })
    }

    await prisma.category.delete({
      where: { id }
    })
    
    revalidatePath("/admin/products/categories")
    return { success: true }
  } catch (error) {
    console.error("Error deleting category:", error)
    return { error: "فشل حذف التصنيف" }
  }
}
