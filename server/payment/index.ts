
import { MpesaProvider } from "./mpesa";
import { StripeProvider } from "./stripe";
import { PaypalProvider } from "./paypal";
import { PaymentProvider } from "./types";

const mpesa = new MpesaProvider();
const stripe = new StripeProvider();
const paypal = new PaypalProvider();

export function getPaymentProvider(name: string): PaymentProvider {
    switch (name.toLowerCase()) {
        case 'mpesa': return mpesa;
        case 'card': return stripe;
        case 'paypal': return paypal;
        default: throw new Error(`Unknown payment provider: ${name}`);
    }
}
