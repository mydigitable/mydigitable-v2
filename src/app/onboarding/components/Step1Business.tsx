"use client";

import { Building2, Utensils, Coffee, Wine, Umbrella, Waves, Music, Truck, Store } from "lucide-react";
import { OnboardingFormData } from "../page";

interface Props {
    data: OnboardingFormData;
    onUpdate: (data: Partial<OnboardingFormData>) => void;
}

const businessTypes = [
    { id: "restaurant", icon: Utensils, label: "Restaurante", description: "Servicio de comidas completo" },
    { id: "bar", icon: Wine, label: "Bar / Pub", description: "Bebidas y tapas" },
    { id: "cafe", icon: Coffee, label: "Cafetería", description: "Café, desayunos, meriendas" },
    { id: "beach", icon: Umbrella, label: "Chiringuito / Playa", description: "Servicio en playa" },
    { id: "pool", icon: Waves, label: "Pool Bar / Hotel", description: "Servicio en piscina" },
    { id: "events", icon: Music, label: "Eventos / Recitales", description: "Festivales, conciertos" },
    { id: "food_truck", icon: Truck, label: "Food Truck", description: "Comida sobre ruedas" },
    { id: "other", icon: Store, label: "Otro", description: "Cualquier otro tipo" },
];

export function Step1Business({ data, onUpdate }: Props) {
    return (
        <div className="space-y-8">
            {/* Nombre del negocio */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                    <Building2 size={12} />
                    Nombre de tu negocio *
                </label>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    placeholder="Ej: La Terraza de María"
                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-bold text-slate-900 text-lg"
                    autoFocus
                />
            </div>

            {/* Tipo de negocio */}
            <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                    ¿Qué tipo de negocio es?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {businessTypes.map((type) => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => onUpdate({ business_type: type.id })}
                            className={`p-4 rounded-2xl border-2 transition-all text-center ${data.business_type === type.id
                                    ? "border-primary bg-primary/5"
                                    : "border-slate-100 hover:border-slate-200 bg-white"
                                }`}
                        >
                            <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2 ${data.business_type === type.id
                                    ? "bg-primary text-white"
                                    : "bg-slate-100 text-slate-400"
                                }`}>
                                <type.icon size={24} />
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm">{type.label}</h4>
                            <p className="text-[10px] text-slate-400 mt-1">{type.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Descripción corta */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                    Descripción corta (opcional)
                </label>
                <textarea
                    value={data.description}
                    onChange={(e) => onUpdate({ description: e.target.value })}
                    placeholder="Ej: Cocina mediterránea con vistas al mar..."
                    rows={2}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-medium text-slate-900 resize-none"
                />
            </div>
        </div>
    );
}
