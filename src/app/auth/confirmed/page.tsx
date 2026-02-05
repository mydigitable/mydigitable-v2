"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowRight, Sparkles, PartyPopper } from "lucide-react";
import confetti from "canvas-confetti";

export default function ConfirmedPage() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        // Lanzar confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#22C55E", "#FACC15", "#10B981"],
        });

        // Countdown para redirigir
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    router.push("/dashboard");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [router]);

    return (
        <main className="min-h-screen bg-gradient-to-br from-green-50 via-white to-yellow-50 flex items-center justify-center p-4">
            {/* Elementos decorativos */}
            <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative w-full max-w-lg"
            >
                <div className="bg-white rounded-3xl shadow-xl shadow-green-500/10 border border-gray-100 p-10 text-center">
                    {/* Icono de éxito */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                        className="relative w-24 h-24 mx-auto mb-8"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary to-emerald-600 rounded-full animate-pulse opacity-20" />
                        <div className="relative w-full h-full rounded-full bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
                            <CheckCircle className="w-12 h-12 text-white" />
                        </div>
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className="absolute -top-2 -right-2"
                        >
                            <PartyPopper className="w-8 h-8 text-accent" />
                        </motion.div>
                    </motion.div>

                    {/* Título */}
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl font-semibold text-gray-900 mb-4"
                    >
                        ¡Cuenta confirmada!
                    </motion.h1>

                    {/* Mensaje */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-600 text-lg mb-8"
                    >
                        Tu cuenta ha sido verificada exitosamente.
                        <br />
                        ¡Ya puedes empezar a crear tu menú digital!
                    </motion.p>

                    {/* Features que vienen */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-8 text-left"
                    >
                        <p className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-accent" />
                            Lo que puedes hacer ahora:
                        </p>
                        <ul className="space-y-2 text-gray-600">
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Configurar tu restaurante
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Crear categorías y productos
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Generar tu código QR
                            </li>
                            <li className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                Compartir tu menú digital
                            </li>
                        </ul>
                    </motion.div>

                    {/* Botón y countdown */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Link
                            href="/dashboard"
                            className="inline-flex items-center justify-center gap-2 w-full py-4 rounded-xl bg-gradient-to-r from-primary to-emerald-600 text-white font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all"
                        >
                            Ir a mi Dashboard
                            <ArrowRight className="w-5 h-5" />
                        </Link>

                        <p className="text-sm text-gray-400 mt-4">
                            Redirigiendo automáticamente en {countdown} segundos...
                        </p>
                    </motion.div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-400 mt-6">
                    ¿Necesitas ayuda? Escríbenos a{" "}
                    <a href="mailto:soporte@mydigitable.com" className="text-primary hover:underline">
                        soporte@mydigitable.com
                    </a>
                </p>
            </motion.div>
        </main>
    );
}
