"use client";

import { useState } from "react";
import { QrCode, Plus, Table2, Trash2, MapPin } from "lucide-react";
import { OnboardingFormData } from "../page";

interface Props {
    data: OnboardingFormData;
    onUpdate: (data: Partial<OnboardingFormData>) => void;
}

interface TableZone {
    id: string;
    name: string;
    tables: { id: string; number: string }[];
}

export function Step7Tables({ data, onUpdate }: Props) {
    const [zones, setZones] = useState<TableZone[]>(
        data.initial_zones || [
            { id: "1", name: "Interior", tables: [] },
        ]
    );
    const [newZoneName, setNewZoneName] = useState("");

    const addZone = () => {
        if (!newZoneName.trim()) return;
        const newZone: TableZone = {
            id: Date.now().toString(),
            name: newZoneName,
            tables: [],
        };
        const updated = [...zones, newZone];
        setZones(updated);
        onUpdate({ initial_zones: updated });
        setNewZoneName("");
    };

    const addTable = (zoneId: string) => {
        const updated = zones.map(zone => {
            if (zone.id === zoneId) {
                const nextNumber = (zone.tables.length + 1).toString();
                return {
                    ...zone,
                    tables: [...zone.tables, { id: Date.now().toString(), number: nextNumber }],
                };
            }
            return zone;
        });
        setZones(updated);
        onUpdate({ initial_zones: updated });
    };

    const removeTable = (zoneId: string, tableId: string) => {
        const updated = zones.map(zone => {
            if (zone.id === zoneId) {
                return {
                    ...zone,
                    tables: zone.tables.filter(t => t.id !== tableId),
                };
            }
            return zone;
        });
        setZones(updated);
        onUpdate({ initial_zones: updated });
    };

    const totalTables = zones.reduce((acc, zone) => acc + zone.tables.length, 0);

    return (
        <div className="space-y-6">
            <p className="text-sm text-slate-500 text-center">
                Configura tus zonas y mesas. Cada mesa tendrá su propio QR.
            </p>

            {/* Resumen */}
            <div className="flex justify-center gap-6 py-4">
                <div className="text-center">
                    <div className="text-3xl font-black text-primary">{zones.length}</div>
                    <div className="text-xs text-slate-400">zonas</div>
                </div>
                <div className="text-center">
                    <div className="text-3xl font-black text-slate-900">{totalTables}</div>
                    <div className="text-xs text-slate-400">mesas</div>
                </div>
            </div>

            {/* Zonas */}
            <div className="space-y-4">
                {zones.map((zone) => (
                    <div
                        key={zone.id}
                        className="p-4 bg-slate-50 rounded-2xl border border-slate-100"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <MapPin size={16} className="text-primary" />
                                <span className="font-bold text-slate-900">{zone.name}</span>
                            </div>
                            <button
                                onClick={() => addTable(zone.id)}
                                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-primary transition-all"
                            >
                                <Plus size={14} />
                                Mesa
                            </button>
                        </div>

                        {zone.tables.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {zone.tables.map((table) => (
                                    <div
                                        key={table.id}
                                        className="group flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-slate-200"
                                    >
                                        <Table2 size={14} className="text-slate-400" />
                                        <span className="font-bold text-sm">Mesa {table.number}</span>
                                        <button
                                            onClick={() => removeTable(zone.id, table.id)}
                                            className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-slate-400 text-center py-2">
                                Sin mesas aún
                            </p>
                        )}
                    </div>
                ))}
            </div>

            {/* Agregar zona */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={newZoneName}
                    onChange={(e) => setNewZoneName(e.target.value)}
                    placeholder="Nueva zona (ej: Terraza, VIP...)"
                    className="flex-1 h-12 px-4 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-medium"
                    onKeyDown={(e) => e.key === "Enter" && addZone()}
                />
                <button
                    onClick={addZone}
                    disabled={!newZoneName.trim()}
                    className="h-12 px-4 bg-primary text-white rounded-xl font-bold disabled:opacity-50 transition-all"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Info QR */}
            <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/20">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <QrCode size={24} className="text-primary" />
                </div>
                <div>
                    <p className="font-bold text-slate-900 text-sm">QR automáticos</p>
                    <p className="text-xs text-slate-500">
                        Podrás generar e imprimir QR desde el dashboard
                    </p>
                </div>
            </div>
        </div>
    );
}
