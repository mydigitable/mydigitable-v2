"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    CreditCard,
    Banknote,
    Wallet,
    Smartphone,
    Split,
    Users,
    Check,
    X,
    Loader2,
    ArrowLeft,
    Info,
    Euro,
    Percent,
    Settings,
    ShieldCheck,
    ExternalLink,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface PaymentSettings {
    // Métodos de pago
    accept_cash: boolean;
    accept_card: boolean;
    accept_bizum: boolean;
    accept_apple_pay: boolean;
    accept_google_pay: boolean;

    // Opciones de cobro
    allow_pay_at_table: boolean;      // Pagar en mesa (con móvil)
    allow_pay_at_counter: boolean;    // Pagar en caja
    allow_pay_on_order: boolean;      // Pagar al hacer pedido

    // División de cuenta
    allow_split_bill: boolean;        // Permitir dividir cuenta
    allow_split_equal: boolean;       // Dividir en partes iguales
    allow_split_by_item: boolean;     // Cada uno paga lo suyo

    // Propinas
    tips_enabled: boolean;
    tip_percentages: number[];        // [5, 10, 15, 20]

    // Stripe
    stripe_connected: boolean;
    stripe_account_id: string | null;

    // Impuestos
    tax_rate: number;
    tax_included_in_prices: boolean;
}

const defaultSettings: PaymentSettings = {
    accept_cash: true,
    accept_card: true,
    accept_bizum: false,
    accept_apple_pay: false,
    accept_google_pay: false,
    allow_pay_at_table: true,
    allow_pay_at_counter: true,
    allow_pay_on_order: false,
    allow_split_bill: true,
    allow_split_equal: true,
    allow_split_by_item: true,
    tips_enabled: true,
    tip_percentages: [5, 10, 15],
    stripe_connected: false,
    stripe_account_id: null,
    tax_rate: 10,
    tax_included_in_prices: true,
};

