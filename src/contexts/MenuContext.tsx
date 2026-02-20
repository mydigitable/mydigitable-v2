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
    image_url: string | null;
    is_available: boolean;
    is_featured: boolean;
    sort_order: number;
    allergens: string[] | null;
    dietary_tags: string[] | null;
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
    designConfig: any;
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
    const [designConfig, setDesignConfig] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showPreview, setShowPreview] = useState(true);

    const supabase = createClient();

    const loadData = async () => {
        try {
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

            // Fetch design config with theme
            const { data: configData } = await supabase
                .from("restaurant_design_config")
                .select(`
                    *,
                    selected_theme:menu_themes(*)
                `)
                .eq("restaurant_id", fetchedRestaurant.id)
                .single();

            setDesignConfig(configData || null);

            // Fetch categories from menu_categories (the real table)
            const { data: categoriesData, error } = await supabase
                .from("menu_categories")
                .select(`
                    *,
                    products:products(*)
                `)
                .eq("restaurant_id", fetchedRestaurant.id)
                .order("sort_order");

            if (error) console.error("❌ MenuContext Error:", error);


            // Map DB column names to interface and sort products
            const extractName = (name: any): string => {
                if (!name) return "Sin nombre";
                if (typeof name === "string") return name;
                if (typeof name === "object" && name.es) return name.es;
                return String(name);
            };

            const sortedCategories: Category[] = (categoriesData || []).map((cat: any) => ({
                id: cat.id,
                restaurant_id: cat.restaurant_id,
                name_es: extractName(cat.name),
                icon: cat.icon || '',
                image_url: cat.image_url || null,
                sort_order: cat.sort_order ?? cat.display_order ?? 0,
                is_active: cat.is_visible !== false,
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
            designConfig,
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
