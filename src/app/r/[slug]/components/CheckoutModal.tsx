"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Check, AlertTriangle, Utensils, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { CartItem, Theme, DietaryPreferences, Restaurant } from "../types";

function extractName(name: unknown): string {
    if (!name) return '';
    if (typeof name === 'string') return name;
    if (typeof name === 'object' && name !== null) {
        const n = name as Record<string, string>;
        return n.es || n.en || Object.values(n)[0] || '';
    }
    return '';
}

interface CheckoutModalProps {
    cart: CartItem[];
    theme: Theme;
    restaurant: Restaurant;
    tableNumber: string | null;
    dietaryPrefs: DietaryPreferences;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CheckoutModal({
    cart,
    theme,
    restaurant,
    tableNumber,
    dietaryPrefs,
    onClose,
    onSuccess,
}: CheckoutModalProps) {
    const [step, setStep] = useState<'details' | 'confirm' | 'success'>('details');
    const [sending, setSending] = useState(false);
    const [customerData, setCustomerData] = useState({
        name: '',
        phone: '',
        email: '',
        notes: '',
    });

    const supabase = createClient();

    const total = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    const handleSubmit = async () => {
        if (!customerData.name) return;

        setSending(true);

        try {
            // Create order
            const { data: order, error } = await supabase
                .from('orders')
                .insert({
                    restaurant_id: restaurant.id,
                    table_number: tableNumber ? parseInt(tableNumber) : null,
                    order_type: tableNumber ? 'dine_in' : 'takeaway',
                    status: 'pending',
                    guest_name: customerData.name,
                    customer_phone: customerData.phone || null,
                    customer_email: customerData.email || null,
                    subtotal: total,
                    total: total,
                    notes: customerData.notes || null,
                    dietary_notes: dietaryPrefs.allergyNotes || null,
                } as never)
                .select()
                .single();

            if (error) throw error;

            // Create order items
            const orderItems = cart.map(item => ({
                order_id: (order as Record<string, unknown>).id as string,
                product_id: item.product.id,
                product_name: extractName(item.product.name),
                quantity: item.quantity,
                unit_price: item.product.price,
                subtotal: item.product.price * item.quantity,
                notes: item.notes || null,
            }));

            await supabase.from('order_items').insert(orderItems as never);

            setStep('success');
            setTimeout(() => {
                onSuccess();
            }, 3000);
        } catch (error) {
            console.error('Error creating order:', error);
        } finally {
            setSending(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
            onClick={onClose}
        >
            <motion.div
                initial={{ y: '100%', opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: '100%', opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className={`w-full max-w-lg ${theme.cardBg} rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden`}
            >
                {step === 'success' ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6"
                        >
                            <Check className="text-green-600" size={48} />
                        </motion.div>
                        <h2 className={`text-2xl font-black ${theme.text} mb-2`}>¡Pedido Enviado!</h2>
                        <p className={`${theme.textSecondary} text-center mb-4`}>
                            Tu pedido ha sido recibido y está siendo preparado
                        </p>
                        <div className={`${theme.accent} rounded-xl p-4 text-center w-full`}>
                            <p className={`text-sm ${theme.textSecondary}`}>Total del pedido</p>
                            <p className={`text-3xl font-black ${theme.primaryText}`}>€{total.toFixed(2)}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className={`p-4 border-b ${theme.border} flex items-center justify-between`}>
                            <div>
                                <h2 className={`font-bold text-xl ${theme.text}`}>Finalizar Pedido</h2>
                                <p className={`text-sm ${theme.textSecondary}`}>{cart.length} productos</p>
                            </div>
                            <button onClick={onClose} className="p-2">
                                <X size={20} className={theme.textSecondary} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {/* Order Summary */}
                            <div className={`${theme.accent} rounded-xl p-4`}>
                                <h3 className={`font-bold ${theme.text} mb-3`}>Tu Pedido</h3>
                                <div className="space-y-2">
                                    {cart.map((item) => (
                                        <div key={item.product.id} className="flex justify-between">
                                            <span className={theme.text}>
                                                {item.quantity}x {extractName(item.product.name)}
                                            </span>
                                            <span className={`font-bold ${theme.text}`}>
                                                €{(item.product.price * item.quantity).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                    <div className={`flex justify-between pt-2 border-t ${theme.border}`}>
                                        <span className={`font-bold ${theme.text}`}>Total</span>
                                        <span className={`text-xl font-black ${theme.primaryText}`}>€{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Customer Details */}
                            <div>
                                <h3 className={`font-bold ${theme.text} mb-3`}>Tus Datos</h3>
                                <div className="space-y-3">
                                    <div>
                                        <label className={`block text-sm font-medium ${theme.text} mb-1`}>
                                            Nombre <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={customerData.name}
                                            onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="Tu nombre"
                                            className={`w-full px-4 py-3 ${theme.accent} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 ${theme.text}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium ${theme.text} mb-1`}>
                                            Teléfono (opcional)
                                        </label>
                                        <input
                                            type="tel"
                                            value={customerData.phone}
                                            onChange={(e) => setCustomerData(prev => ({ ...prev, phone: e.target.value }))}
                                            placeholder="Para avisarte cuando esté listo"
                                            className={`w-full px-4 py-3 ${theme.accent} rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 ${theme.text}`}
                                        />
                                    </div>
                                    <div>
                                        <label className={`block text-sm font-medium ${theme.text} mb-1`}>
                                            Notas del pedido (opcional)
                                        </label>
                                        <textarea
                                            value={customerData.notes}
                                            onChange={(e) => setCustomerData(prev => ({ ...prev, notes: e.target.value }))}
                                            placeholder="Ej: Sin cebolla, poco hecho..."
                                            rows={2}
                                            className={`w-full px-4 py-3 ${theme.accent} rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-green-500/20 ${theme.text}`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Table Number */}
                            {tableNumber && (
                                <div className={`${theme.accent} rounded-xl p-4 flex items-center gap-3`}>
                                    <div className={`w-10 h-10 ${theme.primary} rounded-xl flex items-center justify-center`}>
                                        <Utensils size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <p className={`font-bold ${theme.text}`}>Mesa {tableNumber}</p>
                                        <p className={`text-sm ${theme.textSecondary}`}>Tu pedido llegará directamente a tu mesa</p>
                                    </div>
                                </div>
                            )}

                            {/* Dietary Notes */}
                            {(dietaryPrefs.isVegetarian || dietaryPrefs.isVegan || dietaryPrefs.allergies.length > 0) && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle size={18} className="text-yellow-600 mt-0.5" />
                                        <div>
                                            <p className="font-bold text-yellow-800 mb-1">Preferencias dietéticas</p>
                                            <p className="text-sm text-yellow-700">
                                                {dietaryPrefs.isVegan && '🌱 Vegano '}
                                                {dietaryPrefs.isVegetarian && !dietaryPrefs.isVegan && '🥬 Vegetariano '}
                                                {dietaryPrefs.isCeliac && '🌾 Sin gluten '}
                                                {dietaryPrefs.allergies.length > 0 && `· ${dietaryPrefs.allergies.length} alérgenos excluidos`}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className={`p-4 border-t ${theme.border}`}>
                            <button
                                onClick={handleSubmit}
                                disabled={!customerData.name || sending}
                                className={`w-full ${theme.primary} text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50`}
                            >
                                {sending ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <Check size={20} />
                                        Confirmar Pedido · €{total.toFixed(2)}
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </motion.div>
        </motion.div>
    );
}
