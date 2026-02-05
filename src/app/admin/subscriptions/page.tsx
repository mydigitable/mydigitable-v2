"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    CreditCard,
    Search,
    Loader2,
    Euro,
    Calendar,
    Check,
    X,
    Clock,
    TrendingUp,
    ArrowUpRight,
    Store,
    Filter,
} from "lucide-react";

interface Subscription {
    id: string;
    restaurant_id: string;
    plan: string;
    status: string;
    billing_cycle: string | null;
    current_period_start: string | null;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    created_at: string;
    // Joined
    restaurants?: {
        name: string;
        slug: string;
        email: string | null;
    };
}

export default function AdminSubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterPlan, setFilterPlan] = useState<"all" | "starter" | "basic" | "pro">("all");
    const [filterStatus, setFilterStatus] = useState<"all" | "active" | "cancelled" | "past_due">("all");
    const supabase = createClient();

    useEffect(() => {
        loadSubscriptions();
    }, []);

    const loadSubscriptions = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("subscriptions")
                .select(`
                    *,
                    restaurants(name, slug, email)
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setSubscriptions(data || []);
        } catch (err) {
            console.error("Error loading subscriptions:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredSubscriptions = subscriptions.filter(s => {
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            if (!s.restaurants?.name.toLowerCase().includes(search) &&
                !s.restaurants?.slug.toLowerCase().includes(search)) {
                return false;
            }
        }
        if (filterPlan !== "all" && s.plan !== filterPlan) return false;
        if (filterStatus !== "all" && s.status !== filterStatus) return false;
        return true;
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getPlanPrice = (plan: string, cycle: string | null) => {
        const prices = {
            starter: { monthly: 0, yearly: 0 },
            basic: { monthly: 40, yearly: 384 },
            pro: { monthly: 90, yearly: 864 },
        };
        const p = prices[plan as keyof typeof prices] || prices.starter;
        return cycle === "yearly" ? p.yearly : p.monthly;
    };

    // Stats
    const activeCount = subscriptions.filter(s => s.status === "active").length;
    const starterCount = subscriptions.filter(s => s.plan === "starter").length;
    const basicCount = subscriptions.filter(s => s.plan === "basic").length;
    const proCount = subscriptions.filter(s => s.plan === "pro").length;
    const mrr = (basicCount * 40) + (proCount * 90);

    const getPlanBadge = (plan: string) => {
        const config = {
            starter: { bg: "bg-slate-600/50", text: "text-slate-300", label: "Starter" },
            basic: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Basic" },
            pro: { bg: "bg-indigo-500/20", text: "text-indigo-400", label: "Pro" },
        };
        const c = config[plan as keyof typeof config] || config.starter;
        return (
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${c.bg} ${c.text}`}>
                {c.label}
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        const config = {
            active: { bg: "bg-emerald-500/20", text: "text-emerald-400", icon: Check, label: "Activa" },
            trialing: { bg: "bg-blue-500/20", text: "text-blue-400", icon: Clock, label: "Trial" },
            past_due: { bg: "bg-amber-500/20", text: "text-amber-400", icon: Clock, label: "Vencida" },
            cancelled: { bg: "bg-red-500/20", text: "text-red-400", icon: X, label: "Cancelada" },
            paused: { bg: "bg-slate-500/20", text: "text-slate-400", icon: Clock, label: "Pausada" },
        };
        const c = config[status as keyof typeof config] || config.active;
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${c.bg} ${c.text}`}>
                <c.icon size={12} />
                {c.label}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">Suscripciones</h1>
                <p className="text-slate-400 mt-1">
                    Gestiona las suscripciones de los restaurantes
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-xl p-4">
                    <p className="text-2xl font-bold text-white">{formatCurrency(mrr)}</p>
                    <p className="text-sm text-slate-400">MRR</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
                    <p className="text-sm text-slate-400">Activas</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <p className="text-2xl font-bold text-slate-400">{starterCount}</p>
                    <p className="text-sm text-slate-400">Starter</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <p className="text-2xl font-bold text-blue-400">{basicCount}</p>
                    <p className="text-sm text-slate-400">Basic</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <p className="text-2xl font-bold text-indigo-400">{proCount}</p>
                    <p className="text-sm text-slate-400">Pro</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar restaurante..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/50"
                    />
                </div>

                <select
                    value={filterPlan}
                    onChange={(e) => setFilterPlan(e.target.value as typeof filterPlan)}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/50"
                >
                    <option value="all">Todos los planes</option>
                    <option value="starter">Starter</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                </select>

                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as typeof filterStatus)}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/50"
                >
                    <option value="all">Todos los estados</option>
                    <option value="active">Activas</option>
                    <option value="cancelled">Canceladas</option>
                    <option value="past_due">Vencidas</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : filteredSubscriptions.length === 0 ? (
                <div className="text-center py-20 bg-slate-800 border border-slate-700 rounded-2xl">
                    <CreditCard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No hay suscripciones</h3>
                    <p className="text-slate-400">
                        Las suscripciones se crean automáticamente al registrar restaurantes
                    </p>
                </div>
            ) : (
                <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-700/30 border-b border-slate-700">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase">
                                        Restaurante
                                    </th>
                                    <th className="text-center px-6 py-4 text-xs font-bold text-slate-400 uppercase">
                                        Plan
                                    </th>
                                    <th className="text-center px-6 py-4 text-xs font-bold text-slate-400 uppercase">
                                        Ciclo
                                    </th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 uppercase">
                                        Precio
                                    </th>
                                    <th className="text-center px-6 py-4 text-xs font-bold text-slate-400 uppercase">
                                        Estado
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase">
                                        Renovación
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {filteredSubscriptions.map((subscription) => (
                                    <motion.tr
                                        key={subscription.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-700/20 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                                    {subscription.restaurants?.name?.charAt(0) || "?"}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {subscription.restaurants?.name || "—"}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        /{subscription.restaurants?.slug}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getPlanBadge(subscription.plan)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-slate-300 text-sm capitalize">
                                                {subscription.billing_cycle === "yearly" ? "Anual" :
                                                    subscription.billing_cycle === "monthly" ? "Mensual" : "—"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-white font-bold">
                                                {formatCurrency(getPlanPrice(subscription.plan, subscription.billing_cycle))}
                                            </span>
                                            {subscription.billing_cycle && (
                                                <span className="text-slate-400 text-xs">
                                                    /{subscription.billing_cycle === "yearly" ? "año" : "mes"}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(subscription.status)}
                                            {subscription.cancel_at_period_end && (
                                                <p className="text-xs text-red-400 mt-1">Cancela al finalizar</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            {subscription.current_period_end ? (
                                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                    <Calendar size={14} />
                                                    {formatDate(subscription.current_period_end)}
                                                </div>
                                            ) : (
                                                <span className="text-slate-500">—</span>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="px-6 py-4 bg-slate-700/20 border-t border-slate-700 flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                            {filteredSubscriptions.length} suscripciones
                        </p>
                        <p className="text-sm text-slate-300">
                            MRR: <span className="text-emerald-400 font-bold">{formatCurrency(mrr)}</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
