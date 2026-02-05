"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
    Euro,
    ShoppingCart,
    Users,
    TrendingUp,
    ArrowUpRight,
    ArrowDownRight,
    Clock,
    ChevronRight,
    Bell,
    ExternalLink,
    Plus,
    QrCode,
    BarChart3,
    CheckCircle2,
    AlertCircle,
    ChefHat,
    Truck,
    Utensils,
    Eye,
    Loader2,
    Coffee,
    BadgeCheck,
    ClipboardList,
} from "lucide-react";

interface DashboardStats {
    todayRevenue: number;
    todayOrders: number;
    activeCustomers: number;
    averageTicket: number;
    revenueChange: number;
    ordersChange: number;
}

interface Order {
    id: string;
    order_number: string;
    status: string;
    order_type: string;
    total: number;
    customer_name: string | null;
    table_number?: number;
    created_at: string;
}

interface WaiterCall {
    id: string;
    table_number: number;
    reason: string;
    priority: string;
    created_at: string;
}

interface TopProduct {
    name: string;
    quantity: number;
    revenue: number;
}

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [stats, setStats] = useState<DashboardStats>({
        todayRevenue: 0,
        todayOrders: 0,
        activeCustomers: 0,
        averageTicket: 0,
        revenueChange: 0,
        ordersChange: 0,
    });
    const [activeOrders, setActiveOrders] = useState<Order[]>([]);
    const [waiterCalls, setWaiterCalls] = useState<WaiterCall[]>([]);
    const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
    const [hourlyRevenue, setHourlyRevenue] = useState<number[]>(Array(24).fill(0));

    const supabase = createClient();

    useEffect(() => {
        loadData();
        setupRealtimeSubscriptions();
    }, []);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: restaurants } = await supabase
                .from("restaurants")
                .select("*")
                .eq("owner_id", user.id)
                .order("created_at", { ascending: true });

            const restaurantData = restaurants?.[0] || null;

            if (!restaurantData) return;
            setRestaurant(restaurantData);

            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            // Load today's metrics
            const { data: todayMetrics } = await supabase
                .from("daily_metrics")
                .select("*")
                .eq("restaurant_id", restaurantData.id)
                .eq("date", today)
                .maybeSingle();

            // Load yesterday's metrics for comparison
            const { data: yesterdayMetrics } = await supabase
                .from("daily_metrics")
                .select("*")
                .eq("restaurant_id", restaurantData.id)
                .eq("date", yesterday)
                .maybeSingle();

            if (todayMetrics) {
                const revenueChange = yesterdayMetrics?.total_revenue
                    ? ((todayMetrics.total_revenue - yesterdayMetrics.total_revenue) / yesterdayMetrics.total_revenue) * 100
                    : 0;
                const ordersChange = yesterdayMetrics?.total_orders
                    ? ((todayMetrics.total_orders - yesterdayMetrics.total_orders) / yesterdayMetrics.total_orders) * 100
                    : 0;

                setStats({
                    todayRevenue: todayMetrics.total_revenue,
                    todayOrders: todayMetrics.total_orders,
                    activeCustomers: todayMetrics.menu_views,
                    averageTicket: todayMetrics.average_order_value,
                    revenueChange,
                    ordersChange,
                });
            }

            // Load active orders
            const { data: ordersData } = await supabase
                .from("orders")
                .select("*")
                .eq("restaurant_id", restaurantData.id)
                .in("status", ["pending", "confirmed", "preparing", "ready"])
                .order("created_at", { ascending: false })
                .limit(5);

            setActiveOrders(ordersData || []);

            // Load waiter calls
            const { data: callsData } = await supabase
                .from("waiter_calls")
                .select("*")
                .eq("restaurant_id", restaurantData.id)
                .eq("status", "pending")
                .order("created_at", { ascending: true })
                .limit(5);

            setWaiterCalls(callsData || []);

            // Mock top products (would come from order_items aggregation)
            setTopProducts([
                { name: "Hamburguesa Classic", quantity: 23, revenue: 345 },
                { name: "Pizza Margarita", quantity: 18, revenue: 270 },
                { name: "Coca-Cola", quantity: 45, revenue: 135 },
                { name: "Ensalada César", quantity: 12, revenue: 144 },
                { name: "Tiramisú", quantity: 9, revenue: 63 },
            ]);

            // Mock hourly revenue
            setHourlyRevenue([
                0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 50, 120,
                280, 350, 180, 90, 60, 100, 180, 320, 450, 380, 150, 40
            ]);

        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    };

    const setupRealtimeSubscriptions = () => {
        // Subscribe to orders changes
        const ordersChannel = supabase
            .channel('orders-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'orders',
            }, () => {
                loadData();
            })
            .subscribe();

        // Subscribe to waiter calls
        const callsChannel = supabase
            .channel('calls-changes')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'waiter_calls',
            }, () => {
                loadData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(ordersChannel);
            supabase.removeChannel(callsChannel);
        };
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Buenos días";
        if (hour < 19) return "Buenas tardes";
        return "Buenas noches";
    };

    const formatDate = () => {
        return new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const getOrderStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700';
            case 'confirmed': return 'bg-blue-100 text-blue-700';
            case 'preparing': return 'bg-yellow-100 text-yellow-700';
            case 'ready': return 'bg-green-100 text-green-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getOrderStatusLabel = (status: string) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'confirmed': return 'Confirmado';
            case 'preparing': return 'Preparando';
            case 'ready': return 'Listo';
            default: return status;
        }
    };

    const getOrderTypeIcon = (type: string) => {
        switch (type) {
            case 'dine_in': return Utensils;
            case 'takeaway': return Coffee;
            case 'delivery': return Truck;
            default: return ShoppingCart;
        }
    };

    const getCallPriorityColor = (priority: string) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500';
            case 'high': return 'bg-red-400';
            case 'normal': return 'bg-yellow-400';
            case 'low': return 'bg-green-400';
            default: return 'bg-slate-400';
        }
    };

    const formatTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'ahora mismo';
        if (mins < 60) return `hace ${mins} min`;
        const hours = Math.floor(mins / 60);
        return `hace ${hours}h`;
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    const maxHourlyRevenue = Math.max(...hourlyRevenue, 1);

    return (
        <div className="p-6 lg:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                        {getGreeting()}, {restaurant?.name}! 👋
                    </h1>
                    <p className="text-slate-500 capitalize">{formatDate()}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={`/r/${restaurant?.slug}`}
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 transition-colors"
                    >
                        <Eye size={16} />
                        Ver Menú
                    </Link>
                    <Link
                        href="/dashboard/menu/products/new"
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 rounded-xl text-sm font-bold text-white transition-colors shadow-lg shadow-primary/20"
                    >
                        <Plus size={16} />
                        Nuevo Producto
                    </Link>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    icon={Euro}
                    label="Ventas hoy"
                    value={`€${stats.todayRevenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
                    change={stats.revenueChange}
                    color="primary"
                />
                <StatCard
                    icon={ShoppingCart}
                    label="Pedidos hoy"
                    value={stats.todayOrders.toString()}
                    change={stats.ordersChange}
                    color="blue"
                />
                <StatCard
                    icon={Users}
                    label="Visitas menú"
                    value={stats.activeCustomers.toString()}
                    subtext="Clientes únicos"
                    color="purple"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Ticket medio"
                    value={`€${stats.averageTicket.toFixed(2)}`}
                    subtext="Por pedido"
                    color="amber"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Active Orders */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <ClipboardList size={20} className="text-primary" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900">Pedidos en Curso</h2>
                                <p className="text-xs text-slate-400">{activeOrders.length} pedidos activos</p>
                            </div>
                        </div>
                        <Link
                            href="/dashboard/orders"
                            className="text-sm font-bold text-primary flex items-center gap-1 hover:underline"
                        >
                            Ver todos <ChevronRight size={14} />
                        </Link>
                    </div>

                    {activeOrders.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                <BadgeCheck size={28} className="text-slate-300" />
                            </div>
                            <p className="font-bold text-slate-900 mb-1">¡Al día!</p>
                            <p className="text-sm text-slate-400">No hay pedidos pendientes</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {activeOrders.map((order) => {
                                const OrderTypeIcon = getOrderTypeIcon(order.order_type);
                                return (
                                    <Link
                                        key={order.id}
                                        href={`/dashboard/orders/${order.id}`}
                                        className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                                    >
                                        <div className={`w-12 h-12 rounded-xl ${getOrderStatusColor(order.status)} flex items-center justify-center`}>
                                            <OrderTypeIcon size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900">#{order.order_number}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getOrderStatusColor(order.status)}`}>
                                                    {getOrderStatusLabel(order.status)}
                                                </span>
                                            </div>
                                            <p className="text-sm text-slate-500 truncate">
                                                {order.customer_name || `Mesa ${order.table_number || '-'}`}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-slate-900">€{order.total.toFixed(2)}</p>
                                            <p className="text-xs text-slate-400">{formatTimeAgo(order.created_at)}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Waiter Calls */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                <Bell size={20} className="text-amber-600" />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-900">Llamadas</h2>
                                <p className="text-xs text-slate-400">{waiterCalls.length} pendientes</p>
                            </div>
                        </div>
                        <Link
                            href="/dashboard/waiter-calls"
                            className="text-sm font-bold text-primary flex items-center gap-1 hover:underline"
                        >
                            Ver <ChevronRight size={14} />
                        </Link>
                    </div>

                    {waiterCalls.length === 0 ? (
                        <div className="p-8 text-center">
                            <CheckCircle2 size={32} className="text-green-400 mx-auto mb-2" />
                            <p className="text-sm text-slate-400">Sin llamadas pendientes</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-50">
                            {waiterCalls.map((call) => (
                                <div key={call.id} className="flex items-center gap-3 p-4 hover:bg-slate-50">
                                    <div className={`w-3 h-3 rounded-full ${getCallPriorityColor(call.priority)} animate-pulse`} />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-slate-900">Mesa {call.table_number}</p>
                                        <p className="text-xs text-slate-400 capitalize">{call.reason}</p>
                                    </div>
                                    <span className="text-xs text-slate-400">{formatTimeAgo(call.created_at)}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-slate-900">Ventas de Hoy</h2>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                            <span className="w-3 h-3 rounded-full bg-primary" />
                            Ingresos por hora
                        </div>
                    </div>

                    <div className="h-48 flex items-end gap-1">
                        {hourlyRevenue.map((value, i) => {
                            const height = (value / maxHourlyRevenue) * 100;
                            const isCurrentHour = i === new Date().getHours();
                            return (
                                <motion.div
                                    key={i}
                                    initial={{ height: 0 }}
                                    animate={{ height: `${Math.max(height, 2)}%` }}
                                    transition={{ delay: i * 0.02 }}
                                    className={`flex-1 rounded-t-sm transition-colors cursor-pointer group relative ${isCurrentHour
                                        ? 'bg-primary'
                                        : 'bg-primary/60 hover:bg-primary'
                                        }`}
                                    title={`${i}:00 - €${value}`}
                                >
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                        {i}:00 · €{value}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <div className="flex justify-between mt-3 text-xs text-slate-400">
                        <span>00:00</span>
                        <span>06:00</span>
                        <span>12:00</span>
                        <span>18:00</span>
                        <span>23:00</span>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-slate-900">🏆 Top Productos</h2>
                        <Link
                            href="/dashboard/analytics/products"
                            className="text-xs font-bold text-primary hover:underline"
                        >
                            Ver más
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {topProducts.map((product, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${i === 0 ? 'bg-amber-400 text-white' :
                                    i === 1 ? 'bg-slate-300 text-slate-700' :
                                        i === 2 ? 'bg-amber-700 text-white' :
                                            'bg-slate-100 text-slate-500'
                                    }`}>
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 text-sm truncate">{product.name}</p>
                                    <p className="text-xs text-slate-400">{product.quantity} vendidos</p>
                                </div>
                                <span className="font-bold text-slate-900 text-sm">€{product.revenue}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <QuickAction
                    icon={Plus}
                    label="Nuevo Producto"
                    description="Añadir al menú"
                    href="/dashboard/menu/products/new"
                    color="bg-primary/10 text-primary hover:bg-primary hover:text-white"
                />
                <QuickAction
                    icon={QrCode}
                    label="Generar QR"
                    description="Para mesas"
                    href="/dashboard/qr"
                    color="bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white"
                />
                <QuickAction
                    icon={BarChart3}
                    label="Analytics"
                    description="Ver métricas"
                    href="/dashboard/analytics"
                    color="bg-purple-50 text-purple-600 hover:bg-purple-500 hover:text-white"
                />
                <QuickAction
                    icon={ExternalLink}
                    label="Ver Menú"
                    description="Público"
                    href={`/r/${restaurant?.slug}`}
                    color="bg-green-50 text-green-600 hover:bg-green-500 hover:text-white"
                    external
                />
            </div>
        </div>
    );
}

// Stat Card Component
function StatCard({
    icon: Icon,
    label,
    value,
    change,
    subtext,
    color,
}: {
    icon: any;
    label: string;
    value: string;
    change?: number;
    subtext?: string;
    color: 'primary' | 'blue' | 'purple' | 'amber';
}) {
    const colorClasses = {
        primary: 'bg-primary/10 text-primary',
        blue: 'bg-blue-100 text-blue-600',
        purple: 'bg-purple-100 text-purple-600',
        amber: 'bg-amber-100 text-amber-600',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-5 rounded-2xl border border-slate-100"
        >
            <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl ${colorClasses[color]} flex items-center justify-center`}>
                    <Icon size={20} />
                </div>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-xs font-bold ${change >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                        {change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {Math.abs(change).toFixed(1)}%
                    </div>
                )}
                {subtext && (
                    <span className="text-xs text-slate-400">{subtext}</span>
                )}
            </div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
        </motion.div>
    );
}

// Quick Action Component
function QuickAction({
    icon: Icon,
    label,
    description,
    href,
    color,
    external = false,
}: {
    icon: any;
    label: string;
    description: string;
    href: string;
    color: string;
    external?: boolean;
}) {
    return (
        <Link
            href={href}
            target={external ? "_blank" : undefined}
            className="bg-white p-5 rounded-2xl border border-slate-100 hover:shadow-lg transition-all group"
        >
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center mb-4 transition-colors`}>
                <Icon size={24} />
            </div>
            <h3 className="font-bold text-slate-900 group-hover:text-primary transition-colors">{label}</h3>
            <p className="text-xs text-slate-400">{description}</p>
        </Link>
    );
}

