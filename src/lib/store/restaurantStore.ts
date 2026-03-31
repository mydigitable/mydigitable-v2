// =====================================================
// ZUSTAND STORE - RESTAURANT (Para cada restaurante)
// =====================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createClient } from '@/lib/supabase/client';
import type {
    Restaurant,
    Category,
    Product,
    Order,
    Reservation,
    WaiterCall,
    Table,
    Staff,
    Customer,
    Promotion,
    DailyMetrics,
} from '@/types/database';

interface RestaurantState {
    // Restaurant data
    restaurant: Restaurant | null;

    // Menu
    categories: Category[];
    products: Product[];

    // Orders
    orders: Order[];
    pendingOrders: number;

    // Services
    waiterCalls: WaiterCall[];
    pendingCalls: number;
    reservations: Reservation[];

    // Resources
    tables: Table[];
    staff: Staff[];
    customers: Customer[];
    promotions: Promotion[];

    // Metrics
    todayMetrics: DailyMetrics | null;

    // Loading states
    loading: boolean;
    loadingOrders: boolean;
    loadingMenu: boolean;

    // Error
    error: string | null;

    // Actions - Data loading
    loadRestaurant: () => Promise<void>;
    loadMenu: () => Promise<void>;
    loadOrders: (status?: string) => Promise<void>;
    loadReservations: (date?: string) => Promise<void>;
    loadWaiterCalls: () => Promise<void>;
    loadTables: () => Promise<void>;
    loadStaff: () => Promise<void>;
    loadCustomers: () => Promise<void>;
    loadPromotions: () => Promise<void>;
    loadTodayMetrics: () => Promise<void>;
    loadAll: () => Promise<void>;

    // Actions - Menu CRUD
    createCategory: (data: Partial<Category>) => Promise<Category | null>;
    updateCategory: (id: string, data: Partial<Category>) => Promise<boolean>;
    deleteCategory: (id: string) => Promise<boolean>;
    reorderCategories: (ids: string[]) => Promise<boolean>;

    createProduct: (data: Partial<Product>) => Promise<Product | null>;
    updateProduct: (id: string, data: Partial<Product>) => Promise<boolean>;
    deleteProduct: (id: string) => Promise<boolean>;
    reorderProducts: (categoryId: string, ids: string[]) => Promise<boolean>;

    // Actions - Orders
    updateOrderStatus: (id: string, status: string) => Promise<boolean>;

    // Actions - Waiter Calls
    acknowledgeCall: (id: string) => Promise<boolean>;
    completeCall: (id: string) => Promise<boolean>;

    // Actions - Reservations
    createReservation: (data: Partial<Reservation>) => Promise<Reservation | null>;
    updateReservation: (id: string, data: Partial<Reservation>) => Promise<boolean>;
    cancelReservation: (id: string, reason: string) => Promise<boolean>;

    // Actions - Tables
    createTable: (data: Partial<Table>) => Promise<Table | null>;
    updateTable: (id: string, data: Partial<Table>) => Promise<boolean>;
    deleteTable: (id: string) => Promise<boolean>;

    // Actions - Staff
    createStaff: (data: Partial<Staff>) => Promise<Staff | null>;
    updateStaff: (id: string, data: Partial<Staff>) => Promise<boolean>;
    deleteStaff: (id: string) => Promise<boolean>;

    // Actions - Promotions
    createPromotion: (data: Partial<Promotion>) => Promise<Promotion | null>;
    updatePromotion: (id: string, data: Partial<Promotion>) => Promise<boolean>;
    deletePromotion: (id: string) => Promise<boolean>;

    // Reset
    reset: () => void;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
    restaurant: null,
    categories: [],
    products: [],
    orders: [],
    pendingOrders: 0,
    waiterCalls: [],
    pendingCalls: 0,
    reservations: [],
    tables: [],
    staff: [],
    customers: [],
    promotions: [],
    todayMetrics: null,
    loading: false,
    loadingOrders: false,
    loadingMenu: false,
    error: null,

