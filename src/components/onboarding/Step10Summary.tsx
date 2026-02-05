"use client";

import { Check, Edit2, Store, Phone, MapPin, Settings2, Clock, CreditCard, Table2, UtensilsCrossed, Palette } from "lucide-react";

interface Props {
    data: any;
    onUpdate: (data: any) => void;
    onEditStep: (step: number) => void;
}

interface SummaryRowProps {
    icon: React.ElementType;
    label: string;
    value: string;
    step: number;
    onEdit: (step: number) => void;
    status: 'complete' | 'incomplete' | 'skipped';
}

function SummaryRow({ icon: Icon, label, value, step, onEdit, status }: SummaryRowProps) {
    return (
        <div className={`flex items-center justify-between p-4 rounded-xl ${status === 'complete' ? 'bg-green-50' :
                status === 'skipped' ? 'bg-slate-50' : 'bg-amber-50'
            }`}>
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${status === 'complete' ? 'bg-green-500 text-white' :
                        status === 'skipped' ? 'bg-slate-300 text-white' :
                            'bg-amber-500 text-white'
                    }`}>
                    {status === 'complete' ? <Check size={16} /> : <Icon size={16} />}
                </div>
                <div>
                    <span className="font-bold text-slate-900 text-sm">{label}</span>
                    <p className="text-xs text-slate-500 max-w-[200px] truncate">{value}</p>
                </div>
            </div>
            <button
                type="button"
                onClick={() => onEdit(step)}
                className="p-2 text-slate-400 hover:text-primary hover:bg-white rounded-lg transition-all"
                title="Editar"
            >
                <Edit2 size={16} />
            </button>
        </div>
    );
}

export function Step10Summary({ data, onUpdate, onEditStep }: Props) {
    const confirmed = data.confirmed || false;

    // Calculate status for each section
    const sections = [
        {
            icon: Store,
            label: "Tu negocio",
            value: data.name || "Sin nombre",
            step: 1,
            status: data.name ? 'complete' : 'incomplete' as const
        },
        {
            icon: Phone,
            label: "Contacto",
            value: data.email && data.phone ? `${data.email}, ${data.phone}` : "Incompleto",
            step: 2,
            status: data.email && data.phone ? 'complete' : 'incomplete' as const
        },
        {
            icon: MapPin,
            label: "Ubicación",
            value: data.address || "Sin dirección",
            step: 3,
            status: data.address ? 'complete' : 'incomplete' as const
        },
        {
            icon: Settings2,
            label: "Modos",
            value: getModesSummary(data),
            step: 4,
            status: hasAtLeastOneMode(data) ? 'complete' : 'incomplete' as const
        },
        {
            icon: Clock,
            label: "Horarios",
            value: data.opening_hours ? "Configurados" : "Por defecto",
            step: 5,
            status: 'complete' as const
        },
        {
            icon: CreditCard,
            label: "Pagos",
            value: getPaymentsSummary(data),
            step: 6,
            status: hasAtLeastOnePayment(data) ? 'complete' : 'incomplete' as const
        },
        {
            icon: Table2,
            label: "Mesas",
            value: data.table_count > 0 ? `${data.table_count} mesas` : "Lo haré después",
            step: 7,
            status: data.table_count > 0 ? 'complete' : 'skipped' as const
        },
        {
            icon: UtensilsCrossed,
            label: "Menú",
            value: getMenuSummary(data),
            step: 8,
            status: data.menu_option ? 'complete' : 'skipped' as const
        },
        {
            icon: Palette,
            label: "Apariencia",
            value: `${data.theme_id || 'Classic'}, ${data.primary_color || '#22C55E'}`,
            step: 9,
            status: 'complete' as const
        },
    ];

    const hasIncomplete = sections.some(s => s.status === 'incomplete');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="text-center pb-4 border-b border-slate-100">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl text-white mb-4">
                    <Store size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900">
                    Resumen de {data.name || "tu negocio"}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                    Revisa que todo esté correcto antes de continuar
                </p>
            </div>

            {/* Summary rows */}
            <div className="space-y-2">
                {sections.map((section) => (
                    <SummaryRow
                        key={section.step}
                        {...section}
                        onEdit={onEditStep}
                    />
                ))}
            </div>

            {/* Warning if incomplete */}
            {hasIncomplete && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm text-amber-700 font-medium text-center">
                        ⚠️ Hay secciones incompletas. Puedes continuar y completarlas después.
                    </p>
                </div>
            )}

            {/* Confirmation checkbox */}
            <div className="mt-6 pt-6 border-t border-slate-100">
                <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="pt-0.5">
                        <input
                            type="checkbox"
                            checked={confirmed}
                            onChange={(e) => onUpdate({ confirmed: e.target.checked })}
                            className="sr-only"
                        />
                        <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${confirmed
                                ? "bg-primary border-primary"
                                : "border-slate-300 group-hover:border-primary"
                            }`}>
                            {confirmed && <Check size={14} className="text-white" />}
                        </div>
                    </div>
                    <div>
                        <span className="font-bold text-slate-900">
                            Confirmo que los datos son correctos
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5">
                            Puedes cambiarlos después desde Configuración
                        </p>
                    </div>
                </label>
            </div>
        </div>
    );
}

// Helper functions
function getModesSummary(data: any): string {
    const modes = [];
    if (data.mode_dine_in) modes.push("Dine-In");
    if (data.accepts_takeaway) modes.push("Takeaway");
    if (data.accepts_delivery) modes.push("Delivery");
    if (data.mode_beach) modes.push("Beach");
    if (data.mode_events) modes.push("Eventos");
    return modes.length > 0 ? modes.join(", ") : "Sin modos";
}

function hasAtLeastOneMode(data: any): boolean {
    return data.mode_dine_in || data.accepts_takeaway || data.accepts_delivery || data.mode_beach || data.mode_events;
}

function getPaymentsSummary(data: any): string {
    const settings = data.payment_settings || {};
    const methods = [];
    if (settings.accepts_cash) methods.push("Efectivo");
    if (settings.accepts_card) methods.push("Tarjeta");
    return methods.length > 0 ? methods.join(", ") : "Sin métodos";
}

function hasAtLeastOnePayment(data: any): boolean {
    const settings = data.payment_settings || {};
    return settings.accepts_cash || settings.accepts_card;
}

function getMenuSummary(data: any): string {
    switch (data.menu_option) {
        case "empty": return "Menú vacío";
        case "demo": return "Menú demo";
        case "later": return "Lo haré después";
        default: return "Menú vacío";
    }
}
