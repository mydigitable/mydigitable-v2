"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Users,
    Search,
    Filter,
    Plus,
    Eye,
    Mail,
    Phone,
    ShoppingBag,
    Euro,
    Award,
    Calendar,
    ChevronDown,
    Loader2,
    Star,
    X,
    User,
} from "lucide-react";

interface Customer {
    id: string;
    name: string | null;
    email: string | null;
    phone: string | null;
    total_orders: number;
    total_spent: number;
    loyalty_points: number;
    loyalty_tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    first_order_at: string | null;
    last_order_at: string | null;
    created_at: string;
}

const tierColors = {
    bronze: { bg: 'bg-amber-100', text: 'text-amber-700', icon: '🥉' },
    silver: { bg: 'bg-slate-200', text: 'text-slate-700', icon: '🥈' },
    gold: { bg: 'bg-amber-400', text: 'text-amber-900', icon: '🥇' },
    platinum: { bg: 'bg-purple-100', text: 'text-purple-700', icon: '💎' },
};

export default function CustomersPage() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTier, setSelectedTier] = useState<string>('');
    const [sortBy, setSortBy] = useState<'recent' | 'top_spenders' | 'most_orders'>('recent');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [restaurant, setRestaurant] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        loadCustomers();
    }, [sortBy]);

    const loadCustomers = async () => {
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

            let query = supabase
                .from("customers")
                .select("*")
                .eq("restaurant_id", restaurantData.id);

            // Apply sorting
            switch (sortBy) {
                case 'top_spenders':
                    query = query.order('total_spent', { ascending: false });
                    break;
                case 'most_orders':
                    query = query.order('total_orders', { ascending: false });
                    break;
                default:
                    query = query.order('last_order_at', { ascending: false, nullsFirst: false });
            }

            const { data: customersData } = await query.limit(100);
            setCustomers(customersData || []);
        } catch (err) {
            console.error("Error loading customers:", err);
        } finally {
            setLoading(false);
        }
    };

    // Stats
    const totalCustomers = customers.length;
    const totalSpent = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const avgOrderValue = customers.reduce((sum, c) => sum + (c.total_orders || 0), 0) > 0
        ? totalSpent / customers.reduce((sum, c) => sum + (c.total_orders || 0), 0)
        : 0;
    const repeatCustomers = customers.filter(c => c.total_orders > 1).length;

    // Filter customers
    const filteredCustomers = customers.filter(customer => {
        if (selectedTier && customer.loyalty_tier !== selectedTier) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                customer.name?.toLowerCase().includes(query) ||
                customer.email?.toLowerCase().includes(query) ||
                customer.phone?.includes(query)
            );
        }
        return true;
    });

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
                    <h1 className="text-2xl font-black text-slate-900">Clientes</h1>
                    <p className="text-sm text-slate-500">
                        Base de datos de clientes y programa de fidelización
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Users size={20} className="text-blue-600" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Total Clientes</p>
                    <p className="text-2xl font-black text-slate-900">{totalCustomers}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Euro size={20} className="text-primary" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Total Facturado</p>
                    <p className="text-2xl font-black text-slate-900">€{totalSpent.toLocaleString()}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <ShoppingBag size={20} className="text-purple-600" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Ticket Medio</p>
                    <p className="text-2xl font-black text-slate-900">€{avgOrderValue.toFixed(2)}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                            <Award size={20} className="text-amber-600" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Clientes Recurrentes</p>
                    <p className="text-2xl font-black text-slate-900">{repeatCustomers}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email o teléfono..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Tier Filter */}
                    <div className="relative">
                        <select
                            value={selectedTier}
                            onChange={(e) => setSelectedTier(e.target.value)}
                            className="appearance-none px-4 py-3 pr-10 bg-slate-50 border-0 rounded-xl text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[160px]"
                        >
                            <option value="">Todos los niveles</option>
                            <option value="bronze">🥉 Bronce</option>
                            <option value="silver">🥈 Plata</option>
                            <option value="gold">🥇 Oro</option>
                            <option value="platinum">💎 Platino</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Sort */}
                    <div className="relative">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as any)}
                            className="appearance-none px-4 py-3 pr-10 bg-slate-50 border-0 rounded-xl text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[160px]"
                        >
                            <option value="recent">Más recientes</option>
                            <option value="top_spenders">Mayor gasto</option>
                            <option value="most_orders">Más pedidos</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Customers List */}
            {customers.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Users size={28} className="text-slate-300" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Sin clientes aún</h2>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Los clientes aparecerán aquí cuando realicen pedidos en tu restaurante
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Cliente</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Contacto</th>
                                <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase">Pedidos</th>
                                <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase">Total Gastado</th>
                                <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase">Nivel</th>
                                <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase">Último Pedido</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredCustomers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                                <span className="font-bold text-primary">
                                                    {customer.name?.charAt(0) || customer.email?.charAt(0) || '?'}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900">
                                                    {customer.name || 'Cliente Anónimo'}
                                                </p>
                                                {customer.loyalty_points > 0 && (
                                                    <p className="text-xs text-amber-600 flex items-center gap-1">
                                                        <Star size={10} className="fill-amber-400" />
                                                        {customer.loyalty_points} puntos
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            {customer.email && (
                                                <p className="text-sm text-slate-600 flex items-center gap-1.5">
                                                    <Mail size={12} className="text-slate-400" />
                                                    {customer.email}
                                                </p>
                                            )}
                                            {customer.phone && (
                                                <p className="text-sm text-slate-600 flex items-center gap-1.5">
                                                    <Phone size={12} className="text-slate-400" />
                                                    {customer.phone}
                                                </p>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-bold text-slate-900">{customer.total_orders}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="font-bold text-slate-900">
                                            €{customer.total_spent?.toFixed(2) || '0.00'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${tierColors[customer.loyalty_tier].bg
                                            } ${tierColors[customer.loyalty_tier].text}`}>
                                            {tierColors[customer.loyalty_tier].icon}
                                            {customer.loyalty_tier.charAt(0).toUpperCase() + customer.loyalty_tier.slice(1)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-sm text-slate-500">
                                            {customer.last_order_at
                                                ? new Date(customer.last_order_at).toLocaleDateString('es-ES')
                                                : '-'
                                            }
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedCustomer(customer)}
                                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                            title="Ver detalles"
                                        >
                                            <Eye size={16} className="text-slate-400" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Customer Detail Modal */}
            <AnimatePresence>
                {selectedCustomer && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setSelectedCustomer(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl w-full max-w-lg overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <h2 className="text-xl font-black text-slate-900">Detalle del Cliente</h2>
                                <button
                                    onClick={() => setSelectedCustomer(null)}
                                    className="p-2 hover:bg-slate-100 rounded-xl"
                                >
                                    <X size={20} className="text-slate-400" />
                                </button>
                            </div>
                            <div className="p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-primary">
                                            {selectedCustomer.name?.charAt(0) || '?'}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">
                                            {selectedCustomer.name || 'Cliente Anónimo'}
                                        </h3>
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${tierColors[selectedCustomer.loyalty_tier].bg
                                            } ${tierColors[selectedCustomer.loyalty_tier].text}`}>
                                            {tierColors[selectedCustomer.loyalty_tier].icon}
                                            {selectedCustomer.loyalty_tier.charAt(0).toUpperCase() + selectedCustomer.loyalty_tier.slice(1)}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {selectedCustomer.email && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                                <Mail size={18} className="text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Email</p>
                                                <p className="font-medium text-slate-900">{selectedCustomer.email}</p>
                                            </div>
                                        </div>
                                    )}
                                    {selectedCustomer.phone && (
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                                <Phone size={18} className="text-slate-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500">Teléfono</p>
                                                <p className="font-medium text-slate-900">{selectedCustomer.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-2 gap-4 mt-6">
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500 mb-1">Total Pedidos</p>
                                        <p className="text-xl font-black text-slate-900">{selectedCustomer.total_orders}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500 mb-1">Total Gastado</p>
                                        <p className="text-xl font-black text-primary">€{selectedCustomer.total_spent?.toFixed(2)}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500 mb-1">Puntos de Fidelidad</p>
                                        <p className="text-xl font-black text-amber-500">{selectedCustomer.loyalty_points}</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-xl">
                                        <p className="text-xs text-slate-500 mb-1">Cliente Desde</p>
                                        <p className="text-sm font-bold text-slate-900">
                                            {new Date(selectedCustomer.created_at).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long'
                                            })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

