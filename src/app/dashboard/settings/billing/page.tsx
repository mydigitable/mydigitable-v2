"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Check,
    X,
    Loader2,
    CreditCard,
    Receipt,
    Sparkles,
    Crown,
    Zap,
    ArrowRight,
    Download,
    Calendar,
    Euro,
} from "lucide-react";

interface Plan {
    id: string;
    name: string;
    price: number;
    period: string;
    description: string;
    features: string[];
    notIncluded?: string[];
    popular?: boolean;
    current?: boolean;
}

const plans: Plan[] = [
    {
        id: 'basic',
        name: 'Basic',
        price: 0,
        period: 'Gratis para siempre',
        description: 'Perfecto para empezar',
        features: [
            'Menú digital ilimitado',
            'QR codes para mesas',
            'Gestión de pedidos básica',
            'Vista cocina (KDS)',
            'Llamadas de camarero',
            'Hasta 10 mesas',
        ],
        notIncluded: [
            'Analytics avanzados',
            'Promociones y cupones',
            'Programa de fidelización',
            'Múltiples empleados',
            'Delivery integrado',
            'Servicio playa',
        ],
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 29,
        period: '/mes',
        description: 'Para restaurantes en crecimiento',
        features: [
            'Todo lo de Basic +',
            'Analytics completos',
            'Promociones y cupones',
            'Programa de fidelización',
            'Gestión de empleados',
            'Mesas ilimitadas',
            'Delivery integrado',
            'Servicio playa/terraza',
            'Integraciones (Stripe, POS)',
            'Soporte prioritario',
        ],
        popular: true,
    },
    {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99,
        period: '/mes',
        description: 'Para cadenas y franquicias',
        features: [
            'Todo lo de Pro +',
            'Múltiples locales',
            'Dashboard centralizado',
            'API personalizada',
            'Onboarding dedicado',
            'SLA garantizado',
            'White label',
            'Facturación consolidada',
        ],
    },
];

