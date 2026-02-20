"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
    Store,
    Phone,
    Mail,
    Globe,
    MapPin,
    Instagram,
    Facebook,
    Twitter,
    Check,
    Loader2,
    Camera,
    Palette,
    ChevronRight,
    CreditCard,
    Truck,
    Clock,
    Languages,
    Plug,
    Receipt,
    ExternalLink,
} from "lucide-react";

interface Restaurant {
    id: string;
    name: string;
    slug: string;
    description: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logo_url: string;
    cover_image_url: string;
    primary_color: string;
    secondary_color: string;
    social_instagram: string;
    social_facebook: string;
    plan_tier: string;
}

const settingsLinks = [
    { icon: CreditCard, label: 'Pagos', description: 'Métodos de pago y cobro', href: '/dashboard/settings/payments' },
    { icon: Truck, label: 'Delivery', description: 'Zonas y tarifas de envío', href: '/dashboard/settings/delivery' },
    { icon: Clock, label: 'Horarios', description: 'Horarios de apertura', href: '/dashboard/settings/schedules' },
    { icon: Palette, label: 'Tema del menú', description: 'Personaliza el diseño', href: '/dashboard/settings/theme' },
    { icon: Languages, label: 'Idiomas', description: 'Idiomas del menú', href: '/dashboard/settings/languages' },
    { icon: Plug, label: 'Integraciones', description: 'Conecta otras apps', href: '/dashboard/settings/integrations' },
    { icon: Receipt, label: 'Plan y facturación', description: 'Gestiona tu suscripción', href: '/dashboard/settings/billing' },
];

