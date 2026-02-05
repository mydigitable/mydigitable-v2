"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Plus,
    Edit3,
    Trash2,
    Check,
    X,
    Loader2,
    Calendar,
    Euro,
    Utensils,
    Coffee,
    Soup,
    Salad,
    IceCream,
    Eye,
    EyeOff,
    Copy,
    Clock,
    ChevronDown,
} from "lucide-react";

interface DailyMenuOption {
    id: string;
    name: string;
    description?: string;
    extra_price?: number;
}

interface DailyMenuCourse {
    id: string;
    name: string;
    type: 'primero' | 'segundo' | 'postre' | 'bebida' | 'extra';
    options: DailyMenuOption[];
    required: boolean;
    max_selections: number;
}

interface DailyMenu {
    id: string;
    name: string;
    description: string | null;
    price: number;
    original_price: number | null;
    courses: DailyMenuCourse[];
    available_days: number[];
    start_time: string | null;
    end_time: string | null;
    is_active: boolean;
    includes_drink: boolean;
    includes_dessert: boolean;
    includes_bread: boolean;
    includes_coffee: boolean;
    created_at: string;
}

const courseTypes = [
    { value: 'primero', label: 'Primero', icon: Soup, color: 'bg-orange-500' },
    { value: 'segundo', label: 'Segundo', icon: Utensils, color: 'bg-red-500' },
    { value: 'postre', label: 'Postre', icon: IceCream, color: 'bg-pink-500' },
    { value: 'bebida', label: 'Bebida', icon: Coffee, color: 'bg-blue-500' },
    { value: 'extra', label: 'Extra', icon: Salad, color: 'bg-green-500' },
];

const daysOfWeek = [
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' },
    { value: 0, label: 'Dom' },
];

