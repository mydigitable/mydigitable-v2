"use client";

import { Check, Sun, Moon, Monitor, Palette } from "lucide-react";

interface Props {
    data: any;
    onUpdate: (data: any) => void;
}

const themeOptions = [
    { id: "classic", label: "Classic", description: "Limpio y profesional" },
    { id: "dark", label: "Dark", description: "Moderno y elegante" },
    { id: "light", label: "Light", description: "Simple y luminoso" },
];

const colorPalette = [
    { name: "Verde", value: "#22C55E", class: "bg-green-500" },
    { name: "Azul", value: "#3B82F6", class: "bg-blue-500" },
    { name: "Rojo", value: "#EF4444", class: "bg-red-500" },
    { name: "Naranja", value: "#F97316", class: "bg-orange-500" },
    { name: "Morado", value: "#8B5CF6", class: "bg-purple-500" },
    { name: "Rosa", value: "#EC4899", class: "bg-pink-500" },
    { name: "Amarillo", value: "#EAB308", class: "bg-yellow-500" },
    { name: "Cyan", value: "#06B6D4", class: "bg-cyan-500" },
    { name: "Negro", value: "#18181B", class: "bg-zinc-900" },
    { name: "Dorado", value: "#CA8A04", class: "bg-yellow-600" },
];

export function Step9Appearance({ data, onUpdate }: Props) {
    const selectedTheme = data.theme_id || "classic";
    const selectedColor = data.primary_color || "#22C55E";

    return (
        <div className="space-y-8">
            {/* Theme Selector */}
            <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
                    <Palette size={12} />
                    Tema del Dashboard
                </h3>
                <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((theme) => (
                        <button
                            key={theme.id}
                            type="button"
                            onClick={() => onUpdate({ theme_id: theme.id })}
                            className={`p-4 rounded-2xl border-2 transition-all text-center ${selectedTheme === theme.id
                                    ? "border-primary bg-primary/5"
                                    : "border-slate-100 hover:border-slate-200"
                                }`}
                        >
                            <div className={`w-12 h-12 mx-auto rounded-xl mb-3 flex items-center justify-center ${theme.id === "dark"
                                    ? "bg-slate-900 text-white"
                                    : theme.id === "light"
                                        ? "bg-white border border-slate-200 text-slate-600"
                                        : "bg-slate-100 text-slate-600"
                                }`}>
                                {theme.id === "dark" ? <Moon size={20} /> :
                                    theme.id === "light" ? <Sun size={20} /> :
                                        <Monitor size={20} />}
                            </div>
                            <h4 className="font-bold text-slate-900 text-sm">{theme.label}</h4>
                            <p className="text-[10px] text-slate-400 mt-1">{theme.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Principal */}
            <div>
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                    Color principal
                </h3>
                <div className="grid grid-cols-5 gap-3">
                    {colorPalette.map((color) => (
                        <button
                            key={color.value}
                            type="button"
                            onClick={() => onUpdate({ primary_color: color.value })}
                            className={`aspect-square rounded-2xl transition-all relative ${color.class} ${selectedColor === color.value
                                    ? "ring-4 ring-offset-2 ring-slate-900 scale-110"
                                    : "hover:scale-105"
                                }`}
                            title={color.name}
                        >
                            {selectedColor === color.value && (
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
                        value={selectedColor}
                        onChange={(e) => onUpdate({ primary_color: e.target.value })}
                        className="w-10 h-10 rounded-xl cursor-pointer border-2 border-slate-200"
                    />
                    <span className="text-xs font-mono text-slate-500">{selectedColor}</span>
                </div>
            </div>

            {/* Preview */}
            <div className="p-6 bg-slate-50 rounded-2xl">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Vista previa</h3>
                <div
                    className={`rounded-2xl p-6 transition-all ${selectedTheme === 'dark' ? 'bg-slate-900' : 'bg-white'
                        }`}
                    style={{ borderLeft: `4px solid ${selectedColor}` }}
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black"
                            style={{ backgroundColor: selectedColor }}
                        >
                            {data.name ? data.name.charAt(0).toUpperCase() : "M"}
                        </div>
                        <div>
                            <h4 className={`font-bold ${selectedTheme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                {data.name || "Tu Negocio"}
                            </h4>
                            <p className={`text-xs ${selectedTheme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                Dashboard preview
                            </p>
                        </div>
                    </div>
                    <button
                        className="w-full py-3 rounded-xl font-bold text-white text-sm"
                        style={{ backgroundColor: selectedColor }}
                    >
                        Botón de ejemplo
                    </button>
                </div>
            </div>
        </div>
    );
}
