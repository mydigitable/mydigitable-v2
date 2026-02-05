"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
    Upload, FileImage, Layers, UtensilsCrossed, CheckCircle2, ChevronRight, ChevronLeft,
    Sparkles, Plus, Trash2, GripVertical, X, Loader2, ArrowRight, Zap, Clock, CreditCard,
    Banknote, Users, Calendar, Coffee, Wine, Sun, Utensils, BookOpen, DollarSign, Percent,
    ShoppingBag, Building2, MapPin, Bike, UtensilsCrossed as Dine, Package, Umbrella,
    Users2, ShoppingCart, Truck, Phone, Mail, Image
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useMenu } from "@/contexts/MenuContext";

// ============================================================
// TYPES
// ============================================================

interface WizardCategory {
    id: string;
    name: string;
    icon: string;
    products: WizardProduct[];
}

interface WizardProduct {
    id: string;
    name: string;
    price: string;
    description: string;
}

interface Zone {
    id: string;
    name: string;
    icon: string;
    priceModifier: string; // percentage
    enabled: boolean;
}

interface MenuType {
    id: string;
    name: string;
    icon: string;
    enabled: boolean;
    schedule?: { start: string; end: string };
}

interface DaySchedule {
    isOpen: boolean;
    open: string;
    close: string;
}

interface WizardState {
    // Step 2: Business Info
    businessInfo: {
        name: string;
        address: string;
        phone: string;
        email: string;
    };
    // Step 3: Service Modes
    serviceModes: {
        dineIn: boolean;
        takeaway: boolean;
        delivery: boolean;
        beachService: boolean;
    };
    // Step 4: Zones
    zones: Zone[];
    // Step 5: Menu Types
    menuTypes: MenuType[];
    // Step 6: Hours
    operatingHours: { [day: string]: DaySchedule };
    // Step 7-8: Categories & Products
    categories: WizardCategory[];
    // Step 9: Cart & Orders
    orderingConfig: {
        sharedCart: boolean;
        groupOrdering: boolean;
    };
    // Step 10: Payment
    payment: {
        acceptCash: boolean;
        acceptCard: boolean;
        allowSplitBill: boolean;
    };
    // Step 11: Sales & Delivery
    salesConfig: {
        minimumOrder: string;
        prepTime: string;
        deliveryFee: string;
        deliveryRadius: string;
        acceptTips: boolean;
        tipPercentages: number[];
    };
}

// ============================================================
// DEFAULTS
// ============================================================

const defaultZones: Zone[] = [
    { id: "interior", name: "Interior", icon: "🏠", priceModifier: "0", enabled: true },
    { id: "terraza", name: "Terraza", icon: "☀️", priceModifier: "10", enabled: false },
    { id: "playa", name: "Playa/Sombrilla", icon: "🏖️", priceModifier: "15", enabled: false },
];

const defaultMenuTypes: MenuType[] = [
    { id: "main", name: "Carta Principal", icon: "BookOpen", enabled: true },
    { id: "daily", name: "Menú del Día", icon: "Calendar", enabled: false, schedule: { start: "12:00", end: "16:00" } },
    { id: "breakfast", name: "Desayunos", icon: "Coffee", enabled: false, schedule: { start: "08:00", end: "12:00" } },
    { id: "drinks", name: "Bebidas", icon: "Wine", enabled: false },
];

// Icon map for menu types (to avoid serialization issues with localStorage)
const MenuIconMap: { [key: string]: any } = {
    BookOpen, Calendar, Coffee, Wine
};

const defaultHours: { [day: string]: DaySchedule } = {
    lunes: { isOpen: true, open: "12:00", close: "23:00" },
    martes: { isOpen: true, open: "12:00", close: "23:00" },
    miercoles: { isOpen: true, open: "12:00", close: "23:00" },
    jueves: { isOpen: true, open: "12:00", close: "23:00" },
    viernes: { isOpen: true, open: "12:00", close: "00:00" },
    sabado: { isOpen: true, open: "12:00", close: "00:00" },
    domingo: { isOpen: false, open: "12:00", close: "22:00" },
};

const suggestedCategories = [
    { name: "Entrantes", icon: "🥗" },
    { name: "Principales", icon: "🍽️" },
    { name: "Postres", icon: "🍰" },
    { name: "Bebidas", icon: "🍷" },
    { name: "Cafés", icon: "☕" },
];

// ============================================================
// STEPS CONFIG
// ============================================================

