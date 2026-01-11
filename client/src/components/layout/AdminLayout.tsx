import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Package, UserCog, ShoppingCart, Warehouse, Tags, Users, RefreshCcw, FileText, Target, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { type User } from "@shared/schema";

interface AdminLayoutProps {
    children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
    const [location] = useLocation();

    const { data: user } = useQuery<User>({
        queryKey: ["/api/user"],
    });

    const navItems = [
        { label: "Overview", icon: Target, href: "/admin", roles: ["admin", "manager", "analyst"] },
        { label: "Products", icon: Package, href: "/admin/products", roles: ["admin", "manager", "editor"] },
        { label: "Orders", icon: ShoppingCart, href: "/admin/orders", roles: ["admin", "manager", "packer"] },
        { label: "Returns", icon: RefreshCcw, href: "/admin/returns", roles: ["admin", "manager", "packer"] },
        { label: "Logistics Hub", icon: Warehouse, href: "/admin/inventory", roles: ["admin", "manager", "packer"] },
        { label: "Taxonomy", icon: Tags, href: "/admin/taxonomy", roles: ["admin", "manager"] },
        { label: "Customers", icon: Users, href: "/admin/customers", roles: ["admin", "manager"] },
        { label: "Security", icon: UserCog, href: "/admin/users", roles: ["admin"] },
        { label: "Journal (CMS)", icon: FileText, href: "/admin/blog", roles: ["admin", "manager", "editor"] },
        { label: "Marketplace", icon: ShoppingCart, href: "/admin/marketplace", roles: ["admin", "manager"] },
        { label: "Settings", icon: Settings, href: "/admin/settings", roles: ["admin"] },
    ];

    const visibleItems = navItems.filter(item => {
        if (!user) return false;
        if (user.isAdmin || user.role === "admin") return true;
        return item.roles.includes(user.role);
    });

    return (
        <div className="flex min-h-screen bg-[#f8f8f8]">
            {/* Sidebar */}
            <aside className="w-72 bg-white border-r border-secondary/10 flex flex-col hidden md:flex sticky top-0 h-screen">
                <div className="p-8 border-b border-secondary/10">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground font-black text-xl hover:rotate-12 transition-all">L</div>
                        <div>
                            <span className="font-black tracking-tighter text-lg block">Lumina HQ</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">Admin Protocol</span>
                        </div>
                    </Link>
                </div>

                <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto">
                    {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location === item.href || (item.href === "/admin/products" && location === "/admin");

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group",
                                    isActive
                                        ? "bg-accent text-white shadow-xl shadow-accent/20 translate-x-1"
                                        : "hover:bg-secondary/5 text-muted-foreground hover:text-foreground hover:translate-x-1"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "" : "group-hover:scale-110 transition-transform")} />
                                <span className="font-black text-[13px] uppercase tracking-wider">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-8 border-t border-secondary/10">
                    <div className="bg-secondary/5 rounded-[1.5rem] p-5 border border-secondary/10">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-2 opacity-50">System Integrity</p>
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
                            <span className="text-xs font-black uppercase tracking-widest">Active nodes: 12</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col min-w-0">
                <div className="md:hidden p-6 bg-white border-b border-secondary/10 flex justify-between items-center">
                    <span className="font-black tracking-tighter text-xl uppercase italic">Lumina HQ</span>
                    <Button variant="ghost" size="icon" className="rounded-xl bg-secondary/10">
                        <Package className="w-5 h-5" />
                    </Button>
                </div>
                <div className="flex-1 p-8 lg:p-12 overflow-auto">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    );
}
