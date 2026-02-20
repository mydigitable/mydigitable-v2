"use client";

import { useState, useEffect, useCallback } from "react";
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
import {
    createCategory,
    updateCategory,
    deleteCategory as deleteCategoryAction,
    toggleCategoryVisible,
    reorderCategories,
    createProduct,
    updateProduct,
} from "@/app/actions/menu";
import { useMenu } from "@/contexts/MenuContext";

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
    sort_order: number;
}

// Category as shown in UI (adapted from menu_categories)
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
    menu_id?: string | null;
    menu_name?: string;
}

interface MenuInfo {
    id: string;
    name: string;
    is_active: boolean;
}

// Helper to extract name from DB column (can be string or {es: string})
function extractName(name: string | Record<string, string> | null | undefined): string {
    if (!name) return "Sin nombre";
    if (typeof name === "string") return name;
    if (typeof name === "object" && name.es) return name.es;
    return String(name);
}

export default function CategoriesPage() {
    // --- STATE ---
    const [categories, setCategories] = useState<Category[]>([]);
    const [menus, setMenus] = useState<MenuInfo[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modals
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [preselectedCategoryId, setPreselectedCategoryId] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');

    const supabase = createClient();
    const { refreshMenu } = useMenu();

    // --- DATA LOADING (read-only, still via client for initial load) ---
    const loadData = useCallback(async () => {
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

            // Load menus
            const { data: menusData } = await supabase
                .from("menus")
                .select("id, name, is_active")
                .eq("restaurant_id", restaurant.id)
                .order("display_order");

            setMenus((menusData || []) as MenuInfo[]);

            // Fetch categories with products
            const { data: categoriesData, error: catError } = await supabase
                .from("menu_categories")
                .select(`*, products:products(*)`)
                .eq("restaurant_id", restaurant.id)
                .order("sort_order");

            if (catError) {
                console.error("Error loading categories:", catError);
            }

            // Map DB columns to UI interface
            const mapped: Category[] = (categoriesData || []).map((cat: Record<string, unknown>) => ({
                id: cat.id as string,
                restaurant_id: cat.restaurant_id as string,
                name_es: extractName(cat.name as string | Record<string, string>),
                name_en: null,
                description_es: (cat.description as string) || null,
                icon: (cat.icon as string) || '',
                image_url: (cat.image_url as string) || null,
                sort_order: (cat.sort_order as number) ?? (cat.display_order as number) ?? 0,
                is_active: cat.is_visible !== false,
                menu_id: (cat.menu_id as string) || null,
                menu_name: (menusData || []).find((m: Record<string, unknown>) => m.id === cat.menu_id)?.name as string || undefined,
                products: ((cat.products as Product[]) || []).sort((a: Product, b: Product) => a.sort_order - b.sort_order)
            }));

            setCategories(mapped);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // --- HANDLERS: CATEGORIES (using server actions) ---
    const handleReorder = async (newOrder: Category[]) => {
        setCategories(newOrder);
        const orderedIds = newOrder.map(cat => cat.id);
        await reorderCategories(orderedIds);
        refreshMenu();
    };

    const handleSaveCategory = async (data: Partial<Category> & { menu_ids?: string[] }) => {
        setSaving(true);
        try {
            const menuIds = data.menu_ids || [];

            if (editingCategory) {
                // Update existing category
                const result = await updateCategory(editingCategory.id, {
                    name: data.name_es || '',
                    description: data.description_es || undefined,
                    is_visible: true,
                });

                if (!result.success) {
                    alert(`Error: ${result.error}`);
                    return;
                }
            } else {
                // Create new category
                if (menuIds.length === 0) {
                    // No menu selected — create with null menu_id
                    const result = await createCategory({
                        menu_id: null,
                        name: data.name_es || '',
                        description: data.description_es || undefined,
                        is_visible: true,
                    });

                    if (!result.success) {
                        alert(`Error: ${result.error}`);
                        return;
                    }
                } else {
                    // Create one per selected menu
                    for (const menuId of menuIds) {
                        const result = await createCategory({
                            menu_id: menuId,
                            name: data.name_es || '',
                            description: data.description_es || undefined,
                            is_visible: true,
                        });

                        if (!result.success) {
                            alert(`Error: ${result.error}`);
                            return;
                        }
                    }
                }
            }

            await loadData();
            refreshMenu();
            setShowCategoryModal(false);
            setEditingCategory(null);
        } catch (err) {
            console.error("Error saving category:", err);
            alert("Error al guardar la categoría");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleCategoryActive = async (categoryId: string) => {
        // Optimistic update
        setCategories(prev => prev.map(c =>
            c.id === categoryId ? { ...c, is_active: !c.is_active } : c
        ));

        const result = await toggleCategoryVisible(categoryId);
        if (!result.success) {
            // Revert optimistic update
            setCategories(prev => prev.map(c =>
                c.id === categoryId ? { ...c, is_active: !c.is_active } : c
            ));
        }
        refreshMenu();
    };

    const handleDeleteCategory = async (categoryId: string) => {
        if (!confirm('¿Eliminar esta categoría? Se ocultarán los productos asociados.')) return;

        // Optimistic update
        setCategories(prev => prev.filter(c => c.id !== categoryId));

        const result = await deleteCategoryAction(categoryId);
        if (!result.success) {
            alert(`Error: ${result.error}`);
            await loadData(); // reload on error
        }
        refreshMenu();
    };

    // --- HANDLERS: PRODUCTS (using server actions) ---
    const handleOpenProductModal = (categoryId: string, product: Product | null = null) => {
        setPreselectedCategoryId(categoryId);
        setEditingProduct(product);
        setShowProductModal(true);
    };

    const handleSaveProduct = async (data: Partial<Product>) => {
        setSaving(true);
        try {
            if (editingProduct) {
                const result = await updateProduct(editingProduct.id, {
                    name: data.name_es,
                    description: data.description_es || undefined,
                    price: data.price,
                    image_url: data.image_url || undefined,
                    allergens: data.allergens || [],
                    is_available: data.is_available ?? true,
                });

                if (!result.success) {
                    alert(`Error: ${result.error}`);
                    return;
                }
            } else {
                const result = await createProduct({
                    category_id: data.category_id || preselectedCategoryId,
                    name: data.name_es || '',
                    description: data.description_es || undefined,
                    price: data.price || 0,
                    image_url: data.image_url || undefined,
                    allergens: data.allergens || [],
                    is_available: data.is_available ?? true,
                });

                if (!result.success) {
                    alert(`Error: ${result.error}`);
                    return;
                }
            }

            await loadData();
            refreshMenu();
            setShowProductModal(false);
            setEditingProduct(null);
        } catch (err) {
            console.error(err);
            alert("Error al guardar producto");
        } finally {
            setSaving(false);
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
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Categorías y Productos</h1>
                    <p className="text-sm text-slate-500 mt-1">Organiza tu menú digital</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => {
                            setPreselectedCategoryId(categories[0]?.id || '');
                            setEditingProduct(null);
                            setShowProductModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-slate-300 bg-white text-slate-700 rounded-lg font-medium text-sm transition-colors"
                    >
                        <Plus size={16} />
                        + Producto
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
                                onToggleActive={() => handleToggleCategoryActive(category.id)}
                                onEdit={() => {
                                    setEditingCategory(category);
                                    setShowCategoryModal(true);
                                }}
                                onDelete={() => handleDeleteCategory(category.id)}
                                onAddProduct={(catId) => handleOpenProductModal(catId)}
                                onEditProduct={(product) => handleOpenProductModal(category.id, product)}
                                menuName={category.menu_name}
                            />
                        </Reorder.Item>
                    ))}
                </Reorder.Group>
            )}

            {/* Modal: Category */}
            <AnimatePresence>
                {showCategoryModal && (
                    <CategoryModal
                        category={editingCategory}
                        menus={menus}
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
                        saving={saving}
                        onSave={handleSaveProduct}
                        onClose={() => setShowProductModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
