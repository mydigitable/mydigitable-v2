"use client";

import { Utensils, Umbrella, Waves, Truck, ShoppingBag, Music, AlertCircle } from "lucide-react";

interface Props {
    data: any;
    onUpdate: (data: any) => void;
}

interface ModeOptionProps {
    icon: React.ElementType;
    label: string;
    description: string;
    checked: boolean;
    onChange: (checked: boolean) => void;
}

function ModeOption({ icon: Icon, label, description, checked, onChange }: ModeOptionProps) {
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

export function Step4Modes({ data, onUpdate }: Props) {
    const modes = [
        data.mode_dine_in,
        data.accepts_takeaway,
        data.accepts_delivery,
        data.mode_beach,
        data.mode_events
    ];
    const hasAtLeastOne = modes.some(Boolean);

    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-500 text-center mb-6">
                ¿Cómo opera tu negocio? Selecciona todos los que apliquen
            </p>

            {!hasAtLeastOne && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl mb-4">
                    <AlertCircle size={16} className="text-amber-500" />
                    <p className="text-xs text-amber-700 font-medium">Debes seleccionar al menos un modo</p>
                </div>
            )}

            <div className="space-y-3">
                <ModeOption
                    icon={Utensils}
                    label="Dine-In (Comer en local)"
                    description="Servicio en mesas del establecimiento"
                    checked={data.mode_dine_in ?? true}
                    onChange={(checked) => onUpdate({ mode_dine_in: checked })}
                />

                <ModeOption
                    icon={ShoppingBag}
                    label="Takeaway (Para llevar)"
                    description="Recogida en local"
                    checked={data.accepts_takeaway ?? true}
                    onChange={(checked) => onUpdate({ accepts_takeaway: checked })}
                />

                <ModeOption
                    icon={Truck}
                    label="Delivery (A domicilio)"
                    description="Envío a domicilio del cliente"
                    checked={data.accepts_delivery ?? false}
                    onChange={(checked) => onUpdate({ accepts_delivery: checked })}
                />

                <ModeOption
                    icon={Umbrella}
                    label="Beach Service (Playa)"
                    description="Hamacas, sombrillas, chiringuito"
                    checked={data.mode_beach ?? false}
                    onChange={(checked) => onUpdate({ mode_beach: checked })}
                />

                <ModeOption
                    icon={Music}
                    label="Eventos / Recitales"
                    description="Venta en festivales y conciertos"
                    checked={data.mode_events ?? false}
                    onChange={(checked) => onUpdate({ mode_events: checked })}
                />
            </div>
        </div>
    );
}
