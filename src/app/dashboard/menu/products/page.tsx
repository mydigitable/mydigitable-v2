"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import {
    Plus,
    Search,
    Edit3,
    Trash2,
    Eye,
    EyeOff,
    Loader2,
    Image as ImageIcon,
    Star,
    ChevronDown,
    Grid3X3,
    List,
    Copy,
    MoreVertical,
    Package,
    Tag
} from "lucide-react";
import { CreateProductModalPro } from "@/app/dashboard/menu/components/CreateProductModalPro";
import { CategoryModal } from "@/components/dashboard/CategoryModal";
import {
    toggleProductAvailable,
    toggleProductVisible,
    duplicateProduct as duplicateProductAction,
    deleteProduct as deleteProductAction,
    createCategory,
} from "@/app/actions/menu";
import { useMenu } from "@/contexts/MenuContext";
import { extractName } from "@/lib/utils";

// --- INTERFACES ---
interface Product {
    id: string;
    category_id: string;
    restaurant_id: string;
    name: string;
    name_en: string | null;
    description: string | null;
    price: number;
    image_url: string | null;
    allergens: string[] | null;
    dietary_tags: string[] | null;
    is_available: boolean;
    is_featured: boolean;
    sort_order: number;
    category_name?: string;
}

interface Category {
    id: string;
    name: string;
    icon: string;
}

interface MenuInfo {
    id: string;
    name: string;
    is_active: boolean;
}

// (extractName imported from @/lib/utils)

