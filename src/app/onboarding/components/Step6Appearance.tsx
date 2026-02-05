"use client";

import { Check, Sun, Moon, Monitor } from "lucide-react";
import { OnboardingFormData } from "../page";

interface Props {
    data: OnboardingFormData;
    onUpdate: (data: Partial<OnboardingFormData>) => void;
}

const colorPalette = [
    { name: "Verde", value: "#22C55E", class: "bg-green-500" },
    { name: "Azul", value: "#3B82F6", class: "bg-blue-500" },
    { name: "Rojo", value: "#EF4444", class: "bg-red-500" },
    { name: "Naranja", value: "#F97316", class: "bg-orange-500" },
    { name: "Morado", value: "#8B5CF6", class: "bg-purple-500" },
    { name: "Rosa", value: "#EC4899", class: "bg-pink-500" },
    { name: "Amarillo", value: "#EAB308", class: "bg-yellow-500" },
    { name: "Cyan", value: "#06B6D4", class: "bg-cyan-500" },
    { name: "Índigo", value: "#6366F1", class: "bg-indigo-500" },
    { name: "Slate", value: "#64748B", class: "bg-slate-500" },
    { name: "Negro", value: "#18181B", class: "bg-zinc-900" },
    { name: "Dorado", value: "#CA8A04", class: "bg-yellow-600" },
];

const themes = [
    { id: "light", label: "Claro", icon: Sun, description: "Fondo blanco, ideal para el día" },
    { id: "dark", label: "Oscuro", icon: Moon, description: "Fondo oscuro, moderno y elegante" },
    { id: "auto", label: "Automático", icon: Monitor, description: "Según el dispositivo del cliente" },
];

export function Step6Appearance({ data, onUpdate }: Props) {
    return (
        <div className="space-y-8">
            {/* Color Principal */}
            <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Color principal</h3>
                <div className="grid grid-cols-6 gap-3">
                    {colorPalette.map((color) => (
                        <button
                            key={color.value}
                            type="button"
                            onClick={() => onUpdate({ primary_color: color.value })}
                            className={`aspect-square rounded-2xl transition-all relative ${color.class} ${data.primary_color === color.value
                                    ? "ring-4 ring-offset-2 ring-slate-900 scale-110"
                                    : "hover:scale-105"
                                }`}
                            title={color.name}
                        >
                            {data.primary_color === color.value && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Check size={20} className="text-white drop-shadow-lg" strokeWidth={3} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                {/* Custom color */}
                <div className="mt-4 flex items-center gap-3">
                    <span className="text-xs text-slate-400">O elige tu propio color:</span>
                    <input
                        type="color"
                        value={data.primary_color}
                        onChange={(e) => onUpdate({ primary_color: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer border-2 border-slate-200"
                    />
                    <span className="text-xs font-mono text-slate-500">{data.primary_color}</span>
                </div>
            </div>

            {/* Tema del menú */}
            <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Tema del menú</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {themes.map((theme) => (
                        <button
                            key={theme.id}
                            type="button"
                            onClick={() => onUpdate({ theme: theme.id as 'light' | 'dark' | 'auto' })}
                            className={`p-4 rounded-2xl border-2 transition-all text-left ${data.theme === theme.id
                                    ? "border-primary bg-primary/5"
                                    : "border-slate-100 hover:border-slate-200"
                                }`}
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${data.theme === theme.id ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                                }`}>
                                <theme.icon size={20} />
                            </div>
                            <h4 className="font-bold text-slate-900">{theme.label}</h4>
                            <p className="text-xs text-slate-400">{theme.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Preview */}
            <div className="p-6 bg-slate-50 rounded-2xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Vista previa</h3>
                <div
                    className={`rounded-2xl p-6 transition-all ${data.theme === 'dark' ? 'bg-slate-900' : 'bg-white'
                        }`}
                    style={{ borderLeft: `4px solid ${data.primary_color}` }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black"
                            style={{ backgroundColor: data.primary_color }}
                        >
                            {data.name ? data.name.charAt(0).toUpperCase() : "M"}
                        </div>
                        <div>
                            <h4 className={`font-bold ${data.theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {data.name || "Tu Restaurante"}
                            </h4>
                            <p className={`text-xs ${data.theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                {data.description || "Tu descripción aquí"}
                            </p>
                        </div>
                    </div>
                    <button
                        className="w-full py-3 rounded-xl font-bold text-white text-sm"
                        style={{ backgroundColor: data.primary_color }}
                    >
                        Ver menú
                    </button>
                </div>
            </div>
        </div>
    );
}
