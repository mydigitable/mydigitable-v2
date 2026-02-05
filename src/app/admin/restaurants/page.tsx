"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
    Store,
    Search,
    Filter,
    ChevronDown,
    Eye,
    Edit3,
    ExternalLink,
    Loader2,
    Plus,
    MoreHorizontal,
    Mail,
    Calendar,
    CreditCard,
    TrendingUp,
} from "lucide-react";

interface Restaurant {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    subscription_plan: string;
    is_active: boolean;
    created_at: string;
    owner_id: string;
    // Joined data
    subscriptions?: {
        status: string;
        plan: string;
    }[];
    orders_count?: number;
}

type FilterStatus = "all" | "active" | "inactive" | "cancelled";
type FilterPlan = "all" | "starter" | "basic" | "pro";

export default function AdminRestaurantsPage() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
    const [filterPlan, setFilterPlan] = useState<FilterPlan>("all");
    const supabase = createClient();

    useEffect(() => {
        loadRestaurants();
    }, []);

    const loadRestaurants = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("restaurants")
                .select(`
                    *,
                    subscriptions(status, plan)
                `)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setRestaurants(data || []);
        } catch (err) {
            console.error("Error loading restaurants:", err);
        } finally {
            setLoading(false);
        }
    };

    const filteredRestaurants = restaurants.filter(r => {
        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            if (!r.name.toLowerCase().includes(search) &&
                !r.slug.toLowerCase().includes(search) &&
                !r.email?.toLowerCase().includes(search)) {
                return false;
            }
        }

        // Status filter
        if (filterStatus === "active" && !r.is_active) return false;
        if (filterStatus === "inactive" && r.is_active) return false;

        // Plan filter
        const plan = r.subscription_plan || "starter";
        if (filterPlan !== "all" && plan !== filterPlan) return false;

        return true;
    });

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const getPlanBadge = (plan: string | null) => {
        const p = plan || "starter";
        const config = {
            starter: { bg: "bg-slate-600/50", text: "text-slate-300", label: "Starter" },
            basic: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Basic" },
            pro: { bg: "bg-indigo-500/20", text: "text-indigo-400", label: "Pro" },
        };
        const c = config[p as keyof typeof config] || config.starter;
        return (
            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${c.bg} ${c.text}`}>
                {c.label}
            </span>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Restaurantes</h1>
                    <p className="text-slate-400 mt-1">
                        {restaurants.length} restaurantes en total
                    </p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors">
                    <Plus size={18} />
                    Añadir Manual
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, slug o email..."
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
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                </select>

                {/* Plan Filter */}
                <select
                    value={filterPlan}
                    onChange={(e) => setFilterPlan(e.target.value as FilterPlan)}
                    className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white appearance-none cursor-pointer focus:ring-2 focus:ring-indigo-500/50"
                >
                    <option value="all">Todos los planes</option>
                    <option value="starter">Starter</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                </select>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <p className="text-2xl font-bold text-white">{restaurants.length}</p>
                    <p className="text-sm text-slate-400">Total</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <p className="text-2xl font-bold text-emerald-400">
                        {restaurants.filter(r => r.is_active).length}
                    </p>
                    <p className="text-sm text-slate-400">Activos</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <p className="text-2xl font-bold text-blue-400">
                        {restaurants.filter(r => r.subscription_plan === "basic").length}
                    </p>
                    <p className="text-sm text-slate-400">Plan Basic</p>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <p className="text-2xl font-bold text-indigo-400">
                        {restaurants.filter(r => r.subscription_plan === "pro").length}
                    </p>
                    <p className="text-sm text-slate-400">Plan Pro</p>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : filteredRestaurants.length === 0 ? (
                <div className="text-center py-20 bg-slate-800 border border-slate-700 rounded-2xl">
                    <Store className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No hay restaurantes</h3>
                    <p className="text-slate-400">
                        {searchTerm || filterStatus !== "all" || filterPlan !== "all"
                            ? "No se encontraron resultados con los filtros aplicados"
                            : "Aún no hay restaurantes registrados"}
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
                                        Plan
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase">
                                        Estado
                                    </th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-400 uppercase">
                                        Registro
                                    </th>
                                    <th className="text-right px-6 py-4 text-xs font-bold text-slate-400 uppercase">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {filteredRestaurants.map((restaurant) => (
                                    <motion.tr
                                        key={restaurant.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="hover:bg-slate-700/20 transition-colors"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                                    {restaurant.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{restaurant.name}</p>
                                                    <p className="text-sm text-slate-400">/{restaurant.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getPlanBadge(restaurant.subscription_plan)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`
                                                px-2 py-1 rounded-lg text-xs font-bold
                                                ${restaurant.is_active
                                                    ? "bg-emerald-500/20 text-emerald-400"
                                                    : "bg-red-500/20 text-red-400"
                                                }
                                            `}>
                                                {restaurant.is_active ? "Activo" : "Inactivo"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Calendar size={14} />
                                                <span className="text-sm">{formatDate(restaurant.created_at)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link
                                                    href={`/r/${restaurant.slug}`}
                                                    target="_blank"
                                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                                    title="Ver menú"
                                                >
                                                    <ExternalLink size={16} />
                                                </Link>
                                                <Link
                                                    href={`/admin/restaurants/${restaurant.id}`}
                                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                                    title="Ver detalles"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <button
                                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                                    title="Más opciones"
                                                >
                                                    <MoreHorizontal size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
