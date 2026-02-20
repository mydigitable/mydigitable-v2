"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingCart,
    Search,
    Leaf,
    Bell,
    Plus,
    Minus,
    X,
    ChevronDown,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import ProductCard from "./components/ProductCard";
import CartModal from "./components/CartModal";
import DietaryModal from "./components/DietaryModal";
import DailyMenuModal from "./components/DailyMenuModal";
import CheckoutModal from "./components/CheckoutModal";
import type {
    Product,
    Category,
    DailyMenu,
    CartItem,
    DietaryPreferences,
    Restaurant,
    DesignTheme,
    Theme,
    ProductExtraGroup,
} from "./types";
import { themes } from "./types";

// ============================================================================
// Helpers
// ============================================================================

function extractName(name: unknown): string {
    if (!name) return '';
    if (typeof name === 'string') return name;
    if (typeof name === 'object' && name !== null) {
        const n = name as Record<string, string>;
        return n.es || n.en || Object.values(n)[0] || '';
    }
    return '';
}

function extractDesc(desc: unknown): string | null {
    if (!desc) return null;
    if (typeof desc === 'string') return desc;
    if (typeof desc === 'object' && desc !== null) {
        const d = desc as Record<string, string>;
        return d.es || d.en || Object.values(d)[0] || null;
    }
    return null;
}

// ============================================================================
// Convert DB colors to inline style helpers
// ============================================================================

function makeInlineTheme(dt: DesignTheme) {
    const c = dt.colors;
    return {
        '--bg': c.background,
        '--surface': c.surface,
        '--border': c.border,
        '--text': c.text,
        '--text2': c.text_secondary,
        '--primary': c.primary,
        '--accent': c.accent,
    } as React.CSSProperties;
}

// ============================================================================
// Props
// ============================================================================

interface MenuClientProps {
    restaurant: Restaurant;
    initialCategories: Category[];
    initialProducts: Product[];
    initialDailyMenus: DailyMenu[];
    designTheme?: DesignTheme | null;
}

// ============================================================================
// Product Detail Modal (with extras)
// ============================================================================

