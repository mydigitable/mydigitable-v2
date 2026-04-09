"use client";

import { Palette, Globe } from "lucide-react";

interface Props {
    formData: any;
    updateFormData: (data: any) => void;
    planTier: 'basic' | 'pro' | 'premium';
}

export function Step9Appearance({ formData, updateFormData, planTier }: Props) {
    const themes = [
        { id: 'modern', name: 'Moderno', primary: '#22C55E', secondary: '#FFC107' },
        { id: 'elegant', name: 'Elegante', primary: '#1E293B', secondary: '#D4AF37' },
        { id: 'fresh', name: 'Fresco', primary: '#06B6D4', secondary: '#F59E0B' },
        { id: 'warm', name: 'Cálido', primary: '#F97316', secondary: '#FBBF24' },
        { id: 'ocean', name: 'Océano', primary: '#0EA5E9', secondary: '#14B8A6' },
        { id: 'sunset', name: 'Atardecer', primary: '#EC4899', secondary: '#F59E0B' },
    ];

    const languages = [
        { code: 'es', name: 'Español', flag: '🇪🇸' },
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
        { code: 'it', name: 'Italiano', flag: '🇮🇹' },
        { code: 'pt', name: 'Português', flag: '🇵🇹' },
    ];

    const handleThemeSelect = (theme: typeof themes[0]) => {
        updateFormData({
            primary_color: theme.primary,
            secondary_color: theme.secondary,
        });
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Palette className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                    Apariencia
                </h2>
                <p className="text-slate-500">
                    Personaliza el aspecto de tu menú digital
                </p>
            </div>

            {/* Temas */}
            <div className="mb-8">
                <label className="block text-sm font-black text-slate-900 mb-4">
                    🎨 Tema de colores
                </label>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {themes.map((theme) => {
                        const isSelected = formData.primary_color === theme.primary;

                        return (
                            <button
                                key={theme.id}
                                type="button"
                                onClick={() => handleThemeSelect(theme)}
                                className={`p-4 rounded-2xl border-2 transition-all ${isSelected
                                        ? "border-primary bg-primary/5"
                                        : "border-slate-200 hover:border-primary bg-white"
                                    }`}
                            >
                                <div className="flex gap-2 mb-3">
                                    <div
                                        className="w-full h-12 rounded-lg"
                                        style={{ backgroundColor: theme.primary }}
                                    />
                                    <div
                                        className="w-full h-12 rounded-lg"
                                        style={{ backgroundColor: theme.secondary }}
                                    />
                                </div>
                                <p className="font-bold text-slate-900 text-sm">{theme.name}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Colores personalizados */}
            <div className="mb-8">
                <label className="block text-sm font-black text-slate-900 mb-4">
                    🎨 O elige tus propios colores
                </label>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2">
                            Color primario
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={formData.primary_color || '#22C55E'}
                                onChange={(e) => updateFormData({ primary_color: e.target.value })}
                                className="w-16 h-16 rounded-xl cursor-pointer border-2 border-slate-200"
                            />
                            <input
                                type="text"
                                value={formData.primary_color || '#22C55E'}
                                onChange={(e) => updateFormData({ primary_color: e.target.value })}
                                className="flex-1 h-12 px-4 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-primary focus:outline-none font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-2">
                            Color secundario
                        </label>
                        <div className="flex items-center gap-3">
                            <input
                                type="color"
                                value={formData.secondary_color || '#FFC107'}
                                onChange={(e) => updateFormData({ secondary_color: e.target.value })}
                                className="w-16 h-16 rounded-xl cursor-pointer border-2 border-slate-200"
                            />
                            <input
                                type="text"
                                value={formData.secondary_color || '#FFC107'}
                                onChange={(e) => updateFormData({ secondary_color: e.target.value })}
                                className="flex-1 h-12 px-4 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-primary focus:outline-none font-mono text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Idioma */}
            <div>
                <label className="block text-sm font-black text-slate-900 mb-4">
                    🌍 Idioma del menú
                </label>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {languages.map((lang) => (
                        <button
                            key={lang.code}
                            type="button"
                            onClick={() => updateFormData({ default_language: lang.code })}
                            className={`p-4 rounded-2xl border-2 transition-all ${formData.default_language === lang.code
                                    ? "border-primary bg-primary/5"
                                    : "border-slate-200 hover:border-primary bg-white"
                                }`}
                        >
                            <div className="text-3xl mb-2">{lang.flag}</div>
                            <p className="font-bold text-slate-900 text-sm">{lang.name}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Info adicional */}
            <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-sm text-blue-700 font-medium text-center">
                    💡 Podrás cambiar estos colores e idiomas en cualquier momento desde el dashboard
                </p>
            </div>
        </div>
    );
}
