import { useQuery } from "@tanstack/react-query";
import { type Product, type FlashSale, type FlashSaleProduct } from "@shared/schema";
import { ProductCard } from "../product/ProductCard";
import { useEffect, useState } from "react";
import { Timer, Zap, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DetailedFlashSale extends FlashSale {
    products: (FlashSaleProduct & { product: Product })[];
}

export function FlashSaleSection() {
    const { data: sales, isLoading } = useQuery<DetailedFlashSale[]>({
        queryKey: ["/api/flash-sales/active"],
    });

    const [timeLeft, setTimeLeft] = useState<string>("");

    useEffect(() => {
        if (!sales || sales.length === 0) return;

        const endTime = new Date(sales[0].endTime).getTime();

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft("00:00:00");
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
            );
        }, 1000);

        return () => clearInterval(interval);
    }, [sales]);

    if (isLoading || !sales || sales.length === 0) return null;

    const sale = sales[0];

    return (
        <section className="py-24 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-400 via-orange-600 to-amber-700 overflow-hidden relative">
            {/* Decorative background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-yellow-300/30 rounded-full blur-[160px] animate-pulse" />
                <div className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-red-600/20 rounded-full blur-[160px]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center justify-between mb-20 gap-12">
                    <div className="space-y-6 text-center lg:text-left">
                        <div className="flex items-center gap-2 px-5 py-2.5 bg-black border-2 border-white rounded-full w-fit mx-auto lg:mx-0 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
                            <Zap className="w-4 h-4 text-yellow-400 fill-yellow-400 animate-bounce" />
                            <span className="text-white font-black uppercase text-xs tracking-wider">Limited Time Offer</span>
                            <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                        </div>
                        <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white italic drop-shadow-2xl">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-200 to-white">
                                {sale.name.toUpperCase()}
                            </span>
                        </h2>
                        <p className="text-white font-bold text-xl max-w-xl leading-relaxed drop-shadow-md">
                            {sale.description}
                        </p>
                    </div>

                    <div className="bg-black/20 backdrop-blur-2xl border-2 border-white/30 p-10 rounded-[3rem] flex flex-col items-center gap-6 min-w-[340px] shadow-2xl relative group">
                        <div className="absolute -top-6 -right-6 bg-white text-orange-600 font-black px-6 py-2 rounded-2xl rotate-12 shadow-2xl border-2 border-orange-600 animate-bounce">
                            HOT!
                        </div>
                        <div className="flex items-center gap-3 text-yellow-200 uppercase text-xs font-black tracking-[0.3em]">
                            <Timer className="w-5 h-5 animate-spin-slow" />
                            Ends In
                        </div>
                        <div className="text-7xl font-black tracking-tighter text-white font-mono tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">
                            {timeLeft}
                        </div>
                        <div className="flex gap-10 mt-2">
                            <div className="text-center">
                                <p className="text-xs font-black text-white/80 uppercase tracking-widest">Hours</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-black text-white/80 uppercase tracking-widest">Min</p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs font-black text-white/80 uppercase tracking-widest">Sec</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                    {sale.products.map(({ product, salePrice }) => (
                        <div key={product.id} className="relative group perspective-1000">
                            <div className="absolute -top-5 -right-5 z-20 bg-black text-white font-black px-5 py-2.5 rounded-2xl rotate-12 shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] border-2 border-white group-hover:rotate-0 transition-transform duration-300">
                                -{Math.round((1 - salePrice / product.price) * 100)}%
                            </div>
                            <div className="transform transition-all duration-500 group-hover:scale-105 group-hover:-rotate-1">
                                <ProductCard
                                    product={{ ...product, price: salePrice }}
                                    originalPrice={product.price}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-20 flex justify-center">
                    <Button className="h-20 px-14 rounded-3xl bg-white text-orange-600 hover:bg-black hover:text-white font-black text-xl gap-4 shadow-2xl transition-all hover:scale-105 active:scale-95 group border-none">
                        Access Full Clearance
                        <ArrowRight className="w-6 h-6 group-hover:translate-x-3 transition-transform duration-300" />
                    </Button>
                </div>
            </div>
        </section>
    );
}
