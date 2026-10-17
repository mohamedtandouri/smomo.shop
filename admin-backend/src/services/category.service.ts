import { prisma } from "@/lib/db"

export interface CreateCategoryInput {
  name: string
  description?: string | null
  imageUrl?: string | null
}

export class CategoryService {
  static async getCategories() {
    return prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { products: true },
        },
      },
    })
  }

  static async getCategoryById(id: string) {
    return prisma.category.findUnique({
      where: { id },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            imageUrl: true,
          },
        },
      },
    })
  }

  static async createCategory(data: CreateCategoryInput) {
    return prisma.category.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        imageUrl: data.imageUrl || null,
      },
    })
  }

  static async updateCategory(id: string, data: Partial<CreateCategoryInput>) {
    return prisma.category.update({
      where: { id },
      data: {
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
        ...(data.imageUrl !== undefined ? { imageUrl: data.imageUrl || null } : {}),
      },
    })
  }

  static async deleteCategory(id: string) {
    return prisma.$transaction(async (tx) => {
      // فك ارتباط المنتجات من التصنيف بدلاً من حذف المنتجات
      await tx.product.updateMany({
        where: { categoryId: id },
        data: { categoryId: null },
      })

      return tx.category.delete({
        where: { id },
      })
    })
  }
}