    loadRestaurant: async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('restaurants')
            .select('*')
            .eq('owner_id', user.id)
            .single();

        if (error) {
            set({ error: 'No se encontró el restaurante' });
            return;
        }

        set({ restaurant: data, error: null });
    },

    loadMenu: async () => {
        const { restaurant } = get();
        if (!restaurant) return;

        set({ loadingMenu: true });
        const supabase = createClient();

        const { data: categoriesData } = await supabase
            .from('menu_categories')
            .select('*, products(*)')
            .eq('restaurant_id', restaurant.id)
            .order('sort_order');

        const categories = categoriesData || [];
        const products = categories.flatMap(c => c.products || []);

        set({
            categories,
            products,
            loadingMenu: false
        });
    },

    loadOrders: async (status?: string) => {
        const { restaurant } = get();
        if (!restaurant) return;

        set({ loadingOrders: true });
        const supabase = createClient();

        let query = supabase
            .from('orders')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .order('created_at', { ascending: false });

        if (status) {
            query = query.eq('status', status);
        }

        const { data } = await query.limit(100);
        const orders = data || [];
        const pendingOrders = orders.filter(o =>
            ['pending', 'confirmed', 'preparing'].includes(o.status)
        ).length;

        set({ orders, pendingOrders, loadingOrders: false });
    },

    loadReservations: async (date?: string) => {
        const { restaurant } = get();
        if (!restaurant) return;

        const supabase = createClient();
        let query = supabase
            .from('reservations')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .order('date', { ascending: true });

        if (date) {
            query = query.eq('date', date);
        } else {
            // Load today and future
            const today = new Date().toISOString().split('T')[0];
            query = query.gte('date', today);
        }

        const { data } = await query;
        set({ reservations: data || [] });
    },

    loadWaiterCalls: async () => {
        const { restaurant } = get();
        if (!restaurant) return;

        const supabase = createClient();
        const { data } = await supabase
            .from('waiter_calls')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .in('status', ['pending', 'acknowledged', 'in_progress'])
            .order('created_at', { ascending: false });

        const calls = data || [];
        const pendingCalls = calls.filter(c => c.status === 'pending').length;

        set({ waiterCalls: calls, pendingCalls });
    },

    loadTables: async () => {
        const { restaurant } = get();
        if (!restaurant) return;

        const supabase = createClient();
        const { data } = await supabase
            .from('tables')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .order('table_number');

        set({ tables: data || [] });
    },

    loadStaff: async () => {
        const { restaurant } = get();
        if (!restaurant) return;

        const supabase = createClient();
        const { data } = await supabase
            .from('staff_members')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .order('name');

        set({ staff: data || [] });
    },

    loadCustomers: async () => {
        const { restaurant } = get();
        if (!restaurant) return;

        const supabase = createClient();
        const { data } = await supabase
            .from('customers')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .order('total_orders', { ascending: false })
            .limit(100);

        set({ customers: data || [] });
    },

    loadPromotions: async () => {
        const { restaurant } = get();
        if (!restaurant) return;

        const supabase = createClient();
        const { data } = await supabase
            .from('promotions')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .order('created_at', { ascending: false });

        set({ promotions: data || [] });
    },

    loadTodayMetrics: async () => {
        const { restaurant } = get();
        if (!restaurant) return;

        const supabase = createClient();
        const today = new Date().toISOString().split('T')[0];

        const { data } = await supabase
            .from('daily_metrics')
            .select('*')
            .eq('restaurant_id', restaurant.id)
            .eq('date', today)
            .single();

        set({ todayMetrics: data });
    },

    loadAll: async () => {
        set({ loading: true });

        await get().loadRestaurant();

        await Promise.all([
            get().loadMenu(),
            get().loadOrders(),
            get().loadWaiterCalls(),
            get().loadReservations(),
            get().loadTables(),
            get().loadTodayMetrics(),
        ]);

        set({ loading: false });
    },

    // Category CRUD
    createCategory: async (data) => {
        const { restaurant } = get();
        if (!restaurant) return null;

        const supabase = createClient();
        const { data: category, error } = await supabase
            .from('menu_categories')
            .insert({ ...data, restaurant_id: restaurant.id })
            .select()
            .single();

        if (error) {
            set({ error: error.message });
            return null;
        }

        set(state => ({ categories: [...state.categories, category] }));
        return category;
    },

    updateCategory: async (id, data) => {
        const supabase = createClient();
        const { error } = await supabase
            .from('menu_categories')
            .update(data)
            .eq('id', id);

        if (error) {
            set({ error: error.message });
            return false;
        }

        set(state => ({
            categories: state.categories.map(c => c.id === id ? { ...c, ...data } : c)
        }));
        return true;
    },

    deleteCategory: async (id) => {
        const supabase = createClient();
        const { error } = await supabase
            .from('menu_categories')
            .delete()
            .eq('id', id);

        if (error) {
            set({ error: error.message });
            return false;
        }

        set(state => ({
            categories: state.categories.filter(c => c.id !== id)
        }));
        return true;
    },

    reorderCategories: async (ids) => {
        const supabase = createClient();

        const updates = ids.map((id, index) =>
            supabase.from('menu_categories').update({ sort_order: index }).eq('id', id)
        );

        await Promise.all(updates);
        await get().loadMenu();
        return true;
    },

    // Product CRUD
    createProduct: async (data) => {
        const { restaurant } = get();
        if (!restaurant) return null;

        const supabase = createClient();
        const { data: product, error } = await supabase
            .from('products')
            .insert({ ...data, restaurant_id: restaurant.id })
            .select()
            .single();

        if (error) {
            set({ error: error.message });
            return null;
        }

        set(state => ({ products: [...state.products, product] }));
        await get().loadMenu();
        return product;
    },

    updateProduct: async (id, data) => {
        const supabase = createClient();
        const { error } = await supabase
            .from('products')
            .update(data)
            .eq('id', id);

        if (error) {
            set({ error: error.message });
            return false;
        }

        set(state => ({
            products: state.products.map(p => p.id === id ? { ...p, ...data } : p)
        }));
        await get().loadMenu();
        return true;
    },

    deleteProduct: async (id) => {
        const supabase = createClient();
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) {
            set({ error: error.message });
            return false;
        }

        set(state => ({
            products: state.products.filter(p => p.id !== id)
        }));
        await get().loadMenu();
        return true;
    },

    reorderProducts: async (categoryId, ids) => {
        const supabase = createClient();

        const updates = ids.map((id, index) =>
            supabase.from('products').update({ sort_order: index }).eq('id', id)
        );

        await Promise.all(updates);
        await get().loadMenu();
        return true;
    },

    // Orders
    updateOrderStatus: async (id, status) => {
        const supabase = createClient();
        const now = new Date().toISOString();

        const updates: any = { status };
        if (status === 'preparing') updates.prepared_at = now;
        if (status === 'delivered') updates.delivered_at = now;
        if (status === 'completed') updates.completed_at = now;

        const { error } = await supabase
            .from('orders')
            .update(updates)
            .eq('id', id);

        if (error) return false;

        set(state => ({
            orders: state.orders.map(o => o.id === id ? { ...o, ...updates } : o),
            pendingOrders: state.orders.filter(o =>
                o.id !== id && ['pending', 'confirmed', 'preparing'].includes(o.status)
            ).length + (['pending', 'confirmed', 'preparing'].includes(status) ? 1 : 0)
        }));
        return true;
    },

    // Waiter Calls
    acknowledgeCall: async (id) => {
        const supabase = createClient();
        const { error } = await supabase
            .from('waiter_calls')
            .update({
                status: 'acknowledged',
                acknowledged_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) return false;
        await get().loadWaiterCalls();
        return true;
    },

    completeCall: async (id) => {
        const supabase = createClient();
        const { error } = await supabase
            .from('waiter_calls')
            .update({
                status: 'completed',
                completed_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) return false;
        await get().loadWaiterCalls();
        return true;
    },

    // Reservations
    createReservation: async (data) => {
        const { restaurant } = get();
        if (!restaurant) return null;

        const supabase = createClient();
        const { data: reservation, error } = await supabase
            .from('reservations')
            .insert({ ...data, restaurant_id: restaurant.id })
            .select()
            .single();

        if (error) return null;
        set(state => ({ reservations: [...state.reservations, reservation] }));
        return reservation;
    },

    updateReservation: async (id, data) => {
        const supabase = createClient();
        const { error } = await supabase
            .from('reservations')
            .update(data)
            .eq('id', id);

        if (error) return false;
        set(state => ({
            reservations: state.reservations.map(r => r.id === id ? { ...r, ...data } : r)
        }));
        return true;
    },

    cancelReservation: async (id, reason) => {
        return get().updateReservation(id, {
            status: 'canceled',
            cancelled_at: new Date().toISOString(),
            cancellation_reason: reason,
        });
    },

    // Tables
    createTable: async (data) => {
        const { restaurant } = get();
        if (!restaurant) return null;

        const supabase = createClient();
        const { data: table, error } = await supabase
            .from('tables')
            .insert({ ...data, restaurant_id: restaurant.id })
            .select()
            .single();

        if (error) return null;
        set(state => ({ tables: [...state.tables, table] }));
        return table;
    },

    updateTable: async (id, data) => {
        const supabase = createClient();
        const { error } = await supabase.from('tables').update(data).eq('id', id);
        if (error) return false;
        set(state => ({ tables: state.tables.map(t => t.id === id ? { ...t, ...data } : t) }));
        return true;
    },

    deleteTable: async (id) => {
        const supabase = createClient();
        const { error } = await supabase.from('tables').delete().eq('id', id);
        if (error) return false;
        set(state => ({ tables: state.tables.filter(t => t.id !== id) }));
        return true;
    },

    // Staff
    createStaff: async (data) => {
        const { restaurant } = get();
        if (!restaurant) return null;

        const supabase = createClient();
        const { data: member, error } = await supabase
            .from('staff_members')
            .insert({ ...data, restaurant_id: restaurant.id })
            .select()
            .single();

        if (error) return null;
        set(state => ({ staff: [...state.staff, member] }));
        return member;
    },

    updateStaff: async (id, data) => {
        const supabase = createClient();
        const { error } = await supabase.from('staff_members').update(data).eq('id', id);
        if (error) return false;
        set(state => ({ staff: state.staff.map(s => s.id === id ? { ...s, ...data } : s) }));
        return true;
    },

    deleteStaff: async (id) => {
        const supabase = createClient();
        const { error } = await supabase.from('staff_members').delete().eq('id', id);
        if (error) return false;
        set(state => ({ staff: state.staff.filter(s => s.id !== id) }));
        return true;
    },

    // Promotions
    createPromotion: async (data) => {
        const { restaurant } = get();
        if (!restaurant) return null;

        const supabase = createClient();
        const { data: promo, error } = await supabase
            .from('promotions')
            .insert({ ...data, restaurant_id: restaurant.id })
            .select()
            .single();

        if (error) return null;
        set(state => ({ promotions: [...state.promotions, promo] }));
        return promo;
    },

    updatePromotion: async (id, data) => {
        const supabase = createClient();
        const { error } = await supabase.from('promotions').update(data).eq('id', id);
        if (error) return false;
        set(state => ({ promotions: state.promotions.map(p => p.id === id ? { ...p, ...data } : p) }));
        return true;
    },

    deletePromotion: async (id) => {
        const supabase = createClient();
        const { error } = await supabase.from('promotions').delete().eq('id', id);
        if (error) return false;
        set(state => ({ promotions: state.promotions.filter(p => p.id !== id) }));
        return true;
    },

    reset: () => {
        set({
            restaurant: null,
            categories: [],
            products: [],
            orders: [],
            pendingOrders: 0,
            waiterCalls: [],
            pendingCalls: 0,
            reservations: [],
            tables: [],
            staff: [],
            customers: [],
            promotions: [],
            todayMetrics: null,
            loading: false,
            error: null,
        });
    },
}));
