"use client";

import { useState, useEffect } from "react";
import { Reorder, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Plus,
    Loader2,
    Search,
    Smartphone,
    Eye
} from "lucide-react";
import { CategoryAccordion } from "@/components/dashboard/CategoryAccordion";
import { ProductModal } from "@/components/dashboard/ProductModal";
import { CategoryModal } from "@/components/dashboard/CategoryModal";
import { MenuPreview } from "@/components/dashboard/MenuPreview";

// --- INTERFACES ---
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
}

interface Category {
    id: string;
    restaurant_id: string;
    name_es: string;
    name_en: string | null;
    description_es: string | null;
    icon: string;
    image_url: string | null;
    sort_order: number;
    is_active: boolean;
    products?: Product[];
}

export default function CategoriesPage() {
    // --- STATE ---
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    // UI State
    const [showPreview, setShowPreview] = useState(true);

    // Modals
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);

    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [preselectedCategoryId, setPreselectedCategoryId] = useState<string>('');

    const [searchQuery, setSearchQuery] = useState('');
    const [restaurant, setRestaurant] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        loadData();
    }, []);

    // --- DATA LOADING ---
    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: restaurantData } = await supabase
                .from("restaurants")
                .select("*")
                .eq("owner_id", user.id)
                .limit(1);

            const restaurant = restaurantData?.[0];
            if (!restaurant) return;
            setRestaurant(restaurant);

            // Fetch categories with full products data
            const { data: categoriesData } = await supabase
                .from("categories")
                .select(`
                    *,
                    products:products(*)
                `)
                .eq("restaurant_id", restaurant.id)
                .order("sort_order");

            // Sort products within categories
            const sortedCategories = (categoriesData || []).map(cat => ({
                ...cat,
                products: (cat.products || []).sort((a: Product, b: Product) => a.sort_order - b.sort_order)
            }));

            setCategories(sortedCategories);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS: CATEGORIES ---
    const handleReorder = async (newOrder: Category[]) => {
        setCategories(newOrder);
        const updates = newOrder.map((cat, index) => ({ id: cat.id, sort_order: index }));

        for (const update of updates) {
            await supabase.from("categories").update({ sort_order: update.sort_order }).eq("id", update.id);
        }
    };

    const handleSaveCategory = async (data: Partial<Category>) => {
        if (!restaurant) return;

        try {
            if (editingCategory) {
                await supabase
                    .from("categories")
                    .update({ ...data, updated_at: new Date().toISOString() })
                    .eq("id", editingCategory.id);
            } else {
                await supabase
                    .from("categories")
                    .insert({
                        restaurant_id: restaurant.id,
                        ...data,
                        sort_order: categories.length,
                        is_active: true,
                    });
            }
            await loadData();
            setShowCategoryModal(false);
            setEditingCategory(null);
        } catch (err) {
            console.error(err);
        }
    };

    const toggleCategoryActive = async (categoryId: string, isActive: boolean) => {
        setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, is_active: isActive } : c));
        await supabase.from("categories").update({ is_active: isActive }).eq("id", categoryId);
    };

    const deleteCategory = async (categoryId: string) => {
        if (!confirm('¿Eliminar esta categoría? Se ocultarán los productos asociados.')) return;

        setCategories(prev => prev.filter(c => c.id !== categoryId));
        await supabase.from("categories").delete().eq("id", categoryId);
    };

    // --- HANDLERS: PRODUCTS ---
    const handleOpenProductModal = (categoryId: string, product: Product | null = null) => {
        setPreselectedCategoryId(categoryId);
        setEditingProduct(product);
        setShowProductModal(true);
    };

    const handleSaveProduct = async (data: Partial<Product>) => {
        try {
            if (editingProduct) {
                await supabase
                    .from("products")
                    .update({ ...data, updated_at: new Date().toISOString() })
                    .eq("id", editingProduct.id);
            } else {
                await supabase
                    .from("products")
                    .insert({
                        restaurant_id: restaurant.id,
                        category_id: data.category_id || preselectedCategoryId,
                        ...data,
                        sort_order: 999,
                        is_available: true
                    });
            }
            // IMPORTANT: Reload data to update the preview and list
            await loadData();
            setShowProductModal(false);
            setEditingProduct(null);
        } catch (err) {
            console.error(err);
            alert("Error al guardar producto");
        }
    };

    // --- RENDER ---
    const filteredCategories = categories.filter(cat =>
        cat.name_es.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <Loader2 size={24} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-slate-50/50">
            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${showPreview ? 'mr-[400px]' : ''}`}>
                <div className="p-6 lg:p-8 max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Categorías y Productos</h1>
                            <p className="text-sm text-slate-500 mt-1">Organiza tu menú digital</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowPreview(!showPreview)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all border ${showPreview ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                            >
                                {showPreview ? <Eye size={16} /> : <Smartphone size={16} />}
                                {showPreview ? 'Ocultar Vista Previa' : 'Ver Vista Previa'}
                            </button>
                            <button
                                onClick={() => {
                                    setEditingCategory(null);
                                    setShowCategoryModal(true);
                                }}
                                className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-sm transition-all shadow-sm"
                            >
                                <Plus size={16} />
                                Nueva Categoría
                            </button>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mb-6 relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input
                            type="text"
                            placeholder="Buscar en el menú..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
                        />
                    </div>

                    {/* List */}
                    {categories.length === 0 ? (
                        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <p className="text-slate-500 mb-4">No tienes categorías aún.</p>
                            <button
                                onClick={() => setShowCategoryModal(true)}
                                className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm"
                            >
                                Crear mi primera categoría
                            </button>
                        </div>
                    ) : (
                        <Reorder.Group axis="y" values={filteredCategories} onReorder={handleReorder} className="space-y-4 pb-20">
                            {filteredCategories.map((category) => (
                                <Reorder.Item key={category.id} value={category}>
                                    <CategoryAccordion
                                        category={category}
                                        products={category.products || []}
                                        onToggleActive={() => toggleCategoryActive(category.id, !category.is_active)}
                                        onEdit={() => {
                                            setEditingCategory(category);
                                            setShowCategoryModal(true);
                                        }}
                                        onDelete={() => deleteCategory(category.id)}
                                        onAddProduct={(catId) => handleOpenProductModal(catId)}
                                        onEditProduct={(product) => handleOpenProductModal(category.id, product)}
                                    />
                                </Reorder.Item>
                            ))}
                        </Reorder.Group>
                    )}
                </div>
            </div>

            {/* Live Preview Sidebar */}
            <MenuPreview
                restaurant={restaurant}
                categories={categories}
                isOpen={showPreview}
                onClose={() => setShowPreview(false)}
            />

            {/* Modal: Category */}
            <AnimatePresence>
                {showCategoryModal && (
                    <CategoryModal
                        category={editingCategory}
                        onSave={handleSaveCategory}
                        onClose={() => setShowCategoryModal(false)}
                    />
                )}
            </AnimatePresence>

            {/* Modal: Product */}
            <AnimatePresence>
                {showProductModal && (
                    <ProductModal
                        product={editingProduct}
                        categories={categories}
                        saving={false}
                        onSave={handleSaveProduct}
                        onClose={() => setShowProductModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
