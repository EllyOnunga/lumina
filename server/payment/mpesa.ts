
import { PaymentProvider } from "./types";

// Mock M-Pesa implementation 
// In a real app, this would integrate with Daraja API
export class MpesaProvider implements PaymentProvider {
    async initiatePayment(amount: number, currency: string, metadata?: Record<string, unknown>): Promise<Record<string, unknown>> {
        console.log(`[M-PESA] Initiating STK Push for ${currency} ${amount}`);
        if (metadata?.phoneNumber) {
            console.log(`[M-PESA] Sending prompt to ${metadata.phoneNumber}`);
        }

        // Simulate Daraja response
        return {
            CheckoutRequestID: "ws_CO_" + Date.now() + Math.random().toString(36).substring(7),
            ResponseCode: "0",
            ResponseDescription: "Success. Request accepted for processing",
            CustomerMessage: "Success. Request accepted for processing"
        };
    }

    async confirmPayment(transactionId: string): Promise<boolean> {
        console.log(`[M-PESA] Verifying transaction ${transactionId}`);
        // Always return true for demo
        return true;
    }
}
