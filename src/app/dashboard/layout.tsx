"use client";

import { useState, useEffect, createContext, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    LayoutDashboard,
    UtensilsCrossed,
    ClipboardList,
    Armchair,
    Bell,
    Users,
    BarChart3,
    Megaphone,
    UserCog,
    Settings,
    HelpCircle,
    LogOut,
    ChevronDown,
    ChevronRight,
    ChevronLeft,
    Menu as MenuIcon,
    X,
    Sparkles,
    ChefHat,
    History,
    QrCode,
    Map,
    Gift,
    Ticket,
    Send,
    Store,
    CreditCard,
    Truck,
    Clock,
    Palette,
    Languages,
    Plug,
    Receipt,
    Tag,
    Layers,
    PanelLeftClose,
    PanelLeft,
    BookOpen,
    Euro,
    Calendar, CalendarPlus,
} from "lucide-react";

// Sidebar Context
interface SidebarContextType {
    isCollapsed: boolean;
    setIsCollapsed: (value: boolean) => void;
    isMobileOpen: boolean;
    setIsMobileOpen: (value: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
    isCollapsed: false,
    setIsCollapsed: () => { },
    isMobileOpen: false,
    setIsMobileOpen: () => { },
});

export const useSidebar = () => useContext(SidebarContext);

interface NavItem {
    label: string;
    href?: string;
    icon: any;
    badge?: number;
    children?: { label: string; href: string; icon?: any }[];
    requiresPro?: boolean;
}

const navigation: NavItem[] = [
    // INICIO
    { label: "Inicio", href: "/dashboard", icon: LayoutDashboard },

    // MI MENÚ
    {
        label: "Mi Menú",
        icon: UtensilsCrossed,
        children: [
            { label: "Vista General", href: "/dashboard/menu", icon: UtensilsCrossed },
            { label: "Categorías", href: "/dashboard/menu/categories", icon: Layers },
            { label: "Productos", href: "/dashboard/menu/products", icon: UtensilsCrossed },
            { label: "Cartas", href: "/dashboard/menu/menus", icon: BookOpen },
            { label: "Menús del Día", href: "/dashboard/menu/daily-menus", icon: ChefHat },
            { label: "Modificadores", href: "/dashboard/menu/modifiers", icon: Tag },
            { label: "Diseño y Tema", href: "/dashboard/settings/theme", icon: Palette },
            { label: "Importar Menú", href: "/dashboard/menu/import", icon: Sparkles },
        ],
    },

    // PEDIDOS
    {
        label: "Pedidos",
        icon: ClipboardList,
        badge: 0,
        children: [
            { label: "Todos los pedidos", href: "/dashboard/orders", icon: ClipboardList },
            { label: "Vista Cocina", href: "/dashboard/orders/kitchen", icon: ChefHat },
            { label: "Historial", href: "/dashboard/orders/history", icon: History },
        ],
    },

    // RESERVAS
    {
        label: "Reservas",
        icon: Calendar,
        children: [
            { label: "Calendario", href: "/dashboard/reservations", icon: Calendar },
            { label: "Nueva reserva", href: "/dashboard/reservations/new", icon: CalendarPlus },
            { label: "Configuración", href: "/dashboard/reservations/settings", icon: Settings },
        ],
    },

    // SERVICIO EN VIVO
    {
        label: "Servicio en Vivo",
        icon: Bell,
        children: [
            { label: "Llamadas", href: "/dashboard/waiter-calls", icon: Bell },
            { label: "Mapa de mesas", href: "/dashboard/tables/map", icon: Map },
        ],
    },

    // CLIENTES (Pro)
    { label: "Clientes", href: "/dashboard/customers", icon: Users, requiresPro: true },

    // ANALYTICS
    {
        label: "Analytics",
        icon: BarChart3,
        children: [
            { label: "Resumen", href: "/dashboard/analytics", icon: BarChart3 },
            { label: "Ventas", href: "/dashboard/analytics/sales", icon: Euro },
            { label: "Productos", href: "/dashboard/analytics/products", icon: UtensilsCrossed },
        ],
    },

    // MARKETING (Pro)
    {
        label: "Marketing",
        icon: Megaphone,
        requiresPro: true,
        children: [
            { label: "Promociones", href: "/dashboard/marketing/promotions", icon: Gift },
            { label: "Cupones", href: "/dashboard/marketing/coupons", icon: Ticket },
            { label: "Notificaciones", href: "/dashboard/marketing/notifications", icon: Send },
        ],
    },

    // CONFIGURACIÓN
    {
        label: "Configuración",
        icon: Settings,
        children: [
            { label: "Restaurante", href: "/dashboard/settings", icon: Store },
            { label: "Pagos", href: "/dashboard/settings/payments", icon: CreditCard },
            { label: "Zonas y Precios", href: "/dashboard/settings/zones", icon: Map },
            { label: "Delivery", href: "/dashboard/settings/delivery", icon: Truck },
            { label: "Horarios", href: "/dashboard/settings/schedules", icon: Clock },
            { label: "Tema del menú", href: "/dashboard/settings/theme", icon: Palette },
            { label: "Idiomas", href: "/dashboard/settings/languages", icon: Languages },
            { label: "Integraciones", href: "/dashboard/settings/integrations", icon: Plug },
            { label: "Plan y Facturación", href: "/dashboard/settings/billing", icon: Receipt },
        ],
    },
];




