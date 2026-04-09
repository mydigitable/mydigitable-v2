"use client";

import { Clock, Copy, X } from "lucide-react";

interface Props {
    formData: any;
    updateFormData: (data: any) => void;
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

export function Step5Hours({ formData, updateFormData }: Props) {
    const hours = formData.working_hours || defaultHours;

    const updateHours = (day: string, field: 'open' | 'close' | 'closed', value: string | boolean) => {
        const newHours = {
            ...hours,
            [day]: {
                ...hours[day],
                [field]: value,
            },
        };
        updateFormData({ working_hours: newHours });
    };

    const copyToAll = (sourceDay: string) => {
        const source = hours[sourceDay];
        const newHours: typeof hours = {};

        daysOfWeek.forEach(day => {
            newHours[day.key] = { ...source };
        });

        updateFormData({ working_hours: newHours });
    };

    return (
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-3xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 mb-2">
                    Horarios
                </h2>
                <p className="text-slate-500">
                    ¿Cuándo está abierto tu negocio?
                </p>
            </div>

            <p className="text-sm text-slate-500 text-center mb-6">
                Configura los horarios de apertura para cada día de la semana
            </p>

            <div className="space-y-3">
                {daysOfWeek.map((day) => {
                    const dayHours = hours[day.key] || { open: "09:00", close: "23:00", closed: false };

                    return (
                        <div
                            key={day.key}
                            className={`p-4 rounded-2xl border-2 transition-all ${dayHours.closed
                                    ? "bg-slate-50 border-slate-200"
                                    : "bg-white border-slate-200 hover:border-primary"
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                {/* Day name */}
                                <div className="w-28 flex-shrink-0">
                                    <span className={`font-bold ${dayHours.closed ? "text-slate-400" : "text-slate-900"}`}>
                                        {day.label}
                                    </span>
                                </div>

                                {/* Hours or Closed */}
                                {dayHours.closed ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <span className="text-sm font-medium text-slate-400 flex items-center gap-2">
                                            <X size={16} />
                                            Cerrado
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex items-center gap-3">
                                        <Clock size={16} className="text-slate-400" />
                                        <input
                                            type="time"
                                            value={dayHours.open}
                                            onChange={(e) => updateHours(day.key, 'open', e.target.value)}
                                            className="px-4 py-2 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-primary focus:outline-none font-bold text-slate-900 text-sm transition-colors"
                                        />
                                        <span className="text-slate-400 font-medium">a</span>
                                        <input
                                            type="time"
                                            value={dayHours.close}
                                            onChange={(e) => updateHours(day.key, 'close', e.target.value)}
                                            className="px-4 py-2 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-primary focus:outline-none font-bold text-slate-900 text-sm transition-colors"
                                        />
                                    </div>
                                )}

                                {/* Toggle Closed */}
                                <button
                                    type="button"
                                    onClick={() => updateHours(day.key, 'closed', !dayHours.closed)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${dayHours.closed
                                            ? "bg-primary text-white hover:scale-105"
                                            : "bg-red-50 text-red-600 hover:bg-red-100"
                                        }`}
                                >
                                    {dayHours.closed ? "Abrir" : "Cerrar"}
                                </button>

                                {/* Copy to all */}
                                {!dayHours.closed && (
                                    <button
                                        type="button"
                                        onClick={() => copyToAll(day.key)}
                                        className="p-2 rounded-xl text-slate-400 hover:bg-primary hover:text-white transition-all"
                                        title="Copiar a todos los días"
                                    >
                                        <Copy size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Info adicional */}
            <div className="mt-8 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <p className="text-sm text-blue-700 font-medium text-center">
                    ⏰ Estos horarios aparecerán en tu menú digital para que los clientes sepan cuándo estás abierto
                </p>
            </div>
        </div>
    );
}
