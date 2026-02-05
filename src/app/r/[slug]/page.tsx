"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    ShoppingCart,
    X,
    Plus,
    Minus,
    Search,
    Leaf,
    Wheat,
    AlertTriangle,
    Clock,
    Euro,
    ChevronDown,
    ChevronUp,
    Check,
    Heart,
    Info,
    MessageSquare,
    User,
    Phone,
    Utensils,
    Bell,
    Loader2,
} from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import WaiterCallModal from "@/components/WaiterCallModal";

interface Product {
    id: string;
    name_es: string;
    description_es: string | null;
    price: number;
    compare_price: number | null;
    image_url: string | null;
    is_vegetarian: boolean;
    is_vegan: boolean;
    is_gluten_free: boolean;
    allergens: string[];
    category_id: string;
}

interface Category {
    id: string;
    name_es: string;
    icon: string | null;
    sort_order: number;
}

interface DailyMenu {
    id: string;
    name: string;
    description: string | null;
    price: number;
    original_price: number | null;
    courses: any[];
    includes_drink: boolean;
    includes_bread: boolean;
    includes_dessert: boolean;
    includes_coffee: boolean;
}

interface CartItem {
    product: Product;
    quantity: number;
    notes?: string;
    selectedModifiers?: any[];
}

interface DietaryPreferences {
    isVegetarian: boolean;
    isVegan: boolean;
    isCeliac: boolean;
    allergies: string[];
    allergyNotes: string;
    otherNotes: string;
}

// Theme configurations
const themes: Record<string, {
    background: string;
    cardBg: string;
    text: string;
    textSecondary: string;
    primary: string;
    primaryText: string;
    accent: string;
    border: string;
}> = {
    classic: {
        background: 'bg-gray-50',
        cardBg: 'bg-white',
        text: 'text-gray-900',
        textSecondary: 'text-gray-500',
        primary: 'bg-emerald-500',
        primaryText: 'text-emerald-500',
        accent: 'bg-emerald-50',
        border: 'border-gray-100',
    },
    midnight: {
        background: 'bg-slate-950',
        cardBg: 'bg-slate-900',
        text: 'text-white',
        textSecondary: 'text-slate-400',
        primary: 'bg-amber-500',
        primaryText: 'text-amber-500',
        accent: 'bg-amber-500/10',
        border: 'border-slate-800',
    },
    neon: {
        background: 'bg-zinc-950',
        cardBg: 'bg-zinc-900',
        text: 'text-white',
        textSecondary: 'text-zinc-400',
        primary: 'bg-pink-500',
        primaryText: 'text-pink-500',
        accent: 'bg-pink-500/10',
        border: 'border-zinc-800',
    },
    ocean: {
        background: 'bg-teal-50',
        cardBg: 'bg-white',
        text: 'text-teal-900',
        textSecondary: 'text-teal-600',
        primary: 'bg-cyan-500',
        primaryText: 'text-cyan-600',
        accent: 'bg-cyan-50',
        border: 'border-teal-100',
    },
    minimal: {
        background: 'bg-white',
        cardBg: 'bg-gray-50',
        text: 'text-gray-900',
        textSecondary: 'text-gray-500',
        primary: 'bg-black',
        primaryText: 'text-black',
        accent: 'bg-gray-100',
        border: 'border-gray-200',
    },
};

const allergensList = [
    { id: 'gluten', name: 'Gluten', emoji: '🌾' },
    { id: 'lactose', name: 'Lácteos', emoji: '🥛' },
    { id: 'eggs', name: 'Huevos', emoji: '🥚' },
    { id: 'fish', name: 'Pescado', emoji: '🐟' },
    { id: 'shellfish', name: 'Mariscos', emoji: '🦐' },
    { id: 'nuts', name: 'Frutos secos', emoji: '🥜' },
    { id: 'peanuts', name: 'Cacahuetes', emoji: '🥜' },
    { id: 'soy', name: 'Soja', emoji: '🫘' },
    { id: 'sesame', name: 'Sésamo', emoji: '🌰' },
    { id: 'celery', name: 'Apio', emoji: '🥬' },
    { id: 'mustard', name: 'Mostaza', emoji: '🟡' },
    { id: 'sulfites', name: 'Sulfitos', emoji: '🍷' },
];

