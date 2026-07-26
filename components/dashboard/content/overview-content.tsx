"use client";

import {
  ShoppingBag,
  DollarSign,
  Receipt,
  Users,
  Clock,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getKpis,
  getRevenueByDay,
  getOrdersGrowth,
  getStatusDistribution,
  getBestSellingDesigns,
} from "@/lib/data";

const cardShadow =
  "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px, rgba(14, 63, 126, 0.04) 0px 12px 12px -6px, rgba(14, 63, 126, 0.04) 0px 24px 24px -12px";

const statusColors: Record<string, string> = {
  new: "oklch(0.6 0.15 250)",
  confirmed: "oklch(0.78 0.18 85)",
  "in-production": "oklch(0.68 0.2 40)",
  ready: "oklch(0.6 0.12 320)",
  shipped: "oklch(0.65 0.15 155)",
  delivered: "oklch(0.55 0.17 155)",
  cancelled: "oklch(0.6 0.2 25)",
};

export function OverviewContent() {
  const kpis = getKpis();
  const revenueData = getRevenueByDay(14);
  const ordersGrowth = getOrdersGrowth(14);
  const statusDist = getStatusDistribution().filter((s) => s.value > 0);
  const bestDesigns = getBestSellingDesigns();

  const metrics = [
    {
      label: "Total Orders",
      value: `${kpis.totalOrders} orders`,
      change: "+12.4%",
      trend: "up" as const,
      icon: ShoppingBag,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Revenue",
      value: `${kpis.revenue.toLocaleString()} TND`,
      change: "+8.9%",
      trend: "up" as const,
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Average Order Value",
      value: `${kpis.avgOrderValue} TND`,
      change: "+2.1%",
      trend: "up" as const,
      icon: Receipt,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      label: "Customers",
      value: `${kpis.customers} customers`,
      change: "+5.6%",
      trend: "up" as const,
      icon: Users,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
    {
      label: "Pending Production",
      value: `${kpis.pendingProduction} orders`,
      change: "waiting",
      trend: "neutral" as const,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Completed Orders",
      value: `${kpis.completedOrders} orders`,
      change: "delivered",
      trend: "neutral" as const,
      icon: CheckCircle2,
      color: "text-success",
      bgColor: "bg-success/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="bg-card rounded-2xl p-5 border border-border"
              style={{ boxShadow: cardShadow }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2.5 rounded-xl ${metric.bgColor}`}>
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                </div>
                {metric.trend !== "neutral" && (
                  <div className="flex items-center gap-1 text-xs text-success">
                    {metric.trend === "up" ? (
                      <TrendingUp className="w-3.5 h-3.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5" />
                    )}
                    <span className="font-medium">{metric.change}</span>
                  </div>
                )}
              </div>
              <p className="text-xl font-semibold text-foreground mb-1">
                {metric.value}
              </p>
              <p className="text-sm text-muted-foreground">{metric.label}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue + Status Row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Revenue Analytics */}
        <div
          className="col-span-2 bg-card rounded-2xl p-6 border border-border"
          style={{ boxShadow: cardShadow }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-foreground">Revenue Analytics</h3>
              <p className="text-sm text-muted-foreground">Current period vs previous period (TND)</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-muted-foreground">This period</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-muted-foreground/40" />
                <span className="text-muted-foreground">Previous</span>
              </div>
            </div>
          </div>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.005 250)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "oklch(0.55 0.01 250)", fontSize: 12 }}
                  axisLine={{ stroke: "oklch(0.92 0.005 250)" }}
                />
                <YAxis
                  tick={{ fill: "oklch(0.55 0.01 250)", fontSize: 12 }}
                  axisLine={{ stroke: "oklch(0.92 0.005 250)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid oklch(0.92 0.005 250)",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="current"
                  stroke="oklch(0.68 0.2 40)"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="previous"
                  stroke="oklch(0.6 0.01 250)"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div
          className="bg-card rounded-2xl p-6 border border-border"
          style={{ boxShadow: cardShadow }}
        >
          <h3 className="text-base font-semibold text-foreground mb-1">Order Status</h3>
          <p className="text-sm text-muted-foreground mb-4">Distribution across the pipeline</p>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDist}
                  dataKey="value"
                  nameKey="label"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={2}
                >
                  {statusDist.map((entry) => (
                    <Cell key={entry.status} fill={statusColors[entry.status]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid oklch(0.92 0.005 250)",
                    borderRadius: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1.5 mt-2">
            {statusDist.map((entry) => (
              <div key={entry.status} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: statusColors[entry.status] }}
                  />
                  <span className="text-muted-foreground">{entry.label}</span>
                </div>
                <span className="font-medium text-foreground">{entry.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Growth + Best Selling */}
      <div className="grid grid-cols-3 gap-4">
        <div
          className="col-span-2 bg-card rounded-2xl p-6 border border-border"
          style={{ boxShadow: cardShadow }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-semibold text-foreground">Orders Growth</h3>
              <p className="text-sm text-muted-foreground">Number of orders placed per day</p>
            </div>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ordersGrowth}>
                <defs>
                  <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.68 0.2 40)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="oklch(0.68 0.2 40)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.92 0.005 250)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "oklch(0.55 0.01 250)", fontSize: 12 }}
                  axisLine={{ stroke: "oklch(0.92 0.005 250)" }}
                />
                <YAxis
                  tick={{ fill: "oklch(0.55 0.01 250)", fontSize: 12 }}
                  axisLine={{ stroke: "oklch(0.92 0.005 250)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--card)",
                    border: "1px solid oklch(0.92 0.005 250)",
                    borderRadius: "12px",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="orders"
                  stroke="oklch(0.68 0.2 40)"
                  strokeWidth={2}
                  fill="url(#ordersGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Best Selling Designs */}
        <div
          className="bg-card rounded-2xl p-6 border border-border"
          style={{ boxShadow: cardShadow }}
        >
          <h3 className="text-base font-semibold text-foreground mb-4">Best Selling Designs</h3>
          <div className="space-y-3">
            {bestDesigns.map((design, i) => (
              <div key={design.id} className="flex items-center gap-3">
                <span className="w-5 text-xs font-semibold text-muted-foreground">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{design.name}</p>
                  <p className="text-xs text-muted-foreground">{design.timesOrdered} sales</p>
                </div>
                <span className="text-sm font-semibold text-foreground shrink-0">
                  {design.revenue.toLocaleString()} TND
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
