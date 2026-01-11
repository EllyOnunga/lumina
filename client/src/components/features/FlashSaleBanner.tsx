import { useQuery } from "@tanstack/react-query";
import { type FlashSale } from "@shared/schema";
import { useState, useEffect } from "react";
import { Timer, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export function FlashSaleBanner() {
    const [, setLocation] = useLocation();
    const { data: sales = [] } = useQuery<FlashSale[]>({
        queryKey: ["/api/flash-sales"],
    });

    const activeSale = sales[0]; // Just show the first active one for now

    const [timeLeft, setTimeLeft] = useState<{ h: number, m: number, s: number } | null>(null);

    useEffect(() => {
        if (!activeSale) return;

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const end = new Date(activeSale.endTime).getTime();
            const diff = end - now;

            if (diff <= 0) {
                setTimeLeft(null);
                clearInterval(interval);
            } else {
                setTimeLeft({
                    h: Math.floor((diff / (1000 * 60 * 60))),
                    m: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
                    s: Math.floor((diff % (1000 * 60)) / 1000),
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [activeSale]);

    if (!activeSale || !timeLeft) return null;

    return (
        <div className="bg-primary text-primary-foreground py-3 px-4 overflow-hidden relative group">
            <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                <div className="flex items-center gap-2 font-black uppercase tracking-tighter text-xl italic italic">
                    <Zap className="fill-current animate-pulse text-yellow-400" />
                    {activeSale.name}
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 font-mono text-2xl font-bold bg-black/20 px-3 py-1 rounded">
                        <Timer className="w-5 h-5" />
                        <span>{String(timeLeft.h).padStart(2, '0')}</span>:
                        <span>{String(timeLeft.m).padStart(2, '0')}</span>:
                        <span>{String(timeLeft.s).padStart(2, '0')}</span>
                    </div>
                    <span className="hidden md:inline text-sm font-medium opacity-80 uppercase tracking-widest">Ending Soon</span>
                </div>

                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setLocation(`/flash-sale/${activeSale.id}`)}
                    className="rounded-none uppercase tracking-widest text-xs font-bold px-6 group-hover:bg-white group-hover:text-black transition-colors"
                >
                    Shop Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-full bg-white/5 skew-x-12 -translate-y-1/2" />
        </div>
    );
}
