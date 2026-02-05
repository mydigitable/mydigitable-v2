"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Map,
    Plus,
    Save,
    Loader2,
    Square,
    Circle,
    Move,
    ZoomIn,
    ZoomOut,
    RotateCcw,
} from "lucide-react";

interface Table {
    id: string;
    table_number: number;
    name: string | null;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved';
    zone: string | null;
    position_x: number;
    position_y: number;
}

const statusColors = {
    available: 'bg-green-500',
    occupied: 'bg-red-500',
    reserved: 'bg-amber-500',
};

export default function TablesMapPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedTable, setSelectedTable] = useState<string | null>(null);
    const [zoom, setZoom] = useState(1);

    const supabase = createClient();

    useEffect(() => {
        loadTables();
    }, []);

    const loadTables = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: restaurant } = await supabase
            .from("restaurants")
            .select("id")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: true }); const restaurantData = restaurants?.[0] || null;

        if (restaurant) {
            const { data } = await supabase
                .from("tables")
                .select("*")
                .eq("restaurant_id", restaurant.id)
                .order("table_number");

            if (data) setTables(data);
        }
        setLoading(false);
    };

    const handleDrag = (tableId: string, x: number, y: number) => {
        setTables(tables.map(t =>
            t.id === tableId ? { ...t, position_x: x, position_y: y } : t
        ));
    };

    const savePositions = async () => {
        setSaving(true);
        for (const table of tables) {
            await supabase
                .from("tables")
                .update({ position_x: table.position_x, position_y: table.position_y })
                .eq("id", table.id);
        }
        setSaving(false);
    };

    return (
        <div className="p-6 lg:p-8 h-[calc(100vh-4rem)]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mapa de Mesas</h1>
                    <p className="text-slate-500 mt-1">Arrastra las mesas para organizar el layout de tu local</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                        <button
                            onClick={() => setZoom(z => Math.max(0.5, z - 0.1))}
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                            <ZoomOut size={18} />
                        </button>
                        <span className="px-2 text-sm font-bold">{Math.round(zoom * 100)}%</span>
                        <button
                            onClick={() => setZoom(z => Math.min(2, z + 0.1))}
                            className="p-2 hover:bg-white rounded-lg transition-colors"
                        >
                            <ZoomIn size={18} />
                        </button>
                    </div>
                    <button
                        onClick={() => setZoom(1)}
                        className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors"
                    >
                        <RotateCcw size={18} />
                    </button>
                    <button
                        onClick={savePositions}
                        disabled={saving}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                        {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                        Guardar
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm text-slate-600">Disponible</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm text-slate-600">Ocupada</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span className="text-sm text-slate-600">Reservada</span>
                </div>
            </div>

            {/* Map Area */}
            {loading ? (
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : tables.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-96 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl">
                    <Map className="w-16 h-16 text-slate-300 mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Sin mesas configuradas</h3>
                    <p className="text-slate-500 mb-6">Primero crea mesas en la lista de mesas</p>
                </div>
            ) : (
                <div
                    className="relative bg-slate-100 border border-slate-200 rounded-2xl overflow-hidden"
                    style={{ height: 'calc(100% - 150px)', minHeight: '400px' }}
                >
                    <div
                        className="absolute inset-0 p-8"
                        style={{
                            transform: `scale(${zoom})`,
                            transformOrigin: 'top left',
                        }}
                    >
                        {/* Grid pattern */}
                        <div
                            className="absolute inset-0 opacity-20"
                            style={{
                                backgroundImage: 'radial-gradient(circle, #94a3b8 1px, transparent 1px)',
                                backgroundSize: '20px 20px',
                            }}
                        />

                        {/* Tables */}
                        {tables.map((table) => (
                            <motion.div
                                key={table.id}
                                drag
                                dragMomentum={false}
                                onDragEnd={(e, info) => {
                                    handleDrag(
                                        table.id,
                                        table.position_x + info.offset.x,
                                        table.position_y + info.offset.y
                                    );
                                }}
                                onClick={() => setSelectedTable(table.id)}
                                className={`absolute cursor-move select-none ${selectedTable === table.id ? 'ring-4 ring-primary/50' : ''
                                    }`}
                                style={{
                                    left: table.position_x,
                                    top: table.position_y,
                                }}
                            >
                                <div
                                    className={`w-20 h-20 rounded-xl flex flex-col items-center justify-center text-white font-bold shadow-lg ${statusColors[table.status]
                                        }`}
                                >
                                    <span className="text-lg">{table.table_number}</span>
                                    <span className="text-[10px] opacity-80">{table.capacity} pax</span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

