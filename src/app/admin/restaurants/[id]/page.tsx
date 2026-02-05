"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
    ArrowLeft,
    Store,
    Mail,
    Phone,
    MapPin,
    Calendar,
    CreditCard,
    TrendingUp,
    Edit3,
    ExternalLink,
    UserCheck,
    AlertCircle,
    Check,
    X,
    Loader2,
    Euro,
    ShoppingBag,
    Users,
    Star,
    Clock,
} from "lucide-react";

interface Restaurant {
    id: string;
    name: string;
    slug: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    subscription_plan: string;
    is_active: boolean;
    created_at: string;
    owner_id: string;
    business_name: string | null;
    tax_id: string | null;
    onboarding_completed: boolean;
    onboarding_step: number;
    stripe_account_id: string | null;
    seller_id: string | null;
}

interface Subscription {
    id: string;
    plan: string;
    status: string;
    billing_cycle: string | null;
    current_period_end: string | null;
}

interface Stats {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    avgRating: number;
}

export default function RestaurantDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [stats, setStats] = useState<Stats>({ totalOrders: 0, totalRevenue: 0, totalCustomers: 0, avgRating: 0 });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState<Partial<Restaurant>>({});
    const supabase = createClient();

    useEffect(() => {
        loadRestaurant();
    }, [params.id]);

    const loadRestaurant = async () => {
        setLoading(true);
        try {
            // Load restaurant
            const { data: restData, error: restError } = await supabase
                .from("restaurants")
                .select("*")
                .eq("id", params.id)
                .single();

            if (restError) throw restError;
            setRestaurant(restData);
            setEditData(restData);

            // Load subscription
            const { data: subData } = await supabase
                .from("subscriptions")
                .select("*")
                .eq("restaurant_id", params.id)
                .single();

            setSubscription(subData);

            // Load stats
            const { count: ordersCount } = await supabase
                .from("orders")
                .select("*", { count: "exact", head: true })
                .eq("restaurant_id", params.id);

            const { data: revenueData } = await supabase
                .from("orders")
                .select("total")
                .eq("restaurant_id", params.id)
                .eq("payment_status", "paid");

            const totalRevenue = revenueData?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;

            setStats({
                totalOrders: ordersCount || 0,
                totalRevenue,
                totalCustomers: 0, // TODO: Count unique customers
                avgRating: 4.5, // TODO: Calculate from reviews
            });

        } catch (err) {
            console.error("Error loading restaurant:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!restaurant) return;
        setSaving(true);

        try {
            const { error } = await supabase
                .from("restaurants")
                .update({
                    name: editData.name,
                    email: editData.email,
                    phone: editData.phone,
                    address: editData.address,
                    city: editData.city,
                    business_name: editData.business_name,
                    tax_id: editData.tax_id,
                    is_active: editData.is_active,
                })
                .eq("id", restaurant.id);

            if (error) throw error;

            setRestaurant({ ...restaurant, ...editData });
            setEditMode(false);
        } catch (err) {
            console.error("Error saving:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleChangePlan = async (newPlan: string) => {
        if (!restaurant) return;

        try {
            // Update restaurant
            await supabase
                .from("restaurants")
                .update({ subscription_plan: newPlan })
                .eq("id", restaurant.id);

            // Update subscription
            await supabase
                .from("subscriptions")
                .update({ plan: newPlan })
                .eq("restaurant_id", restaurant.id);

            setRestaurant({ ...restaurant, subscription_plan: newPlan });
            if (subscription) {
                setSubscription({ ...subscription, plan: newPlan });
            }
        } catch (err) {
            console.error("Error changing plan:", err);
        }
    };

    const handleImpersonate = () => {
        // Store impersonation info in sessionStorage
        sessionStorage.setItem("impersonating", JSON.stringify({
            restaurantId: restaurant?.id,
            restaurantName: restaurant?.name,
            returnTo: `/admin/restaurants/${restaurant?.id}`,
        }));
        router.push("/dashboard");
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-ES", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    const getPlanBadge = (plan: string | null) => {
        const p = plan || "starter";
        const config = {
            starter: { bg: "bg-slate-600/50", text: "text-slate-300", label: "Starter" },
            basic: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Basic" },
            pro: { bg: "bg-indigo-500/20", text: "text-indigo-400", label: "Pro" },
        };
        const c = config[p as keyof typeof config] || config.starter;
        return (
            <span className={`px-3 py-1.5 rounded-xl text-sm font-bold ${c.bg} ${c.text}`}>
                {c.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            </div>
        );
    }

    if (!restaurant) {
        return (
            <div className="text-center py-20">
                <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-white">Restaurante no encontrado</h2>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/restaurants"
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl">
                            {restaurant.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">{restaurant.name}</h1>
                            <p className="text-slate-400">/{restaurant.slug}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={`/r/${restaurant.slug}`}
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-medium transition-colors"
                    >
                        <ExternalLink size={18} />
                        Ver Menú
                    </Link>
                    <button
                        onClick={handleImpersonate}
                        className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl font-bold transition-colors"
                    >
                        <UserCheck size={18} />
                        Entrar como Restaurante
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-5"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <ShoppingBag className="text-blue-400" size={20} />
                        </div>
                        <span className="text-slate-400 text-sm">Pedidos</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-5"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                            <Euro className="text-emerald-400" size={20} />
                        </div>
                        <span className="text-slate-400 text-sm">Ingresos</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-5"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center">
                            <Star className="text-amber-400" size={20} />
                        </div>
                        <span className="text-slate-400 text-sm">Rating</span>
                    </div>
                    <p className="text-3xl font-bold text-white">{stats.avgRating.toFixed(1)}</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-5"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <Clock className="text-purple-400" size={20} />
                        </div>
                        <span className="text-slate-400 text-sm">Registro</span>
                    </div>
                    <p className="text-lg font-bold text-white">{formatDate(restaurant.created_at)}</p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-2 bg-slate-800 border border-slate-700 rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-white">Información</h2>
                        {editMode ? (
                            <div className="flex gap-2">
                                <button
                                    onClick={() => { setEditMode(false); setEditData(restaurant); }}
                                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg"
                                >
                                    <X size={18} />
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium"
                                >
                                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                    Guardar
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setEditMode(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium"
                            >
                                <Edit3 size={16} />
                                Editar
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Nombre</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    value={editData.name || ""}
                                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                                />
                            ) : (
                                <p className="text-white">{restaurant.name}</p>
                            )}
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Email</label>
                            {editMode ? (
                                <input
                                    type="email"
                                    value={editData.email || ""}
                                    onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-white">
                                    <Mail size={16} className="text-slate-400" />
                                    {restaurant.email || "—"}
                                </div>
                            )}
                        </div>

                        {/* Phone */}
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Teléfono</label>
                            {editMode ? (
                                <input
                                    type="tel"
                                    value={editData.phone || ""}
                                    onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-white">
                                    <Phone size={16} className="text-slate-400" />
                                    {restaurant.phone || "—"}
                                </div>
                            )}
                        </div>

                        {/* City */}
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Ciudad</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    value={editData.city || ""}
                                    onChange={(e) => setEditData({ ...editData, city: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                                />
                            ) : (
                                <div className="flex items-center gap-2 text-white">
                                    <MapPin size={16} className="text-slate-400" />
                                    {restaurant.city || "—"}
                                </div>
                            )}
                        </div>

                        {/* Business Name */}
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Razón Social</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    value={editData.business_name || ""}
                                    onChange={(e) => setEditData({ ...editData, business_name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                                />
                            ) : (
                                <p className="text-white">{restaurant.business_name || "—"}</p>
                            )}
                        </div>

                        {/* Tax ID */}
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">NIF/CIF</label>
                            {editMode ? (
                                <input
                                    type="text"
                                    value={editData.tax_id || ""}
                                    onChange={(e) => setEditData({ ...editData, tax_id: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                                />
                            ) : (
                                <p className="text-white">{restaurant.tax_id || "—"}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-slate-400 mb-2">Estado</label>
                            {editMode ? (
                                <select
                                    value={editData.is_active ? "active" : "inactive"}
                                    onChange={(e) => setEditData({ ...editData, is_active: e.target.value === "active" })}
                                    className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-white"
                                >
                                    <option value="active">Activo</option>
                                    <option value="inactive">Inactivo</option>
                                </select>
                            ) : (
                                <span className={`
                                    px-3 py-1.5 rounded-xl text-sm font-bold
                                    ${restaurant.is_active
                                        ? "bg-emerald-500/20 text-emerald-400"
                                        : "bg-red-500/20 text-red-400"
                                    }
                                `}>
                                    {restaurant.is_active ? "Activo" : "Inactivo"}
                                </span>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Subscription Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-slate-800 border border-slate-700 rounded-2xl p-6"
                >
                    <h2 className="text-lg font-bold text-white mb-6">Suscripción</h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Plan actual</span>
                            {getPlanBadge(restaurant.subscription_plan)}
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Estado</span>
                            <span className={`
                                px-2 py-1 rounded-lg text-xs font-bold
                                ${subscription?.status === "active"
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : "bg-amber-500/20 text-amber-400"
                                }
                            `}>
                                {subscription?.status || "Sin suscripción"}
                            </span>
                        </div>

                        {subscription?.current_period_end && (
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Renovación</span>
                                <span className="text-white text-sm">
                                    {formatDate(subscription.current_period_end)}
                                </span>
                            </div>
                        )}

                        <hr className="border-slate-700" />

                        <p className="text-sm text-slate-400 mb-3">Cambiar plan:</p>
                        <div className="grid grid-cols-3 gap-2">
                            {["starter", "basic", "pro"].map((plan) => (
                                <button
                                    key={plan}
                                    onClick={() => handleChangePlan(plan)}
                                    disabled={restaurant.subscription_plan === plan}
                                    className={`
                                        px-3 py-2 rounded-xl text-sm font-bold transition-all capitalize
                                        ${restaurant.subscription_plan === plan
                                            ? "bg-indigo-500 text-white"
                                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        }
                                    `}
                                >
                                    {plan}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
