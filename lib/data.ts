import type { Order, OrderStatus, Design, Customer, OrderItem, PosterSize, FrameOption } from "./types"

export const designs: Design[] = [
  { id: "d1", name: "Retro Porsche 911", category: "Cars", image: "/placeholder.jpg", timesOrdered: 38, revenue: 2660 },
  { id: "d2", name: "JDM Skyline Sunset", category: "Cars", image: "/placeholder.jpg", timesOrdered: 29, revenue: 2030 },
  { id: "d3", name: "Messi World Cup Moment", category: "Football", image: "/placeholder.jpg", timesOrdered: 45, revenue: 3150 },
  { id: "d4", name: "Ronaldo Iconic Celebration", category: "Football", image: "/placeholder.jpg", timesOrdered: 41, revenue: 2870 },
  { id: "d5", name: "Ayrton Senna Tribute", category: "F1", image: "/placeholder.jpg", timesOrdered: 33, revenue: 2310 },
  { id: "d6", name: "Verstappen Championship", category: "F1", image: "/placeholder.jpg", timesOrdered: 27, revenue: 1890 },
  { id: "d7", name: "Minimalist Living Room", category: "Home Decor", image: "/placeholder.jpg", timesOrdered: 22, revenue: 1540 },
  { id: "d8", name: "Botanical Line Art", category: "Home Decor", image: "/placeholder.jpg", timesOrdered: 19, revenue: 1330 },
  { id: "d9", name: "Custom Family Portrait", category: "Custom", image: "/placeholder.jpg", timesOrdered: 16, revenue: 1600 },
  { id: "d10", name: "Custom Pet Illustration", category: "Custom", image: "/placeholder.jpg", timesOrdered: 12, revenue: 960 },
]

const cities = ["Tunis", "Sfax", "Sousse", "Ariana", "Nabeul", "Bizerte", "Monastir", "Gabès", "Ben Arous", "Mahdia"]

const customerNames = [
  "Ahmed Ben Salah", "Yasmine Trabelsi", "Karim Jendoubi", "Mariem Gharbi", "Sami Khelifi",
  "Rania Bouzid", "Walid Chaabane", "Nour Mabrouk", "Aymen Zouari", "Emna Hammami",
  "Bilel Sassi", "Ines Kort", "Anis Belhadj", "Sarra Ayadi", "Firas Dridi",
  "Wafa Cherni", "Hamza Ben Amor", "Salma Riahi", "Omar Ferchichi", "Dorra Jaziri",
]

const framesByFreq: FrameOption[] = ["black-frame", "black-frame", "wood-frame", "no-frame", "white-frame"]
const sizesByFreq: PosterSize[] = ["A4", "A4", "A3", "A3", "A2", "50x70cm", "A5"]

const priceBySize: Record<PosterSize, number> = {
  A5: 25,
  A4: 40,
  A3: 60,
  A2: 90,
  "50x70cm": 120,
}

function seededPick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

function pad(n: number) {
  return n.toString().padStart(3, "0")
}

const statusCycle: OrderStatus[] = [
  "delivered", "delivered", "delivered", "shipped", "shipped",
  "in-production", "in-production", "ready", "confirmed", "new", "cancelled",
]

function makeOrderItems(seed: number): OrderItem[] {
  const itemCount = (seed % 3) + 1
  const items: OrderItem[] = []
  for (let i = 0; i < itemCount; i++) {
    const design = seededPick(designs, seed + i * 3)
    const size = seededPick(sizesByFreq, seed + i * 5)
    const frame = seededPick(framesByFreq, seed + i * 7)
    const quantity = ((seed + i) % 3) + 1
    items.push({
      designId: design.id,
      designName: design.name,
      category: design.category,
      size,
      frame,
      quantity,
      unitPrice: priceBySize[size] + (frame === "no-frame" ? 0 : 15),
    })
  }
  return items
}

function dateNDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}

