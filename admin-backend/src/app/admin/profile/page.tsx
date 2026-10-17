import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getAdminProfileData } from "@/app/actions/auth"
import ProfileClient from "./ProfileClient"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "الملف الشخصي للمسؤول · Admin Profile",
  description: "عرض وتعديل بيانات حساب الإدارة ومراقبة سجلات الأمان",
}

export default async function AdminProfilePage() {
  const session = await getServerSession(authOptions)

  // حماية المسار: التحقق من تسجيل الدخول وامتلاك دور ADMIN
  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    redirect("/admin/login?callbackUrl=/admin/profile")
  }

  const profileData = await getAdminProfileData(session.user.email!)

  if (!profileData) {
    redirect("/admin/login")
  }

  return <ProfileClient data={profileData} />
}
