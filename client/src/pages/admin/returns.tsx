import { useQuery, useMutation } from "@tanstack/react-query";
import type { Return, Order, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import { CheckCircle2, XCircle, Loader2, RefreshCcw, User as UserIcon, Calendar, Package } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";

type ReturnWithOrder = Return & { order: Order; user?: User };

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
            toast({ title: "Operation Successful", description: "Return request status has been updated in the ledger." });
        },
        onError: (error: Error) => {
            toast({ title: "Strategy Failed", description: error.message, variant: "destructive" });
        }
    });

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center bg-secondary/10 p-10 rounded-[2.5rem] border border-secondary/5">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <RefreshCcw className="w-5 h-5 text-primary" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tighter">Reverse Logistics</h1>
                        </div>
                        <p className="text-muted-foreground font-medium text-lg">Manage asset returns and exchange manifestos</p>
                    </div>
                    <div className="bg-background/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-secondary/10 shadow-xl">
                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Queue Status</span>
                        <span className="text-2xl font-black">{returns?.filter(r => r.status === 'pending').length || 0} Pending</span>
                    </div>
                </div>

                <div className="grid gap-6">
                    {!returns || returns.length === 0 ? (
                        <div className="text-center py-32 bg-secondary/5 rounded-[3rem] border-2 border-dashed border-secondary/20">
                            <Package className="w-16 h-16 mx-auto mb-6 text-muted-foreground opacity-20" />
                            <p className="text-muted-foreground uppercase tracking-[0.3em] text-xs font-black">Clearance: No active return requests</p>
                        </div>
                    ) : (
                        returns.map((ret) => (
                            <div key={ret.id} className="group relative bg-white border border-secondary/10 rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 border-l-8 border-l-primary/30">
                                <div className="p-10 flex flex-col lg:flex-row justify-between gap-10">
                                    <div className="space-y-6 flex-grow">
                                        <div className="flex flex-wrap items-center gap-4">
                                            <Badge
                                                className={`px-4 py-1 rounded-lg font-black uppercase text-[10px] tracking-widest border-none ${ret.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                                    ret.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                                                        ret.status === 'completed' ? 'bg-primary/10 text-primary' :
                                                            'bg-destructive/10 text-destructive'
                                                    }`}
                                            >
                                                {ret.status}
                                            </Badge>
                                            <div className="flex items-center gap-2 text-muted-foreground bg-secondary/5 px-3 py-1.5 rounded-xl border border-secondary/10">
                                                <Package className="w-3.5 h-3.5" />
                                                <span className="text-xs font-bold uppercase tracking-tighter">ORD-#{ret.orderId.toString().padStart(5, '0')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-muted-foreground bg-secondary/5 px-3 py-1.5 rounded-xl border border-secondary/10">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="text-xs font-bold uppercase tracking-tighter">{format(new Date(ret.createdAt), "dd MMM yyyy")}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Reason for Dispatch Reversion</p>
                                            <div className="bg-secondary/5 p-6 rounded-2xl border border-secondary/5 italic text-lg font-medium text-foreground/80 leading-relaxed">
                                                &quot;{ret.reason}&quot;
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8 pt-2">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Settlement Value</span>
                                                <span className="text-xl font-black font-mono">{formatCurrency(ret.order.total)}</span>
                                            </div>
                                            <div className="w-px h-10 bg-secondary/10" />
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-secondary/10 flex items-center justify-center">
                                                    <UserIcon className="w-5 h-5 opacity-50" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Originator</span>
                                                    <span className="text-sm font-bold">{ret.order.customerFullName}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 justify-center min-w-[240px] bg-secondary/5 p-6 lg:p-8 rounded-[2rem] border border-secondary/10">
                                        {ret.status === 'pending' && (
                                            <>
                                                <Button
                                                    className="w-full h-14 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-emerald-500/10 hover:bg-emerald-600 border-none transition-all hover:scale-[1.02]"
                                                    onClick={() => updateStatusMutation.mutate({ id: ret.id, status: 'approved' })}
                                                    disabled={updateStatusMutation.isPending}
                                                >
                                                    <CheckCircle2 className="w-4 h-4 mr-2" /> Authorize
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    className="w-full h-14 rounded-xl font-black uppercase text-xs tracking-[0.2em] text-destructive hover:bg-destructive/5 border-2 border-destructive/10 transition-all"
                                                    onClick={() => updateStatusMutation.mutate({ id: ret.id, status: 'rejected' })}
                                                    disabled={updateStatusMutation.isPending}
                                                >
                                                    <XCircle className="w-4 h-4 mr-2" /> Decline
                                                </Button>
                                            </>
                                        )}
                                        {ret.status === 'approved' && (
                                            <Button
                                                className="w-full h-14 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]"
                                                onClick={() => updateStatusMutation.mutate({ id: ret.id, status: 'completed' })}
                                                disabled={updateStatusMutation.isPending}
                                            >
                                                {updateStatusMutation.isPending ? (
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                ) : <Package className="w-4 h-4 mr-2" />}
                                                Finalize Return
                                            </Button>
                                        )}
                                        {ret.status === 'completed' && (
                                            <div className="text-center py-4">
                                                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-50" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600/60">Strategy Finalized</p>
                                            </div>
                                        )}
                                        {ret.status === 'rejected' && (
                                            <div className="text-center py-4">
                                                <XCircle className="w-10 h-10 text-destructive mx-auto mb-2 opacity-30" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-destructive/40">Request Terminated</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