export const orders: Order[] = Array.from({ length: 62 }).map((_, i) => {
  const seed = i + 1
  const items = makeOrderItems(seed)
  const total = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0)
  const status = seededPick(statusCycle, seed)
  const daysAgo = Math.floor((seed * 37) % 45)
  const customerName = seededPick(customerNames, seed * 2)
  const city = seededPick(cities, seed * 3)

  return {
    id: `STK-${1000 + seed}`,
    customerName,
    phone: `${seededPick(["2", "5", "9"], seed)}${(10000000 + seed * 91731) % 90000000}`.slice(0, 8),
    city,
    address: `${5 + (seed % 40)} Rue ${seededPick(["Habib Bourguiba", "de la Liberté", "Ibn Khaldoun", "Farhat Hached", "Mongi Slim"], seed)}`,
    items,
    total,
    date: dateNDaysAgo(daysAgo),
    deliveryDate: status === "delivered" || status === "shipped" ? dateNDaysAgo(Math.max(daysAgo - 4, 0)) : undefined,
    status,
  }
})

export function getCustomers(): Customer[] {
  const map = new Map<string, Customer>()
  for (const order of orders) {
    const key = order.phone
    const existing = map.get(key)
    if (existing) {
      existing.ordersCount += 1
      existing.totalSpent += order.total
      if (order.date > existing.lastOrderDate) existing.lastOrderDate = order.date
    } else {
      map.set(key, {
        id: key,
        name: order.customerName,
        phone: order.phone,
        city: order.city,
        ordersCount: 1,
        totalSpent: order.total,
        lastOrderDate: order.date,
      })
    }
  }
  return Array.from(map.values()).sort((a, b) => b.totalSpent - a.totalSpent)
}

export function getRevenueByDay(days = 14) {
  const result: { date: string; current: number; previous: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const dateStr = dateNDaysAgo(i)
    const current = orders
      .filter((o) => o.date === dateStr && o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0)
    const prevDateStr = dateNDaysAgo(i + days)
    const previous = orders
      .filter((o) => o.date === prevDateStr && o.status !== "cancelled")
      .reduce((sum, o) => sum + o.total, 0)
    result.push({
      date: new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      current: current || Math.round(200 + Math.random() * 300),
      previous: previous || Math.round(150 + Math.random() * 250),
    })
  }
  return result
}

export function getOrdersGrowth(days = 14) {
  const result: { date: string; orders: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const dateStr = dateNDaysAgo(i)
    const count = orders.filter((o) => o.date === dateStr).length
    result.push({
      date: new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short" }),
      orders: count || Math.round(1 + Math.random() * 4),
    })
  }
  return result
}

export const statusLabels: Record<OrderStatus, string> = {
  new: "New Order",
  confirmed: "Confirmed",
  "in-production": "In Production",
  ready: "Ready",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export function getStatusDistribution() {
  const counts: Record<OrderStatus, number> = {
    new: 0,
    confirmed: 0,
    "in-production": 0,
    ready: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
  }
  for (const o of orders) counts[o.status] += 1
  return (Object.keys(counts) as OrderStatus[]).map((status) => ({
    status,
    label: statusLabels[status],
    value: counts[status],
  }))
}

export function getBestSellingDesigns() {
  return [...designs].sort((a, b) => b.revenue - a.revenue).slice(0, 6)
}

export function getKpis() {
  const activeOrders = orders.filter((o) => o.status !== "cancelled")
  const totalOrders = activeOrders.length
  const revenue = activeOrders.reduce((sum, o) => sum + o.total, 0)
  const avgOrderValue = totalOrders ? Math.round(revenue / totalOrders) : 0
  const customers = getCustomers().length
  const pendingProduction = orders.filter((o) => o.status === "confirmed" || o.status === "in-production").length
  const completedOrders = orders.filter((o) => o.status === "delivered").length

  return { totalOrders, revenue, avgOrderValue, customers, pendingProduction, completedOrders }
}
