import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2, ArrowRight, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Product } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { FiltersSidebar, type ActiveFilters } from "@/components/product/FiltersSidebar";
import { Button } from "@/components/ui/button";

interface FloatingSearchProps {
    onSearch?: () => void;
}

export function FloatingSearch({ onSearch }: FloatingSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [, setLocation] = useLocation();
    const inputRef = useRef<HTMLInputElement>(null);

    // Parse initial filters from URL
    const searchParams = new URLSearchParams(window.location.search);
    const initialAttributes: Record<string, string[]> = {};
    searchParams.forEach((value, key) => {
        if (!["search", "category", "brand", "minPrice", "maxPrice"].includes(key)) {
            if (!initialAttributes[key]) initialAttributes[key] = [];
            initialAttributes[key].push(value);
        }
    });

    const initialFilters: ActiveFilters = {
        search: searchParams.get("search") || "",
        category: searchParams.getAll("category").map(Number),
        brand: searchParams.getAll("brand"),
        price: [
            Number(searchParams.get("minPrice")) || 0,
            Number(searchParams.get("maxPrice")) || 1000000
        ],
        attributes: initialAttributes
    };

    const [filters, setFilters] = useState<ActiveFilters>(initialFilters);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Sync search input with filters.search
    const query = filters.search;
    const setQuery = (q: string) => setFilters(prev => ({ ...prev, search: q }));

    const { data: suggestions, isLoading } = useQuery<Product[]>({
        queryKey: [`/api/products/search/suggestions?q=${query}`],
        enabled: query.length > 1,
    });

    const openSearch = useCallback(() => {
        // Re-read params when opening to ensure sync
        const currentParams = new URLSearchParams(window.location.search);
        const currentAttributes: Record<string, string[]> = {};
        currentParams.forEach((value, key) => {
            if (!["search", "category", "brand", "minPrice", "maxPrice"].includes(key)) {
                if (!currentAttributes[key]) currentAttributes[key] = [];
                currentAttributes[key].push(value);
            }
        });

        setFilters({
            search: currentParams.get("search") || "",
            category: currentParams.getAll("category").map(Number),
            brand: currentParams.getAll("brand"),
            price: [
                Number(currentParams.get("minPrice")) || 0,
                Number(currentParams.get("maxPrice")) || 1000000
            ],
            attributes: currentAttributes
        });
        setIsOpen(true);
        setShowMobileFilters(false);
        setTimeout(() => inputRef.current?.focus(), 100);
    }, []);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                openSearch();
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [openSearch]);



    const applyFilters = () => {
        const params = new URLSearchParams();
        if (filters.search) params.set("search", filters.search);
        filters.category.forEach(c => params.append("category", c.toString()));
        filters.brand.forEach(b => params.append("brand", b));
        if (filters.price[0] > 0) params.set("minPrice", filters.price[0].toString());
        if (filters.price[1] < 1000000) params.set("maxPrice", filters.price[1].toString());

        // Attributes
        Object.entries(filters.attributes).forEach(([key, values]) => {
            values.forEach(v => params.append(key, v));
        });

        // Use #products to scroll to result
        setLocation(`/?${params.toString()}#products`);
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters();
        setIsOpen(false);
        onSearch?.();
    };

    // Auto-apply filters when they change (debounced could be better but direct for now)
    // Actually, for a modal, maybe "Apply" button is better? 
    // The user said "filters should be inside extended search". 
    // Let's provide a "View Results" button at the bottom or just apply on "Enter" in search.
    // However, clicking checkboxes in FilterSidebar usually expects immediate reaction.
    // Let's implement an explicit "Search / Apply" button in the modal footer, 
    // BUT also allow real-time query updates if we were on the products page.
    // For now, let's stick to: User configures filters -> Clicks search/enter -> Navigates.

    return (
        <>
            <button
                onClick={openSearch}
                className="w-full flex items-center gap-3 px-4 h-11 bg-secondary/10 border border-secondary/20 hover:bg-secondary/20 rounded-xl transition-all group group-hover:border-accent/30"
            >
                <Search className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                <span className="text-sm font-medium text-muted-foreground/60 transition-colors group-hover:text-muted-foreground">Search assets, categories...</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="container mx-auto max-w-5xl mt-8 px-4 h-[90vh]">
                        <div className="relative bg-background border border-secondary/20 shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col h-full">
                            <form onSubmit={handleSearch} className="flex items-center px-8 h-20 border-b border-secondary/10 shrink-0">
                                <Search className="w-6 h-6 text-primary mr-4" />
                                <Input
                                    ref={inputRef}
                                    value={filters.search}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Type to find products, categories, or styles..."
                                    className="flex-1 bg-transparent border-none focus-visible:ring-0 text-xl font-bold p-0"
                                />
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground mr-4" />
                                ) : null}
                                <button type="button" onClick={() => setIsOpen(false)} aria-label="Close search" title="Close search">
                                    <X className="w-6 h-6 text-muted-foreground hover:text-foreground transition-colors" />
                                </button>
                            </form>

                            <div className="flex flex-1 overflow-hidden">
                                {/* Left: Filters (Desktop) */}
                                <div className="hidden md:block w-1/3 border-r border-secondary/10 overflow-y-auto p-6 bg-secondary/5">
                                    <FiltersSidebar
                                        activeFilters={filters}
                                        onFilterChange={setFilters}
                                    />
                                </div>

                                {/* Right: Suggestions/Results (Desktop & Mobile) */}
                                <div className={`flex-1 overflow-y-auto p-6 ${showMobileFilters ? "hidden md:block" : ""}`}>
                                    {query.length > 1 && suggestions?.length === 0 && (
                                        <div className="p-8 text-center">
                                            <p className="font-bold text-muted-foreground">No matches found for &quot;{query}&quot;</p>
                                        </div>
                                    )}

                                    {suggestions && suggestions.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground px-4 mb-2">Top Suggestions</p>
                                            {suggestions.map((product) => (
                                                <Link
                                                    key={product.id}
                                                    href={`/product/${product.id}`}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center justify-between p-4 hover:bg-secondary/10 rounded-2xl transition-all group cursor-pointer"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <img src={product.image} className="w-12 h-12 rounded-xl object-cover" alt={product.name} />
                                                        <div>
                                                            <p className="font-bold tracking-tight group-hover:text-primary">{product.name}</p>
                                                            <p className="text-xs text-muted-foreground">{product.category}</p>
                                                        </div>
                                                    </div>
                                                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {query.length === 0 && (
                                        <div className="p-8 text-center space-y-4">

                                            <div className="md:hidden">
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setShowMobileFilters(true)}
                                                    className="w-full mb-4"
                                                >
                                                    <SlidersHorizontal className="mr-2 h-4 w-4" /> Filter Options
                                                </Button>
                                            </div>

                                            <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-4">Quick Links</p>
                                            <div className="grid grid-cols-2 gap-4">
                                                {["Men", "Women", "Accessories", "New Arrivals"].map(tag => (
                                                    <button
                                                        key={tag}
                                                        onClick={() => {
                                                            setQuery(tag);
                                                            inputRef.current?.focus();
                                                        }}
                                                        className="p-4 bg-secondary/10 hover:bg-primary hover:text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                                    >
                                                        {tag}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Mobile Filters View */}
                                {showMobileFilters && (
                                    <div className="md:hidden flex-1 overflow-y-auto p-6 bg-background absolute inset-0 z-10 top-20 flex flex-col">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-lg">Filter Options</h3>
                                            <Button variant="ghost" size="sm" onClick={() => setShowMobileFilters(false)}>Close</Button>
                                        </div>
                                        <FiltersSidebar
                                            activeFilters={filters}
                                            onFilterChange={setFilters}
                                        />
                                        <div className="mt-8">
                                            <Button className="w-full" onClick={() => setShowMobileFilters(false)}>View {suggestions?.length || 0} Results</Button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 border-t border-secondary/10 bg-background flex justify-end gap-3">
                                <Button variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
                                <Button onClick={() => { applyFilters(); setIsOpen(false); onSearch?.(); }}>
                                    View Results
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
