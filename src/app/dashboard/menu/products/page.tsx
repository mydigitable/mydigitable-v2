"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import {
    Plus,
    Search,
    Filter,
    Edit3,
    Trash2,
    Eye,
    EyeOff,
    Check,
    X,
    Loader2,
    Image as ImageIcon,
    Euro,
    Leaf,
    AlertTriangle,
    Star,
    ChevronDown,
    Grid3X3,
    List,
    Copy,
    MoreVertical,
    Smartphone
} from "lucide-react";
import Link from "next/link";
import { ProductModal } from "@/components/dashboard/ProductModal";
import { useMenu } from "@/contexts/MenuContext";

// --- INTERFACES ---
// (We should nominally import these, but keeping inline for stability as per previous pattern)
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
    sort_order: number;
    category?: {
        name_es: string;
        icon: string;
    };
}

interface Category {
    id: string;
    name_es: string;
    icon: string;
}

export default function ProductsPage() {
    // --- CONTEXT ---
    const { categories, restaurant, loading, refreshMenu, showPreview, setShowPreview } = useMenu();

    const searchParams = useSearchParams();
    const categoryFilter = searchParams.get('category');

    // --- STATE ---
    // We derive products from context to ensure sidebar remains in sync!
    const products = categories.flatMap(c =>
        (c.products || []).map(p => ({ ...p, category: { name_es: c.name_es, icon: c.icon } }))
    );

    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFilter);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const supabase = createClient();

    useEffect(() => {
        setSelectedCategory(categoryFilter);
    }, [categoryFilter]);

    // --- HANDLERS ---

    const handleSaveProduct = async (data: Partial<Product>) => {
        if (!restaurant) return;

        setSaving(true);
        try {
            console.log("Saving product...", data);
            let error;

            if (editingProduct) {
                const { error: updateError } = await supabase
                    .from("products")
                    .update({
                        ...data,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", editingProduct.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("products")
                    .insert({
                        restaurant_id: restaurant.id,
                        ...data,
                        sort_order: products.length,
                        is_available: true,
                    });
                error = insertError;
            }

            if (error) {
                console.error("Supabase Error:", error);
                throw error;
            }

            console.log("Product saved successfully. Refreshing menu...");
            await refreshMenu(); // Updates Context -> Updates Sidebar & List
            setShowAddModal(false);
            setEditingProduct(null);
        } catch (err: any) {
            console.error("Error saving product:", err);
            alert(`Error al guardar: ${err.message || 'Error desconocido'}`);
        } finally {
            setSaving(false);
        }
    };

    const toggleProductAvailable = async (productId: string, isAvailable: boolean) => {
        const { error } = await supabase
            .from("products")
            .update({ is_available: isAvailable })
            .eq("id", productId);

        if (error) {
            console.error("Error toggling availability:", error);
            alert("Error al actualizar estado");
            return;
        }
        refreshMenu();
    };

    const toggleProductFeatured = async (productId: string, isFeatured: boolean) => {
        const { error } = await supabase
            .from("products")
            .update({ is_featured: isFeatured })
            .eq("id", productId);

        if (error) {
            console.error("Error toggling featured:", error);
            alert("Error al actualizar destacado");
            return;
        }
        refreshMenu();
    };

    const duplicateProduct = async (product: Product) => {
        const { error } = await supabase.from("products").insert({
            restaurant_id: restaurant.id,
            category_id: product.category_id,
            name_es: `${product.name_es} (copia)`,
            name_en: product.name_en,
            description_es: product.description_es,
            price: product.price,
            // compare_price: product.compare_price, // Removed: Column missing in DB
            image_url: product.image_url,
            is_vegetarian: product.is_vegetarian,
            is_vegan: product.is_vegan,
            is_gluten_free: product.is_gluten_free,
            allergens: product.allergens,
            sort_order: products.length,
            is_available: false,
        });

        if (error) {
            console.error("Error duplicating:", error);
            alert(`Error al duplicar: ${error.message}`);
            return;
        }
        refreshMenu();
    };

    const deleteProduct = async (productId: string) => {
        if (!confirm('¿Eliminar este producto?')) return;
        const { error } = await supabase.from("products").delete().eq("id", productId);

        if (error) {
            console.error("Error deleting:", error);
            alert(`Error al eliminar: ${error.message}`);
            return;
        }
        refreshMenu();
    };

    // --- RENDER ---

    const filteredProducts = products.filter(product => {
        // @ts-ignore
        if (selectedCategory && product.category_id !== selectedCategory) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                product.name_es.toLowerCase().includes(query) ||
                product.description_es?.toLowerCase().includes(query)
            );
        }
        return true;
    });

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
                    <h1 className="text-2xl font-black text-slate-900">Productos</h1>
                    <p className="text-sm text-slate-500">
                        {products.length} productos en tu menú
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* TOGGLE PREVIEW BUTTON */}
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border ${showPreview ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                    >
                        {showPreview ? <Eye size={16} /> : <Smartphone size={16} />}
                        {showPreview ? 'Ocultar Vista' : 'Ver Vista Previa'}
                    </button>

                    <button
                        onClick={() => {
                            setEditingProduct(null);
                            setShowAddModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-primary/20"
                    >
                        <Plus size={18} />
                        Nuevo Producto
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                        <select
                            value={selectedCategory || ''}
                            onChange={(e) => setSelectedCategory(e.target.value || null)}
                            className="appearance-none px-4 py-3 pr-10 bg-slate-50 border-0 rounded-xl text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[180px]"
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {/* @ts-ignore */}
                                    {cat.icon} {cat.name_es}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-slate-100 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-50'
                                }`}
                        >
                            <Grid3X3 size={18} className={viewMode === 'grid' ? 'text-primary' : 'text-slate-400'} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-50'
                                }`}
                        >
                            <List size={18} className={viewMode === 'list' ? 'text-primary' : 'text-slate-400'} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Products */}
            {products.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <ImageIcon size={28} className="text-slate-300" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Sin productos</h2>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        Añade productos a tu menú para que los clientes puedan verlos y pedirlos.
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors"
                    >
                        <Plus size={18} />
                        Añadir Primer Producto
                    </button>
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <p className="text-slate-500">No se encontraron productos con estos filtros</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            // @ts-ignore
                            product={product}
                            onEdit={() => {
                                // @ts-ignore
                                setEditingProduct(product);
                                setShowAddModal(true);
                            }}
                            onToggleAvailable={() => toggleProductAvailable(product.id, !product.is_available)}
                            onToggleFeatured={() => toggleProductFeatured(product.id, !product.is_featured)}
                            // @ts-ignore
                            onDuplicate={() => duplicateProduct(product)}
                            onDelete={() => deleteProduct(product.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Producto</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Categoría</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Precio</th>
                                <th className="text-center px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredProducts.map((product) => (
                                <tr key={product.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name_es}
                                                    className="w-12 h-12 rounded-xl object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                                    <ImageIcon size={18} className="text-slate-300" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-slate-900">{product.name_es}</p>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    {product.is_vegetarian && <span title="Vegetariano">🥬</span>}
                                                    {product.is_vegan && <span title="Vegano">🌱</span>}
                                                    {product.is_gluten_free && <span title="Sin gluten">🌾</span>}
                                                    {product.is_featured && <Star size={12} className="text-amber-400 fill-amber-400" />}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600">
                                            {// @ts-ignore
                                                product.category?.icon} {// @ts-ignore
                                                product.category?.name_es}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-slate-900">€{product.price.toFixed(2)}</span>
                                        {product.compare_price && (
                                            <span className="text-xs text-slate-400 line-through ml-2">
                                                €{product.compare_price.toFixed(2)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => toggleProductAvailable(product.id, !product.is_available)}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${product.is_available
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-slate-100 text-slate-500'
                                                }`}
                                        >
                                            {product.is_available ? (
                                                <>
                                                    <Eye size={12} />
                                                    Visible
                                                </>
                                            ) : (
                                                <>
                                                    <EyeOff size={12} />
                                                    Oculto
                                                </>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => {
                                                    // @ts-ignore
                                                    setEditingProduct(product);
                                                    setShowAddModal(true);
                                                }}
                                                className="p-2 hover:bg-slate-100 rounded-lg"
                                                title="Editar"
                                            >
                                                <Edit3 size={16} className="text-slate-400" />
                                            </button>
                                            <button
                                                // @ts-ignore
                                                onClick={() => duplicateProduct(product)}
                                                className="p-2 hover:bg-slate-100 rounded-lg"
                                                title="Duplicar"
                                            >
                                                <Copy size={16} className="text-slate-400" />
                                            </button>
                                            <button
                                                onClick={() => deleteProduct(product.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={16} className="text-red-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <ProductModal
                        product={editingProduct}
                        // @ts-ignore
                        categories={categories}
                        saving={saving}
                        // @ts-ignore
                        onSave={handleSaveProduct}
                        onClose={() => {
                            setShowAddModal(false);
                            setEditingProduct(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Product Card Component
function ProductCard({
    product,
    onEdit,
    onToggleAvailable,
    onToggleFeatured,
    onDuplicate,
    onDelete,
}: {
    product: Product;
    onEdit: () => void;
    onToggleAvailable: () => void;
    onToggleFeatured: () => void;
    onDuplicate: () => void;
    onDelete: () => void;
}) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white rounded-2xl border overflow-hidden transition-all ${!product.is_available ? 'border-slate-200 opacity-60' : 'border-slate-100'
                }`}
        >
            {/* Image */}
            <div className="relative aspect-[4/3] bg-slate-100">
                {product.image_url ? (
                    <img
                        src={product.image_url}
                        alt={product.name_es}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon size={32} className="text-slate-300" />
                    </div>
                )}

                {/* Featured badge */}
                {product.is_featured && (
                    <span className="absolute top-2 left-2 px-2 py-1 bg-amber-400 text-white text-[10px] font-bold rounded-full flex items-center gap-1">
                        <Star size={10} className="fill-white" />
                        Destacado
                    </span>
                )}

                {/* Menu */}
                <div className="absolute top-2 right-2">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1.5 bg-white/90 hover:bg-white rounded-lg shadow-sm"
                    >
                        <MoreVertical size={16} className="text-slate-600" />
                    </button>

                    {showMenu && (
                        <>
                            <div
                                className="fixed inset-0 z-10"
                                onClick={() => setShowMenu(false)}
                            />
                            <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-slate-100 py-1 min-w-[140px] z-20">
                                <button
                                    onClick={() => { onEdit(); setShowMenu(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50"
                                >
                                    <Edit3 size={14} />
                                    Editar
                                </button>
                                <button
                                    onClick={() => { onToggleFeatured(); setShowMenu(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50"
                                >
                                    <Star size={14} />
                                    {product.is_featured ? 'Quitar destacado' : 'Destacar'}
                                </button>
                                <button
                                    onClick={() => { onDuplicate(); setShowMenu(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50"
                                >
                                    <Copy size={14} />
                                    Duplicar
                                </button>
                                <button
                                    onClick={() => { onDelete(); setShowMenu(false); }}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                                >
                                    <Trash2 size={14} />
                                    Eliminar
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex items-center gap-1 mb-1 text-xs text-slate-500">
                    <span>{product.category?.icon}</span>
                    <span>{product.category?.name_es}</span>
                </div>

                <h3 className="font-bold text-slate-900 line-clamp-1">{product.name_es}</h3>

                {product.description_es && (
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{product.description_es}</p>
                )}

                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-baseline gap-2">
                        <span className="font-black text-lg text-primary">€{product.price.toFixed(2)}</span>
                        {product.compare_price && (
                            <span className="text-sm text-slate-400 line-through">
                                €{product.compare_price.toFixed(2)}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1">
                        {product.is_vegetarian && <span title="Vegetariano">🥬</span>}
                        {product.is_vegan && <span title="Vegano">🌱</span>}
                        {product.is_gluten_free && <span title="Sin gluten" className="text-xs">🚫🌾</span>}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 bg-slate-50 flex items-center justify-between">
                <button
                    onClick={onToggleAvailable}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${product.is_available ? 'text-green-600' : 'text-slate-400'
                        }`}
                >
                    {product.is_available ? <Eye size={14} /> : <EyeOff size={14} />}
                    {product.is_available ? 'Disponible' : 'Oculto'}
                </button>

                <button
                    onClick={onEdit}
                    className="text-xs font-bold text-primary hover:underline"
                >
                    Editar
                </button>
            </div>
        </motion.div>
    );
}
