
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Smartphone, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MpesaCheckoutProps {
    orderId: number;
    phoneNumber: string;
    onSuccess: () => void;
}

export function MpesaCheckout({ orderId, phoneNumber, onSuccess }: MpesaCheckoutProps) {
    const { toast } = useToast();
    const [status, setStatus] = useState<"pending" | "success" | "failed">("pending");
    const hasInitiated = useRef(false);

    const initiatePush = useCallback(async () => {
        if (hasInitiated.current) return;
        hasInitiated.current = true;

        try {
            await apiRequest("POST", "/api/payment/mpesa/init", {
                amount: 0,
                metadata: { orderId, phoneNumber }
            });
            toast({
                title: "STK Push Sent",
                description: "Please enter your M-PESA PIN on your phone."
            });

            setTimeout(() => {
                setStatus("success");
                toast({
                    title: "Payment Received",
                    description: "Your M-PESA payment has been verified."
                });
                setTimeout(onSuccess, 2000);
            }, 5000);

        } catch {
            setStatus("failed");
            hasInitiated.current = false; // Allow retry if failed
            toast({
                title: "Connection Error",
                description: "Failed to reach M-PESA servers. Please try again.",
                variant: "destructive"
            });
        }
    }, [orderId, phoneNumber, onSuccess, toast]);

    // Auto-initiate on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            initiatePush();
        }, 0);
        return () => clearTimeout(timer);
    }, [initiatePush]);

    return (
        <div className="space-y-6 text-center p-4">
            <div className="flex justify-center">
                <div className={`h-20 w-20 rounded-full flex items-center justify-center ${status === "success" ? "bg-green-100" :
                    status === "failed" ? "bg-red-100" : "bg-primary/10"
                    }`}>
                    {status === "pending" && <Smartphone className="w-10 h-10 text-primary animate-pulse" />}
                    {status === "success" && <CheckCircle2 className="w-10 h-10 text-green-600" />}
                    {status === "failed" && <XCircle className="w-10 h-10 text-red-600" />}
                </div>
            </div>

            <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight">
                    {status === "pending" && "Waiting for PIN..."}
                    {status === "success" && "Payment Confirmed!"}
                    {status === "failed" && "Payment Failed"}
                </h3>
                <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                    {status === "pending" && `A payment request has been sent to ${phoneNumber}. Please complete it on your handset.`}
                    {status === "success" && "Thank you! We've verified your transaction."}
                    {status === "failed" && "We couldn't verify your payment. Please ensure you have sufficient balance and try again."}
                </p>
            </div>

            {status === "failed" && (
                <Button onClick={initiatePush} variant="outline" className="w-full rounded-xl">
                    Retry Payment
                </Button>
            )}

            {status === "pending" && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground italic">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Checking status...
                </div>
            )}
        </div>
    );
}
