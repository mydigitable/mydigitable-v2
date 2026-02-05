"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useAdminStore } from "@/lib/store/adminStore";

interface AdminContextType {
    isLoading: boolean;
    isReady: boolean;
}

const AdminContext = createContext<AdminContextType>({
    isLoading: true,
    isReady: false,
});

export function AdminProvider({ children }: { children: ReactNode }) {
    const { loading, admin, loadAll, reset } = useAdminStore();

    useEffect(() => {
        loadAll();

        return () => {
            // Don't reset on unmount to preserve state during navigation
        };
    }, []);

    return (
        <AdminContext.Provider value={{ isLoading: loading, isReady: !!admin }}>
            {children}
        </AdminContext.Provider>
    );
}

export function useAdminContext() {
    return useContext(AdminContext);
}

// Quick access hooks
export function usePlatformRestaurants() {
    const store = useAdminStore();
    return {
        restaurants: store.restaurants,
        loading: store.loadingRestaurants,
        updatePlan: store.updateRestaurantPlan,
        refresh: store.loadRestaurants,
    };
}

export function useSellers() {
    const store = useAdminStore();
    return {
        sellers: store.sellers,
        loading: store.loadingSellers,
        create: store.createSeller,
        update: store.updateSeller,
        delete: store.deleteSeller,
        refresh: store.loadSellers,
    };
}

export function useCommissions() {
    const store = useAdminStore();
    return {
        commissions: store.commissions,
        loading: store.loadingCommissions,
        refresh: store.loadCommissions,
    };
}

export function usePlatformMetrics() {
    const store = useAdminStore();
    return {
        metrics: store.metrics,
        refresh: store.loadMetrics,
    };
}

export function usePlatformSettings() {
    const store = useAdminStore();
    return {
        settings: store.settings,
        update: store.updateSettings,
        refresh: store.loadSettings,
    };
}
