import { Router, type Request } from "express";
import { getPaymentProvider } from "../payment";
import { storage } from "../storage";
import Stripe from "stripe";



export const paymentRouter = Router();

// Init payment
paymentRouter.post("/:provider/init", async (req, res) => {
    const { provider } = req.params;
    const { amount, currency, metadata } = req.body;

    try {
        const paymentProvider = getPaymentProvider(provider);
        const result = await paymentProvider.initiatePayment(amount, currency || "KES", metadata);
        res.json(result);
    } catch (error) {
        console.error(`Payment init failed for ${provider}:`, error);
        const message = error instanceof Error ? error.message : "Unknown payment error";
        res.status(400).json({ error: message });
    }
});

paymentRouter.post("/:provider/confirm", async (req, res) => {
    const { provider } = req.params;
    const { transactionId, orderId } = req.body;

    try {
        const paymentProvider = getPaymentProvider(provider);
        const success = await paymentProvider.confirmPayment(transactionId);

        if (success && orderId) {
            await storage.updateOrderPaymentStatus(orderId, "paid", transactionId);
            await storage.updateOrderStatus(orderId, "processing");
        }

        res.json({ success });
    } catch (error) {
        console.error(`Payment confirm failed for ${provider}:`, error);
        res.status(400).json({ error: (error as Error).message });
    }
});

// Webhook
paymentRouter.post("/:provider/webhook", async (req, res) => {
    const { provider } = req.params;

    console.log(`[${provider}] Webhook received`);

    try {
        if (provider === "card" && process.env.STRIPE_WEBHOOK_SECRET) {
            const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
                apiVersion: '2025-12-15.clover',
            });
            const sig = req.headers['stripe-signature'] as string;
            const event = stripe.webhooks.constructEvent(
                (req as Request & { rawBody: Buffer }).rawBody,
                sig,
                process.env.STRIPE_WEBHOOK_SECRET
            );

            if (event.type === 'payment_intent.succeeded') {
                const intent = event.data.object as Stripe.PaymentIntent;
                const orderId = intent.metadata.orderId;
                if (orderId) {
                    await storage.updateOrderPaymentStatus(parseInt(orderId), "paid", intent.id);
                    await storage.updateOrderStatus(parseInt(orderId), "processing");
                }
            }
        } else if (provider === "mpesa") {
            // Basic M-PESA C2B/STK Callback logic
            const { Body } = req.body;
            if (Body?.stkCallback) {
                const { MerchantRequestID: _mId, CheckoutRequestID: _cId, ResultCode, ResultDesc } = Body.stkCallback;
                console.log(`M-PESA Callback for ${_mId}/${_cId}: ${ResultDesc} (${ResultCode})`);
            }
        }

        res.json({ received: true });
    } catch (error) {
        console.error(`Webhook error for ${provider}:`, error);
        res.status(400).send(`Webhook Error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
});
