"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Plus,
    BookOpen,
    Clock,
    Edit3,
    Trash2,
    Copy,
    Check,
    X,
    Loader2,
    Coffee,
    Utensils,
    Wine,
    Sun,
    Eye,
    EyeOff,
    ChevronRight,
    Sparkles,
    AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface Menu {
    id: string;
    restaurant_id: string;
    name: string;
    description: string | null;
    icon: string;
    is_active: boolean;
    is_default: boolean;
    // Horarios de activación
    schedule_enabled: boolean;
    schedule_days: number[];  // 0-6 (Dom-Sab)
    schedule_start_time: string | null;
    schedule_end_time: string | null;
    // Categorías incluidas
    included_categories: string[];  // IDs de categorías
    // Configuración
    show_prices: boolean;
    show_descriptions: boolean;
    show_images: boolean;
    sort_order: number;
    created_at: string;
}

interface Category {
    id: string;
    name_es: string;
    icon: string;
    is_active: boolean;
}

const menuIcons = [
    { icon: '📋', label: 'General' },
    { icon: '🍽️', label: 'Comida' },
    { icon: '🍺', label: 'Bebidas' },
    { icon: '🍷', label: 'Vinos' },
    { icon: '☕', label: 'Desayunos' },
    { icon: '🥗', label: 'Almuerzos' },
    { icon: '🌙', label: 'Cenas' },
    { icon: '🍰', label: 'Postres' },
    { icon: '🥤', label: 'Refrescos' },
    { icon: '🍕', label: 'Para compartir' },
    { icon: '👶', label: 'Niños' },
    { icon: '🎉', label: 'Especial' },
];

const weekDays = [
    { value: 0, label: 'Dom', short: 'D' },
    { value: 1, label: 'Lun', short: 'L' },
    { value: 2, label: 'Mar', short: 'M' },
    { value: 3, label: 'Mié', short: 'X' },
    { value: 4, label: 'Jue', short: 'J' },
    { value: 5, label: 'Vie', short: 'V' },
    { value: 6, label: 'Sáb', short: 'S' },
];

