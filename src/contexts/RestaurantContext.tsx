"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useRestaurantStore } from "@/lib/store/restaurantStore";

interface RestaurantContextType {
    isLoading: boolean;
    isReady: boolean;
}

const RestaurantContext = createContext<RestaurantContextType>({
    isLoading: true,
    isReady: false,
});

export function RestaurantProvider({ children }: { children: ReactNode }) {
    const { loading, restaurant, loadAll, reset } = useRestaurantStore();

    useEffect(() => {
        loadAll();

        return () => {
            // Don't reset on unmount to preserve state during navigation
        };
    }, []);

    return (
        <RestaurantContext.Provider value={{ isLoading: loading, isReady: !!restaurant }}>
            {children}
        </RestaurantContext.Provider>
    );
}

export function useRestaurantContext() {
    return useContext(RestaurantContext);
}

// Quick access hooks
export function useOrders() {
    const store = useRestaurantStore();
    return {
        orders: store.orders,
        pendingOrders: store.pendingOrders,
        loading: store.loadingOrders,
        updateStatus: store.updateOrderStatus,
        refresh: store.loadOrders,
    };
}

export function useMenu() {
    const store = useRestaurantStore();
    return {
        categories: store.categories,
        products: store.products,
        loading: store.loadingMenu,
        createCategory: store.createCategory,
        updateCategory: store.updateCategory,
        deleteCategory: store.deleteCategory,
        createProduct: store.createProduct,
        updateProduct: store.updateProduct,
        deleteProduct: store.deleteProduct,
        refresh: store.loadMenu,
    };
}

export function useWaiterCalls() {
    const store = useRestaurantStore();
    return {
        calls: store.waiterCalls,
        pendingCalls: store.pendingCalls,
        acknowledge: store.acknowledgeCall,
        complete: store.completeCall,
        refresh: store.loadWaiterCalls,
    };
}

export function useReservations() {
    const store = useRestaurantStore();
    return {
        reservations: store.reservations,
        create: store.createReservation,
        update: store.updateReservation,
        cancel: store.cancelReservation,
        refresh: store.loadReservations,
    };
}

export function useTables() {
    const store = useRestaurantStore();
    return {
        tables: store.tables,
        create: store.createTable,
        update: store.updateTable,
        delete: store.deleteTable,
        refresh: store.loadTables,
    };
}

export function useStaff() {
    const store = useRestaurantStore();
    return {
        staff: store.staff,
        create: store.createStaff,
        update: store.updateStaff,
        delete: store.deleteStaff,
        refresh: store.loadStaff,
    };
}

export function usePromotions() {
    const store = useRestaurantStore();
    return {
        promotions: store.promotions,
        create: store.createPromotion,
        update: store.updatePromotion,
        delete: store.deletePromotion,
        refresh: store.loadPromotions,
    };
}
