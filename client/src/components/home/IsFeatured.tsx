
import { useQuery } from "@tanstack/react-query";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@shared/schema";
import { GridSkeleton } from "@/components/ui/skeletons";
import { Sparkles } from "lucide-react";

export function IsFeatured() {
    const { data: featuredProducts, isLoading } = useQuery<Product[]>({
        queryKey: ["/api/products", { isFeatured: true }],
    });

    if (!isLoading && (!featuredProducts || featuredProducts.length === 0)) {
        return null;
    }

    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col items-center text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-full border border-primary/10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Exclusively Curated</span>
                    </div>
                    <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Featured <span className="text-primary">Styles</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl text-lg font-light animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                        A premium selection of our most coveted pieces, handpicked for the discerning modern trendsetter.
                    </p>
                </div>

                {isLoading ? (
                    <GridSkeleton count={4} />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {featuredProducts?.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
