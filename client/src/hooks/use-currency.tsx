import { createContext, useContext, useState, useMemo, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Currency } from "@shared/schema";

interface CurrencyContextType {
    currencies: Currency[];
    currentCurrency: Currency | null;
    setCurrency: (code: string) => void;
    formatPrice: (amountInCents: number) => string;
    convertPrice: (amountInCents: number) => number;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const { data: currencies = [] } = useQuery<Currency[]>({
        queryKey: ["/api/currencies"],
    });

    const [selectedCurrencyCode, setSelectedCurrencyCode] = useState<string | null>(() => localStorage.getItem("currency"));

    const currentCurrency = useMemo(() => {
        if (currencies.length === 0) return null;
        return (selectedCurrencyCode && currencies.find(c => c.code === selectedCurrencyCode))
            || currencies.find(c => c.isBase)
            || currencies[0];
    }, [currencies, selectedCurrencyCode]);

    const setCurrency = (code: string) => {
        setSelectedCurrencyCode(code);
        localStorage.setItem("currency", code);
    };

    const convertPrice = (amountInCents: number) => {
        if (!currentCurrency) return amountInCents / 100;
        // Exchange rate is relative to KES (base)
        // If rate is 1, it's KES. If USD is rate 0.0077, 100 KES = 0.77 USD
        return (amountInCents / 100) * Number(currentCurrency.exchangeRate);
    };

    const formatPrice = (amountInCents: number) => {
        if (!currentCurrency) return `${amountInCents / 100} KSH`;
        const converted = convertPrice(amountInCents);

        return new Intl.NumberFormat(undefined, {
            style: "currency",
            currency: currentCurrency.code,
            minimumFractionDigits: 2,
        }).format(converted);
    };

    return (
        <CurrencyContext.Provider value={{ currencies, currentCurrency, setCurrency, formatPrice, convertPrice }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (!context) throw new Error("useCurrency must be used within a CurrencyProvider");
    return context;
}
