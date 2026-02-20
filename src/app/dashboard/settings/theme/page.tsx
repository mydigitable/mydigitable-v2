"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Palette,
    Check,
    Loader2,
    Eye,
    Lock,
    Sparkles,
    Code,
    Smartphone,
    ExternalLink,
    Crown,
    Zap,
    Download,
} from "lucide-react";
import Link from "next/link";

interface Theme {
    id: string;
    name: string;
    description: string;
    category: 'minimal' | 'modern' | 'bold' | 'elegant' | 'fun';
    isPro: boolean;
    colors: {
        primary: string;
        secondary: string;
        background: string;
        text: string;
    };
}

const themes: Theme[] = [
    {
        id: 'classic',
        name: 'Classic',
        description: 'Limpio y profesional. Ideal para cualquier restaurante.',
        category: 'minimal',
        isPro: false,
        colors: { primary: '#22C55E', secondary: '#10B981', background: '#FFFFFF', text: '#1E293B' },
    },
    {
        id: 'midnight',
        name: 'Midnight',
        description: 'Elegante modo oscuro con acentos dorados.',
        category: 'elegant',
        isPro: false,
        colors: { primary: '#F59E0B', secondary: '#D97706', background: '#0F172A', text: '#F8FAFC' },
    },
    {
        id: 'neon',
        name: 'Neon Nights',
        description: 'Vibrante y moderno. Perfecto para bares y locales nocturnos.',
        category: 'bold',
        isPro: true,
        colors: { primary: '#EC4899', secondary: '#8B5CF6', background: '#18181B', text: '#FFFFFF' },
    },
    {
        id: 'ocean',
        name: 'Ocean Breeze',
        description: 'Fresco y relajante. Ideal para marisquerías y beach bars.',
        category: 'modern',
        isPro: true,
        colors: { primary: '#06B6D4', secondary: '#0891B2', background: '#F0FDFA', text: '#134E4A' },
    },
    {
        id: 'sunset',
        name: 'Sunset',
        description: 'Cálido y acogedor con tonos naranjas y rojos.',
        category: 'bold',
        isPro: true,
        colors: { primary: '#F97316', secondary: '#EA580C', background: '#FFFBEB', text: '#78350F' },
    },
    {
        id: 'forest',
        name: 'Forest',
        description: 'Natural y orgánico. Ideal para restaurantes veganos.',
        category: 'elegant',
        isPro: true,
        colors: { primary: '#16A34A', secondary: '#15803D', background: '#F0FDF4', text: '#14532D' },
    },
    {
        id: 'minimal',
        name: 'Minimal White',
        description: 'Ultra limpio con tipografía premium.',
        category: 'minimal',
        isPro: false,
        colors: { primary: '#000000', secondary: '#525252', background: '#FFFFFF', text: '#171717' },
    },
    {
        id: 'retro',
        name: 'Retro Diner',
        description: 'Estilo americano años 50. Divertido y nostálgico.',
        category: 'fun',
        isPro: true,
        colors: { primary: '#DC2626', secondary: '#B91C1C', background: '#FEF2F2', text: '#450A0A' },
    },
    {
        id: 'luxury',
        name: 'Luxury Gold',
        description: 'Sofisticado con detalles dorados. Fine dining.',
        category: 'elegant',
        isPro: true,
        colors: { primary: '#CA8A04', secondary: '#A16207', background: '#1C1917', text: '#FAFAF9' },
    },
    {
        id: 'pastel',
        name: 'Pastel Dreams',
        description: 'Suave y dulce. Perfecto para cafeterías y brunch.',
        category: 'fun',
        isPro: true,
        colors: { primary: '#F472B6', secondary: '#E879F9', background: '#FDF4FF', text: '#701A75' },
    },
    {
        id: 'industrial',
        name: 'Industrial',
        description: 'Raw y urbano. Para gastropubs y cervecerías.',
        category: 'modern',
        isPro: true,
        colors: { primary: '#EAB308', secondary: '#CA8A04', background: '#292524', text: '#FAFAF9' },
    },
    {
        id: 'japanese',
        name: 'Zen',
        description: 'Minimalista japonés. Equilibrio y armonía.',
        category: 'minimal',
        isPro: true,
        colors: { primary: '#EF4444', secondary: '#DC2626', background: '#FAFAF9', text: '#1C1917' },
    },
    // StoreKit-inspired themes
    {
        id: 'neon-pulse',
        name: 'Neon Pulse',
        description: 'Vibrante y futurista, ideal para locales nocturnos.',
        category: 'bold',
        isPro: true,
        colors: { primary: '#FF00FF', secondary: '#00FFFF', background: '#0A0A0A', text: '#FFFFFF' },
    },
    {
        id: 'solar-gradient',
        name: 'Solar Gradient',
        description: 'Calidez solar con tonos amarillos y naranjas.',
        category: 'modern',
        isPro: false,
        colors: { primary: '#FFB800', secondary: '#FF6B00', background: '#F5F5F5', text: '#1F2937' },
    },
    {
        id: 'oceanic-calm',
        name: 'Oceanic Calm',
        description: 'Frescura marina, perfecto para marisquerías.',
        category: 'modern',
        isPro: false,
        colors: { primary: '#06B6D4', secondary: '#0284C7', background: '#F0FDFA', text: '#134E4A' },
    },
    {
        id: 'midnight-luxe',
        name: 'Midnight Luxe',
        description: 'Modo oscuro elegante con acentos violetas.',
        category: 'elegant',
        isPro: true,
        colors: { primary: '#7C3AED', secondary: '#C084FC', background: '#0F172A', text: '#F8FAFC' },
    },
    {
        id: 'pastel-breeze',
        name: 'Pastel Breeze',
        description: 'Suave y dulce, ideal para cafés y brunch.',
        category: 'fun',
        isPro: false,
        colors: { primary: '#F472B6', secondary: '#F9A8D4', background: '#FDF4FF', text: '#701A75' },
    },
    {
        id: 'industrial-edge',
        name: 'Industrial Edge',
        description: 'Raw y urbano, para gastropubs.',
        category: 'modern',
        isPro: true,
        colors: { primary: '#EAB308', secondary: '#CA8A04', background: '#292524', text: '#FAFAF9' },
    },
    {
        id: 'zen-minimal',
        name: 'Zen Minimal',
        description: 'Minimalismo japonés, equilibrio y armonía.',
        category: 'minimal',
        isPro: true,
        colors: { primary: '#EF4444', secondary: '#DC2626', background: '#FAFAF9', text: '#1C1917' },
    },
    {
        id: 'forest-fresh',
        name: 'Forest Fresh',
        description: 'Natural y orgánico, para veganos.',
        category: 'elegant',
        isPro: true,
        colors: { primary: '#16A34A', secondary: '#15803D', background: '#F0FDF4', text: '#14532D' },
    },
];

