import { User, ShoppingCart, LogOut, Heart, ArrowRightLeft, Menu, ChevronDown, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import type { User as UserType, Category } from "@shared/schema";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Collapsible,
    CollapsibleContent,
} from "@/components/ui/collapsible";
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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { useCurrency } from "@/hooks/use-currency";

export function Navbar() {
    const { data: user } = useQuery<UserType>({
        queryKey: ["/api/user"],
        retry: false
    });

    const { data: categories } = useQuery<Category[]>({
        queryKey: ["/api/categories"]
    });

    const { totalItems } = useCart();
    const [location] = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);
    const { currencies, currentCurrency, setCurrency } = useCurrency();

    const handleLogout = async () => {
        await fetch("/api/logout", { method: "POST" });
        window.location.href = "/";
    };

    const navLinks = [
        { href: "/", label: "Collection" },
        { href: "/compare", label: "Compare" },
        { href: "/about", label: "About" },
    ];

    return (
        <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
            <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-8">
                {/* Left Section: Mobile Menu + Logo + Desktop Nav */}
                <div className="flex items-center gap-8 shrink-0">
                    <div className="flex items-center gap-4">
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden rounded-xl" aria-label="Open menu">
                                    <Menu className="w-6 h-6" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="w-[300px] sm:w-[400px] rounded-r-3xl border-none">
                                <SheetHeader className="text-left pb-8">
                                    <SheetTitle className="text-3xl font-black tracking-tighter">
                                        LUMINA<span className="text-accent">.</span>
                                    </SheetTitle>
                                </SheetHeader>
                                <div className="flex flex-col gap-6 mt-8">
                                    <Accordion type="single" collapsible className="w-full border-none">
                                        <AccordionItem value="categories" className="border-none">
                                            <AccordionTrigger className="text-[10px] font-black uppercase tracking-[0.2em] text-accent hover:no-underline py-0">
                                                Categories
                                            </AccordionTrigger>
                                            <AccordionContent className="pt-4">
                                                <div className="grid grid-cols-1 gap-4">
                                                    {categories?.map((category) => (
                                                        <Link
                                                            key={category.id}
                                                            href={`/category/${category.id}`}
                                                            onClick={() => setIsMobileMenuOpen(false)}
                                                            className="text-lg font-black uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground transition-all ml-2"
                                                        >
                                                            {category.name}
                                                        </Link>
                                                    ))}
                                                    <Link
                                                        href="/"
                                                        onClick={() => setIsMobileMenuOpen(false)}
                                                        className="text-lg font-black uppercase tracking-[0.1em] text-accent transition-all ml-2"
                                                    >
                                                        All Products
                                                    </Link>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    </Accordion>

                                    <div className="space-y-4 pt-4 border-t border-muted">
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent">Menu</p>
                                        {navLinks.map((link) => (
                                            <Link
                                                key={link.href}
                                                href={link.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className={`text-xl font-black uppercase tracking-[0.2em] transition-all flex items-center gap-3 ${location === link.href ? "text-accent translate-x-2" : "text-muted-foreground hover:text-foreground"
                                                    }`}
                                            >
                                                {link.label}
                                            </Link>
                                        ))}
                                    </div>

                                    <div className="pt-8 border-t border-muted mt-4">
                                        <FloatingSearch onSearch={() => setIsMobileMenuOpen(false)} />
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>

                        <Link href="/" className="text-2xl md:text-3xl font-black tracking-tighter hover:text-accent transition-all">
                            LUMINA<span className="text-accent">.</span>
                        </Link>
                    </div>

                    <div className="hidden lg:flex items-center gap-6">
                        <Button
                            variant="ghost"
                            onClick={() => setIsCategoriesExpanded(!isCategoriesExpanded)}
                            className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2 px-0 group ${isCategoriesExpanded ? 'text-accent' : 'text-muted-foreground hover:text-accent'}`}
                        >
                            Categories
                            <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isCategoriesExpanded ? 'rotate-180' : ''}`} />
                        </Button>

                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${location === link.href ? "text-accent" : "text-muted-foreground hover:text-accent"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Center Section: Search Box */}
                <div className="flex-1 max-w-2xl hidden md:block group">
                    <FloatingSearch />
                </div>

                {/* Right Section: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-muted-foreground hover:text-accent transition-colors" aria-label="Change currency">
                                <Globe className="w-5 h-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-2xl border-none">
                            <p className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Currency</p>
                            {currencies.map((c) => (
                                <DropdownMenuItem
                                    key={c.code}
                                    onClick={() => setCurrency(c.code)}
                                    className={`cursor-pointer rounded-xl h-11 font-black uppercase text-[10px] tracking-widest ${currentCurrency?.code === c.code ? "bg-accent/10 text-accent" : ""}`}
                                >
                                    {c.symbol} {c.code}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Link href="/cart" aria-label="Shopping Cart" className="relative p-2.5 hover:bg-muted rounded-xl transition-colors text-muted-foreground hover:text-foreground">
                        <ShoppingCart className="w-5 h-5" />
                        {totalItems > 0 && (
                            <span className="absolute top-1 right-1 h-4 w-4 text-[9px] bg-accent text-white rounded-full flex items-center justify-center font-black animate-in zoom-in duration-300">
                                {totalItems}
                            </span>
                        )}
                    </Link>

                    {user ? (
                        <>
                            <Link href="/account?tab=wishlist" className="hidden sm:block">
                                <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-muted-foreground hover:text-accent transition-colors" aria-label="Wishlist">
                                    <Heart className="w-5 h-5" />
                                </Button>
                            </Link>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-muted-foreground hover:text-accent transition-colors" aria-label="User account">
                                        <User className="w-5 h-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-none">
                                    <div className="px-4 py-3 border-b border-muted mb-2">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Authenticated</p>
                                        <p className="font-bold truncate">{user.username}</p>
                                    </div>
                                    <Link href="/account">
                                        <DropdownMenuItem className="cursor-pointer rounded-xl h-11 font-black uppercase text-[10px] tracking-widest">
                                            Profile
                                        </DropdownMenuItem>
                                    </Link>
                                    <Link href="/orders">
                                        <DropdownMenuItem className="cursor-pointer rounded-xl h-11 font-black uppercase text-[10px] tracking-widest">
                                            Orders
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
                                        Logout
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </>
                    ) : (
                        <Link href="/auth">
                            <Button variant="ghost" size="icon" className="rounded-xl h-10 w-10 text-muted-foreground hover:text-accent transition-colors" aria-label="Login">
                                <User className="w-5 h-5" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <Collapsible open={isCategoriesExpanded} onOpenChange={setIsCategoriesExpanded}>
                <CollapsibleContent className="border-t bg-secondary/5 overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down">
                    <div className="container mx-auto px-4 py-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                            {categories?.map((category) => (
                                <Link
                                    key={category.id}
                                    href={`/category/${category.id}`}
                                    onClick={() => setIsCategoriesExpanded(false)}
                                    className="group flex flex-col gap-3"
                                >
                                    <div className="aspect-square bg-card dark:bg-background rounded-2xl border border-border flex items-center justify-center p-4 transition-all group-hover:border-accent group-hover:shadow-xl group-hover:shadow-accent/5">
                                        <div className="w-full h-full bg-secondary/10 rounded-xl flex items-center justify-center">
                                            <span className="text-2xl font-black text-accent opacity-20 group-hover:opacity-100 transition-opacity">
                                                {category.name.charAt(0)}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="font-black text-[10px] uppercase tracking-[0.2em] text-center group-hover:text-accent transition-colors text-foreground">
                                        {category.name}
                                    </p>
                                </Link>
                            ))}
                            <Link
                                href="/"
                                onClick={() => setIsCategoriesExpanded(false)}
                                className="group flex flex-col gap-3"
                            >
                                <div className="aspect-square bg-accent/5 rounded-2xl border border-accent/20 flex items-center justify-center p-4 transition-all group-hover:bg-accent group-hover:shadow-xl group-hover:shadow-accent/40">
                                    <ArrowRightLeft className="w-8 h-8 text-accent group-hover:text-white transition-colors" />
                                </div>
                                <p className="font-black text-[10px] uppercase tracking-[0.2em] text-center group-hover:text-accent transition-colors text-accent">
                                    All Products
                                </p>
                            </Link>
                        </div>
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </nav>
    );
}
