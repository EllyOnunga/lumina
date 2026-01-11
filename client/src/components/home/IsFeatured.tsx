
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
        <section className="py-24 container mx-auto px-4 overflow-hidden">
            <div className="bg-white/50 backdrop-blur-md border border-white rounded-3xl p-12 md:p-20 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-700">
                <div className="flex flex-col items-center text-center mb-20 space-y-6">
                    <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-accent/5 text-accent rounded-full border border-accent/20 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <Sparkles className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Exclusively Curated</span>
                    </div>
                    <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase italic leading-none animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Top <span className="text-accent">Clearance</span>
                    </h2>
                    <p className="text-muted-foreground max-w-2xl text-lg md:text-xl font-medium opacity-70 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                        A premium selection of our most coveted pieces, handpicked for the discerning modern trendsetter.
                    </p>
                </div>

                {isLoading ? (
                    <GridSkeleton count={5} />
                ) : (
                    <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-16">
                        {featuredProducts?.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </section>
    );
}
