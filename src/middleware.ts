import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) =>
                        request.cookies.set(name, value)
                    );
                    supabaseResponse = NextResponse.next({
                        request,
                    });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const {
        data: { user },
    } = await supabase.auth.getUser();

    // Proteger rutas del panel admin (requiere autenticación)
    // La verificación de rol admin se hace en el layout del admin
    if (request.nextUrl.pathname.startsWith("/admin")) {
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }
        // Permitir acceso - el layout verificará si es admin
    }

    // Proteger rutas del dashboard
    if (request.nextUrl.pathname.startsWith("/dashboard")) {
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }

        // Check if onboarding is completed
        const { data: restaurant } = await supabase
            .from("restaurants")
            .select("onboarding_completed")
            .eq("owner_id", user.id)
            .single();

        if (restaurant && !restaurant.onboarding_completed) {
            const url = request.nextUrl.clone();
            url.pathname = "/onboarding";
            return NextResponse.redirect(url);
        }
    }

    // Proteger ruta de onboarding (solo usuarios autenticados)
    if (request.nextUrl.pathname.startsWith("/onboarding")) {
        if (!user) {
            const url = request.nextUrl.clone();
            url.pathname = "/login";
            return NextResponse.redirect(url);
        }

        // If onboarding is already completed, redirect to dashboard
        const { data: restaurant } = await supabase
            .from("restaurants")
            .select("onboarding_completed")
            .eq("owner_id", user.id)
            .single();

        if (restaurant && restaurant.onboarding_completed) {
            const url = request.nextUrl.clone();
            url.pathname = "/dashboard";
            return NextResponse.redirect(url);
        }
    }

    // Redirigir usuarios logueados fuera de auth pages
    if (
        (request.nextUrl.pathname === "/login" ||
            request.nextUrl.pathname === "/register") &&
        user
    ) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
    }

    return supabaseResponse;
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
