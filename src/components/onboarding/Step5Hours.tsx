"use client";

import { Clock, Copy, X } from "lucide-react";

interface Props {
    data: any;
    onUpdate: (data: any) => void;
}

const daysOfWeek = [
    { key: "monday", label: "Lunes", short: "L" },
    { key: "tuesday", label: "Martes", short: "M" },
    { key: "wednesday", label: "Miércoles", short: "X" },
    { key: "thursday", label: "Jueves", short: "J" },
    { key: "friday", label: "Viernes", short: "V" },
    { key: "saturday", label: "Sábado", short: "S" },
    { key: "sunday", label: "Domingo", short: "D" },
];

const defaultHours = {
    monday: { open: "09:00", close: "23:00", closed: false },
    tuesday: { open: "09:00", close: "23:00", closed: false },
    wednesday: { open: "09:00", close: "23:00", closed: false },
    thursday: { open: "09:00", close: "23:00", closed: false },
    friday: { open: "09:00", close: "23:00", closed: false },
    saturday: { open: "09:00", close: "23:00", closed: false },
    sunday: { open: "09:00", close: "23:00", closed: true },
};

export function Step5Hours({ data, onUpdate }: Props) {
    const hours = data.opening_hours || defaultHours;

    const updateHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
        const newHours = {
            ...hours,
            [day]: {
                ...hours[day],
                [field]: value,
            },
        };
        onUpdate({ opening_hours: newHours });
    };

    const copyToAll = (sourceDay: string) => {
        const source = hours[sourceDay];
        const newHours: typeof hours = {};

        daysOfWeek.forEach(day => {
            newHours[day.key] = { ...source };
        });

        onUpdate({ opening_hours: newHours });
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-slate-500 text-center mb-2">
                Configura los horarios de apertura
            </p>
            <p className="text-xs text-slate-400 text-center mb-6">
                Puedes saltar este paso (se usará 09:00-23:00 por defecto)
            </p>

            <div className="space-y-3">
                {daysOfWeek.map((day) => {
                    const dayHours = hours[day.key] || { open: "09:00", close: "23:00", closed: false };

                    return (
                        <div
                            key={day.key}
                            className={`p-4 rounded-2xl border transition-all ${dayHours.closed
                                ? "bg-slate-50 border-slate-100"
                                : "bg-white border-slate-200"
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Day name */}
                                <div className="w-24 flex-shrink-0">
                                    <span className={`font-bold ${dayHours.closed ? "text-slate-400" : "text-slate-900"}`}>
                                        {day.label}
                                    </span>
                                </div>

                                {/* Hours or Closed */}
                                {dayHours.closed ? (
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
                                            value={dayHours.open}
                                            onChange={(e) => updateHours(day.key, 'open', e.target.value)}
                                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 font-bold text-slate-900 text-sm"
                                        />
                                        <span className="text-slate-400">a</span>
                                        <input
                                            type="time"
                                            value={dayHours.close}
                                            onChange={(e) => updateHours(day.key, 'close', e.target.value)}
                                            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 font-bold text-slate-900 text-sm"
                                        />
                                    </div>
                                )}

                                {/* Toggle Closed */}
                                <button
                                    type="button"
                                    onClick={() => updateHours(day.key, 'closed', !dayHours.closed)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${dayHours.closed
                                        ? "bg-slate-200 text-slate-600"
                                        : "bg-red-50 text-red-500 hover:bg-red-100"
                                        }`}
                                >
                                    {dayHours.closed ? "Abrir" : "Cerrar"}
                                </button>

                                {/* Copy to all */}
                                {!dayHours.closed && (
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