const STEPS = [
    { id: "welcome", label: "Inicio", icon: Sparkles },
    { id: "business", label: "Negocio", icon: Building2 },
    { id: "modes", label: "Servicios", icon: Dine },
    { id: "zones", label: "Zonas", icon: MapPin },
    { id: "menus", label: "Menús", icon: BookOpen },
    { id: "hours", label: "Horarios", icon: Clock },
    { id: "categories", label: "Categorías", icon: Layers },
    { id: "products", label: "Productos", icon: UtensilsCrossed },
    { id: "ordering", label: "Pedidos", icon: ShoppingCart },
    { id: "payment", label: "Pagos", icon: CreditCard },
    { id: "sales", label: "Ventas", icon: Truck },
    { id: "review", label: "Publicar", icon: CheckCircle2 },
];

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function OnboardingPage() {
    const router = useRouter();
    const { restaurant, refreshMenu } = useMenu();
    const supabase = createClient();

    const [currentStep, setCurrentStep] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    const [state, setState] = useState<WizardState>({
        businessInfo: { name: restaurant?.name || "", address: "", phone: "", email: "" },
        serviceModes: { dineIn: true, takeaway: false, delivery: false, beachService: false },
        zones: defaultZones,
        menuTypes: defaultMenuTypes,
        operatingHours: defaultHours,
        categories: [],
        orderingConfig: { sharedCart: true, groupOrdering: false },
        payment: { acceptCash: true, acceptCard: true, allowSplitBill: true },
        salesConfig: { minimumOrder: "0", prepTime: "15", deliveryFee: "2", deliveryRadius: "5", acceptTips: true, tipPercentages: [5, 10, 15] },
    });

    // Load saved progress
    useEffect(() => {
        const saved = localStorage.getItem("onboarding_v3");
        if (saved) {
            try {
                const data = JSON.parse(saved);
                setState(prev => ({ ...prev, ...data.state }));
                setCurrentStep(data.step || 0);
            } catch (e) { console.error(e); }
        }
    }, []);

    // Save progress
    useEffect(() => {
        if (currentStep > 0) {
            localStorage.setItem("onboarding_v3", JSON.stringify({ state, step: currentStep }));
        }
    }, [state, currentStep]);

    // Update state helper
    const updateState = <K extends keyof WizardState>(key: K, value: WizardState[K]) => {
        setState(prev => ({ ...prev, [key]: value }));
    };

    // Category handlers
    const addCategory = (name?: string, icon?: string) => {
        updateState("categories", [...state.categories, { id: crypto.randomUUID(), name: name || "", icon: icon || "🍽️", products: [] }]);
    };
    const removeCategory = (id: string) => {
        updateState("categories", state.categories.filter(c => c.id !== id));
    };
    const updateCategory = (id: string, updates: Partial<WizardCategory>) => {
        updateState("categories", state.categories.map(c => c.id === id ? { ...c, ...updates } : c));
    };

    // Product handlers
    const addProduct = (catId: string) => {
        updateState("categories", state.categories.map(c => c.id === catId ? { ...c, products: [...c.products, { id: crypto.randomUUID(), name: "", price: "", description: "" }] } : c));
    };
    const removeProduct = (catId: string, prodId: string) => {
        updateState("categories", state.categories.map(c => c.id === catId ? { ...c, products: c.products.filter(p => p.id !== prodId) } : c));
    };
    const updateProduct = (catId: string, prodId: string, updates: Partial<WizardProduct>) => {
        updateState("categories", state.categories.map(c => c.id === catId ? { ...c, products: c.products.map(p => p.id === prodId ? { ...p, ...updates } : p) } : c));
    };

    // Save all
    const handleSave = async () => {
        if (!restaurant) return;
        setIsSaving(true);
        try {
            // 1. Update restaurant settings
            await supabase.from("restaurants").update({
                mode_dine_in: state.serviceModes.dineIn,
                mode_takeaway: state.serviceModes.takeaway,
                mode_delivery: state.serviceModes.delivery,
                mode_beach_service: state.serviceModes.beachService,
                opening_hours: state.operatingHours,
                settings: {
                    menuTypes: state.menuTypes,
                    zones: state.zones,
                    orderingConfig: state.orderingConfig,
                    payment: state.payment,
                    salesConfig: state.salesConfig,
                },
            }).eq("id", restaurant.id);

            // 2. Save zones
            for (const zone of state.zones.filter(z => z.enabled)) {
                await supabase.from("zones").upsert({
                    restaurant_id: restaurant.id,
                    name: zone.name,
                    icon: zone.icon,
                    price_modifier: parseFloat(zone.priceModifier) || 0,
                    is_active: true,
                }, { onConflict: "restaurant_id,name" });
            }

            // 3. Save categories and products
            for (let i = 0; i < state.categories.length; i++) {
                const cat = state.categories[i];
                if (!cat.name.trim()) continue;
                const { data: catData } = await supabase.from("categories").insert({
                    restaurant_id: restaurant.id,
                    name_es: cat.name,
                    icon: cat.icon,
                    sort_order: i,
                    is_active: true,
                }).select().single();

                if (catData) {
                    for (let j = 0; j < cat.products.length; j++) {
                        const prod = cat.products[j];
                        if (!prod.name.trim()) continue;
                        await supabase.from("products").insert({
                            restaurant_id: restaurant.id,
                            category_id: catData.id,
                            name_es: prod.name,
                            description_es: prod.description || null,
                            price: parseFloat(prod.price) || 0,
                            sort_order: j,
                            is_available: true,
                        });
                    }
                }
            }

            localStorage.removeItem("onboarding_v3");
            localStorage.setItem("menu_onboarding_complete", "true");
            await refreshMenu();
            router.push("/dashboard/menu");
        } catch (err) {
            console.error(err);
            alert("Error al guardar");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSkip = () => {
        localStorage.setItem("menu_onboarding_complete", "true");
        router.push("/dashboard/menu");
    };

    // ============================================================
    // RENDER
    // ============================================================

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Progress */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
                <motion.div className="h-full bg-primary" animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }} />
            </div>

            {/* Header */}
            <header className="sticky top-0 bg-white/80 backdrop-blur-xl border-b border-slate-100 z-40">
                <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-slate-400">Paso {currentStep + 1}/{STEPS.length}</span>
                        <h1 className="text-base font-black text-slate-900">{STEPS[currentStep].label}</h1>
                    </div>
                    <button onClick={handleSkip} className="text-xs text-slate-400 hover:text-slate-600">Saltar</button>
                </div>
                <div className="max-w-4xl mx-auto px-4 pb-3 flex gap-1 overflow-x-auto">
                    {STEPS.map((s, i) => (
                        <div key={s.id} className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 ${i < currentStep ? "bg-primary text-white" : i === currentStep ? "bg-primary/10 text-primary ring-2 ring-primary" : "bg-slate-100 text-slate-300"}`}>
                            {i < currentStep ? <CheckCircle2 size={12} /> : <s.icon size={12} />}
                        </div>
                    ))}
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 py-6">
                <AnimatePresence mode="wait">
                    {currentStep === 0 && <WelcomeStep key="s0" onManual={() => setCurrentStep(1)} onImport={() => setShowImportModal(true)} />}
                    {currentStep === 1 && <BusinessStep key="s1" data={state.businessInfo} onChange={d => updateState("businessInfo", d)} />}
                    {currentStep === 2 && <ServiceModesStep key="s2" data={state.serviceModes} onChange={d => updateState("serviceModes", d)} />}
                    {currentStep === 3 && <ZonesStep key="s3" zones={state.zones} onChange={z => updateState("zones", z)} />}
                    {currentStep === 4 && <MenuTypesStep key="s4" types={state.menuTypes} onChange={t => updateState("menuTypes", t)} />}
                    {currentStep === 5 && <HoursStep key="s5" hours={state.operatingHours} onChange={h => updateState("operatingHours", h)} menuTypes={state.menuTypes} onUpdateMenuTypes={t => updateState("menuTypes", t)} />}
                    {currentStep === 6 && <CategoriesStep key="s6" categories={state.categories} onAdd={addCategory} onRemove={removeCategory} onUpdate={updateCategory} suggestions={suggestedCategories} />}
                    {currentStep === 7 && <ProductsStep key="s7" categories={state.categories} onAdd={addProduct} onRemove={removeProduct} onUpdate={updateProduct} />}
                    {currentStep === 8 && <OrderingStep key="s8" data={state.orderingConfig} onChange={d => updateState("orderingConfig", d)} />}
                    {currentStep === 9 && <PaymentStep key="s9" data={state.payment} onChange={d => updateState("payment", d)} />}
                    {currentStep === 10 && <SalesStep key="s10" data={state.salesConfig} onChange={d => updateState("salesConfig", d)} hasDelivery={state.serviceModes.delivery} />}
                    {currentStep === 11 && <ReviewStep key="s11" state={state} />}
                </AnimatePresence>
            </main>

            {/* Footer */}
            {currentStep > 0 && (
                <footer className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 z-30">
                    <div className="max-w-4xl mx-auto flex justify-between">
                        <button onClick={() => setCurrentStep(c => c - 1)} className="flex items-center gap-1 px-4 py-2 text-slate-600 font-bold text-sm">
                            <ChevronLeft size={16} /> Anterior
                        </button>
                        {currentStep < STEPS.length - 1 ? (
                            <button onClick={() => setCurrentStep(c => c + 1)} className="flex items-center gap-1 px-5 py-2 bg-primary text-white rounded-xl font-bold text-sm">
                                Siguiente <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1 px-5 py-2 bg-primary text-white rounded-xl font-bold text-sm disabled:opacity-50">
                                {isSaving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                {isSaving ? "Guardando..." : "Publicar"}
                            </button>
                        )}
                    </div>
                </footer>
            )}

            {showImportModal && <ImportModal onClose={() => setShowImportModal(false)} onImport={cats => { updateState("categories", cats); setShowImportModal(false); setCurrentStep(11); }} />}
        </div>
    );
}

// ============================================================
// STEP COMPONENTS
// ============================================================

function WelcomeStep({ onManual, onImport }: { onManual: () => void; onImport: () => void }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-center py-8">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4"><Sparkles size={32} className="text-primary" /></div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">¡Configuremos tu restaurante!</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">En minutos tendrás todo listo: menú, zonas, pagos, delivery y más.</p>
            <div className="grid md:grid-cols-2 gap-4 max-w-xl mx-auto">
                <button onClick={onImport} className="p-6 bg-white rounded-xl border-2 border-slate-100 hover:border-primary/30 text-left"><FileImage size={24} className="text-violet-500 mb-3" /><h3 className="font-bold text-slate-900">Importar menú</h3><p className="text-xs text-slate-400">Sube foto y extraemos productos</p></button>
                <button onClick={onManual} className="p-6 bg-white rounded-xl border-2 border-slate-100 hover:border-primary/30 text-left"><Plus size={24} className="text-emerald-500 mb-3" /><h3 className="font-bold text-slate-900">Paso a paso</h3><p className="text-xs text-slate-400">Te guiamos en cada configuración</p></button>
            </div>
        </motion.div>
    );
}

function BusinessStep({ data, onChange }: { data: WizardState["businessInfo"]; onChange: (d: WizardState["businessInfo"]) => void }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 pb-20">
            <div className="text-center mb-6"><h2 className="text-xl font-black text-slate-900">Datos de tu negocio</h2><p className="text-sm text-slate-500">Información básica del restaurante</p></div>
            <div className="bg-white rounded-xl border p-4 space-y-4">
                <div><label className="text-xs font-bold text-slate-500 block mb-1">Nombre</label><input value={data.name} onChange={e => onChange({ ...data, name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Mi Restaurante" /></div>
                <div><label className="text-xs font-bold text-slate-500 block mb-1">Dirección</label><input value={data.address} onChange={e => onChange({ ...data, address: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Calle Principal 123" /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold text-slate-500 block mb-1">Teléfono</label><input value={data.phone} onChange={e => onChange({ ...data, phone: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="+34 600 000 000" /></div>
                    <div><label className="text-xs font-bold text-slate-500 block mb-1">Email</label><input value={data.email} onChange={e => onChange({ ...data, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="info@restaurante.com" /></div>
                </div>
            </div>
        </motion.div>
    );
}

function ServiceModesStep({ data, onChange }: { data: WizardState["serviceModes"]; onChange: (d: WizardState["serviceModes"]) => void }) {
    const modes = [{ key: "dineIn", label: "En sala", desc: "Clientes comen en el local", icon: Dine }, { key: "takeaway", label: "Para llevar", desc: "Recogen en el local", icon: Package }, { key: "delivery", label: "Delivery", desc: "Envío a domicilio", icon: Bike }, { key: "beachService", label: "Servicio Playa", desc: "Sombrillas y hamacas", icon: Umbrella }];
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 pb-20">
            <div className="text-center mb-6"><h2 className="text-xl font-black text-slate-900">¿Qué servicios ofreces?</h2><p className="text-sm text-slate-500">Selecciona todos los que apliquen</p></div>
            <div className="space-y-3">
                {modes.map(m => (<button key={m.key} onClick={() => onChange({ ...data, [m.key]: !data[m.key as keyof typeof data] })} className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 ${data[m.key as keyof typeof data] ? "bg-primary/5 border-primary" : "bg-white border-slate-100"}`}><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data[m.key as keyof typeof data] ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}><m.icon size={20} /></div><div className="flex-1 text-left"><h3 className="font-bold text-slate-900">{m.label}</h3><p className="text-xs text-slate-400">{m.desc}</p></div><div className={`w-5 h-5 rounded-full border-2 ${data[m.key as keyof typeof data] ? "bg-primary border-primary" : "border-slate-200"}`}>{data[m.key as keyof typeof data] && <CheckCircle2 size={12} className="text-white m-0.5" />}</div></button>))}
            </div>
        </motion.div>
    );
}

