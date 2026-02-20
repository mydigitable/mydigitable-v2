"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import type { Theme, DietaryPreferences } from "../types";
import { allergensList } from "../types";

interface DietaryModalProps {
    prefs: DietaryPreferences;
    theme: Theme;
    onUpdate: (prefs: DietaryPreferences) => void;
    onClose: () => void;
}

export default function DietaryModal({
    prefs,
    theme,
    onUpdate,
    onClose,
}: DietaryModalProps) {
    const [local, setLocal] = useState(prefs);

    const toggleAllergen = (id: string) => {
        setLocal(prev => ({
            ...prev,
            allergies: prev.allergies.includes(id)
                ? prev.allergies.filter(a => a !== id)
                : [...prev.allergies, id]
        }));
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-end"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                onClick={(e) => e.stopPropagation()}
                className={`${theme.cardBg} w-full rounded-t-3xl max-h-[85vh] overflow-y-auto`}
            >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-inherit">
                    <h2 className={`font-bold text-xl ${theme.text}`}>Preferencias Dietéticas</h2>
                    <button onClick={onClose} className="p-2">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 space-y-6">
                    {/* Diet Type */}
                    <div>
                        <h3 className={`font-bold ${theme.text} mb-3`}>Tipo de dieta</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { key: 'isVegetarian' as const, label: 'Vegetariano', icon: '🥬' },
                                { key: 'isVegan' as const, label: 'Vegano', icon: '🌱' },
                                { key: 'isCeliac' as const, label: 'Sin Gluten', icon: '🌾' },
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => setLocal(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                    className={`p-3 rounded-xl border-2 text-center transition-all ${local[item.key]
                                        ? 'border-green-500 bg-green-50'
                                        : `border-gray-200 ${theme.cardBg}`
                                        }`}
                                >
                                    <span className="text-2xl block mb-1">{item.icon}</span>
                                    <span className={`text-xs font-medium ${theme.text}`}>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Allergens */}
                    <div>
                        <h3 className={`font-bold ${theme.text} mb-3`}>Alergias e intolerancias</h3>
                        <div className="grid grid-cols-4 gap-2">
                            {allergensList.map((allergen) => (
                                <button
                                    key={allergen.id}
                                    onClick={() => toggleAllergen(allergen.id)}
                                    className={`p-2 rounded-xl border-2 text-center transition-all ${local.allergies.includes(allergen.id)
                                        ? 'border-red-500 bg-red-50'
                                        : `border-gray-200 ${theme.cardBg}`
                                        }`}
                                >
                                    <span className="text-xl block">{allergen.emoji}</span>
                                    <span className={`text-[10px] ${theme.text}`}>{allergen.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <h3 className={`font-bold ${theme.text} mb-3`}>Notas adicionales sobre alergias</h3>
                        <textarea
                            value={local.allergyNotes}
                            onChange={(e) => setLocal(prev => ({ ...prev, allergyNotes: e.target.value }))}
                            placeholder="Describe cualquier alergia o intolerancia específica..."
                            rows={3}
                            className={`w-full p-3 ${theme.accent} rounded-xl text-sm resize-none focus:outline-none ${theme.text}`}
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 sticky bottom-0 bg-inherit">
                    <button
                        onClick={() => {
                            onUpdate(local);
                            onClose();
                        }}
                        className={`w-full ${theme.primary} text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2`}
                    >
                        <Check size={20} />
                        Guardar preferencias
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