export default function DailyMenusPage() {
    const [menus, setMenus] = useState<DailyMenu[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMenu, setEditingMenu] = useState<DailyMenu | null>(null);
    const [restaurant, setRestaurant] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        loadMenus();
    }, []);

    const loadMenus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: restaurants } = await supabase
                .from("restaurants")
                .select("*")
                .eq("owner_id", user.id)
                .single();

            const restaurantData = restaurants;

            if (!restaurantData) return;
            setRestaurant(restaurantData);

            const { data: menusData } = await supabase
                .from("daily_menus")
                .select("*")
                .eq("restaurant_id", restaurantData.id)
                .order("created_at", { ascending: false });

            setMenus(menusData || []);
        } catch (err) {
            console.error("Error loading menus:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMenu = async (data: Partial<DailyMenu>) => {
        if (!restaurant) return;

        setSaving(true);
        try {
            if (editingMenu) {
                await supabase
                    .from("daily_menus")
                    .update({
                        ...data,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", editingMenu.id);
            } else {
                await supabase
                    .from("daily_menus")
                    .insert({
                        restaurant_id: restaurant.id,
                        ...data,
                    });
            }

            await loadMenus();
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
            .from("daily_menus")
            .update({ is_active: isActive })
            .eq("id", menuId);
        loadMenus();
    };

    const duplicateMenu = async (menu: DailyMenu) => {
        await supabase.from("daily_menus").insert({
            restaurant_id: restaurant.id,
            name: `${menu.name} (copia)`,
            description: menu.description,
            price: menu.price,
            original_price: menu.original_price,
            courses: menu.courses,
            available_days: menu.available_days,
            start_time: menu.start_time,
            end_time: menu.end_time,
            includes_drink: menu.includes_drink,
            includes_dessert: menu.includes_dessert,
            includes_bread: menu.includes_bread,
            includes_coffee: menu.includes_coffee,
            is_active: false,
        });
        loadMenus();
    };

    const deleteMenu = async (menuId: string) => {
        if (!confirm('¿Eliminar este menú del día?')) return;
        await supabase.from("daily_menus").delete().eq("id", menuId);
        loadMenus();
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
                    <h1 className="text-2xl font-black text-slate-900">Menús del Día</h1>
                    <p className="text-sm text-slate-500">
                        Crea menús con opciones seleccionables para tus clientes
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
                    Nuevo Menú del Día
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                <p className="text-sm text-blue-800">
                    <strong>💡 Tip:</strong> Los clientes pueden pedir el menú del día directamente desde su móvil,
                    eligiendo sus platos sin necesidad de un camarero. ¡Perfecto para horas punta!
                </p>
            </div>

            {/* Menus List */}
            {menus.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Utensils size={28} className="text-slate-300" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Sin menús del día</h2>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        Crea tu primer menú del día con primero, segundo, postre y opciones para elegir
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors"
                    >
                        <Plus size={18} />
                        Crear Menú del Día
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {menus.map((menu) => (
                        <motion.div
                            key={menu.id}
                            layout
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`bg-white rounded-2xl border-2 overflow-hidden ${menu.is_active ? 'border-primary/20' : 'border-slate-100'
                                }`}
                        >
                            <div className="p-5">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg text-slate-900">{menu.name}</h3>
                                            {!menu.is_active && (
                                                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase">
                                                    Inactivo
                                                </span>
                                            )}
                                        </div>
                                        {menu.description && (
                                            <p className="text-sm text-slate-500 mt-1">{menu.description}</p>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-2xl font-black text-primary">€{menu.price}</span>
                                        {menu.original_price && menu.original_price > menu.price && (
                                            <span className="text-sm text-slate-400 line-through ml-2">
                                                €{menu.original_price}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Courses Preview */}
                                <div className="space-y-2 mb-4">
                                    {(menu.courses || []).map((course, i) => {
                                        const typeInfo = courseTypes.find(t => t.value === course.type);
                                        return (
                                            <div key={i} className="flex items-center gap-2 text-sm">
                                                <div className={`w-6 h-6 rounded-md ${typeInfo?.color} flex items-center justify-center`}>
                                                    {typeInfo && <typeInfo.icon size={12} className="text-white" />}
                                                </div>
                                                <span className="font-medium text-slate-700">{course.name}</span>
                                                <span className="text-slate-400">
                                                    ({course.options?.length || 0} opciones)
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Includes */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {menu.includes_bread && (
                                        <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                                            🍞 Pan incluido
                                        </span>
                                    )}
                                    {menu.includes_drink && (
                                        <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                            🥤 Bebida incluida
                                        </span>
                                    )}
                                    {menu.includes_dessert && (
                                        <span className="px-2 py-1 bg-pink-50 text-pink-700 text-xs font-medium rounded-full">
                                            🍰 Postre incluido
                                        </span>
                                    )}
                                    {menu.includes_coffee && (
                                        <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">
                                            ☕ Café incluido
                                        </span>
                                    )}
                                </div>

                                {/* Schedule */}
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Calendar size={12} />
                                        {(menu.available_days || []).length === 7
                                            ? 'Todos los días'
                                            : daysOfWeek
                                                .filter(d => (menu.available_days || []).includes(d.value))
                                                .map(d => d.label)
                                                .join(', ')
                                        }
                                    </span>
                                    {menu.start_time && menu.end_time && (
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {menu.start_time} - {menu.end_time}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="px-5 py-3 bg-slate-50 flex items-center justify-between">
                                <button
                                    onClick={() => toggleMenuActive(menu.id, !menu.is_active)}
                                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${menu.is_active ? 'text-green-600' : 'text-slate-400'
                                        }`}
                                >
                                    {menu.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                                    {menu.is_active ? 'Activo' : 'Inactivo'}
                                </button>

                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => {
                                            setEditingMenu(menu);
                                            setShowAddModal(true);
                                        }}
                                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                                        title="Editar"
                                    >
                                        <Edit3 size={14} className="text-slate-400" />
                                    </button>
                                    <button
                                        onClick={() => duplicateMenu(menu)}
                                        className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                                        title="Duplicar"
                                    >
                                        <Copy size={14} className="text-slate-400" />
                                    </button>
                                    <button
                                        onClick={() => deleteMenu(menu.id)}
                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 size={14} className="text-red-400" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <DailyMenuModal
                        menu={editingMenu}
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

// Daily Menu Modal
function DailyMenuModal({
    menu,
    saving,
    onSave,
    onClose,
}: {
    menu: DailyMenu | null;
    saving: boolean;
    onSave: (data: Partial<DailyMenu>) => void;
    onClose: () => void;
}) {
    const [step, setStep] = useState(1);
    const [name, setName] = useState(menu?.name || 'Menú del Día');
    const [description, setDescription] = useState(menu?.description || '');
    const [price, setPrice] = useState(menu?.price?.toString() || '12.50');
    const [originalPrice, setOriginalPrice] = useState(menu?.original_price?.toString() || '');
    const [courses, setCourses] = useState<DailyMenuCourse[]>(menu?.courses || [
        { id: '1', name: 'Primeros', type: 'primero', options: [], required: true, max_selections: 1 },
        { id: '2', name: 'Segundos', type: 'segundo', options: [], required: true, max_selections: 1 },
        { id: '3', name: 'Postres', type: 'postre', options: [], required: true, max_selections: 1 },
    ]);
    const [availableDays, setAvailableDays] = useState<number[]>(menu?.available_days || [1, 2, 3, 4, 5]);
    const [startTime, setStartTime] = useState(menu?.start_time || '12:00');
    const [endTime, setEndTime] = useState(menu?.end_time || '16:00');
    const [includesDrink, setIncludesDrink] = useState(menu?.includes_drink ?? true);
    const [includesBread, setIncludesBread] = useState(menu?.includes_bread ?? true);
    const [includesDessert, setIncludesDessert] = useState(menu?.includes_dessert ?? false);
    const [includesCoffee, setIncludesCoffee] = useState(menu?.includes_coffee ?? false);

    const [editingCourse, setEditingCourse] = useState<DailyMenuCourse | null>(null);
    const [newOptionName, setNewOptionName] = useState('');
    const [newOptionExtra, setNewOptionExtra] = useState('');

    const addOption = (courseId: string) => {
        if (!newOptionName) return;
        setCourses(prev => prev.map(c => {
            if (c.id === courseId) {
                return {
                    ...c,
                    options: [...c.options, {
                        id: Date.now().toString(),
                        name: newOptionName,
                        extra_price: newOptionExtra ? parseFloat(newOptionExtra) : undefined,
                    }]
                };
            }
            return c;
        }));
        setNewOptionName('');
        setNewOptionExtra('');
    };

    const removeOption = (courseId: string, optionId: string) => {
        setCourses(prev => prev.map(c => {
            if (c.id === courseId) {
                return {
                    ...c,
                    options: c.options.filter(o => o.id !== optionId)
                };
            }
            return c;
        }));
    };

    const addCourse = () => {
        setCourses(prev => [...prev, {
            id: Date.now().toString(),
            name: 'Nuevo Plato',
            type: 'extra',
            options: [],
            required: false,
            max_selections: 1,
        }]);
    };

    const removeCourse = (courseId: string) => {
        setCourses(prev => prev.filter(c => c.id !== courseId));
    };

    const toggleDay = (day: number) => {
        setAvailableDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
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
                    <div>
                        <h2 className="text-xl font-black text-slate-900">
                            {menu ? 'Editar Menú del Día' : 'Nuevo Menú del Día'}
                        </h2>
                        <p className="text-sm text-slate-500">Paso {step} de 3</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Progress */}
                <div className="px-6 pt-4">
                    <div className="flex gap-2">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-primary' : 'bg-slate-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {step === 1 && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Nombre del Menú *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Menú del Día"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Incluye primero, segundo, postre y bebida"
                                    rows={2}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Precio *
                                    </label>
                                    <div className="relative">
                                        <Euro size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={price}
                                            onChange={(e) => setPrice(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Precio Original <span className="text-slate-400 font-normal">(tachado)</span>
                                    </label>
                                    <div className="relative">
                                        <Euro size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={originalPrice}
                                            onChange={(e) => setOriginalPrice(e.target.value)}
                                            placeholder="15.00"
                                            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    ¿Qué incluye?
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { value: includesBread, set: setIncludesBread, icon: '🍞', label: 'Pan' },
                                        { value: includesDrink, set: setIncludesDrink, icon: '🥤', label: 'Bebida' },
                                        { value: includesDessert, set: setIncludesDessert, icon: '🍰', label: 'Postre' },
                                        { value: includesCoffee, set: setIncludesCoffee, icon: '☕', label: 'Café' },
                                    ].map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={() => item.set(!item.value)}
                                            className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${item.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-slate-100 hover:border-slate-200'
                                                }`}
                                        >
                                            <span className="text-xl">{item.icon}</span>
                                            <span className="font-medium text-sm">{item.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-slate-900">Platos y Opciones</h3>
                                <button
                                    onClick={addCourse}
                                    className="text-sm font-bold text-primary hover:underline"
                                >
                                    + Añadir Plato
                                </button>
                            </div>

                            <div className="space-y-4">
                                {courses.map((course) => {
                                    const typeInfo = courseTypes.find(t => t.value === course.type);
                                    return (
                                        <div key={course.id} className="bg-slate-50 rounded-xl p-4">
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <select
                                                        value={course.type}
                                                        onChange={(e) => {
                                                            setCourses(prev => prev.map(c =>
                                                                c.id === course.id ? { ...c, type: e.target.value as any } : c
                                                            ));
                                                        }}
                                                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-medium"
                                                    >
                                                        {courseTypes.map(t => (
                                                            <option key={t.value} value={t.value}>{t.label}</option>
                                                        ))}
                                                    </select>
                                                    <input
                                                        type="text"
                                                        value={course.name}
                                                        onChange={(e) => {
                                                            setCourses(prev => prev.map(c =>
                                                                c.id === course.id ? { ...c, name: e.target.value } : c
                                                            ));
                                                        }}
                                                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm font-bold"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => removeCourse(course.id)}
                                                    className="p-1 hover:bg-red-100 rounded"
                                                >
                                                    <Trash2 size={14} className="text-red-400" />
                                                </button>
                                            </div>

                                            {/* Options */}
                                            <div className="space-y-2 mb-3">
                                                {course.options.map((option) => (
                                                    <div key={option.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                                                        <span className="text-sm text-slate-700">{option.name}</span>
                                                        <div className="flex items-center gap-2">
                                                            {option.extra_price && (
                                                                <span className="text-xs text-primary font-bold">
                                                                    +€{option.extra_price}
                                                                </span>
                                                            )}
                                                            <button
                                                                onClick={() => removeOption(course.id, option.id)}
                                                                className="p-1 hover:bg-red-50 rounded"
                                                            >
                                                                <X size={12} className="text-red-400" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Add Option */}
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    value={editingCourse?.id === course.id ? newOptionName : ''}
                                                    onChange={(e) => {
                                                        setEditingCourse(course);
                                                        setNewOptionName(e.target.value);
                                                    }}
                                                    onFocus={() => setEditingCourse(course)}
                                                    placeholder="Añadir opción..."
                                                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                                />
                                                <input
                                                    type="number"
                                                    value={editingCourse?.id === course.id ? newOptionExtra : ''}
                                                    onChange={(e) => setNewOptionExtra(e.target.value)}
                                                    onFocus={() => setEditingCourse(course)}
                                                    placeholder="+€"
                                                    className="w-16 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                                                />
                                                <button
                                                    onClick={() => addOption(course.id)}
                                                    disabled={!newOptionName || editingCourse?.id !== course.id}
                                                    className="px-3 py-2 bg-primary text-white rounded-lg text-sm font-bold disabled:opacity-50"
                                                >
                                                    <Plus size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    {step === 3 && (
                        <>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-3">
                                    Días disponibles
                                </label>
                                <div className="flex gap-2">
                                    {daysOfWeek.map((day) => (
                                        <button
                                            key={day.value}
                                            onClick={() => toggleDay(day.value)}
                                            className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${availableDays.includes(day.value)
                                                ? 'bg-primary text-white'
                                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                }`}
                                        >
                                            {day.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Hora inicio
                                    </label>
                                    <input
                                        type="time"
                                        value={startTime}
                                        onChange={(e) => setStartTime(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Hora fin
                                    </label>
                                    <input
                                        type="time"
                                        value={endTime}
                                        onChange={(e) => setEndTime(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                            </div>

                            {/* Preview */}
                            <div className="bg-slate-900 rounded-xl p-4 text-white">
                                <p className="text-xs text-slate-400 mb-2">Vista previa del cliente</p>
                                <h4 className="font-bold text-lg">{name}</h4>
                                <p className="text-2xl font-black text-primary mt-1">€{price}</p>
                                <div className="mt-3 space-y-1">
                                    {courses.map((c, i) => (
                                        <p key={i} className="text-sm text-slate-300">
                                            ✓ {c.name}: {c.options.length} opciones
                                        </p>
                                    ))}
                                </div>
                            </div>
                        </>
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
                            disabled={!name || !price}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            Siguiente
                        </button>
                    ) : (
                        <button
                            onClick={() => onSave({
                                name,
                                description: description || null,
                                price: parseFloat(price),
                                original_price: originalPrice ? parseFloat(originalPrice) : null,
                                courses,
                                available_days: availableDays,
                                start_time: startTime || null,
                                end_time: endTime || null,
                                includes_drink: includesDrink,
                                includes_bread: includesBread,
                                includes_dessert: includesDessert,
                                includes_coffee: includesCoffee,
                                is_active: true,
                            })}
                            disabled={saving || courses.every(c => c.options.length === 0)}
                            className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                            {menu ? 'Guardar' : 'Crear Menú'}
                        </button>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}

