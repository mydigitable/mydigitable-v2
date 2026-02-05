"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export interface OnboardingData {
    // Step 1: Basic Info
    name: string;
    description: string;
    phone: string;
    email: string;
    logo_url?: string;

    // Step 2: Location
    address: string;
    city: string;
    postal_code: string;
    country: string;

    // Step 3: Operation Modes
    mode_restaurant: boolean;
    mode_beach: boolean;
    mode_pool: boolean;
    accepts_delivery: boolean;
    accepts_takeaway: boolean;
    accepts_reservations: boolean;
    accepts_waiter_calls: boolean;
    accepts_orders: boolean;

    // Step 4: Hours
    opening_hours: Record<string, { open: string; close: string; closed: boolean }>;

    // Step 5: Payment Methods
    payment_settings: {
        accepts_cash: boolean;
        accepts_card: boolean;
        accepts_bizum: boolean;
        accepts_apple_pay: boolean;
        accepts_google_pay: boolean;
    };

    // Step 6: Appearance
    primary_color: string;
    theme: 'light' | 'dark' | 'auto';
    theme_id: string;
}

export async function saveOnboardingProgress(step: number, data: Partial<OnboardingData>) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "No autenticado" };
    }

    // Get restaurant
    const { data: restaurants } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1);

    if (!restaurants || restaurants.length === 0) {
        return { error: "Restaurante no encontrado" };
    }

    const restaurantId = restaurants[0].id;

    // Save partial data
    const { error } = await supabase
        .from("restaurants")
        .update({
            ...data,
            onboarding_step: step,
            updated_at: new Date().toISOString(),
        })
        .eq("id", restaurantId);

    if (error) {
        console.error("Error saving onboarding progress:", error);
        return { error: error.message };
    }

    return { success: true };
}

export async function completeOnboarding(data: Partial<OnboardingData>) {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "No autenticado" };
    }

    // Get restaurant
    const { data: restaurants } = await supabase
        .from("restaurants")
        .select("id")
        .eq("owner_id", user.id)
        .limit(1);

    if (!restaurants || restaurants.length === 0) {
        return { error: "Restaurante no encontrado" };
    }

    const restaurantId = restaurants[0].id;

    // Save final data and mark as completed
    const { error } = await supabase
        .from("restaurants")
        .update({
            ...data,
            onboarding_completed: true,
            onboarding_step: 6,
            updated_at: new Date().toISOString(),
        })
        .eq("id", restaurantId);

    if (error) {
        console.error("Error completing onboarding:", error);
        return { error: error.message };
    }

    return { success: true, redirectTo: '/dashboard' };
}

export async function getOnboardingData() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { error: "No autenticado", data: null };
    }

    const { data: restaurants, error } = await supabase
        .from("restaurants")
        .select("*")
        .eq("owner_id", user.id)
        .limit(1);

    if (error || !restaurants || restaurants.length === 0) {
        return { error: "Restaurante no encontrado", data: null };
    }

    return {
        success: true,
        data: restaurants[0],
        currentStep: restaurants[0].onboarding_step || 1
    };
}
