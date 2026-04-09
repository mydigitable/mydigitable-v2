"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Plus,
    BookOpen,
    Clock,
    Edit3,
    Trash2,
    Check,
    X,
    Loader2,
    Eye,
    EyeOff,
    AlertCircle,
    Sparkles,
    Coffee,
    Utensils,
    Wine,
    Moon,
    ChevronRight,
    FolderOpen,
    Package,
} from "lucide-react";
import {
    createMenu,
    updateMenu,
    deleteMenu as deleteMenuAction,
    toggleMenuActive,
} from "@/app/actions/menu";
import { useMenu } from "@/contexts/MenuContext";

// ============================================================================
// TYPES — Matching actual Supabase schema
// ============================================================================

interface Menu {
    id: string;
    restaurant_id: string;
    name: string;
    type: string; // general, breakfast, lunch, dinner, drinks, special
    theme_id: string;
    schedule_type: string; // all_day, scheduled
    start_time: string | null;
    end_time: string | null;
    is_active: boolean;
    display_order: number;
    created_at: string;
    updated_at: string;
    schedule: ScheduleDay[] | Record<string, ScheduleDayObj> | null;
}

interface ScheduleDay {
    day: string;
    open: string;
    close: string;
    enabled: boolean;
}

interface ScheduleDayObj {
    start: string;
    end: string;
    enabled: boolean;
}

