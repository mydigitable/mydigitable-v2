"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import {
    Users,
    UserPlus,
    Edit3,
    Trash2,
    Check,
    X,
    Loader2,
    Shield,
    ChefHat,
    Bike,
    User,
    Mail,
    Phone,
    Key,
    Eye,
    EyeOff,
    Crown,
} from "lucide-react";

interface StaffMember {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    pin: string | null;
    role: 'owner' | 'manager' | 'waiter' | 'cook' | 'delivery' | 'cashier';
    avatar_url: string | null;
    is_active: boolean;
    last_activity: string | null;
    created_at: string;
}

const roles = [
    { value: 'owner', label: 'Propietario', icon: Crown, color: 'bg-amber-500', description: 'Acceso completo' },
    { value: 'manager', label: 'Gerente', icon: Shield, color: 'bg-purple-500', description: 'Gestión completa excepto facturación' },
    { value: 'waiter', label: 'Camarero', icon: User, color: 'bg-blue-500', description: 'Pedidos y llamadas' },
    { value: 'cook', label: 'Cocinero', icon: ChefHat, color: 'bg-orange-500', description: 'Vista cocina KDS' },
    { value: 'delivery', label: 'Repartidor', icon: Bike, color: 'bg-green-500', description: 'Pedidos delivery' },
    { value: 'cashier', label: 'Cajero', icon: User, color: 'bg-pink-500', description: 'Cobros y cierre' },
];

