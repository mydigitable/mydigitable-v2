// =====================================================
// ZUSTAND STORE - ADMIN (Para María - Panel de Plataforma)
// =====================================================

import { create } from 'zustand';
import { createClient } from '@/lib/supabase/client';
import type {
    PlatformAdmin,
    PlatformSettings,
    Restaurant,
    Subscription,
    Seller,
    PlatformCommission,
    PlatformMetrics,
} from '@/types/database';

interface AdminMetrics {
    mrr: number;
    arr: number;
    totalRestaurants: number;
    activeRestaurants: number;
    newThisMonth: number;
    churnedThisMonth: number;
    starterCount: number;
    growthCount: number;
    scaleCount: number;
    commissionRevenue: number;
    subscriptionRevenue: number;
}

interface AdminState {
    // Current admin user
    admin: PlatformAdmin | null;

    // Platform settings
    settings: PlatformSettings | null;

    // Data
    restaurants: Restaurant[];
    subscriptions: Subscription[];
    sellers: Seller[];
    commissions: PlatformCommission[];

    // Metrics
    metrics: AdminMetrics | null;

    // Loading states
    loading: boolean;
    loadingRestaurants: boolean;
    loadingSellers: boolean;
    loadingCommissions: boolean;

    // Error
    error: string | null;

    // Actions
    loadAdmin: () => Promise<void>;
    loadSettings: () => Promise<void>;
    loadRestaurants: () => Promise<void>;
    loadSellers: () => Promise<void>;
    loadCommissions: () => Promise<void>;
    loadMetrics: () => Promise<void>;
    loadAll: () => Promise<void>;

    // Seller CRUD
    createSeller: (data: Partial<Seller>) => Promise<Seller | null>;
    updateSeller: (id: string, data: Partial<Seller>) => Promise<boolean>;
    deleteSeller: (id: string) => Promise<boolean>;

    // Settings
    updateSettings: (data: Partial<PlatformSettings>) => Promise<boolean>;

    // Restaurant actions
    updateRestaurantPlan: (restaurantId: string, plan: string) => Promise<boolean>;

    // Reset
    reset: () => void;
}

const initialMetrics: AdminMetrics = {
    mrr: 0,
    arr: 0,
    totalRestaurants: 0,
    activeRestaurants: 0,
    newThisMonth: 0,
    churnedThisMonth: 0,
    starterCount: 0,
    growthCount: 0,
    scaleCount: 0,
    commissionRevenue: 0,
    subscriptionRevenue: 0,
};

