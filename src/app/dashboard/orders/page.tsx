"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
    Search,
    Filter,
    ChevronDown,
    Clock,
    Utensils,
    Coffee,
    Truck,
    Waves,
    Phone,
    MapPin,
    User,
    Euro,
    ChefHat,
    CheckCircle2,
    XCircle,
    Printer,
    MoreHorizontal,
    Eye,
    Loader2,
    RefreshCw,
    Volume2,
    VolumeX,
    ArrowRight,
} from "lucide-react";

interface Order {
    id: string;
    order_number: string;
    restaurant_id: string;
    status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
    order_type: 'dine_in' | 'takeaway' | 'delivery' | 'beach_service';
    guest_name: string | null;
    customer_phone: string | null;
    customer_email: string | null;
    table_id: string | null;
    delivery_address: string | null;
    subtotal: number;
    delivery_fee: number;
    total: number;
    notes: string | null;
    created_at: string;
    updated_at: string;
    items?: OrderItem[];
}

interface OrderItem {
    id: string;
    product_name: string;
    product_price: number;
    quantity: number;
    notes: string | null;
}

type TabFilter = 'all' | 'pending' | 'preparing' | 'ready' | 'completed';

const statusConfig = {
    pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-500' },
    confirmed: { label: 'Confirmado', color: 'bg-blue-100 text-blue-700', dotColor: 'bg-blue-500' },
    preparing: { label: 'Preparando', color: 'bg-yellow-100 text-yellow-700', dotColor: 'bg-yellow-500' },
    ready: { label: 'Listo', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' },
    delivered: { label: 'Entregado', color: 'bg-slate-100 text-slate-700', dotColor: 'bg-slate-500' },
    cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500' },
    canceled: { label: 'Cancelado', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500' },
};

const orderTypeConfig = {
    dine_in: { label: 'En mesa', icon: Utensils, color: 'text-primary' },
    takeaway: { label: 'Para llevar', icon: Coffee, color: 'text-blue-600' },
    delivery: { label: 'Delivery', icon: Truck, color: 'text-purple-600' },
    beach_service: { label: 'Playa', icon: Waves, color: 'text-cyan-600' },
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabFilter>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [restaurant, setRestaurant] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        loadOrders();
        setupRealtimeSubscription();
    }, []);

    const loadOrders = async () => {
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

            const { data: ordersData } = await supabase
                .from("orders")
                .select(`
                    *,
                    order_items (*)
                `)
                .eq("restaurant_id", restaurantData.id)
                .order("created_at", { ascending: false })
                .limit(50);

            setOrders(ordersData || []);
        } catch (err) {
            console.error("Error loading orders:", err);
        } finally {
            setLoading(false);
        }
    };

    const setupRealtimeSubscription = () => {
        const channel = supabase
            .channel('orders-realtime')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'orders',
            }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    // Play sound for new order
                    if (soundEnabled) {
                        playNotificationSound();
                    }
                }
                loadOrders();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const playNotificationSound = () => {
        const audio = new Audio('/sounds/new-order.mp3');
        audio.play().catch(() => { });
    };

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        await supabase
            .from("orders")
            .update({ status: newStatus, updated_at: new Date().toISOString() })
            .eq("id", orderId);

        loadOrders();
    };

    const getNextStatus = (currentStatus: string): string | null => {
        switch (currentStatus) {
            case 'pending': return 'confirmed';
            case 'confirmed': return 'preparing';
            case 'preparing': return 'ready';
            case 'ready': return 'delivered';
            default: return null;
        }
    };

    const formatTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return 'ahora mismo';
        if (mins < 60) return `hace ${mins} min`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `hace ${hours}h`;
        return `hace ${Math.floor(hours / 24)}d`;
    };

    const getWaitTime = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        return mins;
    };

    const filteredOrders = orders.filter(order => {
        // Tab filter
        if (activeTab === 'pending' && order.status !== 'pending') return false;
        if (activeTab === 'preparing' && !['confirmed', 'preparing'].includes(order.status)) return false;
        if (activeTab === 'ready' && order.status !== 'ready') return false;
        if (activeTab === 'completed' && !['delivered', 'cancelled'].includes(order.status)) return false;

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                order.order_number.toLowerCase().includes(query) ||
                order.guest_name?.toLowerCase().includes(query) ||
                order.customer_phone?.includes(query)
            );
        }

        return true;
    });

    const tabs = [
        { id: 'all' as TabFilter, label: 'Todos', count: orders.length },
        { id: 'pending' as TabFilter, label: 'Pendientes', count: orders.filter(o => o.status === 'pending').length },
        { id: 'preparing' as TabFilter, label: 'En cocina', count: orders.filter(o => ['confirmed', 'preparing'].includes(o.status)).length },
        { id: 'ready' as TabFilter, label: 'Listos', count: orders.filter(o => o.status === 'ready').length },
        { id: 'completed' as TabFilter, label: 'Completados', count: orders.filter(o => ['delivered', 'cancelled'].includes(o.status)).length },
    ];

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
                    <h1 className="text-2xl font-black text-slate-900">Pedidos</h1>
                    <p className="text-sm text-slate-500">Gestiona todos los pedidos en tiempo real</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`p-2.5 rounded-xl border transition-colors ${soundEnabled
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                            }`}
                        title={soundEnabled ? 'Sonido activado' : 'Sonido desactivado'}
                    >
                        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                    </button>
                    <button
                        onClick={loadOrders}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        title="Actualizar"
                    >
                        <RefreshCw size={18} />
                    </button>
                    <Link
                        href="/dashboard/orders/kitchen"
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-colors"
                    >
                        <ChefHat size={18} />
                        Vista Cocina
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${activeTab === tab.id
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                            }`}
                    >
                        {tab.label}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${activeTab === tab.id
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-500'
                            }`}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                        type="text"
                        placeholder="Buscar por número, cliente o teléfono..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle2 size={28} className="text-slate-300" />
                    </div>
                    <p className="font-bold text-slate-900 mb-1">Sin pedidos</p>
                    <p className="text-sm text-slate-400">
                        {activeTab === 'all'
                            ? 'Los nuevos pedidos aparecerán aquí'
                            : 'No hay pedidos en esta categoría'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredOrders.map((order) => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            onStatusChange={updateOrderStatus}
                            onView={() => setSelectedOrder(order)}
                        />
                    ))}
                </div>
            )}

            {/* Order Detail Modal */}
            <AnimatePresence>
                {selectedOrder && (
                    <OrderDetailModal
                        order={selectedOrder}
                        onClose={() => setSelectedOrder(null)}
                        onStatusChange={updateOrderStatus}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Order Card Component
function OrderCard({
    order,
    onStatusChange,
    onView,
}: {
    order: Order;
    onStatusChange: (orderId: string, status: string) => void;
    onView: () => void;
}) {
    const status = statusConfig[order.status];
    const orderType = orderTypeConfig[order.order_type];
    const TypeIcon = orderType?.icon || Utensils;
    const waitTime = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);
    const isUrgent = waitTime > 15 && !['delivered', 'cancelled'].includes(order.status);
    const nextStatus = getNextStatus(order.status);

    function getNextStatus(currentStatus: string): string | null {
        switch (currentStatus) {
            case 'pending': return 'confirmed';
            case 'confirmed': return 'preparing';
            case 'preparing': return 'ready';
            case 'ready': return 'delivered';
            default: return null;
        }
    }

    function getNextStatusLabel(status: string): string {
        switch (status) {
            case 'confirmed': return 'Confirmar';
            case 'preparing': return 'A Cocina';
            case 'ready': return 'Listo';
            case 'delivered': return 'Entregar';
            default: return 'Avanzar';
        }
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`bg-white rounded-2xl border overflow-hidden ${isUrgent ? 'border-red-300 shadow-lg shadow-red-100' : 'border-slate-100'
                }`}
        >
            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* Order Type Icon */}
                    <div className={`w-14 h-14 rounded-xl ${status.color} flex items-center justify-center flex-shrink-0`}>
                        <TypeIcon size={24} />
                    </div>

                    {/* Order Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-black text-slate-900">#{order.order_number}</span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${status.color}`}>
                                {status.label}
                            </span>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 ${orderType?.color}`}>
                                {orderType?.label}
                            </span>
                            {isUrgent && (
                                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600 animate-pulse">
                                    ⚠️ {waitTime} min
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                            {order.guest_name && (
                                <span className="flex items-center gap-1">
                                    <User size={14} />
                                    {order.guest_name}
                                </span>
                            )}
                            {order.customer_phone && (
                                <span className="flex items-center gap-1">
                                    <Phone size={14} />
                                    {order.customer_phone}
                                </span>
                            )}
                            {order.delivery_address && (
                                <span className="flex items-center gap-1 truncate max-w-[200px]">
                                    <MapPin size={14} />
                                    {order.delivery_address}
                                </span>
                            )}
                        </div>

                        {/* Items Preview */}
                        {order.items && order.items.length > 0 && (
                            <p className="text-sm text-slate-600 mt-2 line-clamp-1">
                                {order.items.map(item => `${item.quantity}x ${item.product_name}`).join(', ')}
                            </p>
                        )}

                        {order.notes && (
                            <p className="text-sm text-amber-600 mt-2 bg-amber-50 px-3 py-1.5 rounded-lg inline-block">
                                📝 {order.notes}
                            </p>
                        )}
                    </div>

                    {/* Right Side */}
                    <div className="text-right flex-shrink-0">
                        <p className="text-xl font-black text-slate-900">€{order.total.toFixed(2)}</p>
                        <div className="flex items-center gap-1 mt-1 text-slate-400">
                            <Clock size={14} />
                            <span className="text-xs">{waitTime} min</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="bg-slate-50 px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onView}
                        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white rounded-lg transition-colors"
                    >
                        <Eye size={14} />
                        Ver detalle
                    </button>
                    <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-white rounded-lg transition-colors">
                        <Printer size={14} />
                        Imprimir
                    </button>
                </div>

                {nextStatus && (
                    <button
                        onClick={() => onStatusChange(order.id, nextStatus)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-colors"
                    >
                        {getNextStatusLabel(nextStatus)}
                        <ArrowRight size={14} />
                    </button>
                )}
            </div>
        </motion.div>
    );
}