export default function StaffPage() {
    const [staff, setStaff] = useState<StaffMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
    const [restaurant, setRestaurant] = useState<any>(null);

    const supabase = createClient();

    useEffect(() => {
        loadStaff();
    }, []);

    const loadStaff = async () => {
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

            const { data: staffData } = await supabase
                .from("staff")
                .select("*")
                .eq("restaurant_id", restaurantData.id)
                .order("created_at");

            setStaff(staffData || []);
        } catch (err) {
            console.error("Error loading staff:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveMember = async (data: Partial<StaffMember>) => {
        if (!restaurant) return;

        setSaving(true);
        try {
            if (editingMember) {
                await supabase
                    .from("staff")
                    .update({
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                        pin: data.pin,
                        role: data.role,
                    })
                    .eq("id", editingMember.id);
            } else {
                await supabase
                    .from("staff")
                    .insert({
                        restaurant_id: restaurant.id,
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                        pin: data.pin,
                        role: data.role || 'waiter',
                        is_active: true,
                    });
            }

            await loadStaff();
            setShowAddModal(false);
            setEditingMember(null);
        } catch (err) {
            console.error("Error saving staff member:", err);
        } finally {
            setSaving(false);
        }
    };

    const toggleMemberActive = async (memberId: string, isActive: boolean) => {
        await supabase
            .from("staff")
            .update({ is_active: isActive })
            .eq("id", memberId);
        loadStaff();
    };

    const deleteMember = async (memberId: string) => {
        if (!confirm('¿Eliminar este miembro del equipo?')) return;
        await supabase.from("staff").delete().eq("id", memberId);
        loadStaff();
    };

    const getRoleInfo = (role: string) => {
        return roles.find(r => r.value === role) || roles[2]; // Default to waiter
    };

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
                    <h1 className="text-2xl font-black text-slate-900">Equipo</h1>
                    <p className="text-sm text-slate-500">
                        Gestiona empleados y permisos de acceso
                    </p>
                </div>
                <button
                    onClick={() => {
                        setEditingMember(null);
                        setShowAddModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-primary/20"
                >
                    <UserPlus size={18} />
                    Añadir Empleado
                </button>
            </div>

            {/* Role Legend */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-6">
                <p className="text-sm font-bold text-slate-700 mb-3">Roles disponibles</p>
                <div className="flex flex-wrap gap-2">
                    {roles.map((role) => (
                        <div key={role.value} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg">
                            <div className={`w-6 h-6 rounded-md ${role.color} flex items-center justify-center`}>
                                <role.icon size={14} className="text-white" />
                            </div>
                            <span className="text-sm font-medium text-slate-700">{role.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Staff List */}
            {staff.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                        <Users size={28} className="text-slate-300" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Sin empleados</h2>
                    <p className="text-slate-500 mb-6 max-w-md mx-auto">
                        Añade empleados para que puedan acceder al sistema con sus propios permisos
                    </p>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors"
                    >
                        <UserPlus size={18} />
                        Añadir Primer Empleado
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {staff.map((member) => {
                        const roleInfo = getRoleInfo(member.role);
                        return (
                            <motion.div
                                key={member.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`bg-white rounded-2xl border-2 overflow-hidden transition-colors ${member.is_active ? 'border-slate-100' : 'border-slate-200 opacity-60'
                                    }`}
                            >
                                <div className="p-5">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl ${roleInfo.color} flex items-center justify-center`}>
                                            {member.avatar_url ? (
                                                <img src={member.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                                            ) : (
                                                <roleInfo.icon size={24} className="text-white" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-slate-900">{member.name}</h3>
                                            <p className="text-sm text-slate-500 capitalize">{roleInfo.label}</p>
                                        </div>

                                        {!member.is_active && (
                                            <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase">
                                                Inactivo
                                            </span>
                                        )}
                                    </div>

                                    <div className="mt-4 space-y-2">
                                        {member.email && (
                                            <p className="text-sm text-slate-600 flex items-center gap-2">
                                                <Mail size={14} className="text-slate-400" />
                                                {member.email}
                                            </p>
                                        )}
                                        {member.phone && (
                                            <p className="text-sm text-slate-600 flex items-center gap-2">
                                                <Phone size={14} className="text-slate-400" />
                                                {member.phone}
                                            </p>
                                        )}
                                        {member.pin && (
                                            <p className="text-sm text-slate-600 flex items-center gap-2">
                                                <Key size={14} className="text-slate-400" />
                                                PIN: ****
                                            </p>
                                        )}
                                    </div>

                                    {member.last_activity && (
                                        <p className="text-xs text-slate-400 mt-3">
                                            Última actividad: {new Date(member.last_activity).toLocaleDateString('es-ES')}
                                        </p>
                                    )}
                                </div>

                                <div className="px-5 py-3 bg-slate-50 flex items-center justify-between">
                                    <button
                                        onClick={() => toggleMemberActive(member.id, !member.is_active)}
                                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors ${member.is_active ? 'text-green-600' : 'text-slate-400'
                                            }`}
                                    >
                                        {member.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
                                        {member.is_active ? 'Activo' : 'Inactivo'}
                                    </button>

                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                setEditingMember(member);
                                                setShowAddModal(true);
                                            }}
                                            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                                            title="Editar"
                                        >
                                            <Edit3 size={14} className="text-slate-400" />
                                        </button>
                                        {member.role !== 'owner' && (
                                            <button
                                                onClick={() => deleteMember(member.id)}
                                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Eliminar"
                                            >
                                                <Trash2 size={14} className="text-red-400" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Add/Edit Modal */}
            <AnimatePresence>
                {showAddModal && (
                    <StaffModal
                        member={editingMember}
                        saving={saving}
                        onSave={handleSaveMember}
                        onClose={() => {
                            setShowAddModal(false);
                            setEditingMember(null);
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

// Staff Modal Component
function StaffModal({
    member,
    saving,
    onSave,
    onClose,
}: {
    member: StaffMember | null;
    saving: boolean;
    onSave: (data: Partial<StaffMember>) => void;
    onClose: () => void;
}) {
    const [name, setName] = useState(member?.name || '');
    const [email, setEmail] = useState(member?.email || '');
    const [phone, setPhone] = useState(member?.phone || '');
    const [pin, setPin] = useState(member?.pin || '');
    const [role, setRole] = useState(member?.role || 'waiter');
    const [showPin, setShowPin] = useState(false);

    const generatePin = () => {
        const newPin = Math.floor(1000 + Math.random() * 9000).toString();
        setPin(newPin);
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
                className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
                    <h2 className="text-xl font-black text-slate-900">
                        {member ? 'Editar Empleado' : 'Nuevo Empleado'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-xl">
                        <X size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6 overflow-y-auto flex-1">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            Nombre *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nombre del empleado"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                        />
                    </div>

                    {/* Role */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-3">
                            Rol *
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            {roles.filter(r => r.value !== 'owner').map((r) => (
                                <button
                                    key={r.value}
                                    onClick={() => setRole(r.value as any)}
                                    className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${role === r.value
                                        ? 'border-primary bg-primary/5'
                                        : 'border-slate-100 hover:border-slate-200'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg ${r.color} flex items-center justify-center`}>
                                        <r.icon size={16} className="text-white" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900">{r.label}</p>
                                        <p className="text-[10px] text-slate-500">{r.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="email@ejemplo.com"
                                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">
                                Teléfono
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

                    {/* PIN */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">
                            PIN de acceso
                        </label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <input
                                    type={showPin ? 'text' : 'password'}
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                                    placeholder="****"
                                    maxLength={4}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 font-mono tracking-widest"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPin(!showPin)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                >
                                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <button
                                type="button"
                                onClick={generatePin}
                                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-bold text-slate-600 transition-colors"
                            >
                                Generar
                            </button>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                            PIN de 4 dígitos para acceso rápido al sistema
                        </p>
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
                        onClick={() => onSave({
                            name,
                            email: email || null,
                            phone: phone || null,
                            pin: pin || null,
                            role: role as any,
                        })}
                        disabled={!name || saving}
                        className="px-6 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                        {member ? 'Guardar' : 'Añadir Empleado'}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
