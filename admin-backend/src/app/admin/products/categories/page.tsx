import { prisma } from "@/lib/db"
import { CategoriesClient } from "./CategoriesClient"

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true }
      }
    }
  })

  const formattedCategories = categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    description: cat.description,
    imageUrl: cat.imageUrl,
    productsCount: cat._count.products
  }))

  return <CategoriesClient initialCategories={formattedCategories} />
}
