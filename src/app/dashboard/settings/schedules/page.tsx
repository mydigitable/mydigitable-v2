"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Clock,
    Save,
    Loader2,
    Plus,
    Trash2,
    Copy,
} from "lucide-react";

const daysOfWeek = [
    { id: 0, name: 'Domingo', short: 'Dom' },
    { id: 1, name: 'Lunes', short: 'Lun' },
    { id: 2, name: 'Martes', short: 'Mar' },
    { id: 3, name: 'Miércoles', short: 'Mié' },
    { id: 4, name: 'Jueves', short: 'Jue' },
    { id: 5, name: 'Viernes', short: 'Vie' },
    { id: 6, name: 'Sábado', short: 'Sáb' },
];

interface DaySchedule {
    isOpen: boolean;
    shifts: { open: string; close: string }[];
}

export default function SchedulesSettingsPage() {
    const [restaurant, setRestaurant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [schedules, setSchedules] = useState<Record<number, DaySchedule>>({});

    const supabase = createClient();

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: restaurants } = await supabase
            .from("restaurants")
            .select("*")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: true }); const restaurantData = restaurants?.[0] || null;

        if (restaurantData) {
            setRestaurant(restaurantData);
            // Initialize default schedules
            const defaultSchedules: Record<number, DaySchedule> = {};
            daysOfWeek.forEach(day => {
                defaultSchedules[day.id] = {
                    isOpen: day.id >= 1 && day.id <= 6, // Closed Sunday by default
                    shifts: [{ open: '12:00', close: '16:00' }, { open: '20:00', close: '00:00' }],
                };
            });
            setSchedules(restaurantData.opening_hours || defaultSchedules);
        }
        setLoading(false);
    };

    const toggleDay = (dayId: number) => {
        setSchedules(prev => ({
            ...prev,
            [dayId]: { ...prev[dayId], isOpen: !prev[dayId]?.isOpen },
        }));
    };

    const updateShift = (dayId: number, shiftIndex: number, field: 'open' | 'close', value: string) => {
        setSchedules(prev => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                shifts: prev[dayId].shifts.map((shift, i) =>
                    i === shiftIndex ? { ...shift, [field]: value } : shift
                ),
            },
        }));
    };

    const addShift = (dayId: number) => {
        setSchedules(prev => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                shifts: [...prev[dayId].shifts, { open: '12:00', close: '16:00' }],
            },
        }));
    };

    const removeShift = (dayId: number, shiftIndex: number) => {
        setSchedules(prev => ({
            ...prev,
            [dayId]: {
                ...prev[dayId],
                shifts: prev[dayId].shifts.filter((_, i) => i !== shiftIndex),
            },
        }));
    };

    const copyToAll = (dayId: number) => {
        const sourceSchedule = schedules[dayId];
        setSchedules(prev => {
            const updated = { ...prev };
            daysOfWeek.forEach(day => {
                if (day.id !== dayId) {
                    updated[day.id] = { ...sourceSchedule };
                }
            });
            return updated;
        });
    };

    const saveSettings = async () => {
        if (!restaurant) return;
        setSaving(true);

        await supabase
            .from("restaurants")
            .update({ opening_hours: schedules })
            .eq("id", restaurant.id);

        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 max-w-4xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Horarios de Apertura</h1>
                    <p className="text-slate-500 mt-1">Configura los horarios de tu restaurante</p>
                </div>
                <button
                    onClick={saveSettings}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Guardar
                </button>
            </div>

            {/* Schedules */}
            <div className="space-y-4">
                {daysOfWeek.map((day) => (
                    <motion.div
                        key={day.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: day.id * 0.05 }}
                        className="bg-white border border-slate-200 rounded-2xl p-6"
                    >
                        <div className="flex items-start gap-4">
                            {/* Day Toggle */}
                            <button
                                onClick={() => toggleDay(day.id)}
                                className={`w-24 py-2 rounded-xl font-bold text-sm transition-colors flex-shrink-0 ${schedules[day.id]?.isOpen
                                        ? 'bg-primary text-white'
                                        : 'bg-slate-100 text-slate-400'
                                    }`}
                            >
                                {day.name}
                            </button>

                            {/* Shifts */}
                            {schedules[day.id]?.isOpen ? (
                                <div className="flex-1 space-y-3">
                                    {schedules[day.id]?.shifts.map((shift, index) => (
                                        <div key={index} className="flex items-center gap-3">
                                            <input
                                                type="time"
                                                value={shift.open}
                                                onChange={(e) => updateShift(day.id, index, 'open', e.target.value)}
                                                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                            <span className="text-slate-400">a</span>
                                            <input
                                                type="time"
                                                value={shift.close}
                                                onChange={(e) => updateShift(day.id, index, 'close', e.target.value)}
                                                className="px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                            />
                                            {schedules[day.id].shifts.length > 1 && (
                                                <button
                                                    onClick={() => removeShift(day.id, index)}
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={16} className="text-red-500" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => addShift(day.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 text-primary hover:bg-primary/10 rounded-lg font-bold text-sm transition-colors"
                                        >
                                            <Plus size={14} />
                                            Añadir turno
                                        </button>
                                        <button
                                            onClick={() => copyToAll(day.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 text-slate-500 hover:bg-slate-100 rounded-lg font-bold text-sm transition-colors"
                                        >
                                            <Copy size={14} />
                                            Copiar a todos
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex-1 py-2 text-slate-400 italic">
                                    Cerrado
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}

