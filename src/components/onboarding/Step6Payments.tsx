"use client";

import { Banknote, CreditCard, Smartphone, AlertCircle } from "lucide-react";

interface Props {
    data: any;
    onUpdate: (data: any) => void;
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

export function Step6Payments({ data, onUpdate }: Props) {
    const settings = data.payment_settings || {
        accepts_cash: true,
        accepts_card: true,
        accepts_online: false,
    };

    const updatePayment = (key: string, value: boolean) => {
        onUpdate({
            payment_settings: {
                ...settings,
                [key]: value,
            },
        });
    };

    const hasAtLeastOne = settings.accepts_cash || settings.accepts_card;

    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-500 text-center mb-6">
                ¿Qué métodos de pago aceptas?
            </p>

            {!hasAtLeastOne && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                    <AlertCircle size={16} className="text-amber-500" />
                    <p className="text-xs text-amber-700 font-medium">Debes seleccionar al menos un método de pago</p>
                </div>
            )}

            <div className="space-y-3">
                <PaymentOption
                    icon={Banknote}
                    label="Efectivo"
                    description="Pago en metálico al camarero"
                    checked={settings.accepts_cash}
                    onChange={(checked) => updatePayment('accepts_cash', checked)}
                />

                <PaymentOption
                    icon={CreditCard}
                    label="Tarjeta en local"
                    description="Datáfono, TPV"
                    checked={settings.accepts_card}
                    onChange={(checked) => updatePayment('accepts_card', checked)}
                />

                <PaymentOption
                    icon={Smartphone}
                    label="Pago online"
                    description="Próximamente - Stripe, Bizum..."
                    checked={false}
                    onChange={() => { }}
                    disabled={true}
                />
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-sm text-blue-700 font-medium text-center">
                    💳 Podrás conectar <strong>Stripe</strong> después para procesar pagos online
                </p>
            </div>
        </div>
    );
}