interface MenuCategory {
    id: string;
    restaurant_id: string;
    name: string | { es?: string; en?: string };
    description: string | null;
    icon: string | null;
    image_url: string | null;
    is_visible: boolean;
    menu_id: string;
    sort_order: number;
    display_order: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const menuTypes = [
    { value: "general", label: "General", Icon: BookOpen, color: "text-slate-600", bg: "bg-slate-100" },
    { value: "breakfast", label: "Desayunos", Icon: Coffee, color: "text-amber-600", bg: "bg-amber-50" },
    { value: "lunch", label: "Comidas", Icon: Utensils, color: "text-emerald-600", bg: "bg-emerald-50" },
    { value: "dinner", label: "Cenas", Icon: Moon, color: "text-indigo-600", bg: "bg-indigo-50" },
    { value: "drinks", label: "Bebidas", Icon: Wine, color: "text-rose-600", bg: "bg-rose-50" },
    { value: "special", label: "Especial", Icon: Sparkles, color: "text-violet-600", bg: "bg-violet-50" },
];

const weekDays = [
    { key: "monday", label: "Lunes", short: "L" },
    { key: "tuesday", label: "Martes", short: "M" },
    { key: "wednesday", label: "Miércoles", short: "X" },
    { key: "thursday", label: "Jueves", short: "J" },
    { key: "friday", label: "Viernes", short: "V" },
    { key: "saturday", label: "Sábado", short: "S" },
    { key: "sunday", label: "Domingo", short: "D" },
];

// ============================================================================
// HELPERS
// ============================================================================

function getCategoryName(cat: MenuCategory): string {
    if (typeof cat.name === "string") return cat.name;
    if (typeof cat.name === "object" && cat.name?.es) return cat.name.es;
    return "Sin nombre";
}

function getMenuTypeInfo(type: string) {
    return menuTypes.find((t) => t.value === type) || menuTypes[0];
}

function getMenuTypeIcon(type: string, size: number = 22) {
    const info = getMenuTypeInfo(type);
    const IconComponent = info.Icon;
    return <IconComponent size={size} className={info.color} />;
}

function formatSchedule(menu: Menu): string | null {
    if (menu.schedule_type === "all_day" && !menu.schedule) return "Todo el día";
    if (!menu.schedule) return null;

    // Handle array format
    if (Array.isArray(menu.schedule)) {
        const enabledDays = menu.schedule.filter((d) => d.enabled);
        if (enabledDays.length === 0) return null;
        const days = enabledDays.map((d) => d.day.substring(0, 3)).join(", ");
        const first = enabledDays[0];
        return `${days} · ${first.open} - ${first.close}`;
    }

    // Handle object format
    const entries = Object.entries(menu.schedule);
    const enabledEntries = entries.filter(([, val]) => val.enabled);
    if (enabledEntries.length === 0) return null;
    const dayNames = enabledEntries.map(([key]) => {
        const found = weekDays.find((w) => w.key === key);
        return found ? found.short : key.substring(0, 3);
    });
    const first = enabledEntries[0][1];
    return `${dayNames.join(", ")} · ${first.start} - ${first.end}`;
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function MenusPage() {
    const [menus, setMenus] = useState<Menu[]>([]);
    const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
    const [saving, setSaving] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [showBanner, setShowBanner] = useState(true);

    const supabase = createClient();
    const router = useRouter();
    const { refreshMenu } = useMenu();

    // --- DATA LOADING (read-only, still via Supabase client for initial load) ---
    const loadData = useCallback(async () => {
        try {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data: restaurants } = await supabase
                .from("restaurants")
                .select("*")
                .eq("owner_id", user.id)
                .order("created_at", { ascending: true });

            const restaurantData = restaurants?.[0] || null;
            if (!restaurantData) return;

            // Load menus
            const { data: menusData, error: menusError } = await supabase
                .from("menus")
                .select("*")
                .eq("restaurant_id", restaurantData.id)
                .order("display_order");

            if (menusError) {
                console.error("Error loading menus:", menusError.message);
            }
            setMenus(menusData || []);

            // Load categories (from menu_categories table)
            const { data: categoriesData, error: catError } = await supabase
                .from("menu_categories")
                .select("*")
                .eq("restaurant_id", restaurantData.id)
                .order("sort_order");

            if (catError) {
                console.error("Error loading categories:", catError.message);
            }
            setMenuCategories(categoriesData || []);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Get categories for a specific menu
    const getCategoriesForMenu = (menuId: string) => {
        return menuCategories.filter((cat) => cat.menu_id === menuId);
    };

    // --- HANDLERS (using server actions) ---
    const handleSaveMenu = async (menuData: Partial<Menu>) => {
        setSaving(true);
        try {
            if (editingMenu) {
                const result = await updateMenu(editingMenu.id, {
                    name: menuData.name,
                    type: menuData.type,
                    schedule_type: menuData.schedule_type,
                    start_time: menuData.start_time,
                    end_time: menuData.end_time,
                    schedule: menuData.schedule,
                    is_active: menuData.is_active,
                });

                if (!result.success) {
                    alert(`Error al actualizar: ${result.error}`);
                    return;
                }
            } else {
                const result = await createMenu({
                    name: menuData.name,
                    type: menuData.type || "general",
                    schedule_type: menuData.schedule_type || "all_day",
                    start_time: menuData.start_time || null,
                    end_time: menuData.end_time || null,
                    schedule: menuData.schedule || null,
                    is_active: true,
                });

                if (!result.success) {
                    alert(`Error al crear menú: ${result.error}`);
                    return;
                }

                // Redirect to wizard for the new menu
                if (result.data?.id) {
                    router.push(`/dashboard/menu/menus/${result.data.id}`);
                    return;
                }
            }

            await loadData();
            refreshMenu();
            setShowModal(false);
            setEditingMenu(null);
        } catch (err) {
            console.error("Error saving menu:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleToggleMenuActive = async (menuId: string) => {
        // Optimistic update
        setMenus((prev) =>
            prev.map((m) =>
                m.id === menuId ? { ...m, is_active: !m.is_active } : m
            )
        );

        const result = await toggleMenuActive(menuId);
        if (!result.success) {
            // Revert
            setMenus((prev) =>
                prev.map((m) =>
                    m.id === menuId ? { ...m, is_active: !m.is_active } : m
                )
            );
            alert(`Error: ${result.error}`);
        }
        refreshMenu();
    };

    const handleDeleteMenu = async (menuId: string) => {
        const result = await deleteMenuAction(menuId);
        if (!result.success) {
            alert(`Error al eliminar: ${result.error}`);
            return;
        }
        setDeleteConfirm(null);
        await loadData();
        refreshMenu();
    };

    // ========================================================================
    // RENDER
    // ========================================================================

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
                    <h1 className="text-2xl font-black text-slate-900">
                        Gestión de Menús
                    </h1>
                    <p className="text-sm text-slate-500">
                        Crea y administra tus cartas para distintos momentos del día
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push('/dashboard/menu/categories')}
                        className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-slate-300 bg-white text-slate-700 rounded-xl font-medium text-sm transition-colors"
                    >
                        <FolderOpen size={16} />
                        + Categoría
                    </button>
                    <button
                        onClick={() => router.push('/dashboard/menu/products')}
                        className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-slate-300 bg-white text-slate-700 rounded-xl font-medium text-sm transition-colors"
                    >
                        <Package size={16} />
                        + Producto
                    </button>
                    <button
                        onClick={() => {
                            setEditingMenu(null);
                            setShowModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-primary/20"
                    >
                        <Plus size={18} />
                        Nueva Carta
                    </button>
                </div>
            </div>

            {/* Info Banner */}
            {showBanner && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
                    <AlertCircle
                        size={20}
                        className="text-blue-500 flex-shrink-0 mt-0.5"
                    />
                    <div className="flex-1">
                        <p className="font-bold text-blue-800 text-sm">
                            ¿Cómo funcionan las cartas?
                        </p>
                        <p className="text-sm text-blue-600 mt-1">
                            Cada carta es un menú diferente (ej: &quot;Desayunos&quot;,
                            &quot;Comidas&quot;, &quot;Cenas&quot;). Puedes activarlas o
                            desactivarlas y configurar horarios. Las categorías se asignan
                            desde la pestaña de Categorías.
                        </p>
                    </div>
                    <button
                        onClick={() => setShowBanner(false)}
                        className="p-1 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                    >
                        <X size={16} className="text-blue-400" />
                    </button>
                </div>
            )}

            {/* Menus List */}
            {menus.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <BookOpen size={28} className="text-slate-300" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">
                        Sin cartas configuradas
                    </h2>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        Crea tu primera carta para organizar tu menú digital.
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors"
                    >
                        <Plus size={18} />
                        Crear Primera Carta
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menus.map((menu, index) => {
                        const cats = getCategoriesForMenu(menu.id);
                        const typeInfo = getMenuTypeInfo(menu.type);
                        const schedule = formatSchedule(menu);

                        return (
                            <motion.div
                                key={menu.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className={`bg-white rounded-2xl border-2 overflow-hidden transition-all ${menu.is_active
                                    ? "border-primary/30 shadow-sm"
                                    : "border-slate-100 opacity-75"
                                    }`}
                            >
                                <div className="p-5">
                                    {/* Header */}
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-11 h-11 rounded-xl ${typeInfo.bg} flex items-center justify-center`}>
                                                {getMenuTypeIcon(menu.type, 20)}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">
                                                    {menu.name}
                                                </h3>
                                                <span className="text-xs text-slate-400 font-medium">
                                                    {typeInfo.label}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="space-y-2 mb-4">
                                        {/* Categories count */}
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <BookOpen
                                                size={14}
                                                className="text-slate-400"
                                            />
                                            <span>
                                                {cats.length === 0
                                                    ? "Sin categorías"
                                                    : `${cats.length} categoría${cats.length !== 1 ? "s" : ""}`}
                                            </span>
                                        </div>

                                        {/* Category names — clickable */}
                                        {cats.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {cats.slice(0, 4).map((cat) => (
                                                    <button
                                                        key={cat.id}
                                                        onClick={() => router.push("/dashboard/menu/categories")}
                                                        className="px-2.5 py-1 bg-slate-50 hover:bg-primary/10 text-slate-600 hover:text-primary text-[11px] rounded-lg font-medium transition-colors flex items-center gap-1 group"
                                                    >
                                                        {getCategoryName(cat)}
                                                        <ChevronRight size={10} className="text-slate-300 group-hover:text-primary/60 transition-colors" />
                                                    </button>
                                                ))}
                                                {cats.length > 4 && (
                                                    <button
                                                        onClick={() => router.push("/dashboard/menu/categories")}
                                                        className="px-2.5 py-1 bg-slate-50 hover:bg-primary/10 text-slate-400 hover:text-primary text-[11px] rounded-lg font-medium transition-colors"
                                                    >
                                                        +{cats.length - 4} más
                                                    </button>
                                                )}
                                            </div>
                                        )}

                                        {/* Schedule */}
                                        {schedule && (
                                            <div className="flex items-center gap-2 text-sm text-slate-600">
                                                <Clock
                                                    size={14}
                                                    className="text-slate-400"
                                                />
                                                <span>{schedule}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                                        {/* Toggle */}
                                        <button
                                            onClick={() =>
                                                handleToggleMenuActive(menu.id)
                                            }
                                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-colors ${menu.is_active
                                                ? "bg-green-100 text-green-700 hover:bg-green-200"
                                                : "bg-slate-100 text-slate-500 hover:bg-slate-200"
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

                                        {/* Edit & Delete */}
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => router.push(`/dashboard/menu/menus/${menu.id}`)}
                                                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                title="Editar"
                                            >
                                                <Edit3
                                                    size={14}
                                                    className="text-slate-400"
                                                />
                                            </button>

                                            {deleteConfirm === menu.id ? (
                                                <div className="flex items-center gap-1">
                                                    <button
                                                        onClick={() =>
                                                            handleDeleteMenu(menu.id)
                                                        }
                                                        className="p-2 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                                                        title="Confirmar eliminación"
                                                    >
                                                        <Check
                                                            size={14}
                                                            className="text-red-600"
                                                        />
                                                    </button>
                                                    <button
                                                        onClick={() =>
                                                            setDeleteConfirm(null)
                                                        }
                                                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="Cancelar"
                                                    >
                                                        <X
                                                            size={14}
                                                            className="text-slate-400"
                                                        />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() =>
                                                        setDeleteConfirm(menu.id)
                                                    }
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2
                                                        size={14}
                                                        className="text-red-400"
                                                    />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <MenuModal
                        menu={editingMenu}
                        saving={saving}
                        onSave={handleSaveMenu}
                        onClose={() => {
                            setShowModal(false);
                            setEditingMenu(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// ============================================================================
// MENU MODAL — Create & Edit
// ============================================================================

function MenuModal({
    menu,
    saving,
    onSave,
    onClose,
}: {
    menu: Menu | null;
    saving: boolean;
    onSave: (data: Partial<Menu>) => void;
    onClose: () => void;
}) {
    const [name, setName] = useState(menu?.name || "");
    const [type, setType] = useState(menu?.type || "general");
    const [scheduleType, setScheduleType] = useState(
        menu?.schedule_type || "all_day"
    );

    // Build initial schedule from existing data
    const buildInitialSchedule = (): Record<string, ScheduleDayObj> => {
        const defaultSchedule: Record<string, ScheduleDayObj> = {};
        weekDays.forEach((day) => {
            defaultSchedule[day.key] = {
                start: "09:00",
                end: "23:00",
                enabled: true,
            };
        });

        if (!menu?.schedule) return defaultSchedule;

        // Handle object format
        if (!Array.isArray(menu.schedule)) {
            return { ...defaultSchedule, ...(menu.schedule as Record<string, ScheduleDayObj>) };
        }

        // Handle array format → convert to object
        const mapped: Record<string, ScheduleDayObj> = { ...defaultSchedule };
        const dayMap: Record<string, string> = {
            Lunes: "monday",
            Martes: "tuesday",
            Miércoles: "wednesday",
            Jueves: "thursday",
            Viernes: "friday",
            Sábado: "saturday",
            Domingo: "sunday",
        };
        menu.schedule.forEach((d) => {
            const key = dayMap[d.day] || d.day.toLowerCase();
            if (mapped[key]) {
                mapped[key] = { start: d.open, end: d.close, enabled: d.enabled };
            }
        });
        return mapped;
    };

    const [schedule, setSchedule] = useState<Record<string, ScheduleDayObj>>(
        buildInitialSchedule
    );

    const updateDaySchedule = (
        dayKey: string,
        field: keyof ScheduleDayObj,
        value: string | boolean
    ) => {
        setSchedule((prev) => ({
            ...prev,
            [dayKey]: { ...prev[dayKey], [field]: value },
        }));
    };

    const handleSubmit = () => {
        if (!name.trim()) return;
        onSave({
            name: name.trim(),
            type,
            schedule_type: scheduleType,
            start_time: null,
            end_time: null,
            schedule: scheduleType === "scheduled" ? schedule : null,
            is_active: menu?.is_active ?? true,
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
                className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-xl font-black text-slate-900">
                        {menu ? "Editar Carta" : "Nueva Carta"}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-xl"
                    >
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Nombre de la Carta *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder='Ej: Desayunos, Comidas, Carta de Vinos...'
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            autoFocus
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">
                            Tipo de Carta
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {menuTypes.map((t) => {
                                const IconComp = t.Icon;
                                return (
                                    <button
                                        key={t.value}
                                        onClick={() => setType(t.value)}
                                        className={`flex flex-col items-center gap-2 p-3.5 rounded-xl border-2 transition-all text-center ${type === t.value
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-slate-100 hover:border-slate-200"
                                            }`}
                                    >
                                        <div className={`w-9 h-9 rounded-lg ${t.bg} flex items-center justify-center`}>
                                            <IconComp size={18} className={t.color} />
                                        </div>
                                        <span className="text-xs font-bold text-slate-700">
                                            {t.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Schedule Toggle */}
                    <div>
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div>
                                <p className="font-bold text-slate-900 text-sm">
                                    Horario personalizado
                                </p>
                                <p className="text-xs text-slate-500">
                                    Configura cuándo se activa esta carta
                                </p>
                            </div>
                            <button
                                onClick={() =>
                                    setScheduleType(
                                        scheduleType === "all_day"
                                            ? "scheduled"
                                            : "all_day"
                                    )
                                }
                                className={`relative w-12 h-7 rounded-full transition-colors ${scheduleType === "scheduled"
                                    ? "bg-primary"
                                    : "bg-slate-200"
                                    }`}
                            >
                                <motion.div
                                    animate={{
                                        x: scheduleType === "scheduled" ? 20 : 2,
                                    }}
                                    className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
                                />
                            </button>
                        </div>
                    </div>

                    {/* Schedule Days */}
                    {scheduleType === "scheduled" && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <label className="text-sm font-bold text-slate-700">
                                    Horarios por día
                                </label>
                                <span className="text-[11px] text-slate-400">
                                    {Object.values(schedule).filter(d => d.enabled).length} días activos
                                </span>
                            </div>
                            <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100 overflow-hidden">
                                {weekDays.map((day) => (
                                    <div
                                        key={day.key}
                                        className="flex items-center gap-3 px-4 py-2.5"
                                    >
                                        {/* Day toggle */}
                                        <button
                                            onClick={() =>
                                                updateDaySchedule(
                                                    day.key,
                                                    "enabled",
                                                    !schedule[day.key]?.enabled
                                                )
                                            }
                                            className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${schedule[day.key]?.enabled
                                                ? "bg-primary"
                                                : "bg-slate-200"
                                                }`}
                                        >
                                            <motion.div
                                                animate={{ x: schedule[day.key]?.enabled ? 16 : 2 }}
                                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                                className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                                            />
                                        </button>

                                        <span className={`text-sm font-medium w-24 ${schedule[day.key]?.enabled ? "text-slate-800" : "text-slate-400"}`}>
                                            {day.label}
                                        </span>

                                        {schedule[day.key]?.enabled ? (
                                            <div className="flex items-center gap-1.5 ml-auto">
                                                <input
                                                    type="time"
                                                    value={schedule[day.key]?.start || "09:00"}
                                                    onChange={(e) =>
                                                        updateDaySchedule(day.key, "start", e.target.value)
                                                    }
                                                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 w-[88px]"
                                                />
                                                <span className="text-slate-300 text-xs">—</span>
                                                <input
                                                    type="time"
                                                    value={schedule[day.key]?.end || "23:00"}
                                                    onChange={(e) =>
                                                        updateDaySchedule(day.key, "end", e.target.value)
                                                    }
                                                    className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 w-[88px]"
                                                />
                                            </div>
                                        ) : (
                                            <span className="text-xs text-slate-300 ml-auto">Cerrado</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 flex justify-between flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={!name.trim() || saving}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Guardando...
                            </>
                        ) : (
                            <>
                                <Check size={16} />
                                {menu ? "Guardar Cambios" : "Crear Carta"}
                            </>
                        )}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
