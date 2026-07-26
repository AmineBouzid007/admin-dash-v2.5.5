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
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function createProduct(formData: FormData) {
  const supabase = await createClient()

  const name = formData.get('name') as string
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  const description = formData.get('description') as string
  const price = parseFloat(formData.get('price') as string)
  const product_type = formData.get('product_type') as string
  const category = formData.get('category') as string
  const image_url = formData.get('image_url') as string
  const material = formData.get('material') as string
  const is_featured = formData.get('is_featured') === 'true'
  const is_bestseller = formData.get('is_bestseller') === 'true'

  const sizes = JSON.parse((formData.get('sizes') as string) || '[]')
  const frames = JSON.parse((formData.get('frames') as string) || '[]')
  const images = JSON.parse((formData.get('images') as string) || '[]')

  const { error } = await supabase.from('products').insert([
    {
      slug,
      name,
      description,
      price,
      product_type,
      category,
      image_url,
      images,
      sizes,
      frames,
      material,
      is_featured,
      is_bestseller,
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
    .select('*, order_items(*)')
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
  phone: string
  email: string
  address: string
  city: string
  governorate: string
  shipping: number
  items: Array<{
    product_id: string
    product_name: string
    quantity: number
    size?: string
    frame?: string
    price: number
    image_url?: string
  }>
}) {
  const supabase = await createClient()

  const subtotal = orderData.items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const total = subtotal + orderData.shipping

  const { data: newOrder, error: orderError } = await supabase
    .from('orders')
    .insert([
      {
        customer_name: orderData.customer_name,
        phone: orderData.phone,
        email: orderData.email || 'no-email@stikky.tn',
        address: orderData.address,
        city: orderData.city,
        governorate: orderData.governorate,
        subtotal,
        shipping: orderData.shipping,
        total,
        payment_method: 'cod',
        payment_status: 'unpaid',
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
    product_name: item.product_name,
    quantity: item.quantity,
    size: item.size || null,
    frame: item.frame || null,
    price: item.price,
    image_url: item.image_url || null,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(orderItemsData)

  if (itemsError) {
    throw new Error(itemsError.message)
  }

  revalidatePath('/admin/orders')
  revalidatePath('/admin')
  return newOrder
}
