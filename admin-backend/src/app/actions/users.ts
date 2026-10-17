"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import {
  PermissionKey,
  UserRoleType,
  ALL_PERMISSIONS,
  getUserPermissions,
  setUserPermissions,
  deleteUserPermissions,
} from "@/lib/store-storage"

const ValidPermissionEnum = z.enum([
  "view_products",
  "manage_products",
  "edit_orders",
  "access_reports",
  "manage_customers",
  "manage_marketing",
  "manage_users",
  "manage_settings",
])

const ValidRoleEnum = z.enum(["ADMIN", "MANAGER", "EDITOR", "SUPPORT", "USER"])
const ValidStatusEnum = z.enum(["ACTIVE", "SUSPENDED"])

const CreateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "الاسم الكامل يجب ألا يقل عن حرفين")
    .max(80, "الاسم طويل جداً"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("صيغة البريد الإلكتروني غير صحيحة")
    .max(100),
  phone: z.string().trim().max(30).optional().nullable(),
  role: ValidRoleEnum.default("MANAGER"),
  status: ValidStatusEnum.default("ACTIVE"),
  password: z
    .string()
    .min(8, "كلمة المرور يجب ألا تقل عن 8 أحرف")
    .optional()
    .or(z.literal("")),
  permissions: z
    .array(ValidPermissionEnum)
    .min(1, "يرجى تحديد صلاحية وصول واحدة على الأقل للمستخدم"),
})

const UpdateUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "الاسم الكامل يجب ألا يقل عن حرفين")
    .max(80, "الاسم طويل جداً"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("صيغة البريد الإلكتروني غير صحيحة")
    .max(100),
  phone: z.string().trim().max(30).optional().nullable(),
  role: ValidRoleEnum,
  status: ValidStatusEnum,
  password: z
    .string()
    .min(8, "كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف")
    .optional()
    .or(z.literal("")),
  permissions: z
    .array(ValidPermissionEnum)
    .min(1, "يرجى تحديد صلاحية وصول واحدة على الأقل للمستخدم"),
})

export interface ManagedUserItem {
  id: string
  name: string
  email: string
  phone: string | null
  role: UserRoleType
  dbRole: string
  status: "ACTIVE" | "SUSPENDED"
  imageUrl: string | null
  permissions: PermissionKey[]
  ordersCount: number
  createdAt: string
  updatedAt: string
}

/**
 * جلب جميع المستخدمين مع مصفوفة الصلاحيات الخاصة بكل مستخدم
 */
export async function getUsersWithPermissionsAction(): Promise<ManagedUserItem[]> {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: { orders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return users.map((u) => {
      const permRecord = getUserPermissions(u.id, u.role)
      const effectiveRole: UserRoleType = permRecord.roleLabel || (u.role === "ADMIN" ? "ADMIN" : "USER")

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        role: effectiveRole,
        dbRole: u.role,
        status: u.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
        imageUrl: u.imageUrl,
        permissions: permRecord.permissions,
        ordersCount: u._count?.orders || 0,
        createdAt: u.createdAt.toISOString(),
        updatedAt: u.updatedAt.toISOString(),
      }
    })
  } catch (error) {
    console.error("Error fetching users with permissions:", error)
    return []
  }
}

/**
 * إنشاء مستخدم جديد مع تخصيص مصفوفة الصلاحيات
 */
export async function createUserWithPermissionsAction(input: {
  name: string
  email: string
  phone?: string | null
  role: UserRoleType
  status: "ACTIVE" | "SUSPENDED"
  password?: string
  permissions: PermissionKey[]
}) {
  const validation = CreateUserSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "البيانات المدخلة غير صالحة",
    }
  }

  const { name, email, phone, role, status, password, permissions } = validation.data

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    })

    if (existing) {
      return {
        success: false,
        error: "البريد الإلكتروني مسجل بالفعل لمستخدم آخر في النظام.",
      }
    }

    const rawPassword = password && password.trim().length >= 8 ? password.trim() : "Smomo@12345"
    const hashedPassword = await bcrypt.hash(rawPassword, 10)

    // حفظ دور قاعدة البيانات (ADMIN للأدوار الإدارية ليتمكنوا من الدخول للوحة، أو USER للعميل العادي)
    const dbRole = role === "USER" ? "USER" : "ADMIN"

    const created = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        password: hashedPassword,
        role: dbRole,
        status,
      },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    })

    const permRecord = setUserPermissions(created.id, permissions, role)

    await prisma.securityLog.create({
      data: {
        eventType: "USER_CREATED_WITH_PERMISSIONS",
        severity: "INFO",
        ipAddress: "127.0.0.1",
        email: created.email,
        details: `Created user ${created.name} with role ${role} and ${permissions.length} permissions.`,
      },
    })

    revalidatePath("/users")
    revalidatePath("/admin/users")
    revalidatePath("/admin/customers")

    const newUser: ManagedUserItem = {
      id: created.id,
      name: created.name,
      email: created.email,
      phone: created.phone,
      role: permRecord.roleLabel,
      dbRole: created.role,
      status: created.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
      imageUrl: created.imageUrl,
      permissions: permRecord.permissions,
      ordersCount: created._count?.orders || 0,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
    }

    return {
      success: true,
      message: "تم إضافة المستخدم وتعيين صلاحياته بنجاح!",
      user: newUser,
    }
  } catch (error: any) {
    console.error("Create user error:", error)
    return {
      success: false,
      error: error.message || "حدث خطأ أثناء إنشاء المستخدم.",
    }
  }
}

