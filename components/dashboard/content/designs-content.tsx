"use client";

import { useState, useEffect, useTransition } from "react";
import { getProducts, getOrders, createProduct } from "@/app/admin/actions";
import { TrendingUp, ShoppingBag, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const cardShadow =
  "rgba(14, 63, 126, 0.04) 0px 0px 0px 1px, rgba(42, 51, 69, 0.04) 0px 1px 1px -0.5px, rgba(42, 51, 70, 0.04) 0px 3px 3px -1.5px, rgba(42, 51, 70, 0.04) 0px 6px 6px -3px";

const categories = ["All", "Cars", "Football", "F1", "Home Decor", "Custom"];

export function DesignsContent() {
  const [designs, setDesigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // New product form state
  const [newDesign, setNewDesign] = useState({
    name: "",
    category: "Cars",
    product_type: "poster",
    price: 25,
    image_url: "",
    description: "",
    material: "Glossy Paper 250g",
    is_featured: false,
    is_bestseller: false,
    sizes: JSON.stringify([{ name: "A4", price: 25 }, { name: "A3", price: 35 }]),
    frames: JSON.stringify([{ name: "None", price: 0 }, { name: "Black Wood", price: 20 }]),
    images: JSON.stringify([])
  });

  async function loadData() {
    try {
      const [productsData, ordersData] = await Promise.all([getProducts(), getOrders()]);

      const statsMap = new Map();
      ordersData?.forEach((order: any) => {
        if (order.status === 'cancelled') return;
        order.order_items?.forEach((item: any) => {
          if (!item.product_id) return;
          const current = statsMap.get(item.product_id) || { timesOrdered: 0, revenue: 0 };
          statsMap.set(item.product_id, {
            timesOrdered: current.timesOrdered + (item.quantity || 1),
            revenue: current.revenue + Number(item.price || 0) * (item.quantity || 1),
          });
        });
      });

      const formattedDesigns = (productsData || []).map((product: any) => {
        const stats = statsMap.get(product.id) || { timesOrdered: 0, revenue: 0 };
        return {
          id: product.id,
          name: product.name,
          category: product.category || "Cars",
          image: product.image_url || "/placeholder.png",
          price: product.price,
          description: product.description,
          timesOrdered: stats.timesOrdered,
          revenue: stats.revenue,
        };
      });

      setDesigns(formattedDesigns);
    } catch (err) {
      console.error("Failed to load design stats from DB", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("name", newDesign.name);
        formData.append("category", newDesign.category);
        formData.append("product_type", newDesign.product_type);
        formData.append("price", String(newDesign.price));
        formData.append("image_url", newDesign.image_url);
        formData.append("description", newDesign.description);
        formData.append("material", newDesign.material);
        formData.append("is_featured", String(newDesign.is_featured));
        formData.append("is_bestseller", String(newDesign.is_bestseller));
        formData.append("sizes", newDesign.sizes);
        formData.append("frames", newDesign.frames);
        formData.append("images", newDesign.images);

        await createProduct(formData);
        setIsAddOpen(false);
        // Reset form
        setNewDesign({
          name: "",
          category: "Cars",
          product_type: "poster",
          price: 25,
          image_url: "",
          description: "",
          material: "Glossy Paper 250g",
          is_featured: false,
          is_bestseller: false,
          sizes: JSON.stringify([{ name: "A4", price: 25 }, { name: "A3", price: 35 }]),
          frames: JSON.stringify([{ name: "None", price: 0 }, { name: "Black Wood", price: 20 }]),
          images: JSON.stringify([])
        });
        await loadData();
      } catch (err) {
        console.error("Failed to create product", err);
      }
    });
  };

  const maxOrdered = designs.length > 0 ? Math.max(...designs.map((d) => d.timesOrdered), 1) : 1;
  const filtered = category === "All" ? designs : designs.filter((d) => d.category === category);

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading designs data from database...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                category === cat
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Add Design Button & Modal */}
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#FF4500] hover:bg-[#FF4500]/90 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add New Design
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product Design</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Design Name</label>
                  <Input 
                    required 
                    placeholder="e.g., Porsche 911 GT3 RS" 
                    value={newDesign.name} 
                    onChange={e => setNewDesign({...newDesign, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Base Price (TND)</label>
                  <Input 
                    required 
                    type="number" 
                    step="0.1" 
                    value={newDesign.price} 
                    onChange={e => setNewDesign({...newDesign, price: Number(e.target.value)})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={newDesign.category} onValueChange={val => setNewDesign({...newDesign, category: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cars">Cars</SelectItem>
                      <SelectItem value="Football">Football</SelectItem>
                      <SelectItem value="F1">F1</SelectItem>
                      <SelectItem value="Home Decor">Home Decor</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Product Type</label>
                  <Select value={newDesign.product_type} onValueChange={val => setNewDesign({...newDesign, product_type: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="poster">Poster</SelectItem>
                      <SelectItem value="sticker">Sticker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Image URL (Photo link)</label>
                <Input 
                  required 
                  placeholder="https://images.unsplash.com/..." 
                  value={newDesign.image_url} 
                  onChange={e => setNewDesign({...newDesign, image_url: e.target.value})} 
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Input 
                  placeholder="High quality matte print..." 
                  value={newDesign.description} 
                  onChange={e => setNewDesign({...newDesign, description: e.target.value})} 
                />
              </div>

              <div>
                <label className="text-sm font-medium">Material / Finish</label>
                <Input 
                  placeholder="Glossy Paper 250g" 
                  value={newDesign.material} 
                  onChange={e => setNewDesign({...newDesign, material: e.target.value})} 
                />
              </div>

              <Button type="submit" disabled={isPending} className="w-full bg-[#FF4500] hover:bg-[#FF4500]/90 text-white">
                {isPending ? "Adding to Database..." : "Save Design"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground bg-card rounded-2xl border border-border">
          No designs found in this category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((design) => {
            const popularity = Math.round((design.timesOrdered / maxOrdered) * 100);
            return (
              <div
                key={design.id}
                className="bg-card rounded-2xl border border-border overflow-hidden"
                style={{ boxShadow: cardShadow }}
              >
                <div className="aspect-[4/3] bg-muted flex items-center justify-center relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={design.image}
                    alt={design.name}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2.5 py-1 rounded-full font-semibold backdrop-blur-sm">
                    {design.price} TND
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{design.name}</p>
                      <span className="text-xs text-muted-foreground">{design.category}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <ShoppingBag className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{design.timesOrdered}</p>
                        <p className="text-xs text-muted-foreground">Times ordered</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-success/10">
                        <TrendingUp className="w-3.5 h-3.5 text-success" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{design.revenue.toLocaleString()} TND</p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                      <span>Popularity</span>
                      <span>{popularity}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${popularity}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
