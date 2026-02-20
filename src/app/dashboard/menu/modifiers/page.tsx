"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Plus,
    Search,
    Tag,
    Trash2,
    Edit2,
    Loader2,
} from "lucide-react";

interface ModifierGroup {
    id: string;
    restaurant_id: string;
    name: string;
    name_en: string | null;
    type: 'addon' | 'size' | 'removal' | 'option';
    is_required: boolean;
    max_selections: number;
    modifiers: Modifier[];
}

interface Modifier {
    id: string;
    name: string;
    name_en: string | null;
    price_adjustment: number;
    is_active: boolean;
}

const typeLabels = {
    addon: { label: 'Extras', color: 'bg-green-100 text-green-700' },
    size: { label: 'Tamaños', color: 'bg-blue-100 text-blue-700' },
    removal: { label: 'Quitar', color: 'bg-red-100 text-red-700' },
    option: { label: 'Opciones', color: 'bg-purple-100 text-purple-700' },
};

export default function ModifiersPage() {
    const [groups, setGroups] = useState<ModifierGroup[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);

    const supabase = createClient();

    useEffect(() => {
        loadModifiers();
    }, []);

    const loadModifiers = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: restaurant } = await supabase
            .from("restaurants")
            .select("id")
            .eq("owner_id", user.id)
            .single();

        if (restaurant) {
            const { data } = await supabase
                .from("product_modifiers")
                .select("*")
                .eq("restaurant_id", restaurant.id)
                .order("sort_order");

            if (data) {
                // Group modifiers by type for display
                setGroups(data as any);
            }
        }
        setLoading(false);
    };

    const filteredGroups = groups.filter(g =>
        g.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Modificadores</h1>
                    <p className="text-slate-500 mt-1">Gestiona extras, tamaños y opciones de tus productos</p>
                </div>
                <button
                    onClick={() => { setEditingGroup(null); setShowModal(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors"
                >
                    <Plus size={18} />
                    Nuevo Grupo
                </button>
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar modificadores..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : filteredGroups.length === 0 ? (
                <div className="text-center py-20">
                    <Tag className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Sin modificadores</h3>
                    <p className="text-slate-500 mb-6">Crea grupos de modificadores para personalizar tus productos</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors"
                    >
                        Crear primer grupo
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredGroups.map((group, index) => (
                        <motion.div
                            key={group.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-100 rounded-xl">
                                        <Tag size={20} className="text-slate-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{group.name}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold ${typeLabels[group.type]?.color || 'bg-slate-100 text-slate-600'}`}>
                                                {typeLabels[group.type]?.label || group.type}
                                            </span>
                                            {group.is_required && (
                                                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">
                                                    Obligatorio
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => { setEditingGroup(group); setShowModal(true); }}
                                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                    >
                                        <Edit2 size={16} className="text-slate-500" />
                                    </button>
                                    <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={16} className="text-red-500" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}

