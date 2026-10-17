"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  FileText,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Check,
  Search,
  RefreshCw,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

interface StorePage {
  id: string
  title: string
  slug: string
  content?: string
  status: "published" | "draft"
  lastUpdated: string
}

export default function PagesManagerPage() {
  const [pages, setPages] = useState<StorePage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const [pageTitle, setPageTitle] = useState("")
  const [pageSlug, setPageSlug] = useState("")
  const [pageContent, setPageContent] = useState("")
  const [pageStatus, setPageStatus] = useState<"published" | "draft">("published")
  const [isSaving, setIsSaving] = useState(false)

  // Delete modal
  const [pageToDelete, setPageToDelete] = useState<StorePage | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchPages = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch("/api/store/pages")
      const data = await res.json()
      if (data.success && Array.isArray(data.pages)) {
        setPages(data.pages)
      } else {
        toast.error("Failed to load store pages")
      }
    } catch (err) {
      console.error("Error fetching pages:", err)
      toast.error("Network error while loading pages")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingPageId(null)
    setPageTitle("")
    setPageSlug("")
    setPageContent("")
    setPageStatus("published")
    setIsModalOpen(true)
  }

  // Open Edit Modal
  const handleOpenEdit = (p: StorePage) => {
    setEditingPageId(p.id)
    setPageTitle(p.title)
    setPageSlug(p.slug)
    setPageContent(p.content || "")
    setPageStatus(p.status)
    setIsModalOpen(true)
  }

  // Save Page (Create or Update)
  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pageTitle.trim()) {
      toast.error("Page title is required")
      return
    }

    try {
      setIsSaving(true)
      const url = editingPageId ? `/api/store/pages/${editingPageId}` : "/api/store/pages"
      const method = editingPageId ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: pageTitle.trim(),
          slug: pageSlug.trim() || undefined,
          content: pageContent.trim(),
          status: pageStatus,
        }),
      })

      const data = await res.json()
      if (data.success) {
        toast.success(editingPageId ? "Page updated successfully" : "Page created successfully")
        setIsModalOpen(false)
        fetchPages()
      } else {
        toast.error(data.error || "Failed to save page")
      }
    } catch (err: any) {
      toast.error(err.message || "Network error while saving page")
    } finally {
      setIsSaving(false)
    }
  }

  // Delete Page
  const handleDeletePage = async () => {
    if (!pageToDelete) return
    try {
      setIsDeleting(true)
      const res = await fetch(`/api/store/pages/${pageToDelete.id}`, {
        method: "DELETE",
      })
      const data = await res.json()
      if (data.success) {
        toast.success("Page deleted successfully")
        setPageToDelete(null)
        fetchPages()
      } else {
        toast.error(data.error || "Failed to delete page")
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete page")
    } finally {
      setIsDeleting(false)
    }
  }

  const filteredPages = pages.filter((p) => {
    const q = searchQuery.toLowerCase().trim()
    return q === "" || p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Static Pages & Legal Content
          </h1>
          <p className="text-muted-foreground text-sm">
            Live database management for store information pages, privacy policy, and terms of service.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => fetchPages()} disabled={isLoading} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleOpenCreate} className="gap-2 bg-primary">
            <Plus className="h-4 w-4" />
            Add New Page
          </Button>
        </div>
      </div>

      {/* Pages Card */}
      <Card>
        <CardHeader className="py-4 bg-muted/20 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-base font-semibold">Store Pages Library</CardTitle>
              <CardDescription className="text-xs">
                {pages.length} total pages persisted in system storage
              </CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search pages by title or slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background w-full"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 flex flex-col justify-center items-center gap-3 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm">Loading store pages...</p>
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="text-sm font-medium">No pages found matching your search</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Page Title</TableHead>
                  <TableHead>Slug / URL Path</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Modified</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPages.map((page) => (
                  <TableRow key={page.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        {page.title}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      /store/{page.slug}
                    </TableCell>
                    <TableCell>
                      {page.status === "published" ? (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          Published
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground">
                          Draft
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{page.lastUpdated}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`http://localhost:3001/store/${page.slug}`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" title="Preview Page">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Edit Page"
                          onClick={() => handleOpenEdit(page)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          title="Delete Page"
                          onClick={() => setPageToDelete(page)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingPageId ? "Edit Page" : "Add New Page"}</DialogTitle>
            <DialogDescription>
              Custom pages are instantly accessible on your storefront.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSavePage} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-foreground">Page Title *</label>
              <Input
                required
                placeholder="e.g. Return Policy"
                value={pageTitle}
                onChange={(e) => {
                  setPageTitle(e.target.value)
                  if (!editingPageId) {
                    setPageSlug(e.target.value.toLowerCase().replace(/[\s_]+/g, "-").replace(/[^a-z0-9-]/g, ""))
                  }
                }}
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">URL Slug</label>
              <Input
                placeholder="e.g. return-policy"
                value={pageSlug}
                onChange={(e) => setPageSlug(e.target.value)}
                className="mt-1 font-mono text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Publication Status</label>
              <select
                value={pageStatus}
                onChange={(e) => setPageStatus(e.target.value as "published" | "draft")}
                className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="published">Published</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Page Content</label>
              <textarea
                rows={5}
                placeholder="Enter page content or markdown text..."
                value={pageContent}
                onChange={(e) => setPageContent(e.target.value)}
                className="w-full mt-1 rounded-md border border-input bg-background p-3 text-sm shadow-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="gap-2">
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editingPageId ? "Save Changes" : "Create Page"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={!!pageToDelete} onOpenChange={(open) => !open && setPageToDelete(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Page</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete "{pageToDelete?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button variant="outline" onClick={() => setPageToDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" disabled={isDeleting} onClick={handleDeletePage} className="gap-2">
              {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete Page
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
