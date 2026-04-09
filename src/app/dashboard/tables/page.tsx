"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
    Plus,
    Grid3X3,
    List,
    Map,
    QrCode,
    Edit3,
    Trash2,
    Users,
    Euro,
    Clock,
    X,
    Check,
    Loader2,
    Armchair,
    ExternalLink,
    Download,
    Eye,
    RefreshCw,
} from "lucide-react";

interface Table {
    id: string;
    restaurant_id: string;
    table_number: number;
    name: string | null;
    capacity: number;
    status: 'available' | 'occupied' | 'reserved';
    zone: string | null;
    qr_slug: string | null;
    position_x: number;
    position_y: number;
    current_order_total?: number;
    current_order_time?: number;
}

const statusConfig = {
    available: { label: 'Libre', color: 'bg-green-500', bgColor: 'bg-green-50', textColor: 'text-green-700' },
    occupied: { label: 'Ocupada', color: 'bg-red-500', bgColor: 'bg-red-50', textColor: 'text-red-700' },
    reserved: { label: 'Reservada', color: 'bg-blue-500', bgColor: 'bg-blue-50', textColor: 'text-blue-700' },
};

type ViewMode = 'grid' | 'list';

export default function TablesPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingTable, setEditingTable] = useState<Table | null>(null);
    const [saving, setSaving] = useState(false);
    const [restaurant, setRestaurant] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        loadTables();
    }, []);

    const loadTables = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: restaurants } = await supabase
                .from("restaurants")
                .select("*")
                .eq("owner_id", user.id)
                .order("created_at", { ascending: true });

            const restaurantData = restaurants?.[0] || null;
            if (!restaurantData) return;
            setRestaurant(restaurantData);

            const { data: tablesData } = await supabase
                .from("tables")
                .select("*")
                .eq("restaurant_id", restaurantData.id)
                .order("table_number");

            // For occupied tables, we'd fetch current order data
            // This is a simplified version
            setTables(tablesData || []);
        } catch (err) {
            console.error("Error loading tables:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTable = async (data: Partial<Table>) => {
        setSaving(true);
        try {
            if (editingTable) {
                await supabase
                    .from("tables")
                    .update({
                        table_number: data.table_number,
                        name: data.name,
                        capacity: data.capacity,
                        zone: data.zone,
                    })
                    .eq("id", editingTable.id);
            } else {
                const qrUrl = `${process.env.NEXT_PUBLIC_APP_URL}/r/${restaurant.slug}?table=${data.table_number}`;
                await supabase
                    .from("tables")
                    .insert({
                        restaurant_id: restaurant.id,
                        table_number: data.table_number,
                        name: data.name,
                        capacity: data.capacity || 4,
                        zone: data.zone,
                        qr_slug: qrUrl,
                        status: 'available',
                    });
            }

            await loadTables();
            setShowAddModal(false);
            setEditingTable(null);
        } catch (err) {
            console.error("Error saving table:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteTable = async (tableId: string) => {
        await supabase.from("tables").delete().eq("id", tableId);
        loadTables();
    };

    const changeTableStatus = async (tableId: string, newStatus: string) => {
        await supabase
            .from("tables")
            .update({ status: newStatus })
            .eq("id", tableId);
        loadTables();
    };

    // Stats
    const availableTables = tables.filter(t => t.status === 'available').length;
    const occupiedTables = tables.filter(t => t.status === 'occupied').length;
    const reservedTables = tables.filter(t => t.status === 'reserved').length;
    const totalCapacity = tables.reduce((sum, t) => sum + t.capacity, 0);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">Gestión de Mesas</h1>
                    <p className="text-sm text-slate-500">
                        {tables.length} mesas · Capacidad total: {totalCapacity} personas
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Toggle */}
                    <div className="flex bg-slate-100 rounded-xl p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-50'
                                }`}
                        >
                            <Grid3X3 size={18} className={viewMode === 'grid' ? 'text-primary' : 'text-slate-400'} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-50'
                                }`}
                        >
                            <List size={18} className={viewMode === 'list' ? 'text-primary' : 'text-slate-400'} />
                        </button>
                    </div>

                    <button
                        onClick={loadTables}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                    >
                        <RefreshCw size={18} />
                    </button>

                    <Link
                        href="/dashboard/qr"
                        className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-600 transition-colors"
                    >
                        <QrCode size={16} />
                        Ver QRs
                    </Link>

                    <button
                        onClick={() => {
                            setEditingTable(null);
                            setShowAddModal(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 rounded-xl text-sm font-bold text-white transition-colors shadow-lg shadow-primary/20"
                    >
                        <Plus size={16} />
                        Nueva Mesa
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <Armchair size={20} className="text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{availableTables}</p>
                            <p className="text-xs text-slate-500">Libres</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                            <Users size={20} className="text-red-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{occupiedTables}</p>
                            <p className="text-xs text-slate-500">Ocupadas</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Clock size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{reservedTables}</p>
                            <p className="text-xs text-slate-500">Reservadas</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-100 p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Users size={20} className="text-slate-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-slate-900">{totalCapacity}</p>
                            <p className="text-xs text-slate-500">Capacidad</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tables */}
            {tables.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Armchair size={28} className="text-slate-300" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Sin mesas configuradas</h2>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        Añade mesas para generar códigos QR únicos y gestionar pedidos por mesa.
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors"
                    >
                        <Plus size={18} />
                        Añadir Primera Mesa
                    </button>
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {tables.map((table) => (
                        <TableCard
                            key={table.id}
                            table={table}
                            onEdit={() => {
                                setEditingTable(table);
                                setShowAddModal(true);
                            }}
                            onStatusChange={changeTableStatus}
                            onDelete={() => handleDeleteTable(table.id)}
                        />
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Mesa</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Capacidad</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Zona</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {tables.map((table) => {
                                const status = statusConfig[table.status];
                                return (
                                    <tr key={table.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-slate-900">
                                                Mesa {table.table_number}
                                            </span>
                                            {table.name && (
                                                <span className="text-slate-400 ml-2">({table.name})</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${status.bgColor} ${status.textColor}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {table.capacity} personas
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">
                                            {table.zone || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingTable(table);
                                                        setShowAddModal(true);
                                                    }}
                                                    className="p-2 hover:bg-slate-100 rounded-lg"
                                                >
                                                    <Edit3 size={16} className="text-slate-400" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteTable(table.id)}
                                                    className="p-2 hover:bg-red-50 rounded-lg"
                                                >
                                                    <Trash2 size={16} className="text-red-400" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <TableModal
                        table={editingTable}
                        saving={saving}
                        existingNumbers={tables.map(t => t.table_number)}
                        onSave={handleSaveTable}
                        onClose={() => {
                            setShowAddModal(false);
                            setEditingTable(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Table Card Component
function TableCard({
    table,
    onEdit,
    onStatusChange,
    onDelete,
}: {
    table: Table;
    onEdit: () => void;
    onStatusChange: (tableId: string, status: string) => void;
    onDelete: () => void;
}) {
    const [showMenu, setShowMenu] = useState(false);
    const status = statusConfig[table.status];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`bg-white rounded-2xl border-2 overflow-hidden transition-colors ${table.status === 'occupied'
                ? 'border-red-200'
                : table.status === 'reserved'
                    ? 'border-blue-200'
                    : 'border-slate-100'
                }`}
        >
            <div className="p-4 text-center">
                <div className={`w-16 h-16 rounded-2xl ${status.bgColor} flex items-center justify-center mx-auto mb-3`}>
                    <span className={`text-2xl font-black ${status.textColor}`}>
                        {table.table_number}
                    </span>
                </div>
                <h3 className="font-bold text-slate-900">Mesa {table.table_number}</h3>
                {table.name && (
                    <p className="text-xs text-slate-400">{table.name}</p>
                )}
                <div className="flex items-center justify-center gap-1 mt-2 text-xs text-slate-500">
                    <Users size={12} />
                    <span>{table.capacity} pax</span>
                </div>

                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mt-3 ${status.bgColor} ${status.textColor}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${status.color}`} />
                    {status.label}
                </span>

                {/* Occupied Info */}
                {table.status === 'occupied' && table.current_order_total !== undefined && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-400">Total:</span>
                            <span className="font-bold text-slate-900">€{table.current_order_total.toFixed(2)}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="bg-slate-50 px-4 py-3 flex items-center justify-center gap-2">
                <button
                    onClick={onEdit}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    title="Editar"
                >
                    <Edit3 size={14} className="text-slate-400" />
                </button>
                <Link
                    href={`/dashboard/qr?table=${table.table_number}`}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                    title="Ver QR"
                >
                    <QrCode size={14} className="text-slate-400" />
                </Link>
                <button
                    onClick={onDelete}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                    title="Eliminar"
                >
                    <Trash2 size={14} className="text-red-400" />
                </button>
            </div>
        </motion.div>
    );
}

// Table Modal Component
function TableModal({
    table,
    saving,
    existingNumbers,
    onSave,
    onClose,
}: {
    table: Table | null;
    saving: boolean;
    existingNumbers: number[];
    onSave: (data: Partial<Table>) => void;
    onClose: () => void;
}) {
    const [tableNumber, setTableNumber] = useState(table?.table_number?.toString() || "");
    const [name, setName] = useState(table?.name || "");
    const [capacity, setCapacity] = useState(table?.capacity?.toString() || "4");
    const [zone, setZone] = useState(table?.zone || "");

    const isNumberTaken = !table && existingNumbers.includes(parseInt(tableNumber));

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-3xl w-full max-w-md overflow-hidden"
            >
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-black text-slate-900">
                        {table ? 'Editar Mesa' : 'Nueva Mesa'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Número de Mesa *
                        </label>
                        <input
                            type="number"
                            min="1"
                            value={tableNumber}
                            onChange={(e) => setTableNumber(e.target.value)}
                            placeholder="1, 2, 3..."
                            className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-4 ${isNumberTaken
                                ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                                : 'border-slate-200 focus:border-primary focus:ring-primary/10'
                                }`}
                        />
                        {isNumberTaken && (
                            <p className="text-red-500 text-xs mt-1">Este número ya está en uso</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Nombre <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Ventana, Terraza VIP..."
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Capacidad
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={capacity}
                                onChange={(e) => setCapacity(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Zona
                            </label>
                            <input
                                type="text"
                                value={zone}
                                onChange={(e) => setZone(e.target.value)}
                                placeholder="Terraza, Interior..."
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={() => onSave({
                            table_number: parseInt(tableNumber),
                            name: name || null,
                            capacity: parseInt(capacity) || 4,
                            zone: zone || null,
                        })}
                        disabled={!tableNumber || isNumberTaken || saving}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        {table ? 'Guardar' : 'Crear Mesa'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
