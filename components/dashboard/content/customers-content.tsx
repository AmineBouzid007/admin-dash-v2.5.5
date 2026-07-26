"use client";

import { useMemo, useState } from "react";
import { getCustomers } from "@/lib/data";
import { Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

const cardShadow =
  "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px";

export function CustomersContent() {
  const [search, setSearch] = useState("");
  const customers = useMemo(() => getCustomers(), []);

  const filtered = customers.filter(
    (c) =>
      search.trim() === "" ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.city.toLowerCase().includes(search.toLowerCase())
  );

  const repeatCustomers = customers.filter((c) => c.ordersCount > 1).length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl p-5 border border-border" style={{ boxShadow: cardShadow }}>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">Total customers</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{customers.length}</p>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border" style={{ boxShadow: cardShadow }}>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">Repeat customers</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">{repeatCustomers}</p>
        </div>
        <div className="bg-card rounded-2xl p-5 border border-border" style={{ boxShadow: cardShadow }}>
          <div className="flex items-center gap-2 text-muted-foreground mb-2">
            <Users className="w-4 h-4" />
            <span className="text-sm">Avg. spend / customer</span>
          </div>
          <p className="text-2xl font-semibold text-foreground">
            {Math.round(customers.reduce((s, c) => s + c.totalSpent, 0) / (customers.length || 1))} TND
          </p>
        </div>
      </div>

      <div className="bg-card rounded-2xl p-4 border border-border" style={{ boxShadow: cardShadow }}>
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search customer, phone, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div
        className="bg-card rounded-2xl border border-border overflow-hidden"
        style={{ boxShadow: cardShadow }}
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>City</TableHead>
              <TableHead className="text-right">Orders</TableHead>
              <TableHead className="text-right">Total spent</TableHead>
              <TableHead>Last order</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((c) => (
              <TableRow key={c.id}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell className="text-muted-foreground">{c.phone}</TableCell>
                <TableCell className="text-muted-foreground">{c.city}</TableCell>
                <TableCell className="text-right">{c.ordersCount}</TableCell>
                <TableCell className="text-right font-semibold">{c.totalSpent} TND</TableCell>
                <TableCell className="text-muted-foreground">{c.lastOrderDate}</TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No customers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
