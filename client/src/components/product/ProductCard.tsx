
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useCurrency } from "@/hooks/use-currency";
import type { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useWishlist } from "@/hooks/use-wishlist";
import { useCart } from "@/hooks/use-cart";

interface ProductCardProps {
    product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { addToCartAsync, isAddingToCart } = useCart();
    const { formatPrice } = useCurrency();
    const isWishlisted = isInWishlist(product.id);

    const handleQuickAdd = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            await addToCartAsync({ productId: product.id, quantity: 1, product });
        } catch (error) {
            console.error("Failed to add to cart", error);
        }
    };

    return (
        <div className="group relative bg-card/40 dark:bg-card/20 backdrop-blur-sm border border-border/40 dark:border-white/10 rounded-3xl overflow-hidden transition-all duration-700 hover:bg-card/80 dark:hover:bg-card/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.05),0_1px_2px_rgba(0,0,0,0.02)] dark:hover:shadow-none hover:-translate-y-1 hover:border-accent/20">
            <Link href={`/product/${product.id}`} className="block cursor-pointer">
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary/30">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform duration-1000 group-hover:scale-105"
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </div>
            </Link>

            {/* Quick Actions - Floating inside the image area */}
            <div className="absolute top-0 left-0 right-0 aspect-[4/5] pointer-events-none p-4">
                <div className="absolute bottom-4 left-4 right-4 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 ease-out z-10 pointer-events-auto">
                    <Button
                        className="w-full bg-background dark:bg-card backdrop-blur-md text-foreground hover:bg-primary hover:text-primary-foreground transition-all h-12 rounded-xl uppercase text-[10px] tracking-widest font-black border border-border/10 dark:border-white/5 shadow-xl shadow-black/5"
                        disabled={isAddingToCart}
                        onClick={handleQuickAdd}
                    >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        {isAddingToCart ? "Adding..." : "Add to Cart"}
                    </Button>
                </div>

                <div className="absolute top-4 right-4 translate-x-8 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500 z-10 pointer-events-auto">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full h-10 w-10 bg-background dark:bg-card backdrop-blur-md text-foreground shadow-lg border border-border/10 dark:border-white/5 hover:bg-primary hover:text-primary-foreground"
                        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(product.id);
                        }}
                    >
                        <Heart className={cn("h-4 w-4 transition-colors", isWishlisted && "fill-current text-destructive")} />
                    </Button>
                </div>
            </div>

            <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                        <p className="text-accent text-[10px] font-black uppercase tracking-[0.2em]">
                            {product.category}
                        </p>
                        {product.rating && (
                            <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 fill-accent text-accent" />
                                <span className="text-[10px] font-black">{product.rating}</span>
                            </div>
                        )}
                    </div>
                    <Link href={`/product/${product.id}`} className="block tracking-tight text-foreground">
                        <h3 className="font-bold text-lg leading-tight group-hover:text-accent transition-colors line-clamp-1">
                            {product.name}
                        </h3>
                    </Link>
                </div>

                <div className="flex items-center justify-between gap-2 pt-4 border-t border-border/20">
                    <p className="font-black text-xl tracking-tighter text-foreground">
                        {formatPrice(product.price)}
                    </p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Detail ↗</span>
                </div>
            </div>
        </div>
    );
}
