"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    LayoutDashboard,
    Store,
    CreditCard,
    Users,
    Percent,
    Settings,
    LogOut,
    ChevronDown,
    Bell,
    Menu,
    X,
    TrendingUp,
    UserCircle,
    Shield,
} from "lucide-react";

interface PlatformAdmin {
    id: string;
    user_id: string;
    email: string;
    name: string | null;
    role: "super_admin" | "admin" | "support";
}

const navigation = [
    {
        name: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        name: "Restaurantes",
        href: "/admin/restaurants",
        icon: Store,
    },
    {
        name: "Analytics",
        href: "/admin/analytics",
        icon: TrendingUp,
    },
    {
        name: "Suscripciones",
        href: "/admin/subscriptions",
        icon: CreditCard,
    },
    {
        name: "Vendedores",
        href: "/admin/sellers",
        icon: Users,
    },
    {
        name: "Comisiones",
        href: "/admin/commissions",
        icon: Percent,
    },
    {
        name: "Configuración",
        href: "/admin/settings",
        icon: Settings,
    },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const [admin, setAdmin] = useState<PlatformAdmin | null>(null);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const supabase = createClient();

    useEffect(() => {
        checkAdminAccess();
    }, []);

    const checkAdminAccess = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                router.replace("/login");
                return;
            }

            // Verificar que sea platform_admin
            const { data: adminData, error } = await supabase
                .from("platform_admins")
                .select("*")
                .eq("user_id", user.id)
                .single();

            if (error || !adminData) {
                router.replace("/dashboard");
                return;
            }

            setAdmin(adminData);
        } catch {
            router.replace("/dashboard");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.replace("/login");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-400">Verificando acceso...</p>
                </div>
            </div>
        );
    }

    if (!admin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Mobile sidebar backdrop */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`
                fixed top-0 left-0 z-50 h-full w-72 bg-slate-800 border-r border-slate-700
                transform transition-transform duration-300 ease-in-out
                lg:translate-x-0
                ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                            <Shield size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">MyDigitable</h1>
                            <p className="text-xs text-slate-400">Admin Panel</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== "/admin" && pathname?.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                                    ${isActive
                                        ? "bg-indigo-500/20 text-indigo-400"
                                        : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                                    }
                                `}
                            >
                                <item.icon size={20} />
                                <span className="font-medium">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Admin info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {admin.name?.charAt(0) || admin.email.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {admin.name || admin.email}
                            </p>
                            <p className="text-xs text-indigo-400 capitalize">{admin.role.replace("_", " ")}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                            title="Cerrar sesión"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-72">
                {/* Top bar */}
                <header className="h-16 bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-30">
                    <div className="h-full flex items-center justify-between px-4 lg:px-8">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-400 hover:text-white"
                        >
                            <Menu size={24} />
                        </button>

                        <div className="flex-1 lg:flex-none" />

                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-slate-400 hover:text-white transition-colors">
                                <Bell size={20} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                            </button>

                            <Link
                                href="/dashboard"
                                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors"
                            >
                                <Store size={16} />
                                Ver como restaurante
                            </Link>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
