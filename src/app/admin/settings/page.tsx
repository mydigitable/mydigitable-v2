"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Settings,
    Save,
    Loader2,
    Euro,
    Percent,
    Mail,
    Phone,
    Globe,
    CreditCard,
    Shield,
    Check,
} from "lucide-react";

interface PlatformSettings {
    id: string;
    platform_name: string;
    support_email: string | null;
    support_phone: string | null;
    commission_rate_starter: number;
    price_starter_monthly: number;
    price_starter_yearly: number;
    price_basic_monthly: number;
    price_basic_yearly: number;
    price_pro_monthly: number;
    price_pro_yearly: number;
    stripe_account_id: string | null;
    default_currency: string;
    default_timezone: string;
}

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<PlatformSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const supabase = createClient();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from("platform_settings")
                .select("*")
                .single();

            if (error) {
                // Si no existe, crear uno por defecto
                if (error.code === "PGRST116") {
                    const { data: newData, error: insertError } = await supabase
                        .from("platform_settings")
                        .insert({})
                        .select()
                        .single();

                    if (!insertError) {
                        setSettings(newData);
                    }
                }
            } else {
                setSettings(data);
            }
        } catch (err) {
            console.error("Error loading settings:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;

        setSaving(true);
        setSaved(false);

        try {
            const { error } = await supabase
                .from("platform_settings")
                .update({
                    platform_name: settings.platform_name,
                    support_email: settings.support_email,
                    support_phone: settings.support_phone,
                    commission_rate_starter: settings.commission_rate_starter,
                    price_basic_monthly: settings.price_basic_monthly,
                    price_basic_yearly: settings.price_basic_yearly,
                    price_pro_monthly: settings.price_pro_monthly,
                    price_pro_yearly: settings.price_pro_yearly,
                    default_currency: settings.default_currency,
                    default_timezone: settings.default_timezone,
                })
                .eq("id", settings.id);

            if (error) throw error;
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Error saving settings:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Configuración de Plataforma</h1>
                    <p className="text-slate-400 mt-1">
                        Configura los ajustes globales de MyDigitable
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`
                        flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all
                        ${saved
                            ? "bg-emerald-500 text-white"
                            : "bg-indigo-500 hover:bg-indigo-600 text-white"
                        }
                        disabled:opacity-50
                    `}
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saved ? (
                        <Check size={18} />
                    ) : (
                        <Save size={18} />
                    )}
                    {saved ? "Guardado" : "Guardar Cambios"}
                </button>
            </div>

            {/* General Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                        <Globe className="text-indigo-400" size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-white">General</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">
                            Nombre de la plataforma
                        </label>
                        <input
                            type="text"
                            value={settings?.platform_name || ""}
                            onChange={(e) => setSettings(s => s ? { ...s, platform_name: e.target.value } : null)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">
                            Moneda por defecto
                        </label>
                        <select
                            value={settings?.default_currency || "EUR"}
                            onChange={(e) => setSettings(s => s ? { ...s, default_currency: e.target.value } : null)}
                            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50"
                        >
                            <option value="EUR">Euro (EUR)</option>
                            <option value="USD">Dólar (USD)</option>
                            <option value="GBP">Libra (GBP)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">
                            Email de soporte
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                value={settings?.support_email || ""}
                                onChange={(e) => setSettings(s => s ? { ...s, support_email: e.target.value } : null)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">
                            Teléfono de soporte
                        </label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="tel"
                                value={settings?.support_phone || ""}
                                onChange={(e) => setSettings(s => s ? { ...s, support_phone: e.target.value } : null)}
                                className="w-full pl-11 pr-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Commission Settings */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                        <Percent className="text-amber-400" size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-white">Comisiones</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">
                            Comisión para plan Starter (%)
                        </label>
                        <p className="text-sm text-slate-400 mb-3">
                            Porcentaje que se cobra en cada pedido de restaurantes con plan Starter
                        </p>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="0"
                                max="30"
                                step="0.5"
                                value={(settings?.commission_rate_starter || 0.15) * 100}
                                onChange={(e) => setSettings(s => s ? { ...s, commission_rate_starter: Number(e.target.value) / 100 } : null)}
                                className="flex-1"
                            />
                            <div className="w-24 px-4 py-2 bg-slate-700 rounded-lg text-center">
                                <span className="text-xl font-bold text-amber-400">
                                    {((settings?.commission_rate_starter || 0.15) * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Plan Pricing */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                        <Euro className="text-emerald-400" size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-white">Precios de Planes</h2>
                </div>

                <div className="space-y-6">
                    {/* Starter */}
                    <div className="p-4 bg-slate-700/30 rounded-xl">
                        <h3 className="font-bold text-slate-400 mb-3">Plan Starter (Gratis + Comisión)</h3>
                        <p className="text-sm text-slate-500">
                            Sin costo mensual, pero se cobra {((settings?.commission_rate_starter || 0.15) * 100).toFixed(0)}% por pedido
                        </p>
                    </div>

                    {/* Basic */}
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                        <h3 className="font-bold text-blue-400 mb-4">Plan Basic</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">
                                    Precio mensual (€)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={settings?.price_basic_monthly || 40}
                                    onChange={(e) => setSettings(s => s ? { ...s, price_basic_monthly: Number(e.target.value) } : null)}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">
                                    Precio anual (€)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={settings?.price_basic_yearly || 384}
                                    onChange={(e) => setSettings(s => s ? { ...s, price_basic_yearly: Number(e.target.value) } : null)}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pro */}
                    <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl">
                        <h3 className="font-bold text-indigo-400 mb-4">Plan Pro</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">
                                    Precio mensual (€)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={settings?.price_pro_monthly || 90}
                                    onChange={(e) => setSettings(s => s ? { ...s, price_pro_monthly: Number(e.target.value) } : null)}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">
                                    Precio anual (€)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    value={settings?.price_pro_yearly || 864}
                                    onChange={(e) => setSettings(s => s ? { ...s, price_pro_yearly: Number(e.target.value) } : null)}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white focus:ring-2 focus:ring-indigo-500/50"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Stripe Integration */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <CreditCard className="text-purple-400" size={20} />
                    </div>
                    <h2 className="text-lg font-bold text-white">Integración Stripe</h2>
                </div>

                <div className="p-4 bg-slate-700/30 rounded-xl">
                    <div className="flex items-center gap-4">
                        <div className={`
                            w-3 h-3 rounded-full
                            ${settings?.stripe_account_id ? "bg-emerald-400" : "bg-amber-400"}
                        `} />
                        <div>
                            <p className="text-white font-medium">
                                {settings?.stripe_account_id ? "Conectado" : "No conectado"}
                            </p>
                            <p className="text-sm text-slate-400">
                                {settings?.stripe_account_id
                                    ? `ID: ${settings.stripe_account_id}`
                                    : "Configura Stripe para recibir pagos"
                                }
                            </p>
                        </div>
                    </div>

                    {!settings?.stripe_account_id && (
                        <button className="mt-4 w-full px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-bold transition-colors">
                            Conectar Stripe
                        </button>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
