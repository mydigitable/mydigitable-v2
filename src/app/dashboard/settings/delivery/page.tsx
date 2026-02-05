"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Truck,
    MapPin,
    Euro,
    Clock,
    Save,
    Loader2,
    Plus,
    Trash2,
} from "lucide-react";

interface DeliveryZone {
    id: string;
    name: string;
    min_order: number;
    delivery_fee: number;
    estimated_time: number;
}

export default function DeliverySettingsPage() {
    const [restaurant, setRestaurant] = useState<any>(null);
    const [zones, setZones] = useState<DeliveryZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deliveryEnabled, setDeliveryEnabled] = useState(false);
    const [defaultFee, setDefaultFee] = useState(0);
    const [minOrder, setMinOrder] = useState(0);
    const [maxDistance, setMaxDistance] = useState(10);

    const supabase = createClient();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: restaurants } = await supabase
            .from("restaurants")
            .select("*")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: true }); const restaurantData = restaurants?.[0] || null;

        if (restaurantData) {
            setRestaurant(restaurantData);
            setDeliveryEnabled(restaurantData.mode_delivery || false);
        }
        setLoading(false);
    };

    const saveSettings = async () => {
        if (!restaurant) return;
        setSaving(true);

        await supabase
            .from("restaurants")
            .update({
                mode_delivery: deliveryEnabled,
            })
            .eq("id", restaurant.id);

        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Configuración de Delivery</h1>
                    <p className="text-slate-500 mt-1">Configura las opciones de entrega a domicilio</p>
                </div>
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Guardar
                </button>
            </div>

            {/* Enable Delivery */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <Truck size={24} className="text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Activar Delivery</h3>
                            <p className="text-sm text-slate-500">Permite que los clientes pidan a domicilio</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setDeliveryEnabled(!deliveryEnabled)}
                        className={`relative w-14 h-8 rounded-full transition-colors ${deliveryEnabled ? 'bg-primary' : 'bg-slate-200'
                            }`}
                    >
                        <motion.div
                            animate={{ x: deliveryEnabled ? 24 : 4 }}
                            className="absolute top-1 w-6 h-6 bg-white rounded-full shadow"
                        />
                    </button>
                </div>
            </div>

            {deliveryEnabled && (
                <>
                    {/* General Settings */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
                        <h3 className="font-bold text-slate-900 mb-6">Configuración General</h3>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    <Euro size={14} className="inline mr-1" />
                                    Pedido Mínimo
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={minOrder}
                                        onChange={(e) => setMinOrder(Number(e.target.value))}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    <Truck size={14} className="inline mr-1" />
                                    Coste de Envío
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={defaultFee}
                                        onChange={(e) => setDefaultFee(Number(e.target.value))}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="0"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">€</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    <MapPin size={14} className="inline mr-1" />
                                    Radio Máximo
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={maxDistance}
                                        onChange={(e) => setMaxDistance(Number(e.target.value))}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="10"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">km</span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    <Clock size={14} className="inline mr-1" />
                                    Tiempo Estimado
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        defaultValue={30}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                        placeholder="30"
                                    />
                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">min</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Delivery Zones */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="font-bold text-slate-900">Zonas de Reparto</h3>
                            <button className="flex items-center gap-2 px-3 py-2 text-primary hover:bg-primary/10 rounded-lg font-bold text-sm transition-colors">
                                <Plus size={16} />
                                Añadir zona
                            </button>
                        </div>
                        <div className="text-center py-8 text-slate-400">
                            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No hay zonas configuradas</p>
                            <p className="text-sm">Configura zonas para aplicar tarifas diferentes</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