export default function PublicMenuPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug as string;
    const tableNumber = searchParams.get('table');

    const [loading, setLoading] = useState(true);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [dailyMenus, setDailyMenus] = useState<DailyMenu[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);
    const [showDietaryModal, setShowDietaryModal] = useState(false);
    const [showCheckout, setShowCheckout] = useState(false);
    const [showWaiterCall, setShowWaiterCall] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [selectedDailyMenu, setSelectedDailyMenu] = useState<DailyMenu | null>(null);

    const [dietaryPrefs, setDietaryPrefs] = useState<DietaryPreferences>({
        isVegetarian: false,
        isVegan: false,
        isCeliac: false,
        allergies: [],
        allergyNotes: '',
        otherNotes: '',
    });

    const supabase = createClient();

    useEffect(() => {
        loadRestaurantData();
    }, [slug]);

    const loadRestaurantData = async () => {
        try {
            const { data: restaurantData } = await supabase
                .from("restaurants")
                .select("*")
                .eq("slug", slug)
                .single();

            if (!restaurantData) {
                setLoading(false);
                return;
            }
            setRestaurant(restaurantData);

            const { data: categoriesData } = await supabase
                .from("categories")
                .select("*")
                .eq("restaurant_id", restaurantData.id)
                .eq("is_active", true)
                .order("sort_order");

            setCategories(categoriesData || []);

            const { data: productsData } = await supabase
                .from("products")
                .select("*")
                .eq("restaurant_id", restaurantData.id)
                .eq("is_available", true)
                .order("sort_order");

            setProducts(productsData || []);

            const { data: dailyMenusData } = await supabase
                .from("daily_menus")
                .select("*")
                .eq("restaurant_id", restaurantData.id)
                .eq("is_active", true);

            setDailyMenus(dailyMenusData || []);
        } catch (err) {
            console.error("Error loading restaurant:", err);
        } finally {
            setLoading(false);
        }
    };

    const previewThemeId = searchParams.get('preview_theme');
    const activeThemeId = previewThemeId || restaurant?.theme_id;
    const theme = themes[activeThemeId] || themes.classic;

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
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

    const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const filteredProducts = products.filter(product => {
        if (selectedCategory && product.category_id !== selectedCategory) return false;
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return product.name_es.toLowerCase().includes(query) ||
                product.description_es?.toLowerCase().includes(query);
        }
        // Filter by dietary preferences
        if (dietaryPrefs.isVegetarian && !product.is_vegetarian && !product.is_vegan) return false;
        if (dietaryPrefs.isVegan && !product.is_vegan) return false;
        if (dietaryPrefs.isCeliac && !product.is_gluten_free) return false;
        if (dietaryPrefs.allergies.length > 0) {
            const hasAllergen = dietaryPrefs.allergies.some(a => product.allergens?.includes(a));
            if (hasAllergen) return false;
        }
        return true;
    });

    const toggleAllergen = (allergenId: string) => {
        setDietaryPrefs(prev => ({
            ...prev,
            allergies: prev.allergies.includes(allergenId)
                ? prev.allergies.filter(a => a !== allergenId)
                : [...prev.allergies, allergenId]
        }));
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${theme.background} flex items-center justify-center`}>
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-8 h-8 border-2 border-t-transparent border-emerald-500 rounded-full"
                />
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Restaurante no encontrado</h1>
                    <p className="text-gray-500">El menú que buscas no existe</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${theme.background} pb-24`}>
            {/* Header */}
            <div className={`${theme.cardBg} sticky top-0 z-40 border-b ${theme.border}`}>
                {/* Restaurant Header */}
                <div className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                        {restaurant.logo_url && (
                            <img
                                src={restaurant.logo_url}
                                alt={restaurant.name}
                                className="w-12 h-12 rounded-xl object-cover"
                            />
                        )}
                        <div>
                            <h1 className={`font-bold text-lg ${theme.text}`}>{restaurant.name}</h1>
                            {tableNumber && (
                                <span className={`text-sm ${theme.textSecondary}`}>
                                    Mesa {tableNumber}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textSecondary}`} size={18} />
                            <input
                                type="text"
                                placeholder="Buscar platos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`w-full pl-10 pr-4 py-2.5 ${theme.accent} rounded-xl text-sm focus:outline-none ${theme.text}`}
                            />
                        </div>
                        <button
                            onClick={() => setShowDietaryModal(true)}
                            className={`p-2.5 ${theme.accent} rounded-xl relative`}
                        >
                            <Leaf size={20} className={dietaryPrefs.isVegetarian || dietaryPrefs.isVegan ? 'text-green-500' : theme.textSecondary} />
                            {(dietaryPrefs.isVegetarian || dietaryPrefs.isVegan || dietaryPrefs.isCeliac || dietaryPrefs.allergies.length > 0) && (
                                <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex overflow-x-auto gap-2 px-4 pb-3 scrollbar-hide">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === null
                            ? `${theme.primary} text-white`
                            : `${theme.accent} ${theme.text}`
                            }`}
                    >
                        Todo
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${selectedCategory === cat.id
                                ? `${theme.primary} text-white`
                                : `${theme.accent} ${theme.text}`
                                }`}
                        >
                            {cat.icon && <span>{cat.icon}</span>}
                            {cat.name_es}
                        </button>
                    ))}
                </div>
            </div>

            {/* Dietary Filters Banner */}
            {(dietaryPrefs.isVegetarian || dietaryPrefs.isVegan || dietaryPrefs.isCeliac || dietaryPrefs.allergies.length > 0) && (
                <div className={`mx-4 mt-4 p-3 ${theme.accent} rounded-xl flex items-center justify-between`}>
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-green-700">
                            Filtrando:
                            {dietaryPrefs.isVegan && ' Vegano'}
                            {dietaryPrefs.isVegetarian && !dietaryPrefs.isVegan && ' Vegetariano'}
                            {dietaryPrefs.isCeliac && ' Sin gluten'}
                            {dietaryPrefs.allergies.length > 0 && ` · ${dietaryPrefs.allergies.length} alérgenos excluidos`}
                        </span>
                    </div>
                    <button
                        onClick={() => setDietaryPrefs({
                            isVegetarian: false,
                            isVegan: false,
                            isCeliac: false,
                            allergies: [],
                            allergyNotes: '',
                            otherNotes: '',
                        })}
                        className="text-sm font-bold text-green-700"
                    >
                        Limpiar
                    </button>
                </div>
            )}

            {/* Daily Menus */}
            {dailyMenus.length > 0 && !selectedCategory && (
                <div className="p-4">
                    <h2 className={`font-bold text-lg ${theme.text} mb-3`}>🍽️ Menú del Día</h2>
                    <div className="space-y-3">
                        {dailyMenus.map((menu) => (
                            <motion.div
                                key={menu.id}
                                onClick={() => setSelectedDailyMenu(menu)}
                                className={`${theme.cardBg} rounded-2xl p-4 border ${theme.border} cursor-pointer hover:shadow-lg transition-shadow`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`font-bold ${theme.text}`}>{menu.name}</h3>
                                    <div className="text-right">
                                        <span className={`text-xl font-black ${theme.primaryText}`}>€{menu.price}</span>
                                        {menu.original_price && (
                                            <span className={`text-sm ${theme.textSecondary} line-through ml-2`}>
                                                €{menu.original_price}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {menu.description && (
                                    <p className={`text-sm ${theme.textSecondary} mb-2`}>{menu.description}</p>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    {menu.includes_bread && <span className="text-xs">🍞 Pan</span>}
                                    {menu.includes_drink && <span className="text-xs">🥤 Bebida</span>}
                                    {menu.includes_dessert && <span className="text-xs">🍰 Postre</span>}
                                    {menu.includes_coffee && <span className="text-xs">☕ Café</span>}
                                </div>
                                <p className={`text-xs ${theme.primaryText} font-bold mt-2`}>
                                    Toca para elegir tus platos →
                                </p>
                            </motion.div>
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
                            <h2 className={`font-bold text-lg ${theme.text} mb-3 flex items-center gap-2`}>
                                {category.icon && <span>{category.icon}</span>}
                                {category.name_es}
                            </h2>
                            <div className="space-y-3">
                                {categoryProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        theme={theme}
                                        onAdd={() => addToCart(product)}
                                        onSelect={() => setSelectedProduct(product)}
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
                <motion.div
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    className="fixed bottom-0 left-0 right-0 p-4 z-50"
                >
                    <button
                        onClick={() => setShowCart(true)}
                        className={`w-full ${theme.primary} text-white py-4 rounded-2xl font-bold flex items-center justify-between px-6 shadow-xl`}
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

            {/* Cart Modal */}
            <AnimatePresence>
                {showCart && (
                    <CartModal
                        cart={cart}
                        theme={theme}
                        dietaryPrefs={dietaryPrefs}
                        onClose={() => setShowCart(false)}
                        onCheckout={() => {
                            setShowCart(false);
                            setShowCheckout(true);
                        }}
                        onAdd={(productId) => {
                            const item = cart.find(i => i.product.id === productId);
                            if (item) addToCart(item.product);
                        }}
                        onRemove={removeFromCart}
                    />
                )}
            </AnimatePresence>

            {/* Dietary Preferences Modal */}
            <AnimatePresence>
                {showDietaryModal && (
                    <DietaryModal
                        prefs={dietaryPrefs}
                        theme={theme}
                        onUpdate={setDietaryPrefs}
                        onClose={() => setShowDietaryModal(false)}
                    />
                )}
            </AnimatePresence>

            {/* Daily Menu Selection Modal */}
            <AnimatePresence>
                {selectedDailyMenu && (
                    <DailyMenuModal
                        menu={selectedDailyMenu}
                        theme={theme}
                        onClose={() => setSelectedDailyMenu(null)}
                        onAdd={(selections) => {
                            // Add daily menu to cart with selections
                            console.log('Daily menu selections:', selections);
                            setSelectedDailyMenu(null);
                        }}
                    />
                )}
            </AnimatePresence>

            {/* Waiter Call Modal */}
            <AnimatePresence>
                {showWaiterCall && restaurant && (
                    <WaiterCallModal
                        isOpen={showWaiterCall}
                        onClose={() => setShowWaiterCall(false)}
                        restaurantId={restaurant.id}
                        tableNumber={tableNumber ? parseInt(tableNumber) : null}
                        theme={theme}
                    />
                )}
            </AnimatePresence>

            {/* Checkout Modal */}
            <AnimatePresence>
                {showCheckout && (
                    <CheckoutModal
                        cart={cart}
                        theme={theme}
                        restaurant={restaurant}
                        tableNumber={tableNumber}
                        dietaryPrefs={dietaryPrefs}
                        onClose={() => setShowCheckout(false)}
                        onSuccess={() => {
                            setCart([]);
                            setShowCheckout(false);
                        }}
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

// Product Card Component
function ProductCard({
    product,
    theme,
    onAdd,
    onSelect,
    quantity,
}: {
    product: Product;
    theme: any;
    onAdd: () => void;
    onSelect: () => void;
    quantity: number;
}) {
    return (
        <motion.div
            layout
            className={`${theme.cardBg} rounded-2xl overflow-hidden border ${theme.border}`}
        >
            <div className="flex">
                {product.image_url && (
                    <div className="w-28 h-28 flex-shrink-0">
                        <img
                            src={product.image_url}
                            alt={product.name_es}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <div className="flex-1 p-3 flex flex-col justify-between">
                    <div onClick={onSelect} className="cursor-pointer">
                        <div className="flex items-start gap-2 mb-1">
                            <h3 className={`font-bold ${theme.text} flex-1`}>{product.name_es}</h3>
                            {/* Dietary icons */}
                            <div className="flex gap-1">
                                {product.is_vegan && <span title="Vegano">🌱</span>}
                                {product.is_vegetarian && !product.is_vegan && <span title="Vegetariano">🥬</span>}
                                {product.is_gluten_free && <span title="Sin gluten">🌾</span>}
                            </div>
                        </div>
                        {product.description_es && (
                            <p className={`text-sm ${theme.textSecondary} line-clamp-2`}>
                                {product.description_es}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                        <div>
                            <span className={`font-black ${theme.primaryText}`}>€{product.price}</span>
                            {product.compare_price && (
                                <span className={`text-sm ${theme.textSecondary} line-through ml-2`}>
                                    €{product.compare_price}
                                </span>
                            )}
                        </div>
                        {quantity > 0 ? (
                            <div className={`flex items-center gap-3 ${theme.primary} text-white rounded-full px-2 py-1`}>
                                <button onClick={(e) => { e.stopPropagation(); }} className="p-1">
                                    <Minus size={14} />
                                </button>
                                <span className="font-bold min-w-[1.5rem] text-center">{quantity}</span>
                                <button onClick={(e) => { e.stopPropagation(); onAdd(); }} className="p-1">
                                    <Plus size={14} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); onAdd(); }}
                                className={`${theme.primary} text-white w-8 h-8 rounded-full flex items-center justify-center`}
                            >
                                <Plus size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

// Cart Modal
function CartModal({
    cart,
    theme,
    dietaryPrefs,
    onClose,
    onCheckout,
    onAdd,
    onRemove,
}: {
    cart: CartItem[];
    theme: any;
    dietaryPrefs: DietaryPreferences;
    onClose: () => void;
    onCheckout: () => void;
    onAdd: (productId: string) => void;
    onRemove: (productId: string) => void;
}) {
    const [customerNotes, setCustomerNotes] = useState('');
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                onClick={(e) => e.stopPropagation()}
                className={`absolute bottom-0 left-0 right-0 ${theme.cardBg} rounded-t-3xl max-h-[85vh] flex flex-col`}
            >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className={`font-bold text-xl ${theme.text}`}>Tu pedido</h2>
                    <button onClick={onClose} className="p-2">
                        <X size={20} className={theme.textSecondary} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-3">
                        {cart.map((item) => (
                            <div key={item.product.id} className={`flex items-center gap-3 p-3 ${theme.accent} rounded-xl`}>
                                {item.product.image_url && (
                                    <img
                                        src={item.product.image_url}
                                        alt=""
                                        className="w-14 h-14 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex-1">
                                    <h4 className={`font-bold ${theme.text}`}>{item.product.name_es}</h4>
                                    <span className={theme.primaryText}>€{(item.product.price * item.quantity).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onRemove(item.product.id)}
                                        className={`w-8 h-8 ${theme.cardBg} rounded-full flex items-center justify-center`}
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className={`font-bold ${theme.text}`}>{item.quantity}</span>
                                    <button
                                        onClick={() => onAdd(item.product.id)}
                                        className={`w-8 h-8 ${theme.primary} text-white rounded-full flex items-center justify-center`}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Dietary preferences summary */}
                    {(dietaryPrefs.isVegetarian || dietaryPrefs.isVegan || dietaryPrefs.allergies.length > 0 || dietaryPrefs.otherNotes) && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                                <AlertTriangle size={16} />
                                Preferencias dietéticas
                            </h4>
                            {dietaryPrefs.isVegan && <p className="text-sm text-yellow-700">🌱 Vegano</p>}
                            {dietaryPrefs.isVegetarian && !dietaryPrefs.isVegan && <p className="text-sm text-yellow-700">🥬 Vegetariano</p>}
                            {dietaryPrefs.isCeliac && <p className="text-sm text-yellow-700">🌾 Sin gluten (celiaco)</p>}
                            {dietaryPrefs.allergies.length > 0 && (
                                <p className="text-sm text-yellow-700">
                                    ⚠️ Alergias: {dietaryPrefs.allergies.map((a: string) => {
                                        const allergen = allergensList.find(al => al.id === a);
                                        return allergen ? allergen.name : a;
                                    }).join(', ')}
                                </p>
                            )}
                            {dietaryPrefs.allergyNotes && (
                                <p className="text-sm text-yellow-700">📝 {dietaryPrefs.allergyNotes}</p>
                            )}
                        </div>
                    )}

                    {/* Customer notes */}
                    <div className="mt-4">
                        <label className={`block text-sm font-bold ${theme.text} mb-2`}>
                            Notas adicionales
                        </label>
                        <textarea
                            value={customerNotes}
                            onChange={(e) => setCustomerNotes(e.target.value)}
                            placeholder="Ej: Sin cebolla, poco hecho, mesa junto a la ventana..."
                            rows={2}
                            className={`w-full p-3 ${theme.accent} rounded-xl text-sm resize-none focus:outline-none ${theme.text}`}
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <span className={`font-bold ${theme.text}`}>Total</span>
                        <span className={`text-2xl font-black ${theme.primaryText}`}>€{total.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={onCheckout}
                        className={`w-full ${theme.primary} text-white py-4 rounded-2xl font-bold`}
                    >
                        Confirmar Pedido
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Dietary Modal
function DietaryModal({
    prefs,
    theme,
    onUpdate,
    onClose,
}: {
    prefs: DietaryPreferences;
    theme: any;
    onUpdate: (prefs: DietaryPreferences) => void;
    onClose: () => void;
}) {
    const [local, setLocal] = useState(prefs);

    const toggleAllergen = (id: string) => {
        setLocal(prev => ({
            ...prev,
            allergies: prev.allergies.includes(id)
                ? prev.allergies.filter(a => a !== id)
                : [...prev.allergies, id]
        }));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                onClick={(e) => e.stopPropagation()}
                className={`${theme.cardBg} w-full rounded-t-3xl max-h-[85vh] overflow-y-auto`}
            >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-inherit">
                    <h2 className={`font-bold text-xl ${theme.text}`}>Preferencias Dietéticas</h2>
                    <button onClick={onClose} className="p-2">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    {/* Diet Type */}
                    <div>
                        <h3 className={`font-bold ${theme.text} mb-3`}>Tipo de dieta</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { key: 'isVegetarian', label: 'Vegetariano', icon: '🥬' },
                                { key: 'isVegan', label: 'Vegano', icon: '🌱' },
                                { key: 'isCeliac', label: 'Sin Gluten', icon: '🌾' },
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => setLocal(prev => ({ ...prev, [item.key]: !prev[item.key as keyof DietaryPreferences] }))}
                                    className={`p-3 rounded-xl border-2 text-center transition-all ${local[item.key as keyof DietaryPreferences]
                                        ? 'border-green-500 bg-green-50'
                                        : `border-gray-200 ${theme.cardBg}`
                                        }`}
                                >
                                    <span className="text-2xl block mb-1">{item.icon}</span>
                                    <span className={`text-xs font-medium ${theme.text}`}>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Allergens */}
                    <div>
                        <h3 className={`font-bold ${theme.text} mb-3`}>Alergias e intolerancias</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {allergensList.map((allergen) => (
                                <button
                                    key={allergen.id}
                                    onClick={() => toggleAllergen(allergen.id)}
                                    className={`p-2 rounded-xl border-2 text-center transition-all ${local.allergies.includes(allergen.id)
                                        ? 'border-red-500 bg-red-50'
                                        : `border-gray-200 ${theme.cardBg}`
                                        }`}
                                >
                                    <span className="text-xl block">{allergen.emoji}</span>
                                    <span className={`text-[10px] ${theme.text}`}>{allergen.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <h3 className={`font-bold ${theme.text} mb-3`}>Notas adicionales sobre alergias</h3>
                        <textarea
                            value={local.allergyNotes}
                            onChange={(e) => setLocal(prev => ({ ...prev, allergyNotes: e.target.value }))}
                            placeholder="Describe cualquier alergia o intolerancia específica..."
                            rows={3}
                            className={`w-full p-3 ${theme.accent} rounded-xl text-sm resize-none focus:outline-none ${theme.text}`}
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 sticky bottom-0 bg-inherit">
                    <button
                        onClick={() => {
                            onUpdate(local);
                            onClose();
                        }}
                        className={`w-full ${theme.primary} text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2`}
                    >
                        <Check size={20} />
                        Guardar preferencias
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Daily Menu Modal
function DailyMenuModal({
    menu,
    theme,
    onClose,
    onAdd,
}: {
    menu: DailyMenu;
    theme: any;
    onClose: () => void;
    onAdd: (selections: any) => void;
}) {
    const [selections, setSelections] = useState<Record<string, string>>({});

    const allSelected = menu.courses.every(course =>
        !course.required || selections[course.id]
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                onClick={(e) => e.stopPropagation()}
                className={`${theme.cardBg} w-full rounded-t-3xl max-h-[90vh] overflow-y-auto`}
            >
                <div className="p-4 border-b border-gray-100 sticky top-0 bg-inherit z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className={`font-bold text-xl ${theme.text}`}>{menu.name}</h2>
                            <span className={`text-2xl font-black ${theme.primaryText}`}>€{menu.price}</span>
                        </div>
                        <button onClick={onClose} className="p-2">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-6">
                    {menu.courses.map((course, courseIndex) => (
                        <div key={course.id}>
                            <h3 className={`font-bold ${theme.text} mb-3 flex items-center gap-2`}>
                                <span className="text-lg">
                                    {courseIndex === 0 ? '1️⃣' : courseIndex === 1 ? '2️⃣' : '3️⃣'}
                                </span>
                                {course.name}
                                {course.required && <span className="text-red-500">*</span>}
                            </h3>
                            <div className="space-y-2">
                                {course.options.map((option: any) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setSelections(prev => ({ ...prev, [course.id]: option.id }))}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center ${selections[course.id] === option.id
                                            ? `border-green-500 bg-green-50`
                                            : `border-gray-200 ${theme.cardBg}`
                                            }`}
                                    >
                                        <span className={`font-medium ${theme.text}`}>{option.name}</span>
                                        <div className="flex items-center gap-2">
                                            {option.extra_price && (
                                                <span className={`text-sm ${theme.primaryText} font-bold`}>
                                                    +€{option.extra_price}
                                                </span>
                                            )}
                                            {selections[course.id] === option.id && (
                                                <Check size={20} className="text-green-500" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Includes */}
                    <div className={`${theme.accent} rounded-xl p-4`}>
                        <p className={`text-sm font-bold ${theme.text} mb-2`}>Incluye:</p>
                        <div className="flex flex-wrap gap-2">
                            {menu.includes_bread && <span className="text-sm">🍞 Pan</span>}
                            {menu.includes_drink && <span className="text-sm">🥤 Bebida</span>}
                            {menu.includes_dessert && <span className="text-sm">🍰 Postre</span>}
                            {menu.includes_coffee && <span className="text-sm">☕ Café</span>}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 sticky bottom-0 bg-inherit">
                    <button
                        onClick={() => onAdd(selections)}
                        disabled={!allSelected}
                        className={`w-full ${theme.primary} text-white py-4 rounded-2xl font-bold disabled:opacity-50`}
                    >
                        Añadir al pedido · €{menu.price}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

// Checkout Modal
function CheckoutModal({
    cart,
    theme,
    restaurant,
    tableNumber,
    dietaryPrefs,
    onClose,
    onSuccess,
}: {
    cart: CartItem[];
    theme: any;
    restaurant: any;
    tableNumber: string | null;
    dietaryPrefs: DietaryPreferences;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [step, setStep] = useState<'details' | 'confirm' | 'success'>('details');
    const [sending, setSending] = useState(false);
    const [customerData, setCustomerData] = useState({
        name: '',
        phone: '',
        email: '',
        notes: '',
    });

    const supabase = createClient();

    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const handleSubmit = async () => {
        if (!customerData.name) return;

        setSending(true);

        try {
            // Create order
            const { data: order, error } = await supabase
                .from('orders')
                .insert({
                    restaurant_id: restaurant.id,
                    table_number: tableNumber ? parseInt(tableNumber) : null,
                    order_type: tableNumber ? 'dine_in' : 'takeaway',
                    status: 'pending',
                    customer_name: customerData.name,
                    customer_phone: customerData.phone || null,
                    customer_email: customerData.email || null,
                    subtotal: total,
                    total: total,
                    notes: customerData.notes || null,
                    dietary_notes: dietaryPrefs.allergyNotes || null,
                })
                .select()
                .single();

            if (error) throw error;

            // Create order items
            const orderItems = cart.map(item => ({
                order_id: order.id,
                product_id: item.product.id,
                product_name: item.product.name_es,
                quantity: item.quantity,
                unit_price: item.product.price,
                subtotal: item.product.price * item.quantity,
                notes: item.notes || null,
            }));

            await supabase.from('order_items').insert(orderItems);

            setStep('success');
            setTimeout(() => {
                onSuccess();
            }, 3000);
        } catch (error) {
            console.error('Error creating order:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-lg ${theme.cardBg} rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden`}
            >
                {step === 'success' ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                        >
                            <Check className="text-green-600" size={48} />
                        </motion.div>
                        <h2 className={`text-2xl font-black ${theme.text} mb-2`}>¡Pedido Enviado!</h2>
                        <p className={`${theme.textSecondary} text-center mb-4`}>
                            Tu pedido ha sido recibido y está siendo preparado
                        </p>
                        <div className={`${theme.accent} rounded-xl p-4 text-center w-full`}>
                            <p className={`text-sm ${theme.textSecondary}`}>Total del pedido</p>
                            <p className={`text-3xl font-black ${theme.primaryText}`}>€{total.toFixed(2)}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className={`p-4 border-b ${theme.border} flex items-center justify-between`}>
                            <div>
                                <h2 className={`font-bold text-xl ${theme.text}`}>Finalizar Pedido</h2>
                                <p className={`text-sm ${theme.textSecondary}`}>{cart.length} productos</p>
                            </div>
                            <button onClick={onClose} className="p-2">
                                <X size={20} className={theme.textSecondary} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Order Summary */}
                            <div className={`${theme.accent} rounded-xl p-4`}>
                                <h3 className={`font-bold ${theme.text} mb-3`}>Tu Pedido</h3>
                                <div className="space-y-2">
                                    {cart.map((item) => (
                                        <div key={item.product.id} className="flex justify-between">
                                            <span className={theme.text}>
                                                {item.quantity}x {item.product.name_es}
                                            </span>
                                            <span className={`font-bold ${theme.text}`}>
                                                €{(item.product.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                    <div className={`flex justify-between pt-2 border-t ${theme.border}`}>
                                        <span className={`font-bold ${theme.text}`}>Total</span>
                                        <span className={`text-xl font-black ${theme.primaryText}`}>€{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Details */}
                            <div>
                                <h3 className={`font-bold ${theme.text} mb-3`}>Tus Datos</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className={`block text-sm font-medium ${theme.text} mb-1`}>
                                            Nombre <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={customerData.name}
                                            onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Tu nombre"
                                            className={`w-full px-4 py-3 ${theme.accent} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 ${theme.text}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium ${theme.text} mb-1`}>
                                            Teléfono (opcional)
                                        </label>
                                        <input
                                            type="tel"
                                            value={customerData.phone}
                                            onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="Para avisarte cuando esté listo"
                                            className={`w-full px-4 py-3 ${theme.accent} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 ${theme.text}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium ${theme.text} mb-1`}>
                                            Notas del pedido (opcional)
                                        </label>
                                        <textarea
                                            value={customerData.notes}
                                            onChange={(e) => setCustomerData(prev => ({ ...prev, notes: e.target.value }))}
                                            placeholder="Ej: Sin cebolla, poco hecho..."
                                            rows={2}
                                            className={`w-full px-4 py-3 ${theme.accent} rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500/20 ${theme.text}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Table Number */}
                            {tableNumber && (
                                <div className={`${theme.accent} rounded-xl p-4 flex items-center gap-3`}>
                                    <div className={`w-10 h-10 ${theme.primary} rounded-xl flex items-center justify-center`}>
                                        <Utensils size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className={`font-bold ${theme.text}`}>Mesa {tableNumber}</p>
                                        <p className={`text-sm ${theme.textSecondary}`}>Tu pedido llegará directamente a tu mesa</p>
                                    </div>
                                </div>
                            )}

                            {/* Dietary Notes */}
                            {(dietaryPrefs.isVegetarian || dietaryPrefs.isVegan || dietaryPrefs.allergies.length > 0) && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle size={18} className="text-yellow-600 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-yellow-800 mb-1">Preferencias dietéticas</p>
                                            <p className="text-sm text-yellow-700">
                                                {dietaryPrefs.isVegan && '🌱 Vegano '}
                                                {dietaryPrefs.isVegetarian && !dietaryPrefs.isVegan && '🥬 Vegetariano '}
                                                {dietaryPrefs.isCeliac && '🌾 Sin gluten '}
                                                {dietaryPrefs.allergies.length > 0 && `· ${dietaryPrefs.allergies.length} alérgenos excluidos`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className={`p-4 border-t ${theme.border}`}>
                            <button
                                onClick={handleSubmit}
                                disabled={!customerData.name || sending}
                                className={`w-full ${theme.primary} text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50`}
                            >
                                {sending ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <Check size={20} />
                                        Confirmar Pedido · €{total.toFixed(2)}
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}