export const useAdminStore = create<AdminState>((set, get) => ({
    admin: null,
    settings: null,
    restaurants: [],
    subscriptions: [],
    sellers: [],
    commissions: [],
    metrics: null,
    loading: false,
    loadingRestaurants: false,
    loadingSellers: false,
    loadingCommissions: false,
    error: null,

    loadAdmin: async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('platform_admins')
            .select('*')
            .eq('user_id', user.id)
            .single();

        if (error) {
            set({ error: 'No tienes acceso de administrador' });
            return;
        }

        set({ admin: data, error: null });
    },

    loadSettings: async () => {
        const supabase = createClient();
        const { data, error } = await supabase
            .from('platform_settings')
            .select('*')
            .single();

        if (!error && data) {
            set({ settings: data });
        }
    },

    loadRestaurants: async () => {
        set({ loadingRestaurants: true });
        const supabase = createClient();

        const { data, error } = await supabase
            .from('restaurants')
            .select('*, subscriptions(*)')
            .order('created_at', { ascending: false });

        set({
            restaurants: data || [],
            loadingRestaurants: false,
            error: error?.message || null
        });
    },

    loadSellers: async () => {
        set({ loadingSellers: true });
        const supabase = createClient();

        const { data, error } = await supabase
            .from('sellers')
            .select('*')
            .order('created_at', { ascending: false });

        set({
            sellers: data || [],
            loadingSellers: false
        });
    },

    loadCommissions: async () => {
        set({ loadingCommissions: true });
        const supabase = createClient();

        const { data, error } = await supabase
            .from('platform_commissions')
            .select('*, restaurants(name, slug), orders(order_number)')
            .order('created_at', { ascending: false });

        set({
            commissions: data || [],
            loadingCommissions: false
        });
    },

    loadMetrics: async () => {
        const { restaurants, commissions } = get();

        const activeRestaurants = restaurants.filter(r => r.is_active);
        const thisMonth = new Date();
        thisMonth.setDate(1);
        thisMonth.setHours(0, 0, 0, 0);

        const starterCount = activeRestaurants.filter(r =>
            r.plan_tier === 'starter' || !r.plan_tier
        ).length;
        const growthCount = activeRestaurants.filter(r => r.plan_tier === 'growth').length;
        const scaleCount = activeRestaurants.filter(r => r.plan_tier === 'scale').length;

        const mrr = (growthCount * 39) + (scaleCount * 89);

        const commissionRevenue = commissions
            .filter(c => new Date(c.created_at) >= thisMonth)
            .reduce((sum, c) => sum + (c.commission_amount || 0), 0);

        set({
            metrics: {
                mrr,
                arr: mrr * 12,
                totalRestaurants: restaurants.length,
                activeRestaurants: activeRestaurants.length,
                newThisMonth: restaurants.filter(r => new Date(r.created_at) >= thisMonth).length,
                churnedThisMonth: restaurants.filter(r => r.cancelled_at && new Date(r.cancelled_at) >= thisMonth).length,
                starterCount,
                growthCount,
                scaleCount,
                commissionRevenue,
                subscriptionRevenue: 0, // TODO: Calculate from subscription_payments
            }
        });
    },

    loadAll: async () => {
        set({ loading: true });

        await Promise.all([
            get().loadAdmin(),
            get().loadSettings(),
            get().loadRestaurants(),
            get().loadSellers(),
            get().loadCommissions(),
        ]);

        await get().loadMetrics();

        set({ loading: false });
    },

    createSeller: async (data) => {
        const supabase = createClient();
        const { data: seller, error } = await supabase
            .from('sellers')
            .insert(data)
            .select()
            .single();

        if (error) {
            set({ error: error.message });
            return null;
        }

        set(state => ({ sellers: [seller, ...state.sellers] }));
        return seller;
    },

    updateSeller: async (id, data) => {
        const supabase = createClient();
        const { error } = await supabase
            .from('sellers')
            .update(data)
            .eq('id', id);

        if (error) {
            set({ error: error.message });
            return false;
        }

        set(state => ({
            sellers: state.sellers.map(s => s.id === id ? { ...s, ...data } : s)
        }));
        return true;
    },

    deleteSeller: async (id) => {
        const supabase = createClient();
        const { error } = await supabase
            .from('sellers')
            .delete()
            .eq('id', id);

        if (error) {
            set({ error: error.message });
            return false;
        }

        set(state => ({
            sellers: state.sellers.filter(s => s.id !== id)
        }));
        return true;
    },

    updateSettings: async (data) => {
        const supabase = createClient();
        const { settings } = get();
        if (!settings) return false;

        const { error } = await supabase
            .from('platform_settings')
            .update(data)
            .eq('id', settings.id);

        if (error) {
            set({ error: error.message });
            return false;
        }

        set({ settings: { ...settings, ...data } });
        return true;
    },

    updateRestaurantPlan: async (restaurantId, plan) => {
        const supabase = createClient();

        // Update restaurant
        const { error: restError } = await supabase
            .from('restaurants')
            .update({ plan_tier: plan })
            .eq('id', restaurantId);

        if (restError) {
            set({ error: restError.message });
            return false;
        }

        // Update subscription
        const { error: subError } = await supabase
            .from('subscriptions')
            .update({ plan })
            .eq('restaurant_id', restaurantId);

        if (subError) {
            console.error('Error updating subscription:', subError);
        }

        set(state => ({
            restaurants: state.restaurants.map(r =>
                r.id === restaurantId ? { ...r, plan_tier: plan as any } : r
            )
        }));
        return true;
    },

    reset: () => {
        set({
            admin: null,
            settings: null,
            restaurants: [],
            subscriptions: [],
            sellers: [],
            commissions: [],
            metrics: null,
            loading: false,
            error: null,
        });
    },
}));
