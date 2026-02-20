"use client";

import { useState } from "react";
import {
    Banknote,
    CreditCard,
    Smartphone,
    Heart,
    DollarSign,
    Euro,
    AlertCircle
} from "lucide-react";

interface Props {
    formData: any;
    updateFormData: (data: any) => void;
}

interface PaymentOptionProps {
    icon: React.ElementType;
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

function PaymentOption({ icon: Icon, label, description, checked, onChange, disabled }: PaymentOptionProps) {
    return (
        <button
            type="button"
            onClick={() => !disabled && onChange(!checked)}
            disabled={disabled}
            className={`w-full p-5 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${disabled
                    ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                    : checked
                        ? "border-primary bg-primary/5"
                        : "border-slate-100 hover:border-slate-200 bg-white"
                }`}
        >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${disabled
                    ? "bg-slate-200 text-slate-400"
                    : checked
                        ? "bg-primary text-white"
                        : "bg-slate-100 text-slate-400"
                }`}>
                <Icon size={28} />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-slate-900">{label}</h4>
                <p className="text-xs text-slate-400">{description}</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${disabled
                    ? "border-slate-200"
                    : checked
                        ? "border-primary bg-primary"
                        : "border-slate-200"
                }`}>
                {checked && !disabled && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>
        </button>
    );
}

export function Step6Payments({ formData, updateFormData }: Props) {
    const currencies = [
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'USD', symbol: '$', name: 'Dólar' },
        { code: 'MXN', symbol: '$', name: 'Peso Mexicano' },
        { code: 'ARS', symbol: '$', name: 'Peso Argentino' },
        { code: 'COP', symbol: '$', name: 'Peso Colombiano' },
        { code: 'CLP', symbol: '$', name: 'Peso Chileno' },
        { code: 'PEN', symbol: 'S/', name: 'Sol Peruano' },
        { code: 'GBP', symbol: '£', name: 'Libra' },
    ];

    const hasAtLeastOnePayment = formData.accepts_cash || formData.accepts_card;

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                    Pagos y Propinas
                </h2>
                <p className="text-slate-500">
                    Configura cómo recibirás los pagos y las propinas
                </p>
            </div>

            {/* Métodos de Pago */}
            <div className="mb-8">
                <h3 className="text-lg font-black text-slate-900 mb-4">
                    💳 Métodos de pago
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                    ¿Qué métodos de pago aceptas?
                </p>

                {!hasAtLeastOnePayment && (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                        <AlertCircle size={16} className="text-amber-500" />
                        <p className="text-xs text-amber-700 font-medium">
                            Debes seleccionar al menos un método de pago
                        </p>
                    </div>
                )}

                <div className="space-y-3">
                    <PaymentOption
                        icon={Banknote}
                        label="Efectivo"
                        description="Pago en metálico al camarero"
                        checked={formData.accepts_cash}
                        onChange={(checked) => updateFormData({ accepts_cash: checked })}
                    />

                    <PaymentOption
                        icon={CreditCard}
                        label="Tarjeta en local"
                        description="Datáfono, TPV físico"
                        checked={formData.accepts_card}
                        onChange={(checked) => updateFormData({ accepts_card: checked })}
                    />

                    <PaymentOption
                        icon={Smartphone}
                        label="Pago online (Stripe)"
                        description="Próximamente - Tarjeta, Apple Pay, Google Pay..."
                        checked={false}
                        onChange={() => { }}
                        disabled={true}
                    />
                </div>
            </div>

            {/* Moneda */}
            <div className="mb-8">
                <h3 className="text-lg font-black text-slate-900 mb-4">
                    💰 Moneda
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                    ¿En qué moneda trabajas?
                </p>

                <select
                    value={formData.currency || 'EUR'}
                    onChange={(e) => updateFormData({ currency: e.target.value })}
                    className="w-full p-4 rounded-xl border-2 border-slate-200 focus:border-primary focus:outline-none font-medium text-slate-900"
                >
                    {currencies.map(curr => (
                        <option key={curr.code} value={curr.code}>
                            {curr.symbol} {curr.name} ({curr.code})
                        </option>
                    ))}
                </select>
            </div>

            {/* Propinas */}
            <div className="mb-8">
                <h3 className="text-lg font-black text-slate-900 mb-4">
                    💝 Propinas digitales
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                    ¿Quieres activar las propinas digitales?
                </p>

                <div className="space-y-4">
                    {/* Activar propinas */}
                    <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 cursor-pointer hover:border-primary transition-colors">
                        <input
                            type="checkbox"
                            checked={formData.tips_enabled}
                            onChange={(e) => updateFormData({ tips_enabled: e.target.checked })}
                            className="w-5 h-5 text-primary rounded focus:ring-primary"
                        />
                        <div className="flex-1">
                            <p className="font-bold text-slate-900">Activar propinas</p>
                            <p className="text-xs text-slate-500">Los clientes podrán dejar propina al pagar</p>
                        </div>
                    </label>

