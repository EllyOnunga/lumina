import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import type { Product, User } from "@shared/schema";
import { Hero } from "@/components/home/Hero";
import { IsFeatured } from "@/components/home/IsFeatured";
import { ProductCard } from "@/components/product/ProductCard";
import { GridSkeleton } from "@/components/ui/skeletons";
import { FiltersSidebar, type ActiveFilters } from "@/components/product/FiltersSidebar";
import { useLocation } from "wouter";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, LayoutGrid, List, SlidersHorizontal } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Home() {
  useLocation();
  const searchParams = new URLSearchParams(window.location.search);

  const [filters, setFilters] = useState<ActiveFilters>({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") ? [Number(searchParams.get("category"))] : [],
    brand: [],
    price: [0, 1000000],
    attributes: {}
  });

  const activeFilters = {
    ...filters,
    search: searchParams.get("search") || ""
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
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden lg:block w-80 shrink-0">
            <FiltersSidebar
              activeFilters={activeFilters}
              onFilterChange={setFilters}
            />
          </aside>

          {/* Product Listing */}
          <div className="flex-1 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-muted p-8 rounded-[2rem]">
              <div>
                <h2 className="text-3xl font-black tracking-tighter mb-1">
                  {activeFilters.search ? `Results for "${activeFilters.search}"` : "The Collection"}
                </h2>
                <div className="flex items-center gap-4">
                  <p className="text-muted-foreground uppercase text-[10px] font-black tracking-[0.2em]">
                    {products?.length || 0} Assets Found
                  </p>
                  {user?.preferences && user.preferences.length > 0 && (
                    <div className="flex items-center space-x-2 bg-primary/5 px-3 py-1.5 rounded-full border border-primary/10">
                      <Switch
                        id="for-you"
                        checked={showPreferences}
                        onCheckedChange={setShowPreferences}
                      />
                      <Label htmlFor="for-you" className="text-[10px] font-black uppercase tracking-widest cursor-pointer flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-primary" />
                        For You
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 w-full md:w-auto">
                {/* Mobile Filter Trigger */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden h-11 w-11 rounded-xl border-secondary/10 shrink-0">
                      <SlidersHorizontal className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto rounded-r-[2rem]">
                    <div className="pt-6">
                      <FiltersSidebar
                        activeFilters={activeFilters}
                        onFilterChange={setFilters}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                <div className="flex items-center bg-background rounded-xl p-1 border border-secondary/10 shrink-0">
                  <Button
                    variant={view === 'grid' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-9 w-9 rounded-lg"
                    onClick={() => setView('grid')}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={view === 'list' ? 'secondary' : 'ghost'}
                    size="icon"
                    className="h-9 w-9 rounded-lg"
                    onClick={() => setView('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>

                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="h-11 flex-1 sm:w-44 border-none bg-background rounded-xl font-black uppercase text-[10px] tracking-widest shadow-sm">
                    <SelectValue placeholder="Sort Logic" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    <SelectItem value="newest" className="font-bold">Newest Arrivals</SelectItem>
                    <SelectItem value="price_asc" className="font-bold">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc" className="font-bold">Price: High to Low</SelectItem>
                    <SelectItem value="rating_desc" className="font-bold">Top Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className={view === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-y-12 gap-x-8"
              : "flex flex-col gap-6"
            }>
              {isLoading ? (
                <GridSkeleton count={6} />
              ) : (
                products?.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}