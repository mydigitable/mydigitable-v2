import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MenuClient from "./MenuClient";
import type { Restaurant, Category, Product, DailyMenu, DesignTheme, ProductExtraGroup, ProductExtra } from "./types";

interface PageProps {
    params: Promise<{ slug: string }>;
}

// ============================================================================
// HELPERS
// ============================================================================

function extractName(name: unknown): string {
    if (!name) return "Sin nombre";
    if (typeof name === "string") return name;
    if (typeof name === "object" && name !== null) {
        const obj = name as Record<string, string>;
        return obj.es || obj.en || Object.values(obj)[0] || "Sin nombre";
    }
    return String(name);
}

function extractDescription(desc: unknown): string | null {
    if (!desc) return null;
    if (typeof desc === "string") return desc;
    if (typeof desc === "object" && desc !== null) {
        const obj = desc as Record<string, string>;
        return obj.es || obj.en || Object.values(obj)[0] || null;
    }
    return null;
}

// ============================================================================
// SEO METADATA
// ============================================================================

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params;
    const supabase = await createClient();

    const { data: restaurantMeta } = await supabase
        .from("restaurants")
        .select("*")
        .eq("slug", slug)
        .single();

    if (!restaurantMeta) {
        return {
            title: "Menú no encontrado",
            description: "El menú que buscas no existe.",
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rmeta = restaurantMeta as Record<string, any>;
    const name = rmeta.name as string;
    const description = (rmeta.description as string) || null;
    const city = (rmeta.city as string) || null;
    const logo = (rmeta.logo_url as string) || null;

    const title = `${name} — Menú Digital`;
    const desc =
        description ||
        `Descubre el menú de ${name}${city ? ` en ${city}` : ""}. Haz tu pedido online.`;

    return {
        title,
        description: desc,
        openGraph: {
            title,
            description: desc,
            type: "website",
            ...(logo && { images: [{ url: logo }] }),
        },
        twitter: {
            card: "summary_large_image",
            title,
            description: desc,
        },
    };
}

// ============================================================================
// PAGE — Server Component
// ============================================================================

export default async function PublicMenuPage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // 1. Fetch restaurant
    const { data: restaurantRaw } = await supabase
        .from("restaurants")
        .select("*")
        .eq("slug", slug)
        .single();

    if (!restaurantRaw) {
        notFound();
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const rd = restaurantRaw as Record<string, any>;
    const restaurant: Restaurant = {
        id: rd.id,
        name: rd.name || "Restaurant",
        slug: rd.slug,
        logo_url: rd.logo_url || null,
        cover_image_url: rd.cover_image_url || null,
        theme_id: rd.theme_id || null,
        description: rd.description || null,
        primary_color: rd.primary_color || null,
        secondary_color: rd.secondary_color || null,
        phone: rd.phone || null,
        email: rd.email || null,
        address: rd.address || null,
        city: rd.city || null,
    };

    // 2. Fetch design config + selected theme
    let designTheme: DesignTheme | null = null;
    try {
        const { data: designConfig } = await supabase
            .from("restaurant_design_config")
            .select(`
                *,
                selected_theme:menu_themes(*)
            `)
            .eq("restaurant_id", restaurant.id)
            .single();

        if (designConfig) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dc = designConfig as Record<string, any>;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const theme = dc.selected_theme as Record<string, any> | null;

            // Use theme colors, falling back to custom_colors or defaults
            const themeColors = theme?.colors || dc.custom_colors || {};
            const themeFonts = theme?.fonts || dc.custom_fonts || {};

            designTheme = {
                colors: {
                    primary: themeColors.primary || '#16A34A',
                    accent: themeColors.accent || '#22C55E',
                    background: themeColors.background || '#FAFAF9',
                    surface: themeColors.surface || '#FFFFFF',
                    border: themeColors.border || '#E7E5E4',
                    text: themeColors.text || '#1C1917',
                    text_secondary: themeColors.text_secondary || '#78716C',
                },
                fonts: {
                    heading: themeFonts.heading || 'DM Sans',
                    body: themeFonts.body || 'DM Sans',
                },
                config: {
                    show_search: dc.show_search ?? true,
                    show_categories: dc.show_categories ?? true,
                    show_images: dc.show_images ?? true,
                    show_prices: dc.show_prices ?? true,
                    show_descriptions: dc.show_descriptions ?? true,
                    show_badges: dc.show_badges ?? true,
                    show_allergens: dc.show_allergens ?? true,
                    show_logo: dc.show_logo ?? true,
                },
            };
        }
    } catch {
        // Design config may not exist yet — use fallback
    }

    // 3. Fetch active menus → their categories → products
    const { data: menusRaw } = await supabase
        .from("menus")
        .select(`
            id,
            name,
            type,
            display_order,
            menu_categories (
                id,
                name,
                description,
                icon,
                image_url,
                is_visible,
                display_order,
                products (
                    id,
                    name,
                    description,
                    price,
                    image_url,
                    allergens,
                    labels,
                    is_available,
                    display_order,
                    category_id
                )
            )
        `)
        .eq("restaurant_id", restaurant.id)
        .eq("is_active", true)
        .order("display_order");

    // 4. Flatten categories from all active menus (deduplicated)
    const seenCategoryIds = new Set<string>();
    const categories: Category[] = [];
    const products: Product[] = [];
    const productIds: string[] = [];

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const menu of (menusRaw || []) as any[]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const cats = (menu.menu_categories || []) as any[];
        for (const cat of cats) {
            if (!cat.is_visible) continue;
            if (seenCategoryIds.has(cat.id)) continue;
            seenCategoryIds.add(cat.id);

            categories.push({
                id: cat.id,
                name: extractName(cat.name),
                icon: cat.icon || null,
                sort_order: cat.display_order ?? 0,
            });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const prods = (cat.products || []) as any[];
            for (const p of prods) {
                if (!p.is_available) continue;

                products.push({
                    id: p.id,
                    name: extractName(p.name),
                    description: extractDescription(p.description),
                    price: p.price ?? 0,
                    image_url: p.image_url || null,
                    allergens: p.allergens || [],
                    dietary_tags: p.labels || [],
                    category_id: p.category_id,
                });
                productIds.push(p.id);
            }
        }
    }

    categories.sort((a, b) => a.sort_order - b.sort_order);

    // 5. Fetch product extras + groups for all products
    if (productIds.length > 0) {
        try {
            // Fetch extra groups with their extras
            const { data: groupsRaw } = await supabase
                .from("product_extra_groups")
                .select(`
                    *,
                    extras:product_extras(*)
                `)
                .in("product_id", productIds)
                .order("display_order");

            // Fetch standalone extras (no group)
            const { data: standaloneExtrasRaw } = await supabase
                .from("product_extras")
                .select("*")
                .in("product_id", productIds)
                .is("group_id", null)
                .eq("is_available", true)
                .order("display_order");

            // Map extras to products
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const groupsByProduct = new Map<string, ProductExtraGroup[]>();
            const extrasByProduct = new Map<string, ProductExtra[]>();

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const g of (groupsRaw || []) as any[]) {
                const pid = g.product_id as string;
                if (!groupsByProduct.has(pid)) groupsByProduct.set(pid, []);

                groupsByProduct.get(pid)!.push({
                    id: g.id,
                    name: extractName(g.name),
                    description: extractDescription(g.description),
                    min_selections: g.min_selections ?? 0,
                    max_selections: g.max_selections ?? 1,
                    is_required: g.is_required ?? false,
                    display_order: g.display_order ?? 0,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    extras: ((g.extras || []) as any[])
                        .filter((e: { is_available: boolean }) => e.is_available)
                        .map((e: Record<string, unknown>) => ({
                            id: e.id as string,
                            name: extractName(e.name),
                            description: extractDescription(e.description),
                            price: (e.price as number) ?? 0,
                            type: e.type as ProductExtra['type'],
                            is_available: true,
                            group_id: e.group_id as string,
                            display_order: (e.display_order as number) ?? 0,
                        })),
                });
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            for (const e of (standaloneExtrasRaw || []) as any[]) {
                const pid = e.product_id as string;
                if (!extrasByProduct.has(pid)) extrasByProduct.set(pid, []);
                extrasByProduct.get(pid)!.push({
                    id: e.id,
                    name: extractName(e.name),
                    description: extractDescription(e.description),
                    price: e.price ?? 0,
                    type: e.type,
                    is_available: true,
                    group_id: null,
                    display_order: e.display_order ?? 0,
                });
            }

            // Attach extras to products
            for (const product of products) {
                product.extra_groups = groupsByProduct.get(product.id) || [];
                product.extras = extrasByProduct.get(product.id) || [];
            }
        } catch {
            // Extras tables may not exist yet — silently ignore
        }
    }

    // 6. Fetch daily menus (if the table exists)
    let dailyMenus: DailyMenu[] = [];
    try {
        const { data: dailyMenusRaw } = await supabase
            .from("daily_menus" as never)
            .select("*")
            .eq("restaurant_id" as never, restaurant.id as never)
            .eq("is_active" as never, true as never);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dailyMenus = ((dailyMenusRaw || []) as any[]).map((m) => ({
            id: m.id,
            name: m.name,
            description: m.description || null,
            price: m.price,
            original_price: m.original_price || null,
            courses: m.courses || [],
            includes_drink: m.includes_drink ?? false,
            includes_bread: m.includes_bread ?? false,
            includes_dessert: m.includes_dessert ?? false,
            includes_coffee: m.includes_coffee ?? false,
        }));
    } catch {
        // daily_menus table may not exist yet
    }

    return (
        <MenuClient
            restaurant={restaurant}
            initialCategories={categories}
            initialProducts={products}
            initialDailyMenus={dailyMenus}
            designTheme={designTheme}
        />
    );
}
