"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Languages, Save, Loader2, Check, Globe } from "lucide-react";

const availableLanguages = [
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'el', name: 'Ελληνικά', flag: '🇬🇷' },
];

export default function LanguagesSettingsPage() {
    const [restaurant, setRestaurant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [defaultLocale, setDefaultLocale] = useState('es');
    const [supportedLocales, setSupportedLocales] = useState<string[]>(['es']);

    const supabase = createClient();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data } = await supabase
            .from("restaurants")
            .select("*")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: true })
            .limit(1)
            .single();

        if (data) {
            setRestaurant(data);
            setDefaultLocale(data.default_locale || 'es');
            setSupportedLocales(data.supported_locales || ['es']);
        }
        setLoading(false);
    };

    const toggleLanguage = (code: string) => {
        if (code === defaultLocale) return; // Can't disable default
        setSupportedLocales(prev =>
            prev.includes(code)
                ? prev.filter(l => l !== code)
                : [...prev, code]
        );
    };

    const setAsDefault = (code: string) => {
        setDefaultLocale(code);
        if (!supportedLocales.includes(code)) {
            setSupportedLocales(prev => [...prev, code]);
        }
    };

    const saveSettings = async () => {
        if (!restaurant) return;
        setSaving(true);
        await supabase
            .from("restaurants")
            .update({
                default_locale: defaultLocale,
                supported_locales: supportedLocales,
            })
            .eq("id", restaurant.id);
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-4xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Idiomas</h1>
                    <p className="text-slate-500 mt-1">Configura los idiomas de tu menú digital</p>
                </div>
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Guardar
                </button>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
                {availableLanguages.map((lang) => (
                    <div key={lang.code} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-4">
                            <span className="text-2xl">{lang.flag}</span>
                            <div>
                                <p className="font-bold text-slate-900">{lang.name}</p>
                                <p className="text-sm text-slate-500">{lang.code.toUpperCase()}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {defaultLocale === lang.code ? (
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-bold">
                                    Por defecto
                                </span>
                            ) : supportedLocales.includes(lang.code) && (
                                <button
                                    onClick={() => setAsDefault(lang.code)}
                                    className="px-3 py-1 text-sm text-slate-500 hover:text-primary transition-colors"
                                >
                                    Hacer principal
                                </button>
                            )}
                            <button
                                onClick={() => toggleLanguage(lang.code)}
                                disabled={lang.code === defaultLocale}
                                className={`w-12 h-7 rounded-full transition-colors relative ${supportedLocales.includes(lang.code) ? 'bg-primary' : 'bg-slate-200'
                                    } ${lang.code === defaultLocale ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${supportedLocales.includes(lang.code) ? 'translate-x-6' : 'translate-x-1'
                                    }`} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

