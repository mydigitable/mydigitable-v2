"use server";

import { createClient } from "@/lib/supabase/server";

export async function registerAction(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const restaurantName = formData.get("restaurantName") as string;
    const country = formData.get("country") as string;
    const planFromForm = formData.get("plan") as string;

    try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    restaurant_name: restaurantName,
                    country: country,
                    plan: planFromForm,
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

        return {
            success: true,
            userId: authData.user.id
        };

    } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Error inesperado'
        return { error: "Error inesperado: " + msg };
    }
}
