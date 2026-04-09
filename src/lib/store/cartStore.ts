// =====================================================
// ZUSTAND STORE - CART (Para el menú público /r/[slug])
// =====================================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Product, SelectedModifier, Promotion } from '@/types/database';
import { extractName } from '@/lib/utils';

export interface CartItem {
    id: string; // Unique cart item ID
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    modifiers: SelectedModifier[];
    notes: string | null;
    imageUrl: string | null;
}

interface CartState {
    // Restaurant info
    restaurantId: string | null;
    restaurantSlug: string | null;
    restaurantName: string | null;

    // Table info
    tableNumber: string | null;

    // Cart items
    items: CartItem[];

    // Totals
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    total: number;

    // Promotion
    appliedPromotion: Promotion | null;
    promotionCode: string | null;

    // Customer info
    customerName: string | null;
    customerPhone: string | null;

    // Order type
    orderType: 'dine_in' | 'takeaway' | 'delivery' | 'beach' | 'pool';

    // Payment
    paymentMethod: 'cash' | 'card' | 'online' | null;

    // UI State
    isCartOpen: boolean;
    isCheckoutOpen: boolean;

    // Actions
    setRestaurant: (id: string, slug: string, name: string) => void;
    setTable: (tableNumber: string) => void;
    setCustomer: (name: string, phone: string) => void;
    setOrderType: (type: CartState['orderType']) => void;
    setPaymentMethod: (method: CartState['paymentMethod']) => void;

    // Cart actions
    addItem: (product: Product, quantity: number, modifiers: SelectedModifier[], notes?: string) => void;
    updateItemQuantity: (itemId: string, quantity: number) => void;
    removeItem: (itemId: string) => void;
    updateItemNotes: (itemId: string, notes: string) => void;

    // Promotion
    applyPromotion: (promotion: Promotion, code?: string) => void;
    removePromotion: () => void;

    // UI
    openCart: () => void;
    closeCart: () => void;
    openCheckout: () => void;
    closeCheckout: () => void;

    // Utils
    getItemCount: () => number;
    recalculateTotals: () => void;
    clearCart: () => void;
    reset: () => void;
}

const generateItemId = () => `cart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const calculateModifiersPrice = (modifiers: SelectedModifier[]): number => {
    return modifiers.reduce((sum, mod) => sum + mod.price, 0);
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            restaurantId: null,
            restaurantSlug: null,
            restaurantName: null,
            tableNumber: null,
            items: [],
            subtotal: 0,
            discountAmount: 0,
            taxAmount: 0,
            total: 0,
            appliedPromotion: null,
            promotionCode: null,
            customerName: null,
            customerPhone: null,
            orderType: 'dine_in',
            paymentMethod: null,
            isCartOpen: false,
            isCheckoutOpen: false,

            setRestaurant: (id, slug, name) => {
                const { restaurantId } = get();
                // If different restaurant, clear cart
                if (restaurantId && restaurantId !== id) {
                    get().clearCart();
                }
                set({ restaurantId: id, restaurantSlug: slug, restaurantName: name });
            },

            setTable: (tableNumber) => set({ tableNumber }),

            setCustomer: (name, phone) => set({ customerName: name, customerPhone: phone }),

            setOrderType: (type) => set({ orderType: type }),

            setPaymentMethod: (method) => set({ paymentMethod: method }),

            addItem: (product, quantity, modifiers, notes) => {
                const modifiersPrice = calculateModifiersPrice(modifiers);
                const unitPrice = product.price + modifiersPrice;
                const totalPrice = unitPrice * quantity;

                const newItem: CartItem = {
                    id: generateItemId(),
                    productId: product.id,
                    productName: extractName(product.name),
                    quantity,
                    unitPrice,
                    totalPrice,
                    modifiers,
                    notes: notes || null,
                    imageUrl: product.image_url,
                };

                set(state => ({ items: [...state.items, newItem] }));
                get().recalculateTotals();
            },

            updateItemQuantity: (itemId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(itemId);
                    return;
                }

                set(state => ({
                    items: state.items.map(item =>
                        item.id === itemId
                            ? { ...item, quantity, totalPrice: item.unitPrice * quantity }
                            : item
                    )
                }));
                get().recalculateTotals();
            },

            removeItem: (itemId) => {
                set(state => ({
                    items: state.items.filter(item => item.id !== itemId)
                }));
                get().recalculateTotals();
            },

            updateItemNotes: (itemId, notes) => {
                set(state => ({
                    items: state.items.map(item =>
                        item.id === itemId ? { ...item, notes } : item
                    )
                }));
            },

            applyPromotion: (promotion, code) => {
                set({ appliedPromotion: promotion, promotionCode: code || null });
                get().recalculateTotals();
            },

            removePromotion: () => {
                set({ appliedPromotion: null, promotionCode: null });
                get().recalculateTotals();
            },

            recalculateTotals: () => {
                const { items, appliedPromotion } = get();

                const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);

                let discountAmount = 0;
                if (appliedPromotion) {
                    if (appliedPromotion.type === 'percentage') {
                        discountAmount = subtotal * (appliedPromotion.value / 100);
                    } else if (appliedPromotion.type === 'fixed') {
                        discountAmount = appliedPromotion.value;
                    }

                    // Apply max discount limit
                    if (appliedPromotion.max_discount && discountAmount > appliedPromotion.max_discount) {
                        discountAmount = appliedPromotion.max_discount;
                    }

                    // Check min order amount
                    if (appliedPromotion.min_order_amount && subtotal < appliedPromotion.min_order_amount) {
                        discountAmount = 0;
                    }
                }

                const taxAmount = 0; // IVA included in prices for Spain
                const total = Math.max(0, subtotal - discountAmount + taxAmount);

                set({ subtotal, discountAmount, taxAmount, total });
            },

            openCart: () => set({ isCartOpen: true }),
            closeCart: () => set({ isCartOpen: false }),
            openCheckout: () => set({ isCheckoutOpen: true, isCartOpen: false }),
            closeCheckout: () => set({ isCheckoutOpen: false }),

            getItemCount: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },

            clearCart: () => {
                set({
                    items: [],
                    subtotal: 0,
                    discountAmount: 0,
                    taxAmount: 0,
                    total: 0,
                    appliedPromotion: null,
                    promotionCode: null,
                    isCartOpen: false,
                    isCheckoutOpen: false,
                });
            },

            reset: () => {
                set({
                    restaurantId: null,
                    restaurantSlug: null,
                    restaurantName: null,
                    tableNumber: null,
                    items: [],
                    subtotal: 0,
                    discountAmount: 0,
                    taxAmount: 0,
                    total: 0,
                    appliedPromotion: null,
                    promotionCode: null,
                    customerName: null,
                    customerPhone: null,
                    orderType: 'dine_in',
                    paymentMethod: null,
                    isCartOpen: false,
                    isCheckoutOpen: false,
                });
            },
        }),
        {
            name: 'mydigitable-cart',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                // Only persist these fields
                restaurantId: state.restaurantId,
                restaurantSlug: state.restaurantSlug,
                restaurantName: state.restaurantName,
                tableNumber: state.tableNumber,
                items: state.items,
                subtotal: state.subtotal,
                discountAmount: state.discountAmount,
                total: state.total,
                appliedPromotion: state.appliedPromotion,
                promotionCode: state.promotionCode,
                customerName: state.customerName,
                customerPhone: state.customerPhone,
                orderType: state.orderType,
            }),
        }
    )
);
