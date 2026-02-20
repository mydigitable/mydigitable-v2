"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { X, Check, Loader2, UploadCloud, Trash2, ChevronRight, Utensils, Pizza, Beef, Fish, Sandwich, Soup, Salad, Cake, IceCream, Coffee, Beer, Wine, Carrot, Grape, Flame, Sparkles, Leaf, Croissant, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// --- CONSTANTS ---
const IconMap: { [key: string]: any } = {
    'Utensils': Utensils, 'Pizza': Pizza, 'Beef': Beef, 'Fish': Fish,
    'Sandwich': Sandwich, 'Soup': Soup, 'Salad': Salad, 'Croissant': Croissant,
    'Cake': Cake, 'IceCream': IceCream, 'Coffee': Coffee, 'Beer': Beer,
    'Wine': Wine, 'Carrot': Carrot, 'Grape': Grape, 'Flame': Flame,
    'Sparkles': Sparkles, 'Leaf': Leaf,
};

const CATEGORY_PRESETS = [
    { name: 'Entrantes', icon: 'Salad', description: 'Platos para comenzar' },
    { name: 'Principales', icon: 'Utensils', description: 'Platos fuertes' },
    { name: 'Carnes', icon: 'Beef', description: 'Cortes y asados' },
    { name: 'Pescados', icon: 'Fish', description: 'Del mar' },
    { name: 'Pizzas', icon: 'Pizza', description: 'Artesanales' },
    { name: 'Postres', icon: 'Cake', description: 'Dulces finales' },
    { name: 'Bebidas', icon: 'Wine', description: 'Vinos y refrescos' },
    { name: 'Café', icon: 'Coffee', description: 'Cafés e infusiones' },
    { name: 'Desayunos', icon: 'Croissant', description: 'Para empezar el día' },
    { name: 'Healthy', icon: 'Leaf', description: 'Opciones ligeras' },
];

interface Category {
    id: string;
    restaurant_id: string;
    name_es: string;
    name_en: string | null;
    description_es: string | null;
    icon: string | null;
    image_url: string | null;
    sort_order: number;
    is_active: boolean;
    menu_id?: string | null;
}

interface MenuInfo {
    id: string;
    name: string;
    is_active: boolean;
}

