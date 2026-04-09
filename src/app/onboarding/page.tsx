"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowRight,
    ArrowLeft,
    Check,
    Store,
    Phone,
    MapPin,
    Settings,
    Clock,
    CreditCard,
    UtensilsCrossed,
    Palette,
    Sparkles,
    Loader2
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { PlanTier } from '@/types/database';

// Importar componentes de pasos
import { ProgressBar } from "@/components/onboarding/ProgressBar";
import { Step1Business } from "@/components/onboarding/Step1Business";
import { Step2Contact } from "@/components/onboarding/Step2Contact";
import { Step3Location } from "@/components/onboarding/Step3Location";
import { Step4Modes } from "@/components/onboarding/Step4Modes";
import { Step5Hours } from "@/components/onboarding/Step5Hours";
import { Step6Payments } from "@/components/onboarding/Step6Payments";
import { Step7Tables } from "@/components/onboarding/Step7Tables";
import { Step8Menu } from "@/components/onboarding/Step8Menu";
import { Step9Appearance } from "@/components/onboarding/Step9Appearance";
import { Step10Summary } from "@/components/onboarding/Step10Summary";
import { ThemeSelector } from "@/components/theme/ThemeSelector";

const TOTAL_STEPS = 10;

const steps = [
    { id: 1, title: "Tu negocio", icon: Store },
    { id: 2, title: "Contacto", icon: Phone },
    { id: 3, title: "Ubicación", icon: MapPin },
    { id: 4, title: "Operación", icon: Settings },
    { id: 5, title: "Horarios", icon: Clock },
    { id: 6, title: "Pagos", icon: CreditCard },
    { id: 7, title: "Mesas", icon: UtensilsCrossed },
    { id: 8, title: "Menú", icon: UtensilsCrossed },
    { id: 9, title: "Apariencia", icon: Palette },
    { id: 10, title: "Resumen", icon: Sparkles },
];

interface OnboardingConfig {
    userId: string;
    email: string;
    restaurantName: string;
    country: string;
    planTier: PlanTier;
    locations: number;
    timestamp: string;
}

