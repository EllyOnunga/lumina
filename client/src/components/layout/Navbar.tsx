import { User, ShoppingCart, LogOut, Heart, ArrowRightLeft, Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import type { User as UserType } from "@shared/schema";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { FloatingSearch } from "./FloatingSearch";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
import { useState } from "react";

export function Navbar() {
    const { data: user } = useQuery<UserType>({
        queryKey: ["/api/user"],
        retry: false
    });

    const { totalItems } = useCart();

    const [location] = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await fetch("/api/logout", { method: "POST" });
        window.location.href = "/";
    };

    const navLinks = [
        { href: "/", label: "Collection" },
        { href: "/compare", label: "Compare", icon: ArrowRightLeft },
        { href: "/about", label: "About Us" },
    ];

    return (
        <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="lg:hidden rounded-full">
                                <Menu className="w-6 h-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-[300px] sm:w-[400px] rounded-r-[2rem] border-none">
                            <SheetHeader className="text-left pb-8">
                                <SheetTitle className="text-3xl font-black tracking-tighter">
                                    LUMINA<span className="text-accent">.</span>
                                </SheetTitle>
                            </SheetHeader>
                            <div className="flex flex-col gap-6 mt-8">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`text-xl font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${location === link.href ? "text-accent translate-x-2" : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        {link.icon && <link.icon className="w-5 h-5" />}
                                        {link.label}
                                    </Link>
                                ))}
                                <div className="pt-8 border-t border-muted mt-4">
                                    <FloatingSearch onSearch={() => setIsMobileMenuOpen(false)} />
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>

                    <Link href="/" className="text-2xl md:text-3xl font-black tracking-tighter hover:text-accent transition-colors">
                        LUMINA<span className="text-accent">.</span>
                    </Link>
                </div>

                <div className="flex items-center gap-4 lg:gap-10">
                    <div className="hidden lg:flex items-center gap-10">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 ${location === link.href ? "text-accent" : "text-muted-foreground hover:text-accent"
                                    }`}
                            >
                                {link.icon && <link.icon className="w-3 h-3" />}
                                {link.label}
                            </Link>
                        ))}
                        <div className="flex-1 max-w-[200px] xl:max-w-md mx-4">
                            <FloatingSearch />
                        </div>
                    </div>

                    <div className="flex items-center gap-1 md:gap-2 border-l pl-4 md:pl-6 ml-1 md:ml-2">
                        <Link href="/cart" aria-label="Shopping Cart" className="relative p-2 hover:bg-muted rounded-full transition-colors">
                            <ShoppingCart className="w-5 h-5" />
                            {totalItems > 0 && (
                                <span className="absolute top-0 right-0 h-4 w-4 text-[10px] bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                                    {totalItems}
                                </span>
                            )}
                        </Link>

                        {user ? (
                            <>
                                <Link href="/account?tab=wishlist" className="hidden sm:block">
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <Heart className="w-5 h-5" />
                                    </Button>
                                </Link>

                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="rounded-full">
                                            <User className="w-5 h-5" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-none">
                                        <div className="px-4 py-3 border-b border-muted mb-2">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Authenticated as</p>
                                            <p className="font-bold truncate">{user.username}</p>
                                        </div>
                                        <Link href="/account">
                                            <DropdownMenuItem className="cursor-pointer rounded-xl h-11 font-black uppercase text-[10px] tracking-widest">
                                                Registry Profile
                                            </DropdownMenuItem>
                                        </Link>
                                        <Link href="/orders">
                                            <DropdownMenuItem className="cursor-pointer rounded-xl h-11 font-black uppercase text-[10px] tracking-widest">
                                                Acquisitions
                                            </DropdownMenuItem>
                                        </Link>
                                        {user.isAdmin && (
                                            <Link href="/admin">
                                                <DropdownMenuItem className="cursor-pointer rounded-xl h-11 font-black uppercase text-[10px] tracking-widest text-accent bg-accent/5">
                                                    Control Panel
                                                </DropdownMenuItem>
                                            </Link>
                                        )}
                                        <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer rounded-xl h-11 font-black uppercase text-[10px] tracking-widest mt-2">
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Terminate Session
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <Link href="/auth">
                                <Button variant="ghost" size="icon" className="rounded-full">
                                    <User className="w-5 h-5" />
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
