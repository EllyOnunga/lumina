import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User, Product } from "@shared/schema";
import { useEffect } from "react";

interface CartItem {
    id: number;
    productId: number;
    quantity: number;
    product: Product;
}

interface Cart {
    id: number;
    userId?: number;
    isOpen: boolean;
    items: CartItem[];
}

export function useCart() {
    const { toast } = useToast();
    const { data: localCartItems = [], isLoading: isLocalLoading } = useQuery<CartItem[]>({
        queryKey: ["guest_cart"],
        queryFn: () => {
            const saved = localStorage.getItem("guest_cart");
            return saved ? JSON.parse(saved) : [];
        }
    });

    // Helper to update local cart
    const setLocalCartItems = (newItems: CartItem[]) => {
        localStorage.setItem("guest_cart", JSON.stringify(newItems));
        queryClient.setQueryData(["guest_cart"], newItems);
    };

    // Check if user is authenticated
    const { data: user } = useQuery<User>({
        queryKey: ["/api/user"],
        retry: false,
    });

    const { data: serverCart, isLoading: isLoadingServer, error } = useQuery<Cart>({
        queryKey: ["/api/cart"],
        enabled: !!user,
    });

    // Merge carts when user logs in
    useEffect(() => {
        if (user && localCartItems.length > 0) {
            const mergeCarts = async () => {
                try {
                    await apiRequest("POST", "/api/cart/merge", { items: localCartItems });
                    setLocalCartItems([]); // Clears local storage and query cache
                    localStorage.removeItem("guest_cart");
                    queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
                    toast({ title: "Cart merged", description: "Your guest items have been added to your account" });
                } catch (e) {
                    console.error("Failed to merge cart", e);
                    toast({ title: "Failed to sync cart", description: "Could not merge guest items. Please try again.", variant: "destructive" });
                }
            };
            mergeCarts();
        }
    }, [user, localCartItems, toast]);

    // For now, we'll just use the appropriate data source
    const cart = user ? serverCart : {
        id: 0,
        isOpen: true,
        items: localCartItems
    };

    const addToCartMutation = useMutation({
        mutationFn: async ({ productId, quantity = 1, product }: { productId: number; quantity?: number; product?: Product }) => {
            if (user) {
                const res = await apiRequest("POST", "/api/cart", { productId, quantity });
                return res.json();
            } else {
                // Local cart logic
                if (!product) {
                    // Fetch product if not provided (rare case)
                    const res = await fetch(`/api/products/${productId}`);
                    const p = await res.json();
                    return { productId, quantity, product: p };
                }
                return { productId, quantity, product };
            }
        },
        onSuccess: (data, { productId, quantity = 1 }) => {
            if (user) {
                queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
            } else {
                const prev = localCartItems;
                const existing = prev.find(item => item.productId === productId);
                let newItems;
                if (existing) {
                    newItems = prev.map(item =>
                        item.productId === productId
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                } else {
                    newItems = [...prev, {
                        id: Date.now(),
                        productId,
                        quantity,
                        product: (data as { product: Product }).product
                    }];
                }
                setLocalCartItems(newItems);
            }
            toast({ title: "Added to cart" });
        },
        onError: (error: Error) => {
            toast({ title: "Failed to add to cart", description: error.message, variant: "destructive" });
        },
    });

    const removeFromCartMutation = useMutation({
        mutationFn: async (productId: number) => {
            if (user) {
                const res = await apiRequest("DELETE", `/api/cart/${productId}`, {});
                return res.json();
            }
            return productId;
        },
        onSuccess: (productId) => {
            if (user) {
                queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
            } else {
                setLocalCartItems(localCartItems.filter(item => item.productId !== productId));
            }
            toast({ title: "Removed from cart" });
        },
        onError: (error: Error) => {
            toast({ title: "Failed to remove from cart", description: error.message, variant: "destructive" });
        },
    });

    const updateCartItemMutation = useMutation({
        mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
            if (user) {
                const res = await apiRequest("PATCH", `/api/cart/${productId}`, { quantity });
                return res.json();
            }
            return { productId, quantity };
        },
        onSuccess: ({ productId, quantity }) => {
            if (user) {
                queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
            } else {
                setLocalCartItems(
                    localCartItems.map(item =>
                        item.productId === productId ? { ...item, quantity } : item
                    )
                );
            }
            toast({ title: "Cart updated" });
        },
        onError: (error: Error) => {
            toast({ title: "Failed to update cart", description: error.message, variant: "destructive" });
        },
    });

    const clearCartMutation = useMutation({
        mutationFn: async () => {
            if (user) {
                const res = await apiRequest("DELETE", "/api/cart");
                return res.json();
            }
            return null;
        },
        onSuccess: () => {
            if (user) {
                queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
            } else {
                setLocalCartItems([]);
            }
            toast({ title: "Cart cleared" });
        },
        onError: (error: Error) => {
            toast({ title: "Failed to clear cart", description: error.message, variant: "destructive" });
        },
    });

    const totalItems = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const totalPrice = cart?.items?.reduce((sum, item) => sum + item.product.price * item.quantity, 0) || 0;

    return {
        cart,
        isLoading: user ? isLoadingServer : isLocalLoading,
        error,
        totalItems,
        totalPrice,
        addToCart: addToCartMutation.mutate,
        addToCartAsync: addToCartMutation.mutateAsync,
        removeFromCart: removeFromCartMutation.mutate,
        updateCartItem: updateCartItemMutation.mutate,
        clearCart: clearCartMutation.mutate,
        isAddingToCart: addToCartMutation.isPending,
        isRemovingFromCart: removeFromCartMutation.isPending,
        isUpdatingCartItem: updateCartItemMutation.isPending,
        isClearingCart: clearCartMutation.isPending,
    };
}