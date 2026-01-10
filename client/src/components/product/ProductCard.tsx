
import { Link } from "wouter";
import { formatCurrency, cn } from "@/lib/utils";
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
        <div className="group relative">
            <Link href={`/product/${product.id}`} className="block cursor-pointer">
                <div className="relative aspect-[3/4] mb-4 overflow-hidden bg-muted rounded-[var(--radius)]">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors duration-300" />
                </div>
            </Link>

            {/* Quick Actions - Visible on Hover (Outside the Link to prevent navigation) */}
            <div className="absolute top-0 left-0 right-0 aspect-[3/4] pointer-events-none">
                <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10 pointer-events-auto">
                    <Button
                        className="w-full bg-primary text-primary-foreground hover:bg-accent hover:text-accent-foreground transition-all h-10 rounded-[var(--radius)] uppercase text-[10px] tracking-widest font-black border-0 shadow-xl"
                        disabled={isAddingToCart}
                        onClick={handleQuickAdd}
                    >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        {isAddingToCart ? "Adding..." : "Quick Add"}
                    </Button>
                </div>

                <div className="absolute top-4 right-4 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 z-10 pointer-events-auto">
                    <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full h-8 w-8 bg-background/90 hover:bg-background text-foreground shadow-md border-0"
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

            <div className="space-y-1">
                <Link href={`/product/${product.id}`} className="block tracking-tight">
                    <h3 className="font-bold text-base leading-tight group-hover:text-accent transition-colors">
                        {product.name}
                    </h3>
                </Link>
                <p className="text-muted-foreground text-[10px] uppercase font-black tracking-widest">{product.category}</p>
                {product.rating !== undefined && (
                    <div className="flex items-center gap-1 mt-1">
                        <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={cn("w-2.5 h-2.5", i < (product.rating || 0) ? "fill-accent text-accent" : "text-input")} />
                            ))}
                        </div>
                        <span className="text-[10px] font-black text-muted-foreground italic">({product.reviewCount})</span>
                    </div>
                )}
                <p className="font-black mt-2 text-lg tracking-tighter italic">{formatCurrency(product.price)}</p>
            </div>
        </div>
    );
}
