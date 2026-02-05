"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
    Mail,
    Loader2,
    CheckCircle,
    AlertCircle,
    ArrowRight,
    ArrowLeft
} from "lucide-react";

const translations = {
    ES: {
        title: "Recuperar",
        accent: "contraseña",
        description: "Te enviaremos un enlace para restablecer tu contraseña",
        labelEmail: "Email de tu cuenta",
        btnSend: "ENVIAR ENLACE",
        successTitle: "¡Email enviado!",
        successDesc: "Revisa tu bandeja de entrada para restablecer tu contraseña.",
        back: "Volver al login",
        error: "No pudimos enviar el email. Verifica que el email esté registrado."
    },
    EN: {
        title: "Recover",
        accent: "password",
        description: "We'll send you a link to reset your password",
        labelEmail: "Your account email",
        btnSend: "SEND LINK",
        successTitle: "Email sent!",
        successDesc: "Check your inbox to reset your password.",
        back: "Back to login",
        error: "We couldn't send the email. Please verify the email is registered."
    }
};

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const searchParams = useSearchParams();
    const supabase = createClient();

    const langCode = (searchParams.get("lang") || "ES").toUpperCase();
    const content = (translations as any)[langCode] || translations.ES;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });

            if (resetError) {
                setError(content.error);
            } else {
                setSuccess(true);
            }
        } catch (err) {
            setError(content.error);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-20" />
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center space-y-8"
                >
                    <div className="flex justify-center">
                        <div className="w-24 h-24 rounded-[2.5rem] bg-primary/10 flex items-center justify-center relative shadow-2xl shadow-primary/10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", damping: 12, delay: 0.2 }}
                            >
                                <Mail size={48} className="text-primary" />
                            </motion.div>
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5 }}
                                className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center"
                            >
                                <CheckCircle size={16} className="text-white" />
                            </motion.div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-4xl font-black tracking-tighter text-slate-900">
                            {content.successTitle}
                        </h1>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            {content.successDesc}
                            <br />
                            <span className="text-slate-900 font-black">{email}</span>
                        </p>
                    </div>

                    <Link
                        href={`/login?lang=${langCode}`}
                        className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                    >
                        {content.back.toUpperCase()}
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </motion.div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-20" />

            <Link
                href={`/login?lang=${langCode}`}
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
                        <span className="text-primary italic">{content.accent}</span>
                    </h1>
                    <p className="text-slate-500 font-medium mt-2">{content.description}</p>
                </div>

                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-10 shadow-2xl shadow-slate-200/50">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                                <Mail size={12} /> {content.labelEmail}
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                required
                                className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-bold text-foreground"
                            />
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-3 p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100"
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
                                    {content.btnSend}
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </motion.div>
        </main>
    );
}
