"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Bell,
    Volume2,
    VolumeX,
    Clock,
    CheckCircle2,
    User,
    AlertTriangle,
    HelpCircle,
    Receipt,
    UtensilsCrossed,
    Loader2,
    RefreshCw,
    Archive,
    ArrowRight,
} from "lucide-react";

interface WaiterCall {
    id: string;
    restaurant_id: string;
    table_number: number;
    reason: string;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    status: 'pending' | 'assigned' | 'completed';
    assigned_to: string | null;
    created_at: string;
    completed_at: string | null;
}

const reasonConfig: Record<string, { label: string; icon: any; category: string; emoji?: string }> = {
    // Asistencia
    waiter: { label: 'Llamar camarero', icon: User, category: 'asistencia', emoji: '🙋' },
    question: { label: 'Tengo una pregunta', icon: HelpCircle, category: 'asistencia', emoji: '❓' },
    menu: { label: 'Ver la carta', icon: UtensilsCrossed, category: 'asistencia', emoji: '📋' },

    // Cuenta
    bill: { label: 'Pedir la cuenta', icon: Receipt, category: 'cuenta', emoji: '💳' },
    split_bill: { label: 'Dividir la cuenta', icon: Receipt, category: 'cuenta', emoji: '💶' },
    pay_card: { label: 'Pagar con tarjeta', icon: Receipt, category: 'cuenta', emoji: '💳' },

    // Extras de mesa
    napkins: { label: 'Servilletas', icon: UtensilsCrossed, category: 'extras', emoji: '🧻' },
    cutlery: { label: 'Cubiertos', icon: UtensilsCrossed, category: 'extras', emoji: '🍴' },
    plates: { label: 'Platos extra', icon: UtensilsCrossed, category: 'extras', emoji: '🍽️' },
    salt_pepper: { label: 'Sal y pimienta', icon: UtensilsCrossed, category: 'extras', emoji: '🧂' },
    toothpicks: { label: 'Palillos', icon: UtensilsCrossed, category: 'extras', emoji: '🦷' },
    ashtray: { label: 'Cenicero', icon: UtensilsCrossed, category: 'extras', emoji: '🚬' },
    highchair: { label: 'Trona para bebé', icon: User, category: 'extras', emoji: '👶' },

    // Salsas y condimentos
    mayo: { label: 'Mayonesa', icon: UtensilsCrossed, category: 'salsas', emoji: '🥫' },
    ketchup: { label: 'Ketchup', icon: UtensilsCrossed, category: 'salsas', emoji: '🍅' },
    mustard: { label: 'Mostaza', icon: UtensilsCrossed, category: 'salsas', emoji: '🟡' },
    oil_vinegar: { label: 'Aceite y vinagre', icon: UtensilsCrossed, category: 'salsas', emoji: '🫒' },
    hot_sauce: { label: 'Salsa picante', icon: UtensilsCrossed, category: 'salsas', emoji: '🌶️' },
    alioli: { label: 'Alioli', icon: UtensilsCrossed, category: 'salsas', emoji: '🧄' },
    bread: { label: 'Más pan', icon: UtensilsCrossed, category: 'salsas', emoji: '🍞' },

    // Bebidas
    water: { label: 'Agua', icon: UtensilsCrossed, category: 'bebidas', emoji: '💧' },
    more_wine: { label: 'Más vino', icon: UtensilsCrossed, category: 'bebidas', emoji: '🍷' },
    more_beer: { label: 'Más cerveza', icon: UtensilsCrossed, category: 'bebidas', emoji: '🍺' },
    ice: { label: 'Hielo', icon: UtensilsCrossed, category: 'bebidas', emoji: '🧊' },
    coffee: { label: 'Café', icon: UtensilsCrossed, category: 'bebidas', emoji: '☕' },

    // Urgente
    complaint: { label: 'Reclamación', icon: AlertTriangle, category: 'urgente', emoji: '⚠️' },
    wrong_order: { label: 'Pedido incorrecto', icon: AlertTriangle, category: 'urgente', emoji: '❌' },
    food_cold: { label: 'Comida fría', icon: AlertTriangle, category: 'urgente', emoji: '🥶' },

    // Otro
    other: { label: 'Otra cosa', icon: Bell, category: 'otro', emoji: '💬' },
};

