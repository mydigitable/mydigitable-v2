"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Users,
    Search,
    Plus,
    Edit3,
    Trash2,
    Loader2,
    X,
    Euro,
    Store,
    TrendingUp,
    Phone,
    Mail,
    Check,
} from "lucide-react";

interface Seller {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    commission_rate: number;
    commission_type: string;
    status: string;
    total_sales: number;
    total_restaurants: number;
    total_revenue: number;
    total_earned: number;
    created_at: string;
}

export default function AdminSellersPage() {
    const [sellers, setSellers] = useState<Seller[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSeller, setEditingSeller] = useState<Seller | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const supabase = createClient();

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        commission_rate: 10,
        commission_type: "first_year",
    });

    useEffect(() => {
        loadSellers();
    }, []);

    const loadSellers = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("sellers")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setSellers(data || []);
        } catch (err) {
            console.error("Error loading sellers:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (seller?: Seller) => {
        if (seller) {
            setEditingSeller(seller);
            setFormData({
                name: seller.name,
                email: seller.email,
                phone: seller.phone || "",
                commission_rate: seller.commission_rate * 100,
                commission_type: seller.commission_type,
            });
        } else {
            setEditingSeller(null);
            setFormData({
                name: "",
                email: "",
                phone: "",
                commission_rate: 10,
                commission_type: "first_year",
            });
        }
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone || null,
                commission_rate: formData.commission_rate / 100,
                commission_type: formData.commission_type,
            };

            if (editingSeller) {
                const { error } = await supabase
                    .from("sellers")
                    .update(payload)
                    .eq("id", editingSeller.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("sellers")
                    .insert(payload);
                if (error) throw error;
            }

            setShowModal(false);
            loadSellers();
        } catch (err) {
            console.error("Error saving seller:", err);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este vendedor?")) return;

        try {
            const { error } = await supabase
                .from("sellers")
                .delete()
                .eq("id", id);
            if (error) throw error;
            loadSellers();
        } catch (err) {
            console.error("Error deleting seller:", err);
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const filteredSellers = sellers.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalEarned = sellers.reduce((sum, s) => sum + (s.total_earned || 0), 0);
    const totalRevenue = sellers.reduce((sum, s) => sum + (s.total_revenue || 0), 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Vendedores</h1>
                    <p className="text-slate-400 mt-1">
                        Gestiona tu equipo comercial
                    </p>
                </div>
                <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors"
                >
                    <Plus size={18} />
                    Nuevo Vendedor
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                            <Users className="text-indigo-400" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{sellers.length}</p>
                            <p className="text-sm text-slate-400">Vendedores</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <Store className="text-blue-400" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">
                                {sellers.reduce((sum, s) => sum + (s.total_restaurants || 0), 0)}
                            </p>
                            <p className="text-sm text-slate-400">Restaurantes captados</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <TrendingUp className="text-emerald-400" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{formatCurrency(totalRevenue)}</p>
                            <p className="text-sm text-slate-400">Ventas totales</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                            <Euro className="text-amber-400" size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{formatCurrency(totalEarned)}</p>
                            <p className="text-sm text-slate-400">Comisiones pagadas</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar vendedor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500"
                />
            </div>

            {/* Sellers Grid */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                </div>
            ) : filteredSellers.length === 0 ? (
                <div className="text-center py-20 bg-slate-800 border border-slate-700 rounded-2xl">
                    <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No hay vendedores</h3>
                    <p className="text-slate-400 mb-6">Añade tu primer vendedor</p>
                    <button
                        onClick={() => handleOpenModal()}
                        className="px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors"
                    >
                        Añadir Vendedor
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSellers.map((seller) => (
                        <motion.div
                            key={seller.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                                        {seller.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold">{seller.name}</h3>
                                        <span className={`
                                            px-2 py-0.5 rounded-lg text-xs font-bold
                                            ${seller.status === "active"
                                                ? "bg-emerald-500/20 text-emerald-400"
                                                : "bg-red-500/20 text-red-400"
                                            }
                                        `}>
                                            {seller.status === "active" ? "Activo" : "Inactivo"}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleOpenModal(seller)}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        <Edit3 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(seller.id)}
                                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex items-center gap-2 text-slate-400">
                                    <Mail size={14} />
                                    <span>{seller.email}</span>
                                </div>
                                {seller.phone && (
                                    <div className="flex items-center gap-2 text-slate-400">
                                        <Phone size={14} />
                                        <span>{seller.phone}</span>
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-4 text-center">
                                <div>
                                    <p className="text-xl font-bold text-white">{seller.total_restaurants || 0}</p>
                                    <p className="text-xs text-slate-400">Restaurantes</p>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-emerald-400">{formatCurrency(seller.total_earned || 0)}</p>
                                    <p className="text-xs text-slate-400">Ganado</p>
                                </div>
                            </div>

                            <div className="mt-4 p-3 bg-slate-700/30 rounded-xl">
                                <p className="text-xs text-slate-400">
                                    Comisión: <span className="text-white font-bold">{(seller.commission_rate * 100).toFixed(0)}%</span>
                                    <span className="text-slate-500"> ({seller.commission_type.replace("_", " ")})</span>
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between p-6 border-b border-slate-700">
                                <h2 className="text-xl font-bold text-white">
                                    {editingSeller ? "Editar Vendedor" : "Nuevo Vendedor"}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 text-slate-400 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">
                                        Nombre *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">
                                        Teléfono
                                    </label>
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">
                                            Comisión (%)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="100"
                                            value={formData.commission_rate}
                                            onChange={(e) => setFormData({ ...formData, commission_rate: Number(e.target.value) })}
                                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-300 mb-2">
                                            Tipo
                                        </label>
                                        <select
                                            value={formData.commission_type}
                                            onChange={(e) => setFormData({ ...formData, commission_type: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50"
                                        >
                                            <option value="first_sale">Primera venta</option>
                                            <option value="first_year">Primer año</option>
                                            <option value="lifetime">De por vida</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors"
                                    >
                                        {editingSeller ? "Guardar" : "Crear"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
