"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Gift,
    Plus,
    Edit3,
    Trash2,
    Eye,
    EyeOff,
    Check,
    X,
    Loader2,
    Percent,
    Euro,
    Tag,
    Calendar,
    Clock,
    Users,
    ShoppingBag,
    Copy,
    Zap,
} from "lucide-react";

interface Promotion {
    id: string;
    name: string;
    description: string | null;
    type: 'percentage' | 'fixed' | 'bogo' | 'free_item' | 'bundle';
    value: number | null;
    min_order: number | null;
    code: string | null;
    applies_to: 'all' | 'category' | 'product' | 'order_type';
    start_date: string | null;
    end_date: string | null;
    max_uses: number | null;
    max_uses_per_customer: number;
    current_uses: number;
    is_active: boolean;
    is_automatic: boolean;
    created_at: string;
}

const promoTypes = [
    { value: 'percentage', label: 'Porcentaje', icon: Percent, example: '20% de descuento' },
    { value: 'fixed', label: 'Cantidad fija', icon: Euro, example: '5€ de descuento' },
    { value: 'bogo', label: '2x1', icon: Gift, example: 'Llévate 2 al precio de 1' },
    { value: 'free_item', label: 'Producto gratis', icon: Tag, example: 'Postre gratis con tu compra' },
];