export default function PaymentsSettingsPage() {
    const [settings, setSettings] = useState<PaymentSettings>(defaultSettings);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [restaurant, setRestaurant] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: restaurants } = await supabase
                .from("restaurants")
                .select("*")
                .eq("owner_id", user.id)
                .order("created_at", { ascending: true }); const restaurantData = restaurants?.[0] || null;

            if (restaurantData) {
                setRestaurant(restaurantData);
                // Load payment settings from restaurant or use defaults
                if (restaurantData.payment_settings) {
                    setSettings({ ...defaultSettings, ...restaurantData.payment_settings });
                }
            }
        } catch (err) {
            console.error("Error loading settings:", err);
        } finally {
            setLoading(false);
        }
    };

    const saveSettings = async () => {
        if (!restaurant) return;

        setSaving(true);
        try {
            await supabase
                .from("restaurants")
                .update({
                    payment_settings: settings,
                    updated_at: new Date().toISOString()
                })
                .eq("id", restaurant.id);

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error("Error saving settings:", err);
        } finally {
            setSaving(false);
        }
    };

    const toggleSetting = (key: keyof PaymentSettings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const updateTipPercentages = (percentages: number[]) => {
        setSettings(prev => ({
            ...prev,
            tip_percentages: percentages
        }));
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/settings" className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                    <ArrowLeft size={20} className="text-slate-500" />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-black text-slate-900">Configuración de Pagos</h1>
                    <p className="text-sm text-slate-500">Métodos de pago, propinas y división de cuenta</p>
                </div>
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                >
                    {saving ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : saved ? (
                        <Check size={16} />
                    ) : null}
                    {saved ? 'Guardado' : 'Guardar Cambios'}
                </button>
            </div>

            <div className="space-y-8">
                {/* Métodos de Pago */}
                <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <CreditCard size={20} className="text-primary" />
                            Métodos de Pago Aceptados
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Selecciona los métodos de pago que aceptas en tu restaurante
                        </p>
                    </div>
                    <div className="p-6 space-y-4">
                        <ToggleOption
                            icon={Banknote}
                            label="Efectivo"
                            description="Acepta pagos en efectivo"
                            enabled={settings.accept_cash}
                            onChange={() => toggleSetting('accept_cash')}
                        />
                        <ToggleOption
                            icon={CreditCard}
                            label="Tarjeta de Crédito/Débito"
                            description="Visa, Mastercard, American Express"
                            enabled={settings.accept_card}
                            onChange={() => toggleSetting('accept_card')}
                        />
                        <ToggleOption
                            icon={Smartphone}
                            label="Bizum"
                            description="Transferencia instantánea entre móviles"
                            enabled={settings.accept_bizum}
                            onChange={() => toggleSetting('accept_bizum')}
                        />
                        <ToggleOption
                            icon={Wallet}
                            label="Apple Pay"
                            description="Pagos con iPhone y Apple Watch"
                            enabled={settings.accept_apple_pay}
                            onChange={() => toggleSetting('accept_apple_pay')}
                            requiresStripe
                            stripeConnected={settings.stripe_connected}
                        />
                        <ToggleOption
                            icon={Wallet}
                            label="Google Pay"
                            description="Pagos con dispositivos Android"
                            enabled={settings.accept_google_pay}
                            onChange={() => toggleSetting('accept_google_pay')}
                            requiresStripe
                            stripeConnected={settings.stripe_connected}
                        />
                    </div>
                </section>

                {/* Momento del Pago */}
                <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Euro size={20} className="text-primary" />
                            ¿Cuándo cobrar?
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Define cuándo los clientes pueden pagar
                        </p>
                    </div>
                    <div className="p-6 space-y-4">
                        <ToggleOption
                            icon={Smartphone}
                            label="Pagar en la mesa"
                            description="El cliente paga desde su móvil cuando quiere"
                            enabled={settings.allow_pay_at_table}
                            onChange={() => toggleSetting('allow_pay_at_table')}
                        />
                        <ToggleOption
                            icon={CreditCard}
                            label="Pagar en caja"
                            description="El cliente paga en el mostrador al irse"
                            enabled={settings.allow_pay_at_counter}
                            onChange={() => toggleSetting('allow_pay_at_counter')}
                        />
                        <ToggleOption
                            icon={ShieldCheck}
                            label="Pagar al pedir"
                            description="El cliente paga antes de enviar el pedido"
                            enabled={settings.allow_pay_on_order}
                            onChange={() => toggleSetting('allow_pay_on_order')}
                        />
                    </div>
                </section>

                {/* División de Cuenta */}
                <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Split size={20} className="text-primary" />
                            División de Cuenta
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Permite que los clientes dividan el total entre varios
                        </p>
                    </div>
                    <div className="p-6 space-y-4">
                        <ToggleOption
                            icon={Split}
                            label="Permitir dividir cuenta"
                            description="Los clientes pueden dividir el pago"
                            enabled={settings.allow_split_bill}
                            onChange={() => toggleSetting('allow_split_bill')}
                        />

                        {settings.allow_split_bill && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="ml-8 pl-6 border-l-2 border-slate-100 space-y-4"
                            >
                                <ToggleOption
                                    icon={Users}
                                    label="Dividir en partes iguales"
                                    description="Ej: €60 entre 3 personas = €20 cada uno"
                                    enabled={settings.allow_split_equal}
                                    onChange={() => toggleSetting('allow_split_equal')}
                                    small
                                />
                                <ToggleOption
                                    icon={Users}
                                    label="Cada uno paga lo suyo"
                                    description="Cada cliente selecciona y paga sus items"
                                    enabled={settings.allow_split_by_item}
                                    onChange={() => toggleSetting('allow_split_by_item')}
                                    small
                                />
                            </motion.div>
                        )}
                    </div>
                </section>

                {/* Propinas */}
                <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Euro size={20} className="text-primary" />
                            Propinas
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Configura las opciones de propina para tus clientes
                        </p>
                    </div>
                    <div className="p-6 space-y-6">
                        <ToggleOption
                            icon={Euro}
                            label="Permitir propinas"
                            description="Los clientes pueden añadir propina al pagar"
                            enabled={settings.tips_enabled}
                            onChange={() => toggleSetting('tips_enabled')}
                        />

                        {settings.tips_enabled && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    Porcentajes sugeridos
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {[5, 10, 15, 20, 25].map((pct) => (
                                        <button
                                            key={pct}
                                            onClick={() => {
                                                const current = settings.tip_percentages;
                                                if (current.includes(pct)) {
                                                    updateTipPercentages(current.filter(p => p !== pct));
                                                } else {
                                                    updateTipPercentages([...current, pct].sort((a, b) => a - b));
                                                }
                                            }}
                                            className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${settings.tip_percentages.includes(pct)
                                                ? 'bg-primary text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                }`}
                                        >
                                            {pct}%
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    Aparecerán como opciones rápidas al momento del pago
                                </p>
                            </motion.div>
                        )}
                    </div>
                </section>

                {/* Impuestos */}
                <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Percent size={20} className="text-primary" />
                            Impuestos (IVA)
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Tasa de IVA
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="number"
                                    min="0"
                                    max="30"
                                    value={settings.tax_rate}
                                    onChange={(e) => setSettings(prev => ({
                                        ...prev,
                                        tax_rate: parseFloat(e.target.value) || 0
                                    }))}
                                    className="w-24 px-4 py-2.5 border border-slate-200 rounded-xl text-center font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                />
                                <span className="text-slate-600 font-medium">%</span>
                            </div>
                        </div>

                        <ToggleOption
                            icon={Euro}
                            label="IVA incluido en precios"
                            description="Los precios del menú ya incluyen el IVA"
                            enabled={settings.tax_included_in_prices}
                            onChange={() => toggleSetting('tax_included_in_prices')}
                        />
                    </div>
                </section>

                {/* Stripe Connection */}
                <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <ShieldCheck size={20} className="text-primary" />
                            Stripe - Pagos Online
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Conecta tu cuenta de Stripe para aceptar pagos con tarjeta
                        </p>
                    </div>
                    <div className="p-6">
                        {settings.stripe_connected ? (
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                                        <Check size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-green-800">Stripe Conectado</p>
                                        <p className="text-sm text-green-600">Pagos online habilitados</p>
                                    </div>
                                </div>
                                <button className="px-4 py-2 bg-white border border-green-300 rounded-lg text-sm font-bold text-green-700 hover:bg-green-50">
                                    Gestionar
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                                    <CreditCard size={28} className="text-slate-400" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">Conecta tu cuenta de Stripe</h3>
                                <p className="text-sm text-slate-500 mb-6 max-w-md mx-auto">
                                    Para aceptar pagos con tarjeta, Apple Pay y Google Pay necesitas conectar una cuenta de Stripe
                                </p>
                                <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#635BFF] hover:bg-[#5851DB] text-white rounded-xl font-bold transition-colors">
                                    <ExternalLink size={18} />
                                    Conectar con Stripe
                                </button>
                            </div>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}

// Toggle Option Component
function ToggleOption({
    icon: Icon,
    label,
    description,
    enabled,
    onChange,
    requiresStripe = false,
    stripeConnected = false,
    small = false,
}: {
    icon: any;
    label: string;
    description: string;
    enabled: boolean;
    onChange: () => void;
    requiresStripe?: boolean;
    stripeConnected?: boolean;
    small?: boolean;
}) {
    const isDisabled = requiresStripe && !stripeConnected;

    return (
        <div className={`flex items-center justify-between ${small ? 'py-2' : 'py-3'} ${isDisabled ? 'opacity-50' : ''}`}>
            <div className="flex items-center gap-3">
                <div className={`${small ? 'w-8 h-8' : 'w-10 h-10'} rounded-xl bg-slate-100 flex items-center justify-center`}>
                    <Icon size={small ? 16 : 20} className="text-slate-600" />
                </div>
                <div>
                    <p className={`font-bold text-slate-900 ${small ? 'text-sm' : ''}`}>{label}</p>
                    <p className={`text-slate-500 ${small ? 'text-xs' : 'text-sm'}`}>{description}</p>
                    {requiresStripe && !stripeConnected && (
                        <p className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                            <AlertCircle size={12} />
                            Requiere conectar Stripe
                        </p>
                    )}
                </div>
            </div>
            <button
                onClick={onChange}
                disabled={isDisabled}
                className={`relative ${small ? 'w-10 h-6' : 'w-12 h-7'} rounded-full transition-colors ${enabled ? 'bg-primary' : 'bg-slate-200'
                    } ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
            >
                <motion.div
                    animate={{ x: enabled ? (small ? 16 : 20) : 2 }}
                    className={`absolute top-1 ${small ? 'w-4 h-4' : 'w-5 h-5'} rounded-full bg-white shadow-sm`}
                />
            </button>
        </div>
    );
}

