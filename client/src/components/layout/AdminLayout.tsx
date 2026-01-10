import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Package, UserCog, ShoppingCart, ArrowLeft, Warehouse, Tags, Users, RefreshCcw, FileText, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
    ];

    const visibleItems = navItems.filter(item => {
        if (!user) return false;
        if (user.role === "admin") return true;
        return item.roles.includes(user.role);
    });

    return (
        <div className="flex min-h-screen bg-background">
            {/* Sidebar */}
            <aside className="w-64 border-r border-secondary/10 flex flex-col hidden md:flex">
                <div className="p-6 border-b border-secondary/10">
                    <Link href="/" className="flex items-center gap-2 group">
                        <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                        <span className="font-bold tracking-tighter text-xl">Lumina Admin</span>
                    </Link>
                    {user && (
                        <div className="mt-4 flex items-center gap-2 px-3 py-1.5 bg-secondary/10 rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{user.role} Authorization</span>
                        </div>
                    )}
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location === item.href || (item.href === "/admin/products" && location === "/admin");

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "hover:bg-secondary/10 text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "" : "group-hover:scale-110 transition-transform")} />
                                <span className="font-bold">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 border-t border-secondary/10">
                    <div className="bg-secondary/10 rounded-2xl p-4">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground mb-1">System Status</p>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-sm font-bold">All Systems Active</span>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col">
                <div className="md:hidden p-4 border-b border-secondary/10 flex justify-between items-center">
                    <span className="font-black tracking-tighter text-xl">Lumina Admin</span>
                    {/* Add a mobile menu trigger if needed, but for now focusing on desktop-first premium feel */}
                </div>
                <div className="flex-1 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
