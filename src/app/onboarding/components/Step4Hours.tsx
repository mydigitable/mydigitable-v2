"use client";

import { Clock, Copy, X } from "lucide-react";
import { OnboardingFormData } from "../page";

interface Props {
    data: OnboardingFormData;
    onUpdate: (data: Partial<OnboardingFormData>) => void;
}

const daysOfWeek = [
    { key: "monday", label: "Lunes" },
    { key: "tuesday", label: "Martes" },
    { key: "wednesday", label: "Miércoles" },
    { key: "thursday", label: "Jueves" },
    { key: "friday", label: "Viernes" },
    { key: "saturday", label: "Sábado" },
    { key: "sunday", label: "Domingo" },
];

export function Step4Hours({ data, onUpdate }: Props) {
    const updateHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
        const newHours = {
            ...data.opening_hours,
            [day]: {
                ...data.opening_hours[day],
                [field]: value,
            },
        };
        onUpdate({ opening_hours: newHours });
    };

    const copyToAll = (sourceDay: string) => {
        const source = data.opening_hours[sourceDay];
        const newHours: typeof data.opening_hours = {};

        daysOfWeek.forEach(day => {
            newHours[day.key] = { ...source };
        });

        onUpdate({ opening_hours: newHours });
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-500 text-center mb-6">
                Configura los horarios de apertura de tu negocio
            </p>

            <div className="space-y-3">
                {daysOfWeek.map((day) => {
                    const hours = data.opening_hours[day.key] || { open: "09:00", close: "23:00", closed: false };

                    return (
                        <div
                            key={day.key}
                            className={`p-4 rounded-2xl border transition-all ${hours.closed
                                    ? "bg-slate-50 border-slate-100"
                                    : "bg-white border-slate-200"
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Day name */}
                                <div className="w-24 flex-shrink-0">
                                    <span className={`font-bold ${hours.closed ? "text-slate-400" : "text-slate-900"}`}>
                                        {day.label}
                                    </span>
                                </div>

                                {/* Hours or Closed */}
                                {hours.closed ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <span className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                            <X size={14} />
                                            Cerrado
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center gap-2">
                                        <Clock size={14} className="text-slate-400" />
                                        <input
                                            type="time"
                                            value={hours.open}
                                            onChange={(e) => updateHours(day.key, 'open', e.target.value)}
                                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 font-bold text-slate-900 text-sm"
                                        />
                                        <span className="text-slate-400">a</span>
                                        <input
                                            type="time"
                                            value={hours.close}
                                            onChange={(e) => updateHours(day.key, 'close', e.target.value)}
                                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 font-bold text-slate-900 text-sm"
                                        />
                                    </div>
                                )}

                                {/* Toggle Closed */}
                                <button
                                    type="button"
                                    onClick={() => updateHours(day.key, 'closed', !hours.closed)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${hours.closed
                                            ? "bg-slate-200 text-slate-600"
                                            : "bg-red-50 text-red-500 hover:bg-red-100"
                                        }`}
                                >
                                    {hours.closed ? "Abrir" : "Cerrar"}
                                </button>

                                {/* Copy to all */}
                                {!hours.closed && (
                                    <button
                                        type="button"
                                        onClick={() => copyToAll(day.key)}
                                        className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-primary transition-all"
                                        title="Copiar a todos los días"
                                    >
                                        <Copy size={14} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