export default function PromotionsPage() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
    const [restaurant, setRestaurant] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        loadPromotions();
    }, []);

    const loadPromotions = async () => {
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

            const { data: promoData } = await supabase
                .from("promotions")
                .select("*")
                .eq("restaurant_id", restaurantData.id)
                .order("created_at", { ascending: false });

            setPromotions(promoData || []);
        } catch (err) {
            console.error("Error loading promotions:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSavePromo = async (data: Partial<Promotion>) => {
        if (!restaurant) return;

        setSaving(true);
        try {
            if (editingPromo) {
                await supabase
                    .from("promotions")
                    .update(data)
                    .eq("id", editingPromo.id);
            } else {
                await supabase
                    .from("promotions")
                    .insert({
                        restaurant_id: restaurant.id,
                        ...data,
                        current_uses: 0,
                    });
            }

            await loadPromotions();
            setShowAddModal(false);
            setEditingPromo(null);
        } catch (err) {
            console.error("Error saving promotion:", err);
        } finally {
            setSaving(false);
        }
    };

    const togglePromoActive = async (promoId: string, isActive: boolean) => {
        await supabase
            .from("promotions")
            .update({ is_active: isActive })
            .eq("id", promoId);
        loadPromotions();
    };

    const deletePromo = async (promoId: string) => {
        if (!confirm('¿Eliminar esta promoción?')) return;
        await supabase.from("promotions").delete().eq("id", promoId);
        loadPromotions();
    };

    const copyCode = async (code: string) => {
        await navigator.clipboard.writeText(code);
    };

    const getTypeInfo = (type: string) => {
        return promoTypes.find(t => t.value === type) || promoTypes[0];
    };

    const isPromoExpired = (promo: Promotion) => {
        if (!promo.end_date) return false;
        return new Date(promo.end_date) < new Date();
    };

    const isPromoUpcoming = (promo: Promotion) => {
        if (!promo.start_date) return false;
        return new Date(promo.start_date) > new Date();
    };

    // Stats
    const activePromos = promotions.filter(p => p.is_active && !isPromoExpired(p)).length;
    const totalUses = promotions.reduce((sum, p) => sum + (p.current_uses || 0), 0);

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
                    <h1 className="text-2xl font-black text-slate-900">Promociones</h1>
                    <p className="text-sm text-slate-500">
                        Crea ofertas y descuentos para tus clientes
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingPromo(null);
                        setShowAddModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus size={18} />
                    Nueva Promoción
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <Gift size={20} className="text-primary" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Total Promociones</p>
                    <p className="text-2xl font-black text-slate-900">{promotions.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                            <Zap size={20} className="text-green-600" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Activas Ahora</p>
                    <p className="text-2xl font-black text-slate-900">{activePromos}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Users size={20} className="text-blue-600" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Usos Totales</p>
                    <p className="text-2xl font-black text-slate-900">{totalUses}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                            <Tag size={20} className="text-purple-600" />
                        </div>
                    </div>
                    <p className="text-xs text-slate-500 font-medium uppercase">Con Código</p>
                    <p className="text-2xl font-black text-slate-900">{promotions.filter(p => p.code).length}</p>
                </div>
            </div>

            {/* Promotions List */}
            {promotions.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Gift size={28} className="text-slate-300" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Sin promociones</h2>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        Crea promociones para atraer más clientes y aumentar las ventas
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors"
                    >
                        <Plus size={18} />
                        Crear Primera Promoción
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {promotions.map((promo) => {
                        const typeInfo = getTypeInfo(promo.type);
                        const expired = isPromoExpired(promo);
                        const upcoming = isPromoUpcoming(promo);

                        return (
                            <motion.div
                                key={promo.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`bg-white rounded-2xl border-2 overflow-hidden ${expired ? 'border-slate-200 opacity-60' :
                                        !promo.is_active ? 'border-slate-200' :
                                            'border-primary/20'
                                    }`}
                            >
                                <div className="p-5">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${expired ? 'bg-slate-100' : 'bg-primary/10'
                                                }`}>
                                                <typeInfo.icon size={24} className={expired ? 'text-slate-400' : 'text-primary'} />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-900">{promo.name}</h3>
                                                <p className="text-sm text-slate-500">{typeInfo.label}</p>
                                            </div>
                                        </div>

                                        {expired && (
                                            <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-bold rounded-full uppercase">
                                                Expirada
                                            </span>
                                        )}
                                        {upcoming && !expired && (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-[10px] font-bold rounded-full uppercase">
                                                Próxima
                                            </span>
                                        )}
                                        {promo.is_automatic && (
                                            <span className="px-2 py-1 bg-amber-100 text-amber-600 text-[10px] font-bold rounded-full uppercase flex items-center gap-1">
                                                <Zap size={10} />
                                                Auto
                                            </span>
                                        )}
                                    </div>

                                    {/* Discount Value */}
                                    <div className="mb-4">
                                        <span className="text-3xl font-black text-primary">
                                            {promo.type === 'percentage' && `${promo.value}%`}
                                            {promo.type === 'fixed' && `€${promo.value}`}
                                            {promo.type === 'bogo' && '2x1'}
                                            {promo.type === 'free_item' && 'Gratis'}
                                        </span>
                                        {promo.min_order && (
                                            <span className="text-sm text-slate-500 ml-2">
                                                min. €{promo.min_order}
                                            </span>
                                        )}
                                    </div>

                                    {/* Code */}
                                    {promo.code && (
                                        <div className="flex items-center gap-2 mb-4 p-2 bg-slate-50 rounded-lg">
                                            <Tag size={14} className="text-slate-400" />
                                            <code className="flex-1 font-mono font-bold text-slate-900 tracking-wider">
                                                {promo.code}
                                            </code>
                                            <button
                                                onClick={() => copyCode(promo.code!)}
                                                className="p-1 hover:bg-slate-200 rounded"
                                            >
                                                <Copy size={14} className="text-slate-400" />
                                            </button>
                                        </div>
                                    )}

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Users size={14} />
                                            {promo.current_uses} usos
                                        </span>
                                        {promo.max_uses && (
                                            <span className="flex items-center gap-1">
                                                <ShoppingBag size={14} />
                                                máx. {promo.max_uses}
                                            </span>
                                        )}
                                    </div>

                                    {/* Dates */}
                                    {(promo.start_date || promo.end_date) && (
                                        <div className="mt-3 text-xs text-slate-400 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {promo.start_date && new Date(promo.start_date).toLocaleDateString('es-ES')}
                                            {promo.start_date && promo.end_date && ' - '}
                                            {promo.end_date && new Date(promo.end_date).toLocaleDateString('es-ES')}
                                        </div>
                                    )}
                                </div>

                                <div className="px-5 py-3 bg-slate-50 flex items-center justify-between">
                                    <button
                                        onClick={() => togglePromoActive(promo.id, !promo.is_active)}
                                        disabled={expired}
                                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${promo.is_active && !expired ? 'text-green-600' : 'text-slate-400'
                                            }`}
                                    >
                                        {promo.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                                        {promo.is_active ? 'Activa' : 'Inactiva'}
                                    </button>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                setEditingPromo(promo);
                                                setShowAddModal(true);
                                            }}
                                            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit3 size={14} className="text-slate-400" />
                                        </button>
                                        <button
                                            onClick={() => deletePromo(promo.id)}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={14} className="text-red-400" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <PromoModal
                        promo={editingPromo}
                        saving={saving}
                        onSave={handleSavePromo}
                        onClose={() => {
                            setShowAddModal(false);
                            setEditingPromo(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Promo Modal Component
function PromoModal({
    promo,
    saving,
    onSave,
    onClose,
}: {
    promo: Promotion | null;
    saving: boolean;
    onSave: (data: Partial<Promotion>) => void;
    onClose: () => void;
}) {
    const [name, setName] = useState(promo?.name || '');
    const [description, setDescription] = useState(promo?.description || '');
    const [type, setType] = useState(promo?.type || 'percentage');
    const [value, setValue] = useState(promo?.value?.toString() || '');
    const [code, setCode] = useState(promo?.code || '');
    const [minOrder, setMinOrder] = useState(promo?.min_order?.toString() || '');
    const [startDate, setStartDate] = useState(promo?.start_date?.split('T')[0] || '');
    const [endDate, setEndDate] = useState(promo?.end_date?.split('T')[0] || '');
    const [maxUses, setMaxUses] = useState(promo?.max_uses?.toString() || '');
    const [isAutomatic, setIsAutomatic] = useState(promo?.is_automatic || false);

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setCode(result);
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
                        {promo ? 'Editar Promoción' : 'Nueva Promoción'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Nombre de la promoción *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Happy Hour, Descuento Verano..."
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">
                            Tipo de promoción *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {promoTypes.map((t) => (
                                <button
                                    key={t.value}
                                    onClick={() => setType(t.value as any)}
                                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${type === t.value
                                            ? 'border-primary bg-primary/5'
                                            : 'border-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    <t.icon size={20} className={type === t.value ? 'text-primary' : 'text-slate-400'} />
                                    <div>
                                        <p className="font-bold text-sm text-slate-900">{t.label}</p>
                                        <p className="text-[10px] text-slate-500">{t.example}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Value */}
                    {(type === 'percentage' || type === 'fixed') && (
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Valor del descuento *
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder={type === 'percentage' ? '20' : '5'}
                                    className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                                    {type === 'percentage' ? '%' : '€'}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Min Order */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Pedido mínimo
                        </label>
                        <div className="relative">
                            <Euro size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                                type="number"
                                value={minOrder}
                                onChange={(e) => setMinOrder(e.target.value)}
                                placeholder="0.00"
                                className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>
                    </div>

                    {/* Code */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Código promocional
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                placeholder="VERANO20"
                                className="flex-1 px-4 py-3 border border-slate-200 rounded-xl font-mono uppercase focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                            <button
                                type="button"
                                onClick={generateCode}
                                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-600 transition-colors"
                            >
                                Generar
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            Dejar vacío para aplicar automáticamente (sin código)
                        </p>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Fecha inicio
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Fecha fin
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>
                    </div>

                    {/* Max Uses */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Límite de usos
                        </label>
                        <input
                            type="number"
                            value={maxUses}
                            onChange={(e) => setMaxUses(e.target.value)}
                            placeholder="Sin límite"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                        />
                    </div>

                    {/* Automatic */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div>
                            <p className="font-bold text-slate-900">Aplicar automáticamente</p>
                            <p className="text-sm text-slate-500">Se aplica sin necesidad de código</p>
                        </div>
                        <button
                            onClick={() => setIsAutomatic(!isAutomatic)}
                            className={`relative w-12 h-7 rounded-full transition-colors ${isAutomatic ? 'bg-primary' : 'bg-slate-200'
                                }`}
                        >
                            <motion.div
                                animate={{ x: isAutomatic ? 20 : 2 }}
                                className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
                            />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSave({
                            name,
                            description: description || null,
                            type: type as any,
                            value: value ? parseFloat(value) : null,
                            code: code || null,
                            min_order: minOrder ? parseFloat(minOrder) : null,
                            start_date: startDate || null,
                            end_date: endDate || null,
                            max_uses: maxUses ? parseInt(maxUses) : null,
                            is_automatic: isAutomatic,
                            is_active: true,
                        })}
                        disabled={!name || saving}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        {promo ? 'Guardar' : 'Crear Promoción'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