/**
 * تحديث بيانات مستخدم حالي وتعديل مصفوفة صلاحياته
 */
export async function updateUserAndPermissionsAction(
  userId: string,
  input: {
    name: string
    email: string
    phone?: string | null
    role: UserRoleType
    status: "ACTIVE" | "SUSPENDED"
    password?: string
    permissions: PermissionKey[]
  }
) {
  const validation = UpdateUserSchema.safeParse(input)
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.issues[0]?.message || "البيانات المدخلة غير صالحة",
    }
  }

  const { name, email, phone, role, status, password, permissions } = validation.data

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return {
        success: false,
        error: "المستخدم المطلوب غير موجود.",
      }
    }

    if (email !== existingUser.email.toLowerCase()) {
      const emailTaken = await prisma.user.findUnique({
        where: { email },
      })
      if (emailTaken && emailTaken.id !== userId) {
        return {
          success: false,
          error: "البريد الإلكتروني مستخدم بالفعل لحساب آخر.",
        }
      }
    }

    const dbRole = role === "USER" ? "USER" : "ADMIN"
    const updateData: any = {
      name,
      email,
      phone: phone || null,
      role: dbRole,
      status,
    }

    if (password && password.trim().length >= 8) {
      updateData.password = await bcrypt.hash(password.trim(), 10)
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        _count: {
          select: { orders: true },
        },
      },
    })

    const permRecord = setUserPermissions(userId, permissions, role)

    await prisma.securityLog.create({
      data: {
        eventType: "USER_PERMISSIONS_UPDATED",
        severity: "INFO",
        ipAddress: "127.0.0.1",
        email: updated.email,
        details: `Updated user ${updated.name} (role: ${role}, permissions: ${permissions.join(", ")})`,
      },
    })

    revalidatePath("/users")
    revalidatePath("/admin/users")
    revalidatePath("/admin/customers")

    const updatedItem: ManagedUserItem = {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phone: updated.phone,
      role: permRecord.roleLabel,
      dbRole: updated.role,
      status: updated.status === "SUSPENDED" ? "SUSPENDED" : "ACTIVE",
      imageUrl: updated.imageUrl,
      permissions: permRecord.permissions,
      ordersCount: updated._count?.orders || 0,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    }

    return {
      success: true,
      message: "تم تحديث بيانات المستخدم وصلاحياته بنجاح!",
      user: updatedItem,
    }
  } catch (error: any) {
    console.error("Update user permissions error:", error)
    return {
      success: false,
      error: error.message || "حدث خطأ أثناء تحديث المستخدم.",
    }
  }
}

/**
 * تبديل حالة المستخدم (نشط / موقوف)
 */
export async function toggleUserAccountStatusAction(userId: string, currentStatus: "ACTIVE" | "SUSPENDED") {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.id === userId) {
      return {
        success: false,
        error: "لا يمكنك إيقاف حسابك الشخصي المسجل دخوله حالياً.",
      }
    }

    const nextStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE"
    await prisma.user.update({
      where: { id: userId },
      data: { status: nextStatus },
    })

    revalidatePath("/users")
    revalidatePath("/admin/users")
    return {
      success: true,
      status: nextStatus as "ACTIVE" | "SUSPENDED",
    }
  } catch (error: any) {
    console.error("Toggle status error:", error)
    return {
      success: false,
      error: error.message || "فشل تحديث حالة الحساب.",
    }
  }
}

/**
 * حذف مستخدم نهائياً مع إزالة سجل صلاحياته
 */
export async function deleteManagedUserAction(userId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (session?.user?.id === userId) {
      return {
        success: false,
        error: "لا يمكنك حذف حسابك الشخصي المسجل دخوله حالياً.",
      }
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: { userId },
        data: { userId: null },
      })
      await tx.review.deleteMany({ where: { userId } })
      await tx.wishlistItem.deleteMany({ where: { userId } })
      await tx.abandonedCart.deleteMany({ where: { userId } })
      await tx.profile.deleteMany({ where: { userId } })
      await tx.user.delete({ where: { id: userId } })
    })

    deleteUserPermissions(userId)

    revalidatePath("/users")
    revalidatePath("/admin/users")
    revalidatePath("/admin/customers")

    return {
      success: true,
      message: "تم حذف المستخدم بنجاح.",
    }
  } catch (error: any) {
    console.error("Delete user error:", error)
    return {
      success: false,
      error: error.message || "فشل حذف المستخدم.",
    }
  }
}
