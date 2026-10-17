import { redirect } from "next/navigation"

// إعادة توجيه المسار /admin/products/[id] تلقائياً إلى صفحة تفاصيل وتعديل المنتج لمنع خطأ 404
export default async function AdminProductDetailsRedirectPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  redirect(`/admin/products/${encodeURIComponent(id)}/edit`)
}
