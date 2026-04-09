"use client";

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
    ArrowLeft,
    Check,
    ArrowRight,
    ChevronDown,
    X,
    Lock,
    Mail,
    MapPin,
    Building2,
    Search,
    Sparkles,
    Eye,
    EyeOff,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { countries } from "./countries";
import { registerAction } from "./actions";
import type { PlanTier, BusinessType, OnboardingConfig } from '@/types/database';
import { calculatePricing } from '@/types/database';

const translations = {
    ES: {
        title: "Empieza",
        subtitleAccent: "gratis hoy.",
        description: "Configura tu perfil profesional en minutos.",
        labelVenue: "Nombre del Local",
        labelEmail: "Email de Gestión",
        labelCountry: "País de operación",
        labelPass: "Contraseña",
        labelConfirm: "Confirmar",
        btnRegister: "REGISTRARSE",
        back: "Volver",
        searchPlaceholder: "Buscar país...",
        hasAccount: "¿Ya tienes cuenta?",
        loginLink: "Iniciar sesión",
        successTitle: "¡Cuenta creada!",
        successMessage: "Tu cuenta ha sido creada exitosamente. Ahora vamos a configurar tu negocio.",
        successButton: "Continuar",
        errors: {
            mismatch: "Las contraseñas no coinciden",
            short: "La contraseña debe tener al menos 6 caracteres",
            generic: "Ocurrió un error inesperado."
        }
    },
    EN: {
        title: "Start",
        subtitleAccent: "free today.",
        description: "Set up your professional profile in minutes.",
        labelVenue: "Venue Name",
        labelEmail: "Management Email",
        labelCountry: "Operating Country",
        labelPass: "Password",
        labelConfirm: "Confirm",
        btnRegister: "REGISTER",
        back: "Back",
        searchPlaceholder: "Search country...",
        hasAccount: "Already have an account?",
        loginLink: "Log in",
        successTitle: "Account created!",
        successMessage: "Your account has been created successfully. Now let's set up your business.",
        successButton: "Continue",
        errors: {
            mismatch: "Passwords do not match",
            short: "Password must be at least 6 characters",
            generic: "An unexpected error occurred."
        }
    }
};

const PLANS = [
    {
        id: 'basic' as PlanTier,
        name: 'Básico',
        price: 49,
        popular: false,
        description: 'Para empezar a digitalizar',
        color: 'slate',
        features: [
            { text: 'Menú QR ilimitado', included: true },
            { text: 'Categorías y productos ilimitados', included: true },
            { text: 'Fotos HD de productos', included: true },
            { text: 'Hasta 3 staff', included: true },
            { text: '3 temas de diseño', included: true },
            { text: '3 idiomas (ES, EN, FR)', included: true },
            { text: 'Pagos Stripe + efectivo + Apple/Google Pay', included: true },
            { text: 'Propinas digitales', included: true },
            { text: 'Llamar al mozo', included: true },
            { text: 'Pedidos desde mesa', included: true },
            { text: 'Dashboard básico', included: true },
            { text: 'Mesa compartida con PIN', included: false },
            { text: 'KDS - Vista cocina', included: false },
            { text: 'IA importar menú', included: false },
            { text: 'App PWA camareros', included: false },
            { text: 'Delivery y reservas', included: false },
            { text: 'Analytics avanzado', included: false },
            { text: 'Modo playa / hotel / eventos', included: false },
        ]
    },
    {
        id: 'pro' as PlanTier,
        name: 'Pro',
        price: 99,
        popular: true,
        description: 'Para crecer y automatizar',
        color: 'green',
        features: [
            { text: 'Todo lo de Básico', included: true },
            { text: 'Hasta 10 staff', included: true },
            { text: '20+ temas premium', included: true },
            { text: '7 idiomas completos', included: true },
            { text: 'Mesa compartida con PIN 🔥', included: true },
            { text: 'KDS - Vista cocina', included: true },
            { text: 'IA importar menú desde foto 📸', included: true },
            { text: 'App PWA camareros', included: true },
            { text: 'Chatbot IA', included: true },
            { text: 'Delivery y reservas', included: true },
            { text: 'Precio distinto en terraza', included: true },
            { text: 'Promociones y descuentos', included: true },
            { text: 'Analytics avanzado', included: true },
            { text: 'Exportar Excel/PDF', included: true },
            { text: 'Modo playa GPS', included: false },
            { text: 'Modo hotel', included: false },
            { text: 'Modo eventos', included: false },
            { text: 'White label', included: false },
            { text: 'API acceso', included: false },
        ]
    },
    {
        id: 'premium' as PlanTier,
        name: 'Premium',
        price: 150,
        popular: false,
        description: 'Para cadenas y hoteles',
        color: 'slate',
        features: [
            { text: 'Todo lo de Pro', included: true },
            { text: 'Staff ilimitado', included: true },
            { text: 'Todos los idiomas + auto-detect', included: true },
            { text: 'Modo playa GPS 🏖️', included: true },
            { text: 'Modo hotel 🏨', included: true },
            { text: 'Modo eventos 🎭', included: true },
            { text: 'White label (marca propia)', included: true },
            { text: 'API acceso completo', included: true },
            { text: 'Control financiero (margen)', included: true },
            { text: 'Temas personalizados + CSS', included: true },
            { text: 'Soporte prioritario', included: true },
        ]
    }
];

