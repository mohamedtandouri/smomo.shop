import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { Package, User, LogOut, Settings } from "lucide-react"
import Link from "next/link"

const prisma = new PrismaClient()

export default async function CustomerDashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/store/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      orders: {
        orderBy: { createdAt: 'desc' },
        take: 5 // Get last 5 orders
      }
    }
  })

  if (!user) {
    redirect("/store/login")
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8" dir="rtl">مرحباً، {user.name} 👋</h1>

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
                <Link href="/store/dashboard" className="flex items-center gap-3 p-3 bg-[#ff2d55]/5 text-[#ff2d55] rounded-lg font-medium transition-colors">
                  <User className="w-5 h-5" />
                  الملف الشخصي
                </Link>
                <Link href="/store/dashboard/orders" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
                  <Package className="w-5 h-5" />
                  طلباتي
                </Link>
                <Link href="/store/dashboard/settings" className="flex items-center gap-3 p-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg font-medium transition-colors">
                  <Settings className="w-5 h-5" />
                  الإعدادات
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">إجمالي الطلبات</p>
                  <p className="text-2xl font-bold text-gray-900">{user.orders.length}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">عضو منذ</p>
                  <p className="text-lg font-bold text-gray-900">
                    {new Date(user.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">أحدث الطلبات</h2>
                <Link href="/store/dashboard/orders" className="text-[#ff2d55] text-sm hover:underline font-medium">
                  عرض الكل
                </Link>
              </div>

              {user.orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">لا توجد طلبات سابقة حتى الآن.</p>
                  <Link href="/store/products" className="inline-block mt-4 text-[#ff2d55] font-medium hover:underline">
                    تصفح المنتجات
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse" dir="rtl">
                    <thead>
                      <tr className="border-b border-gray-200 text-gray-500 text-sm">
                        <th className="pb-3 font-medium">رقم الطلب</th>
                        <th className="pb-3 font-medium">التاريخ</th>
                        <th className="pb-3 font-medium">الحالة</th>
                        <th className="pb-3 font-medium">الإجمالي</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {user.orders.map((order) => (
                        <tr key={order.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                          <td className="py-4 font-medium text-gray-900">{order.orderNumber}</td>
                          <td className="py-4 text-gray-600">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                          <td className="py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                              order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status === 'PENDING' ? 'قيد الانتظار' : order.status}
                            </span>
                          </td>
                          <td className="py-4 font-bold text-gray-900">${order.total.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
