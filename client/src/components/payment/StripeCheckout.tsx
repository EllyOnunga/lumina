
import { useState, useEffect } from "react";
import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StripeCheckoutProps {
    amount: number;
    orderId: number;
    onSuccess: () => void;
}

export function StripeCheckout({ amount, orderId, onSuccess }: StripeCheckoutProps) {
    const stripe = useStripe();
    const elements = useElements();
    const { toast } = useToast();
    const [message, setMessage] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!stripe) {
            return;
        }

        const clientSecret = new URLSearchParams(window.location.search).get(
            "payment_intent_client_secret"
        );

        if (!clientSecret) {
            return;
        }

        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
            switch (paymentIntent?.status) {
                case "succeeded":
                    setMessage("Payment succeeded!");
                    onSuccess();
                    break;
                case "processing":
                    setMessage("Your payment is processing.");
                    break;
                case "requires_payment_method":
                    setMessage("Your payment was not successful, please try again.");
                    break;
                default:
                    setMessage("Something went wrong.");
                    break;
            }
        });
    }, [stripe, onSuccess]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) {
            return;
        }

        setIsLoading(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Return URL for production
                return_url: `${window.location.origin}/checkout?success=true&orderId=${orderId}`,
            },
            // For simple implementation without refresh if possible
            redirect: "if_required"
        });

        if (error) {
            if (error.type === "card_error" || error.type === "validation_error") {
                setMessage(error.message || "An error occurred");
                toast({
                    title: "Payment Error",
                    description: error.message,
                    variant: "destructive"
                });
            } else {
                setMessage("An unexpected error occurred.");
            }
        } else {
            // Success without redirect
            onSuccess();
        }

        setIsLoading(false);
    };

    return (
        <form id="payment-form" onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement id="payment-element" options={{ layout: "tabs" }} />
            <Button
                disabled={isLoading || !stripe || !elements}
                id="submit"
                className="w-full h-12 text-lg font-bold rounded-xl"
            >
                <span id="button-text">
                    {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                        `Pay now ($${(amount / 100).toFixed(2)})`
                    )}
                </span>
            </Button>
            {message && <div id="payment-message" className="text-sm text-center text-destructive font-medium mt-4">{message}</div>}
        </form>
    );
}
