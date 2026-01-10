import { Layout } from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCcw, CheckCircle2, Clock, AlertCircle } from "lucide-react";

export default function Returns() {
    return (
        <Layout>
            <div className="container mx-auto px-4 py-16">
                <header className="max-w-3xl mx-auto text-center mb-16 space-y-4">
                    <h1 className="text-5xl font-black tracking-tighter uppercase italic">Returns & Exchanges</h1>
                    <p className="text-xl text-muted-foreground font-medium">Lumina&apos;s Commitment to Your Satisfaction</p>
                </header>

                <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    <Card className="border-none shadow-xl bg-primary/5 rounded-[2rem] overflow-hidden">
                        <CardContent className="p-10 space-y-6">
                            <div className="h-16 w-16 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center">
                                <Clock className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">30-Day Window</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Items must be returned within 30 days of the delivery date. After this window, we can only offer store credit up to 45 days.
                            </p>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-xl bg-accent/5 rounded-[2rem] overflow-hidden">
                        <CardContent className="p-10 space-y-6">
                            <div className="h-16 w-16 bg-accent text-white rounded-2xl flex items-center justify-center">
                                <RefreshCcw className="w-8 h-8" />
                            </div>
                            <h3 className="text-2xl font-black uppercase tracking-tight">Easy Exchanges</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Need a different size? Exchanges are always free. We&apos;ll send out your new item as soon as the original is in the mail.
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="max-w-4xl mx-auto space-y-12 mb-24">
                    <section className="space-y-6">
                        <h2 className="text-3xl font-black tracking-tighter uppercase italic">The Process</h2>
                        <div className="space-y-4">
                            {[
                                { step: "01", title: "Submit Request", desc: "Log into your account and select 'Request Return' on your order history." },
                                { step: "02", title: "Print Label", desc: "We'll email you a prepaid shipping label within 24 hours of approval." },
                                { step: "03", title: "Pack & Ship", desc: "Drop off your package at any authorized Lumina drop point or courier office." },
                                { step: "04", title: "Refund Issued", desc: "Once inspected, your refund will be processed within 3-5 business days." }
                            ].map((item, idx) => (
                                <div key={idx} className="flex gap-6 items-start p-8 rounded-3xl bg-secondary/10 hover:bg-secondary/20 transition-all group">
                                    <span className="text-4xl font-black text-primary/20 group-hover:text-primary transition-colors italic">{item.step}</span>
                                    <div>
                                        <h4 className="font-black text-lg uppercase tracking-tight">{item.title}</h4>
                                        <p className="text-muted-foreground">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="bg-destructive/5 border-2 border-dashed border-destructive/20 p-10 rounded-[2rem] space-y-4">
                        <div className="flex items-center gap-3 text-destructive">
                            <AlertCircle className="w-6 h-6" />
                            <h3 className="text-xl font-black uppercase tracking-tight">Return Conditions</h3>
                        </div>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                "Original tags must be attached",
                                "Items must be unwashed and unworn",
                                "Shoes must be in original box",
                                "Beauty products must be sealed",
                                "Final sale items are non-returnable",
                                "Gift cards cannot be returned"
                            ].map((condition, idx) => (
                                <li key={idx} className="flex items-center gap-2 text-sm font-bold">
                                    <CheckCircle2 className="w-4 h-4 text-destructive/40" />
                                    {condition}
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
            </div>
        </Layout>
    );
}
