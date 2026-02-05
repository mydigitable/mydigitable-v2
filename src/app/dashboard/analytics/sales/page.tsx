"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Euro,
    TrendingUp,
    TrendingDown,
    Calendar,
    Download,
    Loader2,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";

export default function SalesAnalyticsPage() {
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<'week' | 'month' | 'year'>('month');
    const [salesData, setSalesData] = useState({
        totalRevenue: 0,
        ordersCount: 0,
        averageOrder: 0,
        growth: 0,
    });

    const supabase = createClient();

    useEffect(() => {
        loadSalesData();
    }, [dateRange]);

    const loadSalesData = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: restaurant } = await supabase
            .from("restaurants")
            .select("id")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: true }); const restaurantData = restaurants?.[0] || null;

        if (restaurant) {
            const now = new Date();
            let startDate: Date;

            if (dateRange === 'week') {
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            } else if (dateRange === 'month') {
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            } else {
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
            }

            const { data: orders } = await supabase
                .from("orders")
                .select("total, created_at")
                .eq("restaurant_id", restaurant.id)
                .gte("created_at", startDate.toISOString())
                .in("status", ["completed", "delivered"]);

            if (orders) {
                const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
                const ordersCount = orders.length;
                const averageOrder = ordersCount > 0 ? totalRevenue / ordersCount : 0;

                setSalesData({
                    totalRevenue,
                    ordersCount,
                    averageOrder,
                    growth: Math.random() * 20 - 5, // Placeholder
                });
            }
        }
        setLoading(false);
    };

    const stats = [
        {
            label: 'Ingresos Totales',
            value: `${salesData.totalRevenue.toFixed(2)}€`,
            change: salesData.growth,
            icon: Euro,
            color: 'bg-green-500',
        },
        {
            label: 'Pedidos',
            value: salesData.ordersCount.toString(),
            change: 12,
            icon: TrendingUp,
            color: 'bg-blue-500',
        },
        {
            label: 'Ticket Medio',
            value: `${salesData.averageOrder.toFixed(2)}€`,
            change: 5,
            icon: Euro,
            color: 'bg-purple-500',
        },
    ];

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Análisis de Ventas</h1>
                    <p className="text-slate-500 mt-1">Métricas detalladas de tus ingresos</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
                        {(['week', 'month', 'year'] as const).map((range) => (
                            <button
                                key={range}
                                onClick={() => setDateRange(range)}
                                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${dateRange === range
                                        ? 'bg-white text-slate-900 shadow'
                                        : 'text-slate-600 hover:text-slate-900'
                                    }`}
                            >
                                {range === 'week' ? '7 días' : range === 'month' ? '30 días' : '12 meses'}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold transition-colors">
                        <Download size={18} />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Stats */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white border border-slate-200 rounded-2xl p-6"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${stat.color}`}>
                                        <stat.icon size={20} className="text-white" />
                                    </div>
                                    <div className={`flex items-center gap-1 text-sm font-bold ${stat.change >= 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {stat.change >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                                        {Math.abs(stat.change).toFixed(1)}%
                                    </div>
                                </div>
                                <p className="text-3xl font-black text-slate-900 mb-1">{stat.value}</p>
                                <p className="text-sm text-slate-500">{stat.label}</p>
                            </motion.div>
                        ))}
                    </div>

                    {/* Chart placeholder */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Evolución de Ventas</h3>
                        <div className="h-64 flex items-center justify-center bg-slate-50 rounded-xl">
                            <p className="text-slate-400">Gráfico de ventas próximamente</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