export default function BillingPage() {
    const [loading, setLoading] = useState(true);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [currentPlan, setCurrentPlan] = useState<string>('basic');
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const supabase = createClient();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
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
                setCurrentPlan(restaurantData.subscription_plan || 'basic');
            }
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpgrade = async (planId: string) => {
        // Here you would integrate with Stripe or your payment provider

        alert(`Próximamente: Integración con Stripe para el plan ${planId}`);
    };

    const getYearlyPrice = (monthlyPrice: number) => {
        return Math.round(monthlyPrice * 10); // 2 months free
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-black text-slate-900 mb-2">Plan y Facturación</h1>
                <p className="text-slate-500">
                    Elige el plan que mejor se adapte a tu negocio
                </p>
            </div>

            {/* Current Plan Info */}
            <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 rounded-2xl p-6 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center">
                            {currentPlan === 'basic' && <Zap size={28} className="text-white" />}
                            {currentPlan === 'pro' && <Sparkles size={28} className="text-white" />}
                            {currentPlan === 'enterprise' && <Crown size={28} className="text-white" />}
                        </div>
                        <div>
                            <p className="text-sm text-slate-500">Tu plan actual</p>
                            <h2 className="text-2xl font-black text-slate-900 capitalize">{currentPlan}</h2>
                        </div>
                    </div>
                    {currentPlan === 'basic' && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-600">
                                🎉 ¡Mejora a Pro y obtén 2 meses gratis anual!
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Billing Cycle Toggle */}
            <div className="flex justify-center mb-8">
                <div className="bg-slate-100 p-1 rounded-xl inline-flex">
                    <button
                        onClick={() => setBillingCycle('monthly')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors ${billingCycle === 'monthly'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Mensual
                    </button>
                    <button
                        onClick={() => setBillingCycle('yearly')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${billingCycle === 'yearly'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Anual
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded-full">
                            -17%
                        </span>
                    </button>
                </div>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {plans.map((plan) => {
                    const isCurrentPlan = currentPlan === plan.id;
                    const price = billingCycle === 'yearly' && plan.price > 0
                        ? getYearlyPrice(plan.price)
                        : plan.price;

                    return (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`relative bg-white rounded-3xl border-2 overflow-hidden ${plan.popular
                                ? 'border-primary shadow-xl shadow-primary/10'
                                : isCurrentPlan
                                    ? 'border-primary/30'
                                    : 'border-slate-100'
                                }`}
                        >
                            {/* Popular Badge */}
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-4 py-1 rounded-bl-xl">
                                    POPULAR
                                </div>
                            )}

                            {isCurrentPlan && (
                                <div className="absolute top-0 left-0 bg-primary/10 text-primary text-xs font-bold px-4 py-1 rounded-br-xl">
                                    TU PLAN
                                </div>
                            )}

                            <div className="p-6">
                                {/* Plan Header */}
                                <div className="mb-6">
                                    <h3 className="text-xl font-black text-slate-900">{plan.name}</h3>
                                    <p className="text-sm text-slate-500">{plan.description}</p>
                                </div>

                                {/* Price */}
                                <div className="mb-6">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-black text-slate-900">
                                            €{price}
                                        </span>
                                        {plan.price > 0 && (
                                            <span className="text-slate-500">
                                                /{billingCycle === 'yearly' ? 'año' : 'mes'}
                                            </span>
                                        )}
                                    </div>
                                    {plan.price === 0 && (
                                        <p className="text-sm text-slate-400">{plan.period}</p>
                                    )}
                                    {billingCycle === 'yearly' && plan.price > 0 && (
                                        <p className="text-sm text-green-600 font-medium">
                                            Ahorras €{plan.price * 12 - price}/año
                                        </p>
                                    )}
                                </div>

                                {/* CTA */}
                                {isCurrentPlan ? (
                                    <button
                                        disabled
                                        className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm"
                                    >
                                        Plan Actual
                                    </button>
                                ) : plan.price > 0 ? (
                                    <button
                                        onClick={() => handleUpgrade(plan.id)}
                                        className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${plan.popular
                                            ? 'bg-primary hover:bg-primary/90 text-white'
                                            : 'bg-slate-900 hover:bg-slate-800 text-white'
                                            }`}
                                    >
                                        Mejorar Plan
                                        <ArrowRight size={16} />
                                    </button>
                                ) : (
                                    <button
                                        disabled
                                        className="w-full py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm"
                                    >
                                        Actual
                                    </button>
                                )}
                            </div>

                            {/* Features */}
                            <div className="p-6 pt-0">
                                <p className="text-xs font-bold text-slate-500 uppercase mb-3">
                                    Características incluidas
                                </p>
                                <ul className="space-y-2">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm">
                                            <Check size={16} className="text-primary flex-shrink-0 mt-0.5" />
                                            <span className="text-slate-700">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {plan.notIncluded && plan.notIncluded.length > 0 && (
                                    <>
                                        <p className="text-xs font-bold text-slate-400 uppercase mt-4 mb-3">
                                            No incluido
                                        </p>
                                        <ul className="space-y-2">
                                            {plan.notIncluded.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm">
                                                    <X size={16} className="text-slate-300 flex-shrink-0 mt-0.5" />
                                                    <span className="text-slate-400">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Add-ons Section */}
            <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-8">
                <div className="p-6 border-b border-slate-100">
                    <h3 className="font-bold text-slate-900 text-lg">Complementos</h3>
                    <p className="text-sm text-slate-500">Añade funcionalidades extra a tu plan</p>
                </div>
                <div className="p-6 space-y-4">
                    {/* Custom Theme Add-on */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                <Sparkles size={24} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Tema Personalizado</h4>
                                <p className="text-sm text-slate-600">
                                    Editor CSS completo + Editor visual con inputs para un menú 100% único
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="text-2xl font-black text-slate-900">€50</span>
                                <p className="text-xs text-green-600 font-medium">Pago único</p>
                            </div>
                            <button
                                onClick={() => alert('Próximamente: Integración con Stripe para el complemento de tema personalizado')}
                                className="px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                            >
                                Activar
                            </button>
                        </div>
                    </div>

                    {/* Priority Support Add-on */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                                <Crown size={24} className="text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">Soporte VIP</h4>
                                <p className="text-sm text-slate-600">
                                    Respuesta en menos de 1 hora + Llamadas de soporte + Manager dedicado
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <span className="text-2xl font-black text-slate-900">+€25</span>
                                <span className="text-slate-500">/mes</span>
                            </div>
                            <button
                                onClick={() => alert('Próximamente: Integración con Stripe para el soporte VIP')}
                                className="px-4 py-2.5 bg-blue-500 text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors"
                            >
                                Activar
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payment Methods & Invoices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Payment Methods */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <CreditCard size={20} className="text-primary" />
                            Método de Pago
                        </h3>
                    </div>
                    <div className="p-6">
                        {currentPlan === 'basic' ? (
                            <p className="text-slate-500 text-sm">
                                No tienes ningún método de pago configurado.
                                Añade uno al mejorar tu plan.
                            </p>
                        ) : (
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                        VISA
                                    </div>
                                    <div>
                                        <p className="font-medium text-slate-900">•••• 4242</p>
                                        <p className="text-xs text-slate-500">Expira 12/26</p>
                                    </div>
                                </div>
                                <button className="text-sm font-bold text-primary hover:underline">
                                    Cambiar
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Invoices */}
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <h3 className="font-bold text-slate-900 flex items-center gap-2">
                            <Receipt size={20} className="text-primary" />
                            Facturas
                        </h3>
                    </div>
                    <div className="p-6">
                        {currentPlan === 'basic' ? (
                            <p className="text-slate-500 text-sm">
                                No tienes facturas. Las facturas aparecerán aquí cuando actualices a un plan de pago.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {[
                                    { date: '1 Ene 2026', amount: 29, status: 'Pagada' },
                                    { date: '1 Dic 2025', amount: 29, status: 'Pagada' },
                                    { date: '1 Nov 2025', amount: 29, status: 'Pagada' },
                                ].map((invoice, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                                        <div className="flex items-center gap-3">
                                            <Calendar size={16} className="text-slate-400" />
                                            <span className="text-sm text-slate-700">{invoice.date}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="font-bold text-slate-900">€{invoice.amount}</span>
                                            <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                                {invoice.status}
                                            </span>
                                            <button className="p-1 hover:bg-slate-100 rounded">
                                                <Download size={14} className="text-slate-400" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* FAQ */}
            <div className="mt-12 text-center">
                <p className="text-slate-500 mb-4">
                    ¿Tienes preguntas sobre los planes?
                </p>
                <a
                    href="mailto:soporte@mydigitable.com"
                    className="text-primary font-bold hover:underline"
                >
                    Contacta con nuestro equipo →
                </a>
            </div>
        </div>
    );
}

