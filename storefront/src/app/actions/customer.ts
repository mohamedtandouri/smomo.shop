"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { requireAdminSession } from "@/lib/auth-guard"

export async function deleteCustomer(userId: string) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return { error: "غير مصرح لك بتنفيذ هذه العملية" }

  try {
    // Delete related profile first (if exists)
    await prisma.profile.deleteMany({
      where: { userId }
    })
    
    await prisma.order.deleteMany({
      where: { userId }
    })

    await prisma.user.delete({
      where: { id: userId }
    })
    
    revalidatePath("/admin/customers")
    return { success: true }
  } catch (error) {
    console.error("Error deleting customer:", error)
    return { error: "Failed to delete customer. Ensure no strict dependencies exist." }
  }
}

export async function toggleCustomerStatus(userId: string, currentStatus: string) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return { error: "غير مصرح لك بتنفيذ هذه العملية" }

  try {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
    
    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus }
    })
    
    revalidatePath("/admin/customers")
    return { success: true, status: newStatus }
  } catch (error) {
    console.error("Error updating customer status:", error)
    return { error: "Failed to update status" }
  }
}

export async function updateCustomer(userId: string, data: { name: string; email: string; phone?: string }) {
  const auth = await requireAdminSession()
  if (!auth.authorized) return { error: "غير مصرح لك بتنفيذ هذه العملية" }

  try {
    // Check email uniqueness
    const existing = await prisma.user.findUnique({ where: { email: data.email } })
    if (existing && existing.id !== userId) {
      return { error: "البريد الإلكتروني مستخدم بالفعل لحساب آخر" }
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone || null
      }
    })
    
    revalidatePath("/admin/customers")
    return { success: true }
  } catch (error) {
    console.error("Error updating customer:", error)
    return { error: "Failed to update customer details" }
  }
}
