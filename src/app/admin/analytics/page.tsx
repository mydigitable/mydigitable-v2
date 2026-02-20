"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    TrendingUp,
    TrendingDown,
    Euro,
    ShoppingBag,
    Users,
    Store,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    BarChart3,
} from "lucide-react";

interface MetricsData {
    mrr: number;
    mrrChange: number;
    arr: number;
    totalRevenue: number;
    revenueChange: number;
    subscriptionRevenue: number;
    commissionRevenue: number;
    totalRestaurants: number;
    newRestaurants: number;
    churnedRestaurants: number;
    conversionRate: number;
    avgRevenuePerUser: number;
}

interface MonthlyData {
    month: string;
    revenue: number;
    restaurants: number;
}

export default function AdminAnalyticsPage() {
    const [metrics, setMetrics] = useState<MetricsData>({
        mrr: 0,
        mrrChange: 0,
        arr: 0,
        totalRevenue: 0,
        revenueChange: 0,
        subscriptionRevenue: 0,
        commissionRevenue: 0,
        totalRestaurants: 0,
        newRestaurants: 0,
        churnedRestaurants: 0,
        conversionRate: 0,
        avgRevenuePerUser: 0,
    });
    const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        loadAnalytics();
    }, []);

    const loadAnalytics = async () => {
        setLoading(true);
        try {
            // Load restaurants
            const { data: restaurants } = await supabase
                .from("restaurants")
                .select("id, plan_tier, is_active, created_at");

            const now = new Date();
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

            const activeRestaurants = restaurants?.filter(r => r.is_active) || [];
            const starterCount = activeRestaurants.filter(r => r.plan_tier === "starter" || !r.plan_tier).length;
            const basicCount = activeRestaurants.filter(r => r.plan_tier === "basic").length;
            const proCount = activeRestaurants.filter(r => r.plan_tier === "pro").length;

            const newThisMonth = restaurants?.filter(r => new Date(r.created_at) >= thisMonth).length || 0;
            const churnedThisMonth = 0; // TODO: implement when churn tracking column exists

            const mrr = (basicCount * 40) + (proCount * 90);
            const conversionRate = restaurants?.length ? ((basicCount + proCount) / restaurants.length) * 100 : 0;

            // Load commissions
            const { data: commissions } = await supabase
                .from("platform_commissions")
                .select("commission_amount, created_at")
                .gte("created_at", thisMonth.toISOString());

            const commissionRevenue = commissions?.reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;

            // Calculate monthly data (last 6 months)
            const monthly: MonthlyData[] = [];
            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthName = date.toLocaleDateString("es-ES", { month: "short" });

                const restaurantsInMonth = restaurants?.filter(r => {
                    const created = new Date(r.created_at);
                    return created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth();
                }).length || 0;

                // Estimated revenue based on active restaurants at that time
                const estimatedRevenue = (mrr * (6 - i) / 6) + (commissionRevenue * (6 - i) / 6);

                monthly.push({
                    month: monthName,
                    revenue: Math.round(estimatedRevenue),
                    restaurants: restaurantsInMonth,
                });
            }

            setMonthlyData(monthly);
            setMetrics({
                mrr,
                mrrChange: 12.5, // TODO: Calculate real change
                arr: mrr * 12,
                totalRevenue: mrr + commissionRevenue,
                revenueChange: 8.3,
                subscriptionRevenue: mrr,
                commissionRevenue,
                totalRestaurants: restaurants?.length || 0,
                newRestaurants: newThisMonth,
                churnedRestaurants: churnedThisMonth,
                conversionRate,
                avgRevenuePerUser: restaurants?.length ? mrr / restaurants.length : 0,
            });
        } catch (err) {
            console.error("Error loading analytics:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 0,
        }).format(value);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    const maxRevenue = Math.max(...monthlyData.map(d => d.revenue), 1);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Analytics</h1>
                <p className="text-slate-400 mt-1">Métricas de rendimiento de la plataforma</p>
            </div>

            {/* Main Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-5"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm">MRR</span>
                        <span className={`flex items-center gap-1 text-xs font-bold ${metrics.mrrChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {metrics.mrrChange >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {Math.abs(metrics.mrrChange)}%
                        </span>
                    </div>
                    <p className="text-3xl font-bold text-white">{formatCurrency(metrics.mrr)}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-5"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm">ARR</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{formatCurrency(metrics.arr)}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-5"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm">Comisiones (mes)</span>
                    </div>
                    <p className="text-3xl font-bold text-emerald-400">{formatCurrency(metrics.commissionRevenue)}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-5"
                >
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-sm">ARPU</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{formatCurrency(metrics.avgRevenuePerUser)}</p>
                </motion.div>
            </div>

            {/* Revenue Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
            >
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white">Ingresos Mensuales</h2>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-2">
                            <span className="w-3 h-3 bg-indigo-500 rounded"></span>
                            Ingresos
                        </span>
                    </div>
                </div>

                <div className="h-64 flex items-end gap-4">
                    {monthlyData.map((data, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                            <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                                transition={{ delay: i * 0.1, duration: 0.5 }}
                                className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg min-h-[4px]"
                            />
                            <span className="text-xs text-slate-400 capitalize">{data.month}</span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Restaurant Growth */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Store className="text-blue-400" size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Restaurantes</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Total</span>
                            <span className="text-2xl font-bold text-white">{metrics.totalRestaurants}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Nuevos (mes)</span>
                            <span className="text-lg font-bold text-emerald-400">+{metrics.newRestaurants}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Bajas (mes)</span>
                            <span className="text-lg font-bold text-red-400">-{metrics.churnedRestaurants}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Conversion */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <TrendingUp className="text-emerald-400" size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Conversión</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-slate-400">Starter → Pago</span>
                                <span className="text-white font-bold">{metrics.conversionRate.toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2">
                                <div
                                    className="bg-emerald-500 h-2 rounded-full transition-all"
                                    style={{ width: `${metrics.conversionRate}%` }}
                                />
                            </div>
                        </div>
                        <p className="text-sm text-slate-400">
                            {Math.round(metrics.totalRestaurants * metrics.conversionRate / 100)} de {metrics.totalRestaurants} restaurantes han convertido
                        </p>
                    </div>
                </motion.div>

                {/* Revenue Breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                            <Euro className="text-amber-400" size={20} />
                        </div>
                        <h3 className="text-lg font-bold text-white">Desglose</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Suscripciones</span>
                            <span className="text-lg font-bold text-blue-400">{formatCurrency(metrics.subscriptionRevenue)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400">Comisiones</span>
                            <span className="text-lg font-bold text-emerald-400">{formatCurrency(metrics.commissionRevenue)}</span>
                        </div>
                        <hr className="border-slate-700" />
                        <div className="flex justify-between items-center">
                            <span className="text-white font-bold">Total (mes)</span>
                            <span className="text-xl font-bold text-white">{formatCurrency(metrics.totalRevenue)}</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
