import { useQuery } from "@tanstack/react-query";
import { type Product, type Category } from "@shared/schema";
import { ProductCard } from "../product/ProductCard";
import { ArrowRight, LayoutGrid, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface CategoryWithProducts extends Category {
    products: Product[];
}

export function CategoryExplorer() {
    const { data: categories, isLoading } = useQuery<CategoryWithProducts[]>({
        queryKey: ["/api/categories/with-products"],
    });

    if (isLoading || !categories || categories.length === 0) return null;

    return (
        <section className="py-24 container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary uppercase text-[10px] font-black tracking-widest">
                        <LayoutGrid className="w-4 h-4" />
                        Ecosystem Exploration
                    </div>
                    <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-foreground italic">
                        BROWSE BY<br />CLASSIFICATION
                    </h2>
                </div>
                <p className="text-muted-foreground font-medium max-w-md text-right">
                    Navigate through our curated collections, organized for precision and style discovery across the global manifest.
                </p>
            </div>

            <div className="space-y-32">
                {categories.map((category) => (
                    <div key={category.id} className="group">
                        <div className="flex items-center justify-between mb-12 border-b border-border/50 pb-8 group-hover:border-primary/50 transition-colors">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-secondary/10 dark:bg-white/5 rounded-3xl flex items-center justify-center text-3xl font-black text-foreground group-hover:bg-primary group-hover:text-black transition-all">
                                    {category.name[0]}
                                </div>
                                <div>
                                    <h3 className="text-4xl font-black tracking-tighter text-foreground uppercase">{category.name}</h3>
                                    <p className="text-muted-foreground font-medium">{category.description || "Premium registered assets"}</p>
                                </div>
                            </div>
                            <Link href={`/?category=${category.id}`}>
                                <Button variant="ghost" className="rounded-2xl h-14 px-8 font-black uppercase text-[10px] tracking-widest gap-2 group/btn">
                                    Explore Collection
                                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </Button>
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                            {category.products.slice(0, 4).map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                            {category.products.length === 0 && (
                                <div className="col-span-full py-20 bg-secondary/5 rounded-[2rem] border border-dashed border-border flex flex-col items-center justify-center text-center">
                                    <Sparkles className="w-10 h-10 text-muted-foreground opacity-20 mb-4" />
                                    <p className="text-muted-foreground font-bold uppercase text-xs tracking-widest">Awaiting inventory arrival</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
