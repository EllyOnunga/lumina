import { Skeleton } from "@/components/ui/skeleton";

export function ProductSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="aspect-[3/4] w-full bg-muted" />
            <Skeleton className="h-4 w-2/3 bg-muted" />
            <Skeleton className="h-4 w-1/3 bg-muted" />
        </div>
    );
}

export function GridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <>
            {Array(count).fill(0).map((_, i) => (
                <ProductSkeleton key={i} />
            ))}
        </>
    );
}
