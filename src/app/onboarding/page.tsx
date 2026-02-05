"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
    ArrowRight,
    ArrowLeft,
    Check,
    Store,
    Phone,
    MapPin,
    Settings2,
    Clock,
    CreditCard,
    Palette,
    Loader2,
    Sparkles,
    Table2,
    UtensilsCrossed,
    PartyPopper,
} from "lucide-react";

// Components
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

const TOTAL_STEPS = 10;

const steps = [
    { id: 1, title: "Tu negocio", icon: Store },
    { id: 2, title: "Contacto", icon: Phone },
    { id: 3, title: "Ubicación", icon: MapPin },
    { id: 4, title: "Modos", icon: Settings2 },
    { id: 5, title: "Horarios", icon: Clock },
    { id: 6, title: "Pagos", icon: CreditCard },
    { id: 7, title: "Mesas", icon: Table2 },
    { id: 8, title: "Menú", icon: UtensilsCrossed },
    { id: 9, title: "Apariencia", icon: Palette },
    { id: 10, title: "¡Listo!", icon: PartyPopper },
];

export default function OnboardingPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<Record<string, any>>({
        // Defaults
        business_type: "restaurant",
        country: "España",
        mode_dine_in: true,
        accepts_takeaway: true,
        payment_settings: { accepts_cash: true, accepts_card: true },
        theme_id: "classic",
        primary_color: "#22C55E",
        menu_option: "empty",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [restaurantId, setRestaurantId] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();

    useEffect(() => {
        loadExistingData();
    }, []);

    const loadExistingData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push("/login");
                return;
            }

            const { data: restaurants } = await supabase
                .from("restaurants")
                .select("*")
                .eq("owner_id", user.id)
                .limit(1);

            if (restaurants && restaurants.length > 0) {
                const restaurant = restaurants[0];
                setRestaurantId(restaurant.id);

                if (restaurant.onboarding_completed) {
                    router.push("/dashboard");
                    return;
                }

                // Merge existing data
                setFormData(prev => ({
                    ...prev,
                    ...restaurant,
                    email: restaurant.email || user.email,
                }));

                // Resume from last step
                if (restaurant.onboarding_step > 1) {
                    setCurrentStep(restaurant.onboarding_step);
                }
            } else {
                // No restaurant - prefill email
                setFormData(prev => ({
                    ...prev,
                    email: user.email,
                }));
            }
        } catch (error) {
            console.error("Error loading data:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateFormData = (data: Partial<typeof formData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const saveProgress = async (step: number) => {
        if (!restaurantId) return;

        try {
            await supabase
                .from("restaurants")
                .update({
                    ...formData,
                    onboarding_step: step,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", restaurantId);
        } catch (error) {
            console.error("Error saving:", error);
        }
    };

    // Validations per step
    const canProceed = (step: number): boolean => {
        switch (step) {
            case 1: return !!formData.name?.trim();
            case 2: return !!formData.email && !!formData.phone;
            case 3: return !!formData.address?.trim();
            case 4: return formData.mode_dine_in || formData.accepts_takeaway ||
                formData.accepts_delivery || formData.mode_beach || formData.mode_events;
            case 6: return formData.payment_settings?.accepts_cash || formData.payment_settings?.accepts_card;
            case 10: return formData.confirmed === true;
            default: return true;
        }
    };

    const canSkip = (step: number): boolean => {
        return [5, 7, 8, 9].includes(step);
    };

    const handleNext = async () => {
        if (!canProceed(currentStep)) return;

        setSaving(true);
        await saveProgress(currentStep + 1);
        setSaving(false);

        if (currentStep < TOTAL_STEPS) {
            setCurrentStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleSkip = async () => {
        setSaving(true);
        await saveProgress(currentStep + 1);
        setSaving(false);
        setCurrentStep(prev => prev + 1);
    };

    const handleComplete = async () => {
        if (!formData.confirmed) return;

        setSaving(true);

        try {
            await supabase
                .from("restaurants")
                .update({
                    ...formData,
                    onboarding_completed: true,
                    onboarding_step: TOTAL_STEPS,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", restaurantId);

            // Create tables if specified
            if (formData.table_count > 0) {
                const tables = Array.from({ length: formData.table_count }, (_, i) => ({
                    restaurant_id: restaurantId,
                    number: `${i + 1}`,
                    name: `Mesa ${i + 1}`,
                    zone: "Principal",
                    is_active: true,
                }));

                await supabase.from("tables").insert(tables);
            }

            // Create demo menu if selected
            if (formData.menu_option === "demo") {
                await createDemoMenu();
            } else if (formData.menu_option === "empty") {
                await createEmptyMenu();
            }

            router.push("/dashboard");
        } catch (error) {
            console.error("Error completing:", error);
            setSaving(false);
        }
    };

    const createEmptyMenu = async () => {
        await supabase.from("categories").insert({
            restaurant_id: restaurantId,
            name: "General",
            position: 0,
            is_active: true,
        });
    };

    const createDemoMenu = async () => {
        const categories = [
            { name: "Entrantes", position: 0 },
            { name: "Principales", position: 1 },
            { name: "Postres", position: 2 },
        ];

        for (const cat of categories) {
            const { data: category } = await supabase
                .from("categories")
                .insert({ restaurant_id: restaurantId, ...cat, is_active: true })
                .select()
                .single();

            if (category) {
                const products = getDemoProducts(cat.name, category.id);
                await supabase.from("products").insert(products);
            }
        }
    };

    const getDemoProducts = (categoryName: string, categoryId: string) => {
        const demos: Record<string, any[]> = {
            "Entrantes": [
                { name: "Patatas bravas", price: 5.50, description: "Con salsa brava casera" },
                { name: "Croquetas", price: 6.00, description: "De jamón ibérico" },
                { name: "Ensalada mixta", price: 7.00, description: "Lechuga, tomate, cebolla" },
            ],
            "Principales": [
                { name: "Hamburguesa clásica", price: 12.00, description: "200g de carne, queso, lechuga" },
                { name: "Pizza Margarita", price: 10.00, description: "Tomate, mozzarella, albahaca" },
                { name: "Paella valenciana", price: 15.00, description: "Arroz, pollo, verduras" },
            ],
            "Postres": [
                { name: "Tarta de queso", price: 5.00, description: "Casera, con mermelada" },
                { name: "Helado artesanal", price: 4.00, description: "3 bolas a elegir" },
                { name: "Café con leche", price: 2.00, description: "" },
            ],
        };

        return (demos[categoryName] || []).map((p, i) => ({
            restaurant_id: restaurantId,
            category_id: categoryId,
            ...p,
            position: i,
            is_active: true,
            is_available: true,
        }));
    };

    const handleEditStep = (step: number) => {
        setCurrentStep(step);
    };

    // Handle "Terminar ahora" from step 3+
    const handleFinishNow = async () => {
        if (currentStep < 3) return;

        setSaving(true);

        // Set confirmation to true and update
        setFormData(prev => ({ ...prev, confirmed: true }));

        await supabase
            .from("restaurants")
            .update({
                ...formData,
                confirmed: true,
                onboarding_completed: true,
                onboarding_step: TOTAL_STEPS,
                updated_at: new Date().toISOString(),
            })
            .eq("id", restaurantId);

        router.push("/dashboard");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    const StepComponent = {
        1: Step1Business,
        2: Step2Contact,
        3: Step3Location,
        4: Step4Modes,
        5: Step5Hours,
        6: Step6Payments,
        7: Step7Tables,
        8: Step8Menu,
        9: Step9Appearance,
        10: Step10Summary,
    }[currentStep];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between mb-4 lg:mb-0">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-600 flex items-center justify-center">
                                <span className="text-white font-black text-xl italic">M</span>
                            </div>
                            <div>
                                <h1 className="font-black text-slate-900">Configuración inicial</h1>
                            </div>
                        </div>
                    </div>

                    <ProgressBar
                        currentStep={currentStep}
                        totalSteps={TOTAL_STEPS}
                        steps={steps}
                    />
                </div>
            </header>

            {/* Content */}
            <main className="max-w-3xl mx-auto px-6 py-12">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                    >
                        {/* Step Header */}
                        <div className="text-center mb-10">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-xs font-black uppercase tracking-widest mb-4">
                                <Sparkles size={14} />
                                Paso {currentStep} de {TOTAL_STEPS}
                            </div>
                            <h2 className="text-3xl font-black text-slate-900 mb-2">
                                {steps[currentStep - 1].title}
                            </h2>
                        </div>

                        {/* Step Content */}
                        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 p-8 md:p-10">
                            {StepComponent && (
                                currentStep === 10 ? (
                                    <Step10Summary
                                        data={formData}
                                        onUpdate={updateFormData}
                                        onEditStep={handleEditStep}
                                    />
                                ) : (
                                    <StepComponent
                                        data={formData}
                                        onUpdate={updateFormData}
                                    />
                                )
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex items-center justify-between mt-8">
                    <button
                        onClick={handleBack}
                        disabled={currentStep === 1 || saving}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${currentStep === 1
                                ? "text-slate-300 cursor-not-allowed"
                                : "text-slate-600 hover:bg-white"
                            }`}
                    >
                        <ArrowLeft size={18} />
                        Anterior
                    </button>

                    <div className="flex items-center gap-3">
                        {/* Skip button */}
                        {canSkip(currentStep) && (
                            <button
                                onClick={handleSkip}
                                disabled={saving}
                                className="px-4 py-3 text-slate-400 hover:text-slate-600 font-medium transition-all"
                            >
                                Saltar
                            </button>
                        )}

                        {/* Finish Now - from step 3 */}
                        {currentStep >= 3 && currentStep < 10 && (
                            <button
                                onClick={handleFinishNow}
                                disabled={saving}
                                className="flex items-center gap-2 px-5 py-3 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-bold transition-all"
                            >
                                <Check size={16} />
                                Terminar ahora
                            </button>
                        )}

                        {/* Final Complete button */}
                        {currentStep === 10 ? (
                            <button
                                onClick={handleComplete}
                                disabled={saving || !canProceed(10)}
                                className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-primary to-emerald-600 text-white rounded-xl font-black text-lg shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        Completar y entrar
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={saving || !canProceed(currentStep)}
                                className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-xl font-black text-lg shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 size={20} className="animate-spin" />
                                ) : (
                                    <>
                                        Siguiente
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
