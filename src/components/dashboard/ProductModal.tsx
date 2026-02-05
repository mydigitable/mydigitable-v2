"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Loader2, Image as ImageIcon, Info, Tag, Clock, Save, AlertCircle, Utensils, Euro, FileText, Sparkles, XCircle, Leaf, Wheat, Milk, Nut, Fish, Egg, Grape } from "lucide-react";
import { ImageUploader } from "@/components/dashboard/ImageUploader";

interface Product {
    id: string;
    category_id: string;
    restaurant_id: string;
    name_es: string;
    name_en: string | null;
    description_es: string | null;
    price: number;
    compare_price: number | null;
    image_url: string | null;
    is_vegetarian: boolean;
    is_vegan: boolean;
    is_gluten_free: boolean;
    allergens: string[] | null;
    is_available: boolean;
    is_featured: boolean;
}

interface Category {
    id: string;
    name_es: string;
    icon: string;
}

// Professional Icons for Allergens
const allergensList = [
    { id: 'gluten', label: 'Gluten', icon: Wheat },
    { id: 'lactose', label: 'Lácteos', icon: Milk },
    { id: 'eggs', label: 'Huevos', icon: Egg },
    { id: 'fish', label: 'Pescado', icon: Fish },
    { id: 'shellfish', label: 'Mariscos', icon: Fish }, // Reusing Fish for now or Crab if available
    { id: 'peanuts', label: 'Cacahuetes', icon: Nut },
    { id: 'nuts', label: 'Frutos secos', icon: Nut },
    { id: 'soy', label: 'Soja', icon: Leaf }, // Plant based
    { id: 'sulphites', label: 'Sulfitos', icon: Grape }, // Wine/Grapes often source
];

