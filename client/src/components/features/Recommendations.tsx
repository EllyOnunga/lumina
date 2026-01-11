import { useQuery } from "@tanstack/react-query";
import { type Product } from "@shared/schema";
import { ProductCard } from "@/components/product/ProductCard";
import { Skeleton } from "@/components/ui/skeleton";

interface RecommendationsProps {
    productId: number;
}

export function Recommendations({ productId }: RecommendationsProps) {
    const { data, isLoading } = useQuery<{ frequentlyBought: Product[], recommended: Product[] }>({
        queryKey: [`/api/products/${productId}/recommendations`],
    });

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-80 w-full rounded-3xl" />)}
            </div>
        );
    }

    const { frequentlyBought = [], recommended = [] } = data || {};

    return (
        <div className="space-y-16 mt-24">
            {frequentlyBought.length > 0 && (
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic">Frequently Bought Together</h2>
                        <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                        {frequentlyBought.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            )}

            {recommended.length > 0 && (
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic">Recommended For You</h2>
                        <div className="h-px flex-1 bg-border" />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
                        {recommended.map(product => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