const categoryLabels: Record<string, { label: string; color: string }> = {
    asistencia: { label: '🙋 Asistencia', color: 'text-blue-600' },
    cuenta: { label: '💳 Cuenta', color: 'text-green-600' },
    extras: { label: '🍽️ Extras', color: 'text-purple-600' },
    salsas: { label: '🥫 Salsas', color: 'text-orange-600' },
    bebidas: { label: '🥤 Bebidas', color: 'text-cyan-600' },
    urgente: { label: '⚠️ Urgente', color: 'text-red-600' },
    otro: { label: '💬 Otro', color: 'text-slate-600' },
};

const priorityConfig = {
    low: { label: 'Baja', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
    normal: { label: 'Normal', color: 'bg-yellow-500', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700' },
    high: { label: 'Alta', color: 'bg-orange-500', bgColor: 'bg-orange-50', textColor: 'text-orange-700' },
    urgent: { label: 'Urgente', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' },
};

export default function WaiterCallsPage() {
    const [calls, setCalls] = useState<WaiterCall[]>([]);
    const [loading, setLoading] = useState(true);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [showCompleted, setShowCompleted] = useState(false);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [todayCompleted, setTodayCompleted] = useState(0);

    const supabase = createClient();

    useEffect(() => {
        loadCalls();
    }, []);

    useEffect(() => {
        if (!restaurant) return;
        const cleanup = setupRealtimeSubscription(restaurant.id);
        return cleanup;
    }, [restaurant?.id]);

    const loadCalls = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: restaurants } = await supabase
                .from("restaurants")
                .select("*")
                .eq("owner_id", user.id)
                .order("created_at", { ascending: true });

            const restaurantData = restaurants?.[0] || null;
            if (!restaurantData) return;
            setRestaurant(restaurantData);

            // Load pending calls
            const { data: callsData } = await supabase
                .from("waiter_calls")
                .select("*")
                .eq("restaurant_id", restaurantData.id)
                .eq("status", "pending")
                .order("priority", { ascending: false })
                .order("created_at", { ascending: true });

            setCalls(callsData || []);

            // Count today's completed
            const today = new Date().toISOString().split('T')[0];
            const { count } = await supabase
                .from("waiter_calls")
                .select("*", { count: "exact", head: true })
                .eq("restaurant_id", restaurantData.id)
                .eq("status", "completed")
                .gte("completed_at", today);

            setTodayCompleted(count || 0);
        } catch (err) {
            console.error("Error loading calls:", err);
        } finally {
            setLoading(false);
        }
    };

    const setupRealtimeSubscription = (restaurantId: string) => {
        const channel = supabase
            .channel(`waiter-calls-${restaurantId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'waiter_calls',
                filter: `restaurant_id=eq.${restaurantId}`,
            }, (payload) => {
                loadCalls();
                if (soundEnabled) {
                    playNotificationSound(payload.new.priority);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const playNotificationSound = (priority: string) => {
        try {
            const ctx = new AudioContext();
            const isUrgent = priority === 'urgent' || priority === 'high';
            const delays = isUrgent ? [0, 120, 240] : [0];
            delays.forEach((delayMs) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.frequency.value = isUrgent ? 1040 : 700;
                osc.type = 'sine';
                gain.gain.setValueAtTime(0.45, ctx.currentTime + delayMs / 1000);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delayMs / 1000 + 0.18);
                osc.start(ctx.currentTime + delayMs / 1000);
                osc.stop(ctx.currentTime + delayMs / 1000 + 0.18);
            });
        } catch { }
    };

    const markAsCompleted = async (callId: string) => {
        await supabase
            .from("waiter_calls")
            .update({
                status: 'completed',
                completed_at: new Date().toISOString()
            })
            .eq("id", callId);

        loadCalls();
    };

    const getWaitTime = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        return Math.floor(diff / 60000);
    };

    const formatTimeAgo = (dateStr: string) => {
        const mins = getWaitTime(dateStr);
        if (mins < 1) return 'ahora mismo';
        if (mins < 60) return `hace ${mins} min`;
        const hours = Math.floor(mins / 60);
        return `hace ${hours}h ${mins % 60}min`;
    };

    // Group calls by priority
    const urgentCalls = calls.filter(c => c.priority === 'urgent' || c.priority === 'high');
    const normalCalls = calls.filter(c => c.priority === 'normal');
    const lowCalls = calls.filter(c => c.priority === 'low');

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
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <Bell size={28} className="text-amber-500" />
                        Llamadas de Camarero
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {calls.length} pendientes · {todayCompleted} atendidas hoy
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-bold transition-colors ${soundEnabled
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                            }`}
                    >
                        {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
                        {soundEnabled ? 'Sonido ON' : 'Sonido OFF'}
                    </button>
                    <button
                        onClick={loadCalls}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                        title="Actualizar"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Empty State */}
            {calls.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 size={40} className="text-green-500" />
                    </div>
                    <h2 className="text-xl font-black text-slate-900 mb-2">¡Todo atendido!</h2>
                    <p className="text-slate-500 max-w-md mx-auto">
                        No hay llamadas pendientes. Las nuevas llamadas de los clientes aparecerán aquí en tiempo real.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Urgent Calls */}
                    {urgentCalls.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                                <h2 className="font-bold text-red-600 uppercase text-sm tracking-wider">
                                    Urgentes ({urgentCalls.length})
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <AnimatePresence>
                                    {urgentCalls.map((call) => (
                                        <CallCard
                                            key={call.id}
                                            call={call}
                                            onComplete={() => markAsCompleted(call.id)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Normal Calls */}
                    {normalCalls.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                                <h2 className="font-bold text-yellow-600 uppercase text-sm tracking-wider">
                                    Normales ({normalCalls.length})
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <AnimatePresence>
                                    {normalCalls.map((call) => (
                                        <CallCard
                                            key={call.id}
                                            call={call}
                                            onComplete={() => markAsCompleted(call.id)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}

                    {/* Low Priority Calls */}
                    {lowCalls.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                                <h2 className="font-bold text-green-600 uppercase text-sm tracking-wider">
                                    Baja prioridad ({lowCalls.length})
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <AnimatePresence>
                                    {lowCalls.map((call) => (
                                        <CallCard
                                            key={call.id}
                                            call={call}
                                            onComplete={() => markAsCompleted(call.id)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Today's Stats */}
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-green-500" />
                    {todayCompleted} atendidas hoy
                </span>
                <span>·</span>
                <span>
                    Tiempo promedio de respuesta: ~2 min
                </span>
            </div>
        </div>
    );
}

// Call Card Component
function CallCard({
    call,
    onComplete,
}: {
    call: WaiterCall;
    onComplete: () => void;
}) {
    const reason = reasonConfig[call.reason] || reasonConfig.other;
    const priority = priorityConfig[call.priority];
    const ReasonIcon = reason.icon;
    const waitTime = Math.floor((Date.now() - new Date(call.created_at).getTime()) / 60000);
    const isUrgent = call.priority === 'urgent' || call.priority === 'high';

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, x: 100 }}
            className={`bg-white rounded-2xl border-2 overflow-hidden ${isUrgent
                ? 'border-red-300 shadow-lg shadow-red-100'
                : 'border-slate-100'
                }`}
        >
            <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl ${priority.bgColor} flex items-center justify-center`}>
                        <ReasonIcon size={24} className={priority.textColor} />
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${priority.color} ${isUrgent ? 'animate-pulse' : ''}`} />
                        <span className={`text-xs font-bold ${priority.textColor}`}>
                            {priority.label}
                        </span>
                    </div>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-1">
                    Mesa {call.table_number}
                </h3>
                <p className="text-slate-600 font-medium">{reason.label}</p>

                <div className="flex items-center gap-1.5 mt-3 text-slate-400">
                    <Clock size={14} />
                    <span className={`text-sm font-medium ${waitTime >= 5 ? 'text-red-500' : 'text-slate-500'
                        }`}>
                        {waitTime < 1 ? 'Ahora mismo' : `Hace ${waitTime} min`}
                    </span>
                </div>
            </div>

            <button
                onClick={onComplete}
                className={`w-full py-4 font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95 ${isUrgent
                    ? 'bg-red-500 hover:bg-red-600'
                    : 'bg-primary hover:bg-primary/90'
                    }`}
            >
                <CheckCircle2 size={20} />
                Marcar como Atendida
            </button>
        </motion.div>
    );
}
