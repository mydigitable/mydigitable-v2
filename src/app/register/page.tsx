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
    CheckCircle2,
    Sparkles,
    Eye,
    EyeOff,
    Loader2,
    QrCode,
    BarChart3,
    Users,
    AlertCircle,
    Shield,
    Zap,
    Globe
} from "lucide-react";
import { countries } from "./countries";
import { registerAction } from "./actions";

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
        labelPlan: "Infraestructura",
        btnRegister: "REGISTRARSE",
        btnChange: "CAMBIAR",
        back: "Volver",
        searchPlaceholder: "Buscar país...",
        hasAccount: "¿Ya tienes cuenta?",
        loginLink: "Iniciar sesión",
        successTitle: "¡Cuenta creada!",
        successMessage: "Tu cuenta ha sido creada exitosamente. Ahora vamos a configurar tu negocio.",
        successButton: "Continuar",
        planSelected: "SELECCIONADO",
        planSelect: "ELEGIR",
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
        labelPlan: "Infrastructure",
        btnRegister: "REGISTER",
        btnChange: "CHANGE",
        back: "Back",
        searchPlaceholder: "Search country...",
        hasAccount: "Already have an account?",
        loginLink: "Log in",
        successTitle: "Account created!",
        successMessage: "Your account has been created successfully. Now let's set up your business.",
        successButton: "Continue",
        planSelected: "SELECTED",
        planSelect: "CHOOSE",
        errors: {
            mismatch: "Passwords do not match",
            short: "Password must be at least 6 characters",
            generic: "An unexpected error occurred."
        }
    }
};

const plansData = {
    Starter: { price: "0", dbCode: "basic", features: ["Menú digital", "QR básicos", "Pedidos online"] },
    Básico: { price: "40", dbCode: "pro", features: ["Todo de Starter", "0% Comisiones", "Multi-idioma", "Analytics"] },
    Pro: { price: "90", dbCode: "enterprise", features: ["Todo de Básico", "Beach GPS", "IA Sync", "Soporte 24/7"] }
};

export default function RegisterPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [selectedPlan, setSelectedPlan] = useState<"Starter" | "Básico" | "Pro">("Básico");

    const [restaurantName, setRestaurantName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const langCode = (searchParams.get("lang") || "ES").toUpperCase();
    const content = (translations as any)[langCode] || translations.ES;

    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [countrySearch, setCountrySearch] = useState("");
    const [selectedCountry, setSelectedCountry] = useState("España");
    const [isCountryOpen, setIsCountryOpen] = useState(false);
    const countryRef = useRef<HTMLDivElement>(null);

    const filteredCountries = countries.filter(c =>
        c.toLowerCase().includes(countrySearch.toLowerCase())
    );

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
        formData.append("plan", plansData[selectedPlan].dbCode);

        try {
            const result = await registerAction(formData);
            console.log("Register result:", result);

            if (result.error) {
                setErrorMessage(result.error);
                setIsLoading(false);
            } else if (result.success) {
                setIsLoading(false);
                setShowSuccessModal(true);
            }
        } catch (error) {
            console.error("Register error:", error);
            setErrorMessage(content.errors.generic);
            setIsLoading(false);
        }
    };

    const handleContinueToOnboarding = () => {
        setShowSuccessModal(false);
        router.push('/onboarding');
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

                        {/* Plan selector */}
                        <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-between">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-wider text-primary mb-0.5">{content.labelPlan}</p>
                                <p className="text-xl font-black text-slate-900">Plan {selectedPlan}</p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setIsPlanModalOpen(true)}
                                className="px-4 py-2 bg-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:border-primary transition-colors text-slate-900"
                            >
                                {content.btnChange}
                            </button>
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

            {/* LADO DERECHO */}
            <div className="hidden lg:flex flex-1 bg-slate-900 relative items-center justify-center p-20 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--primary)_1.2px,_transparent_1.2px)] [background-size:60px_60px] opacity-10" />
                <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px]" />

                <div className="relative z-10 max-w-sm w-full space-y-10">
                    <div>
                        <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-6">
                            ¿Por qué elegirnos?
                        </span>
                        <h2 className="text-4xl font-black text-white tracking-tighter leading-tight">
                            Plan <span className="text-primary italic">{selectedPlan}</span>
                        </h2>
                    </div>

                    <ul className="space-y-4">
                        {plansData[selectedPlan].features.map((f, i) => (
                            <li key={i} className="flex gap-3 items-center text-white/80">
                                <Check size={16} className="text-primary" />
                                {f}
                            </li>
                        ))}
                    </ul>

                    <div className="pt-6 border-t border-white/10">
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-black text-white italic">€{plansData[selectedPlan].price}</span>
                            <span className="text-white/40 text-sm">/mes</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MODAL PLANES */}
            <AnimatePresence>
                {isPlanModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsPlanModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md cursor-pointer"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="relative w-full max-w-3xl bg-white rounded-[3rem] shadow-2xl p-10 overflow-hidden"
                        >
                            <button
                                onClick={() => setIsPlanModalOpen(false)}
                                className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-full transition-all text-slate-400"
                            >
                                <X size={24} />
                            </button>

                            <div className="text-center mb-10">
                                <h3 className="text-3xl font-black tracking-tight text-slate-900">Elige tu plan</h3>
                            </div>

                            <div className="grid md:grid-cols-3 gap-4">
                                {Object.entries(plansData).map(([name, data]) => (
                                    <div
                                        key={name}
                                        onClick={() => { setSelectedPlan(name as any); setIsPlanModalOpen(false); }}
                                        className={`p-6 rounded-2xl border-2 transition-all cursor-pointer ${selectedPlan === name
                                                ? 'border-primary bg-primary/5 scale-105'
                                                : 'border-slate-100 hover:border-primary/30'
                                            }`}
                                    >
                                        <h4 className="text-xl font-black mb-1 text-slate-900">{name}</h4>
                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className="text-3xl font-black text-slate-900">€{data.price}</span>
                                            <span className="text-slate-400 text-xs">/mes</span>
                                        </div>
                                        <ul className="space-y-2 mb-4">
                                            {data.features.map((f, i) => (
                                                <li key={i} className="flex gap-2 items-center text-xs text-slate-600">
                                                    <Check size={12} className="text-primary" />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                        <div className={`w-full py-3 rounded-xl text-center text-xs font-black uppercase ${selectedPlan === name
                                                ? 'bg-primary text-white'
                                                : 'bg-slate-100 text-slate-400'
                                            }`}>
                                            {selectedPlan === name ? content.planSelected : content.planSelect}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* SUCCESS MODAL */}
            {showSuccessModal && (
                <div className="fixed inset-0 flex items-center justify-center p-6" style={{ zIndex: 9999 }}>
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
                    <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-10 text-center" style={{ zIndex: 10000 }}>
                        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-primary to-emerald-600 rounded-full flex items-center justify-center shadow-lg shadow-primary/30">
                            <Check size={48} className="text-white" strokeWidth={3} />
                        </div>
                        <h3 className="text-3xl font-black tracking-tight text-slate-900 mb-3">
                            {content.successTitle}
                        </h3>
                        <p className="text-slate-500 mb-8 leading-relaxed">
                            {content.successMessage}
                        </p>
                        <button
                            onClick={handleContinueToOnboarding}
                            className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                        >
                            {content.successButton}
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}