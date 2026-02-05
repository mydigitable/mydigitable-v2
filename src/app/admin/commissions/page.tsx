"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Percent,
    Search,
    Filter,
    Loader2,
    Euro,
    Store,
    ShoppingBag,
    Calendar,
    Check,
    Clock,
    ExternalLink,
} from "lucide-react";

interface Commission {
    id: string;
    restaurant_id: string;
    order_id: string;
    order_total: number;
    commission_rate: number;
    commission_amount: number;
    status: string;
    created_at: string;
    // Joined
    restaurants?: {
        name: string;
        slug: string;
    };
    orders?: {
        order_number: string;
    };
}

type FilterStatus = "all" | "pending" | "collected" | "paid";

export default function AdminCommissionsPage() {
    const [commissions, setCommissions] = useState<Commission[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [dateRange, setDateRange] = useState<"week" | "month" | "year" | "all">("month");
    const supabase = createClient();

    useEffect(() => {
        loadCommissions();
    }, [dateRange]);

    const loadCommissions = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from("platform_commissions")
                .select(`
                    *,
                    restaurants(name, slug),
                    orders(order_number)
                `)
                .order("created_at", { ascending: false });

            // Date filter
            const now = new Date();
            if (dateRange === "week") {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                query = query.gte("created_at", weekAgo.toISOString());
            } else if (dateRange === "month") {
                const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
                query = query.gte("created_at", monthAgo.toISOString());
            } else if (dateRange === "year") {
                const yearStart = new Date(now.getFullYear(), 0, 1);
                query = query.gte("created_at", yearStart.toISOString());
            }

            const { data, error } = await query;

            if (error) throw error;
            setCommissions(data || []);
        } catch (err) {
            console.error("Error loading commissions:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredCommissions = commissions.filter(c => {
        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            if (!c.restaurants?.name.toLowerCase().includes(search) &&
                !c.orders?.order_number?.toLowerCase().includes(search)) {
                return false;
            }
        }

        // Status filter
        if (filterStatus !== "all" && c.status !== filterStatus) return false;

        return true;
    });

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
        }).format(value);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Totals
    const totalAmount = filteredCommissions.reduce((sum, c) => sum + c.commission_amount, 0);
    const pendingAmount = filteredCommissions
        .filter(c => c.status === "pending")
        .reduce((sum, c) => sum + c.commission_amount, 0);
    const collectedAmount = filteredCommissions
        .filter(c => c.status === "collected" || c.status === "paid")
        .reduce((sum, c) => sum + c.commission_amount, 0);

    const getStatusBadge = (status: string) => {
        const config = {
            pending: { bg: "bg-amber-500/20", text: "text-amber-400", icon: Clock, label: "Pendiente" },
            collected: { bg: "bg-blue-500/20", text: "text-blue-400", icon: Check, label: "Cobrada" },
            paid: { bg: "bg-emerald-500/20", text: "text-emerald-400", icon: Check, label: "Pagada" },
        };
        const c = config[status as keyof typeof config] || config.pending;
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
                <h1 className="text-2xl font-bold text-white">Comisiones</h1>
                <p className="text-slate-400 mt-1">
                    Comisiones del 15% de restaurantes en plan Starter
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                            <Euro className="text-indigo-400" size={28} />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{formatCurrency(totalAmount)}</p>
                            <p className="text-slate-400">Total comisiones</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center">
                            <Clock className="text-amber-400" size={28} />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{formatCurrency(pendingAmount)}</p>
                            <p className="text-slate-400">Por cobrar</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                            <Check className="text-emerald-400" size={28} />
                        </div>
                        <div>
                            <p className="text-3xl font-bold text-white">{formatCurrency(collectedAmount)}</p>
                            <p className="text-slate-400">Cobradas</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por restaurante o pedido..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                    />
                </div>

                {/* Status Filter */}
                <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/50"
                >
                    <option value="all">Todos los estados</option>
                    <option value="pending">Pendientes</option>
                    <option value="collected">Cobradas</option>
                    <option value="paid">Pagadas</option>
                </select>

                {/* Date Range */}
                <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value as typeof dateRange)}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/50"
                >
                    <option value="week">Esta semana</option>
                    <option value="month">Este mes</option>
                    <option value="year">Este año</option>
                    <option value="all">Todo el tiempo</option>
                </select>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : filteredCommissions.length === 0 ? (
                <div className="text-center py-20 bg-slate-800 border border-slate-700 rounded-2xl">
                    <Percent className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No hay comisiones</h3>
                    <p className="text-slate-400">
                        Las comisiones aparecerán cuando los restaurantes Starter reciban pedidos
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
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase">
                                        Pedido
                                    </th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 uppercase">
                                        Total Pedido
                                    </th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 uppercase">
                                        Comisión (15%)
                                    </th>
                                    <th className="text-center px-6 py-4 text-xs font-bold text-slate-400 uppercase">
                                        Estado
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase">
                                        Fecha
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {filteredCommissions.map((commission) => (
                                    <motion.tr
                                        key={commission.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-700/20 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                                                    {commission.restaurants?.name?.charAt(0) || "?"}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">
                                                        {commission.restaurants?.name || "—"}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        /{commission.restaurants?.slug}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-300">
                                                <ShoppingBag size={14} />
                                                #{commission.orders?.order_number || commission.order_id.slice(0, 8)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-slate-300">{formatCurrency(commission.order_total)}</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-emerald-400 font-bold">
                                                {formatCurrency(commission.commission_amount)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {getStatusBadge(commission.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <Calendar size={14} />
                                                {formatDate(commission.created_at)}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Table Footer */}
                    <div className="px-6 py-4 bg-slate-700/20 border-t border-slate-700 flex items-center justify-between">
                        <p className="text-sm text-slate-400">
                            {filteredCommissions.length} comisiones
                        </p>
                        <p className="text-sm text-slate-300">
                            Total: <span className="text-emerald-400 font-bold">{formatCurrency(totalAmount)}</span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
