"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    TrendingUp,
    TrendingDown,
    Store,
    Euro,
    Users,
    Percent,
    ArrowUpRight,
    ArrowDownRight,
    CreditCard,
    UserPlus,
    Loader2,
    RefreshCw,
} from "lucide-react";

interface DashboardMetrics {
    // Restaurantes
    totalRestaurants: number;
    activeRestaurants: number;
    newThisMonth: number;
    churnedThisMonth: number;

    // Por plan
    starterCount: number;
    basicCount: number;
    proCount: number;

    // Ingresos
    mrr: number;
    arr: number;
    subscriptionRevenue: number;
    commissionRevenue: number;

    // Cambios vs mes anterior
    mrrChange: number;
    restaurantChange: number;
}

interface RecentRestaurant {
    id: string;
    name: string;
    slug: string;
    subscription_plan: string;
    created_at: string;
    owner_email?: string;
}

export default function AdminDashboardPage() {
    const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
    const [recentRestaurants, setRecentRestaurants] = useState<RecentRestaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        setLoading(true);
        try {
            // Cargar restaurantes
            const { data: restaurants, error: restError } = await supabase
                .from("restaurants")
                .select("id, name, slug, subscription_plan, created_at, is_active, cancelled_at");

            if (restError) throw restError;

            const allRestaurants = restaurants || [];
            const activeRestaurants = allRestaurants.filter(r => r.is_active && !r.cancelled_at);

            // Calcular por plan
            const starterCount = activeRestaurants.filter(r =>
                r.subscription_plan === "starter" || !r.subscription_plan
            ).length;
            const basicCount = activeRestaurants.filter(r => r.subscription_plan === "basic").length;
            const proCount = activeRestaurants.filter(r => r.subscription_plan === "pro").length;

            // Nuevos este mes
            const thisMonth = new Date();
            thisMonth.setDate(1);
            thisMonth.setHours(0, 0, 0, 0);

            const newThisMonth = allRestaurants.filter(r =>
                new Date(r.created_at) >= thisMonth
            ).length;

            const churnedThisMonth = allRestaurants.filter(r =>
                r.cancelled_at && new Date(r.cancelled_at) >= thisMonth
            ).length;

            // Calcular MRR (40€ Basic + 90€ Pro)
            const mrr = (basicCount * 40) + (proCount * 90);
            const arr = mrr * 12;

            // Cargar comisiones del mes
            const { data: commissions } = await supabase
                .from("platform_commissions")
                .select("commission_amount")
                .gte("created_at", thisMonth.toISOString());

            const commissionRevenue = commissions?.reduce((sum, c) => sum + (c.commission_amount || 0), 0) || 0;

            // Cargar pagos de suscripciones del mes
            const { data: payments } = await supabase
                .from("subscription_payments")
                .select("amount")
                .eq("status", "succeeded")
                .gte("created_at", thisMonth.toISOString());

            const subscriptionRevenue = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0;

            setMetrics({
                totalRestaurants: allRestaurants.length,
                activeRestaurants: activeRestaurants.length,
                newThisMonth,
                churnedThisMonth,
                starterCount,
                basicCount,
                proCount,
                mrr,
                arr,
                subscriptionRevenue,
                commissionRevenue,
                mrrChange: 15.2, // TODO: Calcular vs mes anterior
                restaurantChange: newThisMonth - churnedThisMonth,
            });

            // Restaurantes recientes
            const recentRest = allRestaurants
                .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                .slice(0, 5);

            setRecentRestaurants(recentRest);

        } catch (err) {
            console.error("Error loading dashboard:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                    <p className="text-slate-400 mt-1">Resumen de la plataforma MyDigitable</p>
                </div>
                <button
                    onClick={loadDashboardData}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg transition-colors"
                >
                    <RefreshCw size={16} />
                    Actualizar
                </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* MRR */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                            <Euro className="text-indigo-400" size={24} />
                        </div>
                        {metrics?.mrrChange && metrics.mrrChange > 0 ? (
                            <div className="flex items-center gap-1 text-emerald-400 text-sm">
                                <ArrowUpRight size={16} />
                                +{metrics.mrrChange}%
                            </div>
                        ) : (
                            <div className="flex items-center gap-1 text-red-400 text-sm">
                                <ArrowDownRight size={16} />
                                {metrics?.mrrChange}%
                            </div>
                        )}
                    </div>
                    <p className="text-3xl font-bold text-white">{formatCurrency(metrics?.mrr || 0)}</p>
                    <p className="text-slate-400 text-sm mt-1">MRR (Ingresos Recurrentes)</p>
                </motion.div>

                {/* ARR */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                            <TrendingUp className="text-emerald-400" size={24} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{formatCurrency(metrics?.arr || 0)}</p>
                    <p className="text-slate-400 text-sm mt-1">ARR (Anual Proyectado)</p>
                </motion.div>

                {/* Total Restaurants */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                            <Store className="text-blue-400" size={24} />
                        </div>
                        {(metrics?.restaurantChange || 0) > 0 && (
                            <div className="flex items-center gap-1 text-emerald-400 text-sm">
                                <UserPlus size={16} />
                                +{metrics?.newThisMonth}
                            </div>
                        )}
                    </div>
                    <p className="text-3xl font-bold text-white">{metrics?.activeRestaurants || 0}</p>
                    <p className="text-slate-400 text-sm mt-1">Restaurantes activos</p>
                </motion.div>

                {/* Comisiones */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
                            <Percent className="text-amber-400" size={24} />
                        </div>
                    </div>
                    <p className="text-3xl font-bold text-white">{formatCurrency(metrics?.commissionRevenue || 0)}</p>
                    <p className="text-slate-400 text-sm mt-1">Comisiones este mes</p>
                </motion.div>
            </div>

            {/* Distribution by Plan */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Plans breakdown */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
                >
                    <h2 className="text-lg font-bold text-white mb-6">Distribución por Plan</h2>
                    <div className="space-y-4">
                        {/* Starter */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-300">Starter (Gratis)</span>
                                <span className="text-white font-bold">{metrics?.starterCount || 0}</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-slate-500 rounded-full"
                                    style={{
                                        width: `${((metrics?.starterCount || 0) / Math.max(metrics?.activeRestaurants || 1, 1)) * 100}%`
                                    }}
                                />
                            </div>
                        </div>

                        {/* Basic */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-300">Basic (40€/mes)</span>
                                <span className="text-white font-bold">{metrics?.basicCount || 0}</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-blue-500 rounded-full"
                                    style={{
                                        width: `${((metrics?.basicCount || 0) / Math.max(metrics?.activeRestaurants || 1, 1)) * 100}%`
                                    }}
                                />
                            </div>
                        </div>

                        {/* Pro */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-300">Pro (90€/mes)</span>
                                <span className="text-white font-bold">{metrics?.proCount || 0}</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-indigo-500 rounded-full"
                                    style={{
                                        width: `${((metrics?.proCount || 0) / Math.max(metrics?.activeRestaurants || 1, 1)) * 100}%`
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-6 border-t border-slate-700 grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-bold text-slate-400">{metrics?.starterCount || 0}</p>
                            <p className="text-xs text-slate-500">Starter</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-blue-400">{metrics?.basicCount || 0}</p>
                            <p className="text-xs text-slate-500">Basic</p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-indigo-400">{metrics?.proCount || 0}</p>
                            <p className="text-xs text-slate-500">Pro</p>
                        </div>
                    </div>
                </motion.div>

                {/* Recent Restaurants */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
                >
                    <h2 className="text-lg font-bold text-white mb-6">Restaurantes Recientes</h2>

                    {recentRestaurants.length === 0 ? (
                        <div className="text-center py-8 text-slate-400">
                            <Store size={48} className="mx-auto mb-4 opacity-50" />
                            <p>No hay restaurantes aún</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {recentRestaurants.map((restaurant) => (
                                <div
                                    key={restaurant.id}
                                    className="flex items-center justify-between p-3 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                            {restaurant.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">{restaurant.name}</p>
                                            <p className="text-xs text-slate-400">/{restaurant.slug}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`
                                            px-2 py-1 rounded-lg text-xs font-bold capitalize
                                            ${restaurant.subscription_plan === "pro"
                                                ? "bg-indigo-500/20 text-indigo-400"
                                                : restaurant.subscription_plan === "basic"
                                                    ? "bg-blue-500/20 text-blue-400"
                                                    : "bg-slate-600/50 text-slate-400"
                                            }
                                        `}>
                                            {restaurant.subscription_plan || "Starter"}
                                        </span>
                                        <p className="text-xs text-slate-500 mt-1">{formatDate(restaurant.created_at)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-emerald-400">{metrics?.newThisMonth || 0}</p>
                    <p className="text-sm text-slate-400">Nuevos este mes</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-red-400">{metrics?.churnedThisMonth || 0}</p>
                    <p className="text-sm text-slate-400">Bajas este mes</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-blue-400">{formatCurrency(metrics?.subscriptionRevenue || 0)}</p>
                    <p className="text-sm text-slate-400">Suscripciones cobradas</p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-amber-400">{formatCurrency(metrics?.commissionRevenue || 0)}</p>
                    <p className="text-sm text-slate-400">Comisiones (15%)</p>
                </div>
            </div>
        </div>
    );
}
