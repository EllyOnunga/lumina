import Autoplay from "embla-carousel-autoplay";
import useEmblaCarousel from "embla-carousel-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { ShoppingBag, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export function Hero() {
    const [emblaRef] = useEmblaCarousel({ loop: true, duration: 40 }, [Autoplay()]);
    const { addToCartAsync, isAddingToCart } = useCart();
    const [, setLocation] = useLocation();

    const { data: featuredProducts, isLoading } = useQuery<Product[]>({
        queryKey: ["/api/products", { isFeatured: true }],
    });

    const handleQuickAdd = async (productId: number) => {
        try {
            await addToCartAsync({ productId, quantity: 1 });
        } catch (error) {
            console.error("Failed to add to cart", error);
        }
    };

    const handleExplore = () => {
        if (window.location.pathname !== "/") {
            setLocation("/#products");
        } else {
            const productsElement = document.getElementById("products");
            if (productsElement) {
                productsElement.scrollIntoView({ behavior: "smooth" });
            }
        }
    };

    if (isLoading) {
        return <Skeleton className="h-[80vh] w-full bg-secondary/20" />;
    }

    const slides = featuredProducts?.slice(0, 3) || [];

    if (slides.length === 0) {
        return (
            <section className="relative h-[60vh] flex items-center justify-center bg-muted">
                <div className="text-center space-y-4">
                    <h2 className="text-4xl font-black tracking-tighter">New Collection Coming Soon</h2>
                    <Button onClick={handleExplore} className="rounded-xl px-12 h-14 uppercase tracking-widest font-black">
                        Browse All Products
                    </Button>
                </div>
            </section>
        );
    }

    return (
        <section className="hero-container">
            <div className="h-full" ref={emblaRef}>
                <div className="flex h-full">
                    {slides.map((product) => (
                        <div key={product.id} className="hero-slide">
                            <div className="hero-image-container">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="hero-image"
                                />
                                <div className="hero-overlay" />
                            </div>

                            <div className="hero-content">
                                <h2 className="hero-title">
                                    {product.name}
                                </h2>
                                <p className="hero-description">
                                    {product.description}
                                </p>
                                <div className="hero-actions">
                                    <Button
                                        size="lg"
                                        className="group rounded-xl px-12 h-16 text-xs uppercase font-black tracking-[0.2em] bg-white text-black hover:bg-accent hover:text-white border-0 w-full sm:w-auto transition-all duration-500 shadow-2xl"
                                        onClick={() => setLocation(`/product/${product.id}`)}
                                    >
                                        <span className="relative z-10 flex items-center gap-3">
                                            View Details
                                            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-2" />
                                        </span>
                                    </Button>
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="rounded-xl px-12 h-16 text-xs uppercase font-black tracking-[0.2em] bg-transparent text-white border-2 border-white/50 hover:bg-white hover:text-black w-full sm:w-auto transition-all duration-500 backdrop-blur-sm"
                                        onClick={() => handleQuickAdd(product.id)}
                                        disabled={isAddingToCart}
                                    >
                                        <ShoppingBag className="w-5 h-5 mr-3" />
                                        {isAddingToCart ? "Adding..." : "Quick Add"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

