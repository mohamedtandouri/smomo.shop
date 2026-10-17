import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { getAdminProfileData } from "@/app/actions/auth"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import ProfileClient from "@/app/admin/profile/ProfileClient"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "الملف الشخصي · User Profile",
  description: "عرض وتعديل بيانات الملف الشخصي، الصورة الرمزية، وكلمة المرور",
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user || (session.user as any).role !== "ADMIN") {
    redirect("/admin/login?callbackUrl=/profile")
  }

  const identifier = (session.user as any).id || session.user.email!
  const profileData = await getAdminProfileData(identifier)

  if (!profileData) {
    redirect("/admin/login")
  }

  return (
    <DashboardLayout>
      <ProfileClient data={profileData} />
    </DashboardLayout>
  )
}
