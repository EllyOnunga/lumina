import { Route, Redirect } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({
    path,
    component: Component,
    adminOnly = false,
}: {
    path: string;
    component: React.ComponentType<unknown>;
    adminOnly?: boolean;
}) {
    const { data: user, isLoading } = useQuery<User>({
        queryKey: ["/api/user"],
        retry: false,
    });

    return (
        <Route path={path}>
            {(params) => {
                if (isLoading) {
                    return (
                        <div className="flex items-center justify-center min-h-screen">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    );
                }

                if (!user) {
                    return <Redirect to="/auth" />;
                }

                if (adminOnly && !user.isAdmin) {
                    return <Redirect to="/" />;
                }

                return <Component {...params} />;
            }}
        </Route>
    );
}
