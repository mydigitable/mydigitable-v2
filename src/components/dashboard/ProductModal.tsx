"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X, Check, Loader2, Info, Tag, Clock, Save,
    Sparkles, Leaf, Wheat, Euro, FileText, Zap, Bot, Wand2, XCircle,
    Plus, Minus, Trash2, Settings2, ShoppingBag
} from "lucide-react";
import { ImageUploader } from "@/components/dashboard/ImageUploader";

// --- INTERFACES ---
interface Product {
    id: string;
    category_id: string;
    restaurant_id: string;
    name_es: string;
    name_en: string | null;
    description_es: string | null;
    price: number;
    image_url: string | null;
    allergens: string[] | null;
    dietary_tags: string[] | null;
    is_available: boolean;
    is_featured: boolean;
    extras?: any;
    options?: any;
}

interface Category {
    id: string;
    name_es: string;
    icon: string;
}

interface ModifierGroup {
    nombre: string;
    tipo: 'radio' | 'checkbox';
    obligatorio: boolean;
    opciones: string[];
}

interface ExtraOption {
    nombre: string;
    precio: number;
}

interface ExtraGroup {
    grupo: string;
    max_selecciones: number;
    opciones: ExtraOption[];
}

interface ComboOption {
    nombre: string;
    descripcion: string;
    precio_extra: number;
}

// --- CONSTANTS ---
const allergensList = [
    { id: 'gluten', label: 'Gluten', emoji: '🌾' },
    { id: 'lactose', label: 'Lácteos', emoji: '🥛' },
    { id: 'eggs', label: 'Huevos', emoji: '🥚' },
    { id: 'fish', label: 'Pescado', emoji: '🐟' },
    { id: 'shellfish', label: 'Mariscos', emoji: '🦐' },
    { id: 'peanuts', label: 'Cacahuetes', emoji: '🥜' },
    { id: 'nuts', label: 'Frutos secos', emoji: '🥜' },
    { id: 'soy', label: 'Soja', emoji: '🫘' },
    { id: 'sulphites', label: 'Sulfitos', emoji: '🍇' },
];

type AIStatus = 'idle' | 'thinking' | 'done' | 'error';

const TABS = [
    { id: 'basic', label: 'Básico', icon: FileText },
    { id: 'options', label: 'Opciones', icon: Settings2 },
    { id: 'details', label: 'Detalles', icon: Tag },
];

