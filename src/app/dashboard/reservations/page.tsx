"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Plus,
    Calendar,
    Clock,
    Users,
    Phone,
    Mail,
    Edit3,
    Trash2,
    Check,
    X,
    Loader2,
    Search,
    Filter,
    ChevronDown,
    Baby,
    Cake,
    Heart,
    Dog,
    AlertTriangle,
    Accessibility,
    MessageSquare,
} from "lucide-react";

interface Reservation {
    id: string;
    restaurant_id: string;
    customer_name: string;
    customer_phone: string;
    customer_email: string | null;
    date: string;
    time: string;
    party_size: number;
    table_id: string | null;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
    notes: string | null;
    special_requests: string[];
    allergy_notes: string | null;
    created_at: string;
}

interface Table {
    id: string;
    table_number: number;
    name: string | null;
    capacity: number;
}

const statusConfig = {
    pending: { label: 'Pendiente', color: 'bg-amber-100 text-amber-700', dotColor: 'bg-amber-500' },
    confirmed: { label: 'Confirmada', color: 'bg-green-100 text-green-700', dotColor: 'bg-green-500' },
    cancelled: { label: 'Cancelada', color: 'bg-red-100 text-red-700', dotColor: 'bg-red-500' },
    completed: { label: 'Completada', color: 'bg-slate-100 text-slate-600', dotColor: 'bg-slate-400' },
    no_show: { label: 'No Show', color: 'bg-slate-900 text-white', dotColor: 'bg-slate-900' },
};

const specialRequestOptions = [
    { id: 'baby_chair', label: 'Silla de bebé', emoji: '👶', icon: Baby },
    { id: 'high_chair', label: 'Trona', emoji: '🪑', icon: Baby },
    { id: 'accessible', label: 'Mesa accesible', emoji: '♿', icon: Accessibility },
    { id: 'birthday', label: 'Cumpleaños', emoji: '🎂', icon: Cake },
    { id: 'anniversary', label: 'Aniversario', emoji: '💍', icon: Heart },
    { id: 'pet', label: 'Mascota', emoji: '🐕', icon: Dog },
    { id: 'quiet_area', label: 'Zona tranquila', emoji: '🤫', icon: MessageSquare },
    { id: 'allergies', label: 'Alergias', emoji: '⚠️', icon: AlertTriangle },
];

