"use client";

import { Building2, Utensils, Coffee, Wine, Umbrella, Truck, Music, Link2, Store } from "lucide-react";

interface Props {
    formData: any;
    updateFormData: (data: any) => void;
    restaurantName: string;
}

const businessTypes = [
    { id: "restaurant", icon: Utensils, label: "Restaurante", description: "Servicio de comidas completo" },
    { id: "bar", icon: Wine, label: "Bar / Pub", description: "Bebidas y tapas" },
    { id: "cafe", icon: Coffee, label: "Cafetería", description: "Café, desayunos, meriendas" },
    { id: "beach_club", icon: Umbrella, label: "Beach Club", description: "Chiringuito, playa" },
    { id: "food_truck", icon: Truck, label: "Food Truck", description: "Comida sobre ruedas" },
    { id: "hotel", icon: Building2, label: "Hotel", description: "Alojamiento con restaurante" },
    { id: "event", icon: Music, label: "Eventos", description: "Festivales, conciertos" },
];

export function Step1Business({ formData, updateFormData, restaurantName }: Props) {
    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Store className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                    ¡Bienvenido!
                </h2>
                <p className="text-slate-500">
                    Vamos a configurar tu negocio paso a paso
                </p>
            </div>

            {/* Nombre del negocio */}
            <div className="mb-8">
                <label className="block text-sm font-black text-slate-900 mb-3">
                    📝 Nombre de tu negocio
                </label>
                <input
                    type="text"
                    value={restaurantName}
                    disabled
                    className="w-full h-14 px-5 rounded-xl bg-slate-50 border-2 border-slate-200 font-bold text-slate-900 text-lg cursor-not-allowed"
                />
                <p className="text-xs text-slate-500 mt-2">
                    Este nombre viene de tu registro. Podrás cambiarlo después en el dashboard.
                </p>
            </div>

            {/* Tipo de negocio */}
            <div>
                <label className="block text-sm font-black text-slate-900 mb-3">
                    🏪 Tipo de negocio
                </label>
                <p className="text-sm text-slate-500 mb-4">
                    Selecciona el que mejor describa tu negocio
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {businessTypes.map((type) => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => updateFormData({ business_type: type.id })}
                            className={`p-5 rounded-2xl border-2 transition-all text-center hover:scale-105 ${formData.business_type === type.id
                                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                                    : "border-slate-200 hover:border-primary bg-white"
                                }`}
                        >
                            <div className={`w-14 h-14 mx-auto rounded-xl flex items-center justify-center mb-3 transition-all ${formData.business_type === type.id
                                    ? "bg-primary text-white"
                                    : "bg-slate-100 text-slate-400"
                                }`}>
                                <type.icon size={28} />
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm mb-1">{type.label}</h4>
                            <p className="text-xs text-slate-500">{type.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Info adicional */}
            <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-sm text-blue-700 font-medium text-center">
                    💡 Podrás subir tu logo y personalizar la apariencia en los siguientes pasos
                </p>
            </div>
        </div>
    );
}
