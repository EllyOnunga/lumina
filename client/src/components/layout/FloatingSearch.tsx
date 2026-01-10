import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, X, Loader2, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { Product } from "@shared/schema";
import { Link, useLocation } from "wouter";

interface FloatingSearchProps {
    onSearch?: () => void;
}

export function FloatingSearch({ onSearch }: FloatingSearchProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [, setLocation] = useLocation();
    const inputRef = useRef<HTMLInputElement>(null);

    const { data: suggestions, isLoading } = useQuery<Product[]>({
        queryKey: [`/api/products/search/suggestions?q=${query}`],
        enabled: query.length > 1,
    });

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === "Escape") {
                setIsOpen(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            setLocation(`/?search=${encodeURIComponent(query)}#products`);
            setIsOpen(false);
            onSearch?.();
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-3 px-4 py-2 bg-secondary/10 hover:bg-secondary/20 rounded-full transition-all group"
            >
                <Search className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm font-bold text-muted-foreground/60 hidden md:inline-block">Search Lumina Catalog...</span>
                <kbd className="hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="container mx-auto max-w-2xl mt-32 px-4">
                        <div className="relative bg-background border border-secondary/20 shadow-2xl rounded-[2.5rem] overflow-hidden">
                            <form onSubmit={handleSearch} className="flex items-center px-8 h-20 border-b border-secondary/10">
                                <Search className="w-6 h-6 text-primary mr-4" />
                                <Input
                                    ref={inputRef}
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Type to find products, categories, or styles..."
                                    className="flex-1 bg-transparent border-none focus-visible:ring-0 text-xl font-bold p-0"
                                />
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                ) : (
                                    <button type="button" onClick={() => setIsOpen(false)} aria-label="Close search" title="Close search">
                                        <X className="w-6 h-6 text-muted-foreground hover:text-foreground transition-colors" />
                                    </button>
                                )}
                            </form>

                            <div className="p-4 max-h-[400px] overflow-y-auto">
                                {query.length > 1 && suggestions?.length === 0 && (
                                    <div className="p-8 text-center">
                                        <p className="font-bold text-muted-foreground">No matches found for &quot;{query}&quot;</p>
                                    </div>
                                )}

                                {suggestions && suggestions.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground px-4 mb-2">Top Suggestions</p>
                                        {suggestions.map((product) => (
                                            <Link
                                                key={product.id}
                                                href={`/product/${product.id}`}
                                                onClick={() => setIsOpen(false)}
                                                className="flex items-center justify-between p-4 hover:bg-secondary/10 rounded-2xl transition-all group cursor-pointer"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <img src={product.image} className="w-12 h-12 rounded-xl object-cover" alt={product.name} />
                                                    <div>
                                                        <p className="font-bold tracking-tight group-hover:text-primary">{product.name}</p>
                                                        <p className="text-xs text-muted-foreground">{product.category}</p>
                                                    </div>
                                                </div>
                                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all text-primary" />
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                {query.length === 0 && (
                                    <div className="p-8 text-center space-y-4">
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                            {["Men", "Women", "Accessories", "New Arrivals"].map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={() => {
                                                        setQuery(tag);
                                                        inputRef.current?.focus();
                                                    }}
                                                    className="p-4 bg-secondary/10 hover:bg-primary hover:text-primary-foreground rounded-2xl font-black text-xs uppercase tracking-widest transition-all"
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
