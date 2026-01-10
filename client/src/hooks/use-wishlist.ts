import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useWishlist() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    const { data: wishlist = [] } = useQuery<Product[]>({
        queryKey: ["/api/wishlist"],
    });

    const addToWishlistMutation = useMutation({
        mutationFn: async (productId: number) => {
            const res = await fetch(`/api/wishlist/${productId}`, { method: "POST" });
            if (!res.ok) throw new Error("Failed to add");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
            toast({ title: "Added to wishlist" });
        },
        onError: () => {
            toast({ title: "Failed to add to wishlist", variant: "destructive" });
        }
    });

    const removeFromWishlistMutation = useMutation({
        mutationFn: async (productId: number) => {
            const res = await fetch(`/api/wishlist/${productId}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to remove");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
            toast({ title: "Removed from wishlist" });
        },
        onError: () => {
            toast({ title: "Failed to remove from wishlist", variant: "destructive" });
        }
    });

    const isInWishlist = (productId: number) => wishlist.some(p => p.id === productId);

    const toggleWishlist = (productId: number) => {
        if (isInWishlist(productId)) {
            removeFromWishlistMutation.mutate(productId);
        } else {
            addToWishlistMutation.mutate(productId);
        }
    };

    return { wishlist, toggleWishlist, isInWishlist };
}
