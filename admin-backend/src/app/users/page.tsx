import { getUsersWithPermissionsAction } from "@/app/actions/users"
import { DashboardLayout } from "@/components/layout/DashboardLayout"
import { UsersClient } from "@/app/admin/users/UsersClient"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "إدارة المستخدمين والصلاحيات · User Management",
  description: "إدارة المستخدمين، الأدوار الوظيفية، ومصفوفة صلاحيات الوصول",
}

export default async function UsersPage() {
  const users = await getUsersWithPermissionsAction()

  return (
    <DashboardLayout>
      <UsersClient initialUsers={users} />
    </DashboardLayout>
  )
}
