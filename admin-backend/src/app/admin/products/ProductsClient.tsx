"use client"

import { useState, useMemo } from "react"
import { Search, Filter, Edit, Trash2, Package, Copy, ExternalLink } from "lucide-react"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { deleteProduct, duplicateProduct } from "@/app/actions/product"
import { useLocaleStore } from "@/store/useLocaleStore"

type Product = {
  id: string
  name: string
  price: number
  stock: number
  imageUrl?: string | null
  category?: { name: string } | null
}

export function ProductsClient({ initialProducts }: { initialProducts: Product[] }) {
  const { t } = useLocaleStore()
  const [searchQuery, setSearchQuery] = useState("")

  const filteredProducts = useMemo(() => {
    return initialProducts.filter(product => 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, initialProducts])
  
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  const handleDuplicate = async (id: string) => {
    setIsDuplicating(id)
    const result = await duplicateProduct(id)
    setIsDuplicating(null)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  const confirmDelete = async () => {
    if (!productToDelete) return;
    const id = productToDelete.id;
    setIsDeleting(id)
    setProductToDelete(null)
    
    const result = await deleteProduct(id)
    setIsDeleting(null)
    if (result.success) {
      router.refresh()
    } else {
      alert(result.error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("products.title", "Products")}</h1>
          <p className="text-muted-foreground text-sm">{t("products.subtitle", "Manage your store's inventory and product listings.")}</p>
        </div>
        <Link href="/admin/products/new" className={buttonVariants()}>{t("products.add", "Add Product")}</Link>
      </div>

      <Card>
        <CardHeader className="py-4 bg-muted/20 border-b">
          <div className="flex justify-between items-center">
            <div className="relative w-64">
              <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                type="search"
                placeholder={t("products.search", "Search products...")}
                className="ps-9 pe-3 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 me-2" />
              {t("common.filter", "Filter")}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>{t("products.product", "Product")}</TableHead>
                <TableHead>{t("products.category", "Category")}</TableHead>
                <TableHead>{t("products.price", "Price")}</TableHead>
                <TableHead>{t("products.inventory", "Inventory")}</TableHead>
                <TableHead>{t("products.status", "Status")}</TableHead>
                <TableHead className="text-end">{t("products.action", "Action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="hover:bg-muted/30">
                    <TableCell>
                      <Link
                        href={`/admin/products/${encodeURIComponent(product.id)}/edit`}
                        className="flex items-center gap-3 group"
                      >
                        <div className="flex h-10 w-10 overflow-hidden items-center justify-center rounded bg-muted/50 border text-muted-foreground shrink-0 group-hover:border-primary/50 transition-colors">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <Package className="h-5 w-5" />
                          )}
                        </div>
                        <span className="font-medium group-hover:text-primary transition-colors">{product.name}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{product.category?.name || t("products.uncategorized", "Uncategorized")}</TableCell>
                    <TableCell className="font-medium">${product.price.toFixed(2)}</TableCell>
                    <TableCell className={product.stock === 0 ? "text-destructive font-medium" : ""}>
                      {product.stock} {t("products.in_stock", "in stock")}
                    </TableCell>
                    <TableCell>
                      {product.stock > 0 ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">{t("products.active", "Active")}</Badge>
                      ) : (
                        <Badge variant="secondary">{t("products.out_of_stock", "Out of Stock")}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-end">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`http://localhost:3001/store/products/${encodeURIComponent(product.id)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-primary"
                            title={t("nav.view_store", "View in Store")}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-primary"
                          onClick={() => handleDuplicate(product.id)}
                          disabled={isDuplicating === product.id}
                          title={t("products.duplicate", "Duplicate Product")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Link href={`/admin/products/${encodeURIComponent(product.id)}/edit`}>
                          <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" title={t("common.edit", "Edit")}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => setProductToDelete(product)}
                          disabled={isDeleting === product.id}
                          title={t("common.delete", "Delete")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {t("products.no_products_found", "No products found matching your search.")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {productToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-lg font-semibold mb-2">{t("products.delete_modal_title", "Delete Product")}</h2>
            <p className="text-muted-foreground mb-6">
              {t("products.delete_modal_desc", "Are you sure you want to delete this product? This action cannot be undone.")} <span className="font-semibold text-foreground">({productToDelete.name})</span>
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setProductToDelete(null)} disabled={isDeleting === productToDelete.id}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting === productToDelete.id}>
                {isDeleting === productToDelete.id ? t("products.deleting", "Deleting...") : t("common.delete", "Delete")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
