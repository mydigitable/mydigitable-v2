"use client";

import { Utensils, Umbrella, Waves, Truck, ShoppingBag, CalendarCheck, Bell, ShoppingCart } from "lucide-react";
import { OnboardingFormData } from "../page";

interface Props {
    data: OnboardingFormData;
    onUpdate: (data: Partial<OnboardingFormData>) => void;
}

interface ToggleOptionProps {
    icon: React.ElementType;
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
    color?: string;
}

function ToggleOption({ icon: Icon, label, description, checked, onChange, color = "primary" }: ToggleOptionProps) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`w-full p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${checked
                    ? "border-primary bg-primary/5"
                    : "border-slate-100 hover:border-slate-200 bg-white"
                }`}
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${checked ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                }`}>
                <Icon size={24} />
            </div>
            <div className="flex-1">
                <h4 className="font-bold text-slate-900 mb-0.5">{label}</h4>
                <p className="text-xs text-slate-400">{description}</p>
            </div>
            <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${checked ? "border-primary bg-primary" : "border-slate-200"
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

export function Step3Modes({ data, onUpdate }: Props) {
    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-500 text-center mb-6">
                Selecciona los modos de operación que aplican a tu negocio
            </p>

            {/* Operation Modes */}
            <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Tipo de negocio</h3>

                <ToggleOption
                    icon={Utensils}
                    label="Restaurante / Bar / Cafetería"
                    description="Servicio tradicional en mesas"
                    checked={data.mode_restaurant}
                    onChange={(checked) => onUpdate({ mode_restaurant: checked })}
                />

                <ToggleOption
                    icon={Umbrella}
                    label="Servicio de Playa"
                    description="Hamacas, sombrillas, chiringuito"
                    checked={data.mode_beach}
                    onChange={(checked) => onUpdate({ mode_beach: checked })}
                />

                <ToggleOption
                    icon={Waves}
                    label="Servicio de Piscina"
                    description="Pool bar, tumbonas"
                    checked={data.mode_pool}
                    onChange={(checked) => onUpdate({ mode_pool: checked })}
                />
            </div>

            {/* Service Options */}
            <div className="space-y-3 pt-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3">Opciones de servicio</h3>

                <ToggleOption
                    icon={ShoppingCart}
                    label="Pedidos en local"
                    description="Clientes pueden hacer pedidos desde su mesa"
                    checked={data.accepts_orders}
                    onChange={(checked) => onUpdate({ accepts_orders: checked })}
                />

                <ToggleOption
                    icon={Bell}
                    label="Llamadas a camarero"
                    description="Botón para solicitar atención"
                    checked={data.accepts_waiter_calls}
                    onChange={(checked) => onUpdate({ accepts_waiter_calls: checked })}
                />

                <ToggleOption
                    icon={ShoppingBag}
                    label="Para llevar (Takeaway)"
                    description="Recogida en local"
                    checked={data.accepts_takeaway}
                    onChange={(checked) => onUpdate({ accepts_takeaway: checked })}
                />

                <ToggleOption
                    icon={Truck}
                    label="Delivery"
                    description="Envío a domicilio"
                    checked={data.accepts_delivery}
                    onChange={(checked) => onUpdate({ accepts_delivery: checked })}
                />

                <ToggleOption
                    icon={CalendarCheck}
                    label="Reservas"
                    description="Sistema de reserva de mesas"
                    checked={data.accepts_reservations}
                    onChange={(checked) => onUpdate({ accepts_reservations: checked })}
                />
            </div>
        </div>
    );
}
