import { Layout } from "@/components/layout/Layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertReturnSchema, type Order } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, RefreshCcw } from "lucide-react";

export default function RequestReturn() {
    const { orderId } = useParams();
    const [, setLocation] = useLocation();
    const { toast } = useToast();

    const id = parseInt(orderId || "0");

    const { data: order, isLoading: isOrderLoading } = useQuery<Order>({
        queryKey: [`/api/orders/${id}`],
        enabled: id > 0,
    });

    const form = useForm({
        resolver: zodResolver(insertReturnSchema),
        defaultValues: {
            orderId: id,
            reason: "",
        },
    });

    const returnMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await apiRequest("POST", "/api/returns", data);
            return res.json();
        },
        onSuccess: () => {
            toast({ title: "Return request submitted", description: "Our team will review your request shortly." });
            queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
            setLocation("/orders");
        },
        onError: (error: Error) => {
            toast({ title: "Submission failed", description: error.message, variant: "destructive" });
        },
    });

    if (isOrderLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            </Layout>
        );
    }

    if (!order) {
        return (
            <Layout>
                <div className="text-center py-24">
                    <h2 className="text-2xl font-bold">Order not found</h2>
                    <Button variant="link" onClick={() => setLocation("/orders")}>Back to orders</Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-12">
                <Button
                    variant="ghost"
                    className="mb-8 rounded-xl font-bold"
                    onClick={() => setLocation("/orders")}
                >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back to Orders
                </Button>

                <div className="max-w-2xl mx-auto">
                    <Card className="border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
                        <CardHeader className="bg-primary/5 p-10">
                            <div className="flex items-center gap-4 mb-2">
                                <div className="p-3 bg-primary/10 rounded-2xl">
                                    <RefreshCcw className="w-6 h-6 text-primary" />
                                </div>
                                <CardTitle className="text-3xl font-black tracking-tighter uppercase italic">Request Return</CardTitle>
                            </div>
                            <p className="text-muted-foreground font-medium">Order #ORD-{id.toString().padStart(5, '0')}</p>
                        </CardHeader>
                        <CardContent className="p-10">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit((data) => returnMutation.mutate(data))} className="space-y-6">
                                    <FormField
                                        control={form.control}
                                        name="reason"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Reason for Return</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Please detail why you are returning this item (size, defect, etc.)"
                                                        className="bg-secondary/10 border-none rounded-2xl min-h-[150px] p-6 font-medium focus:ring-2 ring-primary/20 transition-all"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-primary/20"
                                        disabled={returnMutation.isPending}
                                    >
                                        {returnMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                                                Processing Manifesto...
                                            </>
                                        ) : (
                                            "Submit Return Request"
                                        )}
                                    </Button>
                                </form>
                            </Form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Layout>
    );
}
