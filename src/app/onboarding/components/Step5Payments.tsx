"use client";

import { Banknote, CreditCard, Smartphone, Apple } from "lucide-react";
import { OnboardingFormData } from "../page";

interface Props {
    data: OnboardingFormData;
    onUpdate: (data: Partial<OnboardingFormData>) => void;
}

interface PaymentOptionProps {
    icon: React.ElementType;
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

function PaymentOption({ icon: Icon, label, description, checked, onChange }: PaymentOptionProps) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`w-full p-5 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${checked
                    ? "border-primary bg-primary/5"
                    : "border-slate-100 hover:border-slate-200 bg-white"
                }`}
        >
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${checked ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                }`}>
                <Icon size={28} />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-slate-900">{label}</h4>
                <p className="text-xs text-slate-400">{description}</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${checked ? "border-primary bg-primary" : "border-slate-200"
                }`}>
                {checked && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </div>
        </button>
    );
}

export function Step5Payments({ data, onUpdate }: Props) {
    const updatePayment = (key: keyof typeof data.payment_settings, value: boolean) => {
        onUpdate({
            payment_settings: {
                ...data.payment_settings,
                [key]: value,
            },
        });
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-500 text-center mb-6">
                Selecciona los métodos de pago que aceptas
            </p>

            <div className="space-y-3">
                <PaymentOption
                    icon={Banknote}
                    label="Efectivo"
                    description="Pago en metálico al camarero"
                    checked={data.payment_settings.accepts_cash}
                    onChange={(checked) => updatePayment('accepts_cash', checked)}
                />

                <PaymentOption
                    icon={CreditCard}
                    label="Tarjeta de crédito/débito"
                    description="Visa, Mastercard, etc."
                    checked={data.payment_settings.accepts_card}
                    onChange={(checked) => updatePayment('accepts_card', checked)}
                />

                <PaymentOption
                    icon={Smartphone}
                    label="Bizum"
                    description="Pago móvil instantáneo (España)"
                    checked={data.payment_settings.accepts_bizum}
                    onChange={(checked) => updatePayment('accepts_bizum', checked)}
                />

                <PaymentOption
                    icon={Apple}
                    label="Apple Pay / Google Pay"
                    description="Pagos contactless desde el móvil"
                    checked={data.payment_settings.accepts_apple_pay}
                    onChange={(checked) => updatePayment('accepts_apple_pay', checked)}
                />
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-sm text-blue-700 font-medium text-center">
                    💳 Podrás conectar <strong>Stripe</strong> después para procesar pagos online con tarjeta
                </p>
            </div>
        </div>
    );
}
