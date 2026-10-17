import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { PrismaClient } from "@prisma/client"
import { Package, User, LogOut, Settings, Eye } from "lucide-react"
import Link from "next/link"

const prisma = new PrismaClient()

export default async function CustomerOrdersPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect("/store/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      orders: {
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      }
    }
  })

  if (!user) {
    redirect("/store/login")
  }

  return (
    <div className="container mx-auto px-4 py-12 min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8" dir="rtl">طلباتي 📦</h1>

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
                <Link href="/store/dashboard/orders" className="flex items-center gap-3 p-3 bg-[#ff2d55]/5 text-[#ff2d55] rounded-lg font-medium transition-colors">
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
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6" dir="rtl">سجل الطلبات</h2>

              {user.orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">لا توجد طلبات سابقة حتى الآن.</p>
                  <Link href="/store/products" className="inline-block mt-4 text-[#ff2d55] font-medium hover:underline">
                    تصفح المنتجات
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {user.orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg overflow-hidden" dir="rtl">
                      {/* Order Header */}
                      <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-6">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">رقم الطلب</p>
                            <p className="font-semibold text-gray-900">{order.orderNumber}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">التاريخ</p>
                            <p className="font-semibold text-gray-900">{new Date(order.createdAt).toLocaleDateString('ar-EG')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">الإجمالي</p>
                            <p className="font-semibold text-gray-900">${Number(order.total).toFixed(2)}</p>
                          </div>
                        </div>
                        <div>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status === 'PENDING' ? 'قيد الانتظار' : order.status}
                          </span>
                        </div>
                      </div>

                      {/* Order Items */}
                      <div className="p-4">
                        <div className="space-y-4">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden border border-gray-200 shrink-0">
                                <img 
                                  src={item.product.imageUrl || `https://picsum.photos/seed/${item.productId}/100/100`} 
                                  alt={item.product.name} 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <div className="flex-1">
                                <Link href={`/store/products/${item.productId}`} className="font-medium text-gray-900 hover:text-[#ff2d55] transition-colors">
                                  {item.product.name}
                                </Link>
                                <p className="text-sm text-gray-500 mt-1">الكمية: {item.quantity}</p>
                              </div>
                              <div className="font-bold text-gray-900">
                                ${(Number(item.price) * item.quantity).toFixed(2)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
