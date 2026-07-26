"use client";

import type { ComponentType, ReactNode } from "react";
import { Store, Truck, Palette, UserCog } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ThemeToggle } from "@/components/dashboard/theme-toggle";

const cardShadow =
  "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px";

function SettingsCard({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: ComponentType<{ className?: string }>;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-card rounded-2xl p-6 border border-border" style={{ boxShadow: cardShadow }}>
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-primary/10">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

export function SettingsContent() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      <SettingsCard icon={Store} title="Store Information" subtitle="Basic details about Stikky">
        <div className="space-y-4">
          <div>
            <Label htmlFor="store-name" className="mb-1.5 block">Store name</Label>
            <Input id="store-name" defaultValue="Stikky" />
          </div>
          <div>
            <Label htmlFor="store-email" className="mb-1.5 block">Contact email</Label>
            <Input id="store-email" defaultValue="admin@stikky.tn" />
          </div>
          <div>
            <Label htmlFor="store-phone" className="mb-1.5 block">Phone</Label>
            <Input id="store-phone" defaultValue="+216 20 123 456" />
          </div>
          <div>
            <Label htmlFor="store-currency" className="mb-1.5 block">Currency</Label>
            <Input id="store-currency" defaultValue="TND" />
          </div>
          <Button size="sm">Save changes</Button>
        </div>
      </SettingsCard>

      <SettingsCard icon={Truck} title="Shipping Settings" subtitle="Delivery zones & production times">
        <div className="space-y-4">
          <div>
            <Label htmlFor="production-time" className="mb-1.5 block">Standard production time (days)</Label>
            <Input id="production-time" defaultValue="3" type="number" />
          </div>
          <div>
            <Label htmlFor="shipping-fee" className="mb-1.5 block">Standard shipping fee (TND)</Label>
            <Input id="shipping-fee" defaultValue="8" type="number" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Free shipping over 100 TND</p>
              <p className="text-xs text-muted-foreground">Applies automatically at checkout</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Button size="sm">Save changes</Button>
        </div>
      </SettingsCard>

      <SettingsCard icon={Palette} title="Theme Settings" subtitle="Appearance of the admin console">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Light / Dark mode</p>
            <p className="text-xs text-muted-foreground">Switch the dashboard theme</p>
          </div>
          <ThemeToggle />
        </div>
      </SettingsCard>

      <SettingsCard icon={UserCog} title="Admin Preferences" subtitle="Notifications & workflow defaults">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">New order notifications</p>
              <p className="text-xs text-muted-foreground">Get notified when a new order comes in</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Daily summary email</p>
              <p className="text-xs text-muted-foreground">Revenue & orders recap every morning</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Low satisfaction alerts</p>
              <p className="text-xs text-muted-foreground">Flag cancelled or delayed orders</p>
            </div>
            <Switch />
          </div>
        </div>
      </SettingsCard>
    </div>
  );
}
