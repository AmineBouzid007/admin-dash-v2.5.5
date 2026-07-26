"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getKpis, getBestSellingDesigns } from "@/lib/data";
import { DollarSign, ShoppingBag, Users, Percent, Receipt, TrendingUp } from "lucide-react";

const cardShadow =
  "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px";

const monthlyRevenue = [
  { month: "Feb", revenue: 9800, orders: 132 },
  { month: "Mar", revenue: 11200, orders: 149 },
  { month: "Apr", revenue: 10450, orders: 141 },
  { month: "May", revenue: 13600, orders: 178 },
  { month: "Jun", revenue: 15200, orders: 201 },
  { month: "Jul", revenue: 17450, orders: 224 },
];

const customerGrowth = [
  { month: "Feb", customers: 96 },
  { month: "Mar", customers: 112 },
  { month: "Apr", customers: 124 },
  { month: "May", customers: 141 },
  { month: "Jun", customers: 163 },
  { month: "Jul", customers: 182 },
];

export function AnalyticsContent() {
  const kpis = getKpis();
  const bestDesigns = getBestSellingDesigns();
  const conversionRate = 3.8;

  const stats = [
    { label: "Monthly Revenue", value: `${monthlyRevenue[monthlyRevenue.length - 1].revenue.toLocaleString()} TND`, icon: DollarSign, color: "text-success", bg: "bg-success/10" },
    { label: "Monthly Orders", value: monthlyRevenue[monthlyRevenue.length - 1].orders, icon: ShoppingBag, color: "text-primary", bg: "bg-primary/10" },
    { label: "Customer Growth", value: `+${customerGrowth[customerGrowth.length - 1].customers - customerGrowth[customerGrowth.length - 2].customers} this month`, icon: Users, color: "text-chart-4", bg: "bg-chart-4/10" },
    { label: "Conversion Rate", value: `${conversionRate}%`, icon: Percent, color: "text-chart-3", bg: "bg-chart-3/10" },
    { label: "Avg. Basket Value", value: `${kpis.avgOrderValue} TND`, icon: Receipt, color: "text-warning", bg: "bg-warning/10" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="bg-card rounded-2xl p-5 border border-border" style={{ boxShadow: cardShadow }}>
              <div className={`p-2.5 rounded-xl ${s.bg} w-fit mb-3`}>
                <Icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <p className="text-xl font-semibold text-foreground mb-1">{s.value}</p>
              <p className="text-sm text-muted-foreground">{s.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-2xl p-6 border border-border" style={{ boxShadow: cardShadow }}>
          <h3 className="text-base font-semibold text-foreground mb-1">Monthly Revenue</h3>
          <p className="text-sm text-muted-foreground mb-6">Last 6 months (TND)</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.005 250)" />
                <XAxis dataKey="month" tick={{ fill: "oklch(0.55 0.01 250)", fontSize: 12 }} axisLine={{ stroke: "oklch(0.92 0.005 250)" }} />
                <YAxis tick={{ fill: "oklch(0.55 0.01 250)", fontSize: 12 }} axisLine={{ stroke: "oklch(0.92 0.005 250)" }} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid oklch(0.92 0.005 250)", borderRadius: "12px" }} />
                <Bar dataKey="revenue" fill="oklch(0.68 0.2 40)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border" style={{ boxShadow: cardShadow }}>
          <h3 className="text-base font-semibold text-foreground mb-1">Customer Growth</h3>
          <p className="text-sm text-muted-foreground mb-6">Cumulative customers over time</p>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.005 250)" />
                <XAxis dataKey="month" tick={{ fill: "oklch(0.55 0.01 250)", fontSize: 12 }} axisLine={{ stroke: "oklch(0.92 0.005 250)" }} />
                <YAxis tick={{ fill: "oklch(0.55 0.01 250)", fontSize: 12 }} axisLine={{ stroke: "oklch(0.92 0.005 250)" }} />
                <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid oklch(0.92 0.005 250)", borderRadius: "12px" }} />
                <Line type="monotone" dataKey="customers" stroke="oklch(0.6 0.15 250)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Most profitable designs */}
      <div className="bg-card rounded-2xl p-6 border border-border" style={{ boxShadow: cardShadow }}>
        <h3 className="text-base font-semibold text-foreground mb-4">Most Profitable Designs</h3>
        <div className="space-y-3">
          {bestDesigns.map((design, i) => (
            <div key={design.id} className="flex items-center gap-4">
              <span className="w-6 text-sm font-semibold text-muted-foreground">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{design.name}</p>
                <p className="text-xs text-muted-foreground">{design.category} · {design.timesOrdered} sales</p>
              </div>
              <div className="flex items-center gap-1.5 text-success text-sm font-semibold">
                <TrendingUp className="w-3.5 h-3.5" />
                {design.revenue.toLocaleString()} TND
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
