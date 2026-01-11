import { useQuery } from "@tanstack/react-query";
import { SlidersHorizontal, Trash2, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

export interface Facets {
    categories: { id: number; name: string; count: number }[];
    brands: { name: string; count: number }[];
    priceRange: { min: number; max: number };
    attributes: { name: string; values: string[] }[];
}

export interface ActiveFilters {
    search: string;
    category: number[];
    brand: string[];
    price: number[];
    attributes: Record<string, string[]>;
}

interface FiltersSidebarProps {
    onFilterChange: (filters: ActiveFilters) => void;
    activeFilters: ActiveFilters;
}

export function FiltersSidebar({ onFilterChange, activeFilters }: FiltersSidebarProps) {
    const { data: facets } = useQuery<Facets>({
        queryKey: ["/api/products/facets"],
    });

    const updateFilter = (type: 'category' | 'brand', value: string | number, checked: boolean) => {
        if (type === 'category') {
            const current = activeFilters.category || [];
            const next = checked
                ? [...current, value as number]
                : current.filter((v) => v !== value);
            onFilterChange({ ...activeFilters, category: next });
        } else if (type === 'brand') {
            const current = activeFilters.brand || [];
            const next = checked
                ? [...current, value as string]
                : current.filter((v) => v !== value);
            onFilterChange({ ...activeFilters, brand: next });
        }
    };

    const clearAll = () => {
        onFilterChange({
            ...activeFilters,
            category: [],
            brand: [],
            price: [0, facets?.priceRange.max || 100000],
            attributes: {}
        });
    };

    if (!facets) return null;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-black tracking-tighter flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 mx-0" />
                    Filters
                </h3>
                <Button variant="ghost" size="sm" onClick={clearAll} className="h-8 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3 h-3 mr-2" />
                    Clear All
                </Button>
            </div>

            {/* Price Range */}
            <div className="space-y-4">
                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Price Spectrum</p>
                <div className="px-2 pt-2">
                    <Slider
                        defaultValue={[0, facets.priceRange.max]}
                        max={facets.priceRange.max}
                        step={100}
                        onValueChange={(val) => onFilterChange({ ...activeFilters, price: val })}
                        className="mb-4"
                    />
                    <div className="flex justify-between text-[10px] font-mono font-black italic">
                        <span>KSH {activeFilters.price?.[0] || 0}</span>
                        <span>KSH {activeFilters.price?.[1] || facets.priceRange.max}</span>
                    </div>
                </div>
            </div>

            <Separator className="bg-muted" />

            {/* Categories */}
            <Accordion type="single" collapsible defaultValue="categories" className="w-full">
                <AccordionItem value="categories" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-0">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Classifications</p>
                    </AccordionTrigger>
                    <AccordionContent className="pt-6">
                        <div className="space-y-3">
                            {facets.categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    className="flex items-center justify-between group cursor-pointer w-full text-left"
                                    onClick={() => updateFilter('category', cat.id, !activeFilters.category?.includes(cat.id))}
                                    aria-label={`Filter by ${cat.name}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all",
                                            activeFilters.category?.includes(cat.id) ? "bg-accent border-accent" : "border-input group-hover:border-accent"
                                        )}>
                                            {activeFilters.category?.includes(cat.id) && <Check className="w-3 h-3 text-white stroke-[4px]" />}
                                        </div>
                                        <span className={cn(
                                            "text-sm font-bold tracking-tight transition-colors",
                                            activeFilters.category?.includes(cat.id) ? "text-accent" : "text-foreground/70 group-hover:text-foreground"
                                        )}>{cat.name}</span>
                                    </div>
                                    <Badge variant="outline" className="rounded-full h-5 px-2 border-muted text-[10px] font-black italic">{cat.count}</Badge>
                                </button>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>

            <Separator className="bg-muted" />

            {/* Brands */}
            {facets.brands.length > 0 && (
                <>
                    <div className="space-y-4">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Makers & Brands</p>
                        <div className="space-y-3">
                            {facets.brands.map((brand) => (
                                <button
                                    key={brand.name}
                                    className="flex items-center justify-between group cursor-pointer w-full text-left"
                                    onClick={() => updateFilter('brand', brand.name, !activeFilters.brand?.includes(brand.name))}
                                    aria-label={`Filter by brand ${brand.name}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-4 h-4 rounded-sm border-2 flex items-center justify-center transition-all",
                                            activeFilters.brand?.includes(brand.name) ? "bg-accent border-accent" : "border-input group-hover:border-accent"
                                        )}>
                                            {activeFilters.brand?.includes(brand.name) && <Check className="w-3 h-3 text-white stroke-[4px]" />}
                                        </div>
                                        <span className={cn(
                                            "text-sm font-bold tracking-tight transition-colors",
                                            activeFilters.brand?.includes(brand.name) ? "text-accent" : "text-foreground/70 group-hover:text-foreground"
                                        )}>{brand.name}</span>
                                    </div>
                                    <Badge variant="outline" className="rounded-full h-5 px-2 border-muted text-[10px] font-black italic">{brand.count}</Badge>
                                </button>
                            ))}
                        </div>
                    </div>
                    <Separator className="bg-muted" />
                </>
            )}

            {/* Attributes (e.g. Size, Color) */}
            {facets.attributes.map(attr => (
                <div key={attr.name} className="space-y-4">
                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">{attr.name}</p>
                    <div className="flex flex-wrap gap-2">
                        {attr.values.map(val => (
                            <button
                                key={val}
                                onClick={() => {
                                    const current = activeFilters.attributes?.[attr.name] || [];
                                    const next = current.includes(val)
                                        ? current.filter((v: string) => v !== val)
                                        : [...current, val];
                                    onFilterChange({
                                        ...activeFilters,
                                        attributes: { ...activeFilters.attributes, [attr.name]: next }
                                    });
                                }}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border-2 transition-all",
                                    activeFilters.attributes?.[attr.name]?.includes(val)
                                        ? "bg-accent border-accent text-white shadow-xl shadow-accent/20"
                                        : "bg-muted border-transparent hover:border-accent/30 text-foreground/70"
                                )}
                            >
                                {val}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
