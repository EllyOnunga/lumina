import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Return, Order } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

type ReturnWithOrder = Return & { order: Order };

export default function AdminReturns() {
    const { toast } = useToast();
    const { data: returns, isLoading } = useQuery<ReturnWithOrder[]>({
        queryKey: ["/api/admin/returns"],
    });

    const updateStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: number, status: string }) => {
            const res = await apiRequest("PATCH", `/api/admin/returns/${id}`, { status });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/returns"] });
            toast({ title: "Status Updated" });
        }
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col uppercase tracking-wider">
                <Navbar />
                <main className="flex-grow flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow py-12 container mx-auto px-4">
                <div className="max-w-6xl mx-auto space-y-8">
                    <h1 className="text-4xl font-bold tracking-tighter">Returns Management</h1>

                    <div className="space-y-4">
                        {!returns || returns.length === 0 ? (
                            <div className="text-center py-24 bg-secondary/5 rounded-3xl border border-dashed">
                                <p className="text-muted-foreground uppercase tracking-[0.2em] text-xs font-black">No return requests found</p>
                            </div>
                        ) : (
                            returns.map((ret) => (
                                <Card key={ret.id} className="border-none shadow-sm bg-secondary/10 overflow-hidden">
                                    <CardContent className="p-6">
                                        <div className="flex flex-col md:flex-row justify-between gap-6">
                                            <div className="space-y-4 flex-grow">
                                                <div className="flex items-center gap-4">
                                                    <Badge variant={ret.status === 'pending' ? 'outline' : ret.status === 'approved' ? 'default' : 'destructive'} className="capitalize">
                                                        {ret.status}
                                                    </Badge>
                                                    <span className="text-sm text-muted-foreground">#{ret.orderId}</span>
                                                    <span className="text-sm text-muted-foreground">{format(new Date(ret.createdAt), "PPP")}</span>
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-lg">Reason for Return</h3>
                                                    <p className="text-muted-foreground">{ret.reason}</p>
                                                </div>
                                                <div className="pt-2">
                                                    <p className="text-sm font-medium uppercase tracking-wider text-[10px]">Order Total: {formatCurrency(ret.order.total)}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 justify-center min-w-[200px]">
                                                {ret.status === 'pending' && (
                                                    <>
                                                        <Button
                                                            className="w-full rounded-xl"
                                                            onClick={() => updateStatusMutation.mutate({ id: ret.id, status: 'approved' })}
                                                            disabled={updateStatusMutation.isPending}
                                                        >
                                                            <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="w-full rounded-xl text-destructive hover:bg-destructive/10"
                                                            onClick={() => updateStatusMutation.mutate({ id: ret.id, status: 'rejected' })}
                                                            disabled={updateStatusMutation.isPending}
                                                        >
                                                            <XCircle className="w-4 h-4 mr-2" /> Reject
                                                        </Button>
                                                    </>
                                                )}
                                                {ret.status === 'approved' && (
                                                    <Button
                                                        className="w-full rounded-xl"
                                                        onClick={() => updateStatusMutation.mutate({ id: ret.id, status: 'completed' })}
                                                        disabled={updateStatusMutation.isPending}
                                                    >
                                                        {updateStatusMutation.isPending ? (
                                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                        ) : null}
                                                        Mark as Completed
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
