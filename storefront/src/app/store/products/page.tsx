import Link from "next/link"
import { prisma } from "@/lib/db"
import { ProductPrice } from "@/components/storefront/ProductPrice"

// ضمان جلب أحدث المنتجات والتصنيفات مباشرة من قاعدة البيانات المشتركة
export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams
  const categoryId = resolvedParams.category as string | undefined
  const sort = resolvedParams.sort as string | undefined
  
  // Fetch categories for filter sidebar
  const categories = await prisma.category.findMany()

  // Determine Prisma sorting
  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'price_asc') orderBy = { price: 'asc' }
  if (sort === 'price_desc') orderBy = { price: 'desc' }
  if (sort === 'popular') orderBy = { views: 'desc' }

  // Fetch products
  const products = await prisma.product.findMany({
    where: categoryId ? { categoryId } : undefined,
    orderBy,
    include: { category: true }
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
        <p className="text-gray-500">Showing {products.length} result{products.length !== 1 && 's'}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-6">
          <div className="bg-white p-5 border border-gray-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link 
                  href={`/store/products${sort ? `?sort=${sort}` : ''}`}
                  className={`text-sm ${!categoryId ? 'text-[#ff2d55] font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  All Categories
                </Link>
              </li>
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link 
                    href={`/store/products?category=${cat.id}${sort ? `&sort=${sort}` : ''}`}
                    className={`text-sm ${categoryId === cat.id ? 'text-[#ff2d55] font-medium' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Top Actions */}
          <div className="flex justify-between items-center mb-6 bg-white p-3 border border-gray-200 rounded-lg">
            <div className="text-sm text-gray-500 hidden sm:block">
              Sort by:
            </div>
            <div className="flex gap-2">
              <Link 
                href={`/store/products?${categoryId ? `category=${categoryId}&` : ''}sort=newest`}
                className={`px-3 py-1.5 text-xs font-medium rounded ${(!sort || sort === 'newest') ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Newest
              </Link>
              <Link 
                href={`/store/products?${categoryId ? `category=${categoryId}&` : ''}sort=price_asc`}
                className={`px-3 py-1.5 text-xs font-medium rounded ${sort === 'price_asc' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Price: Low to High
              </Link>
              <Link 
                href={`/store/products?${categoryId ? `category=${categoryId}&` : ''}sort=price_desc`}
                className={`px-3 py-1.5 text-xs font-medium rounded ${sort === 'price_desc' ? 'bg-gray-100 text-gray-900' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                Price: High to Low
              </Link>
            </div>
          </div>

          {/* Product Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 border border-gray-200 rounded-lg border-dashed">
              <p className="text-gray-500">No products found matching your criteria.</p>
              <Link href="/store/products" className="text-[#ff2d55] font-medium mt-2 inline-block hover:underline">Clear Filters</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Link href={`/store/products/${encodeURIComponent(product.id)}`} key={product.id} className="group block">
                  <div className="border border-gray-200 rounded-lg overflow-hidden bg-white hover:shadow-xl hover:border-[#ff2d55]/30 transition-all duration-300 flex flex-col h-full">
                    <div suppressHydrationWarning className="aspect-square bg-gray-100 relative overflow-hidden">
                      <div
                        role="img"
                        aria-label={product.name}
                        suppressHydrationWarning
                        className="bg-cover bg-center w-full h-full group-hover:scale-105 transition-transform duration-500"
                        style={{
                          backgroundImage: `url("${product.imageUrl || `https://picsum.photos/seed/${product.id}/400/400`}")`,
                        }}
                      />
                      {product.stock <= 5 && product.stock > 0 && (
                        <div className="absolute top-2 left-2 bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-1 rounded">
                          Only {product.stock} left
                        </div>
                      )}
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
                      {product.category && (
                        <p className="text-xs text-gray-500 mb-2">{product.category.name}</p>
                      )}
                      <div className="mt-auto pt-2 flex items-center justify-between">
                        <ProductPrice price={Number(product.price)} />
                        {product.stock === 0 && (
                          <span className="text-xs text-red-500 font-medium">Out of stock</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