export default function MenusPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
    const [saving, setSaving] = useState(false);
    const [restaurant, setRestaurant] = useState<any>(null);

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
                .order("created_at", { ascending: true }); const restaurantData = restaurants?.[0] || null;

            if (!restaurantData) return;
            setRestaurant(restaurantData);

            // Load menus
            const { data: menusData } = await supabase
                .from("menus")
                .select("*")
                .eq("restaurant_id", restaurantData.id)
                .order("sort_order");

            setMenus(menusData || []);

            // Load categories
            const { data: categoriesData } = await supabase
                .from("categories")
                .select("id, name_es, icon, is_active")
                .eq("restaurant_id", restaurantData.id)
                .eq("is_active", true)
                .order("sort_order");

            setCategories(categoriesData || []);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMenu = async (menuData: Partial<Menu>) => {
        if (!restaurant) return;

        setSaving(true);
        try {
            if (editingMenu) {
                await supabase
                    .from("menus")
                    .update({
                        ...menuData,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", editingMenu.id);
            } else {
                await supabase
                    .from("menus")
                    .insert({
                        restaurant_id: restaurant.id,
                        ...menuData,
                        sort_order: menus.length,
                    });
            }

            await loadData();
            setShowAddModal(false);
            setEditingMenu(null);
        } catch (err) {
            console.error("Error saving menu:", err);
        } finally {
            setSaving(false);
        }
    };

    const toggleMenuActive = async (menuId: string, isActive: boolean) => {
        await supabase
            .from("menus")
            .update({ is_active: isActive })
            .eq("id", menuId);
        loadData();
    };

    const setDefaultMenu = async (menuId: string) => {
        // First, unset all defaults
        await supabase
            .from("menus")
            .update({ is_default: false })
            .eq("restaurant_id", restaurant.id);

        // Then set the new default
        await supabase
            .from("menus")
            .update({ is_default: true })
            .eq("id", menuId);

        loadData();
    };

    const deleteMenu = async (menuId: string) => {
        await supabase.from("menus").delete().eq("id", menuId);
        loadData();
    };

    const duplicateMenu = async (menu: Menu) => {
        await supabase.from("menus").insert({
            restaurant_id: restaurant.id,
            name: `${menu.name} (copia)`,
            description: menu.description,
            icon: menu.icon,
            is_active: false,
            is_default: false,
            schedule_enabled: menu.schedule_enabled,
            schedule_days: menu.schedule_days,
            schedule_start_time: menu.schedule_start_time,
            schedule_end_time: menu.schedule_end_time,
            included_categories: menu.included_categories,
            show_prices: menu.show_prices,
            show_descriptions: menu.show_descriptions,
            show_images: menu.show_images,
            sort_order: menus.length,
        });
        loadData();
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Cartas y Menús</h1>
                    <p className="text-sm text-slate-500">
                        Crea diferentes cartas para distintos momentos del día
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingMenu(null);
                        setShowAddModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus size={18} />
                    Nueva Carta
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                <AlertCircle size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                    <p className="font-bold text-blue-800 text-sm">¿Cómo funcionan las cartas?</p>
                    <p className="text-sm text-blue-600 mt-1">
                        Puedes crear diferentes cartas (ej: "Solo Bebidas", "Menú del Día", "Carta Completa") y
                        configurar cuáles categorías incluye cada una. También puedes programar horarios para que
                        se activen automáticamente.
                    </p>
                </div>
            </div>

            {/* Menus List */}
            {menus.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <BookOpen size={28} className="text-slate-300" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Sin cartas configuradas</h2>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        Crea tu primera carta para organizar qué categorías y productos
                        se muestran en tu menú digital.
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors"
                    >
                        <Plus size={18} />
                        Crear Primera Carta
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menus.map((menu) => (
                        <MenuCard
                            key={menu.id}
                            menu={menu}
                            categories={categories}
                            onEdit={() => {
                                setEditingMenu(menu);
                                setShowAddModal(true);
                            }}
                            onToggle={() => toggleMenuActive(menu.id, !menu.is_active)}
                            onSetDefault={() => setDefaultMenu(menu.id)}
                            onDuplicate={() => duplicateMenu(menu)}
                            onDelete={() => deleteMenu(menu.id)}
                        />
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <MenuModal
                        menu={editingMenu}
                        categories={categories}
                        saving={saving}
                        onSave={handleSaveMenu}
                        onClose={() => {
                            setShowAddModal(false);
                            setEditingMenu(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Menu Card Component
function MenuCard({
    menu,
    categories,
    onEdit,
    onToggle,
    onSetDefault,
    onDuplicate,
    onDelete,
}: {
    menu: Menu;
    categories: Category[];
    onEdit: () => void;
    onToggle: () => void;
    onSetDefault: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
}) {
    const includedCount = menu.included_categories?.length || 0;
    const allCategories = categories.length;

    const formatSchedule = () => {
        if (!menu.schedule_enabled) return null;

        const days = menu.schedule_days?.map(d => weekDays.find(w => w.value === d)?.short).join(', ');
        const time = menu.schedule_start_time && menu.schedule_end_time
            ? `${menu.schedule_start_time} - ${menu.schedule_end_time}`
            : 'Todo el día';

        return `${days} · ${time}`;
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white rounded-2xl border-2 overflow-hidden transition-colors ${menu.is_active ? 'border-primary/30' : 'border-slate-100'
                }`}
        >
            <div className="p-5">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">
                            {menu.icon}
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">{menu.name}</h3>
                            {menu.description && (
                                <p className="text-sm text-slate-500 line-clamp-1">{menu.description}</p>
                            )}
                        </div>
                    </div>

                    {menu.is_default && (
                        <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase">
                            Principal
                        </span>
                    )}
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                        <BookOpen size={14} className="text-slate-400" />
                        <span>
                            {includedCount === allCategories
                                ? 'Todas las categorías'
                                : `${includedCount} de ${allCategories} categorías`}
                        </span>
                    </div>

                    {menu.schedule_enabled && (
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock size={14} className="text-slate-400" />
                            <span>{formatSchedule()}</span>
                        </div>
                    )}
                </div>

                {/* Status */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={onToggle}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${menu.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-500'
                            }`}
                    >
                        {menu.is_active ? (
                            <>
                                <Eye size={14} />
                                Activa
                            </>
                        ) : (
                            <>
                                <EyeOff size={14} />
                                Inactiva
                            </>
                        )}
                    </button>

                    <div className="flex items-center gap-1">
                        {!menu.is_default && (
                            <button
                                onClick={onSetDefault}
                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Establecer como principal"
                            >
                                <Sparkles size={14} className="text-slate-400" />
                            </button>
                        )}
                        <button
                            onClick={onDuplicate}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Duplicar"
                        >
                            <Copy size={14} className="text-slate-400" />
                        </button>
                        <button
                            onClick={onEdit}
                            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Editar"
                        >
                            <Edit3 size={14} className="text-slate-400" />
                        </button>
                        {!menu.is_default && (
                            <button
                                onClick={onDelete}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar"
                            >
                                <Trash2 size={14} className="text-red-400" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Menu Modal Component
function MenuModal({
    menu,
    categories,
    saving,
    onSave,
    onClose,
}: {
    menu: Menu | null;
    categories: Category[];
    saving: boolean;
    onSave: (data: Partial<Menu>) => void;
    onClose: () => void;
}) {
    const [name, setName] = useState(menu?.name || '');
    const [description, setDescription] = useState(menu?.description || '');
    const [icon, setIcon] = useState(menu?.icon || '📋');
    const [scheduleEnabled, setScheduleEnabled] = useState(menu?.schedule_enabled || false);
    const [scheduleDays, setScheduleDays] = useState<number[]>(menu?.schedule_days || [1, 2, 3, 4, 5]);
    const [scheduleStart, setScheduleStart] = useState(menu?.schedule_start_time || '');
    const [scheduleEnd, setScheduleEnd] = useState(menu?.schedule_end_time || '');
    const [selectedCategories, setSelectedCategories] = useState<string[]>(
        menu?.included_categories || categories.map(c => c.id)
    );
    const [showPrices, setShowPrices] = useState(menu?.show_prices ?? true);
    const [showDescriptions, setShowDescriptions] = useState(menu?.show_descriptions ?? true);
    const [showImages, setShowImages] = useState(menu?.show_images ?? true);
    const [step, setStep] = useState(1);

    const toggleDay = (day: number) => {
        setScheduleDays(prev =>
            prev.includes(day)
                ? prev.filter(d => d !== day)
                : [...prev, day]
        );
    };

    const toggleCategory = (categoryId: string) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(c => c !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleSubmit = () => {
        onSave({
            name,
            description: description || null,
            icon,
            schedule_enabled: scheduleEnabled,
            schedule_days: scheduleDays,
            schedule_start_time: scheduleStart || null,
            schedule_end_time: scheduleEnd || null,
            included_categories: selectedCategories,
            show_prices: showPrices,
            show_descriptions: showDescriptions,
            show_images: showImages,
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-xl font-black text-slate-900">
                        {menu ? 'Editar Carta' : 'Nueva Carta'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Steps */}
                <div className="px-6 py-4 border-b border-slate-100 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <StepIndicator step={1} current={step} label="Información" />
                        <ChevronRight size={16} className="text-slate-300" />
                        <StepIndicator step={2} current={step} label="Categorías" />
                        <ChevronRight size={16} className="text-slate-300" />
                        <StepIndicator step={3} current={step} label="Horario" />
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    {step === 1 && (
                        <div className="space-y-6">
                            {/* Icon Selection */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    Icono
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {menuIcons.map((item) => (
                                        <button
                                            key={item.icon}
                                            onClick={() => setIcon(item.icon)}
                                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${icon === item.icon
                                                ? 'bg-primary/10 ring-2 ring-primary'
                                                : 'bg-slate-100 hover:bg-slate-200'
                                                }`}
                                            title={item.label}
                                        >
                                            {item.icon}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Nombre de la Carta *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Ej: Carta de Bebidas, Menú del Día..."
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Descripción <span className="text-slate-400 font-normal">(opcional)</span>
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Una breve descripción de esta carta..."
                                    rows={2}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
                                />
                            </div>

                            {/* Display Options */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    Opciones de Visualización
                                </label>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showPrices}
                                            onChange={(e) => setShowPrices(e.target.checked)}
                                            className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-slate-700">Mostrar precios</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showDescriptions}
                                            onChange={(e) => setShowDescriptions(e.target.checked)}
                                            className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-slate-700">Mostrar descripciones</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={showImages}
                                            onChange={(e) => setShowImages(e.target.checked)}
                                            className="w-5 h-5 rounded-lg border-slate-300 text-primary focus:ring-primary"
                                        />
                                        <span className="text-slate-700">Mostrar imágenes</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-slate-600">
                                    Selecciona qué categorías se muestran en esta carta
                                </p>
                                <button
                                    onClick={() => {
                                        if (selectedCategories.length === categories.length) {
                                            setSelectedCategories([]);
                                        } else {
                                            setSelectedCategories(categories.map(c => c.id));
                                        }
                                    }}
                                    className="text-sm font-bold text-primary hover:underline"
                                >
                                    {selectedCategories.length === categories.length ? 'Deseleccionar todo' : 'Seleccionar todo'}
                                </button>
                            </div>

                            {categories.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-slate-500">No tienes categorías creadas</p>
                                    <Link href="/dashboard/menu/categories" className="text-primary font-bold text-sm hover:underline">
                                        Crear categorías
                                    </Link>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {categories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => toggleCategory(category.id)}
                                            className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${selectedCategories.includes(category.id)
                                                ? 'border-primary bg-primary/5'
                                                : 'border-slate-100 hover:border-slate-200'
                                                }`}
                                        >
                                            <span className="text-2xl">{category.icon}</span>
                                            <span className="font-bold text-slate-900">{category.name_es}</span>
                                            {selectedCategories.includes(category.id) && (
                                                <Check size={18} className="text-primary ml-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {step === 3 && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                <div>
                                    <p className="font-bold text-slate-900">Activación Programada</p>
                                    <p className="text-sm text-slate-500">Esta carta se activa automáticamente según el horario</p>
                                </div>
                                <button
                                    onClick={() => setScheduleEnabled(!scheduleEnabled)}
                                    className={`relative w-12 h-7 rounded-full transition-colors ${scheduleEnabled ? 'bg-primary' : 'bg-slate-200'
                                        }`}
                                >
                                    <motion.div
                                        animate={{ x: scheduleEnabled ? 20 : 2 }}
                                        className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
                                    />
                                </button>
                            </div>

                            {scheduleEnabled && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-6"
                                >
                                    {/* Days */}
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-3">
                                            Días de la semana
                                        </label>
                                        <div className="flex gap-2">
                                            {weekDays.map((day) => (
                                                <button
                                                    key={day.value}
                                                    onClick={() => toggleDay(day.value)}
                                                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${scheduleDays.includes(day.value)
                                                        ? 'bg-primary text-white'
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                                        }`}
                                                >
                                                    {day.short}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Time */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                Hora de inicio
                                            </label>
                                            <input
                                                type="time"
                                                value={scheduleStart}
                                                onChange={(e) => setScheduleStart(e.target.value)}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                                Hora de fin
                                            </label>
                                            <input
                                                type="time"
                                                value={scheduleEnd}
                                                onChange={(e) => setScheduleEnd(e.target.value)}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                            />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 flex justify-between flex-shrink-0">
                    {step > 1 ? (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                            Atrás
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                    )}

                    {step < 3 ? (
                        <button
                            onClick={() => setStep(step + 1)}
                            disabled={step === 1 && !name}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            Siguiente
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={!name || saving}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            {menu ? 'Guardar Cambios' : 'Crear Carta'}
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

// Step Indicator Component
function StepIndicator({ step, current, label }: { step: number; current: number; label: string }) {
    return (
        <div className={`flex items-center gap-2 ${current >= step ? 'text-primary' : 'text-slate-400'}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${current > step ? 'bg-primary text-white' :
                current === step ? 'bg-primary/10 text-primary' :
                    'bg-slate-100 text-slate-400'
                }`}>
                {current > step ? <Check size={12} /> : step}
            </span>
            <span className="font-medium text-sm hidden sm:inline">{label}</span>
        </div>
    );
}

