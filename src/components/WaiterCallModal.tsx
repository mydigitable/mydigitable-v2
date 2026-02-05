"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Bell,
    X,
    Check,
    Loader2,
    ChevronRight,
} from "lucide-react";

interface WaiterCallModalProps {
    isOpen: boolean;
    onClose: () => void;
    restaurantId: string;
    tableNumber: number | null;
    theme?: any;
}

const callOptions = [
    {
        category: 'Asistencia',
        icon: '🙋',
        items: [
            { id: 'waiter', label: 'Llamar camarero', emoji: '🙋', priority: 'normal' },
            { id: 'question', label: 'Tengo una pregunta', emoji: '❓', priority: 'normal' },
            { id: 'menu', label: 'Ver la carta', emoji: '📋', priority: 'low' },
        ]
    },
    {
        category: 'La Cuenta',
        icon: '💳',
        items: [
            { id: 'bill', label: 'Pedir la cuenta', emoji: '💳', priority: 'normal' },
            { id: 'split_bill', label: 'Dividir la cuenta', emoji: '💶', priority: 'normal' },
            { id: 'pay_card', label: 'Pagar con tarjeta', emoji: '💳', priority: 'normal' },
        ]
    },
    {
        category: 'Extras de Mesa',
        icon: '🍽️',
        items: [
            { id: 'napkins', label: 'Servilletas', emoji: '🧻', priority: 'low' },
            { id: 'cutlery', label: 'Cubiertos', emoji: '🍴', priority: 'low' },
            { id: 'plates', label: 'Platos extra', emoji: '🍽️', priority: 'low' },
            { id: 'salt_pepper', label: 'Sal y pimienta', emoji: '🧂', priority: 'low' },
            { id: 'bread', label: 'Más pan', emoji: '🍞', priority: 'low' },
        ]
    },
    {
        category: 'Salsas',
        icon: '🥫',
        items: [
            { id: 'mayo', label: 'Mayonesa', emoji: '🥫', priority: 'low' },
            { id: 'ketchup', label: 'Ketchup', emoji: '🍅', priority: 'low' },
            { id: 'mustard', label: 'Mostaza', emoji: '🟡', priority: 'low' },
            { id: 'oil_vinegar', label: 'Aceite y vinagre', emoji: '🫒', priority: 'low' },
            { id: 'hot_sauce', label: 'Picante', emoji: '🌶️', priority: 'low' },
            { id: 'alioli', label: 'Alioli', emoji: '🧄', priority: 'low' },
        ]
    },
    {
        category: 'Bebidas',
        icon: '🥤',
        items: [
            { id: 'water', label: 'Agua', emoji: '💧', priority: 'low' },
            { id: 'more_wine', label: 'Más vino', emoji: '🍷', priority: 'low' },
            { id: 'more_beer', label: 'Más cerveza', emoji: '🍺', priority: 'low' },
            { id: 'ice', label: 'Hielo', emoji: '🧊', priority: 'low' },
            { id: 'coffee', label: 'Café', emoji: '☕', priority: 'normal' },
        ]
    },
    {
        category: 'Urgente',
        icon: '⚠️',
        items: [
            { id: 'complaint', label: 'Reclamación', emoji: '⚠️', priority: 'urgent' },
            { id: 'wrong_order', label: 'Pedido incorrecto', emoji: '❌', priority: 'high' },
            { id: 'food_cold', label: 'Comida fría', emoji: '🥶', priority: 'high' },
        ]
    },
];

