import { Link } from "wouter";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export function Footer() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            await apiRequest("POST", "/api/newsletter/subscribe", { email });
            toast({
                title: "Welcome to Lumina!",
                description: "You have successfully subscribed to our newsletter.",
            });
            setEmail("");
        } catch {
            toast({
                title: "Subscription failed",
                description: "Please check your email and try again.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="bg-primary text-primary-foreground py-16 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div>
                        <h3 className="text-2xl font-bold tracking-tighter mb-6">LUMINA</h3>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Defining modern fashion in Kenya. Curated collections for the contemporary individual.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-black uppercase tracking-widest text-[10px] mb-6 text-primary-foreground/50">Shop</h4>
                        <ul className="space-y-4 text-sm text-primary-foreground/70 font-medium">
                            <li><Link href="/" className="hover:text-accent transition-colors">New Arrivals</Link></li>
                            <li><Link href="/" className="hover:text-accent transition-colors">Best Sellers</Link></li>
                            <li><Link href="/?category=Accessories" className="hover:text-accent transition-colors">Accessories</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black uppercase tracking-widest text-[10px] mb-6 text-primary-foreground/50">Support</h4>
                        <ul className="space-y-4 text-sm text-primary-foreground/70 font-medium">
                            <li><Link href="/about" className="hover:text-accent transition-colors">About Lumina</Link></li>
                            <li><Link href="/blog" className="hover:text-accent transition-colors">Journal</Link></li>
                            <li><Link href="/orders" className="hover:text-accent transition-colors">Order Tracking</Link></li>
                            <li><Link href="/contact" className="hover:text-accent transition-colors">Contact Us</Link></li>
                            <li><Link href="/returns" className="hover:text-accent transition-colors">Returns & Exchanges</Link></li>
                            <li><Link href="/auth" className="hover:text-accent transition-colors">Login / Register</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-black uppercase tracking-widest text-[10px] mb-6 text-primary-foreground/50">Stay Connected</h4>
                        <p className="text-sm text-primary-foreground/70 mb-4 font-medium leading-relaxed">
                            Subscribe to receive updates, access to exclusive deals, and more.
                        </p>
                        <form onSubmit={onSubmit} className="flex gap-2 mb-6">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                aria-label="Email address for newsletter"
                                required
                                disabled={loading}
                                className="flex-1 bg-white/5 border border-white/10 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent rounded-xl disabled:opacity-50"
                            />
                            <button
                                disabled={loading}
                                className="bg-white text-black px-6 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-all rounded-xl disabled:opacity-50 min-w-[80px] flex items-center justify-center"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "JOIN"}
                            </button>
                        </form>
                        <div className="flex gap-4">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-primary-foreground/50 hover:text-accent transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-primary-foreground/50 hover:text-accent transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-primary-foreground/50 hover:text-accent transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-primary-foreground/50 hover:text-accent transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-white/10 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-black uppercase tracking-widest text-primary-foreground/30">
                    <p>&copy; {new Date().getFullYear()} Lumina. All rights reserved.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-accent transition-colors cursor-pointer">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-accent transition-colors cursor-pointer">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
