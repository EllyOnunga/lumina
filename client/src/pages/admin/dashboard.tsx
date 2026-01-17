import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProductSchema, type Product, type InsertProduct, type User, type Order, type Category, type Tag, type OrderItem } from "@shared/schema";
import { cn } from "@/lib/utils";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Plus, ShieldAlert, Edit2, Trash2, Download, Upload } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { useLocation } from "wouter";
import { useState, useRef } from "react";
import { InventoryHub } from "@/components/admin/InventoryHub";
import { TaxonomyManager } from "@/components/admin/TaxonomyManager";
import { AdminOverview } from "@/components/admin/AdminOverview";

export default function AdminDashboard() {
    const { toast } = useToast();

    const [location] = useLocation();
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Auth context (to check if current user is admin) - must be declared before other queries that use it
    const { data: currentUser, isLoading: isLoadingUser } = useQuery<User>({
        queryKey: ["/api/user"],
    });

    const { data: products } = useQuery<Product[]>({
        queryKey: ["/api/products"],
    });

    const { data: users } = useQuery<User[]>({
        queryKey: ["/api/admin/users"],
        enabled: !!currentUser?.isAdmin,
    });

    const { data: orders } = useQuery<(Order & { items: (OrderItem & { product: Product })[], user: User | null })[]>({
        queryKey: ["/api/admin/orders"],
        enabled: !!currentUser?.isAdmin,
    });

    const form = useForm<InsertProduct>({
        resolver: zodResolver(insertProductSchema),
        defaultValues: {
            name: "",
            description: "",
            price: 0,
            image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=2400&q=80",
            category: "Clothing",
            brand: "",
        }
    });

    const productType = useWatch({
        control: form.control,
        name: "type",
    });

    const createProductMutation = useMutation({
        mutationFn: async (data: InsertProduct) => {
            const res = await apiRequest("POST", "/api/products", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({ title: "Product created successfully" });
            form.reset();
        },
        onError: (error: Error) => {
            toast({ title: "Failed to create product", description: error.message, variant: "destructive" });
        },
    });

    const updateProductMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<InsertProduct> }) => {
            const res = await apiRequest("PATCH", `/api/products/${id}`, data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({ title: "Product updated successfully" });
            setEditingProduct(null);
        },
        onError: (error: Error) => {
            toast({ title: "Update failed", description: error.message, variant: "destructive" });
        },
    });

    const deleteProductMutation = useMutation({
        mutationFn: async (id: number) => {
            await apiRequest("DELETE", `/api/products/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({ title: "Product deleted" });
        },
        onError: (error: Error) => {
            toast({ title: "Deletion failed", description: error.message, variant: "destructive" });
        },
    });


    const updateOrderStatusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: number; status: string }) => {
            const res = await apiRequest("PATCH", `/api/admin/orders/${id}/status`, { status });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/orders"] });
            toast({ title: "Order status updated" });
        },
        onError: (error: Error) => {
            toast({ title: "Update failed", description: error.message, variant: "destructive" });
        },
    });

    const updateRoleMutation = useMutation({
        mutationFn: async ({ id, role }: { id: number; role: string }) => {
            const res = await apiRequest("PATCH", `/api/admin/users/${id}/role`, { role });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
            toast({ title: "User role updated" });
        },
        onError: (error: Error) => {
            toast({ title: "Failed to update role", description: error.message, variant: "destructive" });
        },
    });

    const bootstrapMutation = useMutation({
        mutationFn: async () => {
            const res = await apiRequest("POST", "/api/admin/bootstrap", {});
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            toast({ title: "Success", description: "You are now an administrator." });
        },
        onError: (error: Error) => {
            toast({ title: "Bootstrap failed", description: error.message, variant: "destructive" });
        },
    });

    const setTaxonomyMutation = useMutation({
        mutationFn: async ({ productId, categoryIds, tagIds }: { productId: number; categoryIds: number[]; tagIds: number[] }) => {
            await apiRequest("POST", `/api/admin/products/${productId}/taxonomy`, { categoryIds, tagIds });
        }
    });

    const { data: categories } = useQuery<Category[]>({
        queryKey: ["/api/categories"],
    });

    const { data: tags } = useQuery<Tag[]>({
        queryKey: ["/api/tags"],
    });

    const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);

    const onSubmit = async (data: InsertProduct) => {
        try {
            let product: Product;
            const payload = { ...data, price: Number(data.price) };
            if (editingProduct) {
                product = await updateProductMutation.mutateAsync({ id: editingProduct.id, data: payload });
            } else {
                product = await createProductMutation.mutateAsync(payload as InsertProduct);
            }

            await setTaxonomyMutation.mutateAsync({
                productId: product.id,
                categoryIds: selectedCategories,
                tagIds: selectedTags
            });

            form.reset();
            setSelectedCategories([]);
            setSelectedTags([]);
        } catch {
            // Error handled by mutations
        }
    };

    const exportProducts = () => {
        window.open("/api/admin/products/export", "_blank");
    };

    const importProductsMutation = useMutation({
        mutationFn: async (data: InsertProduct[]) => {
            const res = await apiRequest("POST", "/api/admin/products/import", { data });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/products"] });
            toast({ title: "Products imported successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Import failed", description: error.message, variant: "destructive" });
        },
    });

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target?.result as string;
                // Basic CSV to JSON for demo/quick import
                const lines = text.split("\n");
                const headers = lines[0].split(",");
                const jsonData = lines.slice(1).filter(line => line.trim()).map(line => {
                    const values = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
                    const obj: Record<string, string | number | boolean | object | null> = {};
                    headers.forEach((header, i) => {
                        const value = values[i]?.replace(/^"|"$/g, "").replace(/""/g, '"');
                        if (header === "price" || header === "stock" || header === "parentId") {
                            obj[header] = value ? parseInt(value) : null;
                        } else if (header === "attributes") {
                            try { obj[header] = JSON.parse(value); } catch { obj[header] = {}; }
                        } else {
                            obj[header] = value;
                        }
                    });
                    return obj;
                });
                importProductsMutation.mutate(jsonData as unknown as InsertProduct[]);
            } catch {
                toast({ title: "Invalid file format", variant: "destructive" });
            }
        };
        reader.readAsText(file);
    };

    if (isLoadingUser) {

        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Unified condition for "Overview" view
    const isOverview = location === "/admin" || location === "/admin/dashboard";

    if (!currentUser?.isAdmin) {
        return (
            <div className="container mx-auto px-4 py-32 text-center space-y-6">
                <ShieldAlert className="w-20 h-20 mx-auto text-destructive opacity-50" />
                <h1 className="text-5xl font-black tracking-tighter">Secure Zone Only</h1>
                <p className="text-muted-foreground max-w-md mx-auto text-lg">
                    This area is restricted to authorized administrative personnel.
                </p>
                <div className="pt-8">
                    <Button
                        variant="outline"
                        size="lg"
                        className="rounded-full px-12 border-2 hover:bg-secondary/10"
                        onClick={() => bootstrapMutation.mutate()}
                        disabled={bootstrapMutation.isPending}
                    >
                        {bootstrapMutation.isPending ? "Authenticating..." : "Bootstrap Admin Account"}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <AdminLayout>
            <div className="p-8">
                {/* Overview Landing */}
                {isOverview && (
                    <AdminOverview
                        products={products || []}
                        orders={orders || []}
                        users={users || []}
                    />
                )}

                {/* Product Management */}
                {(location === "/admin/products") && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center bg-card dark:bg-white/5 p-8 rounded-[2.5rem] border border-border dark:border-white/5">
                            <div>
                                <h1 className="text-4xl font-black tracking-tighter text-foreground">Inventory</h1>
                                <p className="text-muted-foreground font-medium">Manage your storefront and catalog</p>
                            </div>
                            <div className="flex gap-4">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".csv"
                                    onChange={handleFileUpload}
                                    aria-label="Import products from CSV"
                                    title="Import CSV"
                                />
                                <Button variant="outline" className="rounded-2xl h-14 border-2 dark:border-white/10 dark:text-white" onClick={() => fileInputRef.current?.click()}>
                                    <Upload className="mr-2 h-5 w-5" />
                                    Import CSV
                                </Button>
                                <Button variant="outline" className="rounded-2xl h-14 border-2 dark:border-white/10 dark:text-white" onClick={exportProducts}>
                                    <Download className="mr-2 h-5 w-5" />
                                    Export CSV
                                </Button>
                            </div>
                            <Dialog open={!!editingProduct} onOpenChange={(open) => { if (!open) { setEditingProduct(null); form.reset(); } }}>
                                <DialogTrigger asChild>
                                    <Button className="rounded-2xl h-14 px-8 text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-105">
                                        <Plus className="mr-2 h-5 w-5" />
                                        Launch Product
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-background dark:bg-black">
                                    <div className="bg-primary/20 p-8 border-b border-border dark:border-white/5">
                                        <DialogHeader>
                                            <DialogTitle className="text-3xl font-black tracking-tighter">
                                                {editingProduct ? "Edit Logistics" : "New Manifest"}
                                            </DialogTitle>
                                        </DialogHeader>
                                    </div>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 space-y-6">
                                            <FormField
                                                control={form.control}
                                                name="name"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Product Title</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Essential Collection Item" className="bg-secondary/10 dark:bg-white/5 border-none h-14 rounded-xl font-bold text-foreground" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="sku"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">SKU / ID</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="LUM-001" className="bg-secondary/10 dark:bg-white/5 border-none h-14 rounded-xl font-mono font-bold text-foreground" {...field} value={field.value ?? ""} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="type"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Product Type</FormLabel>
                                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                                <FormControl>
                                                                    <SelectTrigger className="bg-secondary/10 border-none h-14 rounded-xl font-bold">
                                                                        <SelectValue placeholder="Type" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="rounded-xl">
                                                                    <SelectItem value="simple">Simple</SelectItem>
                                                                    <SelectItem value="configurable">Configurable</SelectItem>
                                                                    <SelectItem value="bundle">Bundle</SelectItem>
                                                                    <SelectItem value="variant">Variant</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name="description"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Technical Description</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="Detail the craftsmanship and materials..." className="bg-secondary/10 dark:bg-white/5 border-none rounded-xl min-h-[120px] font-medium text-foreground" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="grid grid-cols-2 gap-6">
                                                <FormField
                                                    control={form.control}
                                                    name="price"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Unit Price (KSH)</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" className="bg-secondary/10 dark:bg-white/5 border-none h-14 rounded-xl font-mono text-lg font-bold text-foreground" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name="stock"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Inventory Level</FormLabel>
                                                            <FormControl>
                                                                <Input type="number" className="bg-secondary/10 dark:bg-white/5 border-none h-14 rounded-xl font-mono text-lg font-bold text-foreground" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                            <FormField
                                                control={form.control}
                                                name="category"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Classification</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Accessories" className="bg-secondary/10 dark:bg-white/5 border-none h-14 rounded-xl font-bold text-foreground" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="brand"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Brand / Maker</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Lumina Originals" className="bg-secondary/10 dark:bg-white/5 border-none h-14 rounded-xl font-bold text-foreground" {...field} value={field.value ?? ""} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="image"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Main Visual URL</FormLabel>
                                                        <FormControl>
                                                            <Input className="bg-secondary/10 dark:bg-white/5 border-none h-14 rounded-xl font-medium text-foreground" {...field} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="images"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Gallery Assets (One URL per line)</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg"
                                                                className="bg-secondary/10 dark:bg-white/5 border-none rounded-xl min-h-[100px] font-medium text-foreground"
                                                                value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                                                                onChange={(e) => field.onChange(e.target.value.split('\n').filter(url => url.trim() !== ''))}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name="attributes"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Attributes (JSON)</FormLabel>
                                                        <FormControl>
                                                            <Textarea
                                                                placeholder='{"size": "L", "color": "white"}'
                                                                className="bg-secondary/10 border-none rounded-xl min-h-[100px] font-mono"
                                                                value={typeof field.value === 'string' ? field.value : JSON.stringify(field.value)}
                                                                onChange={(e) => {
                                                                    try {
                                                                        field.onChange(JSON.parse(e.target.value));
                                                                    } catch {
                                                                        field.onChange(e.target.value);
                                                                    }
                                                                }}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            {productType === "variant" && (
                                                <FormField
                                                    control={form.control}
                                                    name="parentId"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Parent Product (for variants)</FormLabel>
                                                            <Select onValueChange={(val) => field.onChange(parseInt(val))} defaultValue={field.value?.toString()}>
                                                                <FormControl>
                                                                    <SelectTrigger className="bg-secondary/10 border-none h-14 rounded-xl font-bold">
                                                                        <SelectValue placeholder="Select Parent" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent className="rounded-xl">
                                                                    {products?.filter(p => p.type === "configurable").map(p => (
                                                                        <SelectItem key={p.id} value={p.id.toString()}>{p.name} (ID: {p.id})</SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            )}
                                            <FormField
                                                control={form.control}
                                                name="specifications"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Technical Specifications</FormLabel>
                                                        <FormControl>
                                                            <Textarea placeholder="Material: 100% Cotton&#10;Care: Hand wash cold" className="bg-secondary/10 border-none rounded-xl min-h-[100px] font-medium" {...field} value={field.value ?? ""} />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="space-y-4 pt-6 border-t border-secondary/10">
                                                <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground">Strategic Taxonomy</p>
                                                <div className="space-y-6">
                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-bold ml-1">Categories</Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {categories?.map(cat => (
                                                                <button
                                                                    key={cat.id}
                                                                    type="button"
                                                                    onClick={() => setSelectedCategories(prev => prev.includes(cat.id) ? prev.filter(id => id !== cat.id) : [...prev, cat.id])}
                                                                    className={cn(
                                                                        "px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all",
                                                                        selectedCategories.includes(cat.id) ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" : "border-border dark:border-white/10 hover:border-primary/50 text-foreground"
                                                                    )}
                                                                >
                                                                    {cat.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <Label className="text-sm font-bold ml-1 text-foreground">Metadata Tags</Label>
                                                        <div className="flex flex-wrap gap-2">
                                                            {tags?.map(tag => (
                                                                <button
                                                                    key={tag.id}
                                                                    type="button"
                                                                    onClick={() => setSelectedTags(prev => prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id])}
                                                                    className={cn(
                                                                        "px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all",
                                                                        selectedTags.includes(tag.id) ? "bg-secondary text-secondary-foreground border-secondary shadow-lg" : "border-border dark:border-white/10 hover:border-secondary/50 text-foreground"
                                                                    )}
                                                                >
                                                                    #{tag.name}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <Button type="submit" className="w-full h-16 rounded-2xl text-xl font-black mt-4 shadow-xl" disabled={createProductMutation.isPending || updateProductMutation.isPending}>
                                                {(createProductMutation.isPending || updateProductMutation.isPending) ? "Syncing Logic..." : editingProduct ? "Commit Changes" : "Deploy to Storefront"}
                                            </Button>
                                        </form>
                                    </Form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <div className="bg-card dark:bg-black rounded-[2.5rem] border border-border dark:border-white/5 overflow-hidden shadow-2xl">
                            <table className="w-full text-sm">
                                <thead className="bg-secondary/5 dark:bg-white/2 border-b border-border dark:border-white/5">
                                    <tr>
                                        <th className="px-10 py-6 text-left font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Logistics</th>
                                        <th className="px-10 py-6 text-left font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Category</th>
                                        <th className="px-10 py-6 text-left font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Inventory</th>
                                        <th className="px-10 py-6 text-left font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Valuation</th>
                                        <th className="px-10 py-6 text-right font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Operations</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border dark:divide-white/5">
                                    {products?.map((product: Product) => (
                                        <tr key={product.id} className="hover:bg-secondary/5 dark:hover:bg-white/2 transition-all group">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-secondary/10 dark:bg-white/5 flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                        <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-lg tracking-tight group-hover:text-primary transition-colors text-foreground">{product.name}</p>
                                                        <p className="text-muted-foreground text-xs line-clamp-1 max-w-[200px]">{product.description}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="px-4 py-2 bg-secondary/10 dark:bg-white/5 rounded-full font-bold text-[10px] uppercase tracking-widest text-foreground">{product.category}</span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex flex-col">
                                                    <span className={`font-black text-lg ${product.stock < 5 ? 'text-destructive' : 'text-primary'}`}>
                                                        {product.stock}
                                                    </span>
                                                    <span className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">Units</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6">
                                                <span className="font-mono font-black text-lg text-foreground">{formatCurrency(product.price)}</span>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-12 w-12 rounded-xl border-2 dark:border-white/10 dark:text-white hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                                                        onClick={async () => {
                                                            setEditingProduct(product);
                                                            form.reset(product as InsertProduct);
                                                            try {
                                                                const res = await apiRequest("GET", `/api/admin/products/${product.id}/taxonomy`);
                                                                const tax = await res.json();
                                                                setSelectedCategories(tax.categoryIds);
                                                                setSelectedTags(tax.tagIds);
                                                            } catch {
                                                                setSelectedCategories([]);
                                                                setSelectedTags([]);
                                                            }
                                                        }}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-12 w-12 rounded-xl border-2 dark:border-white/10 dark:text-white hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all"
                                                        onClick={() => {
                                                            if (confirm("Verify permanent de-registration of this asset?")) {
                                                                deleteProductMutation.mutate(product.id);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Orders Management */}
                {location === "/admin/orders" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center bg-card dark:bg-white/5 p-8 rounded-[2.5rem] border border-border dark:border-white/5">
                            <div>
                                <h1 className="text-4xl font-black tracking-tighter text-foreground">Order Logistics</h1>
                                <p className="text-muted-foreground font-medium">Global dispatch and fulfillment status</p>
                            </div>
                        </div>

                        <div className="grid gap-6">
                            {orders?.map((order) => (
                                <div key={order.id} className="bg-card dark:bg-black border border-border dark:border-white/5 rounded-[2rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all p-8 flex flex-col md:flex-row gap-8 items-center border-l-8 border-l-primary/20">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-4">
                                            <span className="px-4 py-2 bg-primary/10 text-primary rounded-xl font-black text-sm tracking-tighter">ORD-#{order.id.toString().padStart(5, '0')}</span>
                                            <span className="text-muted-foreground font-bold text-sm tracking-tighter uppercase">{new Date(order.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-secondary/10 dark:bg-white/5 flex items-center justify-center font-black text-xs text-foreground">
                                                {order.user ? order.user.username[0].toUpperCase() : "G"}
                                            </div>
                                            <div>
                                                <p className="font-black leading-tight text-foreground">{order.user ? order.user.username : "Guest Customer"}</p>
                                                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground">{order.user ? "Authorized Client" : "Guest Purchase"}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-4 flex-wrap">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-2 bg-secondary/5 dark:bg-white/5 px-3 py-2 rounded-lg border border-border dark:border-white/5">
                                                    <span className="font-black text-xs text-primary">{item.quantity}x</span>
                                                    <span className="font-bold text-xs truncate max-w-[120px] text-foreground">{item.product.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="text-right space-y-4 w-full md:w-auto">
                                        <p className="text-3xl font-black tracking-tighter font-mono text-foreground">{formatCurrency(order.total)}</p>
                                        <div className="flex items-center gap-2 justify-end">
                                            <Select
                                                defaultValue={order.status}
                                                onValueChange={(status) => updateOrderStatusMutation.mutate({ id: order.id, status })}
                                            >
                                                <SelectTrigger className="w-[180px] h-12 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest dark:border-white/10 dark:text-white">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border border-border dark:border-white/5 shadow-2xl bg-card dark:bg-zinc-900">
                                                    <SelectItem value="pending" className="font-bold">Pending</SelectItem>
                                                    <SelectItem value="processing" className="font-bold">Processing</SelectItem>
                                                    <SelectItem value="shipped" className="font-bold">Shipped</SelectItem>
                                                    <SelectItem value="delivered" className="font-bold">Delivered</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* User Security Management */}
                {location === "/admin/users" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex justify-between items-center bg-card dark:bg-white/5 p-8 rounded-[2.5rem] border border-border dark:border-white/5">
                            <div>
                                <h1 className="text-4xl font-black tracking-tighter text-foreground">Security & Permissions</h1>
                                <p className="text-muted-foreground font-medium">Manage administrative access levels</p>
                            </div>
                        </div>

                        <div className="bg-card dark:bg-black rounded-[2.5rem] border border-border dark:border-white/5 overflow-hidden shadow-2xl">
                            <table className="w-full text-sm">
                                <thead className="bg-secondary/5 dark:bg-white/2 border-b border-border dark:border-white/5">
                                    <tr>
                                        <th className="px-10 py-6 text-left font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Principal</th>
                                        <th className="px-10 py-6 text-left font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">ID Manifest</th>
                                        <th className="px-10 py-6 text-left font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Role Clearance</th>
                                        <th className="px-10 py-6 text-right font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground">Authorization</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border dark:divide-white/5">
                                    {users?.map((user) => (
                                        <tr key={user.id} className="hover:bg-secondary/5 dark:hover:bg-white/2 transition-colors">
                                            <td className="px-10 py-6 text-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black shadow-inner">
                                                        {user.username[0].toUpperCase()}
                                                    </div>
                                                    <span className="font-black tracking-tight text-foreground">{user.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-10 py-6 font-mono text-sm opacity-50 font-bold text-foreground">SHA-#{user.id.toString().padStart(6, '0')}</td>
                                            <td className="px-10 py-6">
                                                <Select
                                                    defaultValue={user.role}
                                                    onValueChange={(role) => updateRoleMutation.mutate({ id: user.id, role })}
                                                    disabled={user.id === currentUser.id}
                                                >
                                                    <SelectTrigger className="w-[140px] h-10 rounded-xl border-2 font-black uppercase text-[10px] tracking-widest dark:border-white/10 dark:text-white">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="rounded-2xl border border-border dark:border-white/5 shadow-2xl bg-card dark:bg-zinc-900">
                                                        <SelectItem value="admin" className="font-bold">Admin</SelectItem>
                                                        <SelectItem value="manager" className="font-bold">Manager</SelectItem>
                                                        <SelectItem value="editor" className="font-bold">Editor</SelectItem>
                                                        <SelectItem value="packer" className="font-bold">Packer</SelectItem>
                                                        <SelectItem value="analyst" className="font-bold">Analyst</SelectItem>
                                                        <SelectItem value="user" className="font-bold">User</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </td>
                                            <td className="px-10 py-6 text-right">
                                                {user.id !== currentUser.id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-10 w-10 p-0 rounded-xl hover:bg-destructive hover:text-white transition-colors"
                                                        onClick={() => {
                                                            if (confirm(`Remove access for ${user.username}?`)) {
                                                                updateRoleMutation.mutate({ id: user.id, role: "user" });
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Inventory Hub (Logistics) */}
                {location === "/admin/inventory" && <InventoryHub />}

                {/* Taxonomy Manager */}
                {location === "/admin/taxonomy" && <TaxonomyManager />}
            </div>
        </AdminLayout>
    );
}
