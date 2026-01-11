import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Store, CreditCard, Truck, Receipt, Mail, Search, Shield, Gift, Package } from "lucide-react";
import type { Settings } from "@shared/settings-schema";

export default function AdminSettings() {
    const { toast } = useToast();
    const [activeTab, setActiveTab] = useState("store");

    const { data: settings, isLoading } = useQuery<Settings>({
        queryKey: ["/api/settings"],
    });

    const [formData, setFormData] = useState<Settings | null>(null);

    const updateMutation = useMutation({
        mutationFn: async (data: Settings) => {
            const res = await apiRequest("PUT", "/api/settings", data);
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
            toast({ title: "Success", description: "Settings updated successfully" });
        },
        onError: (error: Error) => {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            updateMutation.mutate(formData);
        }
    };

    const updateField = (category: keyof Settings, field: string, value: string | number | boolean | string[]) => {
        setFormData((prev) => ({
            ...(prev || settings!),
            [category]: {
                ...(prev?.[category] || settings?.[category] || {}),
                [field]: value,
            },
        }));
    };

    if (isLoading) {
        return (
            <AdminLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" />
                </div>
            </AdminLayout>
        );
    }

    const currentData = formData || settings!;

    return (
        <AdminLayout>
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-center bg-secondary/10 p-10 rounded-[2.5rem] border border-secondary/5">
                    <div>
                        <h1 className="text-4xl font-black tracking-tighter mb-2">Platform Settings</h1>
                        <p className="text-muted-foreground font-medium text-lg">Configure your e-commerce platform</p>
                    </div>
                    <Button
                        onClick={handleSubmit}
                        disabled={updateMutation.isPending}
                        className="h-14 px-8 rounded-xl font-black uppercase text-xs tracking-[0.2em] shadow-xl"
                    >
                        {updateMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Save className="w-4 h-4 mr-2" />
                        )}
                        Save Changes
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid grid-cols-3 lg:grid-cols-9 gap-2 bg-transparent h-auto p-0">
                        {[
                            { value: "store", icon: Store, label: "Store" },
                            { value: "payment", icon: CreditCard, label: "Payment" },
                            { value: "shipping", icon: Truck, label: "Shipping" },
                            { value: "tax", icon: Receipt, label: "Tax" },
                            { value: "email", icon: Mail, label: "Email" },
                            { value: "seo", icon: Search, label: "SEO" },
                            { value: "security", icon: Shield, label: "Security" },
                            { value: "loyalty", icon: Gift, label: "Loyalty" },
                            { value: "inventory", icon: Package, label: "Inventory" },
                        ].map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <TabsTrigger
                                    key={tab.value}
                                    value={tab.value}
                                    className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-xl px-4 py-3 font-black uppercase text-[10px] tracking-wider transition-all"
                                >
                                    <Icon className="w-4 h-4 mr-2" />
                                    {tab.label}
                                </TabsTrigger>
                            );
                        })}
                    </TabsList>

                    {/* Store Settings */}
                    <TabsContent value="store" className="space-y-6">
                        <div className="bg-white p-8 rounded-[2rem] border border-secondary/10 space-y-6">
                            <h2 className="text-2xl font-black tracking-tight">Store Information</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="storeName">Store Name</Label>
                                    <Input
                                        id="storeName"
                                        value={currentData.store?.storeName || ""}
                                        onChange={(e) => updateField("store", "storeName", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="storeEmail">Store Email</Label>
                                    <Input
                                        id="storeEmail"
                                        type="email"
                                        value={currentData.store?.storeEmail || ""}
                                        onChange={(e) => updateField("store", "storeEmail", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="storePhone">Store Phone</Label>
                                    <Input
                                        id="storePhone"
                                        value={currentData.store?.storePhone || ""}
                                        onChange={(e) => updateField("store", "storePhone", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="storeCountry">Country</Label>
                                    <Input
                                        id="storeCountry"
                                        value={currentData.store?.storeCountry || ""}
                                        onChange={(e) => updateField("store", "storeCountry", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="storeAddress">Address</Label>
                                    <Input
                                        id="storeAddress"
                                        value={currentData.store?.storeAddress || ""}
                                        onChange={(e) => updateField("store", "storeAddress", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="storeCity">City</Label>
                                    <Input
                                        id="storeCity"
                                        value={currentData.store?.storeCity || ""}
                                        onChange={(e) => updateField("store", "storeCity", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="storeZipCode">Zip Code</Label>
                                    <Input
                                        id="storeZipCode"
                                        value={currentData.store?.storeZipCode || ""}
                                        onChange={(e) => updateField("store", "storeZipCode", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Payment Settings */}
                    <TabsContent value="payment" className="space-y-6">
                        <div className="bg-white p-8 rounded-[2rem] border border-secondary/10 space-y-8">
                            <h2 className="text-2xl font-black tracking-tight">Payment Methods</h2>

                            {/* M-Pesa */}
                            <div className="space-y-4 p-6 bg-secondary/5 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black">M-Pesa</h3>
                                    <Switch
                                        checked={currentData.payment?.mpesaEnabled || false}
                                        onCheckedChange={(checked) => updateField("payment", "mpesaEnabled", checked)}
                                    />
                                </div>
                                {currentData.payment?.mpesaEnabled && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Consumer Key</Label>
                                            <Input
                                                value={currentData.payment?.mpesaConsumerKey || ""}
                                                onChange={(e) => updateField("payment", "mpesaConsumerKey", e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Consumer Secret</Label>
                                            <Input
                                                type="password"
                                                value={currentData.payment?.mpesaConsumerSecret || ""}
                                                onChange={(e) => updateField("payment", "mpesaConsumerSecret", e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Stripe */}
                            <div className="space-y-4 p-6 bg-secondary/5 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black">Stripe</h3>
                                    <Switch
                                        checked={currentData.payment?.stripeEnabled || false}
                                        onCheckedChange={(checked) => updateField("payment", "stripeEnabled", checked)}
                                    />
                                </div>
                                {currentData.payment?.stripeEnabled && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Public Key</Label>
                                            <Input
                                                value={currentData.payment?.stripePublicKey || ""}
                                                onChange={(e) => updateField("payment", "stripePublicKey", e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Secret Key</Label>
                                            <Input
                                                type="password"
                                                value={currentData.payment?.stripeSecretKey || ""}
                                                onChange={(e) => updateField("payment", "stripeSecretKey", e.target.value)}
                                                className="rounded-xl"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Cash on Delivery */}
                            <div className="space-y-4 p-6 bg-secondary/5 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black">Cash on Delivery</h3>
                                    <Switch
                                        checked={currentData.payment?.codEnabled || false}
                                        onCheckedChange={(checked) => updateField("payment", "codEnabled", checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Shipping Settings */}
                    <TabsContent value="shipping" className="space-y-6">
                        <div className="bg-white p-8 rounded-[2rem] border border-secondary/10 space-y-6">
                            <h2 className="text-2xl font-black tracking-tight">Shipping Configuration</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Free Shipping Threshold (cents)</Label>
                                    <Input
                                        type="number"
                                        value={currentData.shipping?.freeShippingThreshold || 0}
                                        onChange={(e) => updateField("shipping", "freeShippingThreshold", parseInt(e.target.value))}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Standard Shipping Cost (cents)</Label>
                                    <Input
                                        type="number"
                                        value={currentData.shipping?.standardShippingCost || 0}
                                        onChange={(e) => updateField("shipping", "standardShippingCost", parseInt(e.target.value))}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Express Shipping Cost (cents)</Label>
                                    <Input
                                        type="number"
                                        value={currentData.shipping?.expressShippingCost || 0}
                                        onChange={(e) => updateField("shipping", "expressShippingCost", parseInt(e.target.value))}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Standard Delivery Time</Label>
                                    <Input
                                        value={currentData.shipping?.standardShippingDays || ""}
                                        onChange={(e) => updateField("shipping", "standardShippingDays", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Express Delivery Time</Label>
                                    <Input
                                        value={currentData.shipping?.expressShippingDays || ""}
                                        onChange={(e) => updateField("shipping", "expressShippingDays", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2 flex items-center justify-between p-4 bg-secondary/5 rounded-xl">
                                    <Label>Allow Pickup</Label>
                                    <Switch
                                        checked={currentData.shipping?.allowPickup || false}
                                        onCheckedChange={(checked) => updateField("shipping", "allowPickup", checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tax Settings */}
                    <TabsContent value="tax" className="space-y-6">
                        <div className="bg-white p-8 rounded-[2rem] border border-secondary/10 space-y-6">
                            <h2 className="text-2xl font-black tracking-tight">Tax Configuration</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 flex items-center justify-between p-4 bg-secondary/5 rounded-xl">
                                    <Label>Enable Tax</Label>
                                    <Switch
                                        checked={currentData.tax?.taxEnabled || false}
                                        onCheckedChange={(checked) => updateField("tax", "taxEnabled", checked)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tax Rate (%)</Label>
                                    <Input
                                        type="number"
                                        value={currentData.tax?.taxRate || 0}
                                        onChange={(e) => updateField("tax", "taxRate", parseFloat(e.target.value))}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Tax Name</Label>
                                    <Input
                                        value={currentData.tax?.taxName || ""}
                                        onChange={(e) => updateField("tax", "taxName", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2 flex items-center justify-between p-4 bg-secondary/5 rounded-xl">
                                    <Label>Prices Include Tax</Label>
                                    <Switch
                                        checked={currentData.tax?.pricesIncludeTax || false}
                                        onCheckedChange={(checked) => updateField("tax", "pricesIncludeTax", checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Email Settings */}
                    <TabsContent value="email" className="space-y-6">
                        <div className="bg-white p-8 rounded-[2rem] border border-secondary/10 space-y-6">
                            <h2 className="text-2xl font-black tracking-tight">Email Configuration</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>SMTP Host</Label>
                                    <Input
                                        value={currentData.email?.smtpHost || ""}
                                        onChange={(e) => updateField("email", "smtpHost", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>SMTP Port</Label>
                                    <Input
                                        type="number"
                                        value={currentData.email?.smtpPort || ""}
                                        onChange={(e) => updateField("email", "smtpPort", parseInt(e.target.value))}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>SMTP User</Label>
                                    <Input
                                        value={currentData.email?.smtpUser || ""}
                                        onChange={(e) => updateField("email", "smtpUser", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>SMTP Password</Label>
                                    <Input
                                        type="password"
                                        value={currentData.email?.smtpPassword || ""}
                                        onChange={(e) => updateField("email", "smtpPassword", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>From Email</Label>
                                    <Input
                                        type="email"
                                        value={currentData.email?.emailFrom || ""}
                                        onChange={(e) => updateField("email", "emailFrom", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>From Name</Label>
                                    <Input
                                        value={currentData.email?.emailFromName || ""}
                                        onChange={(e) => updateField("email", "emailFromName", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                            <div className="space-y-4 p-6 bg-secondary/5 rounded-xl">
                                <h3 className="text-lg font-black">Email Notifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {[
                                        { key: "orderConfirmationEnabled", label: "Order Confirmation" },
                                        { key: "orderShippedEnabled", label: "Order Shipped" },
                                        { key: "orderDeliveredEnabled", label: "Order Delivered" },
                                        { key: "newsletterEnabled", label: "Newsletter" },
                                    ].map((item) => (
                                        <div key={item.key} className="flex items-center justify-between p-4 bg-white rounded-xl">
                                            <Label>{item.label}</Label>
                                            <Switch
                                                checked={currentData.email?.[item.key as keyof typeof currentData.email] as boolean || false}
                                                onCheckedChange={(checked) => updateField("email", item.key, checked)}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* SEO Settings */}
                    <TabsContent value="seo" className="space-y-6">
                        <div className="bg-white p-8 rounded-[2rem] border border-secondary/10 space-y-6">
                            <h2 className="text-2xl font-black tracking-tight">SEO Configuration</h2>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <Label>Site Title</Label>
                                    <Input
                                        value={currentData.seo?.siteTitle || ""}
                                        onChange={(e) => updateField("seo", "siteTitle", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Site Description</Label>
                                    <Input
                                        value={currentData.seo?.siteDescription || ""}
                                        onChange={(e) => updateField("seo", "siteDescription", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Keywords</Label>
                                    <Input
                                        value={currentData.seo?.siteKeywords || ""}
                                        onChange={(e) => updateField("seo", "siteKeywords", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Google Analytics ID</Label>
                                    <Input
                                        value={currentData.seo?.googleAnalyticsId || ""}
                                        onChange={(e) => updateField("seo", "googleAnalyticsId", e.target.value)}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Security Settings */}
                    <TabsContent value="security" className="space-y-6">
                        <div className="bg-white p-8 rounded-[2rem] border border-secondary/10 space-y-6">
                            <h2 className="text-2xl font-black tracking-tight">Security Configuration</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 flex items-center justify-between p-4 bg-secondary/5 rounded-xl">
                                    <Label>Enable Rate Limiting</Label>
                                    <Switch
                                        checked={currentData.security?.enableRateLimiting || false}
                                        onCheckedChange={(checked) => updateField("security", "enableRateLimiting", checked)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Login Attempts</Label>
                                    <Input
                                        type="number"
                                        value={currentData.security?.maxLoginAttempts || 5}
                                        onChange={(e) => updateField("security", "maxLoginAttempts", parseInt(e.target.value))}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Session Timeout (minutes)</Label>
                                    <Input
                                        type="number"
                                        value={currentData.security?.sessionTimeout || 30}
                                        onChange={(e) => updateField("security", "sessionTimeout", parseInt(e.target.value))}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2 flex items-center justify-between p-4 bg-secondary/5 rounded-xl">
                                    <Label>Require Email Verification</Label>
                                    <Switch
                                        checked={currentData.security?.requireEmailVerification || false}
                                        onCheckedChange={(checked) => updateField("security", "requireEmailVerification", checked)}
                                    />
                                </div>
                                <div className="space-y-2 flex items-center justify-between p-4 bg-secondary/5 rounded-xl">
                                    <Label>Allow Guest Checkout</Label>
                                    <Switch
                                        checked={currentData.security?.allowGuestCheckout || false}
                                        onCheckedChange={(checked) => updateField("security", "allowGuestCheckout", checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Loyalty Settings */}
                    <TabsContent value="loyalty" className="space-y-6">
                        <div className="bg-white p-8 rounded-[2rem] border border-secondary/10 space-y-6">
                            <h2 className="text-2xl font-black tracking-tight">Loyalty Program</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 flex items-center justify-between p-4 bg-secondary/5 rounded-xl">
                                    <Label>Enable Loyalty Program</Label>
                                    <Switch
                                        checked={currentData.loyalty?.loyaltyEnabled || false}
                                        onCheckedChange={(checked) => updateField("loyalty", "loyaltyEnabled", checked)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Points Per Currency Unit</Label>
                                    <Input
                                        type="number"
                                        value={currentData.loyalty?.pointsPerCurrency || 1}
                                        onChange={(e) => updateField("loyalty", "pointsPerCurrency", parseInt(e.target.value))}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Points Value (cents)</Label>
                                    <Input
                                        type="number"
                                        value={currentData.loyalty?.pointsValue || 1}
                                        onChange={(e) => updateField("loyalty", "pointsValue", parseInt(e.target.value))}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Minimum Redemption Points</Label>
                                    <Input
                                        type="number"
                                        value={currentData.loyalty?.minimumRedemption || 100}
                                        onChange={(e) => updateField("loyalty", "minimumRedemption", parseInt(e.target.value))}
                                        className="rounded-xl"
                                    />
                                </div>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Inventory Settings */}
                    <TabsContent value="inventory" className="space-y-6">
                        <div className="bg-white p-8 rounded-[2rem] border border-secondary/10 space-y-6">
                            <h2 className="text-2xl font-black tracking-tight">Inventory Management</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 flex items-center justify-between p-4 bg-secondary/5 rounded-xl">
                                    <Label>Track Inventory</Label>
                                    <Switch
                                        checked={currentData.inventory?.trackInventory || false}
                                        onCheckedChange={(checked) => updateField("inventory", "trackInventory", checked)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Low Stock Threshold</Label>
                                    <Input
                                        type="number"
                                        value={currentData.inventory?.lowStockThreshold || 5}
                                        onChange={(e) => updateField("inventory", "lowStockThreshold", parseInt(e.target.value))}
                                        className="rounded-xl"
                                    />
                                </div>
                                <div className="space-y-2 flex items-center justify-between p-4 bg-secondary/5 rounded-xl">
                                    <Label>Allow Backorders</Label>
                                    <Switch
                                        checked={currentData.inventory?.allowBackorders || false}
                                        onCheckedChange={(checked) => updateField("inventory", "allowBackorders", checked)}
                                    />
                                </div>
                                <div className="space-y-2 flex items-center justify-between p-4 bg-secondary/5 rounded-xl">
                                    <Label>Notify Low Stock</Label>
                                    <Switch
                                        checked={currentData.inventory?.notifyLowStock || false}
                                        onCheckedChange={(checked) => updateField("inventory", "notifyLowStock", checked)}
                                    />
                                </div>
                                {currentData.inventory?.notifyLowStock && (
                                    <div className="space-y-2 md:col-span-2">
                                        <Label>Low Stock Email</Label>
                                        <Input
                                            type="email"
                                            value={currentData.inventory?.lowStockEmail || ""}
                                            onChange={(e) => updateField("inventory", "lowStockEmail", e.target.value)}
                                            className="rounded-xl"
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
