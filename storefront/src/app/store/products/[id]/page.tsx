import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { ProductView } from "@/components/storefront/ProductView"

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params

  const product = await db.product.findUnique({
    where: { id: resolvedParams.id },
    include: {
      category: true,
      reviews: {
        orderBy: { createdAt: "desc" },
      },
    },
  })

  if (!product) {
    notFound()
  }

  // اقتراحات لمنتجات ذات صلة (Cross-selling / Up-selling)
  const relatedProducts = await db.product.findMany({
    where: {
      id: { not: product.id },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
    },
  })

  const serializedProduct = {
    ...product,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
  }

  const serializedRelated = relatedProducts.map((p) => ({
    ...p,
    price: Number(p.price),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
  }))

  return (
    <ProductView
      product={serializedProduct}
      relatedProducts={serializedRelated}
      initialReviews={product.reviews}
    />
  )
}
