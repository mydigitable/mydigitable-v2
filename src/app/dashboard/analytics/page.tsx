"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Euro,
    ShoppingCart,
    Users,
    TrendingUp,
    TrendingDown,
    ArrowUpRight,
    ArrowDownRight,
    Eye,
    Utensils,
    Coffee,
    Truck,
    Waves,
    Calendar,
    ChevronDown,
    Loader2,
    BarChart3,
    PieChart as PieChartIcon,
} from "lucide-react";
import Link from "next/link";

interface DailyMetrics {
    date: string;
    total_orders: number;
    total_revenue: number;
    average_order_value: number;
    menu_views: number;
    unique_customers: number;
    dine_in_orders: number;
    takeaway_orders: number;
    delivery_orders: number;
}

interface TopProduct {
    name: string;
    quantity: number;
    revenue: number;
}

type Period = '7d' | '30d' | '90d';

export default function AnalyticsPage() {
    const [metrics, setMetrics] = useState<DailyMetrics[]>([]);
    const [loading, setLoading] = useState(true);
    const [period, setPeriod] = useState<Period>('7d');
    const [restaurant, setRestaurant] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        loadAnalytics();
    }, [period]);

    const loadAnalytics = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: restaurants } = await supabase
                .from("restaurants")
                .select("*")
                .eq("owner_id", user.id)
                .order("created_at", { ascending: true }); const restaurantData = restaurants?.[0] || null;

            if (!restaurantData) return;
            setRestaurant(restaurantData);

            // Calculate date range
            const days = period === '7d' ? 7 : period === '30d' ? 30 : 90;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - days);

            const { data: metricsData } = await supabase
                .from("daily_metrics")
                .select("*")
                .eq("restaurant_id", restaurantData.id)
                .gte("date", startDate.toISOString().split('T')[0])
                .order("date", { ascending: true });

            setMetrics(metricsData || []);
        } catch (err) {
            console.error("Error loading analytics:", err);
        } finally {
            setLoading(false);
        }
    };

    // Calculate totals
    const totals = metrics.reduce((acc, day) => ({
        revenue: acc.revenue + (day.total_revenue || 0),
        orders: acc.orders + (day.total_orders || 0),
        menuViews: acc.menuViews + (day.menu_views || 0),
        customers: acc.customers + (day.unique_customers || 0),
        dineIn: acc.dineIn + (day.dine_in_orders || 0),
        takeaway: acc.takeaway + (day.takeaway_orders || 0),
        delivery: acc.delivery + (day.delivery_orders || 0),
    }), {
        revenue: 0,
        orders: 0,
        menuViews: 0,
        customers: 0,
        dineIn: 0,
        takeaway: 0,
        delivery: 0,
    });

    const averageOrderValue = totals.orders > 0 ? totals.revenue / totals.orders : 0;

    // Calculate changes (compare to previous period)
    const halfPoint = Math.floor(metrics.length / 2);
    const firstHalf = metrics.slice(0, halfPoint);
    const secondHalf = metrics.slice(halfPoint);

    const firstRevenue = firstHalf.reduce((sum, d) => sum + (d.total_revenue || 0), 0);
    const secondRevenue = secondHalf.reduce((sum, d) => sum + (d.total_revenue || 0), 0);
    const revenueChange = firstRevenue > 0 ? ((secondRevenue - firstRevenue) / firstRevenue) * 100 : 0;

    const firstOrders = firstHalf.reduce((sum, d) => sum + (d.total_orders || 0), 0);
    const secondOrders = secondHalf.reduce((sum, d) => sum + (d.total_orders || 0), 0);
    const ordersChange = firstOrders > 0 ? ((secondOrders - firstOrders) / firstOrders) * 100 : 0;

    // Mock top products
    const topProducts: TopProduct[] = [
        { name: "Hamburguesa Classic", quantity: 156, revenue: 2340 },
        { name: "Pizza Margarita", quantity: 124, revenue: 1860 },
        { name: "Coca-Cola", quantity: 312, revenue: 936 },
        { name: "Ensalada César", quantity: 89, revenue: 1068 },
        { name: "Tiramisú", quantity: 67, revenue: 469 },
    ];

    // Chart data
    const maxRevenue = Math.max(...metrics.map(m => m.total_revenue || 0), 1);
    const maxOrders = Math.max(...metrics.map(m => m.total_orders || 0), 1);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Analytics</h1>
                    <p className="text-sm text-slate-500">Métricas y rendimiento de tu restaurante</p>
                </div>

                {/* Period Selector */}
                <div className="flex bg-slate-100 rounded-xl p-1">
                    {(['7d', '30d', '90d'] as Period[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${period === p
                                    ? 'bg-white text-slate-900 shadow-sm'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {p === '7d' ? '7 días' : p === '30d' ? '30 días' : '90 días'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={Euro}
                    label="Ingresos Totales"
                    value={`€${totals.revenue.toLocaleString('es-ES', { minimumFractionDigits: 2 })}`}
                    change={revenueChange}
                    color="primary"
                />
                <StatCard
                    icon={ShoppingCart}
                    label="Pedidos"
                    value={totals.orders.toString()}
                    change={ordersChange}
                    color="blue"
                />
                <StatCard
                    icon={Eye}
                    label="Visitas al Menú"
                    value={totals.menuViews.toLocaleString()}
                    color="purple"
                />
                <StatCard
                    icon={TrendingUp}
                    label="Ticket Medio"
                    value={`€${averageOrderValue.toFixed(2)}`}
                    color="amber"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Revenue Chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-slate-900">Evolución de Ingresos</h2>
                        <div className="flex items-center gap-4 text-xs">
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-primary" />
                                Ingresos
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-3 h-3 rounded-full bg-blue-400" />
                                Pedidos
                            </span>
                        </div>
                    </div>

                    <div className="h-64 flex items-end gap-1">
                        {metrics.map((day, i) => {
                            const revenueHeight = ((day.total_revenue || 0) / maxRevenue) * 100;
                            const ordersHeight = ((day.total_orders || 0) / maxOrders) * 100;
                            return (
                                <div key={i} className="flex-1 flex items-end gap-0.5 group relative">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max(revenueHeight, 2)}%` }}
                                        transition={{ delay: i * 0.02 }}
                                        className="flex-1 bg-primary/80 rounded-t-sm hover:bg-primary"
                                    />
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${Math.max(ordersHeight * 0.6, 2)}%` }}
                                        transition={{ delay: i * 0.02 }}
                                        className="flex-1 bg-blue-400/80 rounded-t-sm hover:bg-blue-400"
                                    />

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                        <div className="font-bold">{new Date(day.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</div>
                                        <div>€{(day.total_revenue || 0).toFixed(2)}</div>
                                        <div>{day.total_orders || 0} pedidos</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {metrics.length > 0 && (
                        <div className="flex justify-between mt-3 text-xs text-slate-400">
                            <span>{new Date(metrics[0]?.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                            <span>{new Date(metrics[metrics.length - 1]?.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                        </div>
                    )}
                </div>

                {/* Order Types */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h2 className="font-bold text-slate-900 mb-6">Tipos de Pedido</h2>

                    <div className="space-y-4">
                        <OrderTypeBar
                            icon={Utensils}
                            label="En Mesa"
                            value={totals.dineIn}
                            total={totals.orders}
                            color="bg-primary"
                        />
                        <OrderTypeBar
                            icon={Coffee}
                            label="Para Llevar"
                            value={totals.takeaway}
                            total={totals.orders}
                            color="bg-blue-500"
                        />
                        <OrderTypeBar
                            icon={Truck}
                            label="Delivery"
                            value={totals.delivery}
                            total={totals.orders}
                            color="bg-purple-500"
                        />
                    </div>

                    {/* Pie representation */}
                    <div className="mt-6 flex items-center justify-center">
                        <div className="relative w-32 h-32">
                            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                                {totals.orders > 0 ? (
                                    <>
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke="#22C55E"
                                            strokeWidth="20"
                                            strokeDasharray={`${(totals.dineIn / totals.orders) * 251.2} 251.2`}
                                        />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke="#3B82F6"
                                            strokeWidth="20"
                                            strokeDasharray={`${(totals.takeaway / totals.orders) * 251.2} 251.2`}
                                            strokeDashoffset={`-${(totals.dineIn / totals.orders) * 251.2}`}
                                        />
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke="#8B5CF6"
                                            strokeWidth="20"
                                            strokeDasharray={`${(totals.delivery / totals.orders) * 251.2} 251.2`}
                                            strokeDashoffset={`-${((totals.dineIn + totals.takeaway) / totals.orders) * 251.2}`}
                                        />
                                    </>
                                ) : (
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="#E2E8F0"
                                        strokeWidth="20"
                                    />
                                )}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <span className="text-2xl font-black text-slate-900">{totals.orders}</span>
                                    <p className="text-[10px] text-slate-500">Total</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Products */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-slate-900">🏆 Top Productos</h2>
                        <Link href="/dashboard/analytics/products" className="text-sm font-bold text-primary hover:underline">
                            Ver todos
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {topProducts.map((product, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-amber-400 text-white' :
                                        i === 1 ? 'bg-slate-300 text-slate-700' :
                                            i === 2 ? 'bg-amber-700 text-white' :
                                                'bg-slate-100 text-slate-500'
                                    }`}>
                                    {i + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-900 truncate">{product.name}</p>
                                    <p className="text-xs text-slate-500">{product.quantity} vendidos</p>
                                </div>
                                <span className="font-bold text-slate-900">€{product.revenue}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                    <h2 className="font-bold text-slate-900 mb-6">Resumen del Período</h2>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-sm text-slate-500 mb-1">Mejor día</p>
                            <p className="font-bold text-slate-900">
                                {metrics.length > 0
                                    ? new Date(metrics.reduce((a, b) => (b.total_revenue || 0) > (a.total_revenue || 0) ? b : a).date).toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })
                                    : '-'
                                }
                            </p>
                            <p className="text-xs text-primary font-bold">
                                €{metrics.length > 0
                                    ? Math.max(...metrics.map(m => m.total_revenue || 0)).toFixed(2)
                                    : '0.00'
                                }
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-sm text-slate-500 mb-1">Promedio diario</p>
                            <p className="font-bold text-slate-900">
                                €{metrics.length > 0
                                    ? (totals.revenue / metrics.length).toFixed(2)
                                    : '0.00'
                                }
                            </p>
                            <p className="text-xs text-slate-500">
                                {metrics.length > 0
                                    ? Math.round(totals.orders / metrics.length)
                                    : 0
                                } pedidos/día
                            </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-sm text-slate-500 mb-1">Clientes únicos</p>
                            <p className="font-bold text-slate-900">{totals.customers}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl">
                            <p className="text-sm text-slate-500 mb-1">Conversión</p>
                            <p className="font-bold text-slate-900">
                                {totals.menuViews > 0
                                    ? ((totals.orders / totals.menuViews) * 100).toFixed(1)
                                    : 0
                                }%
                            </p>
                            <p className="text-xs text-slate-500">Visitas → Pedidos</p>
                        </div>
                    </div>
                </div>
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
    color,
}: {
    icon: any;
    label: string;
    value: string;
    change?: number;
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
            </div>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{value}</p>
        </motion.div>
    );
}

// Order Type Bar Component
function OrderTypeBar({
    icon: Icon,
    label,
    value,
    total,
    color,
}: {
    icon: any;
    label: string;
    value: number;
    total: number;
    color: string;
}) {
    const percentage = total > 0 ? (value / total) * 100 : 0;

    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Icon size={14} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">{label}</span>
                </div>
                <div className="text-right">
                    <span className="font-bold text-slate-900">{value}</span>
                    <span className="text-xs text-slate-400 ml-1">({percentage.toFixed(0)}%)</span>
                </div>
            </div>
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    className={`h-full ${color} rounded-full`}
                />
            </div>
        </div>
    );
}

