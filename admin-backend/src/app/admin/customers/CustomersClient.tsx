"use client"

import { useState, useMemo } from "react"
import { Search, Filter, Trash2, Edit, Ban, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
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
import { deleteCustomer, toggleCustomerStatus, updateCustomer } from "@/app/actions/customer"
import { useLocaleStore } from "@/store/useLocaleStore"

type Customer = {
  id: string
  name: string
  email: string
  status: string
  imageUrl?: string | null
  ordersCount: number
  totalSpent: number
}

export function CustomersClient({ initialCustomers }: { initialCustomers: Customer[] }) {
  const { t } = useLocaleStore()
  const [customers, setCustomers] = useState(initialCustomers)
  const [searchQuery, setSearchQuery] = useState("")

  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null)
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null)
  
  const [isProcessing, setIsProcessing] = useState<string | null>(null)

  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [searchQuery, customers])

  const handleToggleStatus = async (customer: Customer) => {
    setIsProcessing(customer.id)
    const result = await toggleCustomerStatus(customer.id, customer.status)
    if (result.success) {
      setCustomers(customers.map(c => c.id === customer.id ? { ...c, status: result.status as string } : c))
    } else {
      alert(result.error)
    }
    setIsProcessing(null)
  }

  const confirmDelete = async () => {
    if (!customerToDelete) return
    setIsProcessing(customerToDelete.id)
    const id = customerToDelete.id
    setCustomerToDelete(null)
    
    const result = await deleteCustomer(id)
    if (result.success) {
      setCustomers(customers.filter(c => c.id !== id))
    } else {
      alert(result.error)
    }
    setIsProcessing(null)
  }

  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!customerToEdit) return
    
    setIsProcessing(customerToEdit.id)
    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string

    const result = await updateCustomer(customerToEdit.id, { name, email })
    if (result.success) {
      setCustomers(customers.map(c => c.id === customerToEdit.id ? { ...c, name, email } : c))
      setCustomerToEdit(null)
    } else {
      alert(result.error)
    }
    setIsProcessing(null)
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t("customers.title", "Customers")}</h1>
          <p className="text-muted-foreground text-sm">{t("customers.subtitle", "Manage your customer database and view their purchase history.")}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4 bg-muted/20 border-b">
          <div className="flex justify-between items-center">
            <div className="relative w-64">
              <Search className="absolute start-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t("customers.search_placeholder", "Search customers...")}
                className="ps-9 bg-background"
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
                <TableHead>{t("customers.customer", "Customer")}</TableHead>
                <TableHead>{t("orders.customer_email", "Email")}</TableHead>
                <TableHead>{t("customers.orders", "Orders")}</TableHead>
                <TableHead>{t("customers.total_spent", "Total Spent")}</TableHead>
                <TableHead>{t("customers.status", "Status")}</TableHead>
                <TableHead className="text-end">{t("customers.actions", "Action")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className={`hover:bg-muted/30 ${customer.status === 'SUSPENDED' ? 'opacity-70' : ''}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {customer.imageUrl ? (
                          <img src={customer.imageUrl} alt={customer.name} className="h-8 w-8 rounded-full object-cover border" />
                        ) : (
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs border">
                            {getInitials(customer.name)}
                          </div>
                        )}
                        <span className="font-medium">{customer.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                    <TableCell>{customer.ordersCount}</TableCell>
                    <TableCell className="font-medium">${customer.totalSpent.toFixed(2)}</TableCell>
                    <TableCell>
                      {customer.status === "ACTIVE" ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
                          {t("customers.status_active", "Active")}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-100 text-red-800 hover:bg-red-100">
                          {t("customers.status_blocked", "Suspended")}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-end flex justify-end gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => handleToggleStatus(customer)}
                        disabled={isProcessing === customer.id}
                        title={customer.status === 'ACTIVE' ? 'Suspend Account' : 'Activate Account'}
                      >
                        {customer.status === 'ACTIVE' ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4 text-green-600" />}
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-primary"
                        onClick={() => setCustomerToEdit(customer)}
                        disabled={isProcessing === customer.id}
                        title={t("common.edit", "Edit")}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setCustomerToDelete(customer)}
                        disabled={isProcessing === customer.id}
                        title={t("common.delete", "Delete")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    {t("customers.no_customers", "No customers found.")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-lg font-semibold mb-2">{t("customers.delete_title", "Delete Customer")}</h2>
            <p className="text-muted-foreground mb-6">
              {t("customers.delete_confirm", "Are you sure you want to permanently delete this customer?")}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setCustomerToDelete(null)} disabled={isProcessing === customerToDelete.id}>
                {t("common.cancel", "Cancel")}
              </Button>
              <Button variant="destructive" onClick={confirmDelete} disabled={isProcessing === customerToDelete.id}>
                {isProcessing === customerToDelete.id ? t("products.deleting", "Deleting...") : t("common.delete", "Delete")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {customerToEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
            <h2 className="text-lg font-semibold mb-4">{t("customers.edit_title", "Edit Customer")}</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t("orders.customer_name", "Full Name")}</label>
                <Input name="name" defaultValue={customerToEdit.name} required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t("orders.customer_email", "Email Address")}</label>
                <Input name="email" type="email" defaultValue={customerToEdit.email} required />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <Button type="button" variant="outline" onClick={() => setCustomerToEdit(null)} disabled={isProcessing === customerToEdit.id}>
                  {t("common.cancel", "Cancel")}
                </Button>
                <Button type="submit" disabled={isProcessing === customerToEdit.id}>
                  {isProcessing === customerToEdit.id ? t("common.loading", "Saving...") : t("common.save", "Save Changes")}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