export function CategoryModal({
    category,
    menus = [],
    onSave,
    onClose,
}: {
    category: Category | null;
    menus?: MenuInfo[];
    onSave: (data: Partial<Category> & { menu_ids?: string[] }) => void;
    onClose: () => void;
}) {
    const [nameEs, setNameEs] = useState(category?.name_es || '');
    const [description, setDescription] = useState(category?.description_es || '');
    const [selectedIcon, setSelectedIcon] = useState(category?.icon && IconMap[category.icon] ? category.icon : '');
    const [imageUrl, setImageUrl] = useState(category?.image_url || '');
    const [selectedMenuIds, setSelectedMenuIds] = useState<string[]>(
        category?.menu_id ? [category.menu_id] : []
    );
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    // Mapeo retroactivo para emojis
    const EmojiMap: { [key: string]: any } = {
        '🍔': Beef, '🍕': Pizza, '🥗': Salad, '🍺': Beer, '🍷': Wine,
        '🍰': Cake, '☕': Coffee, '🍦': IceCream, '🐟': Fish, '🥩': Beef
    };

    const IconComponent = selectedIcon ? (IconMap[selectedIcon] || EmojiMap[selectedIcon] || Utensils) : null;

    const supabase = createClient();

    const toggleMenu = (menuId: string) => {
        setSelectedMenuIds(prev =>
            prev.includes(menuId)
                ? prev.filter(id => id !== menuId)
                : [...prev, menuId]
        );
    };

    const handleFileUpload = async (file: File) => {
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            alert("El archivo es demasiado grande (Máx 2MB)");
            return;
        }
        if (!file.type.startsWith('image/')) {
            alert("Solo se permiten imágenes");
            return;
        }

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
            const filePath = `categories/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath);

            setImageUrl(publicUrl);
        } catch (error: any) {
            console.error('Error uploading image:', error);
            alert("Error al subir imagen");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!nameEs.trim()) {
            alert("El nombre es obligatorio");
            return;
        }
        setSaving(true);
        await onSave({
            name_es: nameEs,
            description_es: description,
            icon: selectedIcon || null,
            image_url: imageUrl,
            menu_ids: selectedMenuIds,
        });
        setSaving(false);
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    }, []);

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
                className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-900">
                        {category ? 'Editar Categoría' : 'Nueva Categoría'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Left Column: Form */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre</label>
                                <input
                                    type="text"
                                    list="category-suggestions"
                                    value={nameEs}
                                    onChange={(e) => {
                                        setNameEs(e.target.value);
                                        const preset = CATEGORY_PRESETS.find(p => p.name === e.target.value);
                                        if (preset) {
                                            setSelectedIcon(preset.icon);
                                            if (!description) setDescription(preset.description);
                                        }
                                    }}
                                    placeholder="Ej: Entrantes"
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 font-medium"
                                    autoFocus
                                />
                                <datalist id="category-suggestions">
                                    {CATEGORY_PRESETS.map((preset) => (
                                        <option key={preset.name} value={preset.name} />
                                    ))}
                                </datalist>
                            </div>

                            {/* Menu Assignment */}
                            {menus.length > 0 && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                        Asignar a Cartas
                                    </label>
                                    <div className="space-y-2">
                                        {menus.map((menu) => (
                                            <button
                                                key={menu.id}
                                                onClick={() => toggleMenu(menu.id)}
                                                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg border-2 transition-all text-left ${selectedMenuIds.includes(menu.id)
                                                        ? 'border-primary bg-primary/5'
                                                        : 'border-slate-100 hover:border-slate-200'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${selectedMenuIds.includes(menu.id)
                                                        ? 'bg-primary border-primary'
                                                        : 'border-slate-300'
                                                    }`}>
                                                    {selectedMenuIds.includes(menu.id) && (
                                                        <Check size={12} className="text-white" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-sm font-medium text-slate-800">{menu.name}</span>
                                                </div>
                                                {!menu.is_active && (
                                                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-bold uppercase">
                                                        Inactiva
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1.5">
                                        {selectedMenuIds.length === 0
                                            ? 'Sin carta asignada — la categoría se mostrará en todas'
                                            : `${selectedMenuIds.length} carta${selectedMenuIds.length !== 1 ? 's' : ''} seleccionada${selectedMenuIds.length !== 1 ? 's' : ''}`
                                        }
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Icono</label>
                                <div className="grid grid-cols-6 gap-2 p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                                    {Object.keys(IconMap).map((iconKey) => {
                                        const Icon = IconMap[iconKey];
                                        return (
                                            <button
                                                key={iconKey}
                                                onClick={() => setSelectedIcon(selectedIcon === iconKey ? '' : iconKey)}
                                                className={`aspect-square flex items-center justify-center rounded-md transition-all ${selectedIcon === iconKey
                                                    ? 'bg-slate-900 text-white shadow-md scale-105'
                                                    : 'hover:bg-white hover:shadow-sm text-slate-500'
                                                    }`}
                                                title={iconKey}
                                            >
                                                <Icon size={18} />
                                            </button>
                                        );
                                    })}
                                </div>
                                {!selectedIcon && (
                                    <p className="text-[11px] text-slate-400 mt-1.5">Sin icono seleccionado — puedes dejarlo vacío</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Descripción (Opcional)</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none focus:outline-none focus:border-slate-900"
                                    rows={2}
                                />
                            </div>
                        </div>

                        {/* Right Column: Image & Preview */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Imagen de Categoría</label>
                                <div
                                    className={`relative h-40 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-all ${dragActive ? 'border-primary bg-primary/5' : 'border-slate-200 hover:border-slate-300 bg-slate-50'}`}
                                    onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                                    onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                                    onDragOver={(e) => { e.preventDefault(); }}
                                    onDrop={onDrop}
                                >
                                    {uploading ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <Loader2 size={24} className="animate-spin text-primary" />
                                            <span className="text-xs text-slate-500">Subiendo...</span>
                                        </div>
                                    ) : imageUrl ? (
                                        <div className="relative w-full h-full group">
                                            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded-lg p-1" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
                                                <button onClick={() => setImageUrl('')} className="p-2 bg-white/90 rounded-full hover:bg-white text-red-500">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <UploadCloud size={32} className="text-slate-300 mb-2" />
                                            <label className="text-xs font-bold text-primary hover:text-primary/80 cursor-pointer px-3 py-1.5 bg-white border border-slate-200 rounded-md shadow-sm">
                                                Seleccionar
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])} />
                                            </label>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Vista Previa</label>
                                <div className="p-4 border border-slate-200 rounded-xl bg-white shadow-sm flex items-center gap-4 opacity-80 pointer-events-none select-none grayscale-[0.2]">
                                    <div className="w-12 h-12 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                                        {IconComponent ? <IconComponent size={24} /> : <span className="text-lg font-bold">{(nameEs || 'C').charAt(0).toUpperCase()}</span>}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-900">{nameEs || 'Nombre de categoría'}</h3>
                                        <p className="text-xs text-slate-500">0 productos</p>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-300" />
                                </div>
                            </div>

                            {/* Selected menus summary */}
                            {selectedMenuIds.length > 0 && (
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Aparecerá en</label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedMenuIds.map(id => {
                                            const menu = menus.find(m => m.id === id);
                                            return menu ? (
                                                <span key={id} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-lg flex items-center gap-1.5">
                                                    <BookOpen size={12} />
                                                    {menu.name}
                                                </span>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || uploading}
                        className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-sm shadow-lg shadow-slate-900/20 disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        Guardar
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