// Order Detail Modal
function OrderDetailModal({
    order,
    onClose,
    onStatusChange,
}: {
    order: Order;
    onClose: () => void;
    onStatusChange: (orderId: string, status: string) => void;
}) {
    const status = statusConfig[order.status];
    const orderType = orderTypeConfig[order.order_type];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Pedido #{order.order_number}</h2>
                            <p className="text-sm text-slate-500">{orderType?.label}</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-bold ${status.color}`}>
                            {status.label}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                    {/* Customer Info */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Cliente</h3>
                        <div className="space-y-2">
                            {order.guest_name && (
                                <p className="flex items-center gap-2 text-slate-700">
                                    <User size={16} className="text-slate-400" />
                                    {order.guest_name}
                                </p>
                            )}
                            {order.customer_phone && (
                                <p className="flex items-center gap-2 text-slate-700">
                                    <Phone size={16} className="text-slate-400" />
                                    {order.customer_phone}
                                </p>
                            )}
                            {order.delivery_address && (
                                <p className="flex items-center gap-2 text-slate-700">
                                    <MapPin size={16} className="text-slate-400" />
                                    {order.delivery_address}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Items */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Productos</h3>
                        <div className="space-y-3">
                            {order.items?.map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-slate-900">
                                            {item.quantity}x {item.product_name}
                                        </p>
                                        {item.notes && (
                                            <p className="text-sm text-amber-600">📝 {item.notes}</p>
                                        )}
                                    </div>
                                    <span className="font-bold text-slate-900">
                                        €{(item.product_price * item.quantity).toFixed(2)}
                                    </span>
                                </div>
                            )) || (
                                    <p className="text-slate-400">Sin detalles de productos</p>
                                )}
                        </div>
                    </div>

                    {/* Notes */}
                    {order.notes && (
                        <div>
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Notas</h3>
                            <p className="p-3 bg-amber-50 rounded-xl text-amber-800">{order.notes}</p>
                        </div>
                    )}

                    {/* Totals */}
                    <div className="border-t border-slate-100 pt-4">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="text-slate-500">Subtotal</span>
                            <span className="text-slate-700">€{order.subtotal.toFixed(2)}</span>
                        </div>
                        {order.delivery_fee > 0 && (
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-500">Envío</span>
                                <span className="text-slate-700">€{order.delivery_fee.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-black">
                            <span className="text-slate-900">Total</span>
                            <span className="text-primary">€{order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="p-6 bg-slate-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Cerrar
                    </button>
                    {order.status === 'pending' && (
                        <button
                            onClick={() => {
                                onStatusChange(order.id, 'confirmed');
                                onClose();
                            }}
                            className="flex-1 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors"
                        >
                            Confirmar Pedido
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

