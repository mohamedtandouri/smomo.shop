"use client"

import { useState } from "react"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { createCategory, updateCategory, deleteCategory } from "@/app/actions/category"
import { useLocaleStore } from "@/store/useLocaleStore"

type Category = {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  productsCount: number
}

export function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const { t } = useLocaleStore()
  const [categories, setCategories] = useState(initialCategories)
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [categoryToEdit, setCategoryToEdit] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null)
  
  const [isProcessing, setIsProcessing] = useState(false)

  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsProcessing(true)
    const formData = new FormData(e.currentTarget)
    const result = await createCategory(formData)
    if (result.success && result.category) {
      setCategories([...categories, { ...result.category, productsCount: 0 }])
      setIsCreateModalOpen(false)
    } else {
      alert(result.error)
    }
    setIsProcessing(false)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!categoryToEdit) return
    
    setIsProcessing(true)
    const formData = new FormData(e.currentTarget)
    const result = await updateCategory(categoryToEdit.id, formData)
    if (result.success && result.category) {
      setCategories(categories.map(c => c.id === categoryToEdit.id ? { ...c, ...result.category } : c))
      setCategoryToEdit(null)
    } else {
      alert(result.error)
    }
    setIsProcessing(false)
  }

  const confirmDelete = async () => {
    if (!categoryToDelete) return
    setIsProcessing(true)
    const result = await deleteCategory(categoryToDelete.id)
    if (result.success) {
      setCategories(categories.filter(c => c.id !== categoryToDelete.id))
      setCategoryToDelete(null)
    } else {
      alert(result.error)
    }
    setIsProcessing(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("categories.title", "Categories")}</h1>
          <p className="text-muted-foreground text-sm">{t("categories.subtitle", "Organize your products into categories.")}</p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="me-2 h-4 w-4" /> {t("categories.add", "Add Category")}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-16 text-center">{t("categories.image", "Image")}</TableHead>
                <TableHead>{t("categories.name", "Name")}</TableHead>
                <TableHead>{t("categories.description", "Description")}</TableHead>
                <TableHead>{t("categories.products", "Products")}</TableHead>
                <TableHead className="text-end">{t("common.actions", "Action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.length > 0 ? (
                categories.map(category => (
                  <TableRow key={category.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="w-10 h-10 rounded-md overflow-hidden bg-muted/50 border flex items-center justify-center shrink-0 mx-auto">
                        {category.imageUrl ? (
                          <img src={category.imageUrl} alt={category.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.description || "-"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{category.productsCount} {t("products.product", "items")}</Badge>
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => setCategoryToEdit(category)} title={t("common.edit", "Edit")}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" onClick={() => setCategoryToDelete(category)} title={t("common.delete", "Delete")}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {t("categories.no_categories", "No categories found.")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{t("categories.add", "Create Category")}</h2>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("categories.name", "Category Name")}</label>
                <Input name="name" required placeholder={t("categories.name", "e.g. Electronics")} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("categories.description", "Description (Optional)")}</label>
                <Input name="description" placeholder="..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("categories.image", "Category Image (Optional)")}</label>
                <Input name="image" type="file" accept="image/*" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)} disabled={isProcessing}>
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? t("common.loading", "Saving...") : t("common.save", "Create")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {categoryToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-4">{t("common.edit", "Edit Category")}</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("categories.name", "Category Name")}</label>
                <Input name="name" defaultValue={categoryToEdit.name} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("categories.description", "Description (Optional)")}</label>
                <Input name="description" defaultValue={categoryToEdit.description || ""} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("categories.image", "Update Category Image (Optional)")}</label>
                <Input name="image" type="file" accept="image/*" />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setCategoryToEdit(null)} disabled={isProcessing}>
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? t("common.loading", "Saving...") : t("common.save", "Save Changes")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-2 text-destructive">{t("common.delete", "Delete Category")}</h2>
            <p className="text-muted-foreground mb-6">
              {categoryToDelete.name}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCategoryToDelete(null)} disabled={isProcessing}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isProcessing}>
                {isProcessing ? t("common.loading", "Deleting...") : t("common.delete", "Delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
