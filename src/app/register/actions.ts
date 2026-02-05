"use server";

import { createClient } from "@/lib/supabase/server";

export async function registerAction(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const restaurantName = formData.get("restaurantName") as string;
    const country = formData.get("country") as string;
    const planFromForm = formData.get("plan") as string;

    console.log("=== REGISTER ACTION ===");
    console.log("Plan recibido:", planFromForm);

    // SOLO estos valores son válidos en la DB
    let dbPlan: 'basic' | 'pro' | 'enterprise' = 'basic';

    if (planFromForm === 'pro') {
        dbPlan = 'pro';
    } else if (planFromForm === 'enterprise') {
        dbPlan = 'enterprise';
    } else {
        dbPlan = 'basic'; // Por defecto
    }

    console.log("Plan a guardar:", dbPlan);

    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    restaurant_name: restaurantName,
                    country: country,
                },
            }
        });

        if (authError) {
            if (authError.message.includes("already registered")) {
                return { error: "Este email ya está registrado." };
            }
            return { error: authError.message };
        }

        if (!authData.user) {
            return { error: "No se pudo crear el usuario." };
        }

        const slug = restaurantName
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

        const finalSlug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;

        const { error: dbError } = await supabase.from("restaurants").insert({
            owner_id: authData.user.id,
            name: restaurantName,
            slug: finalSlug,
            subscription_plan: dbPlan,
            is_active: true,
            is_accepting_orders: true,
            address: country,
            email: email,
            onboarding_completed: false,
            onboarding_step: 1,
        });

        if (dbError) {
            console.error("DB Error:", dbError);
            return { error: `Error creando restaurante: ${dbError.message}` };
        }

        // Auto login
        await supabase.auth.signInWithPassword({ email, password });

        return { success: true, redirectTo: '/onboarding' };

    } catch (err: any) {
        console.error("Error:", err);
        return { error: "Error inesperado." };
    }
}