// --- MAIN COMPONENT ---
export function ProductModal({
    product,
    categories,
    saving,
    onSave,
    onClose,
}: {
    product: Product | null;
    categories: Category[];
    saving: boolean;
    onSave: (data: Partial<Product> & { category_ids?: string[] }) => void;
    onClose: () => void;
}) {
    const [activeTab, setActiveTab] = useState('basic');
    const nameInputRef = useRef<HTMLInputElement>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout>();

    // Form State
    const [nameEs, setNameEs] = useState(product?.name_es || '');
    const [nameEn, setNameEn] = useState(product?.name_en || '');
    const [description, setDescription] = useState(product?.description_es || '');
    const [price, setPrice] = useState(product?.price?.toString() || '');
    const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>(
        product?.category_id ? [product.category_id] : []
    );
    const [imageUrl, setImageUrl] = useState(product?.image_url || '');
    const [dietaryTags, setDietaryTags] = useState<string[]>(product?.dietary_tags || []);
    const [allergens, setAllergens] = useState<string[]>(product?.allergens || []);
    const [isAvailable, setIsAvailable] = useState(product?.is_available ?? true);
    const [isFeatured, setIsFeatured] = useState(product?.is_featured || false);

    // Options State (Modifiers, Extras, Combos)
    const [modifiers, setModifiers] = useState<ModifierGroup[]>(product?.options?.modifiers || []);
    const [extras, setExtras] = useState<ExtraGroup[]>(product?.extras || []);
    const [combos, setCombos] = useState<ComboOption[]>([]);

    // AI State — only for description auto-generation
    const [aiDescStatus, setAiDescStatus] = useState<AIStatus>('idle');
    const [aiOptionsStatus, setAiOptionsStatus] = useState<AIStatus>('idle');

    // Focus name input on open
    useEffect(() => {
        if (!product) {
            setTimeout(() => nameInputRef.current?.focus(), 200);
        }
    }, []);

    // AI: silently auto-generate description when user types name (new products only)
    useEffect(() => {
        if (nameEs.length >= 3 && !product && !description) {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = setTimeout(() => {
                generateDescription(nameEs);
            }, 1200);
        }
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, [nameEs]);

    const toggleCategory = (catId: string) => {
        setSelectedCategoryIds(prev =>
            prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
        );
    };

    const toggleAllergen = (id: string) => {
        setAllergens(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const toggleDietaryTag = (tag: string) => {
        setDietaryTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    // ===== AI: Generate description only =====
    const generateDescription = async (nombre: string) => {
        if (!nombre || nombre.length < 3) return;
        setAiDescStatus('thinking');
        try {
            const response = await fetch('/api/ai/product', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre }),
            });
            if (response.ok) {
                const data = await response.json();
                if (data.descripcion) {
                    setDescription(data.descripcion);
                }
                setAiDescStatus('done');
            } else {
                setAiDescStatus('error');
            }
        } catch (error) {
            console.error('AI description error:', error);
            setAiDescStatus('error');
        }
    };

    // ===== AI: Suggest options (modifiers, extras, combos) =====
    const triggerAIOptions = async () => {
        if (!nameEs) return;
        setAiOptionsStatus('thinking');
        try {
            const response = await fetch('/api/ai/product-options', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: nameEs, descripcion: description }),
            });
            if (response.ok) {
                const data = await response.json();
                if (data.modificadores?.length > 0) setModifiers(data.modificadores);
                if (data.extras?.length > 0) setExtras(data.extras);
                if (data.combos?.length > 0) setCombos(data.combos);
                setAiOptionsStatus('done');
            } else {
                setAiOptionsStatus('error');
            }
        } catch (error) {
            console.error('AI options error:', error);
            setAiOptionsStatus('error');
        }
    };

    // ===== MODIFIER HANDLERS =====
    const addModifierGroup = () => {
        setModifiers([...modifiers, { nombre: '', tipo: 'radio', obligatorio: false, opciones: [''] }]);
    };
    const removeModifierGroup = (idx: number) => setModifiers(modifiers.filter((_, i) => i !== idx));
    const updateModifierGroup = (idx: number, field: string, value: any) => {
        const updated = [...modifiers]; (updated[idx] as any)[field] = value; setModifiers(updated);
    };
    const addModifierOption = (gi: number) => {
        const u = [...modifiers]; u[gi].opciones.push(''); setModifiers(u);
    };
    const updateModifierOption = (gi: number, oi: number, val: string) => {
        const u = [...modifiers]; u[gi].opciones[oi] = val; setModifiers(u);
    };
    const removeModifierOption = (gi: number, oi: number) => {
        const u = [...modifiers]; u[gi].opciones = u[gi].opciones.filter((_, i) => i !== oi); setModifiers(u);
    };

    // ===== EXTRA HANDLERS =====
    const addExtraGroup = () => {
        setExtras([...extras, { grupo: '', max_selecciones: 5, opciones: [{ nombre: '', precio: 0 }] }]);
    };
    const removeExtraGroup = (idx: number) => setExtras(extras.filter((_, i) => i !== idx));
    const updateExtraGroup = (idx: number, field: string, value: any) => {
        const u = [...extras]; (u[idx] as any)[field] = value; setExtras(u);
    };
    const addExtraOption = (gi: number) => {
        const u = [...extras]; u[gi].opciones.push({ nombre: '', precio: 0 }); setExtras(u);
    };
    const updateExtraOption = (gi: number, oi: number, field: string, val: any) => {
        const u = [...extras]; (u[gi].opciones[oi] as any)[field] = val; setExtras(u);
    };
    const removeExtraOption = (gi: number, oi: number) => {
        const u = [...extras]; u[gi].opciones = u[gi].opciones.filter((_, i) => i !== oi); setExtras(u);
    };

    // ===== COMBO HANDLERS =====
    const addCombo = () => setCombos([...combos, { nombre: '', descripcion: '', precio_extra: 0 }]);
    const removeCombo = (idx: number) => setCombos(combos.filter((_, i) => i !== idx));
    const updateCombo = (idx: number, field: string, value: any) => {
        const u = [...combos]; (u[idx] as any)[field] = value; setCombos(u);
    };

    // ===== SAVE — ONLY send fields that exist in DB =====
    const handleSave = () => {
        if (!nameEs || !price || selectedCategoryIds.length === 0) {
            alert('Completa: Nombre, Precio y al menos una Categoría');
            return;
        }

        const cleanModifiers = modifiers
            .filter(m => m.nombre && m.opciones.some(o => o.trim()))
            .map(m => ({ ...m, opciones: m.opciones.filter(o => o.trim()) }));
        const cleanExtras = extras
            .filter(e => e.grupo && e.opciones.some(o => o.nombre.trim()))
            .map(e => ({ ...e, opciones: e.opciones.filter(o => o.nombre.trim()) }));

        // Only send columns that exist in the products table
        onSave({
            name_es: nameEs,
            name_en: nameEn || null,
            description_es: description || null,
            price: parseFloat(price),
            category_id: selectedCategoryIds[0],
            category_ids: selectedCategoryIds,
            image_url: imageUrl || null,
            allergens: allergens.length > 0 ? allergens : null,
            dietary_tags: dietaryTags,
            is_available: isAvailable,
            is_featured: isFeatured,
            extras: cleanExtras.length > 0 ? cleanExtras : null,
            options: cleanModifiers.length > 0 ? { modifiers: cleanModifiers } : null,
        } as any);
    };

    const optionsCount = modifiers.length + extras.length + combos.length;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            >
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                    <div>
                        <h2 className="text-xl font-black text-slate-900">
                            {product ? 'Editar Producto' : 'Nuevo Producto'}
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            {product ? 'Actualiza los detalles del plato' : 'Escribe el nombre y la descripción se genera sola ✨'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    {/* Sidebar Tabs */}
                    <div className="w-full md:w-48 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-2 md:p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible flex-shrink-0">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
                                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                                    }`}
                            >
                                <tab.icon size={18} />
                                {tab.label}
                                {tab.id === 'options' && optionsCount > 0 && (
                                    <span className="ml-auto w-5 h-5 bg-emerald-100 text-emerald-600 text-[10px] font-black rounded-full flex items-center justify-center">
                                        {optionsCount}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 bg-white">

                        {/* ============ TAB: BASIC ============ */}
                        {activeTab === 'basic' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Left: Basic Info */}
                                    <div className="space-y-5">
                                        {/* Name */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre del producto *</label>
                                            <input ref={nameInputRef} type="text" value={nameEs}
                                                onChange={(e) => {
                                                    setNameEs(e.target.value);
                                                    if (aiDescStatus !== 'idle') setAiDescStatus('idle');
                                                }}
                                                placeholder="Ej: Hamburguesa Clásica"
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-bold" />
                                            {aiDescStatus === 'thinking' && (
                                                <p className="text-[10px] text-purple-500 mt-1 flex items-center gap-1 animate-pulse">
                                                    <Loader2 size={10} className="animate-spin" /> Generando descripción...
                                                </p>
                                            )}
                                        </div>

                                        {/* Categories */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                                Categorías * <span className="text-slate-400 normal-case font-medium">({selectedCategoryIds.length})</span>
                                            </label>
                                            <div className="space-y-1.5 max-h-[140px] overflow-y-auto border border-slate-200 rounded-xl p-2">
                                                {categories.length === 0 ? (
                                                    <p className="text-sm text-slate-400 text-center py-3">No hay categorías</p>
                                                ) : categories.map((cat) => (
                                                    <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}
                                                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg border transition-all text-left ${selectedCategoryIds.includes(cat.id)
                                                            ? 'border-primary bg-primary/5' : 'border-transparent hover:bg-slate-50'}`}>
                                                        <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${selectedCategoryIds.includes(cat.id)
                                                            ? 'bg-primary text-white' : 'bg-slate-100 text-transparent'}`}>
                                                            <Check size={14} />
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-700">{cat.name_es}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Precio *</label>
                                            <div className="relative">
                                                <Euro size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                <input type="number" step="0.01" min="0" value={price}
                                                    onChange={(e) => setPrice(e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-bold" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Image */}
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fotografía</label>
                                        <ImageUploader
                                            value={imageUrl}
                                            onChange={(url) => setImageUrl(url || '')}
                                            bucket="product-images"
                                            folder="products"
                                            label="Foto del plato"
                                        />
                                        {!imageUrl && (
                                            <div className="mt-3 bg-blue-50 p-3 rounded-xl flex items-start gap-3 border border-blue-100">
                                                <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={16} />
                                                <p className="text-[10px] text-blue-700 leading-relaxed">
                                                    Los platos con fotos venden un <strong>30% más</strong>. Sube una foto o genera una con IA.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="pt-3 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                            Descripción
                                            {aiDescStatus === 'done' && (
                                                <span className="text-[10px] px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded font-black">✦ IA</span>
                                            )}
                                        </label>
                                        <button onClick={() => generateDescription(nameEs)} disabled={!nameEs || aiDescStatus === 'thinking'}
                                            className="flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-purple-100 disabled:opacity-50">
                                            {aiDescStatus === 'thinking'
                                                ? <><Loader2 size={12} className="animate-spin" /> Generando...</>
                                                : <><Wand2 size={12} /> {description ? 'Regenerar con IA' : 'Generar con IA'}</>}
                                        </button>
                                    </div>
                                    <textarea value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe los ingredientes, la preparación y lo que hace especial a este plato..."
                                        rows={3}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none" />
                                    <p className="text-[10px] text-slate-400 mt-1">Puedes editar la descripción generada por la IA en cualquier momento</p>
                                </div>
                            </div>
                        )}

                        {/* ============ TAB: OPTIONS ============ */}
                        {activeTab === 'options' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                {/* AI Suggest Button */}
                                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                                            <Bot size={22} className="text-emerald-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-sm">Sugerir opciones con IA</h3>
                                            <p className="text-[10px] text-slate-500">Analiza el plato y sugiere modificadores, extras y combos</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={triggerAIOptions}
                                        disabled={!nameEs || aiOptionsStatus === 'thinking'}
                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors disabled:opacity-50 shadow-lg shadow-emerald-600/20"
                                    >
                                        {aiOptionsStatus === 'thinking'
                                            ? <><Loader2 size={14} className="animate-spin" /> Analizando...</>
                                            : <><Zap size={14} /> {optionsCount > 0 ? 'Regenerar' : 'Sugerir'}</>}
                                    </button>
                                </div>

                                {/* ---- MODIFIERS ---- */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                                <Settings2 size={18} className="text-blue-500" /> Modificadores
                                            </h3>
                                            <p className="text-[10px] text-slate-500">Sin costo extra: punto carne, tipo pan, guarnición</p>
                                        </div>
                                        <button onClick={addModifierGroup}
                                            className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg">
                                            <Plus size={14} /> Añadir
                                        </button>
                                    </div>

                                    {modifiers.length === 0 ? (
                                        <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                            <Settings2 size={24} className="mx-auto text-slate-300 mb-2" />
                                            <p className="text-xs text-slate-400">No hay modificadores</p>
                                            <p className="text-[10px] text-slate-400 mt-1">Usa "Sugerir con IA" o añade manualmente</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {modifiers.map((mod, gi) => (
                                                <div key={gi} className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <input type="text" value={mod.nombre}
                                                            onChange={(e) => updateModifierGroup(gi, 'nombre', e.target.value)}
                                                            placeholder="Ej: Punto de la carne"
                                                            className="flex-1 px-3 py-2 border border-blue-200 rounded-lg text-sm font-bold focus:outline-none focus:border-blue-400 bg-white" />
                                                        <select value={mod.tipo}
                                                            onChange={(e) => updateModifierGroup(gi, 'tipo', e.target.value)}
                                                            className="px-2 py-2 border border-blue-200 rounded-lg text-xs bg-white">
                                                            <option value="radio">Elegir 1</option>
                                                            <option value="checkbox">Varias</option>
                                                        </select>
                                                        <label className="flex items-center gap-1 text-[10px] text-slate-600 whitespace-nowrap cursor-pointer">
                                                            <input type="checkbox" checked={mod.obligatorio}
                                                                onChange={(e) => updateModifierGroup(gi, 'obligatorio', e.target.checked)}
                                                                className="w-3.5 h-3.5 rounded" /> Obligatorio
                                                        </label>
                                                        <button onClick={() => removeModifierGroup(gi)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                                                    </div>
                                                    <div className="space-y-2 ml-2">
                                                        {mod.opciones.map((opt, oi) => (
                                                            <div key={oi} className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded-full border-2 border-blue-300 flex-shrink-0" />
                                                                <input type="text" value={opt}
                                                                    onChange={(e) => updateModifierOption(gi, oi, e.target.value)}
                                                                    placeholder="Opción..."
                                                                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white" />
                                                                {mod.opciones.length > 1 && (
                                                                    <button onClick={() => removeModifierOption(gi, oi)} className="p-1 text-slate-400 hover:text-red-400"><Minus size={12} /></button>
                                                                )}
                                                            </div>
                                                        ))}
                                                        <button onClick={() => addModifierOption(gi)}
                                                            className="text-[10px] text-blue-500 font-bold hover:text-blue-700 flex items-center gap-1 ml-5">
                                                            <Plus size={10} /> Añadir opción
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* ---- EXTRAS ---- */}
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                                <ShoppingBag size={18} className="text-amber-500" /> Extras
                                            </h3>
                                            <p className="text-[10px] text-slate-500">Suplementos con precio adicional</p>
                                        </div>
                                        <button onClick={addExtraGroup}
                                            className="flex items-center gap-1 text-xs font-bold text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg">
                                            <Plus size={14} /> Añadir
                                        </button>
                                    </div>

                                    {extras.length === 0 ? (
                                        <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                            <ShoppingBag size={24} className="mx-auto text-slate-300 mb-2" />
                                            <p className="text-xs text-slate-400">No hay extras</p>
                                            <p className="text-[10px] text-slate-400 mt-1">Ej: Extra queso (+1.50€), Bacon (+2.00€)</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {extras.map((group, gi) => (
                                                <div key={gi} className="bg-amber-50/50 border border-amber-100 rounded-xl p-4">
                                                    <div className="flex items-center gap-3 mb-3">
                                                        <input type="text" value={group.grupo}
                                                            onChange={(e) => updateExtraGroup(gi, 'grupo', e.target.value)}
                                                            placeholder="Ej: Ingredientes extra"
                                                            className="flex-1 px-3 py-2 border border-amber-200 rounded-lg text-sm font-bold focus:outline-none focus:border-amber-400 bg-white" />
                                                        <div className="flex items-center gap-1 text-[10px] text-slate-600 whitespace-nowrap">
                                                            <span>Máx:</span>
                                                            <input type="number" min="1" max="20" value={group.max_selecciones}
                                                                onChange={(e) => updateExtraGroup(gi, 'max_selecciones', parseInt(e.target.value) || 1)}
                                                                className="w-12 px-2 py-1 border border-amber-200 rounded text-center text-xs bg-white" />
                                                        </div>
                                                        <button onClick={() => removeExtraGroup(gi)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 size={14} /></button>
                                                    </div>
                                                    <div className="space-y-2 ml-2">
                                                        {group.opciones.map((opt, oi) => (
                                                            <div key={oi} className="flex items-center gap-2">
                                                                <div className="w-3 h-3 rounded border border-amber-300 flex-shrink-0" />
                                                                <input type="text" value={opt.nombre}
                                                                    onChange={(e) => updateExtraOption(gi, oi, 'nombre', e.target.value)}
                                                                    placeholder="Nombre extra..."
                                                                    className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-amber-400 bg-white" />
                                                                <div className="flex items-center">
                                                                    <span className="text-xs text-slate-400 mr-1">+</span>
                                                                    <input type="number" step="0.10" min="0" value={opt.precio}
                                                                        onChange={(e) => updateExtraOption(gi, oi, 'precio', parseFloat(e.target.value) || 0)}
                                                                        className="w-16 px-2 py-1.5 border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:border-amber-400 bg-white" />
                                                                    <span className="text-xs text-slate-400 ml-1">€</span>
                                                                </div>
                                                                {group.opciones.length > 1 && (
                                                                    <button onClick={() => removeExtraOption(gi, oi)} className="p-1 text-slate-400 hover:text-red-400"><Minus size={12} /></button>
                                                                )}
                                                            </div>
                                                        ))}
                                                        <button onClick={() => addExtraOption(gi)}
                                                            className="text-[10px] text-amber-600 font-bold hover:text-amber-700 flex items-center gap-1 ml-5">
                                                            <Plus size={10} /> Añadir extra
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* ---- COMBOS ---- */}
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                                <Tag size={18} className="text-violet-500" /> Combos / Menús
                                            </h3>
                                            <p className="text-[10px] text-slate-500">Agrupaciones con precio especial</p>
                                        </div>
                                        <button onClick={addCombo}
                                            className="flex items-center gap-1 text-xs font-bold text-violet-600 hover:bg-violet-50 px-3 py-1.5 rounded-lg">
                                            <Plus size={14} /> Añadir
                                        </button>
                                    </div>

                                    {combos.length === 0 ? (
                                        <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                            <Tag size={24} className="mx-auto text-slate-300 mb-2" />
                                            <p className="text-xs text-slate-400">No hay combos</p>
                                            <p className="text-[10px] text-slate-400 mt-1">Ej: Menú completo con patatas y bebida (+4.50€)</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {combos.map((combo, idx) => (
                                                <div key={idx} className="bg-violet-50/50 border border-violet-100 rounded-xl p-4 flex items-start gap-3">
                                                    <div className="flex-1 space-y-2">
                                                        <input type="text" value={combo.nombre}
                                                            onChange={(e) => updateCombo(idx, 'nombre', e.target.value)}
                                                            placeholder="Ej: Menú completo"
                                                            className="w-full px-3 py-2 border border-violet-200 rounded-lg text-sm font-bold focus:outline-none focus:border-violet-400 bg-white" />
                                                        <input type="text" value={combo.descripcion}
                                                            onChange={(e) => updateCombo(idx, 'descripcion', e.target.value)}
                                                            placeholder="Con patatas fritas y bebida"
                                                            className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-violet-400 bg-white" />
                                                    </div>
                                                    <div className="flex items-center gap-1 pt-1">
                                                        <span className="text-xs text-slate-400">+</span>
                                                        <input type="number" step="0.50" min="0" value={combo.precio_extra}
                                                            onChange={(e) => updateCombo(idx, 'precio_extra', parseFloat(e.target.value) || 0)}
                                                            className="w-16 px-2 py-2 border border-slate-200 rounded-lg text-sm text-right font-bold focus:outline-none focus:border-violet-400 bg-white" />
                                                        <span className="text-xs text-slate-400">€</span>
                                                    </div>
                                                    <button onClick={() => removeCombo(idx)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg mt-1"><Trash2 size={14} /></button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ============ TAB: DETAILS ============ */}
                        {activeTab === 'details' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                {/* Dietary Tags */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Dietas y Etiquetas</label>
                                    <div className="flex flex-wrap gap-3">
                                        <ToggleBtn active={dietaryTags.includes('vegetarian')} onChange={() => toggleDietaryTag('vegetarian')} label="Vegetariano" icon={<Leaf size={16} />} />
                                        <ToggleBtn active={dietaryTags.includes('vegan')} onChange={() => toggleDietaryTag('vegan')} label="Vegano" icon={<Leaf size={16} className="fill-current" />} />
                                        <ToggleBtn active={dietaryTags.includes('gluten_free')} onChange={() => toggleDietaryTag('gluten_free')} label="Sin Gluten" icon={<Wheat size={16} />} />
                                        <ToggleBtn active={isFeatured} onChange={setIsFeatured} label="Destacado"
                                            icon={<Sparkles size={16} className="text-amber-400 fill-amber-400" />}
                                            activeClass="bg-amber-100 text-amber-700 border-amber-200" />
                                    </div>
                                </div>

                                {/* Allergens */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Alérgenos</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {allergensList.map((a) => (
                                            <button key={a.id} onClick={() => toggleAllergen(a.id)}
                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${allergens.includes(a.id)
                                                    ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-primary'}`}>
                                                <span className="text-lg">{a.emoji}</span>
                                                <span className="text-sm font-bold">{a.label}</span>
                                                {allergens.includes(a.id) && <Check size={14} className="ml-auto text-rose-500" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Availability */}
                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">Disponible para la venta</h4>
                                            <p className="text-[10px] text-slate-500">Los clientes pueden ver y pedir este producto</p>
                                        </div>
                                        <div className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${isAvailable ? 'bg-green-500' : 'bg-slate-300'}`}
                                            onClick={() => setIsAvailable(!isAvailable)}>
                                            <div className={`bg-white w-4 h-4 rounded-full shadow-sm transition-transform ${isAvailable ? 'translate-x-6' : 'translate-x-0'}`} />
                                        </div>
                                    </div>
                                </div>

                                {/* English name (optional) */}
                                <div className="border-t border-slate-100 pt-4">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre en inglés <span className="text-slate-400 font-normal">(opcional)</span></label>
                                    <input type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)}
                                        placeholder="Ej: Classic Burger"
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" />
                                    <p className="text-[10px] text-slate-400 mt-1">Próximamente: traducción a todos los idiomas europeos</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <span className="text-xs text-slate-400 hidden sm:inline-block">* Campos obligatorios</span>
                    <div className="flex gap-3 ml-auto">
                        <button onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors text-sm">
                            Cancelar
                        </button>
                        <button onClick={handleSave} disabled={saving}
                            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-70">
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Guardar
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ============================================
function ToggleBtn({ active, onChange, label, icon, activeClass = "bg-green-50 text-green-700 border-green-200" }: {
    active: boolean; onChange: (v: boolean) => void; label: string; icon: React.ReactNode; activeClass?: string;
}) {
    return (
        <button onClick={() => onChange(!active)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-bold transition-all ${active ? activeClass : 'bg-white border-slate-200 text-slate-500 hover:border-primary'}`}>
            {icon} {label}
        </button>
    );
}
