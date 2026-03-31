"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
    ArrowLeft,
    Volume2,
    VolumeX,
    Maximize2,
    Minimize2,
    Clock,
    CheckCircle2,
    Utensils,
    Coffee,
    Truck,
    Waves,
    AlertTriangle,
    ChefHat,
    Loader2,
    RefreshCw,
} from "lucide-react";

interface KitchenOrder {
    id: string;
    order_number: string;
    order_type: 'dine_in' | 'takeaway' | 'delivery' | 'beach_service';
    status: string;
    table_number?: number;
    guest_name: string | null;
    notes: string | null;
    created_at: string;
    items: {
        id: string;
        product_name: string;
        quantity: number;
        notes: string | null;
    }[];
}

const orderTypeConfig = {
    dine_in: { label: 'Mesa', icon: Utensils, color: 'bg-primary' },
    takeaway: { label: 'Llevar', icon: Coffee, color: 'bg-blue-500' },
    delivery: { label: 'Delivery', icon: Truck, color: 'bg-purple-500' },
    beach_service: { label: 'Playa', icon: Waves, color: 'bg-cyan-500' },
};

export default function KitchenPage() {
    const [orders, setOrders] = useState<KitchenOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [restaurant, setRestaurant] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        if (!restaurant) return;
        const cleanup = setupRealtimeSubscription(restaurant.id);
        return cleanup;
    }, [restaurant?.id]);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
                    id,
                    order_number,
                    order_type,
                    status,
                    guest_name,
                    notes,
                    created_at,
                    order_items (
                        id,
                        product_name,
                        quantity,
                        notes
                    )
                `)
                .eq("restaurant_id", restaurantData.id)
                .in("status", ["confirmed", "preparing"])
                .order("created_at", { ascending: true });

            setOrders((ordersData || []).map(o => ({
                ...o,
                items: o.order_items || []
            })));
        } catch (err) {
            console.error("Error loading orders:", err);
        } finally {
            setLoading(false);
        }
    };

    const setupRealtimeSubscription = (restaurantId: string) => {
        const channel = supabase
            .channel(`kitchen-orders-${restaurantId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'orders',
                filter: `restaurant_id=eq.${restaurantId}`,
            }, (payload) => {
                if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                    loadOrders();
                    if (payload.eventType === 'INSERT' && soundEnabled) {
                        playNotificationSound();
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const playNotificationSound = () => {
        try {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.setValueAtTime(660, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.4);
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.5, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.4);
        } catch { }
    };

    const markAsReady = async (orderId: string) => {
        await supabase
            .from("orders")
            .update({ status: 'ready', updated_at: new Date().toISOString() })
            .eq("id", orderId);

        loadOrders();
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const getWaitTime = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        return Math.floor(diff / 60000);
    };

    const getUrgencyColor = (waitTime: number) => {
        if (waitTime >= 20) return 'border-red-500 bg-red-50';
        if (waitTime >= 15) return 'border-amber-500 bg-amber-50';
        if (waitTime >= 10) return 'border-yellow-400 bg-yellow-50';
        return 'border-slate-200 bg-white';
    };

    const getUrgencyDot = (waitTime: number) => {
        if (waitTime >= 20) return 'bg-red-500 animate-pulse';
        if (waitTime >= 15) return 'bg-amber-500 animate-pulse';
        if (waitTime >= 10) return 'bg-yellow-400';
        return 'bg-green-500';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <Loader2 size={48} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className={`min-h-screen bg-slate-900 ${isFullscreen ? 'p-4' : ''}`}>
            {/* Header */}
            <header className={`${isFullscreen ? 'mb-4' : 'p-4 lg:p-6'} flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                    {!isFullscreen && (
                        <Link
                            href="/dashboard/orders"
                            className="p-2 hover:bg-slate-800 rounded-xl transition-colors"
                        >
                            <ArrowLeft size={20} className="text-slate-400" />
                        </Link>
                    )}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                            <ChefHat size={20} className="text-primary" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black text-white">Cocina</h1>
                            <p className="text-sm text-slate-500">{orders.length} pedidos activos</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Legend */}
                    <div className="hidden lg:flex items-center gap-4 mr-4 text-xs">
                        <span className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500" /> Nuevo
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> +10min
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" /> +15min
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-400">
                            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> Urgente
                        </span>
                    </div>

                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`p-3 rounded-xl transition-colors ${soundEnabled
                            ? 'bg-primary/20 text-primary'
                            : 'bg-slate-800 text-slate-500'
                            }`}
                        title={soundEnabled ? 'Sonido ON' : 'Sonido OFF'}
                    >
                        {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                    </button>

                    <button
                        onClick={loadOrders}
                        className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
                        title="Actualizar"
                    >
                        <RefreshCw size={20} />
                    </button>

                    <button
                        onClick={toggleFullscreen}
                        className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
                        title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                    >
                        {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
                    </button>
                </div>
            </header>

            {/* Orders Grid */}
            <div className={`${isFullscreen ? '' : 'px-4 lg:px-6 pb-6'}`}>
                {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh]">
                        <div className="w-24 h-24 rounded-full bg-slate-800 flex items-center justify-center mb-6">
                            <CheckCircle2 size={48} className="text-green-500" />
                        </div>
                        <h2 className="text-2xl font-black text-white mb-2">¡Todo listo!</h2>
                        <p className="text-slate-500">No hay pedidos pendientes en cocina</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        <AnimatePresence>
                            {orders.map((order) => {
                                const waitTime = getWaitTime(order.created_at);
                                const orderType = orderTypeConfig[order.order_type];
                                const TypeIcon = orderType?.icon || Utensils;

                                return (
                                    <motion.div
                                        key={order.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className={`rounded-2xl border-2 overflow-hidden ${getUrgencyColor(waitTime)}`}
                                    >
                                        {/* Order Header */}
                                        <div className="p-4 border-b border-slate-200">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-3 h-3 rounded-full ${getUrgencyDot(waitTime)}`} />
                                                    <span className="font-black text-lg text-slate-900">
                                                        #{order.order_number}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1 text-slate-500">
                                                    <Clock size={14} />
                                                    <span className={`text-sm font-bold ${waitTime >= 15 ? 'text-red-600' : 'text-slate-600'
                                                        }`}>
                                                        {waitTime}min
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold text-white ${orderType?.color}`}>
                                                <TypeIcon size={12} />
                                                {orderType?.label}
                                                {order.order_type === 'dine_in' && order.table_number && (
                                                    <span className="ml-1">{order.table_number}</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Order Items */}
                                        <div className="p-4 space-y-3">
                                            {order.items.map((item) => (
                                                <div key={item.id} className="flex items-start gap-3">
                                                    <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-sm font-black text-slate-700 flex-shrink-0">
                                                        {item.quantity}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-bold text-slate-900 text-sm leading-tight">
                                                            {item.product_name}
                                                        </p>
                                                        {item.notes && (
                                                            <p className="text-xs text-amber-600 mt-0.5 font-medium">
                                                                ⚠️ {item.notes}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Order Notes */}
                                        {order.notes && (
                                            <div className="px-4 pb-3">
                                                <div className="p-2.5 bg-amber-100 rounded-lg">
                                                    <p className="text-xs text-amber-800 font-medium">
                                                        📝 {order.notes}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Ready Button */}
                                        <button
                                            onClick={() => markAsReady(order.id)}
                                            className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-black text-lg flex items-center justify-center gap-2 transition-colors active:scale-95"
                                        >
                                            <CheckCircle2 size={24} />
                                            LISTO
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Urgent Orders Alert */}
            {orders.some(o => getWaitTime(o.created_at) >= 20) && (
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="fixed bottom-0 left-0 right-0 bg-red-600 text-white py-4 px-6"
                >
                    <div className="flex items-center justify-center gap-3">
                        <AlertTriangle size={24} className="animate-pulse" />
                        <span className="font-bold text-lg">
                            ¡ATENCIÓN! Hay pedidos esperando más de 20 minutos
                        </span>
                    </div>
                </motion.div>
            )}
        </div>
    );
}