export default function RegisterPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [selectedPlan, setSelectedPlan] = useState<PlanTier>('pro');
    const [locations, setLocations] = useState(1);

    const [restaurantName, setRestaurantName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const langCode = (searchParams.get("lang") || "ES").toUpperCase();
    const content = (translations as any)[langCode] || translations.ES;

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [countrySearch, setCountrySearch] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("España");
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const countryRef = useRef<HTMLDivElement>(null);

    const filteredCountries = countries.filter(c =>
        c.toLowerCase().includes(countrySearch.toLowerCase())
    );

    const pricing = calculatePricing(selectedPlan, locations);
    const selectedPlanData = PLANS.find(p => p.id === selectedPlan)!;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        if (password !== confirmPassword) {
            setErrorMessage(content.errors.mismatch);
            return;
        }

        if (password.length < 6) {
            setErrorMessage(content.errors.short);
            return;
        }

        setIsLoading(true);

        const formData = new FormData();
        formData.append("restaurantName", restaurantName);
        formData.append("email", email);
        formData.append("password", password);
        formData.append("country", selectedCountry);
        formData.append("plan", selectedPlan);

        try {
            const result = await registerAction(formData);


            if (result.error) {
                setErrorMessage(result.error);
                setIsLoading(false);
            } else if (result.success && result.userId) {

                // Guardar configuración en localStorage para el onboarding
                const onboardingConfig = {
                    userId: result.userId,
                    email: email,
                    restaurantName: restaurantName,
                    country: selectedCountry,
                    planTier: selectedPlan,
                    locations: locations,
                    timestamp: new Date().toISOString()
                };

                localStorage.setItem('onboardingConfig', JSON.stringify(onboardingConfig));


                // Redirigir a onboarding
                router.push('/onboarding');
            }
        } catch {
            setErrorMessage(content.errors.generic);
            setIsLoading(false);
        }
    };



    return (
        <div className="min-h-screen bg-white flex flex-col lg:flex-row">
            {/* FORMULARIO */}
            <div className="flex-1 flex flex-col p-8 md:p-16 justify-center relative bg-white">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-20" />

                <Link
                    href="/"
                    className="absolute top-10 left-10 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group"
                >
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    {content.back}
                </Link>

                <div className="max-w-md w-full mx-auto space-y-10 relative z-10 py-10">
                    <div className="space-y-4">
                        <h1 className="text-5xl font-black tracking-tighter leading-tight text-slate-900">
                            {content.title} <br />
                            <span className="text-primary italic">{content.subtitleAccent}</span>
                        </h1>
                        <p className="text-slate-500 font-medium">{content.description}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {errorMessage && (
                            <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3">
                                <AlertCircle size={18} />
                                {errorMessage}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                                <Building2 size={12} /> {content.labelVenue}
                            </label>
                            <input
                                required
                                value={restaurantName}
                                onChange={(e) => setRestaurantName(e.target.value)}
                                type="text"
                                placeholder="Ej: La Terraza de María"
                                className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-bold text-slate-900"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                                <Mail size={12} /> {content.labelEmail}
                            </label>
                            <input
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                placeholder="hola@tu-restaurante.com"
                                className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-bold text-slate-900"
                            />
                        </div>

                        {/* País */}
                        <div className="relative" ref={countryRef}>
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2 mb-2">
                                <MapPin size={12} /> {content.labelCountry}
                            </label>
                            <div
                                onClick={() => setIsCountryOpen(!isCountryOpen)}
                                className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between cursor-pointer hover:border-primary transition-all font-bold text-slate-900"
                            >
                                {selectedCountry}
                                <ChevronDown size={16} className={`text-slate-400 transition-transform ${isCountryOpen ? 'rotate-180' : ''}`} />
                            </div>

                            <AnimatePresence>
                                {isCountryOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-2xl z-[60] p-2 max-h-[250px] overflow-y-auto"
                                    >
                                        <div className="sticky top-0 bg-white pb-2">
                                            <div className="relative">
                                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    placeholder={content.searchPlaceholder}
                                                    className="w-full h-10 pl-9 pr-4 bg-slate-50 border border-slate-100 rounded-xl outline-none text-sm font-bold focus:border-primary"
                                                    value={countrySearch}
                                                    onChange={(e) => setCountrySearch(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            {filteredCountries.map(c => (
                                                <button
                                                    key={c}
                                                    type="button"
                                                    onClick={() => { setSelectedCountry(c); setIsCountryOpen(false); setCountrySearch(""); }}
                                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${selectedCountry === c ? 'bg-primary text-white' : 'hover:bg-slate-50'}`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Contraseñas */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                                    <Lock size={12} /> {content.labelPass}
                                </label>
                                <div className="relative">
                                    <input
                                        required
                                        minLength={6}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full h-14 px-5 pr-12 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-bold text-slate-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                                    <Lock size={12} /> {content.labelConfirm}
                                </label>
                                <div className="relative">
                                    <input
                                        required
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full h-14 px-5 pr-12 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-bold text-slate-900"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            disabled={isLoading}
                            type="submit"
                            className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 size={24} className="animate-spin" />
                            ) : (
                                <>
                                    {content.btnRegister}
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>

                        <div className="text-center pt-4 border-t border-slate-100">
                            <p className="text-sm text-slate-500">
                                {content.hasAccount}{" "}
                                <Link href="/login" className="font-bold text-primary hover:underline">
                                    {content.loginLink}
                                </Link>
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* LADO DERECHO - NUEVO DISEÑO */}
            <div className="hidden lg:flex flex-1 bg-slate-900 relative flex-col overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_1.2px,_transparent_1.2px)] [background-size:60px_60px] opacity-10" />
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />

                <div className="relative z-10 flex flex-col h-full">
                    {/* TABS DE PLANES */}
                    <div className="p-8 pb-0">
                        <div className="flex gap-2 mb-6">
                            {PLANS.map((plan) => (
                                <button
                                    key={plan.id}
                                    type="button"
                                    onClick={() => setSelectedPlan(plan.id)}
                                    className={`flex-1 px-4 py-3 rounded-xl font-black text-sm uppercase tracking-wider transition-all ${selectedPlan === plan.id
                                        ? 'bg-primary text-white shadow-lg shadow-primary/25'
                                        : 'bg-transparent text-white/40 border border-white/10 hover:text-white/60 hover:border-white/20'
                                        }`}
                                >
                                    {plan.name} {plan.popular && '⭐'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* CONTENIDO DEL PLAN (scrollable) */}
                    <div className="flex-1 overflow-y-auto px-8 pb-8">
                        <div className="space-y-6">
                            {/* HEADER DEL PLAN */}
                            <div>
                                <div className="flex items-start justify-between mb-2">
                                    <h3 className="text-4xl font-black text-white">{selectedPlanData.name}</h3>
                                    {selectedPlanData.popular && (
                                        <span className="bg-primary text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">
                                            Más Popular
                                        </span>
                                    )}
                                </div>
                                <p className="text-white/60 text-sm mb-4">{selectedPlanData.description}</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-black text-white">€{selectedPlanData.price}</span>
                                    <span className="text-white/40 text-sm">/mes por sucursal</span>
                                </div>
                            </div>

                            {/* FEATURES COMPLETAS */}
                            <div>
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">
                                    Características incluidas
                                </h4>
                                <ul className="space-y-3">
                                    {selectedPlanData.features.map((f, i) => (
                                        <li key={i} className="flex gap-3 items-start">
                                            {f.included ? (
                                                <Check size={16} className="text-primary flex-shrink-0 mt-0.5" strokeWidth={3} />
                                            ) : (
                                                <X size={16} className="text-white/20 flex-shrink-0 mt-0.5" />
                                            )}
                                            <span className={`text-sm ${f.included ? 'text-white font-medium' : 'text-white/30'}`}>
                                                {f.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* SLIDER DE SUCURSALES + RESUMEN (sticky bottom) */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border-t border-white/10 p-8 space-y-6">
                        {/* SLIDER */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-white font-black text-sm">¿Cuántas sucursales?</h4>
                                <span className="text-3xl font-black text-white">{locations}</span>
                            </div>

                            <input
                                type="range"
                                min="1"
                                max="20"
                                step="1"
                                value={locations}
                                onChange={(e) => setLocations(Number(e.target.value))}
                                className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-primary"
                                style={{
                                    background: `linear-gradient(to right, #22c55e 0%, #22c55e ${((locations - 1) / 19) * 100}%, rgba(255,255,255,0.1) ${((locations - 1) / 19) * 100}%, rgba(255,255,255,0.1) 100%)`
                                }}
                            />

                            <div className="text-center">
                                {locations === 1 && (
                                    <span className="text-white/60 text-sm">Sin descuento</span>
                                )}
                                {locations >= 2 && locations <= 5 && (
                                    <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full">
                                        <span className="font-black text-sm">-5%</span>
                                        <span className="text-xs">
                                            · Ahorrás €{((pricing.basePrice * locations * 0.05)).toFixed(2)}/mes
                                        </span>
                                    </div>
                                )}
                                {locations >= 6 && (
                                    <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-2 rounded-full">
                                        <span className="font-black text-sm">-10%</span>
                                        <span className="text-xs">
                                            · Ahorrás €{((pricing.basePrice * locations * 0.10)).toFixed(2)}/mes
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* RESUMEN PRECIO */}
                        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6">
                            <div className="flex items-baseline justify-between mb-2">
                                <div>
                                    <div className="text-white/60 text-xs mb-1">
                                        Plan {selectedPlanData.name} · {locations} {locations === 1 ? 'sucursal' : 'sucursales'}
                                    </div>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-4xl font-black text-white">
                                            €{pricing.monthlyTotal.toFixed(2)}
                                        </span>
                                        <span className="text-white/40 text-sm">/mes</span>
                                    </div>
                                </div>
                                {pricing.discount > 0 && (
                                    <div className="bg-primary text-white px-3 py-1 rounded-full text-xs font-black">
                                        -{pricing.discount}%
                                    </div>
                                )}
                            </div>
                            <div className="text-white/40 text-xs mt-3 pt-3 border-t border-white/10">
                                Sin permanencia · Cancela cuando quieras
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
