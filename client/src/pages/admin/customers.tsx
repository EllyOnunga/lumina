import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User as UserIcon, Mail } from "lucide-react";
import { useState } from "react";

export default function AdminCustomers() {
    const [search, setSearch] = useState("");

    const { data: users, isLoading } = useQuery<User[]>({
        queryKey: ["/api/admin/customers/search", search],
        queryFn: async () => {
            const res = await fetch(`/api/admin/customers/search?q=${search}`);
            return res.json();
        }
    });

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow py-12 container mx-auto px-4">
                <div className="max-w-6xl mx-auto space-y-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-4xl font-bold tracking-tighter">Customer Service Portal</h1>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                            className="pl-12 h-14 rounded-2xl bg-secondary/10 border-none text-lg"
                            placeholder="Search customers by username or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {isLoading ? (
                            Array(6).fill(0).map((_, i) => (
                                <Card key={i} className="border-none shadow-sm bg-secondary/10 animate-pulse">
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-muted" />
                                        <div className="space-y-2">
                                            <div className="h-4 w-24 bg-muted rounded" />
                                            <div className="h-3 w-16 bg-muted rounded" />
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="h-4 w-3/4 bg-muted rounded" />
                                        <div className="h-10 w-full bg-muted rounded-xl" />
                                    </CardContent>
                                </Card>
                            ))
                        ) : users?.length === 0 ? (
                            <div className="col-span-full text-center py-12">
                                <p className="text-muted-foreground text-lg">No customers found matching your search.</p>
                            </div>
                        ) : (
                            users?.map((user) => (
                                <Card key={user.id} className="border-none shadow-sm bg-secondary/10 hover:bg-secondary/20 transition-colors cursor-pointer">
                                    <CardHeader className="flex flex-row items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <UserIcon className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-xl">{user.username}</CardTitle>
                                            <p className="text-sm text-muted-foreground">{user.isAdmin ? "Administrator" : "Customer"}</p>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Mail className="w-4 h-4" />
                                                <span>{user.username}@example.com</span>
                                            </div>
                                        </div>
                                        <Button className="w-full rounded-xl">View Customer Profile</Button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}
