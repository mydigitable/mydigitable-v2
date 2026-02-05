"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";

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
    is_available: boolean;
    is_featured: boolean;
    sort_order: number;
    allergens: string[] | null;
    is_vegetarian: boolean;
    is_vegan: boolean;
    is_gluten_free: boolean;
}

interface Category {
    id: string;
    restaurant_id: string;
    name_es: string;
    icon: string;
    image_url: string | null;
    sort_order: number;
    is_active: boolean;
    products?: Product[];
}

interface MenuContextType {
    restaurant: any;
    categories: Category[];
    loading: boolean;
    refreshMenu: () => Promise<void>;
    showPreview: boolean;
    setShowPreview: (show: boolean) => void;
    isMenuEmpty: boolean;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
    const [restaurant, setRestaurant] = useState<any>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(true);

    const supabase = createClient();

    const loadData = async () => {
        try {
            console.log("🔄 MenuContext: Refreshing data...");
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: restaurantData } = await supabase
                .from("restaurants")
                .select("*")
                .eq("owner_id", user.id)
                .limit(1);

            const fetchedRestaurant = restaurantData?.[0];
            if (!fetchedRestaurant) return;
            setRestaurant(fetchedRestaurant);

            // Fetch categories with full products data
            const { data: categoriesData, error } = await supabase
                .from("categories")
                .select(`
                    *,
                    products:products(*)
                `)
                .eq("restaurant_id", fetchedRestaurant.id)
                .order("sort_order");

            if (error) console.error("❌ MenuContext Error:", error);

            console.log(`✅ MenuContext: Loaded ${categoriesData?.length} categories`);

            // Sort products within categories
            const sortedCategories = (categoriesData || []).map((cat: any) => ({
                ...cat,
                products: (cat.products || []).sort((a: Product, b: Product) => a.sort_order - b.sort_order)
            }));

            setCategories(sortedCategories);
        } catch (err) {
            console.error("Error loading menu data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Compute if menu is empty (for onboarding detection)
    const isMenuEmpty = categories.length === 0 || categories.every(c => (c.products || []).length === 0);

    return (
        <MenuContext.Provider value={{
            restaurant,
            categories,
            loading,
            refreshMenu: loadData,
            showPreview,
            setShowPreview,
            isMenuEmpty,
        }}>
            {children}
        </MenuContext.Provider>
    );
}

export function useMenu() {
    const context = useContext(MenuContext);
    if (context === undefined) {
        throw new Error("useMenu must be used within a MenuProvider");
    }
    return context;
}
