"use client"

import { useState, useEffect, useTransition } from "react"
import { getOrders, updateOrderStatus, createManualOrder, getProducts } from "@/lib/admin/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Printer, MessageCircle, Plus, Search, Filter } from "lucide-react"

export function OrdersContent() {
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  // New manual order form state
  const [newOrderForm, setNewOrderForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    shipping_address: "",
    city: "",
    governorate: "Tunis",
    shipping_fee: 7.00,
    product_id: "",
    quantity: 1,
    size: "A4",
    frame: "None",
    price: 0
  })

  useEffect(() => {
    async function loadData() {
      try {
        const [ordersData, productsData] = await Promise.all([getOrders(), getProducts()])
        setOrders(ordersData || [])
        setProducts(productsData || [])
      } catch (err) {
        console.error("Failed to load orders/products", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    startTransition(async () => {
      await updateOrderStatus(orderId, newStatus)
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    })
  }

  const handlePrintOrder = (order: any) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Sheet - #${order.id.slice(0, 8)}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; color: #171717; }
            h1 { color: #FF4500; margin-bottom: 5px; }
            .section { margin-bottom: 20px; border-bottom: 1px solid #ddd; padding-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .total { font-weight: bold; font-size: 1.1em; text-align: right; margin-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Stikky Fulfillment Sheet</h1>
          <p><strong>Order ID:</strong> ${order.id}</p>
          <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleDateString()}</p>
          
          <div class="section">
            <h3>Customer Information</h3>
            <p><strong>Name:</strong> ${order.customer_name}</p>
            <p><strong>Phone:</strong> ${order.customer_phone}</p>
            <p><strong>Address:</strong> ${order.shipping_address}, ${order.city}, ${order.governorate}</p>
          </div>

          <div class="section">
            <h3>Products</h3>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Size</th>
                  <th>Frame</th>
                  <th>Qty</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                ${order.order_items?.map((item: any) => `
                  <tr>
                    <td>${item.products?.name || 'Custom Design'}</td>
                    <td>${item.size || 'N/A'}</td>
                    <td>${item.frame || 'N/A'}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price} TND</td>
                  </tr>
                `).join('') || ''}
              </tbody>
            </table>
            <div class="total">
              Subtotal: ${order.subtotal} TND | Shipping: ${order.shipping} TND | Total: ${order.total} TND
            </div>
          </div>

          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `
    printWindow.document.write(html)
    printWindow.document.close()
  }

  const handleContactCustomer = (phone: string, customerName: string) => {
    const cleanPhone = phone.replace(/\D/g, '')
    const message = encodeURIComponent(`Hello ${customerName}, regarding your order from Stikky...`)
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank')
  }

  const handleCreateOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const selectedProd = products.find(p => p.id === newOrderForm.product_id)
        const price = selectedProd ? selectedProd.price : newOrderForm.price

        await createManualOrder({
          customer_name: newOrderForm.customer_name,
          customer_phone: newOrderForm.customer_phone,
          customer_email: newOrderForm.customer_email,
          shipping_address: newOrderForm.shipping_address,
          city: newOrderForm.city,
          governorate: newOrderForm.governorate,
          shipping_fee: Number(newOrderForm.shipping_fee),
          items: [
            {
              product_id: newOrderForm.product_id,
              quantity: Number(newOrderForm.quantity),
              size: newOrderForm.size,
              frame: newOrderForm.frame,
              price: Number(price)
            }
          ]
        })

        setIsCreateOpen(false)
        const updatedOrders = await getOrders()
        setOrders(updatedOrders || [])
      } catch (err) {
        console.error("Failed to create order", err)
      }
    })
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer_phone?.includes(searchQuery) ||
      order.id?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Orders Management</h2>
          <p className="text-muted-foreground">Manage store orders, update statuses, and print fulfillment sheets.</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white">
              <Plus className="mr-2 h-4 w-4" /> Create Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Manual Order (COD)</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateOrderSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Customer Name</label>
                  <Input required placeholder="Full Name" value={newOrderForm.customer_name} onChange={e => setNewOrderForm({...newOrderForm, customer_name: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">Phone Number</label>
                  <Input required placeholder="+216..." value={newOrderForm.customer_phone} onChange={e => setNewOrderForm({...newOrderForm, customer_phone: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Email (Optional)</label>
                <Input type="email" placeholder="email@example.com" value={newOrderForm.customer_email} onChange={e => setNewOrderForm({...newOrderForm, customer_email: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-sm font-medium">Shipping Address</label>
                  <Input required placeholder="Street address" value={newOrderForm.shipping_address} onChange={e => setNewOrderForm({...newOrderForm, shipping_address: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input required placeholder="City" value={newOrderForm.city} onChange={e => setNewOrderForm({...newOrderForm, city: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Governorate</label>
                <Input required placeholder="Governorate" value={newOrderForm.governorate} onChange={e => setNewOrderForm({...newOrderForm, governorate: e.target.value})} />
              </div>

              <div className="border-t pt-4 space-y-4">
                <h4 className="font-semibold">Product Item</h4>
                <div>
                  <label className="text-sm font-medium">Select Product</label>
                  <Select onValueChange={val => {
                    const p = products.find(prod => prod.id === val)
                    setNewOrderForm({...newOrderForm, product_id: val, price: p ? p.price : 0})
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.price} TND)</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-sm font-medium">Quantity</label>
                    <Input type="number" min="1" value={newOrderForm.quantity} onChange={e => setNewOrderForm({...newOrderForm, quantity: Number(e.target.value)})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Size</label>
                    <Input placeholder="A4 / A3" value={newOrderForm.size} onChange={e => setNewOrderForm({...newOrderForm, size: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Frame</label>
                    <Input placeholder="Black / Wood" value={newOrderForm.frame} onChange={e => setNewOrderForm({...newOrderForm, frame: e.target.value})} />
                  </div>
                </div>
              </div>

              <Button type="submit" disabled={isPending} className="w-full bg-[#FF4500] hover:bg-[#FF4500]/90 text-white">
                {isPending ? "Creating..." : "Save Order"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search orders, name, phone..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Loading orders...</TableCell>
                </TableRow>
              ) : filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No orders found.</TableCell>
                </TableRow>
              ) : (
                filteredOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>{order.customer_phone}</TableCell>
                    <TableCell>{order.total} TND</TableCell>
                    <TableCell>
                      <Select value={order.status} onValueChange={val => handleStatusChange(order.id, val)}>
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="icon" onClick={() => handlePrintOrder(order)} title="Print Sheet">
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleContactCustomer(order.customer_phone, order.customer_name)} title="Contact WhatsApp">
                        <MessageCircle className="h-4 w-4 text-green-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}