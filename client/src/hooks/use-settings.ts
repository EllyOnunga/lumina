import { useQuery } from "@tanstack/react-query";
import { type Settings } from "@shared/settings-schema";

export function useSettings() {
    const { data: settings, isLoading, error } = useQuery<Settings>({
        queryKey: ["/api/settings"],
        // Settings are generally static for a session once loaded
        staleTime: 1000 * 60 * 60, // 1 hour
    });

    return {
        settings,
        isLoading,
        error
    };
}
