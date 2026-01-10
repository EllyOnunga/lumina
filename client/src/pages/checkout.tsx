import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { CreateOrder, User, Order } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useCallback } from "react";
import { Loader2, ArrowLeft, CheckCircle2, User as UserIcon, CreditCard, Smartphone } from "lucide-react";
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

// Initialize Stripe (use env var in production)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_mock");

const VAT_RATE = 0.16; // KRA 16% VAT
const FREE_SHIPPING_THRESHOLD = 1000000; // 10,000 KES in cents

const SHIPPING_METHODS = [
    { id: "standard", name: "Standard (G4S/Wells Fargo)", cost: 25000, description: "3-5 business days" },
    { id: "express", name: "Express (Door-to-Door)", cost: 50000, description: "1-2 business days" },
    { id: "pickup", name: "In-Store Pickup", cost: 0, description: "Nairobi Central / Mombasa Mall" },
];

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

    const { data: user } = useQuery<User>({
        queryKey: ["/api/user"],
        retry: false,
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
    const total = subtotal + taxAmount + shippingCost;

    const onFormSubmit = (data: CheckoutFormData) => {
        if (!cart?.items?.length) return;

        orderMutation.mutate({
            ...data,
            subtotal,
            taxAmount,
            shippingCost,
            total,
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
                        <Card className="mb-8 border-primary/20 bg-primary/5">
                            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <UserIcon className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg">Have an account?</h3>
                                        <p className="text-muted-foreground text-sm">Login to access your saved address and order history.</p>
                                    </div>
                                </div>
                                <Button onClick={() => setLocation("/auth?redirect=/checkout")} className="w-full sm:w-auto">
                                    Login / Register
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {/* Shipping Form */}
                        <div className="space-y-8">
                            <h1 className="text-4xl font-bold tracking-tighter">Checkout</h1>

                            <Form {...form}>
                                <form id="checkout-form" onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-6">
                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold tracking-tighter">Shipping Details</h2>
                                        <FormField
                                            control={form.control}
                                            name="customerFullName"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Full Name</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Amani Soma" autoComplete="name" {...field} />
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
                                                        <FormLabel>Email Address</FormLabel>
                                                        <FormControl>
                                                            <Input type="email" placeholder="amani@example.com" autoComplete="email" {...field} />
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
                                                        <FormLabel>Phone Number</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="+254 700 000000" autoComplete="tel" {...field} />
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
                                                    <FormLabel>Address</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="123 Kenyatta Ave" autoComplete="street-address" {...field} />
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
                                                        <FormLabel>City</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="Nairobi" autoComplete="address-level2" {...field} />
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
                                                        <FormLabel>Zip Code</FormLabel>
                                                        <FormControl>
                                                            <Input placeholder="00100" autoComplete="postal-code" {...field} />
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
                                                    <FormLabel>Order Notes (Optional)</FormLabel>
                                                    <FormControl>
                                                        <Input placeholder="Special instructions for delivery..." autoComplete="off" {...field} value={field.value ?? ""} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold tracking-tighter">Shipping Method</h2>
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
                                                                <FormItem key={method.id} className="flex items-center space-x-3 space-y-0 rounded-xl border p-4 cursor-pointer hover:bg-muted transition-colors [&:has(:checked)]:bg-muted [&:has(:checked)]:border-primary">
                                                                    <FormControl>
                                                                        <RadioGroupItem value={method.id} />
                                                                    </FormControl>
                                                                    <div className="flex-1">
                                                                        <div className="flex justify-between items-center">
                                                                            <FormLabel className="font-bold cursor-pointer">
                                                                                {method.name}
                                                                            </FormLabel>
                                                                            <span className="text-sm font-bold">
                                                                                {isFreeShippingEligible && method.id !== "pickup" ? "FREE" : formatCurrency(method.cost)}
                                                                            </span>
                                                                        </div>
                                                                        <p className="text-xs text-muted-foreground mt-1">{method.description}</p>
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

                                    <div className="space-y-4">
                                        <h2 className="text-xl font-bold tracking-tighter">Payment Method</h2>
                                        <FormField
                                            control={form.control}
                                            name="paymentMethod"
                                            render={({ field }) => (
                                                <FormItem className="space-y-3">
                                                    <FormControl>
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                            className="flex flex-col space-y-1"
                                                        >
                                                            <FormItem className="flex items-center space-x-3 space-y-0 rounded-xl border p-4 cursor-pointer hover:bg-muted transition-colors [&:has(:checked)]:bg-muted [&:has(:checked)]:border-primary">
                                                                <FormControl>
                                                                    <RadioGroupItem value="mpesa" />
                                                                </FormControl>
                                                                <div className="flex-1">
                                                                    <div className="flex justify-between items-center">
                                                                        <FormLabel className="font-bold cursor-pointer">
                                                                            M-PESA
                                                                        </FormLabel>
                                                                        <Smartphone className="w-5 h-5 text-muted-foreground" />
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground mt-1">Pay on Delivery Available</p>
                                                                </div>
                                                            </FormItem>
                                                            <FormItem className="flex items-center space-x-3 space-y-0 rounded-xl border p-4 cursor-pointer hover:bg-muted transition-colors [&:has(:checked)]:bg-muted [&:has(:checked)]:border-primary">
                                                                <FormControl>
                                                                    <RadioGroupItem value="card" />
                                                                </FormControl>
                                                                <div className="flex-1 flex justify-between items-center">
                                                                    <FormLabel className="font-bold cursor-pointer">
                                                                        Credit / Debit Card
                                                                    </FormLabel>
                                                                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                                                                </div>
                                                            </FormItem>
                                                            <FormItem className="flex items-center space-x-3 space-y-0 rounded-xl border p-4 cursor-pointer hover:bg-muted transition-colors [&:has(:checked)]:bg-muted [&:has(:checked)]:border-primary">
                                                                <FormControl>
                                                                    <RadioGroupItem value="paypal" />
                                                                </FormControl>
                                                                <div className="flex-1 flex justify-between items-center">
                                                                    <FormLabel className="font-bold cursor-pointer">
                                                                        PayPal
                                                                    </FormLabel>
                                                                    {/* Simple wallet icon or just text if icon not imported */}
                                                                    <span className="text-xl font-bold text-muted-foreground italic">P</span>
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
                            <Card className="border-none shadow-sm bg-secondary/10 rounded-3xl p-6">
                                <CardHeader className="px-0 pt-0">
                                    <CardTitle className="tracking-tighter">Order Summary</CardTitle>
                                </CardHeader>
                                <CardContent className="px-0 space-y-6">
                                    <div className="max-h-[30vh] overflow-y-auto space-y-4 pr-2">
                                        {cart?.items?.map((item) => (
                                            <div key={item.id} className="flex gap-4">
                                                <div className="w-16 h-20 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                                                    <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-grow flex flex-col justify-center">
                                                    <h4 className="text-sm font-medium line-clamp-1">{item.product.name}</h4>
                                                    <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                                    <p className="text-sm font-bold mt-1">{formatCurrency(item.product.price * item.quantity)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t pt-6 space-y-3 pb-4 border-primary/10">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Subtotal</span>
                                            <span>{formatCurrency(subtotal)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">VAT (16%)</span>
                                            <span>{formatCurrency(taxAmount)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Shipping</span>
                                            <span className={shippingCost === 0 ? "text-green-600 font-bold" : ""}>
                                                {shippingCost === 0 ? "FREE" : formatCurrency(shippingCost)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-xl font-bold pt-3 border-t border-primary/5">
                                            <span>Total</span>
                                            <span>{formatCurrency(total)}</span>
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        form="checkout-form"
                                        className="w-full h-14 text-lg font-bold rounded-2xl"
                                        disabled={orderMutation.isPending || !cart?.items?.length}
                                    >
                                        {orderMutation.isPending ? (
                                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        ) : null}
                                        Confirm Order
                                    </Button>

                                    <p className="text-[10px] text-center text-muted-foreground px-8 leading-relaxed">
                                        By confirming your order, you agree to our Terms of Service and Privacy Policy.
                                    </p>
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
