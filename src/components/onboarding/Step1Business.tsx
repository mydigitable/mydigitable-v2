"use client";

import { Building2, Utensils, Coffee, Wine, Umbrella, Waves, Music, Truck, Store, Link2 } from "lucide-react";

interface Props {
    data: any;
    onUpdate: (data: any) => void;
}

const businessTypes = [
    { id: "restaurant", icon: Utensils, label: "Restaurante", description: "Servicio de comidas completo" },
    { id: "bar", icon: Wine, label: "Bar / Pub", description: "Bebidas y tapas" },
    { id: "cafe", icon: Coffee, label: "Cafetería", description: "Café, desayunos, meriendas" },
    { id: "beach_club", icon: Umbrella, label: "Beach Club", description: "Chiringuito, playa" },
    { id: "food_truck", icon: Truck, label: "Food Truck", description: "Comida sobre ruedas" },
    { id: "events", icon: Music, label: "Eventos / Recitales", description: "Festivales, conciertos" },
];

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function Step1Business({ data, onUpdate }: Props) {
    const handleNameChange = (name: string) => {
        onUpdate({
            name,
            // Auto-generate slug if not manually edited
            slug: data.slugManuallyEdited ? data.slug : generateSlug(name)
        });
    };

    const handleSlugChange = (slug: string) => {
        onUpdate({
            slug: generateSlug(slug),
            slugManuallyEdited: true
        });
    };

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
                    value={data.name || ""}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ej: La Terraza de María"
                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-bold text-slate-900 text-lg"
                    autoFocus
                />
                {!data.name && (
                    <p className="text-xs text-red-400 ml-1">El nombre es obligatorio</p>
                )}
            </div>

            {/* Slug URL */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                    <Link2 size={12} />
                    URL de tu menú
                </label>
                <div className="flex items-center bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                    <span className="px-4 text-slate-400 text-sm">menu.mydigitable.com/</span>
                    <input
                        type="text"
                        value={data.slug || ""}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="tu-negocio"
                        className="flex-1 h-14 pr-5 bg-transparent outline-none font-bold text-slate-900"
                    />
                </div>
                <p className="text-xs text-slate-400 ml-1">
                    Se genera automáticamente desde el nombre
                </p>
            </div>

            {/* Tipo de negocio */}
            <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">
                    Tipo de negocio
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
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
        </div>
    );
}
