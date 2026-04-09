"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check } from "lucide-react";
import type { DailyMenu, DailyMenuOption, Theme } from "../types";

interface DailyMenuModalProps {
    menu: DailyMenu;
    theme: Theme;
    onClose: () => void;
    onAdd: (selections: Record<string, string>) => void;
}

export default function DailyMenuModal({
    menu,
    theme,
    onClose,
    onAdd,
}: DailyMenuModalProps) {
    const [selections, setSelections] = useState<Record<string, string>>({});

    const allSelected = menu.courses.every(course =>
        !course.required || selections[course.id]
    );

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
                className={`${theme.cardBg} w-full rounded-t-3xl max-h-[90vh] overflow-y-auto`}
            >
                <div className="p-4 border-b border-gray-100 sticky top-0 bg-inherit z-10">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className={`font-bold text-xl ${theme.text}`}>{menu.name}</h2>
                            <span className={`text-2xl font-black ${theme.primaryText}`}>€{menu.price}</span>
                        </div>
                        <button onClick={onClose} className="p-2">
                            <X size={20} />
                        </button>
                    </div>
                </div>

                <div className="p-4 space-y-6">
                    {menu.courses.map((course, courseIndex) => (
                        <div key={course.id}>
                            <h3 className={`font-bold ${theme.text} mb-3 flex items-center gap-2`}>
                                <span className="text-lg">
                                    {courseIndex === 0 ? '1️⃣' : courseIndex === 1 ? '2️⃣' : '3️⃣'}
                                </span>
                                {course.name}
                                {course.required && <span className="text-red-500">*</span>}
                            </h3>
                            <div className="space-y-2">
                                {course.options.map((option: DailyMenuOption) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setSelections(prev => ({ ...prev, [course.id]: option.id }))}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex justify-between items-center ${selections[course.id] === option.id
                                            ? `border-green-500 bg-green-50`
                                            : `border-gray-200 ${theme.cardBg}`
                                            }`}
                                    >
                                        <span className={`font-medium ${theme.text}`}>{option.name}</span>
                                        <div className="flex items-center gap-2">
                                            {option.extra_price && (
                                                <span className={`text-sm ${theme.primaryText} font-bold`}>
                                                    +€{option.extra_price}
                                                </span>
                                            )}
                                            {selections[course.id] === option.id && (
                                                <Check size={20} className="text-green-500" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Includes */}
                    <div className={`${theme.accent} rounded-xl p-4`}>
                        <p className={`text-sm font-bold ${theme.text} mb-2`}>Incluye:</p>
                        <div className="flex flex-wrap gap-2">
                            {menu.includes_bread && <span className="text-sm">🍞 Pan</span>}
                            {menu.includes_drink && <span className="text-sm">🥤 Bebida</span>}
                            {menu.includes_dessert && <span className="text-sm">🍰 Postre</span>}
                            {menu.includes_coffee && <span className="text-sm">☕ Café</span>}
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100 sticky bottom-0 bg-inherit">
                    <button
                        onClick={() => onAdd(selections)}
                        disabled={!allSelected}
                        className={`w-full ${theme.primary} text-white py-4 rounded-2xl font-bold disabled:opacity-50`}
                    >
                        Añadir al pedido · €{menu.price}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
