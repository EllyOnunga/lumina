import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import type { Product, User } from "@shared/schema";
import { Hero } from "@/components/home/Hero";
import { IsFeatured } from "@/components/home/IsFeatured";
import { ProductCard } from "@/components/product/ProductCard";
import { GridSkeleton } from "@/components/ui/skeletons";

import { useLocation } from "wouter";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, LayoutGrid, List } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);

  const activeFilters = {
    search: searchParams.get("search") || "",
    category: searchParams.getAll("category").map(Number),
    brand: searchParams.getAll("brand"),
    price: [
      Number(searchParams.get("minPrice")) || 0,
      Number(searchParams.get("maxPrice")) || 1000000
    ],
    attributes: {}
  };

  const [sort, setSort] = useState<string>("newest");
  const [showPreferences, setShowPreferences] = useState(false);
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const { data: user } = useQuery<User>({
    queryKey: ["/api/user"],
    retry: false
  });

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: [
      "/api/products",
      {
        search: activeFilters.search,
        category: showPreferences ? (user?.preferences || []) : (activeFilters.category.length > 0 ? activeFilters.category : undefined),
        brand: activeFilters.brand.length > 0 ? activeFilters.brand : undefined,
        minPrice: activeFilters.price[0],
        maxPrice: activeFilters.price[1],
        sort,
        attributes: activeFilters.attributes
      }
    ],
  });

  return (
    <Layout>
      <Hero />
      <IsFeatured />

      {/* Product Catalog with Search & Filter */}
      <section className="py-24 container mx-auto px-4" id="products">
        <div className="flex flex-col lg:flex-row gap-12">

          {/* Product Listing Card Container */}
          <div className="flex-1">
            <div className="bg-white/50 backdrop-blur-md border border-white rounded-3xl p-8 md:p-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-700 min-h-[60vh]">
              <div className="space-y-12">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 bg-secondary/5 p-8 rounded-3xl border border-secondary/20">
                  <div>
                    <h2 className="text-4xl font-black tracking-tighter mb-2 italic">
                      {activeFilters.search ? `FOUND: "${activeFilters.search}"` : "THE MANIFEST"}
                    </h2>
                    <div className="flex items-center gap-4">
                      <p className="text-muted-foreground uppercase text-[10px] font-black tracking-[0.25em]">
                        {products?.length || 0} Registered Assets
                      </p>
                      {user?.preferences && user.preferences.length > 0 && (
                        <div className="flex items-center space-x-2 bg-white px-3 py-1.5 rounded-full border border-secondary/50 shadow-sm">
                          <Switch
                            id="for-you"
                            checked={showPreferences}
                            onCheckedChange={setShowPreferences}
                          />
                          <Label htmlFor="for-you" className="text-[10px] font-black uppercase tracking-widest cursor-pointer flex items-center gap-1.5 opacity-70">
                            <Sparkles className="w-3 h-3 text-accent" />
                            Tailored
                          </Label>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">


                    <div className="flex items-center bg-white rounded-2xl p-1 border border-secondary shadow-sm shrink-0">
                      <Button
                        variant={view === 'grid' ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-10 w-10 rounded-xl"
                        onClick={() => setView('grid')}
                      >
                        <LayoutGrid className="w-4 h-4" />
                      </Button>
                      <Button
                        variant={view === 'list' ? 'secondary' : 'ghost'}
                        size="icon"
                        className="h-10 w-10 rounded-xl"
                        onClick={() => setView('list')}
                      >
                        <List className="w-4 h-4" />
                      </Button>
                    </div>

                    <Select value={sort} onValueChange={setSort}>
                      <SelectTrigger className="h-12 flex-1 sm:w-52 border-secondary bg-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-lg">
                        <SelectValue placeholder="Sort Discipline" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl p-2">
                        <SelectItem value="newest" className="font-bold rounded-xl py-3">Arrival Order</SelectItem>
                        <SelectItem value="price_asc" className="font-bold rounded-xl py-3">Ascending Value</SelectItem>
                        <SelectItem value="price_desc" className="font-bold rounded-xl py-3">Descending Value</SelectItem>
                        <SelectItem value="rating_desc" className="font-bold rounded-xl py-3">Elite Tier First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className={view === 'grid'
                  ? "grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-y-16 gap-x-8"
                  : "flex flex-col gap-10"
                }>
                  {isLoading ? (
                    <GridSkeleton count={6} />
                  ) : products?.length === 0 ? (
                    <div className="col-span-full py-40 text-center space-y-6">
                      <div className="h-20 w-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto opacity-20">
                        <LayoutGrid className="w-10 h-10" />
                      </div>
                      <p className="font-black uppercase tracking-[0.3em] text-muted-foreground text-xs">No Assets Match Query</p>
                      <Button variant="outline" onClick={() => setLocation("/")} className="rounded-full px-10 h-12">Clear Filters</Button>
                    </div>
                  ) : (
                    products?.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}