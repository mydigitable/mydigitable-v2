"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight, Sparkles, PartyPopper } from "lucide-react";
import confetti from "canvas-confetti";

const translations = {
    ES: {
        title: "¡Cuenta confirmada!",
        description: "Tu cuenta ha sido verificada exitosamente.",
        description2: "¡Ya puedes empezar a crear tu menú digital!",
        whatNow: "Lo que puedes hacer ahora:",
        feat1: "Configurar tu restaurante",
        feat2: "Crear categorías y productos",
        feat3: "Generar tu código QR",
        feat4: "Compartir tu menú digital",
        btnDashboard: "Ir a mi Dashboard",
        redirecting: "Redirigiendo automáticamente en"
    },
    EN: {
        title: "Account confirmed!",
        description: "Your account has been successfully verified.",
        description2: "You can now start creating your digital menu!",
        whatNow: "What you can do now:",
        feat1: "Configure your restaurant",
        feat2: "Create categories and products",
        feat3: "Generate your QR code",
        feat4: "Share your digital menu",
        btnDashboard: "Go to my Dashboard",
        redirecting: "Automatically redirecting in"
    },
    PT: {
        title: "Conta confirmada!",
        description: "Sua conta foi verificada com sucesso.",
        description2: "Agora você pode começar a criar seu cardápio digital!",
        whatNow: "O que você pode fazer agora:",
        feat1: "Configurar seu restaurante",
        feat2: "Criar categorias e produtos",
        feat3: "Gerar seu código QR",
        feat4: "Compartilhe seu cardápio digital",
        btnDashboard: "Ir para meu Dashboard",
        redirecting: "Redirecionando automaticamente em"
    },
    IT: {
        title: "Conto confermato!",
        description: "Il tuo account è stato verificato con successo.",
        description2: "Ora puoi iniziare a creare il tuo menu digitale!",
        whatNow: "Cosa puoi fare ora:",
        feat1: "Configura il tuo ristorante",
        feat2: "Crea categorie e prodotti",
        feat3: "Genera il tuo codice QR",
        feat4: "Condividi il tuo menu digitale",
        btnDashboard: "Vai al mio Dashboard",
        redirecting: "Reindirizzamento automatico in"
    },
    FR: {
        title: "Compte confirmé !",
        description: "Votre compte a été vérifié avec succès.",
        description2: "Vous pouvez maintenant commencer à créer votre menu numérique !",
        whatNow: "Ce que vous pouvez faire maintenant :",
        feat1: "Configurez votre restaurant",
        feat2: "Créer des catégories et des produits",
        feat3: "Générez votre code QR",
        feat4: "Partagez votre menu numérique",
        btnDashboard: "Aller à mon tableau de bord",
        redirecting: "Redirection automatique dans"
    },
    DE: {
        title: "Konto bestätigt!",
        description: "Ihr Konto wurde erfolgreich verifiziert.",
        description2: "Sie können jetzt mit der Erstellung Ihrer digitalen Speisekarte beginnen!",
        whatNow: "Was Sie jetzt tun können:",
        feat1: "Konfigurieren Sie Ihr Restaurant",
        feat2: "Kategorien und Produkte erstellen",
        feat3: "Generieren Sie Ihren QR-Code",
        feat4: "Teilen Sie Ihr digitales Menü",
        btnDashboard: "Gehe zu meinem Dashboard",
        redirecting: "Automatische Weiterleitung in"
    },
    EL: {
        title: "Ο λογαριασμός επιβεβαιώθηκε!",
        description: "Ο λογαριασμός σας επαληθεύτηκε με επιτυχία.",
        description2: "Τώρα μπορείτε να ξεκινήσετε τη δημιουργία του ψηφιακού σας καταλόγου!",
        whatNow: "Τι μπορείτε να κάνετε τώρα:",
        feat1: "Διαμορφώστε το εστιατόριό σας",
        feat2: "Δημιουργήστε κατηγορίες και προϊόντα",
        feat3: "Δημιουργήστε τον κωδικό QR σας",
        feat4: "Μοιραστείτε τον ψηφιακό σας κατάλογο",
        btnDashboard: "Μετάβαση στο Dashboard μου",
        redirecting: "Αυτόματη ανακατεύθυνση σε"
    }
};

export default function ConfirmedPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [countdown, setCountdown] = useState(5);
    const langCode = (searchParams.get("lang") || "ES").toUpperCase();
    const content = (translations as any)[langCode] || translations.ES;

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
                className="relative w-full max-lg"
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
                        {content.title}
                    </motion.h1>

                    {/* Mensaje */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-gray-600 text-lg mb-8"
                    >
                        {content.description}
                        <br />
                        {content.description2}
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
                            {content.whatNow}
                        </p>
                        <ul className="space-y-2 text-gray-600">
                            <li className="flex items-center gap-2 text-sm font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                {content.feat1}
                            </li>
                            <li className="flex items-center gap-2 text-sm font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                {content.feat2}
                            </li>
                            <li className="flex items-center gap-2 text-sm font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                {content.feat3}
                            </li>
                            <li className="flex items-center gap-2 text-sm font-medium">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                {content.feat4}
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
                            {content.btnDashboard}
                            <ArrowRight className="w-5 h-5" />
                        </Link>

                        <p className="text-sm text-gray-400 mt-4">
                            {content.redirecting} {countdown} {langCode === "ES" ? "segundos" : "seconds"}...
                        </p>
                    </motion.div>
                </div>
            </motion.div>
        </main>
    );
}
