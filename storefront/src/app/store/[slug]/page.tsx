import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getCustomPages } from "@/lib/store-storage"
import { db } from "@/lib/db"
import { ArrowLeft, Calendar, FileText } from "lucide-react"

// إجبار التحديث الديناميكي لعرض الصفحات المضافة أو المعدلة من لوحة التحكم فوراً
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function CustomStorePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const decodedSlug = decodeURIComponent(slug || "").trim()
  const pages = getCustomPages()

  // البحث عن الصفحة المطابقة للـ slug والتي حالتها Published
  const page = pages.find(
    (p) => p.slug.toLowerCase() === decodedSlug.toLowerCase() && String(p.status).toLowerCase() === "published"
  )

  if (!page) {
    // في حال تم توجيه المستخدم إلى /store/:id مباشرة لمنتج، نعيد توجيهه إلى صفحة تفاصيل المنتج الصحيحة
    if (decodedSlug && decodedSlug.length <= 128 && !/[\0<>;"'`\\]/.test(decodedSlug)) {
      const matchedProduct = await db.product
        .findFirst({
          where: {
            OR: [
              { id: decodedSlug },
              { sku: decodedSlug },
              { name: decodedSlug },
              { name: decodedSlug.replace(/-/g, " ").trim() },
            ],
          },
          select: { id: true },
        })
        .catch(() => null)

      if (matchedProduct) {
        redirect(`/store/products/${encodeURIComponent(matchedProduct.id)}`)
      }
    }

    notFound()
  }

  const displayDate = page.updatedAt || page.lastUpdated

  return (
    <div className="min-h-[70vh] bg-[#fafafa] py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Store</span>
          </Link>
        </div>

        <article className="bg-white rounded-2xl border border-gray-200 shadow-xs p-8 md:p-12 space-y-6">
          <header className="border-b border-gray-100 pb-6 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-[#ff2d55] text-xs font-semibold">
              <FileText className="w-3.5 h-3.5" />
              <span>Store Page</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">
              {page.title}
            </h1>
            {displayDate && (
              <p className="text-xs text-gray-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>Last updated: {displayDate}</span>
              </p>
            )}
          </header>

          <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed whitespace-pre-wrap text-base">
            {page.content}
          </div>
        </article>
      </div>
    </div>
  )
}
