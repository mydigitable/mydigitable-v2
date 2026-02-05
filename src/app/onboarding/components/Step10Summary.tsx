"use client";

import { Check, ExternalLink, Settings, QrCode, UtensilsCrossed, Store } from "lucide-react";
import { OnboardingFormData } from "../page";

interface Props {
    data: OnboardingFormData;
    onUpdate: (data: Partial<OnboardingFormData>) => void;
}

export function Step10Summary({ data, onUpdate }: Props) {
    const completedItems = [
        { label: "Nombre del negocio", value: data.name, done: !!data.name },
        { label: "Tipo de negocio", value: data.business_type || "No configurado", done: !!data.business_type },
        { label: "Contacto", value: data.email || data.phone || "No configurado", done: !!(data.email || data.phone) },
        { label: "Ubicación", value: data.city || data.address || "No configurado", done: !!(data.city || data.address) },
        { label: "Horarios", value: "Configurado", done: true },
        { label: "Métodos de pago", value: getPaymentMethods(data.payment_settings), done: true },
        { label: "Mesas", value: getMesasCount(data.initial_zones), done: !!(data.initial_zones && data.initial_zones.length > 0) },
        { label: "Menú", value: data.first_category || "No configurado", done: !!data.first_category },
        { label: "Apariencia", value: data.theme || "light", done: true },
    ];

    const completedCount = completedItems.filter(i => i.done).length;

    return (
        <div className="space-y-8">
            {/* Celebración */}
            <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-emerald-600 rounded-3xl text-white mb-4">
                    <Store size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">
                    ¡{data.name || "Tu negocio"} está listo! 🎉
                </h3>
                <p className="text-slate-500">
                    Has completado {completedCount} de {completedItems.length} configuraciones
                </p>
            </div>

            {/* Resumen de configuración */}
            <div className="space-y-2">
                {completedItems.map((item, idx) => (
                    <div
                        key={idx}
                        className={`flex items-center justify-between p-3 rounded-xl ${item.done ? "bg-green-50" : "bg-slate-50"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${item.done ? "bg-green-500 text-white" : "bg-slate-200 text-slate-400"
                                }`}>
                                {item.done ? <Check size={14} /> : <span className="text-xs">{idx + 1}</span>}
                            </div>
                            <span className={`font-medium ${item.done ? "text-slate-900" : "text-slate-400"}`}>
                                {item.label}
                            </span>
                        </div>
                        <span className={`text-sm ${item.done ? "text-slate-600" : "text-slate-400"}`}>
                            {item.value}
                        </span>
                    </div>
                ))}
            </div>

            {/* Próximos pasos */}
            <div className="border-t border-slate-100 pt-6">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                    Próximos pasos sugeridos
                </h4>
                <div className="grid gap-3">
                    <NextStepCard
                        icon={UtensilsCrossed}
                        title="Completa tu menú"
                        description="Agrega todas las categorías y productos"
                        href="/dashboard/menu"
                    />
                    <NextStepCard
                        icon={QrCode}
                        title="Genera tus códigos QR"
                        description="Descarga los QR para imprimir"
                        href="/dashboard/qr"
                    />
                    <NextStepCard
                        icon={Settings}
                        title="Configuración avanzada"
                        description="Delivery, staff, integraciones..."
                        href="/dashboard/settings"
                    />
                </div>
            </div>
        </div>
    );
}

function NextStepCard({ icon: Icon, title, description, href }: {
    icon: any;
    title: string;
    description: string;
    href: string;
}) {
    return (
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all cursor-pointer">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                    <Icon size={18} className="text-slate-600" />
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-sm">{title}</p>
                    <p className="text-xs text-slate-500">{description}</p>
                </div>
            </div>
            <ExternalLink size={16} className="text-slate-400" />
        </div>
    );
}

function getPaymentMethods(settings: OnboardingFormData["payment_settings"]) {
    if (!settings) return "Efectivo, Tarjeta";
    const methods = [];
    if (settings.accepts_cash) methods.push("Efectivo");
    if (settings.accepts_card) methods.push("Tarjeta");
    if (settings.accepts_bizum) methods.push("Bizum");
    return methods.length > 0 ? methods.join(", ") : "No configurado";
}

function getMesasCount(zones: any[] | undefined) {
    if (!zones || zones.length === 0) return "No configuradas";
    const total = zones.reduce((acc, z) => acc + (z.tables?.length || 0), 0);
    return `${total} mesas en ${zones.length} zonas`;
}
