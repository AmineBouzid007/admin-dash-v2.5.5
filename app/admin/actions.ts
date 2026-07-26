'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getCategories() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('categories').select('*').order('name')
  if (error) throw new Error(error.message)
  return data
}

export async function getProducts() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const product_type = formData.get('product_type') as string
  const category_id = formData.get('category_id') as string
  const main_image = formData.get('main_image') as string
  const material = formData.get('material') as string
  const featured = formData.get('featured') === 'true'
  const bestseller = formData.get('bestseller') === 'true'

  const sizes = JSON.parse((formData.get('sizes') as string) || '[]')
  const frames = JSON.parse((formData.get('frames') as string) || '[]')
  const additional_images = JSON.parse((formData.get('additional_images') as string) || '[]')

  const { error } = await supabase.from('products').insert([
    {
      name,
      description,
      price,
      product_type,
      category_id,
      main_image,
      additional_images,
      sizes,
      frames,
      material,
      featured,
      bestseller,
    },
  ])

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/products')
}

export async function getOrders() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, products(name, main_image))')
    .order('created_at', { ascending: false })
  
  if (error) throw new Error(error.message)
  return data
}

export async function updateOrderStatus(orderId: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/orders')
}

export async function createManualOrder(orderData: {
  customer_name: string
  customer_phone: string
  customer_email?: string
  shipping_address: string
  city: string
  governorate: string
  shipping_fee: number
  items: Array<{
    product_id: string
    quantity: number
    size?: string
    frame?: string
    price: number
  }>
}) {
  const supabase = await createClient()

  const subtotal = orderData.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const total = subtotal + orderData.shipping_fee

  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        customer_name: orderData.customer_name,
        customer_phone: orderData.customer_phone,
        customer_email: orderData.customer_email || null,
        shipping_address: orderData.shipping_address,
        city: orderData.city,
        governorate: orderData.governorate,
        subtotal,
        shipping: orderData.shipping_fee,
        total,
        payment_method: 'Cash On Delivery',
        status: 'pending',
      },
    ])
    .select()
    .single()

  if (orderError || !newOrder) {
    throw new Error(orderError?.message || 'Failed to create order')
  }

  const orderItemsData = orderData.items.map((item) => ({
    order_id: newOrder.id,
    product_id: item.product_id,
    quantity: item.quantity,
    size: item.size || null,
    frame: item.frame || null,
    price: item.price,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData)

  if (itemsError) {
    throw new Error(itemsError.message)
  }

  revalidatePath('/admin/orders')
  revalidatePath('/admin')
  return newOrder
}

export async function getAnalyticsData(dateFilter: string = '30days') {
  const supabase = await createClient()

  let query = supabase.from('orders').select('*, order_items(*, products(name, category_id))')

  const now = new Date()
  if (dateFilter === 'today') {
    const startOfDay = new Date(now.setHours(0, 0, 0, 0)).toISOString()
    query = query.gte('created_at', startOfDay)
  } else if (dateFilter === '7days') {
    const d = new Date()
    d.setDate(d.getDate() - 7)
    query = query.gte('created_at', d.toISOString())
  } else if (dateFilter === '30days') {
    const d = new Date()
    d.setDate(d.getDate() - 30)
    query = query.gte('created_at', d.toISOString())
  } else if (dateFilter === 'year') {
    const startOfYear = new Date(now.getFullYear(), 0, 1).toISOString()
    query = query.gte('created_at', startOfYear)
  }

  const { data: orders, error } = await query
  if (error) throw new Error(error.message)

  const totalOrders = orders.length
  const totalRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? Number(o.total || 0) : 0), 0)
  const pendingOrders = orders.filter((o) => o.status === 'pending').length
  const deliveredOrders = orders.filter((o) => o.status === 'delivered').length
  const cancelledOrders = orders.filter((o) => o.status === 'cancelled').length
  const uniqueCustomers = new Set(orders.map((o) => o.customer_email || o.customer_phone)).size

  return {
    totalOrders,
    totalRevenue,
    pendingOrders,
    deliveredOrders,
    cancelledOrders,
    totalCustomers: uniqueCustomers,
    orders,
  }
}

export async function getCustomers() {
  const supabase = await createClient()
  const { data: orders, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
  if (error) throw new Error(error.message)

  const customerMap = new Map()

  orders.forEach((order) => {
    const key = order.customer_email || order.customer_phone
    if (!key) return

    if (!customerMap.has(key)) {
      customerMap.set(key, {
        name: order.customer_name,
        phone: order.customer_phone,
        email: order.customer_email,
        order_count: 0,
        total_spent: 0,
        last_order_date: order.created_at,
      })
    }

    const customer = customerMap.get(key)
    customer.order_count += 1
    if (order.status !== 'cancelled') {
      customer.total_spent += Number(order.total || 0)
    }
    if (new Date(order.created_at) > new Date(customer.last_order_date)) {
      customer.last_order_date = order.created_at
    }
  })

  return Array.from(customerMap.values())
}

export async function getCustomRequests() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('custom_requests')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data
}

export async function updateCustomRequestStatus(requestId: string, status: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('custom_requests')
    .update({ status })
    .eq('id', requestId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/custom-requests')
}