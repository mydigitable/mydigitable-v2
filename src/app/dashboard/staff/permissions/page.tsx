"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserCog, Shield, Loader2, Check, X } from "lucide-react";

const permissionGroups = [
    {
        name: 'Menú',
        permissions: [
            { id: 'menu.view', label: 'Ver menú' },
            { id: 'menu.edit', label: 'Editar productos' },
            { id: 'menu.delete', label: 'Eliminar productos' },
        ]
    },
    {
        name: 'Pedidos',
        permissions: [
            { id: 'orders.view', label: 'Ver pedidos' },
            { id: 'orders.manage', label: 'Gestionar pedidos' },
            { id: 'orders.cancel', label: 'Cancelar pedidos' },
        ]
    },
    {
        name: 'Configuración',
        permissions: [
            { id: 'settings.view', label: 'Ver configuración' },
            { id: 'settings.edit', label: 'Editar configuración' },
            { id: 'billing.manage', label: 'Gestionar facturación' },
        ]
    },
];

const roles = [
    { id: 'owner', name: 'Propietario', color: 'bg-purple-100 text-purple-700' },
    { id: 'manager', name: 'Manager', color: 'bg-blue-100 text-blue-700' },
    { id: 'waiter', name: 'Camarero', color: 'bg-green-100 text-green-700' },
    { id: 'cook', name: 'Cocinero', color: 'bg-orange-100 text-orange-700' },
    { id: 'cashier', name: 'Cajero', color: 'bg-amber-100 text-amber-700' },
];

export default function StaffPermissionsPage() {
    const [selectedRole, setSelectedRole] = useState('waiter');
    const [permissions, setPermissions] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Load default permissions for role
        const defaults: Record<string, boolean> = {};
        if (selectedRole === 'owner' || selectedRole === 'manager') {
            permissionGroups.forEach(g => g.permissions.forEach(p => defaults[p.id] = true));
        } else if (selectedRole === 'waiter') {
            defaults['menu.view'] = true;
            defaults['orders.view'] = true;
            defaults['orders.manage'] = true;
        } else if (selectedRole === 'cook') {
            defaults['menu.view'] = true;
            defaults['orders.view'] = true;
        }
        setPermissions(defaults);
    }, [selectedRole]);

    const togglePermission = (id: string) => {
        setPermissions(prev => ({ ...prev, [id]: !prev[id] }));
    };

    return (
        <div className="p-6 lg:p-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Permisos del Personal</h1>
                <p className="text-slate-500 mt-1">Configura qué puede hacer cada rol</p>
            </div>

            {/* Role Selector */}
            <div className="flex flex-wrap gap-2 mb-8">
                {roles.map((role) => (
                    <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={`px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${selectedRole === role.id
                                ? `${role.color} ring-2 ring-offset-2 ring-current`
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                    >
                        {role.name}
                    </button>
                ))}
            </div>

            {/* Permissions Grid */}
            <div className="space-y-6">
                {permissionGroups.map((group) => (
                    <div key={group.name} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
                            <h3 className="font-bold text-slate-900">{group.name}</h3>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {group.permissions.map((perm) => (
                                <div key={perm.id} className="flex items-center justify-between px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Shield size={18} className="text-slate-400" />
                                        <span className="text-slate-700">{perm.label}</span>
                                    </div>
                                    <button
                                        onClick={() => togglePermission(perm.id)}
                                        disabled={selectedRole === 'owner'}
                                        className={`w-12 h-7 rounded-full transition-colors relative ${permissions[perm.id] ? 'bg-primary' : 'bg-slate-200'
                                            } ${selectedRole === 'owner' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${permissions[perm.id] ? 'translate-x-6' : 'translate-x-1'
                                            }`} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {selectedRole === 'owner' && (
                <p className="mt-4 text-sm text-slate-500 text-center">
                    Los propietarios tienen todos los permisos habilitados y no se pueden modificar
                </p>
            )}
        </div>
    );
}