const TABS = [
    { id: 'basic', label: 'Básico', icon: FileText },
    { id: 'details', label: 'Detalles', icon: Tag },
    { id: 'availability', label: 'Disponibilidad', icon: Clock },
];

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
    onSave: (data: Partial<Product>) => void;
    onClose: () => void;
}) {
    const [activeTab, setActiveTab] = useState('basic');

    // Form State
    const [nameEs, setNameEs] = useState(product?.name_es || '');
    const [nameEn, setNameEn] = useState(product?.name_en || '');
    const [description, setDescription] = useState(product?.description_es || '');
    const [price, setPrice] = useState(product?.price?.toString() || '');
    const [comparePrice, setComparePrice] = useState(product?.compare_price?.toString() || '');
    const [categoryId, setCategoryId] = useState(product?.category_id || '');
    const [imageUrl, setImageUrl] = useState(product?.image_url || '');
    const [isVegetarian, setIsVegetarian] = useState(product?.is_vegetarian || false);
    const [isVegan, setIsVegan] = useState(product?.is_vegan || false);
    const [isGlutenFree, setIsGlutenFree] = useState(product?.is_gluten_free || false);
    const [allergens, setAllergens] = useState<string[]>(product?.allergens || []);
    const [isAvailable, setIsAvailable] = useState(product?.is_available ?? true);
    const [isFeatured, setIsFeatured] = useState(product?.is_featured || false);

    // UI State
    const [showProTip, setShowProTip] = useState(true);
    const [isGeneratingAI, setIsGeneratingAI] = useState(false);

    // Initialize category if creating new product and only one category exists or passed
    useEffect(() => {
        if (!product && !categoryId && categories.length > 0) {
            // Optional: default to first category? No, user should choose or it should be pre-filled by parent.
        }
    }, [product, categoryId, categories]);

    const toggleAllergen = (id: string) => {
        setAllergens(prev =>
            prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
        );
    };

    const handleSave = () => {
        if (!nameEs || !price || !categoryId) {
            alert('Por favor completa los campos obligatorios: Nombre, Precio y Categoría');
            return;
        }

        onSave({
            name_es: nameEs,
            name_en: nameEn || null,
            description_es: description || null,
            price: parseFloat(price),
            compare_price: comparePrice ? parseFloat(comparePrice) : null,
            category_id: categoryId,
            image_url: imageUrl || null,
            is_vegetarian: isVegetarian,
            is_vegan: isVegan,
            is_gluten_free: isGlutenFree,
            allergens: allergens,
            is_available: isAvailable,
            is_featured: isFeatured
        });
    };

    const handleGenerateDescription = async () => {
        if (!nameEs) {
            alert("Escribe el nombre del producto primero");
            return;
        }
        setIsGeneratingAI(true);
        // Simulate AI delay
        setTimeout(() => {
            setDescription(`Disfruta de nuestro delicioso ${nameEs}, preparado con los ingredientes más frescos. Una experiencia de sabor única que combina texturas y aromas para deleitar tu paladar.`);
            setIsGeneratingAI(false);
        }, 1500);
    };

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
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {product ? 'Actualiza los detalles del plato' : 'Añade un nuevo plato a tu menú'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    {/* Sidebar Tabs (Desktop) */}
                    <div className="w-full md:w-56 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-100 p-2 md:p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible flex-shrink-0">
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
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 bg-white">

                        {/* TAB: BASIC (merged with Image) */}
                        {activeTab === 'basic' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left: Basic Info */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Categoría *</label>
                                            <select
                                                value={categoryId}
                                                onChange={(e) => setCategoryId(e.target.value)}
                                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 bg-white font-medium"
                                            >
                                                <option value="">Seleccionar categoría</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>
                                                        {cat.name_es}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Nombre del Producto *</label>
                                                <input
                                                    type="text"
                                                    value={nameEs}
                                                    onChange={(e) => setNameEs(e.target.value)}
                                                    onBlur={() => {
                                                        if (nameEs && !description) handleGenerateDescription();
                                                    }}
                                                    placeholder="Ej: Hamburguesa Suprema"
                                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-bold"
                                                />
                                                <p className="text-[10px] text-slate-400 mt-1 text-right">El idioma principal de tu menú</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Precio *</label>
                                                <div className="relative">
                                                    <Euro size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                    <input
                                                        type="number"
                                                        step="0.01"
                                                        min="0"
                                                        value={price}
                                                        onChange={(e) => setPrice(e.target.value)}
                                                        placeholder="0.00"
                                                        className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-bold text-slate-900"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Image & Description */}
                                    <div className="space-y-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Fotografía</label>
                                            <ImageUploader
                                                value={imageUrl}
                                                onChange={(url) => setImageUrl(url || '')}
                                                folder="products"
                                                label="Foto del plato"
                                            />

                                            {showProTip && !imageUrl && (
                                                <div className="mt-3 bg-blue-50 p-3 rounded-xl flex items-start gap-3 relative group border border-blue-100">
                                                    <Info className="text-blue-500 flex-shrink-0 mt-0.5" size={16} />
                                                    <div className="pr-4">
                                                        <h4 className="font-bold text-blue-900 text-xs">Consejo Profesional</h4>
                                                        <p className="text-[10px] text-blue-700 mt-0.5 leading-relaxed">
                                                            Los platos con fotos de calidad venden un <strong>30% más</strong>.
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => setShowProTip(false)}
                                                        className="absolute top-2 right-2 p-1 text-blue-400 hover:bg-blue-100 rounded-full"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Description with AI */}
                                <div className="pt-2 border-t border-slate-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="block text-xs font-bold text-slate-500 uppercase">Descripción</label>
                                        <button
                                            onClick={handleGenerateDescription}
                                            disabled={isGeneratingAI}
                                            className="flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-lg transition-all border border-transparent hover:border-purple-100"
                                            title="Generar descripción automática con IA"
                                        >
                                            {isGeneratingAI ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                            {isGeneratingAI ? 'Generando...' : 'Generar con IA'}
                                        </button>
                                    </div>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Describe los ingredientes, la preparación y lo que hace especial a este plato..."
                                        rows={4}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1">
                                        Tip: Puedes editar el texto generado por la IA a tu gusto.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* TAB: DETAILS */}
                        {activeTab === 'details' && (
                            <div className="space-y-8 animate-in fade-in duration-300">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Dietas y Etiquetas</label>
                                    <div className="flex flex-wrap gap-3">
                                        <LabelToggle
                                            active={isVegetarian}
                                            onChange={setIsVegetarian}
                                            label="Vegetariano" icon={<Leaf size={16} />}
                                        />
                                        <LabelToggle
                                            active={isVegan}
                                            onChange={setIsVegan}
                                            label="Vegano" icon={<Leaf size={16} className="fill-current" />}
                                        />
                                        <LabelToggle
                                            active={isGlutenFree}
                                            onChange={setIsGlutenFree}
                                            label="Sin Gluten" icon={<Wheat size={16} className="text-amber-500" />}
                                        />
                                        <LabelToggle
                                            active={isFeatured}
                                            onChange={setIsFeatured}
                                            label="Destacado" icon={<Sparkles size={16} className="text-amber-400 fill-amber-400" />}
                                            activeClass="bg-amber-100 text-amber-700 border-amber-200"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Alérgenos</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {allergensList.map((allergen) => (
                                            <button
                                                key={allergen.id}
                                                onClick={() => toggleAllergen(allergen.id)}
                                                className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left group ${allergens.includes(allergen.id)
                                                    ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'
                                                    : 'bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary'
                                                    }`}
                                            >
                                                <div className={`p-2 rounded-lg ${allergens.includes(allergen.id) ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                                    <allergen.icon size={18} />
                                                </div>
                                                <span className="text-sm font-bold">{allergen.label}</span>
                                                {allergens.includes(allergen.id) && <Check size={14} className="ml-auto text-rose-500" />}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TAB: AVAILABILITY */}
                        {activeTab === 'availability' && (
                            <div className="space-y-6 animate-in fade-in duration-300">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h3 className="font-bold text-slate-900">Estado del Producto</h3>
                                            <p className="text-sm text-slate-500">Controla si los clientes pueden ver y pedir este artículo</p>
                                        </div>
                                        <div className={`
                                            w-12 h-6 rounded-full p-1 transition-colors cursor-pointer
                                            ${isAvailable ? 'bg-green-500' : 'bg-slate-300'}
                                        `} onClick={() => setIsAvailable(!isAvailable)}>
                                            <div className={`
                                                bg-white w-4 h-4 rounded-full shadow-sm transition-transform
                                                ${isAvailable ? 'translate-x-6' : 'translate-x-0'}
                                            `} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-3 bg-white rounded-lg border border-slate-200">
                                        {isAvailable ? <Check size={18} className="text-green-500" /> : <X size={18} className="text-slate-400" />}
                                        <span className={`text-sm font-bold ${isAvailable ? 'text-green-700' : 'text-slate-500'}`}>
                                            {isAvailable ? 'Disponible para la venta' : 'No disponible (Oculto)'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                    <span className="text-xs text-slate-400 hidden sm:inline-block">
                        * Campos obligatorios
                    </span>
                    <div className="flex gap-3 ml-auto">
                        <button
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 hover:text-slate-800 transition-colors text-sm"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            Guardar Producto
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}

function LabelToggle({
    active,
    onChange,
    label,
    icon,
    activeClass = "bg-green-50 text-green-700 border-green-200"
}: any) {
    return (
        <button
            onClick={() => onChange(!active)}
            className={`
                flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-bold transition-all
                ${active ? activeClass : 'bg-white border-slate-200 text-slate-500 hover:border-primary hover:text-primary'}
            `}
        >
            <span>{icon}</span>
            {label}
        </button>
    );
}
