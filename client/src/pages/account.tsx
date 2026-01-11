import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import type { User, Order, Address, OrderTracking } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User as UserIcon, Package, Settings, LogOut, MapPin, Heart, Bell, Shield, Mail, Check, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { useWishlist } from "@/hooks/use-wishlist";
import { ProductCard } from "@/components/product/ProductCard";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Monitor, Languages } from "lucide-react";
type OrderWithTracking = Order & {
    tracking?: OrderTracking[];
};

export default function Account() {
    const searchParams = new URLSearchParams(window.location.search);
    const defaultTab = searchParams.get("tab") || "profile";
    const { theme, setTheme } = useTheme();

    const { data: user } = useQuery<User>({
        queryKey: ["/api/user"],
    });

    const { data: orders } = useQuery<OrderWithTracking[]>({
        queryKey: ["/api/orders"],
    });

    const { data: addresses } = useQuery<Address[]>({
        queryKey: ["/api/user/addresses"],
    });

    const { wishlist } = useWishlist();
    const { toast } = useToast();

    const { data: loyalty } = useQuery<{ points: number }>({
        queryKey: ["/api/loyalty/points"],
    });

    const [selectedPreferences, setSelectedPreferences] = useState<string[]>(user?.preferences || []);

    const updatePreferencesMutation = useMutation({
        mutationFn: async (preferences: string[]) => {
            const res = await apiRequest("PATCH", "/api/user/preferences", { preferences });
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/user"] });
            toast({
                title: "Preferences Updated",
                description: "Your personalized feed will now reflect your style choices.",
            });
        }
    });

    const handleLogout = async () => {
        await fetch("/api/logout", { method: "POST" });
        window.location.href = "/";
    };

    const categories = ["Men", "Women", "Accessories", "Footwear"];

    const togglePreference = (cat: string) => {
        setSelectedPreferences(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        );
    };

    const [isPasswordOpen, setIsPasswordOpen] = useState(false);
    const [isNewsletterOpen, setIsNewsletterOpen] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
    const [newsletterEmail, setNewsletterEmail] = useState(user?.email || "");
    const [syncedEmail, setSyncedEmail] = useState(user?.email);

    if (user?.email !== syncedEmail) {
        setSyncedEmail(user?.email);
        if (user?.email) {
            setNewsletterEmail(user.email);
        }
    }

    const changePasswordMutation = useMutation({
        mutationFn: async () => {
            if (passwordForm.new !== passwordForm.confirm) throw new Error("Passwords do not match");
            await apiRequest("PATCH", "/api/user/password", {
                currentPassword: passwordForm.current,
                newPassword: passwordForm.new
            });
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Password updated successfully" });
            setIsPasswordOpen(false);
            setPasswordForm({ current: "", new: "", confirm: "" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    });

    const newsletterMutation = useMutation({
        mutationFn: async (action: 'subscribe' | 'unsubscribe') => {
            if (action === 'subscribe') {
                await apiRequest("POST", "/api/newsletter/subscribe", { email: newsletterEmail });
            } else {
                await apiRequest("POST", "/api/newsletter/unsubscribe", { email: newsletterEmail });
            }
        },
        onSuccess: () => {
            toast({ title: "Success", description: "Newsletter preferences updated" });
            setIsNewsletterOpen(false);
        },
        onError: () => {
            toast({ title: "Error", description: "Failed to update newsletter settings", variant: "destructive" });
        }
    });

    if (!user) return null;

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow py-12 container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <Tabs defaultValue={defaultTab} className="flex flex-col md:flex-row gap-8">
                        {/* Sidebar */}
                        <aside className="w-full md:w-64 space-y-2">
                            <div className="p-6 bg-secondary/30 rounded-2xl mb-6">
                                <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mb-4">
                                    <UserIcon className="w-8 h-8" />
                                </div>
                                <h2 className="font-bold text-lg truncate">{user.username}</h2>
                                <p className="text-sm text-muted-foreground">Lumina Member</p>
                            </div>

                            <TabsList className="flex flex-col w-full bg-transparent h-auto p-0 space-y-1">
                                <TabsTrigger value="profile" className="w-full justify-start px-4 py-3 h-auto data-[state=active]:bg-secondary transition-all rounded-xl border border-transparent">
                                    <UserIcon className="w-4 h-4 mr-3" />
                                    Profile Details
                                </TabsTrigger>
                                <TabsTrigger value="orders" className="w-full justify-start px-4 py-3 h-auto data-[state=active]:bg-secondary transition-all rounded-xl border border-transparent">
                                    <Package className="w-4 h-4 mr-3" />
                                    Order History
                                </TabsTrigger>
                                <TabsTrigger value="wishlist" className="w-full justify-start px-4 py-3 h-auto data-[state=active]:bg-secondary transition-all rounded-xl border border-transparent">
                                    <Heart className="w-4 h-4 mr-3" />
                                    My Wishlist
                                </TabsTrigger>
                                <TabsTrigger value="preferences" className="w-full justify-start px-4 py-3 h-auto data-[state=active]:bg-secondary transition-all rounded-xl border border-transparent">
                                    <Sparkles className="w-4 h-4 mr-3" />
                                    Style Preferences
                                </TabsTrigger>
                                <TabsTrigger value="addresses" className="w-full justify-start px-4 py-3 h-auto data-[state=active]:bg-secondary transition-all rounded-xl border border-transparent">
                                    <MapPin className="w-4 h-4 mr-3" />
                                    Saved Addresses
                                </TabsTrigger>
                                <TabsTrigger value="settings" className="w-full justify-start px-4 py-3 h-auto data-[state=active]:bg-secondary transition-all rounded-xl border border-transparent">
                                    <Settings className="w-4 h-4 mr-3" />
                                    Settings
                                </TabsTrigger>
                            </TabsList>

                            <Button
                                variant="ghost"
                                className="w-full justify-start px-4 py-3 h-auto text-destructive hover:text-destructive hover:bg-destructive/10 rounded-xl mt-4"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4 mr-3" />
                                Sign Out
                            </Button>
                        </aside>

                        {/* Content area wrapped in Tabs */}
                        <div className="flex-1">
                            <TabsContent value="profile" className="mt-0 space-y-6">
                                <Card className="border-none shadow-sm bg-secondary/10">
                                    <CardHeader>
                                        <CardTitle className="tracking-tighter">Profile Information</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Username</p>
                                                <p className="font-medium text-lg">{user.username}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Account Type</p>
                                                <p className="font-medium text-lg">{user.isAdmin ? "Administrator" : "Customer"}</p>
                                            </div>
                                            <div className="space-y-1 col-span-full pt-4 border-t border-primary/10">
                                                <div className="bg-primary/5 p-6 rounded-2xl flex items-center justify-between overflow-hidden relative">
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-1">Loyalty Balance</p>
                                                        <p className="text-4xl font-black tracking-tighter italic">{loyalty?.points || 0} <span className="text-xs uppercase tracking-widest not-italic opacity-60 ml-2">Points</span></p>
                                                        <p className="text-[10px] font-medium text-muted-foreground mt-2 uppercase tracking-widest leading-relaxed">
                                                            Earn more points with every purchase.<br />
                                                            100 Points = {formatCurrency(10000)} in rewards.
                                                        </p>
                                                    </div>
                                                    <Sparkles className="w-16 h-16 text-primary/10 absolute -right-2 -bottom-2 rotate-12" />
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="orders" className="mt-0 space-y-6">
                                <h2 className="text-2xl font-bold tracking-tighter mb-6">Your Orders</h2>
                                {orders && orders.length > 0 ? (
                                    <div className="space-y-4">
                                        {orders.map((order) => (
                                            <Card key={order.id} className="border-none shadow-sm bg-secondary/10 overflow-hidden">
                                                <div className="p-6 flex flex-col md:flex-row justify-between gap-4">
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Order ID</p>
                                                        <p className="font-mono text-sm">#{order.id.toString().padStart(6, '0')}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Date</p>
                                                        <p className="text-sm">{format(new Date(order.createdAt), "PPP")}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total</p>
                                                        <p className="font-bold">{formatCurrency(order.total)}</p>
                                                    </div>
                                                    <div className="flex flex-col items-end gap-2">
                                                        <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium capitalize">
                                                            {order.status}
                                                        </span>
                                                        {order.tracking && order.tracking.length > 0 && (
                                                            <p className="text-[10px] text-muted-foreground italic">
                                                                Last Update: {order.tracking[0].description}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="p-12 text-center border-dashed bg-transparent">
                                        <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                        <p className="text-muted-foreground">No orders yet.</p>
                                        <Button variant="link" onClick={() => window.location.href = "/"}>Start Shopping</Button>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="wishlist" className="mt-0 space-y-6">
                                <h2 className="text-2xl font-bold tracking-tighter mb-6">Your Wishlist</h2>
                                {wishlist && wishlist.length > 0 ? (
                                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12 sm:gap-8">
                                        {wishlist.map((product) => (
                                            <ProductCard key={product.id} product={product} />
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="p-12 text-center border-dashed bg-transparent">
                                        <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                        <p className="text-muted-foreground">Your wishlist is empty.</p>
                                        <Button variant="link" onClick={() => window.location.href = "/"}>Discover Products</Button>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="preferences" className="mt-0 space-y-6">
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold tracking-tighter">Style Preferences</h2>
                                    <p className="text-muted-foreground">Select the categories you&apos;re most interested in for a personalized experience.</p>
                                </div>

                                <Card className="border-none shadow-sm bg-secondary/10">
                                    <CardContent className="p-8 space-y-8">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {categories.map((cat) => (
                                                <div
                                                    key={cat}
                                                    role="button"
                                                    tabIndex={0}
                                                    className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedPreferences.includes(cat)
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-transparent bg-background/50 hover:bg-background'
                                                        }`}
                                                    onClick={() => togglePreference(cat)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' || e.key === ' ') {
                                                            e.preventDefault();
                                                            togglePreference(cat);
                                                        }
                                                    }}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedPreferences.includes(cat) ? 'bg-primary text-white' : 'bg-secondary'
                                                            }`}>
                                                            {selectedPreferences.includes(cat) ? <Check className="w-5 h-5" /> : <Sparkles className="w-4 h-4 opacity-20" />}
                                                        </div>
                                                        <span className="font-bold text-lg">{cat}</span>
                                                    </div>
                                                    <Checkbox
                                                        checked={selectedPreferences.includes(cat)}
                                                        onCheckedChange={() => togglePreference(cat)}
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="pt-4 border-t border-primary/10">
                                            <Button
                                                className="w-full sm:w-auto px-12 h-14 rounded-xl text-lg font-bold"
                                                onClick={() => updatePreferencesMutation.mutate(selectedPreferences)}
                                                disabled={updatePreferencesMutation.isPending}
                                            >
                                                {updatePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            <TabsContent value="addresses" className="mt-0 space-y-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-2xl font-bold tracking-tighter">Saved Addresses</h2>
                                    <Button size="sm" className="rounded-xl">Add New Address</Button>
                                </div>

                                {addresses && addresses.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((addr) => (
                                            <Card key={addr.id} className="border-none shadow-sm bg-secondary/10 relative">
                                                <CardContent className="p-6 space-y-3">
                                                    <div className="flex justify-between">
                                                        <p className="font-bold">{addr.fullName}</p>
                                                        {addr.isDefault && <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">Default</Badge>}
                                                    </div>
                                                    <div className="space-y-1 text-sm text-muted-foreground">
                                                        <p>{addr.addressLine1}</p>
                                                        {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                                                        <p>{addr.city}, {addr.zipCode}</p>
                                                        <p>{addr.phoneNumber}</p>
                                                    </div>
                                                    <div className="flex gap-2 pt-2">
                                                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs">Edit</Button>
                                                        <Button variant="ghost" size="sm" className="h-8 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10">Delete</Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card className="p-12 text-center border-dashed bg-transparent">
                                        <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                                        <p className="text-muted-foreground">No saved addresses yet.</p>
                                    </Card>
                                )}
                            </TabsContent>

                            <TabsContent value="settings" className="mt-0 space-y-6">
                                <h2 className="text-2xl font-bold tracking-tighter mb-6">Settings</h2>
                                <div className="space-y-4">
                                    <Card className="border-none shadow-sm bg-secondary/10">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Monitor className="w-4 h-4" />
                                                Appearance & Language
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-sm">Theme Preference</p>
                                                    <p className="text-xs text-muted-foreground">Choose how the application looks to you.</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Select value={theme} onValueChange={setTheme}>
                                                        <SelectTrigger className="w-[140px] h-9 text-xs font-medium">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="light">
                                                                <div className="flex items-center gap-2">
                                                                    <Sun className="w-3 h-3" /> Light
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="dark">
                                                                <div className="flex items-center gap-2">
                                                                    <Moon className="w-3 h-3" /> Dark
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="system">
                                                                <div className="flex items-center gap-2">
                                                                    <Monitor className="w-3 h-3" /> System
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-4 border-t border-muted/20">
                                                <div>
                                                    <p className="font-medium text-sm">Language</p>
                                                    <p className="text-xs text-muted-foreground">Select your preferred language.</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Select
                                                        value={user?.preferences?.find(p => p.startsWith("lang:"))?.split(":")[1] || "en"}
                                                        onValueChange={(val) => {
                                                            const current = user?.preferences || [];
                                                            const others = current.filter(p => !p.startsWith("lang:"));
                                                            updatePreferencesMutation.mutate([...others, `lang:${val}`]);
                                                        }}
                                                    >
                                                        <SelectTrigger className="w-[140px] h-9 text-xs font-medium">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="en">
                                                                <div className="flex items-center gap-2">
                                                                    <Languages className="w-3 h-3" /> English
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="es">
                                                                <div className="flex items-center gap-2">
                                                                    <Languages className="w-3 h-3" /> Español
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="fr">
                                                                <div className="flex items-center gap-2">
                                                                    <Languages className="w-3 h-3" /> Français
                                                                </div>
                                                            </SelectItem>
                                                            <SelectItem value="de">
                                                                <div className="flex items-center gap-2">
                                                                    <Languages className="w-3 h-3" /> Deutsch
                                                                </div>
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-sm bg-secondary/10">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Bell className="w-4 h-4" />
                                                Notifications
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-sm">Email Notifications</p>
                                                    <p className="text-xs text-muted-foreground">Receive updates about your orders and exclusive offers.</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Switch
                                                        checked={user?.preferences?.includes("notifications_enabled") ?? false}
                                                        onCheckedChange={(checked) => {
                                                            const current = user?.preferences || [];
                                                            const next = checked
                                                                ? [...current, "notifications_enabled"]
                                                                : current.filter(p => p !== "notifications_enabled");
                                                            updatePreferencesMutation.mutate(next);
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-sm bg-secondary/10">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Shield className="w-4 h-4" />
                                                Privacy & Security
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-sm">Password Management</p>
                                                    <p className="text-xs text-muted-foreground">Update your password to keep your account secure.</p>
                                                </div>
                                                <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">Change Password</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Change Password</DialogTitle>
                                                            <DialogDescription>
                                                                Enter your current password and a new password below.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="space-y-4 py-4">
                                                            <div className="space-y-2">
                                                                <Label>Current Password</Label>
                                                                <Input
                                                                    type="password"
                                                                    value={passwordForm.current}
                                                                    onChange={(e) => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>New Password</Label>
                                                                <Input
                                                                    type="password"
                                                                    value={passwordForm.new}
                                                                    onChange={(e) => setPasswordForm(p => ({ ...p, new: e.target.value }))}
                                                                />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <Label>Confirm New Password</Label>
                                                                <Input
                                                                    type="password"
                                                                    value={passwordForm.confirm}
                                                                    onChange={(e) => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                                                                />
                                                            </div>
                                                        </div>
                                                        <DialogFooter>
                                                            <Button onClick={() => changePasswordMutation.mutate()} disabled={changePasswordMutation.isPending}>
                                                                {changePasswordMutation.isPending ? "Updating..." : "Update Password"}
                                                            </Button>
                                                        </DialogFooter>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Card className="border-none shadow-sm bg-secondary/10">
                                        <CardHeader>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Mail className="w-4 h-4" />
                                                Marketing Preferences
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-medium text-sm">Newsletter Subscription</p>
                                                    <p className="text-xs text-muted-foreground">Sign up for our monthly fashion trends and new arrivals report.</p>
                                                </div>
                                                <Dialog open={isNewsletterOpen} onOpenChange={setIsNewsletterOpen}>
                                                    <DialogTrigger asChild>
                                                        <Button variant="outline" size="sm">Manage</Button>
                                                    </DialogTrigger>
                                                    <DialogContent>
                                                        <DialogHeader>
                                                            <DialogTitle>Newsletter Subscription</DialogTitle>
                                                            <DialogDescription>
                                                                Manage your subscription to our newsletter.
                                                            </DialogDescription>
                                                        </DialogHeader>
                                                        <div className="py-4 space-y-4">
                                                            <div className="space-y-2">
                                                                <Label>Email Address</Label>
                                                                <Input
                                                                    value={newsletterEmail}
                                                                    onChange={(e) => setNewsletterEmail(e.target.value)}
                                                                    placeholder="your@email.com"
                                                                />
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    className="flex-1"
                                                                    onClick={() => newsletterMutation.mutate('subscribe')}
                                                                    disabled={newsletterMutation.isPending}
                                                                >
                                                                    Subscribe
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    className="flex-1 text-destructive hover:text-destructive"
                                                                    onClick={() => newsletterMutation.mutate('unsubscribe')}
                                                                    disabled={newsletterMutation.isPending}
                                                                >
                                                                    Unsubscribe
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </main>
            <Footer />
        </div>
    );
}
