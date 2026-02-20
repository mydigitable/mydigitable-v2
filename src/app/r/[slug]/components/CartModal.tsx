"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Minus, AlertTriangle } from "lucide-react";
import type { CartItem, Theme, DietaryPreferences } from "../types";
import { allergensList } from "../types";

interface CartModalProps {
    cart: CartItem[];
    theme: Theme;
    dietaryPrefs: DietaryPreferences;
    onClose: () => void;
    onCheckout: () => void;
    onAdd: (productId: string) => void;
    onRemove: (productId: string) => void;
}

export default function CartModal({
    cart,
    theme,
    dietaryPrefs,
    onClose,
    onCheckout,
    onAdd,
    onRemove,
}: CartModalProps) {
    const [customerNotes, setCustomerNotes] = useState('');
    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                onClick={(e) => e.stopPropagation()}
                className={`absolute bottom-0 left-0 right-0 ${theme.cardBg} rounded-t-3xl max-h-[85vh] flex flex-col`}
            >
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                    <h2 className={`font-bold text-xl ${theme.text}`}>Tu pedido</h2>
                    <button onClick={onClose} className="p-2">
                        <X size={20} className={theme.textSecondary} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="space-y-3">
                        {cart.map((item) => (
                            <div key={item.product.id} className={`flex items-center gap-3 p-3 ${theme.accent} rounded-xl`}>
                                {item.product.image_url && (
                                    <img
                                        src={item.product.image_url}
                                        alt=""
                                        className="w-14 h-14 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex-1">
                                    <h4 className={`font-bold ${theme.text}`}>{item.product.name_es}</h4>
                                    <span className={theme.primaryText}>€{(item.product.price * item.quantity).toFixed(2)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => onRemove(item.product.id)}
                                        className={`w-8 h-8 ${theme.cardBg} rounded-full flex items-center justify-center`}
                                    >
                                        <Minus size={14} />
                                    </button>
                                    <span className={`font-bold ${theme.text}`}>{item.quantity}</span>
                                    <button
                                        onClick={() => onAdd(item.product.id)}
                                        className={`w-8 h-8 ${theme.primary} text-white rounded-full flex items-center justify-center`}
                                    >
                                        <Plus size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Dietary preferences summary */}
                    {(dietaryPrefs.isVegetarian || dietaryPrefs.isVegan || dietaryPrefs.allergies.length > 0 || dietaryPrefs.otherNotes) && (
                        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <h4 className="font-bold text-yellow-800 mb-2 flex items-center gap-2">
                                <AlertTriangle size={16} />
                                Preferencias dietéticas
                            </h4>
                            {dietaryPrefs.isVegan && <p className="text-sm text-yellow-700">🌱 Vegano</p>}
                            {dietaryPrefs.isVegetarian && !dietaryPrefs.isVegan && <p className="text-sm text-yellow-700">🥬 Vegetariano</p>}
                            {dietaryPrefs.isCeliac && <p className="text-sm text-yellow-700">🌾 Sin gluten (celiaco)</p>}
                            {dietaryPrefs.allergies.length > 0 && (
                                <p className="text-sm text-yellow-700">
                                    ⚠️ Alergias: {dietaryPrefs.allergies.map((a: string) => {
                                        const allergen = allergensList.find(al => al.id === a);
                                        return allergen ? allergen.name : a;
                                    }).join(', ')}
                                </p>
                            )}
                            {dietaryPrefs.allergyNotes && (
                                <p className="text-sm text-yellow-700">📝 {dietaryPrefs.allergyNotes}</p>
                            )}
                        </div>
                    )}

                    {/* Customer notes */}
                    <div className="mt-4">
                        <label className={`block text-sm font-bold ${theme.text} mb-2`}>
                            Notas adicionales
                        </label>
                        <textarea
                            value={customerNotes}
                            onChange={(e) => setCustomerNotes(e.target.value)}
                            placeholder="Ej: Sin cebolla, poco hecho, mesa junto a la ventana..."
                            rows={2}
                            className={`w-full p-3 ${theme.accent} rounded-xl text-sm resize-none focus:outline-none ${theme.text}`}
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <span className={`font-bold ${theme.text}`}>Total</span>
                        <span className={`text-2xl font-black ${theme.primaryText}`}>€{total.toFixed(2)}</span>
                    </div>
                    <button
                        onClick={onCheckout}
                        className={`w-full ${theme.primary} text-white py-4 rounded-2xl font-bold`}
                    >
                        Confirmar Pedido
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
