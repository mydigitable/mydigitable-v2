"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Search,
    Filter,
    History,
    Download,
    Calendar,
    Euro,
    User,
    MapPin,
    Clock,
    Loader2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

interface Order {
    id: string;
    order_number: string;
    status: string;
    order_type: string;
    customer_name: string | null;
    total: number;
    created_at: string;
    completed_at: string | null;
}

export default function OrdersHistoryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week');
    const [currentPage, setCurrentPage] = useState(1);
    const ordersPerPage = 20;

    const supabase = createClient();

    useEffect(() => {
        loadOrders();
    }, [dateRange]);

    const loadOrders = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: restaurant } = await supabase
            .from("restaurants")
            .select("id")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: true })
            .limit(1)
            .single();

        if (restaurant) {
            let query = supabase
                .from("orders")
                .select("*")
                .eq("restaurant_id", restaurant.id)
                .in("status", ["completed", "cancelled", "delivered"])
                .order("created_at", { ascending: false });

            // Add date filter
            const now = new Date();
            if (dateRange === 'today') {
                query = query.gte("created_at", new Date(now.setHours(0, 0, 0, 0)).toISOString());
            } else if (dateRange === 'week') {
                const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                query = query.gte("created_at", weekAgo.toISOString());
            } else if (dateRange === 'month') {
                const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                query = query.gte("created_at", monthAgo.toISOString());
            }

            const { data } = await query.limit(100);
            if (data) setOrders(data);
        }
        setLoading(false);
    };

    const filteredOrders = orders.filter(o =>
        o.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.customer_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const paginatedOrders = filteredOrders.slice(
        (currentPage - 1) * ordersPerPage,
        currentPage * ordersPerPage
    );

    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const statusLabels: Record<string, { label: string; color: string }> = {
        completed: { label: 'Completado', color: 'bg-green-100 text-green-700' },
        cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700' },
        delivered: { label: 'Entregado', color: 'bg-blue-100 text-blue-700' },
    };

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Historial de Pedidos</h1>
                    <p className="text-slate-500 mt-1">Consulta todos tus pedidos anteriores</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold transition-colors">
                    <Download size={18} />
                    Exportar
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por número o cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                    />
                </div>
                <div className="flex gap-2">
                    {(['today', 'week', 'month', 'all'] as const).map((range) => (
                        <button
                            key={range}
                            onClick={() => setDateRange(range)}
                            className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${dateRange === range
                                ? 'bg-primary text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                        >
                            {range === 'today' ? 'Hoy' : range === 'week' ? 'Semana' : range === 'month' ? 'Mes' : 'Todo'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : paginatedOrders.length === 0 ? (
                <div className="text-center py-20">
                    <History className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Sin pedidos en el historial</h3>
                    <p className="text-slate-500">Los pedidos completados aparecerán aquí</p>
                </div>
            ) : (
                <>
                    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Pedido</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Cliente</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                    <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {paginatedOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-900">#{order.order_number}</span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {order.customer_name || 'Cliente anónimo'}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">
                                            {order.total?.toFixed(2)}€
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${statusLabels[order.status]?.color || 'bg-slate-100 text-slate-600'}`}>
                                                {statusLabels[order.status]?.label || order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 text-sm">
                                            {formatDate(order.created_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between mt-6">
                            <p className="text-sm text-slate-500">
                                Mostrando {(currentPage - 1) * ordersPerPage + 1} - {Math.min(currentPage * ordersPerPage, filteredOrders.length)} de {filteredOrders.length}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