function ZonesStep({ zones, onChange }: { zones: Zone[]; onChange: (z: Zone[]) => void }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 pb-20">
            <div className="text-center mb-6"><h2 className="text-xl font-black text-slate-900">Zonas y Precios</h2><p className="text-sm text-slate-500">¿Precios diferentes en terraza o playa?</p></div>
            <div className="space-y-3">
                {zones.map(z => (<div key={z.id} className={`p-4 rounded-xl border-2 ${z.enabled ? "bg-white border-primary/30" : "bg-slate-50 border-slate-100"}`}><div className="flex items-center gap-4"><button onClick={() => onChange(zones.map(zz => zz.id === z.id ? { ...zz, enabled: !zz.enabled } : zz))} className={`w-10 h-6 rounded-full ${z.enabled ? "bg-primary" : "bg-slate-200"}`}><div className={`w-4 h-4 bg-white rounded-full shadow ${z.enabled ? "translate-x-5" : "translate-x-1"}`} /></button><span className="text-xl">{z.icon}</span><span className="font-bold text-slate-900 flex-1">{z.name}</span>{z.enabled && z.id !== "interior" && (<div className="flex items-center gap-1"><span className="text-xs text-slate-400">+</span><input type="number" value={z.priceModifier} onChange={e => onChange(zones.map(zz => zz.id === z.id ? { ...zz, priceModifier: e.target.value } : zz))} className="w-14 px-2 py-1 border rounded-lg text-sm text-center font-bold" /><span className="text-xs text-slate-400">%</span></div>)}</div></div>))}
            </div>
            <p className="text-xs text-slate-400 text-center">El recargo se aplica automáticamente a los pedidos en esa zona</p>
        </motion.div>
    );
}