export default function OnboardingPage() {
    const router = useRouter();
    const supabase = createClient();

    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);
    const [config, setConfig] = useState<OnboardingConfig | null>(null);

    // Form data acumulado
    const [formData, setFormData] = useState<Record<string, any>>({
        // Defaults
        business_type: "restaurant",
        primary_color: "#22C55E",
        secondary_color: "#FFC107",
        default_language: "es",
        supported_languages: ["es"],
        currency: "EUR",
        timezone: "Europe/Madrid",

        // Operational defaults
        location_mode: "fixed_table",
        payment_timing: "after",
        accepts_cash: true,
        accepts_card: true,
        mode_pickup: false,
        shared_tables_enabled: false,

        // Staff defaults
        tips_enabled: true,
        tip_suggestions: [10, 15, 20],
        tips_distribution: "individual",
        tips_payout: "end_of_shift",
        call_waiter_enabled: true,
        call_motives: ["Agua", "Cubiertos", "Servilletas", "La cuenta", "Otro"],

        // Menu defaults
        menu_option: "empty",

        // Theme defaults
        theme_id: "modern-minimal",
        theme_primary_color: null,
        theme_font: null,
        theme_font_size: "md",
    });

    useEffect(() => {
        loadOnboardingData();
    }, []);

    const loadOnboardingData = async () => {
        try {
            // 1. Cargar config de localStorage
            const stored = localStorage.getItem('onboardingConfig');
            if (!stored) {
                router.push('/register');
                return;
            }

            const parsed = JSON.parse(stored) as OnboardingConfig;
            setConfig(parsed);

            // 2. Verificar si ya existe el restaurant
            const { data: existingRestaurant } = await supabase
                .from('restaurants')
                .select('id, onboarding_completed')
                .eq('owner_id', parsed.userId)
                .single();

            if (existingRestaurant) {
                setRestaurantId(existingRestaurant.id);

                // Si ya completó el onboarding, redirigir al dashboard
                if (existingRestaurant.onboarding_completed) {
                    localStorage.removeItem('onboardingConfig');
                    router.push('/dashboard');
                    return;
                }

                // TODO: Cargar progreso guardado si existe
            }

            setLoading(false);
        } catch (error) {
            console.error('Error loading onboarding data:', error);
            setLoading(false);
        }
    };

    const updateFormData = (data: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const saveProgress = async (step: number) => {
        if (!restaurantId || !config) return;

        setSaving(true);
        try {
            // Guardar progreso en localStorage
            localStorage.setItem('onboardingProgress', JSON.stringify({
                step,
                formData,
                timestamp: new Date().toISOString()
            }));


        } catch (error) {
            console.error('Error saving progress:', error);
        } finally {
            setSaving(false);
        }
    };

    const canProceed = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!formData.business_type;
            case 2:
                return !!formData.phone;
            case 3:
                return !!formData.address && !!formData.city;
            case 4:
                return !!formData.location_mode && !!formData.payment_timing;
            case 5:
                return !!formData.working_hours;
            case 6:
                return true; // Payments tiene defaults
            case 7:
                return true; // Tables es opcional
            case 8:
                return !!formData.menu_option;
            case 9:
                return !!formData.primary_color;
            case 10:
                return true;
            default:
                return false;
        }
    };

    const handleNext = async () => {
        if (!canProceed(currentStep)) {
            alert('Por favor completa todos los campos requeridos');
            return;
        }

        await saveProgress(currentStep);

        if (currentStep < TOTAL_STEPS) {
            setCurrentStep(currentStep + 1);
        } else {
            await handleComplete();
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = async () => {
        if (!config) return;

        setSaving(true);
        try {


            // Mapear país a código ISO
            const countryCodeMap: Record<string, string> = {
                'España': 'ES', 'México': 'MX', 'Argentina': 'AR',
                'Colombia': 'CO', 'Chile': 'CL', 'Perú': 'PE',
                'Venezuela': 'VE', 'Ecuador': 'EC', 'Guatemala': 'GT',
                'Cuba': 'CU', 'Bolivia': 'BO', 'República Dominicana': 'DO',
                'Honduras': 'HN', 'Paraguay': 'PY', 'El Salvador': 'SV',
                'Nicaragua': 'NI', 'Costa Rica': 'CR', 'Panamá': 'PA',
                'Uruguay': 'UY', 'Puerto Rico': 'PR', 'Estados Unidos': 'US',
                'Francia': 'FR', 'Italia': 'IT', 'Portugal': 'PT',
                'Reino Unido': 'GB', 'Alemania': 'DE', 'Países Bajos': 'NL',
                'Bélgica': 'BE', 'Suiza': 'CH', 'Austria': 'AT', 'Brasil': 'BR',
            };
            const countryCode = countryCodeMap[config.country] || 'ES';

            // 1. Crear o actualizar restaurant
            let finalRestaurantId = restaurantId;

            if (!restaurantId) {
                // Generar slug
                const baseSlug = config.restaurantName
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-z0-9]+/g, "-")
                    .replace(/^-+|-+$/g, "");

                let finalSlug = baseSlug;
                let attempts = 0;
                while (attempts < 5) {
                    const { data: existing } = await supabase
                        .from("restaurants")
                        .select("id")
                        .eq("slug", finalSlug)
                        .limit(1);

                    if (!existing || existing.length === 0) break;
                    finalSlug = `${baseSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
                    attempts++;
                }

                // Crear restaurant
                const { data: newRestaurant, error: createError } = await supabase
                    .from("restaurants")
                    .insert({
                        owner_id: config.userId,
                        name: config.restaurantName,
                        slug: finalSlug,
                        plan_tier: config.planTier,
                        country: countryCode,
                        email: config.email,
                        total_locations: config.locations,
                        business_type: formData.business_type,
                        phone: formData.phone,
                        website: formData.website,
                        address: formData.address,
                        city: formData.city,
                        logo_url: formData.logo_url,
                        cover_image_url: formData.cover_image_url,
                        primary_color: formData.primary_color,
                        secondary_color: formData.secondary_color,
                        default_language: formData.default_language,
                        supported_languages: formData.supported_languages,
                        currency: formData.currency,
                        timezone: formData.timezone,
                        theme_id: formData.theme_id,
                        theme_primary_color: formData.theme_primary_color,
                        theme_font: formData.theme_font,
                        theme_font_size: formData.theme_font_size,
                        is_active: true,
                        onboarding_completed: true,
                    })
                    .select()
                    .single();

                if (createError) throw createError;
                finalRestaurantId = newRestaurant.id;
            } else {
                // Actualizar restaurant existente
                const { error: updateError } = await supabase
                    .from("restaurants")
                    .update({
                        business_type: formData.business_type,
                        phone: formData.phone,
                        website: formData.website,
                        address: formData.address,
                        city: formData.city,
                        logo_url: formData.logo_url,
                        cover_image_url: formData.cover_image_url,
                        primary_color: formData.primary_color,
                        secondary_color: formData.secondary_color,
                        default_language: formData.default_language,
                        supported_languages: formData.supported_languages,
                        currency: formData.currency,
                        timezone: formData.timezone,
                        onboarding_completed: true,
                    })
                    .eq("id", restaurantId);

                if (updateError) throw updateError;
            }

            // 2. Crear restaurant_config
            const { error: configError } = await supabase
                .from("restaurant_config")
                .upsert({
                    restaurant_id: finalRestaurantId,
                    operational_settings: {
                        location_mode: formData.location_mode,
                        has_delivery: formData.has_delivery || false,
                        has_beach_service: formData.has_beach_service || false,
                        has_room_service: formData.has_room_service || false,
                        has_pickup: formData.mode_pickup || false,
                        payment_timing: formData.payment_timing,
                        accepts_cash: formData.accepts_cash,
                        working_hours: formData.working_hours || {},
                        menu_schedules: formData.menu_schedules || {},
                        auto_switch_menus: formData.auto_switch_menus || false,
                    },
                    staff_settings: {
                        tips_enabled: formData.tips_enabled,
                        tip_suggestions: formData.tip_suggestions,
                        tips_distribution: formData.tips_distribution,
                        tips_payout: formData.tips_payout,
                        call_waiter_enabled: formData.call_waiter_enabled,
                        call_motives: formData.call_motives,
                    },
                    customer_settings: {
                        shared_table_enabled: formData.shared_tables_enabled || false,
                    },
                });

            if (configError) throw configError;

            // 3. Limpiar y redirigir
            localStorage.removeItem('onboardingConfig');
            localStorage.removeItem('onboardingProgress');

            router.push('/dashboard');

        } catch (error: any) {
            console.error('❌ Error completing onboarding:', error);
            alert(`Error: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Progress Bar */}
            <ProgressBar currentStep={currentStep} totalSteps={TOTAL_STEPS} steps={steps} />

            {/* Main Content */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {currentStep === 1 && (
                            <Step1Business
                                formData={formData}
                                updateFormData={updateFormData}
                                restaurantName={config?.restaurantName || ''}
                            />
                        )}
                        {currentStep === 2 && (
                            <Step2Contact
                                formData={formData}
                                updateFormData={updateFormData}
                                email={config?.email || ''}
                            />
                        )}
                        {currentStep === 3 && (
                            <Step3Location
                                formData={formData}
                                updateFormData={updateFormData}
                                country={config?.country || ''}
                            />
                        )}
                        {currentStep === 4 && (
                            <Step4Modes
                                formData={formData}
                                updateFormData={updateFormData}
                                planTier={config?.planTier || 'basic'}
                            />
                        )}
                        {currentStep === 5 && (
                            <Step5Hours
                                formData={formData}
                                updateFormData={updateFormData}
                            />
                        )}
                        {currentStep === 6 && (
                            <Step6Payments
                                formData={formData}
                                updateFormData={updateFormData}
                            />
                        )}
                        {currentStep === 7 && (
                            <Step7Tables
                                formData={formData}
                                updateFormData={updateFormData}
                            />
                        )}
                        {currentStep === 8 && (
                            <Step8Menu
                                formData={formData}
                                updateFormData={updateFormData}
                            />
                        )}
                        {currentStep === 9 && (
                            <div className="space-y-6">
                                <div className="text-center mb-8">
                                    <h1 className="text-3xl font-black text-slate-900 mb-3">
                                        ¿Cómo quieres que se vea tu menú?
                                    </h1>
                                    <p className="text-slate-500 text-lg">
                                        Tus clientes verán este diseño al escanear el QR
                                    </p>
                                </div>

                                <ThemeSelector
                                    defaultThemeId={formData.theme_id}
                                    onThemeChange={(themeId, overrides) => {
                                        updateFormData({
                                            theme_id: themeId,
                                            theme_primary_color: overrides.primaryColor ?? null,
                                            theme_font: overrides.fontFamily ?? null,
                                            theme_font_size: overrides.fontSize ?? 'md',
                                        });
                                    }}
                                />

                                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                    <p className="text-sm text-blue-600 font-medium">
                                        💡 Vista previa en vivo — Así verán tu menú tus clientes
                                    </p>
                                    <p className="text-xs text-blue-500 mt-1">
                                        Podrás cambiar el tema en cualquier momento desde Settings
                                    </p>
                                </div>
                            </div>
                        )}
                        {currentStep === 10 && (
                            <Step10Summary
                                formData={formData}
                                config={config}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between mt-12 pt-8 border-t border-slate-200">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ArrowLeft size={20} />
                        Anterior
                    </button>

                    <div className="text-sm text-slate-500 font-medium">
                        Paso {currentStep} de {TOTAL_STEPS}
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={!canProceed(currentStep) || saving}
                        className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-primary text-white hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all shadow-lg shadow-primary/25"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={20} className="animate-spin" />
                                Guardando...
                            </>
                        ) : currentStep === TOTAL_STEPS ? (
                            <>
                                <Check size={20} />
                                Finalizar
                            </>
                        ) : (
                            <>
                                Siguiente
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
