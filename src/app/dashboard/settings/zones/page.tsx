"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    MapPin,
    Plus,
    Edit3,
    Trash2,
    Check,
    X,
    Loader2,
    Percent,
    Sun,
    Home,
    Umbrella,
    TreePine,
    Coffee,
    Euro,
    Info,
} from "lucide-react";

interface Zone {
    id: string;
    name: string;
    icon: string;
    price_modifier: number; // Percentage, e.g., 10 means +10%
    is_active: boolean;
    description: string | null;
    sort_order: number;
}

const zoneIcons = [
    { icon: '🏠', label: 'Interior' },
    { icon: '☀️', label: 'Terraza' },
    { icon: '🏖️', label: 'Playa' },
    { icon: '🌳', label: 'Jardín' },
    { icon: '🍹', label: 'Bar' },
    { icon: '🎉', label: 'VIP' },
    { icon: '🌊', label: 'Chiringuito' },
    { icon: '🌆', label: 'Azotea' },
];

export default function ZonePricingPage() {
    const [zones, setZones] = useState<Zone[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingZone, setEditingZone] = useState<Zone | null>(null);
    const [restaurant, setRestaurant] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        loadZones();
    }, []);

    const loadZones = async () => {
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

            const { data: zonesData } = await supabase
                .from("zones")
                .select("*")
                .eq("restaurant_id", restaurantData.id)
                .order("sort_order");

            if (zonesData && zonesData.length > 0) {
                setZones(zonesData);
            } else {
                // Create default zones
                const defaultZones: Omit<Zone, 'id'>[] = [
                    { name: 'Interior', icon: '🏠', price_modifier: 0, is_active: true, description: 'Precio base', sort_order: 1 },
                    { name: 'Terraza', icon: '☀️', price_modifier: 10, is_active: true, description: '+10% sobre precio base', sort_order: 2 },
                ];

                for (const zone of defaultZones) {
                    await supabase.from("zones").insert({
                        restaurant_id: restaurantData.id,
                        ...zone,
                    });
                }

                // Reload
                const { data: newZones } = await supabase
                    .from("zones")
                    .select("*")
                    .eq("restaurant_id", restaurantData.id)
                    .order("sort_order");

                setZones(newZones || []);
            }
        } catch (err) {
            console.error("Error loading zones:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveZone = async (data: Omit<Zone, 'id'>) => {
        if (!restaurant) return;

        setSaving(true);
        try {
            if (editingZone) {
                await supabase
                    .from("zones")
                    .update(data)
                    .eq("id", editingZone.id);
            } else {
                await supabase
                    .from("zones")
                    .insert({
                        restaurant_id: restaurant.id,
                        ...data,
                        sort_order: zones.length + 1,
                    });
            }

            await loadZones();
            setShowAddModal(false);
            setEditingZone(null);
        } catch (err) {
            console.error("Error saving zone:", err);
        } finally {
            setSaving(false);
        }
    };

    const toggleZone = async (zoneId: string, isActive: boolean) => {
        await supabase.from("zones").update({ is_active: isActive }).eq("id", zoneId);
        loadZones();
    };

    const deleteZone = async (zoneId: string) => {
        if (!confirm('¿Eliminar esta zona?')) return;
        await supabase.from("zones").delete().eq("id", zoneId);
        loadZones();
    };

    // Calculate example prices
    const basePrice = 10.00;

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Precios por Zona</h1>
                    <p className="text-sm text-slate-500">
                        Configura recargos automáticos para terraza, playa u otras zonas
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingZone(null);
                        setShowAddModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus size={18} />
                    Nueva Zona
                </button>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
                <div className="flex items-start gap-3">
                    <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-blue-800 font-medium mb-1">
                            ¿Cómo funciona?
                        </p>
                        <p className="text-sm text-blue-700">
                            Cuando un cliente escanea el QR de una mesa en terraza, los precios del menú
                            se ajustarán automáticamente según el recargo configurado. El cliente verá
                            los precios finales, no el porcentaje.
                        </p>
                    </div>
                </div>
            </div>

            {/* Price Preview */}
            <div className="bg-white rounded-2xl border border-slate-100 p-6 mb-6">
                <h3 className="font-bold text-slate-900 mb-4">Vista previa de precios</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-100">
                                <th className="text-left pb-3 text-sm font-bold text-slate-500">Producto ejemplo</th>
                                {zones.filter(z => z.is_active).map(zone => (
                                    <th key={zone.id} className="text-center pb-3 text-sm font-bold text-slate-500">
                                        {zone.icon} {zone.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="py-3 text-slate-700">Café con leche</td>
                                {zones.filter(z => z.is_active).map(zone => {
                                    const price = basePrice * (1 + zone.price_modifier / 100);
                                    return (
                                        <td key={zone.id} className="py-3 text-center">
                                            <span className={`font-bold ${zone.price_modifier > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
                                                €{price.toFixed(2)}
                                            </span>
                                            {zone.price_modifier > 0 && (
                                                <span className="text-xs text-amber-500 block">
                                                    +{zone.price_modifier}%
                                                </span>
                                            )}
                                        </td>
                                    );
                                })}
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Zones List */}
            <div className="space-y-4">
                {zones.map((zone) => (
                    <motion.div
                        key={zone.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white rounded-2xl border-2 p-5 ${zone.is_active ? 'border-slate-100' : 'border-slate-200 opacity-60'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center text-3xl">
                                    {zone.icon}
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-slate-900">{zone.name}</h3>
                                    {zone.description && (
                                        <p className="text-sm text-slate-500">{zone.description}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    {zone.price_modifier === 0 ? (
                                        <span className="text-lg font-bold text-slate-900">Precio base</span>
                                    ) : (
                                        <>
                                            <span className="text-2xl font-black text-amber-600">
                                                +{zone.price_modifier}%
                                            </span>
                                            <p className="text-xs text-slate-500">sobre precio base</p>
                                        </>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleZone(zone.id, !zone.is_active)}
                                        className={`relative w-12 h-7 rounded-full transition-colors ${zone.is_active ? 'bg-primary' : 'bg-slate-200'
                                            }`}
                                    >
                                        <motion.div
                                            animate={{ x: zone.is_active ? 20 : 2 }}
                                            className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-sm"
                                        />
                                    </button>

                                    <button
                                        onClick={() => {
                                            setEditingZone(zone);
                                            setShowAddModal(true);
                                        }}
                                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <Edit3 size={16} className="text-slate-400" />
                                    </button>

                                    {zone.price_modifier !== 0 && (
                                        <button
                                            onClick={() => deleteZone(zone.id)}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} className="text-red-400" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <ZoneModal
                        zone={editingZone}
                        saving={saving}
                        onSave={handleSaveZone}
                        onClose={() => {
                            setShowAddModal(false);
                            setEditingZone(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Zone Modal
function ZoneModal({
    zone,
    saving,
    onSave,
    onClose,
}: {
    zone: Zone | null;
    saving: boolean;
    onSave: (data: Omit<Zone, 'id'>) => void;
    onClose: () => void;
}) {
    const [name, setName] = useState(zone?.name || '');
    const [icon, setIcon] = useState(zone?.icon || '☀️');
    const [priceModifier, setPriceModifier] = useState(zone?.price_modifier?.toString() || '10');
    const [description, setDescription] = useState(zone?.description || '');

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
                className="bg-white rounded-3xl w-full max-w-md overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900">
                        {zone ? 'Editar Zona' : 'Nueva Zona'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Icon */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">
                            Icono
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {zoneIcons.map((item) => (
                                <button
                                    key={item.icon}
                                    onClick={() => setIcon(item.icon)}
                                    className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${icon === item.icon
                                            ? 'bg-primary/10 ring-2 ring-primary'
                                            : 'bg-slate-100 hover:bg-slate-200'
                                        }`}
                                >
                                    {item.icon}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Nombre de la zona *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Terraza, Playa, VIP..."
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                        />
                    </div>

                    {/* Price Modifier */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Recargo sobre precio base
                        </label>
                        <div className="flex items-center gap-4">
                            <div className="relative flex-1">
                                <input
                                    type="number"
                                    value={priceModifier}
                                    onChange={(e) => setPriceModifier(e.target.value)}
                                    min="0"
                                    max="100"
                                    className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                />
                                <Percent size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                            </div>
                            <div className="flex gap-2">
                                {[0, 5, 10, 15, 20].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => setPriceModifier(val.toString())}
                                        className={`px-3 py-2 rounded-lg text-sm font-bold transition-colors ${priceModifier === val.toString()
                                                ? 'bg-primary text-white'
                                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }`}
                                    >
                                        {val}%
                                    </button>
                                ))}
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                            0% = precio base (sin recargo)
                        </p>
                    </div>

                    {/* Preview */}
                    {parseFloat(priceModifier) > 0 && (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <p className="text-sm text-amber-800">
                                <strong>Ejemplo:</strong> Un producto de €10.00 en {name || 'esta zona'} costará{' '}
                                <strong>€{(10 * (1 + parseFloat(priceModifier || '0') / 100)).toFixed(2)}</strong>
                            </p>
                        </div>
                    )}

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Descripción (opcional)
                        </label>
                        <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Ej: Mesas con sombrilla"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                        />
                    </div>
                </div>

                <div className="p-6 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSave({
                            name,
                            icon,
                            price_modifier: parseFloat(priceModifier) || 0,
                            description: description || null,
                            is_active: true,
                            sort_order: zone?.sort_order || 0,
                        })}
                        disabled={!name || saving}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        {zone ? 'Guardar' : 'Crear Zona'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

