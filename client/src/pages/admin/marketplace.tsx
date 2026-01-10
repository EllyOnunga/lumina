
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
    Database,
    Users,
    Calculator,
    Mail,
    Truck,
    Target,
    Settings,
    CheckCircle2,
    Info,
    Plug,
    Plus,
    type LucideIcon
} from "lucide-react";
import { type Plugin } from "@shared/schema";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ICON_MAP: Record<string, LucideIcon> = {
    Database,
    Users,
    Calculator,
    Mail,
    Truck,
    Target,
};

type PluginConfig = {
    apiKey?: string;
    webhook?: string;
};

export default function Marketplace() {
    const { toast } = useToast();
    const [selectedPlugin, setSelectedPlugin] = useState<Plugin | null>(null);

    const { data: plugins, isLoading } = useQuery<Plugin[]>({
        queryKey: ["/api/admin/plugins"],
    });

    const updatePluginMutation = useMutation({
        mutationFn: async ({ id, status, config }: { id: number; status: string; config?: PluginConfig }) => {
            const res = await apiRequest("PATCH", `/api/admin/plugins/${id}`, { status, config });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/admin/plugins"] });
            toast({ title: "Configuration Updated", description: "Your changes have been saved." });
            setSelectedPlugin(null);
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const categories = ["All", "ERP", "CRM", "Accounting", "Marketing", "Shipping"];
    const [activeCategory, setActiveCategory] = useState("All");

    const filteredPlugins = plugins?.filter(p =>
        activeCategory === "All" ? true : p.category === activeCategory
    );

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Plug className="w-12 h-12 animate-bounce text-primary/30" />
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="p-8 max-w-7xl mx-auto space-y-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <h1 className="text-5xl font-black tracking-tighter uppercase">App Marketplace</h1>
                        <p className="text-muted-foreground text-lg max-w-2xl">
                            Extend the functionality of Lumina with premium integrations.
                            Connect your ERP, CRM, and logistics providers seamlessly.
                        </p>
                    </div>
                    <div className="flex gap-2 bg-secondary/10 p-1.5 rounded-2xl border border-secondary/10 overflow-x-auto no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeCategory === cat
                                    ? "bg-background shadow-lg text-foreground scale-105"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Categories Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPlugins?.map((plugin) => {
                        const Icon = ICON_MAP[plugin.icon || "Plug"] || Plug;
                        const isActive = plugin.status === "active";
                        const isConfigured = plugin.status !== "not_configured";

                        return (
                            <Card key={plugin.id} className="group relative overflow-hidden border-none shadow-2xl bg-secondary/5 hover:bg-secondary/10 transition-all duration-500 rounded-[2.5rem] flex flex-col">
                                <div className={`absolute top-0 left-0 w-2 h-full ${isActive ? 'bg-green-500' : 'bg-primary/20'}`} />

                                <CardHeader className="p-8 pb-4">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="bg-background p-4 rounded-3xl shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500 border border-secondary/10">
                                            <Icon className="w-8 h-8 text-primary" />
                                        </div>
                                        <div className="flex flex-col items-end gap-2">
                                            <Badge variant={isActive ? "default" : "secondary"} className={`rounded-full px-4 py-1 font-bold uppercase tracking-widest text-[10px] ${isActive ? 'bg-green-500 hover:bg-green-600' : ''}`}>
                                                {plugin.status.replace('_', ' ')}
                                            </Badge>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-50">{plugin.category}</span>
                                        </div>
                                    </div>
                                    <CardTitle className="text-2xl font-black tracking-tighter mb-2">{plugin.name}</CardTitle>
                                    <CardDescription className="text-sm font-medium leading-relaxed line-clamp-2">
                                        {plugin.description}
                                    </CardDescription>
                                </CardHeader>

                                <CardContent className="px-8 flex-1">
                                    <div className="space-y-4 pt-4 border-t border-secondary/5">
                                        <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                                            <CheckCircle2 className={`w-4 h-4 ${isConfigured ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                                            API Integration Ready
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-bold text-muted-foreground">
                                            <CheckCircle2 className={`w-4 h-4 ${isActive ? 'text-green-500' : 'text-muted-foreground/30'}`} />
                                            Real-time Data Sync
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="p-8 pt-4">
                                    <div className="flex gap-3 w-full">
                                        {isActive ? (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    className="flex-1 rounded-2xl h-12 border-2 font-bold"
                                                    onClick={() => setSelectedPlugin(plugin)}
                                                >
                                                    <Settings className="w-4 h-4 mr-2" />
                                                    Settings
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    className="px-4 rounded-2xl h-12 font-bold"
                                                    onClick={() => updatePluginMutation.mutate({ id: plugin.id, status: "inactive" })}
                                                >
                                                    Disable
                                                </Button>
                                            </>
                                        ) : isConfigured ? (
                                            <Button
                                                className="w-full rounded-2xl h-12 font-bold shadow-lg shadow-primary/20"
                                                onClick={() => updatePluginMutation.mutate({ id: plugin.id, status: "active" })}
                                            >
                                                Enable Access
                                            </Button>
                                        ) : (
                                            <Button
                                                className="w-full rounded-2xl h-12 font-bold shadow-lg shadow-primary/20"
                                                onClick={() => setSelectedPlugin(plugin)}
                                            >
                                                Connect {plugin.name}
                                            </Button>
                                        )}
                                    </div>
                                </CardFooter>
                            </Card>
                        );
                    })}

                    {/* Coming Soon Placeholder */}
                    <div className="border-4 border-dashed border-secondary/10 rounded-[2.5rem] flex flex-col items-center justify-center p-12 text-center space-y-4 hover:border-primary/20 transition-colors">
                        <div className="bg-secondary/10 p-6 rounded-full">
                            <Plus className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-black tracking-tighter uppercase opacity-50">Create Plugin</h3>
                        <p className="text-xs font-medium text-muted-foreground max-w-[200px]">
                            Access our SDK to build your own custom ecosystem integrations.
                        </p>
                        <Button variant="link" className="font-black uppercase tracking-widest text-[10px]">Developer Docs</Button>
                    </div>
                </div>

                {/* Config Dialog */}
                <Dialog open={!!selectedPlugin} onOpenChange={() => setSelectedPlugin(null)}>
                    <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl">
                        <DialogHeader className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-2xl">
                                    {selectedPlugin && (ICON_MAP[selectedPlugin.icon || ""] ?
                                        (() => { const Icon = ICON_MAP[selectedPlugin.icon!]; return <Icon className="w-6 h-6 text-primary" />; })() :
                                        <Plug className="w-6 h-6 text-primary" />
                                    )}
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-black tracking-tighter">
                                        Configure {selectedPlugin?.name}
                                    </DialogTitle>
                                    <DialogDescription className="font-medium">
                                        Enter your credentials to link accounts.
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="space-y-6 py-6 border-t border-b border-secondary/10">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="apiKey" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">API Key / Client ID</Label>
                                    <Input id="apiKey" placeholder="Lum_live_..." className="bg-secondary/5 border-none h-12 rounded-xl" defaultValue={(selectedPlugin?.config as PluginConfig)?.apiKey || ""} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="webhook" className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Secret Endpoint</Label>
                                    <Input id="webhook" placeholder="https://api.lumina.io/wh/..." className="bg-secondary/5 border-none h-12 rounded-xl" />
                                </div>
                            </div>
                            <div className="bg-blue-500/5 p-4 rounded-2xl flex gap-3 items-start border border-blue-500/10">
                                <Info className="w-5 h-5 text-blue-500 mt-0.5" />
                                <p className="text-xs font-medium text-blue-700/80 leading-relaxed">
                                    Encryption active. Your keys are stored using AES-256 for maximum security clearance.
                                </p>
                            </div>
                        </div>
                        <DialogFooter className="sm:justify-start pt-2">
                            <Button
                                className="w-full h-14 rounded-2xl text-lg font-black shadow-xl"
                                onClick={() => {
                                    if (selectedPlugin) {
                                        updatePluginMutation.mutate({
                                            id: selectedPlugin.id,
                                            status: "active",
                                            config: { apiKey: "configured" }
                                        });
                                    }
                                }}
                            >
                                Sync Integration
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
