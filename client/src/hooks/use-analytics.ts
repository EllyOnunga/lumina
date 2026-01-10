import { useEffect } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";

export function useAnalytics() {
    const [location] = useLocation();

    useEffect(() => {
        // Track page view
        // Use a timeout to avoid blocking main thread and ensure navigation is complete
        const timer = setTimeout(() => {
            apiRequest("POST", "/api/analytics/event", {
                eventType: "page_view",
                metadata: {
                    path: location,
                    title: document.title,
                    userAgent: navigator.userAgent,
                    timestamp: new Date().toISOString()
                }
            }).catch(err => console.error("Analytics error:", err));
        }, 1000);

        return () => clearTimeout(timer);
    }, [location]);
}
