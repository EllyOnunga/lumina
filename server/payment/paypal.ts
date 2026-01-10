
import { PaymentProvider } from "./types";

// PayPal implementation - usually client-side heavy with server order creation
export class PaypalProvider implements PaymentProvider {
    async initiatePayment(amount: number, currency: string, _metadata?: Record<string, unknown>): Promise<Record<string, unknown>> {
        // In PayPal, we typically create an Order ID on the server
        // For now, we'll return a mock Order ID
        // If we had the SDK installed, we'd use it here.
        console.log(`[PayPal] Creating order for ${currency} ${amount}`);

        return {
            orderId: "PAYPAL_ORDER_" + Date.now()
        };
    }

    async confirmPayment(transactionId: string): Promise<boolean> {
        console.log(`[PayPal] Capturing order ${transactionId}`);
        return true;
    }
}
