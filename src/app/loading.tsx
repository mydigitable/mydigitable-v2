"use client";

import { motion } from "framer-motion";

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white">
            <div className="relative">
                {/* Logo Animation */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        duration: 0.5,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                    }}
                    className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/20"
                >
                    <span className="text-white font-black text-3xl">M</span>
                </motion.div>

                {/* Pulse Ring */}
                <motion.div
                    initial={{ scale: 1, opacity: 0.5 }}
                    animate={{ scale: 2, opacity: 0 }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeOut",
                    }}
                    className="absolute inset-0 rounded-[2rem] border-2 border-primary"
                />

                {/* Text Loading */}
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-8 text-[10px] font-black uppercase tracking-[0.6em] text-slate-300 whitespace-nowrap"
                >
                    Cargando Experiencia
                </motion.p>
            </div>
        </div>
    );
}
