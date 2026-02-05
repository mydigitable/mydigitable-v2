import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await createClient();

        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            // Verificar si el usuario tiene restaurante, si no, crearlo
            const { data: restaurant } = await supabase
                .from("restaurants")
                .select("id")
                .eq("owner_id", data.user.id)
                .single();

            if (!restaurant) {
                // Crear restaurante si no existe (fallback)
                const restaurantName = data.user.user_metadata?.restaurant_name || "Mi Restaurante";
                const slug = restaurantName
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-|-$/g, "") + "-" + Date.now().toString(36).slice(-4);

                await supabase.from("restaurants").insert({
                    owner_id: data.user.id,
                    name: restaurantName,
                    slug: slug,
                    email: data.user.email,
                    default_locale: "es",
                    theme: "default",
                    is_active: true,
                });
            }

            // Redirigir a la página de confirmación exitosa
            return NextResponse.redirect(`${origin}/auth/confirmed`);
        }
    }

    // Error - redirigir a login con error
    return NextResponse.redirect(`${origin}/login?error=auth_error`);
}