function ProductDetailModal({
    product,
    designTheme,
    fallbackTheme,
    onClose,
    onAddToCart,
}: {
    product: Product;
    designTheme: DesignTheme | null;
    fallbackTheme: Theme;
    onClose: () => void;
    onAddToCart: (product: Product, extras: { extraId: string; name: string; price: number }[]) => void;
}) {
    const [selectedExtras, setSelectedExtras] = useState<Record<string, boolean>>({});
    const [quantity, setQuantity] = useState(1);

    const allExtras = useMemo(() => {
        const items: { id: string; name: string; price: number; groupName?: string }[] = [];

        // From groups
        for (const group of (product.extra_groups || [])) {
            for (const extra of group.extras) {
                items.push({ id: extra.id, name: extra.name, price: extra.price, groupName: group.name });
            }
        }

        // Standalone
        for (const extra of (product.extras || [])) {
            items.push({ id: extra.id, name: extra.name, price: extra.price });
        }

        return items;
    }, [product]);

    const toggleExtra = (id: string) => {
        setSelectedExtras(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const extrasTotal = allExtras.filter(e => selectedExtras[e.id]).reduce((sum, e) => sum + e.price, 0);
    const total = (product.price + extrasTotal) * quantity;

    const handleAdd = () => {
        const selected = allExtras.filter(e => selectedExtras[e.id]).map(e => ({
            extraId: e.id,
            name: e.name,
            price: e.price,
        }));
        for (let i = 0; i < quantity; i++) {
            onAddToCart(product, selected);
        }
        onClose();
    };

    const useDB = !!designTheme;
    const c = designTheme?.colors;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-md sm:rounded-2xl rounded-t-3xl max-h-[90vh] flex flex-col overflow-hidden"
                style={useDB ? { backgroundColor: c!.surface, color: c!.text } : undefined}
            >
                {/* Header image */}
                {product.image_url && (
                    <div className="relative h-48 flex-shrink-0">
                        <img src={product.image_url} alt={extractName(product.name)} className="w-full h-full object-cover" />
                        <button
                            onClick={onClose}
                            className="absolute top-3 right-3 w-8 h-8 bg-black/40 text-white rounded-full flex items-center justify-center"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-5">
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-xl font-bold flex-1">{extractName(product.name)}</h2>
                        {!product.image_url && (
                            <button onClick={onClose} className="p-1">
                                <X size={18} />
                            </button>
                        )}
                    </div>

                    {extractDesc(product.description) && (
                        <p className="text-sm mb-4" style={useDB ? { color: c!.text_secondary } : undefined}>
                            {extractDesc(product.description)}
                        </p>
                    )}

                    <div className="text-2xl font-black mb-4" style={useDB ? { color: c!.primary } : undefined}>
                        €{product.price.toFixed(2)}
                    </div>

                    {/* Allergens */}
                    {product.allergens && product.allergens.length > 0 && (
                        <div className="mb-4 flex flex-wrap gap-1">
                            {product.allergens.map(a => (
                                <span key={a} className="text-xs px-2 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                                    {a}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Extra Groups */}
                    {(product.extra_groups || []).map((group: ProductExtraGroup) => (
                        <div key={group.id} className="mb-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-bold text-sm">{group.name}</h3>
                                {group.is_required && (
                                    <span className="text-xs px-2 py-0.5 rounded-full font-bold"
                                        style={useDB ? { backgroundColor: c!.accent + '20', color: c!.primary } : undefined}
                                    >
                                        Obligatorio
                                    </span>
                                )}
                            </div>
                            {group.description && (
                                <p className="text-xs mb-2" style={useDB ? { color: c!.text_secondary } : undefined}>
                                    {group.description}
                                </p>
                            )}
                            <div className="space-y-2">
                                {group.extras.map(extra => (
                                    <label
                                        key={extra.id}
                                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border"
                                        style={useDB ? {
                                            borderColor: selectedExtras[extra.id] ? c!.primary : c!.border,
                                            backgroundColor: selectedExtras[extra.id] ? c!.primary + '08' : 'transparent',
                                        } : undefined}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!!selectedExtras[extra.id]}
                                            onChange={() => toggleExtra(extra.id)}
                                            className="w-4 h-4 rounded"
                                            style={useDB ? { accentColor: c!.primary } : undefined}
                                        />
                                        <span className="flex-1 text-sm font-medium">{extra.name}</span>
                                        {extra.price > 0 && (
                                            <span className="text-sm font-bold" style={useDB ? { color: c!.primary } : undefined}>
                                                +€{extra.price.toFixed(2)}
                                            </span>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Standalone extras */}
                    {(product.extras || []).length > 0 && (
                        <div className="mb-4">
                            <h3 className="font-bold text-sm mb-2">Extras</h3>
                            <div className="space-y-2">
                                {(product.extras || []).map(extra => (
                                    <label
                                        key={extra.id}
                                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border"
                                        style={useDB ? {
                                            borderColor: selectedExtras[extra.id] ? c!.primary : c!.border,
                                            backgroundColor: selectedExtras[extra.id] ? c!.primary + '08' : 'transparent',
                                        } : undefined}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={!!selectedExtras[extra.id]}
                                            onChange={() => toggleExtra(extra.id)}
                                            className="w-4 h-4 rounded"
                                            style={useDB ? { accentColor: c!.primary } : undefined}
                                        />
                                        <span className="flex-1 text-sm font-medium">{extra.name}</span>
                                        {extra.price > 0 && (
                                            <span className="text-sm font-bold" style={useDB ? { color: c!.primary } : undefined}>
                                                +€{extra.price.toFixed(2)}
                                            </span>
                                        )}
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer — Quantity + Add */}
                <div className="p-4 border-t" style={useDB ? { borderColor: c!.border } : undefined}>
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 rounded-full px-1 py-1" style={useDB ? { backgroundColor: c!.background } : undefined}>
                            <button
                                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                className="w-8 h-8 rounded-full flex items-center justify-center"
                                style={useDB ? { backgroundColor: c!.surface } : undefined}
                            >
                                <Minus size={14} />
                            </button>
                            <span className="font-bold min-w-[2rem] text-center">{quantity}</span>
                            <button
                                onClick={() => setQuantity(q => q + 1)}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                                style={useDB ? { backgroundColor: c!.primary } : undefined}
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                        <span className="text-lg font-black" style={useDB ? { color: c!.primary } : undefined}>
                            €{total.toFixed(2)}
                        </span>
                    </div>
                    <button
                        onClick={handleAdd}
                        className="w-full py-3.5 rounded-2xl font-bold text-white"
                        style={useDB ? { backgroundColor: c!.primary } : undefined}
                    >
                        Añadir al pedido
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export default function MenuClient({
    restaurant,
    initialCategories,
    initialProducts,
    initialDailyMenus,
    designTheme,
}: MenuClientProps) {
    const searchParams = useSearchParams();
    const tableNumber = searchParams.get('table');

    const [categories] = useState<Category[]>(initialCategories);
    const [products] = useState<Product[]>(initialProducts);
    const [dailyMenus] = useState<DailyMenu[]>(initialDailyMenus);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [showDietaryModal, setShowDietaryModal] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [showWaiterCall, setShowWaiterCall] = useState(false);
    const [selectedDailyMenu, setSelectedDailyMenu] = useState<DailyMenu | null>(null);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreferences>({
        isVegetarian: false,
        isVegan: false,
        isCeliac: false,
        allergies: [],
        allergyNotes: '',
        otherNotes: '',
    });

    // Determine if we use DB theme (inline styles) or fallback Tailwind theme
    const useDBTheme = !!designTheme;
    const c = designTheme?.colors;
    const fonts = designTheme?.fonts;
    const config = designTheme?.config;

    // Fallback to Tailwind theme
    const previewThemeId = searchParams.get('preview_theme');
    const activeThemeId = previewThemeId || restaurant.theme_id;
    const fallbackTheme: Theme = themes[activeThemeId || 'classic'] || themes.classic;

    // Google Fonts link
    const fontLink = useMemo(() => {
        if (!fonts) return null;
        const families = [fonts.heading, fonts.body].filter(Boolean).map(f => f.replace(/ /g, '+'));
        if (families.length === 0) return null;
        return `https://fonts.googleapis.com/css2?${families.map(f => `family=${f}:wght@400;500;600;700;800;900`).join('&')}&display=swap`;
    }, [fonts]);

    const addToCart = (product: Product, extras?: { extraId: string; name: string; price: number }[]) => {
        setCart(prev => {
            // Simple match: same product, no extras → increment
            if (!extras || extras.length === 0) {
                const existing = prev.find(item => item.product.id === product.id && (!item.selectedExtras || item.selectedExtras.length === 0));
                if (existing) {
                    return prev.map(item =>
                        item === existing
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    );
                }
                return [...prev, { product, quantity: 1 }];
            }
            // With extras — always add new line
            return [...prev, { product, quantity: 1, selectedExtras: extras }];
        });
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === productId);
            if (existing && existing.quantity > 1) {
                return prev.map(item =>
                    item.product.id === productId
                        ? { ...item, quantity: item.quantity - 1 }
                        : item
                );
            }
            return prev.filter(item => item.product.id !== productId);
        });
    };

    const cartTotal = cart.reduce((sum, item) => {
        const extrasCost = (item.selectedExtras || []).reduce((s, e) => s + e.price, 0);
        return sum + ((item.product.price + extrasCost) * item.quantity);
    }, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const filteredProducts = products.filter(product => {
        if (selectedCategory && product.category_id !== selectedCategory) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const pName = extractName(product.name);
            const pDesc = extractDesc(product.description);
            return pName.toLowerCase().includes(query) ||
                pDesc?.toLowerCase().includes(query) || false;
        }
        if (dietaryPrefs.isVegetarian && !product.dietary_tags?.includes('vegetarian') && !product.dietary_tags?.includes('vegan')) return false;
        if (dietaryPrefs.isVegan && !product.dietary_tags?.includes('vegan')) return false;
        if (dietaryPrefs.isCeliac && !product.dietary_tags?.includes('gluten_free')) return false;
        if (dietaryPrefs.allergies.length > 0) {
            const hasAllergen = dietaryPrefs.allergies.some(a => product.allergens?.includes(a));
            if (hasAllergen) return false;
        }
        return true;
    });

    const hasExtras = (product: Product) => {
        return (product.extras && product.extras.length > 0) || (product.extra_groups && product.extra_groups.length > 0);
    };

    // ========================================================================
    // RENDER with DB theme (inline styles)
    // ========================================================================

    if (useDBTheme && c) {
        return (
            <div
                className="min-h-screen pb-24"
                style={{
                    backgroundColor: c.background,
                    color: c.text,
                    fontFamily: fonts?.body ? `'${fonts.body}', sans-serif` : undefined,
                    ...makeInlineTheme(designTheme!),
                }}
            >
                {/* Google Fonts */}
                {fontLink && (
                    // eslint-disable-next-line @next/next/no-page-custom-font
                    <link rel="stylesheet" href={fontLink} />
                )}

                {/* Header */}
                <div className="sticky top-0 z-40 border-b" style={{ backgroundColor: c.surface, borderColor: c.border }}>
                    <div className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                            {(config?.show_logo !== false) && restaurant.logo_url && (
                                <img src={restaurant.logo_url} alt={restaurant.name} className="w-12 h-12 rounded-xl object-cover" />
                            )}
                            <div>
                                <h1
                                    className="font-bold text-lg"
                                    style={{ fontFamily: fonts?.heading ? `'${fonts.heading}', serif` : undefined }}
                                >
                                    {restaurant.name}
                                </h1>
                                {tableNumber && (
                                    <span className="text-sm" style={{ color: c.text_secondary }}>
                                        Mesa {tableNumber}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Search */}
                        {(config?.show_search !== false) && (
                            <div className="flex gap-2">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={18} style={{ color: c.text_secondary }} />
                                    <input
                                        type="text"
                                        placeholder="Buscar platos..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none"
                                        style={{ backgroundColor: c.background, color: c.text }}
                                    />
                                </div>
                                <button
                                    onClick={() => setShowDietaryModal(true)}
                                    className="p-2.5 rounded-xl relative"
                                    style={{ backgroundColor: c.background }}
                                >
                                    <Leaf size={20} style={{ color: dietaryPrefs.isVegetarian || dietaryPrefs.isVegan ? '#22c55e' : c.text_secondary }} />
                                    {(dietaryPrefs.isVegetarian || dietaryPrefs.isVegan || dietaryPrefs.isCeliac || dietaryPrefs.allergies.length > 0) && (
                                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                                    )}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Categories */}
                    {(config?.show_categories !== false) && (
                        <div className="flex overflow-x-auto gap-2 px-4 pb-3 scrollbar-hide">
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors"
                                style={{
                                    backgroundColor: selectedCategory === null ? c.primary : c.background,
                                    color: selectedCategory === null ? '#fff' : c.text,
                                }}
                            >
                                Todo
                            </button>
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5"
                                    style={{
                                        backgroundColor: selectedCategory === cat.id ? c.primary : c.background,
                                        color: selectedCategory === cat.id ? '#fff' : c.text,
                                    }}
                                >
                                    {cat.icon && <span>{cat.icon}</span>}
                                    {extractName(cat.name)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Dietary Filters Banner */}
                {(dietaryPrefs.isVegetarian || dietaryPrefs.isVegan || dietaryPrefs.isCeliac || dietaryPrefs.allergies.length > 0) && (
                    <div className="mx-4 mt-4 p-3 rounded-xl flex items-center justify-between" style={{ backgroundColor: '#f0fdf4' }}>
                        <span className="text-sm font-medium text-green-700">
                            Filtrando:
                            {dietaryPrefs.isVegan && ' Vegano'}
                            {dietaryPrefs.isVegetarian && !dietaryPrefs.isVegan && ' Vegetariano'}
                            {dietaryPrefs.isCeliac && ' Sin gluten'}
                            {dietaryPrefs.allergies.length > 0 && ` · ${dietaryPrefs.allergies.length} alérgenos excluidos`}
                        </span>
                        <button
                            onClick={() => setDietaryPrefs({ isVegetarian: false, isVegan: false, isCeliac: false, allergies: [], allergyNotes: '', otherNotes: '' })}
                            className="text-sm font-bold text-green-700"
                        >
                            Limpiar
                        </button>
                    </div>
                )}

                {/* Daily Menus */}
                {dailyMenus.length > 0 && !selectedCategory && (
                    <div className="p-4">
                        <h2 className="font-bold text-lg mb-3" style={{ fontFamily: fonts?.heading ? `'${fonts.heading}', serif` : undefined }}>
                            🍽️ Menú del Día
                        </h2>
                        <div className="space-y-3">
                            {dailyMenus.map((menu) => (
                                <div
                                    key={menu.id}
                                    onClick={() => setSelectedDailyMenu(menu)}
                                    className="rounded-2xl p-4 border cursor-pointer hover:shadow-lg transition-shadow"
                                    style={{ backgroundColor: c.surface, borderColor: c.border }}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold">{menu.name}</h3>
                                        <div className="text-right">
                                            <span className="text-xl font-black" style={{ color: c.primary }}>€{menu.price}</span>
                                            {menu.original_price && (
                                                <span className="text-sm line-through ml-2" style={{ color: c.text_secondary }}>
                                                    €{menu.original_price}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {menu.description && <p className="text-sm mb-2" style={{ color: c.text_secondary }}>{menu.description}</p>}
                                    <div className="flex flex-wrap gap-2">
                                        {menu.includes_bread && <span className="text-xs">🍞 Pan</span>}
                                        {menu.includes_drink && <span className="text-xs">🥤 Bebida</span>}
                                        {menu.includes_dessert && <span className="text-xs">🍰 Postre</span>}
                                        {menu.includes_coffee && <span className="text-xs">☕ Café</span>}
                                    </div>
                                    <p className="text-xs font-bold mt-2" style={{ color: c.primary }}>
                                        Toca para elegir tus platos →
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Products */}
                <div className="p-4">
                    {categories.filter(cat => !selectedCategory || cat.id === selectedCategory).map((category) => {
                        const categoryProducts = filteredProducts.filter(p => p.category_id === category.id);
                        if (categoryProducts.length === 0) return null;

                        return (
                            <div key={category.id} className="mb-6">
                                <h2 className="font-bold text-lg mb-3 flex items-center gap-2"
                                    style={{ fontFamily: fonts?.heading ? `'${fonts.heading}', serif` : undefined }}
                                >
                                    {category.icon && <span>{category.icon}</span>}
                                    {extractName(category.name)}
                                </h2>
                                <div className="space-y-3">
                                    {categoryProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="rounded-2xl overflow-hidden border"
                                            style={{ backgroundColor: c.surface, borderColor: c.border }}
                                        >
                                            <div className="flex">
                                                {(config?.show_images !== false) && product.image_url && (
                                                    <div className="w-28 h-28 flex-shrink-0">
                                                        <img src={product.image_url} alt={extractName(product.name)} className="w-full h-full object-cover" />
                                                    </div>
                                                )}
                                                <div className="flex-1 p-3 flex flex-col justify-between">
                                                    <div
                                                        className="cursor-pointer"
                                                        onClick={() => hasExtras(product) ? setSelectedProduct(product) : undefined}
                                                    >
                                                        <div className="flex items-start gap-2 mb-1">
                                                            <h3 className="font-bold flex-1">{extractName(product.name)}</h3>
                                                            <div className="flex gap-1">
                                                                {product.dietary_tags?.includes('vegan') && <span title="Vegano">🌱</span>}
                                                                {product.dietary_tags?.includes('vegetarian') && !product.dietary_tags?.includes('vegan') && <span title="Vegetariano">🥬</span>}
                                                                {product.dietary_tags?.includes('gluten_free') && <span title="Sin gluten">🌾</span>}
                                                            </div>
                                                        </div>
                                                        {(config?.show_descriptions !== false) && extractDesc(product.description) && (
                                                            <p className="text-sm line-clamp-2" style={{ color: c.text_secondary }}>
                                                                {extractDesc(product.description)}
                                                            </p>
                                                        )}
                                                        {/* Show extras hint */}
                                                        {hasExtras(product) && (
                                                            <p className="text-xs flex items-center gap-1 mt-1" style={{ color: c.primary }}>
                                                                <ChevronDown size={12} />
                                                                Personalizar
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center justify-between mt-2">
                                                        {(config?.show_prices !== false) && (
                                                            <span className="font-black" style={{ color: c.primary }}>
                                                                €{product.price.toFixed(2)}
                                                            </span>
                                                        )}
                                                        {(() => {
                                                            const qty = cart.find(item => item.product.id === product.id)?.quantity || 0;
                                                            if (qty > 0) {
                                                                return (
                                                                    <div className="flex items-center gap-3 rounded-full px-2 py-1 text-white" style={{ backgroundColor: c.primary }}>
                                                                        <button onClick={() => removeFromCart(product.id)} className="p-1"><Minus size={14} /></button>
                                                                        <span className="font-bold min-w-[1.5rem] text-center">{qty}</span>
                                                                        <button onClick={() => hasExtras(product) ? setSelectedProduct(product) : addToCart(product)} className="p-1"><Plus size={14} /></button>
                                                                    </div>
                                                                );
                                                            }
                                                            return (
                                                                <button
                                                                    onClick={() => hasExtras(product) ? setSelectedProduct(product) : addToCart(product)}
                                                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                                                                    style={{ backgroundColor: c.primary }}
                                                                >
                                                                    <Plus size={18} />
                                                                </button>
                                                            );
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Cart Footer */}
                {cartCount > 0 && (
                    <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 p-4 z-50">
                        <button
                            onClick={() => setShowCart(true)}
                            className="w-full text-white py-4 rounded-2xl font-bold flex items-center justify-between px-6 shadow-xl"
                            style={{ backgroundColor: c.primary }}
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    <ShoppingCart size={16} />
                                </div>
                                <span>{cartCount} productos</span>
                            </div>
                            <span className="text-lg">€{cartTotal.toFixed(2)}</span>
                        </button>
                    </motion.div>
                )}

                {/* Modals */}
                <AnimatePresence>
                    {selectedProduct && (
                        <ProductDetailModal
                            product={selectedProduct}
                            designTheme={designTheme || null}
                            fallbackTheme={fallbackTheme}
                            onClose={() => setSelectedProduct(null)}
                            onAddToCart={(p, extras) => {
                                addToCart(p, extras);
                                setSelectedProduct(null);
                            }}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showCart && (
                        <CartModal
                            cart={cart}
                            theme={fallbackTheme}
                            dietaryPrefs={dietaryPrefs}
                            onClose={() => setShowCart(false)}
                            onCheckout={() => { setShowCart(false); setShowCheckout(true); }}
                            onAdd={(productId) => {
                                const item = cart.find(i => i.product.id === productId);
                                if (item) addToCart(item.product);
                            }}
                            onRemove={removeFromCart}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showDietaryModal && (
                        <DietaryModal
                            prefs={dietaryPrefs}
                            theme={fallbackTheme}
                            onUpdate={setDietaryPrefs}
                            onClose={() => setShowDietaryModal(false)}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {selectedDailyMenu && (
                        <DailyMenuModal
                            menu={selectedDailyMenu}
                            theme={fallbackTheme}
                            onClose={() => setSelectedDailyMenu(null)}
                            onAdd={() => setSelectedDailyMenu(null)}
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showCheckout && (
                        <CheckoutModal
                            cart={cart}
                            theme={fallbackTheme}
                            restaurant={restaurant}
                            tableNumber={tableNumber}
                            dietaryPrefs={dietaryPrefs}
                            onClose={() => setShowCheckout(false)}
                            onSuccess={() => { setCart([]); setShowCheckout(false); }}
                        />
                    )}
                </AnimatePresence>

                {/* Floating Waiter Call Button */}
                {tableNumber && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setShowWaiterCall(true)}
                        className="fixed bottom-24 right-4 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-xl flex items-center justify-center z-40"
                    >
                        <Bell size={24} />
                    </motion.button>
                )}
            </div>
        );
    }

    // ========================================================================
    // FALLBACK: Tailwind-based theme (no DB config)
    // ========================================================================

    const theme = fallbackTheme;

    return (
        <div className={`min-h-screen ${theme.background} pb-24`}>
            {/* Header */}
            <div className={`${theme.cardBg} sticky top-0 z-40 border-b ${theme.border}`}>
                <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        {restaurant.logo_url && (
                            <img src={restaurant.logo_url} alt={restaurant.name} className="w-12 h-12 rounded-xl object-cover" />
                        )}
                        <div>
                            <h1 className={`font-bold text-lg ${theme.text}`}>{restaurant.name}</h1>
                            {tableNumber && <span className={`text-sm ${theme.textSecondary}`}>Mesa {tableNumber}</span>}
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textSecondary}`} size={18} />
                            <input type="text" placeholder="Buscar platos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2.5 ${theme.accent} rounded-xl text-sm focus:outline-none ${theme.text}`} />
                        </div>
                        <button onClick={() => setShowDietaryModal(true)} className={`p-2.5 ${theme.accent} rounded-xl relative`}>
                            <Leaf size={20} className={dietaryPrefs.isVegetarian || dietaryPrefs.isVegan ? 'text-green-500' : theme.textSecondary} />
                        </button>
                    </div>
                </div>
                <div className="flex overflow-x-auto gap-2 px-4 pb-3 scrollbar-hide">
                    <button onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === null ? `${theme.primary} text-white` : `${theme.accent} ${theme.text}`}`}
                    >Todo</button>
                    {categories.map((cat) => (
                        <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${selectedCategory === cat.id ? `${theme.primary} text-white` : `${theme.accent} ${theme.text}`}`}
                        >
                            {cat.icon && <span>{cat.icon}</span>}
                            {extractName(cat.name)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products */}
            <div className="p-4">
                {categories.filter(cat => !selectedCategory || cat.id === selectedCategory).map((category) => {
                    const categoryProducts = filteredProducts.filter(p => p.category_id === category.id);
                    if (categoryProducts.length === 0) return null;
                    return (
                        <div key={category.id} className="mb-6">
                            <h2 className={`font-bold text-lg ${theme.text} mb-3 flex items-center gap-2`}>
                                {category.icon && <span>{category.icon}</span>}
                                {extractName(category.name)}
                            </h2>
                            <div className="space-y-3">
                                {categoryProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        theme={theme}
                                        onAdd={() => hasExtras(product) ? setSelectedProduct(product) : addToCart(product)}
                                        onSelect={() => hasExtras(product) ? setSelectedProduct(product) : undefined}
                                        quantity={cart.find(item => item.product.id === product.id)?.quantity || 0}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Cart Footer */}
            {cartCount > 0 && (
                <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 p-4 z-50">
                    <button onClick={() => setShowCart(true)}
                        className={`w-full ${theme.primary} text-white py-4 rounded-2xl font-bold flex items-center justify-between px-6 shadow-xl`}>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center"><ShoppingCart size={16} /></div>
                            <span>{cartCount} productos</span>
                        </div>
                        <span className="text-lg">€{cartTotal.toFixed(2)}</span>
                    </button>
                </motion.div>
            )}

            {/* Modals */}
            <AnimatePresence>
                {selectedProduct && (
                    <ProductDetailModal
                        product={selectedProduct}
                        designTheme={designTheme || null}
                        fallbackTheme={fallbackTheme}
                        onClose={() => setSelectedProduct(null)}
                        onAddToCart={(p, extras) => { addToCart(p, extras); setSelectedProduct(null); }}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showCart && (
                    <CartModal cart={cart} theme={theme} dietaryPrefs={dietaryPrefs}
                        onClose={() => setShowCart(false)}
                        onCheckout={() => { setShowCart(false); setShowCheckout(true); }}
                        onAdd={(productId) => { const item = cart.find(i => i.product.id === productId); if (item) addToCart(item.product); }}
                        onRemove={removeFromCart} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showDietaryModal && (
                    <DietaryModal prefs={dietaryPrefs} theme={theme} onUpdate={setDietaryPrefs} onClose={() => setShowDietaryModal(false)} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {selectedDailyMenu && (
                    <DailyMenuModal menu={selectedDailyMenu} theme={theme} onClose={() => setSelectedDailyMenu(null)} onAdd={() => setSelectedDailyMenu(null)} />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showCheckout && (
                    <CheckoutModal cart={cart} theme={theme} restaurant={restaurant} tableNumber={tableNumber} dietaryPrefs={dietaryPrefs}
                        onClose={() => setShowCheckout(false)} onSuccess={() => { setCart([]); setShowCheckout(false); }} />
                )}
            </AnimatePresence>

            {tableNumber && (
                <motion.button initial={{ scale: 0 }} animate={{ scale: 1 }} whileTap={{ scale: 0.9 }}
                    onClick={() => setShowWaiterCall(true)}
                    className="fixed bottom-24 right-4 w-14 h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-xl flex items-center justify-center z-40">
                    <Bell size={24} />
                </motion.button>
            )}
        </div>
    );
}
