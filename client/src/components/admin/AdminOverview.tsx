
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Users,
    Package,
    ShoppingCart,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign,
    Activity
} from "lucide-react";
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { type Product, type Order, type User, type OrderItem } from "@shared/schema";

interface AdminOverviewProps {
    products: Product[];
    orders: (Order & { items: OrderItem[]; user: User | null })[];
    users: User[];
}

const data = [
    { name: 'Mon', revenue: 4000, orders: 24 },
    { name: 'Tue', revenue: 3000, orders: 13 },
    { name: 'Wed', revenue: 2000, orders: 98 },
    { name: 'Thu', revenue: 2780, orders: 39 },
    { name: 'Fri', revenue: 1890, orders: 48 },
    { name: 'Sat', revenue: 2390, orders: 38 },
    { name: 'Sun', revenue: 3490, orders: 43 },
];

export function AdminOverview({ products, orders, users }: AdminOverviewProps) {
    const totalRevenue = orders?.reduce((acc, order) => acc + (order.total || 0), 0) || 0;

    const stats = [
        {
            title: "Total Revenue",
            value: formatCurrency(totalRevenue),
            description: "+20.1% from last month",
            icon: DollarSign,
            trend: "up"
        },
        {
            title: "Active Orders",
            value: orders?.length?.toString() || "0",
            description: "+180.1% from last month",
            icon: ShoppingCart,
            trend: "up"
        },
        {
            title: "Registered Users",
            value: users?.length?.toString() || "0",
            description: "+19% from last month",
            icon: Users,
            trend: "up"
        },
        {
            title: "Active Products",
            value: products?.length?.toString() || "0",
            description: "Across 12 categories",
            icon: Package,
            trend: "neutral"
        }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-secondary/10 p-8 rounded-[2.5rem]">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter uppercase">Command Center</h1>
                    <p className="text-muted-foreground font-medium">Real-time intelligence and ecosystem vitals</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2 bg-background px-4 py-2 rounded-xl border border-secondary/10 shadow-sm">
                        <Activity className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-bold uppercase tracking-widest">Live Updates Active</span>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, i) => (
                    <Card key={i} className="border border-secondary/10 shadow-xl bg-white rounded-[2rem] overflow-hidden group hover:scale-[1.02] hover:-translate-y-1 hover:shadow-accent/5 transition-all duration-500">
                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                                {stat.title}
                            </CardTitle>
                            <div className="p-3 bg-secondary/5 rounded-xl group-hover:bg-accent/10 transition-colors">
                                <stat.icon className="w-5 h-5 text-accent" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black tracking-tighter mb-1">{stat.value}</div>
                            <p className="text-xs text-muted-foreground font-bold flex items-center gap-1">
                                {stat.trend === "up" && <ArrowUpRight className="w-3 h-3 text-green-500" />}
                                {stat.trend === "down" && <ArrowDownRight className="w-3 h-3 text-red-500" />}
                                {stat.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="md:col-span-4 border-none shadow-2xl bg-background rounded-[2.5rem] p-6 lg:p-8">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-2xl font-black tracking-tighter uppercase mb-2">Revenue Velocity</CardTitle>
                        <p className="text-sm font-medium text-muted-foreground">Daily transaction volume across all global nodes.</p>
                    </CardHeader>
                    <div className="h-[350px] mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--secondary)/0.1)" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontWeight: 600 }}
                                    tickFormatter={(value) => `${value / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--background))',
                                        border: 'none',
                                        borderRadius: '1rem',
                                        boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'
                                    }}
                                    itemStyle={{ fontWeight: 900, fontSize: '0.875rem' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                <Card className="md:col-span-3 border-none shadow-2xl bg-background rounded-[2.5rem] p-6 lg:p-8">
                    <CardHeader className="px-0 pt-0">
                        <CardTitle className="text-2xl font-black tracking-tighter uppercase mb-2">Top Performers</CardTitle>
                        <p className="text-sm font-medium text-muted-foreground">Maximum engagement assets in current cycle.</p>
                    </CardHeader>
                    <div className="space-y-6 mt-8">
                        {products?.slice(0, 5).map((product, i) => (
                            <div key={i} className="flex items-center gap-4 group cursor-pointer">
                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-secondary/10 flex-shrink-0">
                                    <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                                </div>
                                <div className="flex-1">
                                    <p className="font-black text-sm tracking-tight">{product.name}</p>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{product.category}</p>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-sm">{formatCurrency(product.price)}</p>
                                    <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">+12%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Button variant="outline" className="w-full mt-8 rounded-2xl h-12 border-2 font-black uppercase text-[10px] tracking-widest">
                        View Analytics Report
                    </Button>
                </Card>
            </div>
        </div>
    );
}