                    {formData.tips_enabled && (
                        <>
                            {/* Sugerencias de propina */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <label className="block text-sm font-bold text-slate-900 mb-3">
                                    Sugerencias de propina (%)
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[5, 10, 15, 20, 25, 30].map(percent => (
                                        <button
                                            key={percent}
                                            type="button"
                                            onClick={() => {
                                                const current = formData.tip_suggestions || [10, 15, 20];
                                                if (current.includes(percent)) {
                                                    updateFormData({
                                                        tip_suggestions: current.filter((p: number) => p !== percent)
                                                    });
                                                } else if (current.length < 3) {
                                                    updateFormData({
                                                        tip_suggestions: [...current, percent].sort((a, b) => a - b)
                                                    });
                                                }
                                            }}
                                            className={`p-3 rounded-lg font-bold transition-all ${(formData.tip_suggestions || [10, 15, 20]).includes(percent)
                                                    ? 'bg-primary text-white'
                                                    : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-primary'
                                                }`}
                                        >
                                            {percent}%
                                        </button>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    Selecciona hasta 3 opciones
                                </p>
                            </div>

                            {/* Distribución */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <label className="block text-sm font-bold text-slate-900 mb-3">
                                    Distribución de propinas
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => updateFormData({ tips_distribution: 'individual' })}
                                        className={`p-4 rounded-lg font-bold transition-all ${formData.tips_distribution === 'individual'
                                                ? 'bg-primary text-white'
                                                : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-primary'
                                            }`}
                                    >
                                        Individual
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateFormData({ tips_distribution: 'shared' })}
                                        className={`p-4 rounded-lg font-bold transition-all ${formData.tips_distribution === 'shared'
                                                ? 'bg-primary text-white'
                                                : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-primary'
                                            }`}
                                    >
                                        Compartida
                                    </button>
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    {formData.tips_distribution === 'individual'
                                        ? 'Cada camarero recibe sus propias propinas'
                                        : 'Las propinas se reparten entre todo el equipo'
                                    }
                                </p>
                            </div>

                            {/* Frecuencia de pago */}
                            <div className="p-4 bg-slate-50 rounded-xl">
                                <label className="block text-sm font-bold text-slate-900 mb-3">
                                    Frecuencia de pago
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => updateFormData({ tips_payout: 'end_of_shift' })}
                                        className={`p-3 rounded-lg font-bold text-sm transition-all ${formData.tips_payout === 'end_of_shift'
                                                ? 'bg-primary text-white'
                                                : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-primary'
                                            }`}
                                    >
                                        Fin de turno
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateFormData({ tips_payout: 'daily' })}
                                        className={`p-3 rounded-lg font-bold text-sm transition-all ${formData.tips_payout === 'daily'
                                                ? 'bg-primary text-white'
                                                : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-primary'
                                            }`}
                                    >
                                        Diario
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => updateFormData({ tips_payout: 'weekly' })}
                                        className={`p-3 rounded-lg font-bold text-sm transition-all ${formData.tips_payout === 'weekly'
                                                ? 'bg-primary text-white'
                                                : 'bg-white text-slate-600 border-2 border-slate-200 hover:border-primary'
                                            }`}
                                    >
                                        Semanal
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Llamadas al camarero */}
            <div>
                <h3 className="text-lg font-black text-slate-900 mb-4">
                    🔔 Llamadas al camarero
                </h3>
                <p className="text-sm text-slate-500 mb-4">
                    ¿Quieres que los clientes puedan llamar al camarero desde el menú?
                </p>

                <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-slate-200 cursor-pointer hover:border-primary transition-colors mb-4">
                    <input
                        type="checkbox"
                        checked={formData.call_waiter_enabled}
                        onChange={(e) => updateFormData({ call_waiter_enabled: e.target.checked })}
                        className="w-5 h-5 text-primary rounded focus:ring-primary"
                    />
                    <div className="flex-1">
                        <p className="font-bold text-slate-900">Activar llamadas</p>
                        <p className="text-xs text-slate-500">Los clientes verán un botón "Llamar al camarero"</p>
                    </div>
                </label>

                {formData.call_waiter_enabled && (
                    <div className="p-4 bg-slate-50 rounded-xl">
                        <label className="block text-sm font-bold text-slate-900 mb-3">
                            Motivos predeterminados
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {(formData.call_motives || ["Agua", "Cubiertos", "Servilletas", "La cuenta", "Otro"]).map((motive: string, index: number) => (
                                <span
                                    key={index}
                                    className="px-3 py-1.5 bg-white border-2 border-slate-200 rounded-lg text-sm font-medium text-slate-700"
                                >
                                    {motive}
                                </span>
                            ))}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                            Podrás personalizar estos motivos después en el dashboard
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
