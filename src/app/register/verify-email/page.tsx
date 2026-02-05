"use client";

import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const translations = {
    ES: {
        title: "¡Casi listo!",
        accent: "Verifica tu email.",
        description: "Hemos enviado un enlace de confirmación a:",
        whatNext: "¿Qué hacer ahora?",
        step1: "Revisa tu bandeja de entrada (y spam).",
        step2: "Pulsa en el botón \"Confirmar Cuenta\".",
        step3: "Accede a tu panel de MyDigitable.",
        btnLogin: "IR AL LOGIN",
        resend: "Reenviar enlace de confirmación",
        back: "Volver al registro"
    },
    EN: {
        title: "Almost ready!",
        accent: "Verify your email.",
        description: "We have sent a confirmation link to:",
        whatNext: "What to do now?",
        step1: "Check your inbox (and spam).",
        step2: "Click the \"Confirm Account\" button.",
        step3: "Access your MyDigitable panel.",
        btnLogin: "GO TO LOGIN",
        resend: "Resend confirmation link",
        back: "Back to registration"
    },
    PT: {
        title: "Quase pronto!",
        accent: "Verifique seu email.",
        description: "Enviamos um link de confirmação para:",
        whatNext: "O que fazer agora?",
        step1: "Verifique sua caixa de entrada (e spam).",
        step2: "Clique no botão \"Confirmar Conta\".",
        step3: "Acesse seu painel MyDigitable.",
        btnLogin: "IR PARA O LOGIN",
        resend: "Reenviar link de confirmação",
        back: "Voltar ao registro"
    },
    IT: {
        title: "Quasi pronto!",
        accent: "Verifica la tua email.",
        description: "Abbiamo inviato un link di conferma a:",
        whatNext: "Cosa fare ora?",
        step1: "Controlla la tua posta in arrivo (e spam).",
        step2: "Fai clic sul pulsante \"Conferma Account\".",
        step3: "Accedi al tuo pannello MyDigitable.",
        btnLogin: "VAI AL LOGIN",
        resend: "Reinvia link di conferma",
        back: "Torna alla registrazione"
    },
    FR: {
        title: "Presque prêt !",
        accent: "Vérifiez votre email.",
        description: "Nous avons envoyé un lien de confirmation à :",
        whatNext: "Que faire maintenant ?",
        step1: "Vérifiez votre boîte de réception (et vos spams).",
        step2: "Cliquez sur le bouton \"Confirmer le compte\".",
        step3: "Accédez à votre panneau MyDigitable.",
        btnLogin: "ALLER À LA CONNEXION",
        resend: "Renvoyer le lien de confirmation",
        back: "Retour à l'inscription"
    },
    DE: {
        title: "Fast fertig!",
        accent: "Verifiziere deine E-Mail.",
        description: "Wir haben einen Bestätigungslink gesendet an:",
        whatNext: "Was ist jetzt zu tun?",
        step1: "Überprüfe deinen Posteingang (und Spam).",
        step2: "Klicke auf die Schaltfläche \"Konto bestätigen\".",
        step3: "Greife auf dein MyDigitable-Panel zu.",
        btnLogin: "ZUM LOGIN",
        resend: "Bestätigungslink erneut senden",
        back: "Zurück zur Registrierung"
    },
    EL: {
        title: "Σχεδόν έτοιμο!",
        accent: "Επιβεβαιώστε το email σας.",
        description: "Στείλαμε έναν σύνδεσμο επιβεβαίωσης στο:",
        whatNext: "Τι να κάνετε τώρα;",
        step1: "Ελέγξτε τα εισερχόμενά σας (και τα ανεπιθύμητα).",
        step2: "Πατήστε στο κουμπί \"Επιβεβαίωση Λογαριασμού\".",
        step3: "Αποκτήστε πρόσβαση στο πάνελ του MyDigitable.",
        btnLogin: "ΜΕΤΑΒΑΣΗ ΣΤΟ LOGIN",
        resend: "Επαναποστολή συνδέσμου επιβεβαίωσης",
        back: "Επιστροφή στην εγγραφή"
    }
};

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email") || "tu email";
    const langCode = (searchParams.get("lang") || "ES").toUpperCase();
    const content = (translations as any)[langCode] || translations.ES;

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Fondo decorativo premium */}
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary via-accent to-primary opacity-20" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary/5 rounded-full blur-[100px]" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full text-center space-y-8 relative z-10"
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
                            <CheckCircle2 size={16} className="text-white" />
                        </motion.div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h1 className="text-4xl font-black tracking-tighter text-slate-900">
                        {content.title} <br />
                        <span className="text-primary italic">{content.accent}</span>
                    </h1>
                    <p className="text-slate-500 font-medium leading-relaxed">
                        {content.description} <br />
                        <span className="text-slate-900 font-black">{email}</span>
                    </p>
                </div>

                <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex flex-col gap-4">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{content.whatNext}</p>
                    <ul className="text-left space-y-3">
                        <li className="flex gap-3 text-sm font-bold text-slate-600">
                            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] text-primary border border-slate-100">1</div>
                            {content.step1}
                        </li>
                        <li className="flex gap-3 text-sm font-bold text-slate-600">
                            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] text-primary border border-slate-100">2</div>
                            {content.step2}
                        </li>
                        <li className="flex gap-3 text-sm font-bold text-slate-600">
                            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[10px] text-primary border border-slate-100">3</div>
                            {content.step3}
                        </li>
                    </ul>
                </div>

                <div className="flex flex-col gap-4">
                    <Link
                        href={`/login?lang=${langCode}`}
                        className="w-full h-16 bg-primary text-white rounded-2xl font-black text-lg uppercase tracking-[0.2em] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                    >
                        {content.btnLogin}
                        <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </Link>

                    <button className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
                        {content.resend}
                    </button>
                </div>

                <Link
                    href={`/register?lang=${langCode}`}
                    className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <ArrowLeft size={14} />
                    {content.back}
                </Link>
            </motion.div>
        </div>
    );
}
