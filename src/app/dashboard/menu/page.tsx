"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    UtensilsCrossed,
    Layers,
    BookOpen,
    ChefHat,
    Settings2,
    Plus,
    Eye,
    ExternalLink,
    ChevronRight,
    AlertCircle,
    Sparkles,
    Palette,
    Grid3X3,
    Package,
    Loader2,
    ArrowRight,
    CheckCircle2,
    Clock,
    Smartphone,
} from "lucide-react";
import { useMenu } from "@/contexts/MenuContext";

// Navigation items for the menu section
const menuNavigation = [
    {
        id: "overview",
        label: "Vista General",
        href: "/dashboard/menu",
        icon: Grid3X3,
        description: "Resumen de tu menú",
    },
    {
        id: "categories",
        label: "Categorías",
        href: "/dashboard/menu/categories",
        icon: Layers,
        description: "Organiza tu carta",
    },
    {
        id: "products",
        label: "Productos",
        href: "/dashboard/menu/products",
        icon: UtensilsCrossed,
        description: "Gestiona tus platos",
    },
    {
        id: "daily-menus",
        label: "Menús del Día",
        href: "/dashboard/menu/daily-menus",
        icon: ChefHat,
        description: "Menús especiales",
        badge: "Pro",
    },
    {
        id: "modifiers",
        label: "Modificadores",
        href: "/dashboard/menu/modifiers",
        icon: Package,
        description: "Extras y opciones",
    },
    {
        id: "theme",
        label: "Diseño y Tema",
        href: "/dashboard/settings/theme",
        icon: Palette,
        description: "Personaliza tu estilo",
    },
];

