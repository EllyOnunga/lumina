import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { X, ArrowRightLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function Compare() {
    const [, setLocation] = useLocation();
    const [compareIds, setCompareIds] = useState<number[]>(() => {
        const saved = localStorage.getItem("compare_list");
        return saved ? JSON.parse(saved) : [];
    });

    const { data: products, isLoading } = useQuery<Product[]>({
        queryKey: ["/api/products"],
        enabled: compareIds.length > 0
    });

    const compareProducts = products?.filter(p => compareIds.includes(p.id)) || [];

    const handleRemove = (id: number) => {
        const newList = compareIds.filter(cid => cid !== id);
        setCompareIds(newList);
        localStorage.setItem("compare_list", JSON.stringify(newList));
    };

    if (isLoading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-12">
                    <Skeleton className="h-12 w-64 mb-12" />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <Skeleton className="h-96" />
                        <Skeleton className="h-96" />
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tighter mb-2 flex items-center gap-4">
                            <ArrowRightLeft className="w-8 h-8" />
                            Product Comparison
                        </h1>
                        <p className="text-muted-foreground">Compare features, specifications, and prices.</p>
                    </div>
                    <Button variant="outline" onClick={() => setLocation("/")} className="rounded-none uppercase tracking-widest text-xs font-bold border-2">
                        Add More Products
                    </Button>
                </div>

                {compareProducts.length === 0 ? (
                    <div className="text-center py-24 bg-secondary/30 border-2 border-dashed border-secondary">
                        <h2 className="text-2xl font-bold mb-4">Your comparison list is empty</h2>
                        <p className="text-muted-foreground mb-8">Add products from the shop to compare them side-by-side.</p>
                        <Button onClick={() => setLocation("/")} className="rounded-none uppercase tracking-widest px-8">
                            Start Shopping
                        </Button>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-6 border text-left bg-secondary/50 min-w-[200px]">Features</th>
                                    {compareProducts.map(product => (
                                        <th key={product.id} className="p-6 border min-w-[300px]">
                                            <div className="relative group">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-destructive text-destructive-foreground hover:bg-destructive shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleRemove(product.id)}
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                                <div className="aspect-[3/4] bg-secondary mb-4 overflow-hidden">
                                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                                </div>
                                                <h3 className="text-xl font-bold mb-2">{product.name}</h3>
                                                <p className="text-lg font-light">{formatCurrency(product.price)}</p>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="p-6 border font-bold bg-secondary/30">Category</td>
                                    {compareProducts.map(p => (
                                        <td key={p.id} className="p-6 border">{p.category}</td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-6 border font-bold bg-secondary/30">Description</td>
                                    {compareProducts.map(p => (
                                        <td key={p.id} className="p-6 border text-sm text-muted-foreground leading-relaxed">
                                            {p.description}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-6 border font-bold bg-secondary/30">Stock Status</td>
                                    {compareProducts.map(p => (
                                        <td key={p.id} className="p-6 border text-sm font-medium">
                                            {p.stock > 0 ? (
                                                <span className="text-emerald-500">In Stock ({p.stock})</span>
                                            ) : (
                                                <span className="text-destructive">Out of Stock</span>
                                            )}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-6 border font-bold bg-secondary/30">Specifications</td>
                                    {compareProducts.map(p => (
                                        <td key={p.id} className="p-6 border text-sm whitespace-pre-wrap leading-relaxed">
                                            {p.specifications || "No detailed specifications available."}
                                        </td>
                                    ))}
                                </tr>
                                <tr>
                                    <td className="p-6 border bg-secondary/30"></td>
                                    {compareProducts.map(p => (
                                        <td key={p.id} className="p-6 border text-center">
                                            <Button
                                                className="w-full rounded-none uppercase tracking-widest text-xs font-bold h-12"
                                                onClick={() => setLocation(`/product/${p.id}`)}
                                            >
                                                View Details
                                            </Button>
                                        </td>
                                    ))}
                                </tr>
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </Layout>
    );
}
