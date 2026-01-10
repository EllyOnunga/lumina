import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { formatCurrency } from "@/lib/utils";
import { Loader2, Package } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Order, OrderItem, Product } from "@shared/schema";
import { format } from "date-fns";

type OrderWithItems = Order & {
    items: (OrderItem & { product: Product })[]
};

export default function Orders() {
    const { data: orders, isLoading } = useQuery<OrderWithItems[]>({
        queryKey: ["/api/orders"],
    });

    if (isLoading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-12 flex justify-center">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container mx-auto px-4 py-12">
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tighter mb-2">Order History</h1>
                        <p className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-black">Track your style evolution</p>
                    </div>
                </div>

                {!orders || orders.length === 0 ? (
                    <div className="text-center py-12 border rounded-lg bg-secondary/20">
                        <Package className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium">No orders yet</h3>
                        <p className="text-muted-foreground">When you place an order, it will appear here.</p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.map((order) => (
                            <div key={order.id} className="border rounded-lg overflow-hidden">
                                <div className="bg-secondary/30 p-4 border-b flex justify-between items-center flex-wrap gap-4">
                                    <div className="flex gap-8">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Order Placed</p>
                                            <p className="font-medium">{format(new Date(order.createdAt), "PPP")}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total</p>
                                            <p className="font-medium">{formatCurrency(order.total)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase tracking-wider">Order #</p>
                                            <p className="font-medium">{order.id}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <Badge variant={order.status === "pending" ? "default" : "secondary"} className="uppercase">
                                            {order.status}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Product</TableHead>
                                                <TableHead className="text-right">Price</TableHead>
                                                <TableHead className="text-right">Quantity</TableHead>
                                                <TableHead className="text-right">Subtotal</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {order.items.map((item) => (
                                                <TableRow key={item.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-4">
                                                            <img src={item.product.image} alt={item.product.name} className="w-10 h-10 object-cover rounded-sm" />
                                                            <span>{item.product.name}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                                                    <TableCell className="text-right">{item.quantity}</TableCell>
                                                    <TableCell className="text-right">{formatCurrency(item.price * item.quantity)}</TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                                <div className="p-4 bg-muted/20 border-t flex flex-col items-end gap-2">
                                    <div className="flex justify-between w-full max-w-xs text-sm">
                                        <span className="text-muted-foreground">Subtotal</span>
                                        <span>{formatCurrency(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between w-full max-w-xs text-sm">
                                        <span className="text-muted-foreground">VAT (16%)</span>
                                        <span>{formatCurrency(order.taxAmount)}</span>
                                    </div>
                                    <div className="flex justify-between w-full max-w-xs text-sm">
                                        <span className="text-muted-foreground">Shipping ({order.shippingMethod})</span>
                                        <span>{order.shippingCost === 0 ? "FREE" : formatCurrency(order.shippingCost)}</span>
                                    </div>
                                    <div className="flex justify-between w-full max-w-xs font-bold pt-2 border-t mt-1">
                                        <span>Total</span>
                                        <span>{formatCurrency(order.total)}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
}
