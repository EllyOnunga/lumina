
import { PaymentProvider } from "./types";
import Stripe from 'stripe';

// Mock Stripe implementation if no key provided
export class StripeProvider implements PaymentProvider {
    private stripe: Stripe | null = null;

    constructor() {
        if (process.env.STRIPE_SECRET_KEY) {
            this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
                apiVersion: '2025-12-15.clover',
            });
        }
    }

    async initiatePayment(amount: number, currency: string, metadata?: Record<string, unknown>): Promise<Record<string, unknown>> {
        if (!this.stripe) {
            console.log("[Stripe] No API key found, returning mock intent");
            return {
                clientSecret: "pi_mock_secret_" + Date.now(),
                id: "pi_mock_" + Date.now()
            };
        }

        try {
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount,
                currency: currency.toLowerCase(),
                automatic_payment_methods: { enabled: true },
                metadata: metadata as Stripe.MetadataParam
            });
            return {
                clientSecret: paymentIntent.client_secret,
                id: paymentIntent.id
            };
        } catch (error) {
            console.error("[Stripe] Error creating payment intent:", error);
            throw error;
        }
    }

    async confirmPayment(transactionId: string): Promise<boolean> {
        // Webhook should handle this in production
        // This is for manual verification if needed
        if (!this.stripe) return true;

        try {
            const intent = await this.stripe.paymentIntents.retrieve(transactionId);
            return intent.status === 'succeeded';
        } catch (error) {
            console.error("[Stripe] Error confirming payment:", error);
            return false;
        }
    }
}
