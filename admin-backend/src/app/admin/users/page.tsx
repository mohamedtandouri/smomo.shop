import { getUsersWithPermissionsAction } from "@/app/actions/users"
import { UsersClient } from "./UsersClient"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "إدارة المستخدمين والصلاحيات · User Management",
  description: "إدارة المستخدمين، الأدوار الوظيفية، ومصفوفة صلاحيات الوصول",
}

export default async function AdminUsersPage() {
  const users = await getUsersWithPermissionsAction()

  return <UsersClient initialUsers={users} />
}