export default function ReservationsPage() {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);
    const [restaurant, setRestaurant] = useState<any>(null);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const supabase = createClient();

    useEffect(() => {
        loadData();
    }, [selectedDate]);

    const loadData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get restaurant using safe pattern
            const { data: restaurants } = await supabase
                .from("restaurants")
                .select("*")
                .eq("owner_id", user.id)
                .order("created_at", { ascending: true });

            const restaurantData = restaurants?.[0] || null;
            if (!restaurantData) return;
            setRestaurant(restaurantData);

            // Load reservations for selected date
            const { data: reservationsData } = await supabase
                .from("reservations")
                .select("*")
                .eq("restaurant_id", restaurantData.id)
                .eq("date", selectedDate)
                .order("time", { ascending: true });

            setReservations(reservationsData || []);

            // Load tables
            const { data: tablesData } = await supabase
                .from("tables")
                .select("id, table_number, name, capacity")
                .eq("restaurant_id", restaurantData.id)
                .order("table_number");

            setTables(tablesData || []);
        } catch (err) {
            console.error("Error loading data:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveReservation = async (data: Partial<Reservation>) => {
        if (!restaurant) return;

        setSaving(true);
        try {
            if (editingReservation) {
                await supabase
                    .from("reservations")
                    .update({
                        ...data,
                        updated_at: new Date().toISOString(),
                    })
                    .eq("id", editingReservation.id);
            } else {
                await supabase
                    .from("reservations")
                    .insert({
                        restaurant_id: restaurant.id,
                        ...data,
                        status: 'pending',
                    });
            }

            await loadData();
            setShowModal(false);
            setEditingReservation(null);
        } catch (err) {
            console.error("Error saving reservation:", err);
        } finally {
            setSaving(false);
        }
    };

    const updateStatus = async (reservationId: string, status: string) => {
        await supabase
            .from("reservations")
            .update({ status })
            .eq("id", reservationId);
        loadData();
    };

    const deleteReservation = async (id: string) => {
        if (!confirm('¿Eliminar esta reserva?')) return;
        await supabase.from("reservations").delete().eq("id", id);
        loadData();
    };

    const filteredReservations = reservations.filter(r => {
        const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
        const matchesSearch = !searchTerm ||
            r.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.customer_phone.includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

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
                    <h1 className="text-2xl font-black text-slate-900">Reservas</h1>
                    <p className="text-sm text-slate-500">
                        Gestiona las reservas de tu restaurante
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingReservation(null);
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-primary/20"
                >
                    <Plus size={18} />
                    Nueva Reserva
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                    {/* Date Picker */}
                    <div className="flex items-center gap-2">
                        <Calendar size={18} className="text-slate-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="appearance-none px-4 py-2 pr-10 border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-white"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="pending">Pendientes</option>
                            <option value="confirmed">Confirmadas</option>
                            <option value="cancelled">Canceladas</option>
                            <option value="completed">Completadas</option>
                            <option value="no_show">No Show</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>

                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o teléfono..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-primary"
                        />
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                {Object.entries(statusConfig).map(([status, config]) => {
                    const count = reservations.filter(r => r.status === status).length;
                    return (
                        <div key={status} className="bg-white rounded-xl border border-slate-100 p-4">
                            <div className="flex items-center gap-2 mb-1">
                                <div className={`w-2 h-2 rounded-full ${config.dotColor}`} />
                                <span className="text-xs font-medium text-slate-500">{config.label}</span>
                            </div>
                            <p className="text-2xl font-black text-slate-900">{count}</p>
                        </div>
                    );
                })}
            </div>

            {/* Reservations List */}
            {filteredReservations.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Calendar size={28} className="text-slate-300" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Sin reservas</h2>
                    <p className="text-slate-500 mb-6">
                        No hay reservas para {new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors"
                    >
                        <Plus size={18} />
                        Crear Reserva
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Hora</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Cliente</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Personas</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Mesa</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Especial</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredReservations.map((reservation) => {
                                const status = statusConfig[reservation.status];
                                const table = tables.find(t => t.id === reservation.table_id);
                                return (
                                    <tr key={reservation.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Clock size={14} className="text-slate-400" />
                                                <span className="font-bold text-slate-900">{reservation.time}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div>
                                                <p className="font-bold text-slate-900">{reservation.customer_name}</p>
                                                <p className="text-sm text-slate-500">{reservation.customer_phone}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Users size={14} className="text-slate-400" />
                                                <span className="font-medium">{reservation.party_size}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            {table ? (
                                                <span className="px-2 py-1 bg-slate-100 rounded-lg text-sm font-medium">
                                                    Mesa {table.table_number}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 text-sm">Sin asignar</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${status.color}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1">
                                                {(reservation.special_requests || []).slice(0, 3).map((req) => {
                                                    const option = specialRequestOptions.find(o => o.id === req);
                                                    return option ? (
                                                        <span key={req} title={option.label} className="text-lg">
                                                            {option.emoji}
                                                        </span>
                                                    ) : null;
                                                })}
                                                {(reservation.special_requests || []).length > 3 && (
                                                    <span className="text-xs text-slate-400">
                                                        +{reservation.special_requests.length - 3}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {reservation.status === 'pending' && (
                                                    <button
                                                        onClick={() => updateStatus(reservation.id, 'confirmed')}
                                                        className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Confirmar"
                                                    >
                                                        <Check size={16} className="text-green-500" />
                                                    </button>
                                                )}
                                                {reservation.status === 'confirmed' && (
                                                    <button
                                                        onClick={() => updateStatus(reservation.id, 'completed')}
                                                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                        title="Completar"
                                                    >
                                                        <Check size={16} className="text-slate-500" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        setEditingReservation(reservation);
                                                        setShowModal(true);
                                                    }}
                                                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit3 size={16} className="text-slate-400" />
                                                </button>
                                                {reservation.status !== 'cancelled' && (
                                                    <button
                                                        onClick={() => updateStatus(reservation.id, 'cancelled')}
                                                        className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Cancelar"
                                                    >
                                                        <X size={16} className="text-red-400" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => deleteReservation(reservation.id)}
                                                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Eliminar"
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
                {showModal && (
                    <ReservationModal
                        reservation={editingReservation}
                        tables={tables}
                        saving={saving}
                        selectedDate={selectedDate}
                        onSave={handleSaveReservation}
                        onClose={() => {
                            setShowModal(false);
                            setEditingReservation(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Reservation Modal Component
function ReservationModal({
    reservation,
    tables,
    saving,
    selectedDate,
    onSave,
    onClose,
}: {
    reservation: Reservation | null;
    tables: Table[];
    saving: boolean;
    selectedDate: string;
    onSave: (data: Partial<Reservation>) => void;
    onClose: () => void;
}) {
    const [name, setName] = useState(reservation?.customer_name || '');
    const [phone, setPhone] = useState(reservation?.customer_phone || '');
    const [email, setEmail] = useState(reservation?.customer_email || '');
    const [date, setDate] = useState(reservation?.date || selectedDate);
    const [time, setTime] = useState(reservation?.time || '13:00');
    const [partySize, setPartySize] = useState(reservation?.party_size?.toString() || '2');
    const [tableId, setTableId] = useState(reservation?.table_id || '');
    const [notes, setNotes] = useState(reservation?.notes || '');
    const [specialRequests, setSpecialRequests] = useState<string[]>(reservation?.special_requests || []);
    const [allergyNotes, setAllergyNotes] = useState(reservation?.allergy_notes || '');
    const [showAllergies, setShowAllergies] = useState(specialRequests.includes('allergies'));

    const toggleRequest = (id: string) => {
        if (id === 'allergies') {
            setShowAllergies(!showAllergies);
        }
        setSpecialRequests(prev =>
            prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
        );
    };

    const handleSubmit = () => {
        if (!name || !phone || !date || !time) {
            alert('Por favor completa los campos obligatorios');
            return;
        }

        onSave({
            customer_name: name,
            customer_phone: phone,
            customer_email: email || null,
            date,
            time,
            party_size: parseInt(partySize),
            table_id: tableId || null,
            notes: notes || null,
            special_requests: specialRequests,
            allergy_notes: showAllergies ? allergyNotes : null,
        });
    };

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
                className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-xl font-black text-slate-900">
                        {reservation ? 'Editar Reserva' : 'Nueva Reserva'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Customer Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Nombre *
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Nombre del cliente"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Teléfono *
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+34 600 000 000"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Email <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="email@ejemplo.com"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                        />
                    </div>

                    {/* Date, Time, Party Size */}
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Fecha *
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Hora *
                            </label>
                            <input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Personas *
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={partySize}
                                onChange={(e) => setPartySize(e.target.value)}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>
                    </div>

                    {/* Table Selection */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Mesa <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <select
                            value={tableId}
                            onChange={(e) => setTableId(e.target.value)}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary bg-white"
                        >
                            <option value="">Sin asignar</option>
                            {tables.map((table) => (
                                <option key={table.id} value={table.id}>
                                    Mesa {table.table_number} {table.name ? `- ${table.name}` : ''} (cap. {table.capacity})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Special Requests */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">
                            Peticiones Especiales
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {specialRequestOptions.map((option) => (
                                <button
                                    key={option.id}
                                    onClick={() => toggleRequest(option.id)}
                                    className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all text-left ${specialRequests.includes(option.id)
                                            ? 'border-primary bg-primary/5'
                                            : 'border-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    <span className="text-xl">{option.emoji}</span>
                                    <span className="text-xs font-medium text-slate-700 leading-tight">{option.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Allergy Notes */}
                    {showAllergies && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                        >
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Detalles de Alergias
                            </label>
                            <textarea
                                value={allergyNotes}
                                onChange={(e) => setAllergyNotes(e.target.value)}
                                placeholder="Describe las alergias del cliente..."
                                rows={2}
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
                            />
                        </motion.div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Notas <span className="text-slate-400 font-normal">(opcional)</span>
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Notas adicionales sobre la reserva..."
                            rows={2}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 flex justify-end gap-3 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving || !name || !phone}
                        className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors ${name && phone
                                ? 'bg-primary text-white hover:bg-primary/90'
                                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            } ${saving ? 'opacity-50' : ''}`}
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        {reservation ? 'Guardar Cambios' : 'Crear Reserva'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