export default function WaiterCallModal({
    isOpen,
    onClose,
    restaurantId,
    tableNumber,
    theme
}: WaiterCallModalProps) {
    const [selectedItems, setSelectedItems] = useState<string[]>([]);
    const [customNote, setCustomNote] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState<string | null>('Asistencia');

    const supabase = createClient();

    const toggleItem = (id: string) => {
        setSelectedItems(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const getHighestPriority = () => {
        const priorities = ['urgent', 'high', 'normal', 'low'];
        for (const priority of priorities) {
            const hasItem = callOptions.flatMap(c => c.items)
                .some(item => selectedItems.includes(item.id) && item.priority === priority);
            if (hasItem) return priority;
        }
        return 'normal';
    };

    const handleSubmit = async () => {
        if (selectedItems.length === 0 && !customNote) return;

        setSending(true);

        try {
            // Create a call for each selected item or one with custom note
            const callsToCreate = selectedItems.length > 0
                ? selectedItems.map(itemId => ({
                    restaurant_id: restaurantId,
                    table_number: tableNumber || 0,
                    reason: itemId,
                    priority: callOptions.flatMap(c => c.items).find(i => i.id === itemId)?.priority || 'normal',
                    status: 'pending',
                    notes: customNote || null,
                }))
                : [{
                    restaurant_id: restaurantId,
                    table_number: tableNumber || 0,
                    reason: 'other',
                    priority: 'normal',
                    status: 'pending',
                    notes: customNote,
                }];

            // Combine multiple items into one call with notes
            const combinedCall = {
                restaurant_id: restaurantId,
                table_number: tableNumber || 0,
                reason: selectedItems[0] || 'other',
                priority: getHighestPriority(),
                status: 'pending',
                notes: selectedItems.length > 1
                    ? `Peticiones: ${selectedItems.map(id =>
                        callOptions.flatMap(c => c.items).find(i => i.id === id)?.label
                    ).join(', ')}${customNote ? `. Nota: ${customNote}` : ''}`
                    : customNote || null,
            };

            await supabase.from('waiter_calls').insert(combinedCall);

            setSent(true);
            setTimeout(() => {
                onClose();
                setSent(false);
                setSelectedItems([]);
                setCustomNote('');
            }, 2000);
        } catch (error) {
            console.error('Error sending call:', error);
        } finally {
            setSending(false);
        }
    };

    if (!isOpen) return null;

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
                className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl max-h-[90vh] flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                            <Bell className="text-amber-600" size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-lg text-gray-900">Llamar al camarero</h2>
                            {tableNumber && (
                                <p className="text-sm text-gray-500">Mesa {tableNumber}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Success State */}
                {sent ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4"
                        >
                            <Check className="text-green-600" size={40} />
                        </motion.div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">¡Enviado!</h3>
                        <p className="text-gray-500 text-center">
                            El camarero ha recibido tu petición y vendrá enseguida
                        </p>
                    </div>
                ) : (
                    <>
                        {/* Categories */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="p-4 space-y-3">
                                {callOptions.map((category) => (
                                    <div key={category.category} className="bg-gray-50 rounded-2xl overflow-hidden">
                                        <button
                                            onClick={() => setExpandedCategory(
                                                expandedCategory === category.category ? null : category.category
                                            )}
                                            className="w-full px-4 py-3 flex items-center justify-between text-left"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-xl">{category.icon}</span>
                                                <span className="font-bold text-gray-900">{category.category}</span>
                                                {category.items.some(item => selectedItems.includes(item.id)) && (
                                                    <span className="w-2 h-2 bg-green-500 rounded-full" />
                                                )}
                                            </div>
                                            <ChevronRight
                                                size={18}
                                                className={`text-gray-400 transition-transform ${expandedCategory === category.category ? 'rotate-90' : ''
                                                    }`}
                                            />
                                        </button>

                                        <AnimatePresence>
                                            {expandedCategory === category.category && (
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: 'auto' }}
                                                    exit={{ height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="px-4 pb-3 grid grid-cols-2 gap-2">
                                                        {category.items.map((item) => (
                                                            <button
                                                                key={item.id}
                                                                onClick={() => toggleItem(item.id)}
                                                                className={`p-3 rounded-xl text-left transition-all ${selectedItems.includes(item.id)
                                                                        ? 'bg-green-500 text-white shadow-lg scale-[1.02]'
                                                                        : 'bg-white text-gray-700 hover:bg-gray-100'
                                                                    }`}
                                                            >
                                                                <span className="text-lg mr-2">{item.emoji}</span>
                                                                <span className="text-sm font-medium">{item.label}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}

                                {/* Custom Note */}
                                <div className="mt-4">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">
                                        💬 ¿Algo más? (opcional)
                                    </label>
                                    <textarea
                                        value={customNote}
                                        onChange={(e) => setCustomNote(e.target.value)}
                                        placeholder="Escribe aquí si necesitas algo específico..."
                                        rows={2}
                                        className="w-full p-3 bg-gray-50 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500/20"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-gray-100 bg-white">
                            {selectedItems.length > 0 && (
                                <div className="mb-3 flex flex-wrap gap-1">
                                    {selectedItems.map(id => {
                                        const item = callOptions.flatMap(c => c.items).find(i => i.id === id);
                                        return (
                                            <span key={id} className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                                {item?.emoji} {item?.label}
                                            </span>
                                        );
                                    })}
                                </div>
                            )}
                            <button
                                onClick={handleSubmit}
                                disabled={sending || (selectedItems.length === 0 && !customNote)}
                                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${selectedItems.length > 0 || customNote
                                        ? 'bg-green-500 hover:bg-green-600 text-white'
                                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {sending ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <Bell size={20} />
                                        {selectedItems.length > 0
                                            ? `Enviar (${selectedItems.length} petición${selectedItems.length > 1 ? 'es' : ''})`
                                            : 'Selecciona una opción'
                                        }
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