export default function SettingsPage() {
    const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    // Form fields
    const [name, setName] = useState('');
    const [slug, setSlug] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [website, setWebsite] = useState('');
    const [logoUrl, setLogoUrl] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#22C55E');
    const [instagram, setInstagram] = useState('');
    const [facebook, setFacebook] = useState('');

    const supabase = createClient();

    useEffect(() => {
        loadRestaurant();
    }, []);

    const loadRestaurant = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: restaurants } = await supabase
                .from("restaurants")
                .select("*")
                .eq("owner_id", user.id)
                .order("created_at", { ascending: true }); const restaurantData = restaurants?.[0] || null;

            if (restaurantData) {
                setRestaurant(restaurantData);
                setName(restaurantData.name || '');
                setSlug(restaurantData.slug || '');
                setDescription(restaurantData.description || '');
                setAddress(restaurantData.address || '');
                setPhone(restaurantData.phone || '');
                setEmail(restaurantData.email || '');
                setWebsite(restaurantData.website || '');
                setLogoUrl(restaurantData.logo_url || '');
                setCoverUrl(restaurantData.cover_image_url || '');
                setPrimaryColor(restaurantData.primary_color || '#22C55E');
                setInstagram(restaurantData.social_instagram || '');
                setFacebook(restaurantData.social_facebook || '');
            }
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
            await supabase
                .from("restaurants")
                .update({
                    name,
                    slug,
                    description,
                    address,
                    phone,
                    email,
                    website,
                    logo_url: logoUrl,
                    cover_image_url: coverUrl,
                    primary_color: primaryColor,
                    social_instagram: instagram,
                    social_facebook: facebook,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", restaurant.id);

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err) {
            console.error("Error saving:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Configuración</h1>
                    <p className="text-sm text-slate-500">Gestiona tu restaurante y opciones</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href={`/r/${slug}`}
                        target="_blank"
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-600 transition-colors"
                    >
                        <ExternalLink size={16} />
                        Ver Menú
                    </Link>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-colors disabled:opacity-50"
                    >
                        {saving ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : saved ? (
                            <Check size={16} />
                        ) : null}
                        {saved ? 'Guardado' : 'Guardar'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Basic Info */}
                    <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Store size={20} className="text-primary" />
                                Información del Restaurante
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Nombre del Restaurante *
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        URL del Menú
                                    </label>
                                    <div className="flex">
                                        <span className="px-4 py-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-500 text-sm">
                                            mydigitable.com/r/
                                        </span>
                                        <input
                                            type="text"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                                            className="flex-1 px-4 py-3 border border-slate-200 rounded-r-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Descripción
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Describe tu restaurante..."
                                    rows={3}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Dirección
                                </label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="text"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Calle, número, ciudad..."
                                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Phone size={20} className="text-primary" />
                                Contacto
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Teléfono
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="tel"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="+34 600 000 000"
                                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="contacto@restaurante.com"
                                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Página Web
                                </label>
                                <div className="relative">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="url"
                                        value={website}
                                        onChange={(e) => setWebsite(e.target.value)}
                                        placeholder="https://www.turestaurante.com"
                                        className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Social */}
                    <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Instagram size={20} className="text-primary" />
                                Redes Sociales
                            </h2>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Instagram
                                    </label>
                                    <div className="relative">
                                        <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={instagram}
                                            onChange={(e) => setInstagram(e.target.value)}
                                            placeholder="@turestaurante"
                                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Facebook
                                    </label>
                                    <div className="relative">
                                        <Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={facebook}
                                            onChange={(e) => setFacebook(e.target.value)}
                                            placeholder="facebook.com/turestaurante"
                                            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Branding */}
                    <section className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                                <Palette size={20} className="text-primary" />
                                Marca
                            </h2>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Logo
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <div
                                            className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center overflow-hidden"
                                            style={{ backgroundColor: logoUrl ? 'transparent' : primaryColor + '20' }}
                                        >
                                            {logoUrl ? (
                                                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <Camera size={24} className="text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <input
                                                type="url"
                                                value={logoUrl}
                                                onChange={(e) => setLogoUrl(e.target.value)}
                                                placeholder="URL de la imagen..."
                                                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">
                                        Color Principal
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="w-20 h-12 rounded-xl cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={primaryColor}
                                            onChange={(e) => setPrimaryColor(e.target.value)}
                                            className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-sm uppercase focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Imagen de Portada
                                </label>
                                <input
                                    type="url"
                                    value={coverUrl}
                                    onChange={(e) => setCoverUrl(e.target.value)}
                                    placeholder="URL de la imagen de portada..."
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                                />
                                {coverUrl && (
                                    <div className="mt-2 w-full h-32 rounded-xl overflow-hidden bg-slate-100">
                                        <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Quick Links */}
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="p-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900">Más Opciones</h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {settingsLinks.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className="flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
                                        <link.icon size={18} className="text-slate-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-slate-900">{link.label}</p>
                                        <p className="text-xs text-slate-500">{link.description}</p>
                                    </div>
                                    <ChevronRight size={16} className="text-slate-400" />
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Plan Info */}
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                <Receipt size={20} className="text-primary" />
                            </div>
                            <div>
                                <p className="font-bold text-slate-900">Plan Actual</p>
                                <p className="text-sm text-primary font-bold capitalize">{restaurant?.plan_tier || 'Basic'}</p>
                            </div>
                        </div>
                        {restaurant?.plan_tier === 'basic' && (
                            <Link
                                href="/dashboard/settings/billing"
                                className="block text-center py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-colors"
                            >
                                Mejorar a Pro
                            </Link>
                        )}
                    </div>

                    {/* Preview */}
                    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                        <div className="p-4 border-b border-slate-100">
                            <h3 className="font-bold text-slate-900">Vista Previa</h3>
                        </div>
                        <div className="p-4">
                            <div className="rounded-xl overflow-hidden border border-slate-200">
                                {coverUrl && (
                                    <div className="h-20 bg-slate-100">
                                        <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className={`p-4 ${coverUrl ? '-mt-6' : ''}`}>
                                    <div
                                        className="w-16 h-16 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        {logoUrl ? (
                                            <img src={logoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            name?.charAt(0) || 'R'
                                        )}
                                    </div>
                                    <h4 className="font-bold text-slate-900 mt-3">{name || 'Tu Restaurante'}</h4>
                                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                                        {description || 'Descripción del restaurante...'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

