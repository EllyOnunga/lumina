import { useQuery, useMutation } from "@tanstack/react-query";
import { type Product, type Warehouse, type Inventory } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Warehouse as WarehouseIcon, Package, TrendingDown, CheckCircle2, Plus } from "lucide-react";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export function InventoryHub() {
    const { toast } = useToast();
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [stockUpdate, setStockUpdate] = useState<{ [warehouseId: number]: number }>({});
    const [newWarehouse, setNewWarehouse] = useState({ name: "", location: "" });
    const [isWarehouseDialogOpen, setIsWarehouseDialogOpen] = useState(false);

    const { data: products } = useQuery<Product[]>({
        queryKey: ["/api/products"],
    });

    const { data: warehouses } = useQuery<Warehouse[]>({
        queryKey: ["/api/admin/warehouses"],
    });

    const { data: lowStockAlerts } = useQuery<(Product & { totalStock: number })[]>({
        queryKey: ["/api/admin/low-stock-alerts"],
        refetchInterval: 30000, // Refresh every 30s for real-time feel
    });

    const { data: productInventory } = useQuery<Inventory[]>({
        queryKey: [`/api/admin/products/${selectedProduct}/inventory`],
        enabled: !!selectedProduct,
    });

    const updateInventoryMutation = useMutation({
        mutationFn: async ({ warehouseId, stock }: { warehouseId: number; stock: number }) => {
            const res = await apiRequest("POST", `/api/admin/products/${selectedProduct}/inventory`, {
                warehouseId,
                stock
            });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [`/api/admin/products/${selectedProduct}/inventory`] });
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            queryClient.invalidateQueries({ queryKey: ["/api/admin/low-stock-alerts"] });
            toast({ title: "Inventory updated successfully" });
        },
    });

    const createWarehouseMutation = useMutation({
        mutationFn: async (data: { name: string; location: string }) => {
            const res = await apiRequest("POST", "/api/admin/warehouses", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/warehouses"] });
            toast({ title: "Warehouse created successfully" });
            setIsWarehouseDialogOpen(false);
            setNewWarehouse({ name: "", location: "" });
        },
        onError: (error: Error) => {
            toast({ title: "Failed to create warehouse", description: error.message, variant: "destructive" });
        },
    });

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header section with summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="rounded-[2rem] border-none shadow-xl bg-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Total Warehouses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <WarehouseIcon className="w-8 h-8 text-primary" />
                            <span className="text-4xl font-black">{warehouses?.length || 0}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-xl bg-destructive/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Low Stock Alerts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <TrendingDown className="w-8 h-8 text-destructive" />
                            <span className="text-4xl font-black text-destructive">{lowStockAlerts?.length || 0}</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-[2rem] border-none shadow-xl bg-green-500/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">Active Manifests</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <Package className="w-8 h-8 text-green-500" />
                            <span className="text-4xl font-black">{products?.length || 0}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Notifications Panel */}
            {lowStockAlerts && lowStockAlerts.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
                        <AlertCircle className="text-destructive w-6 h-6" />
                        Critical Alerts
                    </h2>
                    <div className="grid gap-4">
                        {lowStockAlerts.map(alert => (
                            <Alert key={alert.id} variant="destructive" className="rounded-2xl border-none shadow-lg bg-destructive/10">
                                <AlertCircle className="h-5 w-5" />
                                <AlertTitle className="font-black text-lg">Low Stock: {alert.name}</AlertTitle>
                                <AlertDescription className="font-medium">
                                    Current stock is <strong>{alert.totalStock}</strong>, which is below the threshold of {alert.lowStockThreshold}.
                                    Internal SKU: {alert.sku || "N/A"}
                                </AlertDescription>
                                <Button
                                    variant="link"
                                    className="p-0 h-auto font-black text-destructive underline mt-2"
                                    onClick={() => setSelectedProduct(alert.id)}
                                >
                                    Update Inventory Now
                                </Button>
                            </Alert>
                        ))}
                    </div>
                </div>
            )}

            {/* Inventory Management Table */}
            <div className="bg-background rounded-[2.5rem] border border-secondary/10 overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-secondary/10 bg-secondary/5 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-black tracking-tighter">Inventory Distribution</h2>
                        <p className="text-muted-foreground font-medium text-sm">Select a product to manage warehouse allocation</p>
                    </div>
                    <Dialog open={isWarehouseDialogOpen} onOpenChange={setIsWarehouseDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="rounded-2xl h-12 px-6 font-bold shadow-lg shadow-primary/20">
                                <Plus className="mr-2 h-5 w-5" />
                                New Warehouse
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black tracking-tighter">Deploy New Warehouse</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Warehouse Name</Label>
                                    <Input
                                        placeholder="Regional DC - Nairobi"
                                        className="bg-secondary/10 border-none h-12 rounded-xl font-bold"
                                        value={newWarehouse.name}
                                        onChange={(e) => setNewWarehouse(prev => ({ ...prev, name: e.target.value }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Geographic Location</Label>
                                    <Input
                                        placeholder="Industrial Area, Sector 4"
                                        className="bg-secondary/10 border-none h-12 rounded-xl font-bold"
                                        value={newWarehouse.location}
                                        onChange={(e) => setNewWarehouse(prev => ({ ...prev, location: e.target.value }))}
                                    />
                                </div>
                                <Button
                                    className="w-full h-14 rounded-xl text-lg font-black mt-2"
                                    onClick={() => createWarehouseMutation.mutate(newWarehouse)}
                                    disabled={createWarehouseMutation.isPending || !newWarehouse.name || !newWarehouse.location}
                                >
                                    {createWarehouseMutation.isPending ? "Configuring..." : "Authorize Deployment"}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex flex-col md:flex-row min-h-[500px]">
                    {/* Product List */}
                    <div className="w-full md:w-1/3 border-r border-secondary/10 overflow-y-auto max-h-[600px]">
                        {products?.map(product => (
                            <button
                                key={product.id}
                                onClick={() => setSelectedProduct(product.id)}
                                className={`w-full text-left p-6 hover:bg-secondary/5 transition-all flex items-center gap-4 border-b border-secondary/5 ${selectedProduct === product.id ? 'bg-primary/5 border-r-4 border-r-primary' : ''}`}
                            >
                                <img src={product.image} className="w-12 h-12 rounded-xl object-cover" alt="" />
                                <div>
                                    <p className="font-black tracking-tight">{product.name}</p>
                                    <p className="text-xs text-muted-foreground font-bold">{product.sku || product.id}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Warehouse Inventory Management */}
                    <div className="flex-1 p-8 bg-secondary/2">
                        {selectedProduct ? (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-3xl font-black tracking-tighter">
                                        Managing {products?.find(p => p.id === selectedProduct)?.name}
                                    </h3>
                                    {products?.find(p => p.id === selectedProduct)?.allowBackorder && (
                                        <span className="px-4 py-2 bg-green-500/10 text-green-600 rounded-full font-black text-[10px] uppercase tracking-widest flex items-center gap-2 border border-green-500/20">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Backorders Allowed
                                        </span>
                                    )}
                                </div>

                                <div className="grid gap-6">
                                    {warehouses?.map(warehouse => {
                                        const currentStock = productInventory?.find(i => i.warehouseId === warehouse.id)?.stock || 0;
                                        return (
                                            <div key={warehouse.id} className="bg-background border border-secondary/10 rounded-2xl p-6 flex items-center justify-between shadow-sm">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                                                        <WarehouseIcon className="w-6 h-6 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-lg">{warehouse.name}</p>
                                                        <p className="text-sm text-muted-foreground font-medium">{warehouse.location}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="text-right">
                                                        <p className="font-black text-2xl tracking-tighter">{currentStock}</p>
                                                        <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Current Units</p>
                                                    </div>

                                                    <div className="flex items-center gap-2">
                                                        <Input
                                                            type="number"
                                                            className="w-24 h-12 rounded-xl font-bold border-2 text-center"
                                                            placeholder="New"
                                                            value={stockUpdate[warehouse.id] ?? ""}
                                                            onChange={(e) => setStockUpdate(prev => ({ ...prev, [warehouse.id]: parseInt(e.target.value) }))}
                                                        />
                                                        <Button
                                                            className="rounded-xl h-12 px-6 font-black"
                                                            onClick={() => {
                                                                if (stockUpdate[warehouse.id] !== undefined) {
                                                                    updateInventoryMutation.mutate({
                                                                        warehouseId: warehouse.id,
                                                                        stock: stockUpdate[warehouse.id]
                                                                    });
                                                                }
                                                            }}
                                                            disabled={updateInventoryMutation.isPending}
                                                        >
                                                            Update
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                <Package className="w-20 h-20 text-muted-foreground" />
                                <div>
                                    <h3 className="text-2xl font-black tracking-tighter">Manifest Logistics</h3>
                                    <p className="text-muted-foreground font-medium">Select a product from the registry to view warehouse distribution.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
