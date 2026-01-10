


export interface PaymentProvider {
    /**
     * Initialize a payment. Returns client-side config/token if needed.
     * @param amount Amount in cents (or smallest currency unit)
     * @param currency e.g. "KES", "USD"
     * @param metadata arbitrary data
     */
    initiatePayment(amount: number, currency: string, metadata?: Record<string, unknown>): Promise<Record<string, unknown>>;

    /**
     * Verify/complete a payment.
     * @param transactionId 
     */
    confirmPayment(transactionId: string): Promise<boolean>;
}