export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [user, setUser] = useState<any>(null);
    const [pendingOrders, setPendingOrders] = useState(0);
    const [pendingCalls, setPendingCalls] = useState(0);

    const pathname = usePathname();
    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        loadUserData();
        setupRealtimeSubscriptions();

        // Load collapsed state from localStorage
        const saved = localStorage.getItem('sidebar-collapsed');
        if (saved) setIsCollapsed(saved === 'true');
    }, []);

    useEffect(() => {
        localStorage.setItem('sidebar-collapsed', String(isCollapsed));
    }, [isCollapsed]);

    // Auto-expand active section
    useEffect(() => {
        navigation.forEach(item => {
            if (item.children?.some(child => pathname.startsWith(child.href))) {
                if (!expandedItems.includes(item.label)) {
                    setExpandedItems(prev => [...prev, item.label]);
                }
            }
        });
    }, [pathname]);

    const loadUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push("/login");
            return;
        }
        setUser(user);

        const { data: restaurants } = await supabase
            .from("restaurants")
            .select("*")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: true }); const restaurantData = restaurants?.[0] || null;

        if (restaurantData) {
            setRestaurant(restaurantData);
            loadCounts(restaurantData.id);
        }
    };

    const loadCounts = async (restaurantId: string) => {
        const { count: ordersCount } = await supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("restaurant_id", restaurantId)
            .in("status", ["pending", "confirmed", "preparing"]);

        setPendingOrders(ordersCount || 0);

        const { count: callsCount } = await supabase
            .from("waiter_calls")
            .select("*", { count: "exact", head: true })
            .eq("restaurant_id", restaurantId)
            .eq("status", "pending");

        setPendingCalls(callsCount || 0);
    };

    const setupRealtimeSubscriptions = async () => {
        // Realtime updates will refresh counts
    };

    const toggleExpanded = (label: string) => {
        setExpandedItems(prev =>
            prev.includes(label)
                ? prev.filter(i => i !== label)
                : [...prev, label]
        );
    };

    const isActive = (href?: string, children?: any[]) => {
        if (href && pathname === href) return true;
        if (children) {
            return children.some(child => pathname === child.href || pathname.startsWith(child.href + '/'));
        }
        return false;
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/login");
    };

    const navWithBadges = navigation.map(item => {
        if (item.label === "Pedidos") return { ...item, badge: pendingOrders };
        if (item.label === "Llamadas") return { ...item, badge: pendingCalls };
        return item;
    });

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }}>
            <div className="min-h-screen bg-slate-50 flex">
                {/* Mobile Overlay */}
                <AnimatePresence>
                    {isMobileOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                            onClick={() => setIsMobileOpen(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Sidebar */}
                <aside className={`
                    fixed lg:sticky top-0 left-0 z-50 h-screen
                    bg-white border-r border-slate-100 flex flex-col
                    transition-all duration-300 ease-in-out
                    ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
                    ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
                `}>
                    {/* Logo & Collapse Toggle */}
                    <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
                        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-100">
                                <img src="/Logo.jpeg" alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <motion.span
                                animate={{ opacity: isCollapsed ? 0 : 1, width: isCollapsed ? 0 : 'auto' }}
                                className="font-bold text-lg text-slate-900 whitespace-nowrap overflow-hidden"
                            >
                                MyDigitable
                            </motion.span>
                        </Link>

                        {/* Desktop Collapse Toggle */}
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="hidden lg:flex p-2 hover:bg-slate-100 rounded-lg transition-colors"
                            title={isCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
                        >
                            {isCollapsed ? (
                                <PanelLeft size={18} className="text-slate-500" />
                            ) : (
                                <PanelLeftClose size={18} className="text-slate-500" />
                            )}
                        </button>

                        {/* Mobile Close */}
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                        >
                            <X size={18} className="text-slate-500" />
                        </button>
                    </div>

                    {/* Restaurant Selector */}
                    {restaurant && !isCollapsed && (
                        <div className="px-3 py-3 border-b border-slate-100">
                            <div className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors">
                                <div
                                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0"
                                    style={{ backgroundColor: restaurant.primary_color || '#22C55E' }}
                                >
                                    {restaurant.name?.charAt(0) || 'R'}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm text-slate-900 truncate">{restaurant.name}</p>
                                    <p className="text-xs text-slate-400 capitalize">{restaurant.subscription_plan || 'basic'}</p>
                                </div>
                                <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />
                            </div>
                        </div>
                    )}

                    {/* Collapsed Restaurant Icon */}
                    {restaurant && isCollapsed && (
                        <div className="px-3 py-3 border-b border-slate-100 flex justify-center">
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                                style={{ backgroundColor: restaurant.primary_color || '#22C55E' }}
                                title={restaurant.name}
                            >
                                {restaurant.name?.charAt(0) || 'R'}
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <nav className="flex-1 overflow-y-auto py-4 px-2">
                        <div className="space-y-1">
                            {navWithBadges.map((item) => (
                                <NavItemComponent
                                    key={item.label}
                                    item={item}
                                    isActive={isActive(item.href, item.children)}
                                    isExpanded={expandedItems.includes(item.label)}
                                    isCollapsed={isCollapsed}
                                    onToggle={() => toggleExpanded(item.label)}
                                    pathname={pathname}
                                    isPro={restaurant?.subscription_plan === 'pro' || restaurant?.subscription_plan === 'enterprise'}
                                />
                            ))}
                        </div>
                    </nav>

                    {/* Upgrade CTA - Only when expanded */}
                    {restaurant?.subscription_plan === 'basic' && !isCollapsed && (
                        <div className="px-3 py-3 border-t border-slate-100">
                            <div className="p-4 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                    <Sparkles size={16} className="text-primary" />
                                    <span className="font-bold text-sm text-slate-900">Mejora a Pro</span>
                                </div>
                                <p className="text-xs text-slate-500 mb-3">
                                    Desbloquea analytics, marketing y más
                                </p>
                                <Link
                                    href="/dashboard/settings/billing"
                                    className="block text-center py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-xs font-bold transition-colors"
                                >
                                    Ver Planes
                                </Link>
                            </div>
                        </div>
                    )}

                    {/* Help & Logout */}
                    <div className="px-2 py-3 border-t border-slate-100 space-y-1">
                        <Link
                            href="/dashboard/help"
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? 'Centro de Ayuda' : undefined}
                        >
                            <HelpCircle size={18} />
                            {!isCollapsed && <span>Centro de Ayuda</span>}
                        </Link>
                        <button
                            onClick={handleLogout}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
                            title={isCollapsed ? 'Cerrar Sesión' : undefined}
                        >
                            <LogOut size={18} />
                            {!isCollapsed && <span>Cerrar Sesión</span>}
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <div className="flex-1 flex flex-col min-h-screen">
                    {/* Top Bar */}
                    <header className="h-16 bg-white border-b border-slate-100 px-4 lg:px-8 flex items-center justify-between sticky top-0 z-30">
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            className="lg:hidden p-2 hover:bg-slate-100 rounded-xl"
                        >
                            <MenuIcon size={20} className="text-slate-600" />
                        </button>

                        <div className="flex-1" />

                        <div className="flex items-center gap-3">
                            {/* Order Status Toggle */}
                            {restaurant && (
                                <button
                                    onClick={async () => {
                                        const newValue = !restaurant.is_accepting_orders;
                                        await supabase
                                            .from("restaurants")
                                            .update({ is_accepting_orders: newValue })
                                            .eq("id", restaurant.id);
                                        setRestaurant({ ...restaurant, is_accepting_orders: newValue });
                                    }}
                                    className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-colors ${restaurant.is_accepting_orders
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-600'
                                        }`}
                                >
                                    <span className={`w-2 h-2 rounded-full ${restaurant.is_accepting_orders ? 'bg-green-500' : 'bg-red-500'}`} />
                                    {restaurant.is_accepting_orders ? 'Aceptando Pedidos' : 'Pausado'}
                                </button>
                            )}

                            {/* Notifications */}
                            <button className="relative p-2.5 hover:bg-slate-100 rounded-xl transition-colors">
                                <Bell size={20} className="text-slate-500" />
                                {(pendingOrders + pendingCalls) > 0 && (
                                    <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                        {pendingOrders + pendingCalls}
                                    </span>
                                )}
                            </button>

                            {/* User Menu */}
                            <div className="flex items-center gap-3 pl-3 border-l border-slate-100">
                                <div className="hidden sm:block text-right">
                                    <p className="text-sm font-bold text-slate-900">
                                        {restaurant?.name || 'Mi Restaurante'}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                        {user?.email}
                                    </p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-bold">
                                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1">
                        {children}
                    </main>
                </div>
            </div >
        </SidebarContext.Provider >
    );
}

// Nav Item Component
function NavItemComponent({
    item,
    isActive,
    isExpanded,
    isCollapsed,
    onToggle,
    pathname,
    isPro,
}: {
    item: NavItem;
    isActive: boolean;
    isExpanded: boolean;
    isCollapsed: boolean;
    onToggle: () => void;
    pathname: string;
    isPro: boolean;
}) {
    const hasChildren = item.children && item.children.length > 0;
    const isLocked = item.requiresPro && !isPro;

    // For collapsed state with children, show tooltip menu
    if (isCollapsed) {
        if (hasChildren) {
            return (
                <div className="relative group">
                    <div
                        className={`flex items-center justify-center p-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${isActive
                            ? 'bg-primary/10 text-primary'
                            : isLocked
                                ? 'text-slate-300'
                                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        title={item.label}
                    >
                        <item.icon size={20} />
                        {item.badge !== undefined && item.badge > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                                {item.badge}
                            </span>
                        )}
                    </div>

                    {/* Dropdown on hover */}
                    <div className="absolute left-full top-0 ml-2 py-2 bg-white rounded-xl shadow-xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all min-w-[180px] z-50">
                        <div className="px-3 py-2 border-b border-slate-100">
                            <span className="text-xs font-bold text-slate-400 uppercase">{item.label}</span>
                        </div>
                        {item.children!.map((child) => (
                            <Link
                                key={child.href}
                                href={isLocked ? '#' : child.href}
                                className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${pathname === child.href
                                    ? 'bg-primary/10 text-primary font-bold'
                                    : isLocked
                                        ? 'text-slate-300 cursor-not-allowed'
                                        : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                            >
                                {child.icon && <child.icon size={14} />}
                                {child.label}
                            </Link>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <Link
                href={isLocked ? '#' : (item.href || '#')}
                className={`relative flex items-center justify-center p-3 rounded-xl text-sm font-medium transition-colors ${isActive
                    ? 'bg-primary/10 text-primary'
                    : isLocked
                        ? 'text-slate-300 cursor-not-allowed'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                title={item.label}
            >
                <item.icon size={20} />
                {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {item.badge}
                    </span>
                )}
            </Link>
        );
    }

    // Expanded state
    if (hasChildren) {
        const ItemWrapper = item.href ? Link : 'div';
        const itemProps = item.href ? { href: isLocked ? '#' : item.href } : {};

        return (
            <div>
                <div
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                        ? 'bg-primary/5 text-primary'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                >
                    {item.href ? (
                        <Link
                            href={isLocked ? '#' : item.href}
                            className="flex items-center gap-3 flex-1"
                            onClick={() => {
                                if (!isExpanded) onToggle();
                            }}
                        >
                            <item.icon size={18} />
                            <span className="flex-1 text-left">{item.label}</span>
                        </Link>
                    ) : (
                        <button onClick={onToggle} className="flex items-center gap-3 flex-1">
                            <item.icon size={18} />
                            <span className="flex-1 text-left">{item.label}</span>
                        </button>
                    )}
                    {isLocked && (
                        <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">
                            PRO
                        </span>
                    )}
                    {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full">
                            {item.badge}
                        </span>
                    )}
                    <button onClick={onToggle} className="p-1 hover:bg-slate-100 rounded transition-colors">
                        <ChevronRight
                            size={14}
                            className={`text-slate-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                        />
                    </button>
                </div>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="ml-6 pl-3 border-l border-slate-100 mt-1 space-y-1">
                                {item.children!.map((child) => (
                                    <Link
                                        key={child.href}
                                        href={isLocked ? '#' : child.href}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${pathname === child.href
                                            ? 'bg-primary/10 text-primary font-bold'
                                            : isLocked
                                                ? 'text-slate-300 cursor-not-allowed'
                                                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                                            }`}
                                        onClick={(e) => isLocked && e.preventDefault()}
                                    >
                                        {child.icon && <child.icon size={14} />}
                                        {child.label}
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <Link
            href={isLocked ? '#' : (item.href || '#')}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                ? 'bg-primary/5 text-primary'
                : isLocked
                    ? 'text-slate-300 cursor-not-allowed'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            onClick={(e) => isLocked && e.preventDefault()}
        >
            <item.icon size={18} />
            <span className="flex-1">{item.label}</span>
            {isLocked && (
                <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">
                    PRO
                </span>
            )}
            {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[20px] text-center">
                    {item.badge}
                </span>
            )}
        </Link>
    );
}

