"use client";

import { FileText, Sparkles, Clock } from "lucide-react";

interface Props {
    data: any;
    onUpdate: (data: any) => void;
}

const menuOptions = [
    {
        id: "empty",
        icon: FileText,
        title: "Crear menú vacío",
        description: "Solo estructura básica, tú añades los productos",
        recommended: true,
    },
    {
        id: "demo",
        icon: Sparkles,
        title: "Importar menú demo",
        description: "Datos de ejemplo para explorar el sistema",
        recommended: false,
    },
    {
        id: "later",
        icon: Clock,
        title: "Lo hago después",
        description: "Configuraré el menú desde el dashboard",
        recommended: false,
    },
];

export function Step8Menu({ data, onUpdate }: Props) {
    const selected = data.menu_option || "empty";

    return (
        <div className="space-y-6">
            <p className="text-sm text-slate-500 text-center mb-6">
                ¿Cómo quieres empezar con tu menú digital?
            </p>

            <div className="space-y-4">
                {menuOptions.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => onUpdate({ menu_option: option.id })}
                        className={`w-full p-5 rounded-2xl border-2 transition-all text-left flex items-start gap-4 relative ${selected === option.id
                                ? "border-primary bg-primary/5"
                                : "border-slate-100 hover:border-slate-200 bg-white"
                            }`}
                    >
                        {option.recommended && (
                            <span className="absolute -top-2 -right-2 px-2 py-1 bg-primary text-white text-[10px] font-black rounded-full">
                                RECOMENDADO
                            </span>
                        )}

                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${selected === option.id
                                ? "bg-primary text-white"
                                : "bg-slate-100 text-slate-400"
                            }`}>
                            <option.icon size={28} />
                        </div>

                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 mb-1">{option.title}</h4>
                            <p className="text-sm text-slate-500">{option.description}</p>
                        </div>

                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-2 ${selected === option.id
                                ? "border-primary bg-primary"
                                : "border-slate-200"
                            }`}>
                            {selected === option.id && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            {/* Info for each option */}
            {selected === "empty" && (
                <div className="p-4 bg-green-50 rounded-2xl border border-green-200">
                    <p className="text-sm text-green-700">
                        ✅ Se creará una categoría "General" vacía. Podrás añadir tus productos desde el dashboard.
                    </p>
                </div>
            )}

            {selected === "demo" && (
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200">
                    <p className="text-sm text-blue-700">
                        📋 Incluye: 3 categorías (Entrantes, Principales, Postres) con 5 productos de ejemplo cada una.
                    </p>
                </div>
            )}

            {selected === "later" && (
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200">
                    <p className="text-sm text-amber-700">
                        ⏰ No te preocupes. Encontrarás el editor de menú en Dashboard → Menú
                    </p>
                </div>
            )}
        </div>
    );
}