function MenuTypesStep({ types, onChange }: { types: MenuType[]; onChange: (t: MenuType[]) => void }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 pb-20">
            <div className="text-center mb-6"><h2 className="text-xl font-black text-slate-900">Tipos de Menú</h2><p className="text-sm text-slate-500">¿Qué cartas ofreces?</p></div>
            <div className="grid sm:grid-cols-2 gap-4">
                {types.map(t => {
                    const IconComponent = MenuIconMap[t.icon] || BookOpen;
                    return (
                        <button key={t.id} onClick={() => onChange(types.map(tt => tt.id === t.id ? { ...tt, enabled: !tt.enabled } : tt))} className={`p-5 rounded-xl border-2 text-left ${t.enabled ? "bg-primary/5 border-primary" : "bg-white border-slate-100"}`}>
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.enabled ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}>
                                    <IconComponent size={20} />
                                </div>
                                {t.enabled && <CheckCircle2 size={18} className="text-primary" />}
                            </div>
                            <h3 className="font-bold text-slate-900">{t.name}</h3>
                            {t.schedule && <p className="text-xs text-slate-400">{t.schedule.start} - {t.schedule.end}</p>}
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
}

function HoursStep({ hours, onChange, menuTypes, onUpdateMenuTypes }: { hours: { [day: string]: DaySchedule }; onChange: (h: { [day: string]: DaySchedule }) => void; menuTypes: MenuType[]; onUpdateMenuTypes: (t: MenuType[]) => void }) {
    const days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"];
    const labels: { [k: string]: string } = { lunes: "Lun", martes: "Mar", miercoles: "Mié", jueves: "Jue", viernes: "Vie", sabado: "Sáb", domingo: "Dom" };
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 pb-20">
            <div className="text-center mb-6"><h2 className="text-xl font-black text-slate-900">Horarios</h2><p className="text-sm text-slate-500">¿Cuándo estás abierto?</p></div>
            <div className="bg-white rounded-xl border overflow-hidden">
                {days.map(d => (<div key={d} className="p-3 border-b last:border-0 flex items-center gap-3"><button onClick={() => onChange({ ...hours, [d]: { ...hours[d], isOpen: !hours[d].isOpen } })} className={`w-8 h-5 rounded-full ${hours[d].isOpen ? "bg-primary" : "bg-slate-200"}`}><div className={`w-3 h-3 bg-white rounded-full shadow ${hours[d].isOpen ? "translate-x-4" : "translate-x-1"}`} /></button><span className={`w-10 font-bold text-sm ${hours[d].isOpen ? "text-slate-900" : "text-slate-300"}`}>{labels[d]}</span>{hours[d].isOpen ? (<div className="flex items-center gap-2 text-sm"><input type="time" value={hours[d].open} onChange={e => onChange({ ...hours, [d]: { ...hours[d], open: e.target.value } })} className="px-2 py-1 border rounded" /><span className="text-slate-400">-</span><input type="time" value={hours[d].close} onChange={e => onChange({ ...hours, [d]: { ...hours[d], close: e.target.value } })} className="px-2 py-1 border rounded" /></div>) : <span className="text-xs text-slate-400">Cerrado</span>}</div>))}
            </div>
        </motion.div>
    );
}

function CategoriesStep({ categories, onAdd, onRemove, onUpdate, suggestions }: { categories: WizardCategory[]; onAdd: (n?: string, i?: string) => void; onRemove: (id: string) => void; onUpdate: (id: string, u: Partial<WizardCategory>) => void; suggestions: { name: string; icon: string }[] }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 pb-20">
            <div className="text-center mb-6"><h2 className="text-xl font-black text-slate-900">Categorías</h2><p className="text-sm text-slate-500">Organiza tu menú</p></div>
            {categories.length === 0 && (<div className="bg-slate-50 rounded-xl p-4"><p className="text-xs text-slate-500 mb-3">Sugerencias:</p><div className="flex flex-wrap gap-2">{suggestions.map(s => (<button key={s.name} onClick={() => onAdd(s.name, s.icon)} className="px-3 py-1.5 bg-white border rounded-lg text-sm font-bold text-slate-600 hover:border-primary">+ {s.name}</button>))}</div></div>)}
            <div className="space-y-2">{categories.map(c => (<div key={c.id} className="flex items-center gap-3 p-3 bg-white rounded-xl border"><GripVertical size={16} className="text-slate-300" /><span className="text-lg">{c.icon}</span><input value={c.name} onChange={e => onUpdate(c.id, { name: e.target.value })} placeholder="Nombre..." className="flex-1 font-bold bg-transparent focus:outline-none" /><button onClick={() => onRemove(c.id)} className="p-1 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button></div>))}</div>
            <button onClick={() => onAdd()} className="w-full p-3 border-2 border-dashed rounded-xl text-slate-400 hover:border-primary hover:text-primary font-bold text-sm flex items-center justify-center gap-2"><Plus size={16} /> Añadir categoría</button>
        </motion.div>
    );
}

function ProductsStep({ categories, onAdd, onRemove, onUpdate }: { categories: WizardCategory[]; onAdd: (catId: string) => void; onRemove: (catId: string, prodId: string) => void; onUpdate: (catId: string, prodId: string, u: Partial<WizardProduct>) => void }) {
    const [expanded, setExpanded] = useState<string | null>(categories[0]?.id || null);
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4 pb-20">
            <div className="text-center mb-6"><h2 className="text-xl font-black text-slate-900">Productos</h2><p className="text-sm text-slate-500">Añade productos a cada categoría</p></div>
            {categories.map(c => (<div key={c.id} className="bg-white rounded-xl border overflow-hidden"><button onClick={() => setExpanded(expanded === c.id ? null : c.id)} className="w-full p-3 flex items-center gap-3 hover:bg-slate-50"><span className="text-lg">{c.icon}</span><span className="font-bold flex-1 text-left">{c.name || "Sin nombre"}</span><span className="text-xs text-slate-400">{c.products.length}</span><ChevronRight size={16} className={`text-slate-300 transition-transform ${expanded === c.id ? "rotate-90" : ""}`} /></button>{expanded === c.id && (<div className="border-t p-3 space-y-2">{c.products.map(p => (<div key={p.id} className="p-3 bg-slate-50 rounded-lg space-y-2"><div className="flex gap-2"><input value={p.name} onChange={e => onUpdate(c.id, p.id, { name: e.target.value })} placeholder="Producto" className="flex-1 px-2 py-1 border rounded text-sm font-bold" /><div className="relative w-20"><span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">€</span><input type="number" step="0.01" value={p.price} onChange={e => onUpdate(c.id, p.id, { price: e.target.value })} className="w-full pl-5 pr-2 py-1 border rounded text-sm font-bold" /></div><button onClick={() => onRemove(c.id, p.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={14} /></button></div><input value={p.description} onChange={e => onUpdate(c.id, p.id, { description: e.target.value })} placeholder="Descripción (opcional)" className="w-full px-2 py-1 border rounded text-xs text-slate-500" /></div>))}<button onClick={() => onAdd(c.id)} className="w-full p-2 border border-dashed rounded-lg text-xs text-slate-400 hover:text-primary hover:border-primary flex items-center justify-center gap-1"><Plus size={12} /> Producto</button></div>)}</div>))}
        </motion.div>
    );
}

function OrderingStep({ data, onChange }: { data: WizardState["orderingConfig"]; onChange: (d: WizardState["orderingConfig"]) => void }) {
    const opts = [{ key: "sharedCart", label: "Carrito Compartido", desc: "Todos en la mesa ven los mismos productos", icon: ShoppingCart }, { key: "groupOrdering", label: "Pedidos Grupales", desc: "Cada persona añade su parte del pedido", icon: Users2 }];
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 pb-20">
            <div className="text-center mb-6"><h2 className="text-xl font-black text-slate-900">Opciones de Pedido</h2><p className="text-sm text-slate-500">¿Cómo piden tus clientes?</p></div>
            <div className="space-y-3">
                {opts.map(o => (<button key={o.key} onClick={() => onChange({ ...data, [o.key]: !data[o.key as keyof typeof data] })} className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 ${data[o.key as keyof typeof data] ? "bg-primary/5 border-primary" : "bg-white border-slate-100"}`}><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data[o.key as keyof typeof data] ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}><o.icon size={20} /></div><div className="flex-1 text-left"><h3 className="font-bold text-slate-900">{o.label}</h3><p className="text-xs text-slate-400">{o.desc}</p></div><div className={`w-5 h-5 rounded-full border-2 ${data[o.key as keyof typeof data] ? "bg-primary border-primary" : "border-slate-200"}`}>{data[o.key as keyof typeof data] && <CheckCircle2 size={12} className="text-white m-0.5" />}</div></button>))}
            </div>
        </motion.div>
    );
}

function PaymentStep({ data, onChange }: { data: WizardState["payment"]; onChange: (d: WizardState["payment"]) => void }) {
    const opts = [{ key: "acceptCash", label: "Efectivo", icon: Banknote }, { key: "acceptCard", label: "Tarjeta", icon: CreditCard }, { key: "allowSplitBill", label: "Dividir Cuenta", icon: Users }];
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 pb-20">
            <div className="text-center mb-6"><h2 className="text-xl font-black text-slate-900">Métodos de Pago</h2><p className="text-sm text-slate-500">¿Cómo pagan tus clientes?</p></div>
            <div className="space-y-3">
                {opts.map(o => (<button key={o.key} onClick={() => onChange({ ...data, [o.key]: !data[o.key as keyof typeof data] })} className={`w-full p-4 rounded-xl border-2 flex items-center gap-4 ${data[o.key as keyof typeof data] ? "bg-primary/5 border-primary" : "bg-white border-slate-100"}`}><div className={`w-10 h-10 rounded-xl flex items-center justify-center ${data[o.key as keyof typeof data] ? "bg-primary text-white" : "bg-slate-100 text-slate-400"}`}><o.icon size={20} /></div><span className="font-bold flex-1 text-left text-slate-900">{o.label}</span><div className={`w-5 h-5 rounded-full border-2 ${data[o.key as keyof typeof data] ? "bg-primary border-primary" : "border-slate-200"}`}>{data[o.key as keyof typeof data] && <CheckCircle2 size={12} className="text-white m-0.5" />}</div></button>))}
            </div>
        </motion.div>
    );
}

function SalesStep({ data, onChange, hasDelivery }: { data: WizardState["salesConfig"]; onChange: (d: WizardState["salesConfig"]) => void; hasDelivery: boolean }) {
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 pb-20">
            <div className="text-center mb-6"><h2 className="text-xl font-black text-slate-900">Ventas y Delivery</h2><p className="text-sm text-slate-500">Configura opciones de venta</p></div>
            <div className="bg-white rounded-xl border divide-y">
                <div className="p-4 flex items-center justify-between"><div><span className="font-bold text-slate-900">Pedido Mínimo</span><p className="text-xs text-slate-400">Importe mínimo para pedir</p></div><div className="flex items-center gap-1"><span className="text-slate-400">€</span><input type="number" value={data.minimumOrder} onChange={e => onChange({ ...data, minimumOrder: e.target.value })} className="w-16 px-2 py-1 border rounded text-sm font-bold text-right" /></div></div>
                <div className="p-4 flex items-center justify-between"><div><span className="font-bold text-slate-900">Tiempo Preparación</span><p className="text-xs text-slate-400">Tiempo estimado</p></div><div className="flex items-center gap-1"><input type="number" value={data.prepTime} onChange={e => onChange({ ...data, prepTime: e.target.value })} className="w-16 px-2 py-1 border rounded text-sm font-bold text-right" /><span className="text-xs text-slate-400">min</span></div></div>
                {hasDelivery && (<><div className="p-4 flex items-center justify-between"><div><span className="font-bold text-slate-900">Costo de Envío</span></div><div className="flex items-center gap-1"><span className="text-slate-400">€</span><input type="number" value={data.deliveryFee} onChange={e => onChange({ ...data, deliveryFee: e.target.value })} className="w-16 px-2 py-1 border rounded text-sm font-bold text-right" /></div></div><div className="p-4 flex items-center justify-between"><div><span className="font-bold text-slate-900">Radio de Entrega</span></div><div className="flex items-center gap-1"><input type="number" value={data.deliveryRadius} onChange={e => onChange({ ...data, deliveryRadius: e.target.value })} className="w-16 px-2 py-1 border rounded text-sm font-bold text-right" /><span className="text-xs text-slate-400">km</span></div></div></>)}
                <div className="p-4"><div className="flex items-center justify-between mb-3"><span className="font-bold text-slate-900">Propinas</span><button onClick={() => onChange({ ...data, acceptTips: !data.acceptTips })} className={`w-10 h-6 rounded-full ${data.acceptTips ? "bg-primary" : "bg-slate-200"}`}><div className={`w-4 h-4 bg-white rounded-full shadow ${data.acceptTips ? "translate-x-5" : "translate-x-1"}`} /></button></div>{data.acceptTips && <div className="flex gap-2">{[5, 10, 15, 20].map(p => (<button key={p} onClick={() => onChange({ ...data, tipPercentages: data.tipPercentages.includes(p) ? data.tipPercentages.filter(x => x !== p) : [...data.tipPercentages, p].sort((a, b) => a - b) })} className={`px-3 py-1 rounded-lg text-sm font-bold ${data.tipPercentages.includes(p) ? "bg-primary text-white" : "bg-slate-100 text-slate-500"}`}>{p}%</button>))}</div>}</div>
            </div>
        </motion.div>
    );
}

function ReviewStep({ state }: { state: WizardState }) {
    const totalProducts = state.categories.reduce((a, c) => a + c.products.filter(p => p.name).length, 0);
    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6 pb-20">
            <div className="text-center mb-6"><div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle2 size={28} className="text-emerald-600" /></div><h2 className="text-xl font-black text-slate-900">¡Todo listo!</h2><p className="text-sm text-slate-500">Revisa y publica tu restaurante</p></div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-white p-4 rounded-xl border text-center"><p className="text-2xl font-black text-primary">{state.categories.length}</p><p className="text-xs text-slate-400">Categorías</p></div>
                <div className="bg-white p-4 rounded-xl border text-center"><p className="text-2xl font-black text-primary">{totalProducts}</p><p className="text-xs text-slate-400">Productos</p></div>
                <div className="bg-white p-4 rounded-xl border text-center"><p className="text-2xl font-black text-primary">{state.zones.filter(z => z.enabled).length}</p><p className="text-xs text-slate-400">Zonas</p></div>
                <div className="bg-white p-4 rounded-xl border text-center"><p className="text-2xl font-black text-primary">{state.menuTypes.filter(t => t.enabled).length}</p><p className="text-xs text-slate-400">Menús</p></div>
            </div>
            <div className="bg-white rounded-xl border p-4 space-y-3">
                <div className="flex flex-wrap gap-2">{state.serviceModes.dineIn && <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-bold">En sala</span>}{state.serviceModes.takeaway && <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold">Para llevar</span>}{state.serviceModes.delivery && <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-bold">Delivery</span>}{state.serviceModes.beachService && <span className="px-2 py-1 bg-cyan-100 text-cyan-700 rounded text-xs font-bold">Playa</span>}</div>
                <div className="flex flex-wrap gap-2">{state.payment.acceptCash && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-bold">Efectivo</span>}{state.payment.acceptCard && <span className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs font-bold">Tarjeta</span>}{state.payment.allowSplitBill && <span className="px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs font-bold">Dividir cuenta</span>}</div>
                {state.orderingConfig.sharedCart && <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs font-bold">Carrito compartido</span>}
            </div>
        </motion.div>
    );
}

function ImportModal({ onClose, onImport }: { onClose: () => void; onImport: (c: WizardCategory[]) => void }) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const process = async () => {
        if (!file) return;
        setLoading(true);
        await new Promise(r => setTimeout(r, 2000));
        onImport([{ id: crypto.randomUUID(), name: "Entrantes", icon: "🥗", products: [{ id: crypto.randomUUID(), name: "Ensalada", price: "8", description: "" }] }, { id: crypto.randomUUID(), name: "Principales", icon: "🍽️", products: [{ id: crypto.randomUUID(), name: "Entrecot", price: "18", description: "" }] }]);
    };
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-white rounded-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between mb-4"><h2 className="font-black text-slate-900">Importar Menú</h2><button onClick={onClose}><X size={20} className="text-slate-400" /></button></div>
                <label className="block p-8 border-2 border-dashed rounded-xl text-center cursor-pointer hover:border-primary"><input type="file" accept="image/*,.pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="hidden" /><Upload size={24} className="mx-auto text-slate-400 mb-2" /><p className="text-sm text-slate-500">{file ? file.name : "Sube foto o PDF"}</p></label>
                {file && <button onClick={process} disabled={loading} className="w-full mt-4 py-2 bg-primary text-white rounded-xl font-bold disabled:opacity-50">{loading ? "Procesando..." : "Extraer Menú"}</button>}
            </div>
        </div>
    );
}
