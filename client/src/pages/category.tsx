import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { Layout } from "@/components/layout/Layout";
import type { Product, Category } from "@shared/schema";
import { ProductCard } from "@/components/product/ProductCard";
import { GridSkeleton } from "@/components/ui/skeletons";
import { ArrowLeft, LayoutGrid, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CategoryPage() {
    const { id } = useParams();
    const categoryId = id ? parseInt(id) : undefined;

    const { data: category, isLoading: isLoadingCategory } = useQuery<Category>({
        queryKey: [`/api/categories/${categoryId}`],
        enabled: !!categoryId,
    });

    const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
        queryKey: [
            "/api/products",
            {
                category: categoryId,
            }
        ],
        enabled: !!categoryId,
    });

    const isLoading = isLoadingCategory || isLoadingProducts;

    if (!categoryId) return <div>Invalid Category</div>;

    return (
        <Layout>
            <div className="min-h-screen bg-background">
                {/* Hero / Header Section */}
                <section className="relative pt-32 pb-16 overflow-hidden">
                    <div className="absolute inset-0 z-0">
                        <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 to-background" />
                        <div className="absolute top-0 right-0 p-20 opacity-10 transform rotate-12">
                            <Sparkles className="w-96 h-96 text-primary" />
                        </div>
                    </div>

                    <div className="container mx-auto px-4 relative z-10">
                        <Link href="/">
                            <Button variant="ghost" className="mb-8 pl-0 hover:bg-transparent hover:text-primary gap-2 transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Back to Collection
                            </Button>
                        </Link>

                        {isLoadingCategory ? (
                            <div className="space-y-4 animate-pulse">
                                <div className="h-12 w-1/3 bg-secondary/50 rounded-xl" />
                                <div className="h-6 w-2/3 bg-secondary/30 rounded-xl" />
                            </div>
                        ) : (
                            <div className="max-w-3xl">
                                <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 uppercase">
                                    {category?.name}
                                    <span className="text-primary">.</span>
                                </h1>
                                <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl">
                                    {category?.description || `Explore our exclusive collection of ${category?.name} products.`}
                                </p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Products Grid */}
                <section className="py-12 container mx-auto px-4">
                    <div className="flex items-center justify-between mb-8">
                        <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground">
                            {products?.length || 0} ITEMS FOUND
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            <GridSkeleton count={8} />
                        </div>
                    ) : products?.length === 0 ? (
                        <div className="py-24 text-center border-2 border-dashed border-secondary/50 rounded-3xl bg-secondary/5">
                            <div className="h-20 w-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <LayoutGrid className="w-10 h-10 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">No Products Found</h3>
                            <p className="text-muted-foreground mb-8">We couldn&apos;t find any products in this category yet.</p>
                            <Link href="/">
                                <Button>Discover Other items</Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12 sm:gap-8">
                            {products?.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </Layout>
    );
}
