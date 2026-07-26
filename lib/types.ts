import React from "react"

export type NavigationSection =
  | "overview"
  | "orders"
  | "customers"
  | "designs"
  | "analytics"
  | "settings"

export interface NavigationItem {
  id: NavigationSection
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

export type OrderStatus =
  | "new"
  | "confirmed"
  | "in-production"
  | "ready"
  | "shipped"
  | "delivered"
  | "cancelled"

export type FrameOption = "no-frame" | "black-frame" | "wood-frame" | "white-frame"

export type PosterSize = "A5" | "A4" | "A3" | "A2" | "50x70cm"

export interface OrderItem {
  designId: string
  designName: string
  category: string
  size: PosterSize
  frame: FrameOption
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  customerName: string
  phone: string
  city: string
  address: string
  items: OrderItem[]
  total: number
  date: string
  deliveryDate?: string
  status: OrderStatus
}

export interface Customer {
  id: string
  name: string
  phone: string
  city: string
  ordersCount: number
  totalSpent: number
  lastOrderDate: string
}

export type DesignCategory = "Cars" | "Football" | "F1" | "Home Decor" | "Custom"

export interface Design {
  id: string
  name: string
  category: DesignCategory
  image: string
  timesOrdered: number
  revenue: number
}

export interface MetricCard {
  label: string
  value: string | number
  change?: {
    value: number
    trend: "up" | "down" | "neutral"
  }
  period?: string
}

export interface TimeFilter {
  label: string
  value: "7d" | "30d" | "90d" | "ytd" | "all"
}