export default function MenuPage() {
    const router = useRouter();
    const { restaurant, categories, loading, showPreview, setShowPreview, isMenuEmpty } = useMenu();
    const [checkingOnboarding, setCheckingOnboarding] = useState(true);

    // Check onboarding status
    useEffect(() => {
        if (!loading) {
            const onboardingComplete = localStorage.getItem("menu_onboarding_complete");
            if (isMenuEmpty && !onboardingComplete) {
                // Menu is empty and onboarding not done - show onboarding prompt in-page
                setCheckingOnboarding(false);
            } else {
                setCheckingOnboarding(false);
            }
        }
    }, [loading, isMenuEmpty, router]);

    // Stats
    const products = categories.flatMap(c => c.products || []);
    const stats = {
        totalCategories: categories.length,
        activeCategories: categories.filter(c => c.is_active).length,
        totalProducts: products.length,
        availableProducts: products.filter(p => p.is_available).length,
        featuredProducts: products.filter(p => p.is_featured).length,
    };

    if (loading || checkingOnboarding) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-primary" />
            </div>
        );
    }

    // Show onboarding prompt if menu is empty
    if (isMenuEmpty) {
        return <OnboardingPrompt restaurant={restaurant} />;
    }

    return (
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <header className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                            <BookOpen className="text-primary" size={28} />
                            Mi Menú
                        </h1>
                        <p className="text-sm text-slate-500 font-medium mt-1">
                            {stats.totalProducts} productos en {stats.totalCategories} categorías
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border ${showPreview
                                ? 'bg-primary/10 text-primary border-primary/30'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {showPreview ? <Eye size={16} /> : <Smartphone size={16} />}
                            {showPreview ? 'Vista activa' : 'Ver Vista Previa'}
                        </button>

                        {restaurant?.slug && (
                            <Link
                                href={`/r/${restaurant.slug}`}
                                target="_blank"
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-primary/50 text-slate-700 rounded-xl text-sm font-bold transition-all"
                            >
                                <ExternalLink size={16} />
                                Ver Menú Público
                            </Link>
                        )}

                        <Link
                            href="/dashboard/menu/products"
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20"
                        >
                            <Plus size={16} />
                            Nuevo Producto
                        </Link>
                    </div>
                </div>
            </header>

            {/* Navigation Grid */}
            <section className="mb-8">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                    Gestión del Menú
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {menuNavigation.map((item, index) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={`group relative p-5 rounded-2xl border transition-all hover:shadow-lg ${index === 0
                                    ? 'bg-primary/5 border-primary/20 hover:border-primary/40'
                                    : 'bg-white border-slate-100 hover:border-primary/30'
                                }`}
                        >
                            {item.badge && (
                                <span className="absolute top-3 right-3 px-1.5 py-0.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white text-[9px] font-bold rounded-full">
                                    {item.badge}
                                </span>
                            )}
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${index === 0
                                    ? 'bg-primary text-white'
                                    : 'bg-slate-100 text-slate-500 group-hover:bg-primary/10 group-hover:text-primary'
                                }`}>
                                <item.icon size={20} />
                            </div>
                            <h3 className="font-bold text-slate-900 text-sm">{item.label}</h3>
                            <p className="text-xs text-slate-400 mt-1">{item.description}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Categories Overview */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
                            <div>
                                <h3 className="font-bold text-slate-900">Mis Categorías</h3>
                                <p className="text-xs text-slate-500 mt-0.5">
                                    {stats.activeCategories} de {stats.totalCategories} activas
                                </p>
                            </div>
                            <Link
                                href="/dashboard/menu/categories"
                                className="flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                            >
                                Gestionar
                                <ChevronRight size={14} />
                            </Link>
                        </div>

                        {categories.length === 0 ? (
                            <div className="p-12 text-center">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Layers size={28} className="text-slate-300" />
                                </div>
                                <h4 className="font-bold text-slate-900 mb-2">Sin categorías</h4>
                                <p className="text-sm text-slate-500 mb-4">
                                    Crea categorías para organizar tus productos
                                </p>
                                <Link
                                    href="/dashboard/menu/categories"
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm"
                                >
                                    <Plus size={16} />
                                    Crear Categoría
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {categories.slice(0, 6).map((cat, index) => (
                                    <Link
                                        key={cat.id}
                                        href={`/dashboard/menu/products?category=${cat.id}`}
                                        className="p-4 flex items-center gap-4 hover:bg-slate-50 transition-all group"
                                    >
                                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                            {cat.icon || "🍽️"}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-slate-900 group-hover:text-primary transition-colors truncate">
                                                    {cat.name_es}
                                                </span>
                                                {!cat.is_active && (
                                                    <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[10px] font-bold uppercase rounded">
                                                        Oculta
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-xs text-slate-400">
                                                {(cat.products || []).length} productos
                                            </p>
                                        </div>
                                        <ChevronRight
                                            size={18}
                                            className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all"
                                        />
                                    </Link>
                                ))}
                                {categories.length > 6 && (
                                    <Link
                                        href="/dashboard/menu/categories"
                                        className="p-4 flex items-center justify-center gap-2 text-sm font-bold text-primary hover:bg-primary/5 transition-colors"
                                    >
                                        Ver todas ({categories.length})
                                        <ArrowRight size={16} />
                                    </Link>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Stats & Quick Actions */}
                <div className="space-y-6">
                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 gap-4">
                        <StatCard
                            label="Productos"
                            value={stats.totalProducts}
                            subtext={`${stats.availableProducts} disponibles`}
                            color="blue"
                        />
                        <StatCard
                            label="Destacados"
                            value={stats.featuredProducts}
                            subtext="En portada"
                            color="amber"
                        />
                    </div>

                    {/* Theme Card */}
                    <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
                        <Palette className="mb-3 text-indigo-400" size={24} />
                        <h3 className="font-bold text-lg mb-2">Personalización</h3>
                        <p className="text-slate-400 text-xs mb-5 leading-relaxed">
                            Define colores, fuentes y estilo visual de tu carta digital.
                        </p>
                        <Link
                            href="/dashboard/settings/theme"
                            className="block w-full text-center py-3 bg-white hover:bg-slate-50 text-slate-900 rounded-xl font-bold text-sm transition-all"
                        >
                            Editar Tema
                        </Link>
                    </div>

                    {/* Quick Tips */}
                    <div className="bg-white rounded-2xl border border-slate-100 p-5">
                        <h4 className="font-bold text-slate-900 mb-4 text-sm">Consejos</h4>
                        <div className="space-y-3">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-slate-600">
                                    Añade fotos de alta calidad a tus productos
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-slate-600">
                                    Marca los productos destacados para resaltarlos
                                </span>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                                <span className="text-xs text-slate-600">
                                    Oculta platos agotados sin eliminarlos
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Onboarding Prompt Component
function OnboardingPrompt({ restaurant }: { restaurant: any }) {
    const router = useRouter();

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full"
            >
                <div className="text-center mb-10">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20">
                        <BookOpen size={36} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-3">
                        ¡Configura tu menú digital!
                    </h1>
                    <p className="text-slate-500 max-w-md mx-auto">
                        Tu carta está vacía. Usa nuestro asistente para crear categorías,
                        productos y personalizar tu restaurante en minutos.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push("/dashboard/menu/onboarding")}
                        className="p-6 bg-gradient-to-br from-primary to-primary/90 text-white rounded-2xl text-left shadow-lg shadow-primary/20"
                    >
                        <Sparkles size={28} className="mb-4" />
                        <h3 className="font-bold text-lg mb-1">Asistente Guiado</h3>
                        <p className="text-white/80 text-sm">
                            Te guiamos paso a paso: zonas, horarios, categorías, productos y más.
                        </p>
                        <div className="flex items-center gap-2 mt-4 text-sm font-bold">
                            Comenzar
                            <ArrowRight size={16} />
                        </div>
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => router.push("/dashboard/menu/import")}
                        className="p-6 bg-white border-2 border-slate-100 hover:border-primary/30 rounded-2xl text-left transition-colors"
                    >
                        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mb-4">
                            <Clock size={20} className="text-violet-600" />
                        </div>
                        <h3 className="font-bold text-slate-900 text-lg mb-1">
                            Importar Menú
                        </h3>
                        <p className="text-slate-500 text-sm">
                            Sube una foto de tu carta y extraemos los productos automáticamente.
                        </p>
                    </motion.button>
                </div>

                <div className="text-center">
                    <button
                        onClick={() => {
                            localStorage.setItem("menu_onboarding_complete", "true");
                            router.push("/dashboard/menu/categories");
                        }}
                        className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        Saltar y crear manualmente →
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// Stat Card Component
function StatCard({
    label,
    value,
    subtext,
    color,
}: {
    label: string;
    value: number;
    subtext: string;
    color: "blue" | "amber" | "green";
}) {
    const colors = {
        blue: "from-blue-500 to-blue-600",
        amber: "from-amber-500 to-amber-600",
        green: "from-emerald-500 to-emerald-600",
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                {label}
            </p>
            <p className={`text-3xl font-black bg-gradient-to-r ${colors[color]} bg-clip-text text-transparent`}>
                {value}
            </p>
            <p className="text-xs text-slate-500 mt-1">{subtext}</p>
        </div>
    );
}
