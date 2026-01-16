import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { CreateOrder, User, Order } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useCurrency } from "@/hooks/use-currency";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useCallback } from "react";
import { Loader2, ArrowLeft, CheckCircle2, User as UserIcon, CreditCard, Smartphone, Sparkles } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertOrderSchema } from "@shared/schema";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import type { z } from "zod";
import { useCart } from "@/hooks/use-cart";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import { StripeCheckout } from "@/components/payment/StripeCheckout";
import { MpesaCheckout } from "@/components/payment/MpesaCheckout";
import { PayPalCheckout } from "@/components/payment/PayPalCheckout";
import { useSettings } from "@/hooks/use-settings";

// Initialize Stripe (use env var in production)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_mock");


type CheckoutFormData = z.infer<typeof insertOrderSchema>;

export default function Checkout() {
    const [, setLocation] = useLocation();
    const { toast } = useToast();
    const [isSuccess, setIsSuccess] = useState(false);
    const { cart, isLoading: isCartLoading, clearCart } = useCart();
    const [stripeClientSecret, setStripeClientSecret] = useState<string | null>(null);
    const [showMpesaUi, setShowMpesaUi] = useState(false);
    const [showPaypalUi, setShowPaypalUi] = useState(false);
    const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
    const { formatPrice } = useCurrency();
    const [giftCardCode, setGiftCardCode] = useState("");
    const [appliedGiftCard, setAppliedGiftCard] = useState<{ code: string; value: number } | null>(null);
    const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);

    const { data: user } = useQuery<User>({
        queryKey: ["/api/user"],
        retry: false,
    });

    const { data: loyalty } = useQuery<{ points: number }>({
        queryKey: ["/api/loyalty/points"],
        enabled: !!user,
    });

    const form = useForm<CheckoutFormData>({
        resolver: zodResolver(insertOrderSchema),
        defaultValues: {
            customerFullName: "",
            customerEmail: "",
            shippingAddress: "",
            shippingCity: "",
            shippingZipCode: "",
            phoneNumber: "",
            orderNotes: "",
            paymentMethod: "mpesa",
            shippingMethod: "standard",
        }
    });

    const selectedShippingMethod = useWatch({
        control: form.control,
        name: "shippingMethod",
        defaultValue: "standard"
    });

    const handlePaymentSuccess = useCallback(() => {
        setIsSuccess(true);
        clearCart();
        queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    }, [clearCart, setIsSuccess]);

    const { settings } = useSettings();

    // Defaults for when settings aren't loaded
    const VAT_RATE = settings?.tax?.taxEnabled ? (settings.tax.taxRate / 100) : 0.16;
    const FREE_SHIPPING_THRESHOLD = (settings?.shipping?.freeShippingThreshold || 10000) * 100;

    const SHIPPING_METHODS = [
        {
            id: "standard",
            name: "Standard (G4S/Wells Fargo)",
            cost: (settings?.shipping?.standardShippingCost || 500) * 100,
            description: settings?.shipping?.standardShippingDays || "3-5 business days"
        },
        {
            id: "express",
            name: "Express (Door-to-Door)",
            cost: (settings?.shipping?.expressShippingCost || 1500) * 100,
            description: settings?.shipping?.expressShippingDays || "1-2 business days"
        },
        {
            id: "pickup",
            name: "In-Store Pickup",
            cost: 0,
            description: settings?.shipping?.pickupLocations?.join(" / ") || "Store Pickup"
        },
    ];

    const orderMutation = useMutation({
        mutationFn: async (orderData: CreateOrder) => {
            const res = await apiRequest("POST", "/api/orders", orderData);
            return res.json();
        },
        onSuccess: async (data: Order) => {
            setCreatedOrder(data);
            const order = data;

            if (order.paymentMethod === "mpesa") {
                setShowMpesaUi(true);
            } else if (order.paymentMethod === "card") {
                // Fetch Client Secret for Stripe
                try {
                    const res = await apiRequest("POST", "/api/payment/card/init", {
                        amount: order.total,
                        currency: "KES",
                        metadata: { orderId: order.id }
                    });
                    const { clientSecret } = await res.json();
                    setStripeClientSecret(clientSecret);
                } catch {
                    toast({
                        title: "Payment Error",
                        description: "Could not initialize secure card payment.",
                        variant: "destructive"
                    });
                }
            } else if (order.paymentMethod === "paypal") {
                setShowPaypalUi(true);
            } else {
                // Default fallback
                handlePaymentSuccess();
            }
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({
                title: "Order failed",
                description: message,
                variant: "destructive",
            });
        }
    });

    if (isCartLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen flex flex-col">
                <Navbar />
                <main className="flex-grow flex items-center justify-center p-4">
                    <div className="text-center space-y-6 max-w-md">
                        <div className="flex justify-center">
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                        </div>
                        <h1 className="text-4xl font-bold tracking-tighter">Order Confirmed</h1>
                        <p className="text-muted-foreground text-lg leading-relaxed">
                            Thank you for your purchase. We&apos;ve received your order and are preparing it for shipment.
                        </p>
                        <div className="pt-6 space-y-4">
                            {user ? (
                                <Button className="w-full" onClick={() => setLocation("/orders")}>
                                    View My Orders
                                </Button>
                            ) : null}
                            <Button variant="outline" className="w-full" onClick={() => setLocation("/")}>
                                Return to Shop
                            </Button>
                        </div>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const subtotal = cart?.items?.reduce((acc, item) => acc + (item.product.price * item.quantity), 0) || 0;
    const taxAmount = Math.round(subtotal * VAT_RATE);

    // Check for free shipping eligibility
    const isFreeShippingEligible = subtotal >= FREE_SHIPPING_THRESHOLD;

    const shippingMethodObj = SHIPPING_METHODS.find(m => m.id === selectedShippingMethod);
    const shippingCost = (isFreeShippingEligible && selectedShippingMethod !== "pickup") ? 0 : (shippingMethodObj?.cost || 0);

    const giftCardAmount = appliedGiftCard ? Math.min(appliedGiftCard.value, subtotal + taxAmount + shippingCost) : 0;

    const pointsValue = settings?.loyalty?.pointsValue || 1;
    const minRedemption = settings?.loyalty?.minimumRedemption || 100;
    const canRedeem = useLoyaltyPoints && loyalty && loyalty.points >= minRedemption;

    const pointsRedeemed = canRedeem
        ? Math.min(loyalty.points * pointsValue * 100, subtotal + taxAmount + shippingCost - giftCardAmount)
        : 0;

    const total = Math.max(0, subtotal + taxAmount + shippingCost - giftCardAmount - pointsRedeemed);

    const verifyGiftCard = async () => {
        try {
            const res = await apiRequest("POST", "/api/gift-cards/verify", { code: giftCardCode });
            const card = await res.json();
            setAppliedGiftCard({ code: card.code, value: card.remainingValue });
            toast({ title: "Gift Card Applied", description: `You saved ${formatPrice(card.remainingValue)}` });
        } catch {
            toast({ title: "Invalid Gift Card", description: "This code is not valid or has expired.", variant: "destructive" });
        }
    };

    const onFormSubmit = (data: CheckoutFormData) => {
        if (!cart?.items?.length) return;

        orderMutation.mutate({
            ...data,
            subtotal,
            taxAmount,
            shippingCost,
            total,
            pointsRedeemed: pointsRedeemed / (pointsValue * 100), // convert cents value back to points
            giftCardAmount,
            giftCardCode: appliedGiftCard?.code,
            items: cart.items.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                price: item.product.price
            }))
        });
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow py-16 container mx-auto px-4">
                <div className="max-w-6xl mx-auto">
                    <Button variant="ghost" className="mb-8 pl-0 hover:bg-transparent" onClick={() => setLocation("/cart")}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Cart
                    </Button>

                    {!user && (
                        <div className="mb-12 p-1 bg-gradient-to-r from-accent/20 via-primary/10 to-accent/20 rounded-[2rem]">
                            <Card className="border-none bg-white/80 backdrop-blur-sm rounded-[1.95rem] hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500">
                                <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-8 gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 rounded-3xl bg-accent/10 flex items-center justify-center flex-shrink-0 animate-pulse">
                                            <UserIcon className="w-8 h-8 text-accent" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xl tracking-tighter uppercase">Member Access</h3>
                                            <p className="text-muted-foreground text-sm font-medium">Enjoy exclusive rewards and faster checkout.</p>
                                        </div>
                                    </div>
                                    <Button onClick={() => setLocation("/auth?redirect=/checkout")} className="w-full sm:w-auto px-8 h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                                        Login / Register
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        {/* Shipping Form */}
                        <div className="space-y-8">
                            <h1 className="text-5xl font-black tracking-tighter uppercase mb-2">Checkout</h1>
                            <p className="text-muted-foreground font-medium mb-8">Please provide your details to complete your order.</p>

                            <Card className="border-secondary bg-white rounded-[2.5rem] shadow-xl shadow-secondary/20 hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 overflow-hidden">
                                <CardContent className="p-8 md:p-10">
                                    <Form {...form}>
                                        <form id="checkout-form" onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-10">
                                            <div className="space-y-6">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-black text-xs">1</div>
                                                    <h2 className="text-xl font-black tracking-tighter uppercase">Shipping Details</h2>
                                                </div>
                                                <FormField
                                                    control={form.control}
                                                    name="customerFullName"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest ml-1">Full Name</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Amani Soma" autoComplete="name" className="h-14 rounded-2xl border-secondary bg-secondary/5 focus:bg-white transition-all px-6" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="customerEmail"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest ml-1">Email Address</FormLabel>
                                                                <FormControl>
                                                                    <Input type="email" placeholder="amani@example.com" autoComplete="email" className="h-14 rounded-2xl border-secondary bg-secondary/5 focus:bg-white transition-all px-6" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="phoneNumber"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest ml-1">Phone Number</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="+254 700 000000" autoComplete="tel" className="h-14 rounded-2xl border-secondary bg-secondary/5 focus:bg-white transition-all px-6" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <FormField
                                                    control={form.control}
                                                    name="shippingAddress"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest ml-1">Address</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="123 Kenyatta Ave" autoComplete="street-address" className="h-14 rounded-2xl border-secondary bg-secondary/5 focus:bg-white transition-all px-6" {...field} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <FormField
                                                        control={form.control}
                                                        name="shippingCity"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest ml-1">City</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="Nairobi" autoComplete="address-level2" className="h-14 rounded-2xl border-secondary bg-secondary/5 focus:bg-white transition-all px-6" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                    <FormField
                                                        control={form.control}
                                                        name="shippingZipCode"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-[10px] font-black uppercase tracking-widest ml-1">Zip Code</FormLabel>
                                                                <FormControl>
                                                                    <Input placeholder="00100" autoComplete="postal-code" className="h-14 rounded-2xl border-secondary bg-secondary/5 focus:bg-white transition-all px-6" {...field} />
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                </div>
                                                <FormField
                                                    control={form.control}
                                                    name="orderNotes"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel className="text-[10px] font-black uppercase tracking-widest ml-1">Order Notes (Optional)</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Special instructions for delivery..." autoComplete="off" className="h-14 rounded-2xl border-secondary bg-secondary/5 focus:bg-white transition-all px-6" {...field} value={field.value ?? ""} />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="space-y-6 pt-4 border-t border-secondary/50">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-black text-xs">2</div>
                                                    <h2 className="text-xl font-black tracking-tighter uppercase">Shipping Method</h2>
                                                </div>
                                                <FormField
                                                    control={form.control}
                                                    name="shippingMethod"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-3">
                                                            <FormControl>
                                                                <RadioGroup
                                                                    onValueChange={field.onChange}
                                                                    value={field.value}
                                                                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                                                                >
                                                                    {SHIPPING_METHODS.map((method) => (
                                                                        <FormItem key={method.id} className="flex items-center space-x-3 space-y-0 rounded-2xl border p-5 cursor-pointer hover:bg-secondary/5 transition-all [&:has(:checked)]:bg-accent/5 [&:has(:checked)]:border-accent group">
                                                                            <FormControl>
                                                                                <RadioGroupItem value={method.id} className="border-accent" />
                                                                            </FormControl>
                                                                            <div className="flex-1">
                                                                                <div className="flex justify-between items-center">
                                                                                    <FormLabel className="font-black text-[10px] uppercase tracking-widest cursor-pointer group-hover:text-accent transition-colors">
                                                                                        {method.name}
                                                                                    </FormLabel>
                                                                                </div>
                                                                                <div className="flex justify-between items-center mt-1">
                                                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">{method.description}</span>
                                                                                    <span className="text-xs font-black text-accent">
                                                                                        {isFreeShippingEligible && method.id !== "pickup" ? "FREE" : formatPrice(method.cost)}
                                                                                    </span>
                                                                                </div>
                                                                            </div>
                                                                        </FormItem>
                                                                    ))}
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>

                                            <div className="space-y-6 pt-4 border-t border-secondary/50">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white font-black text-xs">3</div>
                                                    <h2 className="text-xl font-black tracking-tighter uppercase">Payment Method</h2>
                                                </div>
                                                <FormField
                                                    control={form.control}
                                                    name="paymentMethod"
                                                    render={({ field }) => (
                                                        <FormItem className="space-y-3">
                                                            <FormControl>
                                                                <RadioGroup
                                                                    onValueChange={field.onChange}
                                                                    value={field.value}
                                                                    className="flex flex-col gap-3"
                                                                >
                                                                    <FormItem className="flex items-center space-x-4 space-y-0 rounded-2xl border p-5 cursor-pointer hover:bg-secondary/5 transition-all [&:has(:checked)]:bg-accent/5 [&:has(:checked)]:border-accent group">
                                                                        <FormControl>
                                                                            <RadioGroupItem value="mpesa" className="border-accent" />
                                                                        </FormControl>
                                                                        <div className="flex-1 flex justify-between items-center">
                                                                            <div>
                                                                                <FormLabel className="font-black text-[10px] uppercase tracking-widest cursor-pointer group-hover:text-accent transition-colors">
                                                                                    M-PESA (Default)
                                                                                </FormLabel>
                                                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Instant mobile payment</p>
                                                                            </div>
                                                                            <Smartphone className="w-6 h-6 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:text-accent transition-all" />
                                                                        </div>
                                                                    </FormItem>
                                                                    <FormItem className="flex items-center space-x-4 space-y-0 rounded-2xl border p-5 cursor-pointer hover:bg-secondary/5 transition-all [&:has(:checked)]:bg-accent/5 [&:has(:checked)]:border-accent group">
                                                                        <FormControl>
                                                                            <RadioGroupItem value="card" className="border-accent" />
                                                                        </FormControl>
                                                                        <div className="flex-1 flex justify-between items-center">
                                                                            <div>
                                                                                <FormLabel className="font-black text-[10px] uppercase tracking-widest cursor-pointer group-hover:text-accent transition-colors">
                                                                                    Credit / Debit Card
                                                                                </FormLabel>
                                                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Secure via Stripe</p>
                                                                            </div>
                                                                            <CreditCard className="w-6 h-6 text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:text-accent transition-all" />
                                                                        </div>
                                                                    </FormItem>
                                                                    <FormItem className="flex items-center space-x-4 space-y-0 rounded-2xl border p-5 cursor-pointer hover:bg-secondary/5 transition-all [&:has(:checked)]:bg-accent/5 [&:has(:checked)]:border-accent group">
                                                                        <FormControl>
                                                                            <RadioGroupItem value="paypal" className="border-accent" />
                                                                        </FormControl>
                                                                        <div className="flex-1 flex justify-between items-center">
                                                                            <div>
                                                                                <FormLabel className="font-black text-[10px] uppercase tracking-widest cursor-pointer group-hover:text-accent transition-colors">
                                                                                    PayPal Wallet
                                                                                </FormLabel>
                                                                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Express checkout</p>
                                                                            </div>
                                                                            <span className="text-xl font-black text-muted-foreground opacity-30 group-hover:opacity-100 group-hover:text-accent transition-all italic tracking-tighter">P</span>
                                                                        </div>
                                                                    </FormItem>
                                                                </RadioGroup>
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </div>
                                        </form>
                                    </Form>
                                </CardContent>
                            </Card>

                            {stripeClientSecret && createdOrder && (
                                <Card className="mt-8 border-primary shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                                    <div className="bg-primary p-4 text-primary-foreground">
                                        <h3 className="font-bold flex items-center gap-2">
                                            <CreditCard className="w-5 h-5" />
                                            Complete Secure Payment
                                        </h3>
                                    </div>
                                    <CardContent className="pt-6">
                                        <Elements
                                            stripe={stripePromise}
                                            options={{
                                                clientSecret: stripeClientSecret,
                                                appearance: { theme: 'stripe' }
                                            }}
                                        >
                                            <StripeCheckout
                                                amount={createdOrder.total}
                                                orderId={createdOrder.id}
                                                onSuccess={handlePaymentSuccess}
                                            />
                                        </Elements>
                                    </CardContent>
                                </Card>
                            )}

                            {showMpesaUi && createdOrder && (
                                <Card className="mt-8 border-[#81b71a] shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                                    <div className="bg-[#81b71a] p-4 text-white">
                                        <h3 className="font-bold flex items-center gap-2">
                                            <Smartphone className="w-5 h-5" />
                                            M-PESA Payment
                                        </h3>
                                    </div>
                                    <CardContent className="pt-6 font-semibold">
                                        <MpesaCheckout
                                            orderId={createdOrder.id}
                                            phoneNumber={createdOrder.phoneNumber}
                                            onSuccess={handlePaymentSuccess}
                                        />
                                    </CardContent>
                                </Card>
                            )}

                            {showPaypalUi && createdOrder && (
                                <Card className="mt-8 border-[#0070ba] shadow-lg overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                                    <div className="bg-[#0070ba] p-4 text-white">
                                        <h3 className="font-bold flex items-center gap-2">
                                            <span className="text-xl font-bold italic mr-1">P</span>
                                            PayPal Payment
                                        </h3>
                                    </div>
                                    <CardContent className="pt-6">
                                        <PayPalCheckout
                                            amount={createdOrder.total}
                                            orderId={createdOrder.id}
                                            onSuccess={handlePaymentSuccess}
                                        />
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Order Summary */}
                        <aside className="lg:sticky lg:top-32 h-fit">
                            <Card className="border-secondary bg-white rounded-[2.5rem] shadow-xl shadow-secondary/20 hover:shadow-2xl hover:shadow-accent/5 transition-all duration-500 group">
                                <CardHeader className="p-8 md:p-10 pb-4">
                                    <CardTitle className="tracking-tighter uppercase font-black text-2xl group-hover:text-accent transition-colors">Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="p-8 md:p-10 pt-0 space-y-8">
                                    <div className="max-h-[30vh] overflow-y-auto space-y-4 pr-3 custom-scrollbar">
                                        {cart?.items?.map((item) => (
                                            <div key={item.id} className="flex gap-4 group/item">
                                                <div className="w-16 h-20 bg-secondary rounded-xl overflow-hidden flex-shrink-0 border border-secondary transition-all group-hover/item:border-accent">
                                                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover transition-transform group-hover/item:scale-110" />
                                                </div>
                                                <div className="flex-grow flex flex-col justify-center">
                                                    <h4 className="text-xs font-black uppercase tracking-tight line-clamp-1 group-hover/item:text-accent transition-colors">{item.product.name}</h4>
                                                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Qty: {item.quantity}</p>
                                                    <p className="text-sm font-black mt-1 text-accent">{formatPrice(item.product.price * item.quantity)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4 pt-6 mt-6 border-t border-secondary/50">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Gift Card Code"
                                                value={giftCardCode}
                                                onChange={(e) => setGiftCardCode(e.target.value)}
                                                className="h-14 rounded-2xl border-secondary bg-secondary/5 focus:bg-white transition-all px-6"
                                            />
                                            <Button
                                                type="button"
                                                onClick={verifyGiftCard}
                                                className="h-14 rounded-2xl px-6 font-black uppercase tracking-widest text-[10px] bg-secondary hover:bg-accent hover:text-white transition-all"
                                            >Apply</Button>
                                        </div>

                                        {user && loyalty && loyalty.points > 0 && (
                                            <Button
                                                type="button"
                                                variant={useLoyaltyPoints ? "default" : "outline"}
                                                onClick={() => setUseLoyaltyPoints(!useLoyaltyPoints)}
                                                className="w-full h-14 rounded-2xl flex items-center justify-between px-6 border-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                            >
                                                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em]">
                                                    <Sparkles className={`w-4 h-4 ${useLoyaltyPoints ? "text-white" : "text-accent animate-pulse"}`} />
                                                    {useLoyaltyPoints ? "Points Applied" : `Use ${loyalty.points} Points`}
                                                </div>
                                                <span className="font-black">-{formatPrice(loyalty.points * 100)}</span>
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-4 pt-4 border-t border-secondary/50">
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            <span>Subtotal</span>
                                            <span className="text-foreground">{formatPrice(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            <span>VAT (16%)</span>
                                            <span className="text-foreground">{formatPrice(taxAmount)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                            <span>Shipping Fee</span>
                                            <span className={shippingCost === 0 ? "text-emerald-500" : "text-foreground"}>
                                                {shippingCost === 0 ? "COMPLIMENTARY" : formatPrice(shippingCost)}
                                            </span>
                                        </div>
                                        {appliedGiftCard && (
                                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-emerald-500">
                                                <span>Gift Card ({appliedGiftCard.code})</span>
                                                <span>-{formatPrice(giftCardAmount)}</span>
                                            </div>
                                        )}
                                        {useLoyaltyPoints && pointsRedeemed > 0 && (
                                            <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-accent">
                                                <span>Loyalty Rewards</span>
                                                <span>-{formatPrice(pointsRedeemed)}</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between items-end pt-4 mt-4 border-t border-accent/20">
                                            <span className="text-lg font-black tracking-tighter uppercase">Total</span>
                                            <span className="text-4xl font-black tracking-tighter text-accent leading-none">{formatPrice(total)}</span>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        form="checkout-form"
                                        className="w-full h-16 text-xs md:text-sm font-black uppercase tracking-[0.25em] rounded-[1.25rem] shadow-xl shadow-primary/20 hover:shadow-accent/40 hover:translate-y-[-4px] transition-all duration-300 bg-primary text-primary-foreground hover:bg-accent hover:text-white"
                                        disabled={orderMutation.isPending || !cart?.items?.length}
                                    >
                                        {orderMutation.isPending && (
                                            <Loader2 className="w-4 h-4 animate-spin mr-3" />
                                        )}
                                        Complete Purchase
                                    </Button>

                                    <div className="flex flex-col items-center gap-4 opacity-50">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                            <span className="text-[8px] font-black uppercase tracking-widest">Secure TLS Encryption</span>
                                        </div>
                                        <p className="text-[10px] text-center text-muted-foreground leading-relaxed px-4">
                                            By completing this purchase, you agree to our Terms of Service.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </aside>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
