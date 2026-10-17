import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { Package, User, LogOut, Settings } from "lucide-react"
import Link from "next/link"
import { SettingsForm } from "./SettingsForm"

const prisma = new PrismaClient()

export default async function CustomerSettingsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/store/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
    }
  })

  if (!user) {
    redirect("/store/login")
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8" dir="rtl">الإعدادات ⚙️</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-[#ff2d55]/10 text-[#ff2d55] rounded-full flex items-center justify-center font-bold text-xl">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                <Link href="/store/dashboard" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
                  <User className="w-5 h-5" />
                  الملف الشخصي
                </Link>
                <Link href="/store/dashboard/orders" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
                  <Package className="w-5 h-5" />
                  طلباتي
                </Link>
                <Link href="/store/dashboard/settings" className="flex items-center gap-3 p-3 bg-[#ff2d55]/5 text-[#ff2d55] rounded-lg font-medium transition-colors">
                  <Settings className="w-5 h-5" />
                  الإعدادات
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm" dir="rtl">
              <h2 className="text-xl font-bold text-gray-900 mb-6">المعلومات الشخصية</h2>
              
              <SettingsForm 
                user={{
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  phone: user.phone || "",
                }}
                profile={{
                  address: user.profile?.address || "",
                  city: user.profile?.city || "",
                  zipCode: user.profile?.zipCode || "",
                  country: user.profile?.country || "",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