export default function ProductsPage() {
    // --- STATE ---
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const [showProModal, setShowProModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const searchParams = useSearchParams();
    const categoryFilter = searchParams.get('category');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFilter);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [menus, setMenus] = useState<MenuInfo[]>([]);

    const supabase = createClient();
    const { refreshMenu } = useMenu();

    useEffect(() => {
        setSelectedCategory(categoryFilter);
    }, [categoryFilter]);

    // --- DATA LOADING (read-only) ---
    const loadData = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: restaurantData } = await supabase
                .from("restaurants")
                .select("*")
                .eq("owner_id", user.id)
                .limit(1);

            const rest = restaurantData?.[0];
            if (!rest) return;

            // Load ALL products directly
            const { data: productsData, error: prodError } = await supabase
                .from("products")
                .select("*")
                .eq("restaurant_id", rest.id)
                .order("sort_order");

            if (prodError) console.error("Error loading products:", prodError);

            // Load categories for filter dropdown and category names
            const { data: categoriesData, error: catError } = await supabase
                .from("menu_categories")
                .select("id, name, icon, is_visible")
                .eq("restaurant_id", rest.id)
                .order("sort_order");

            if (catError) console.error("Error loading categories:", catError);

            const mappedCategories: Category[] = (categoriesData || []).map((cat: Record<string, unknown>) => ({
                id: cat.id as string,
                name: extractName(cat.name as string | Record<string, string>),
                icon: (cat.icon as string) || '',
            }));
            setCategories(mappedCategories);

            // Load menus for category modal
            const { data: menusData } = await supabase
                .from("menus")
                .select("id, name, is_active")
                .eq("restaurant_id", rest.id)
                .order("display_order");
            setMenus((menusData || []) as MenuInfo[]);

            // Build category name map
            const catMap: Record<string, string> = {};
            mappedCategories.forEach(c => { catMap[c.id] = c.name; });

            // Map products with category name
            const mappedProducts: Product[] = (productsData || []).map((p: Record<string, unknown>) => ({
                ...p,
                name: extractName(p.name as string | Record<string, string>),
                description: extractName(p.description as string | Record<string, string>),
                is_featured: false,
                sort_order: (p.display_order as number) || (p.sort_order as number) || 0,
                category_name: catMap[p.category_id as string] || 'Sin categoría',
            })) as Product[];

            setProducts(mappedProducts);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // --- HANDLERS (using server actions) ---
    const handleToggleAvailable = async (productId: string) => {
        // Optimistic update
        setProducts(prev => prev.map(p =>
            p.id === productId ? { ...p, is_available: !p.is_available } : p
        ));

        const result = await toggleProductAvailable(productId);
        if (!result.success) {
            // Revert on failure
            setProducts(prev => prev.map(p =>
                p.id === productId ? { ...p, is_available: !p.is_available } : p
            ));
            alert("Error al actualizar estado");
        }
        refreshMenu();
    };

    const handleToggleFeatured = async (productId: string) => {
        setProducts(prev => prev.map(p =>
            p.id === productId ? { ...p, is_featured: !p.is_featured } : p
        ));

        const result = await toggleProductVisible(productId);
        if (!result.success) {
            setProducts(prev => prev.map(p =>
                p.id === productId ? { ...p, is_featured: !p.is_featured } : p
            ));
            alert("Error al actualizar destacado");
        }
        refreshMenu();
    };

    const handleDuplicate = async (productId: string) => {
        const result = await duplicateProductAction(productId);
        if (!result.success) {
            alert(`Error al duplicar: ${result.error}`);
            return;
        }
        await loadData();
        refreshMenu();
    };

    const handleDelete = async (productId: string) => {
        if (!confirm('¿Eliminar este producto permanentemente?')) return;

        // Optimistic removal
        setProducts(prev => prev.filter(p => p.id !== productId));

        const result = await deleteProductAction(productId);
        if (!result.success) {
            alert(`Error al eliminar: ${result.error}`);
            await loadData();
        }
        refreshMenu();
    };

    // --- FILTERING ---
    const filteredProducts = products.filter(product => {
        if (selectedCategory && product.category_id !== selectedCategory) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (
                product.name.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query) ||
                product.category_name?.toLowerCase().includes(query)
            );
        }
        return true;
    });

    // --- CATEGORY CREATION HANDLER ---
    const handleSaveCategory = async (data: { name?: string | Record<string, string>; description?: string | Record<string, string> | null; menu_ids?: string[] }) => {
        try {
            const menuIds = data.menu_ids || [];
            if (menuIds.length === 0) {
                const result = await createCategory({
                    menu_id: null,
                    name: extractName(data.name) || '',
                    description: extractName(data.description) || undefined,
                    is_visible: true,
                });
                if (!result.success) {
                    alert(`Error: ${result.error}`);
                    return;
                }
            } else {
                for (const menuId of menuIds) {
                    const result = await createCategory({
                        menu_id: menuId,
                        name: extractName(data.name) || '',
                        description: extractName(data.description) || undefined,
                        is_visible: true,
                    });
                    if (!result.success) {
                        alert(`Error: ${result.error}`);
                        return;
                    }
                }
            }
            await loadData();
            refreshMenu();
            setShowCategoryModal(false);
        } catch (err) {
            console.error('Error saving category:', err);
            alert('Error al guardar la categoría');
        }
    };

    // --- STATS ---
    const totalProducts = products.length;
    const availableProducts = products.filter(p => p.is_available).length;
    const featuredProducts = products.filter(p => p.is_featured).length;

    // --- RENDER ---
    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-[1400px] mx-auto">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                        <Package size={28} className="text-primary" />
                        Todos los Productos
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Gestiona todos los productos de tu restaurante en un solo lugar
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowCategoryModal(true)}
                        className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-slate-300 bg-white text-slate-700 rounded-xl font-medium text-sm transition-colors"
                    >
                        <Tag size={16} />
                        + Categoría
                    </button>
                    <button
                        onClick={() => setShowProModal(true)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-500/25"
                    >
                        <Plus size={18} />
                        ✨ Nuevo Producto
                    </button>
                </div>
            </div>

            {/* Stats Strip */}
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                        <Package size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-slate-900">{totalProducts}</p>
                        <p className="text-xs text-slate-500">Total productos</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                        <Eye size={20} className="text-green-600" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-slate-900">{availableProducts}</p>
                        <p className="text-xs text-slate-500">Disponibles</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                        <Star size={20} className="text-amber-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-slate-900">{featuredProducts}</p>
                        <p className="text-xs text-slate-500">Destacados</p>
                    </div>
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
                            placeholder="Buscar por nombre, descripción o categoría..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 bg-slate-50 border-0 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        />
                    </div>

                    {/* Category Filter */}
                    <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select
                            value={selectedCategory || ''}
                            onChange={(e) => setSelectedCategory(e.target.value || null)}
                            className="appearance-none pl-9 pr-10 py-3 bg-slate-50 border-0 rounded-xl text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20 min-w-[200px]"
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* View Toggle */}
                    <div className="flex bg-slate-100 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-50'}`}
                        >
                            <Grid3X3 size={18} className={viewMode === 'grid' ? 'text-primary' : 'text-slate-400'} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-50'}`}
                        >
                            <List size={18} className={viewMode === 'list' ? 'text-primary' : 'text-slate-400'} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Results count */}
            {searchQuery || selectedCategory ? (
                <p className="text-sm text-slate-500 mb-4">
                    {filteredProducts.length} de {totalProducts} productos
                    {selectedCategory && (
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className="ml-2 text-primary font-medium hover:underline"
                        >
                            Limpiar filtro
                        </button>
                    )}
                </p>
            ) : null}

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
                        onClick={() => setShowProModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors"
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
                            product={product}
                            onEdit={() => {
                                setEditingProduct(product);
                                setShowProModal(true);
                            }}
                            onToggleAvailable={() => handleToggleAvailable(product.id)}
                            onToggleFeatured={() => handleToggleFeatured(product.id)}
                            onDuplicate={() => handleDuplicate(product.id)}
                            onDelete={() => handleDelete(product.id)}
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
                                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {product.image_url ? (
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="w-12 h-12 rounded-xl object-cover"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                                                    <ImageIcon size={18} className="text-slate-300" />
                                                </div>
                                            )}
                                            <div>
                                                <p className="font-bold text-slate-900">{product.name}</p>
                                                <div className="flex items-center gap-1 mt-0.5">
                                                    {product.dietary_tags?.includes('vegetarian') && <span title="Vegetariano">🥬</span>}
                                                    {product.dietary_tags?.includes('vegan') && <span title="Vegano">🌱</span>}
                                                    {product.dietary_tags?.includes('gluten_free') && <span title="Sin gluten">🌾</span>}
                                                    {product.is_featured && <Star size={12} className="text-amber-400 fill-amber-400" />}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-slate-600 px-2 py-1 bg-slate-50 rounded-lg">
                                            {product.category_name}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-slate-900">€{product.price?.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleToggleAvailable(product.id)}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${product.is_available
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-slate-100 text-slate-500'
                                                }`}
                                        >
                                            {product.is_available ? (
                                                <><Eye size={12} /> Visible</>
                                            ) : (
                                                <><EyeOff size={12} /> Oculto</>
                                            )}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button
                                                onClick={() => {
                                                    setEditingProduct(product);
                                                    setShowProModal(true);
                                                }}
                                                className="p-2 hover:bg-slate-100 rounded-lg"
                                                title="Editar"
                                            >
                                                <Edit3 size={16} className="text-slate-400" />
                                            </button>
                                            <button
                                                onClick={() => handleDuplicate(product.id)}
                                                className="p-2 hover:bg-slate-100 rounded-lg"
                                                title="Duplicar"
                                            >
                                                <Copy size={16} className="text-slate-400" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(product.id)}
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

            {/* Unified Create/Edit Modal */}
            {showProModal && (
                <CreateProductModalPro
                    categoryId={selectedCategory || categories[0]?.id || ''}
                    categoryName={selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : categories[0]?.name}
                    categories={categories}
                    allProducts={products}
                    product={editingProduct}
                    onClose={() => {
                        setShowProModal(false);
                        setEditingProduct(null);
                    }}
                    onSuccess={() => {
                        setShowProModal(false);
                        setEditingProduct(null);
                        loadData();
                        refreshMenu();
                    }}
                />
            )}
            {showCategoryModal && (
                <CategoryModal
                    category={null}
                    menus={menus}
                    onSave={handleSaveCategory}
                    onClose={() => setShowCategoryModal(false)}
                />
            )}
        </div>
    );
}

// ============================================
// Product Card Component
// ============================================
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
                        alt={product.name}
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
                <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[11px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-medium">{product.category_name}</span>
                </div>

                <h3 className="font-bold text-slate-900 line-clamp-1">{product.name}</h3>

                {product.description && (
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">{product.description}</p>
                )}

                <div className="flex items-center justify-between mt-3">
                    <div className="flex items-baseline gap-2">
                        <span className="font-black text-lg text-primary">€{product.price?.toFixed(2)}</span>
                    </div>

                    <div className="flex items-center gap-1">
                        {product.dietary_tags?.includes('vegetarian') && <span title="Vegetariano">🥬</span>}
                        {product.dietary_tags?.includes('vegan') && <span title="Vegano">🌱</span>}
                        {product.dietary_tags?.includes('gluten_free') && <span title="Sin gluten" className="text-xs">🚫🌾</span>}
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