const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'minimal', label: 'Minimal' },
    { id: 'modern', label: 'Moderno' },
    { id: 'bold', label: 'Atrevido' },
    { id: 'elegant', label: 'Elegante' },
    { id: 'fun', label: 'Divertido' },
];

export default function ThemesPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [currentThemeId, setCurrentThemeId] = useState('classic');
    const [previewThemeId, setPreviewThemeId] = useState('classic');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [customCSS, setCustomCSS] = useState('');
    const [isPro, setIsPro] = useState(false);
    const [hasCustomTheme, setHasCustomTheme] = useState(false);

    const supabase = createClient();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: restaurants } = await supabase
                .from("restaurants")
                .select("*")
                .eq("owner_id", user.id)
                .order("created_at", { ascending: true });

            const restaurantData = restaurants?.[0] || null;

            if (restaurantData) {
                setRestaurant(restaurantData);
                setCurrentThemeId(restaurantData.theme_id || 'classic');
                setPreviewThemeId(restaurantData.theme_id || 'classic');
                setCustomCSS(restaurantData.custom_css || '');
                setIsPro(restaurantData.plan_tier === 'pro' || restaurantData.plan_tier === 'enterprise');
                setHasCustomTheme(restaurantData.custom_theme_enabled || false);
            }
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    };

    const applyTheme = async (themeId: string) => {
        if (!restaurant) return;

        const theme = themes.find(t => t.id === themeId);
        if (theme?.isPro && !isPro) {
            alert('Este tema requiere el plan Pro. ¡Mejora tu plan para desbloquearlo!');
            return;
        }

        setSaving(true);
        try {
            await supabase
                .from("restaurants")
                .update({
                    theme_id: themeId,
                    primary_color: theme?.colors.primary,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", restaurant.id);

            setCurrentThemeId(themeId);
        } catch (err) {
            console.error("Error applying theme:", err);
        } finally {
            setSaving(false);
        }
    };

    const saveCustomCSS = async () => {
        if (!restaurant) return;

        setSaving(true);
        try {
            await supabase
                .from("restaurants")
                .update({
                    custom_css: customCSS,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", restaurant.id);
        } catch (err) {
            console.error("Error saving custom CSS:", err);
        } finally {
            setSaving(false);
        }
    };

    const filteredThemes = selectedCategory === 'all'
        ? themes
        : themes.filter(t => t.category === selectedCategory);

    const previewTheme = themes.find(t => t.id === previewThemeId) || themes[0];

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 lg:p-8 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Temas y Diseño</h1>
                    <p className="text-sm text-slate-500">
                        Personaliza la apariencia de tu menú digital
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={`/r/${restaurant?.slug}`}
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-600 transition-colors"
                    >
                        <ExternalLink size={16} />
                        Abrir en nueva pestaña
                    </Link>
                </div>
            </div>

            <div className="flex-1 flex gap-8 min-h-0">
                {/* Left Column: Theme Selection */}
                <div className="flex-1 overflow-y-auto pr-2 pb-20">
                    {/* Pro Banner */}
                    {!hasCustomTheme && (
                        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 mb-8 text-white">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Code size={20} className="text-white/80" />
                                        <h2 className="font-bold">Editor CSS Personalizado</h2>
                                    </div>
                                    <p className="text-sm text-white/80">
                                        Desbloquea el control total del diseño por €50/mes
                                    </p>
                                </div>
                                <button
                                    onClick={() => alert('Próximamente')}
                                    className="px-4 py-2 bg-white text-purple-600 rounded-lg text-sm font-bold hover:bg-white/90 transition-colors"
                                >
                                    Desbloquear
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Category Filter */}
                    <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-colors ${selectedCategory === cat.id
                                    ? 'bg-slate-900 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Themes Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {filteredThemes.map((theme) => {
                            const isSelected = currentThemeId === theme.id;
                            const isProLocked = theme.isPro && !isPro;

                            return (
                                <motion.button
                                    key={theme.id}
                                    layout
                                    onMouseEnter={() => setPreviewThemeId(theme.id)}
                                    // onMouseLeave={() => setPreviewThemeId(currentThemeId)}
                                    onClick={() => !isProLocked && applyTheme(theme.id)}
                                    className={`group relative text-left bg-white rounded-2xl border-2 overflow-hidden transition-all ${isSelected
                                        ? 'border-primary ring-4 ring-primary/10'
                                        : 'border-slate-100 hover:border-slate-300'
                                        }`}
                                >
                                    {/* Abstract Preview */}
                                    <div
                                        className="h-24 relative overflow-hidden"
                                        style={{
                                            background: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.background} 50%, ${theme.colors.primary} 100%)`
                                        }}
                                    >
                                        <div className="absolute inset-4 flex gap-3">
                                            <div
                                                className="w-16 h-16 rounded-lg shadow-sm"
                                                style={{ backgroundColor: theme.colors.primary }}
                                            />
                                            <div className="flex-1 space-y-2 pt-1">
                                                <div
                                                    className="h-2 w-2/3 rounded-full opacity-50"
                                                    style={{ backgroundColor: theme.colors.text }}
                                                />
                                                <div
                                                    className="h-2 w-1/3 rounded-full opacity-30"
                                                    style={{ backgroundColor: theme.colors.text }}
                                                />
                                            </div>
                                        </div>

                                        {/* Lock Badge */}
                                        {isProLocked && (
                                            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center backdrop-blur-[1px]">
                                                <div className="flex items-center gap-1 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-bold">
                                                    <Lock size={12} />
                                                    PRO
                                                </div>
                                            </div>
                                        )}

                                        {/* Active Badge */}
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-sm">
                                                <Check size={14} className="text-white" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="p-4">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-bold text-slate-900">{theme.name}</h3>
                                            {theme.isPro && !isProLocked && (
                                                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    <Crown size={10} /> PRO
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                                            {theme.description}
                                        </p>

                                        {/* Color Dots */}
                                        <div className="flex gap-1.5">
                                            {Object.values(theme.colors).map((color, i) => (
                                                <div
                                                    key={i}
                                                    className="w-4 h-4 rounded-full border border-black/5 shadow-sm"
                                                    style={{ backgroundColor: color }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* Custom CSS Editor */}
                    {hasCustomTheme && (
                        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden mb-8">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <Code size={16} /> CSS Personalizado
                                </h3>
                                <button
                                    onClick={saveCustomCSS}
                                    disabled={saving}
                                    className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors"
                                >
                                    {saving ? 'Guardando...' : 'Guardar CSS'}
                                </button>
                            </div>
                            <div className="p-4">
                                <textarea
                                    value={customCSS}
                                    onChange={(e) => setCustomCSS(e.target.value)}
                                    className="w-full h-64 bg-slate-900 text-green-400 font-mono text-xs p-4 rounded-xl focus:outline-none resize-none"
                                    placeholder="/* Tu código CSS aquí */"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Column: Phone Preview */}
                <div className="w-[320px] flex-shrink-0 hidden lg:flex flex-col items-center">
                    <div className="sticky top-0">
                        <div className="tmb-4 text-center">
                            <h3 className="font-bold text-slate-900 text-lg">
                                {categories.find(c => c.id === 'preview')?.label || 'Vista Previa'}
                            </h3>
                            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                                <span className={`w-2 h-2 rounded-full ${previewThemeId === currentThemeId ? 'bg-green-500' : 'bg-amber-500'}`} />
                                {previewThemeId === currentThemeId ? 'Tema actual' : 'Previsualizando'}
                            </div>
                        </div>

                        {/* Phone Mockup */}
                        <div className="relative mx-auto w-[300px] h-[600px] bg-slate-900 rounded-[3rem] p-3 shadow-2xl border-4 border-slate-800 ring-1 ring-slate-900/50 mt-4 transition-transform hover:scale-[1.02] duration-300">
                            {/* Notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-2xl z-20 flex items-center justify-center gap-2">
                                <div className="w-12 h-1.5 bg-slate-800 rounded-full" />
                                <div className="w-1.5 h-1.5 bg-slate-800 rounded-full" />
                            </div>

                            {/* Screen */}
                            <div className="h-full w-full bg-white rounded-[2.5rem] overflow-hidden relative z-10">
                                {restaurant?.slug ? (
                                    <iframe
                                        src={`/r/${restaurant.slug}?preview_theme=${previewThemeId}`}
                                        className="w-full h-full border-0"
                                        title="Menu Preview"
                                        key={previewThemeId} // Force reload on theme change
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                        <Loader2 size={32} className="animate-spin text-slate-400" />
                                    </div>
                                )}

                                {/* Interaction layer (optional) */}
                                <div className="absolute inset-0 pointer-events-none ring-1 ring-black/5 rounded-[2.5rem]" />
                            </div>

                            {/* Side Buttons */}
                            <div className="absolute top-24 -left-1 w-1 h-10 bg-slate-800 rounded-l-md" />
                            <div className="absolute top-36 -left-1 w-1 h-16 bg-slate-800 rounded-l-md" />
                            <div className="absolute top-32 -right-1 w-1 h-20 bg-slate-800 rounded-r-md" />
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-xs text-slate-400">
                                {previewTheme.name}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
