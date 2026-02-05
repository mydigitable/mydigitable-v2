"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
    ArrowRight,
    Mail,
    Lock,
    Loader2,
    AlertCircle,
    Eye,
    EyeOff,
    ArrowLeft
} from "lucide-react";

const languages = [
    { code: "ES", name: "Español", flag: "🇪🇸" },
    { code: "EN", name: "English", flag: "🇬🇧" },
    { code: "PT", name: "Português", flag: "🇵🇹" },
    { code: "IT", name: "Italiano", flag: "🇮🇹" },
    { code: "FR", name: "Français", flag: "🇫🇷" },
    { code: "DE", name: "Deutsch", flag: "🇩🇪" },
    { code: "EL", name: "Ελληνικά", flag: "🇬🇷" },
];

const translations = {
    ES: {
        title: "Bienvenido",
        subtitleAccent: "de nuevo",
        description: "Inicia sesión para acceder a tu dashboard",
        labelEmail: "Email",
        labelPass: "Contraseña",
        forgot: "¿Olvidaste tu contraseña?",
        btnLogin: "Iniciar sesión",
        noAccount: "¿No tienes cuenta?",
        register: "Regístrate gratis",
        back: "Volver",
        errorAuth: "Email o contraseña incorrectos",
        errorConfirm: "Debes confirmar tu email antes de iniciar sesión.",
        errorGeneric: "Ocurrió un error inesperado."
    },
    EN: {
        title: "Welcome",
        subtitleAccent: "back",
        description: "Log in to access your dashboard",
        labelEmail: "Email",
        labelPass: "Password",
        forgot: "Forgot your password?",
        btnLogin: "Log in",
        noAccount: "Don't have an account?",
        register: "Sign up for free",
        back: "Back",
        errorAuth: "Incorrect email or password",
        errorConfirm: "You must confirm your email before logging in.",
        errorGeneric: "An unexpected error occurred."
    },
    PT: {
        title: "Bem-vindo",
        subtitleAccent: "de volta",
        description: "Faça login para acessar seu dashboard",
        labelEmail: "E-mail",
        labelPass: "Senha",
        forgot: "Esqueceu sua senha?",
        btnLogin: "Entrar",
        noAccount: "Não tem uma conta?",
        register: "Registe-se gratuitamente",
        back: "Voltar",
        errorAuth: "E-mail ou senha incorretos",
        errorConfirm: "Você deve confirmar seu e-mail antes de fazer login.",
        errorGeneric: "Ocorreu um erro inesperado."
    },
    IT: {
        title: "Bentornato",
        subtitleAccent: "",
        description: "Accedi per accedere alla tua dashboard",
        labelEmail: "Email",
        labelPass: "Password",
        forgot: "Password dimenticata?",
        btnLogin: "Accedi",
        noAccount: "Non hai un account?",
        register: "Registrati gratuitamente",
        back: "Indietro",
        errorAuth: "Email o password errati",
        errorConfirm: "Devi confermare la tua email prima di accedere.",
        errorGeneric: "Si è verificato un errore imprevisto."
    },
    FR: {
        title: "Bon retour",
        subtitleAccent: "parmi nous",
        description: "Connectez-vous pour accéder à votre tableau de bord",
        labelEmail: "Email",
        labelPass: "Mot de passe",
        forgot: "Mot de passe oublié ?",
        btnLogin: "Se connecter",
        noAccount: "Vous n'avez pas de compte ?",
        register: "Inscrivez-vous gratuitement",
        back: "Retour",
        errorAuth: "Email ou mot de passe incorrect",
        errorConfirm: "Vous devez confirmer votre email avant de vous connecter.",
        errorGeneric: "Une erreur inattendue s'est produite."
    },
    DE: {
        title: "Willkommen",
        subtitleAccent: "zurück",
        description: "Melden Sie sich an, um auf Ihr Dashboard zuzugreifen",
        labelEmail: "E-Mail",
        labelPass: "Passwort",
        forgot: "Passwort vergessen?",
        btnLogin: "Anmelden",
        noAccount: "Sie haben noch kein Konto?",
        register: "Kostenlos registrieren",
        back: "Zurück",
        errorAuth: "Falsche E-Mail oder falsches Passwort",
        errorConfirm: "Sie müssen Ihre E-Mail bestätigen, bevor Sie sich anmelden.",
        errorGeneric: "Ein unerwarteter Fehler ist aufgetreten."
    },
    EL: {
        title: "Καλώς ήρθατε",
        subtitleAccent: "ξανά",
        description: "Συνδεθείτε για πρόσβαση στο dashboard σας",
        labelEmail: "Email",
        labelPass: "Κωδικός πρόσβασης",
        forgot: "Ξεχάσατε τον κωδικό σας;",
        btnLogin: "Σύνδεση",
        noAccount: "Δεν έχετε λογαριασμό;",
        register: "Εγγραφείτε δωρεάν",
        back: "Επιστροφή",
        errorAuth: "Λανθασμένο email ή κωδικός πρόσβασης",
        errorConfirm: "Πρέπει να επιβεβαιώσετε το email σας πριν συνδεθείτε.",
        errorGeneric: "Παρουσιάστηκε ένα απρόσμενο σφάλμα."
    }
};

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    const langCode = (searchParams.get("lang") || "ES").toUpperCase();
    const content = (translations as any)[langCode] || translations.ES;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                // Handle specific error cases
                if (authError.message.includes("Email not confirmed")) {
                    // Can't redirect without session - just show a helpful message
                    setError(langCode === "ES"
                        ? "Tu email no está confirmado. Revisa tu bandeja de entrada o contacta soporte."
                        : "Your email is not confirmed. Check your inbox or contact support.");
                } else if (authError.message.includes("Invalid login")) {
                    setError(content.errorAuth);
                } else {
                    setError(authError.message);
                }
                setLoading(false);
                return;
            }

            if (data.user) {
                // Check onboarding status
                const { data: restaurants } = await supabase
                    .from("restaurants")
                    .select("onboarding_completed")
                    .eq("owner_id", data.user.id)
                    .limit(1);

                if (restaurants && restaurants.length > 0 && restaurants[0].onboarding_completed) {
                    router.push("/dashboard");
                } else {
                    router.push("/onboarding");
                }
            }
        } catch (err) {
            setError(content.errorGeneric);
        } finally {
            setLoading(false);
        }
    };


    return (
        <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-20" />

            <Link
                href={`/?lang=${langCode}`}
                className="absolute top-10 left-10 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors group"
            >
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                {content.back}
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-md"
            >
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center shadow-lg shadow-primary/25">
                            <span className="text-white font-black text-2xl italic">M</span>
                        </div>
                        <span className="font-black text-2xl text-slate-900 tracking-tighter">MyDigitable</span>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        {content.title} <br />
                        <span className="text-primary italic">{content.subtitleAccent}</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">{content.description}</p>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 shadow-2xl shadow-slate-200/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2"><Mail size={12} /> {content.labelEmail}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                                className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-bold text-foreground"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2"><Lock size={12} /> {content.labelPass}</label>
                                <Link href={`/forgot-password?lang=${langCode}`} className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-emerald-600 transition-colors">
                                    {content.forgot}
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="w-full h-14 px-5 pr-12 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-bold text-foreground"
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

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100 animate-shake"
                            >
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="w-6 h-6 animate-spin" />
                            ) : (
                                <>
                                    {content.btnLogin}
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center space-y-4">
                    <p className="text-sm font-bold text-slate-500">
                        {content.noAccount}{" "}
                        <Link href={`/register?lang=${langCode}`} className="text-primary hover:text-emerald-600 transition-colors underline decoration-2 underline-offset-4">
                            {content.register}
                        </Link>
                    </p>
                </div>
            </motion.div>
        </main>
    );
}
