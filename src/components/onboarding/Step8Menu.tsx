"use client";

import { UtensilsCrossed, FileText, Sparkles, Zap } from "lucide-react";

interface Props {
    formData: any;
    updateFormData: (data: any) => void;
}

export function Step8Menu({ formData, updateFormData }: Props) {
    const options = [
        {
            id: 'empty',
            icon: FileText,
            title: 'Menú vacío',
            description: 'Lo llenaré yo mismo después',
            recommended: false,
        },
        {
            id: 'demo',
            icon: Zap,
            title: 'Menú de demostración',
            description: 'Para probar la plataforma',
            recommended: true,
        },
        {
            id: 'ai',
            icon: Sparkles,
            title: 'Importar con IA',
            description: 'Próximamente - Sube foto de tu menú',
            disabled: true,
        },
    ];

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <UtensilsCrossed className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                    Tu Menú
                </h2>
                <p className="text-slate-500">
                    ¿Cómo quieres empezar con tu menú?
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {options.map((option) => (
                    <button
                        key={option.id}
                        type="button"
                        onClick={() => !option.disabled && updateFormData({ menu_option: option.id })}
                        disabled={option.disabled}
                        className={`relative p-6 rounded-2xl border-2 transition-all text-center ${option.disabled
                                ? "border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed"
                                : formData.menu_option === option.id
                                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                                    : "border-slate-200 hover:border-primary bg-white hover:scale-105"
                            }`}
                    >
                        {option.recommended && (
                            <span className="absolute top-3 right-3 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                                Recomendado
                            </span>
                        )}

                        <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center mb-4 ${option.disabled
                                ? "bg-slate-200 text-slate-400"
                                : formData.menu_option === option.id
                                    ? "bg-primary text-white"
                                    : "bg-slate-100 text-slate-400"
                            }`}>
                            <option.icon size={32} />
                        </div>

                        <h4 className="font-bold text-slate-900 text-lg mb-2">{option.title}</h4>
                        <p className="text-sm text-slate-500">{option.description}</p>
                    </button>
                ))}
            </div>

            {/* Info adicional */}
            <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-sm text-blue-700 font-medium text-center">
                    💡 No te preocupes, podrás editar y personalizar tu menú completamente desde el dashboard
                </p>
            </div>
        </div>
    );
}
