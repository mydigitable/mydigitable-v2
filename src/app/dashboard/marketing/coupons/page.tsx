"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { Ticket, Plus, Search, Copy, Trash2, Edit2, Loader2, Check, X } from "lucide-react";

interface Coupon {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    min_order: number | null;
    max_uses: number | null;
    current_uses: number;
    is_active: boolean;
    end_date: string | null;
}

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const supabase = createClient();

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: restaurant } = await supabase
            .from("restaurants")
            .select("id")
            .eq("owner_id", user.id)
            .order("created_at", { ascending: true })
            .limit(1)
            .single();

        if (restaurant) {
            const { data } = await supabase
                .from("promotions")
                .select("*")
                .eq("restaurant_id", restaurant.id)
                .not("code", "is", null)
                .order("created_at", { ascending: false });

            if (data) setCoupons(data as any);
        }
        setLoading(false);
    };

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code);
    };

    const filteredCoupons = coupons.filter(c =>
        c.code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Cupones</h1>
                    <p className="text-slate-500 mt-1">Crea códigos de descuento para tus clientes</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors">
                    <Plus size={18} />
                    Nuevo Cupón
                </button>
            </div>

            <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar cupones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                />
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : filteredCoupons.length === 0 ? (
                <div className="text-center py-20">
                    <Ticket className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Sin cupones</h3>
                    <p className="text-slate-500 mb-6">Crea tu primer cupón de descuento</p>
                    <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl font-bold transition-colors">
                        Crear cupón
                    </button>
                </div>
            ) : (
                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Código</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Descuento</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Usos</th>
                                <th className="text-left px-6 py-4 text-xs font-bold text-slate-500 uppercase">Estado</th>
                                <th className="text-right px-6 py-4 text-xs font-bold text-slate-500 uppercase">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredCoupons.map((coupon) => (
                                <tr key={coupon.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <code className="px-2 py-1 bg-slate-100 rounded font-mono text-sm">{coupon.code}</code>
                                            <button onClick={() => copyCode(coupon.code)} className="p-1 hover:bg-slate-100 rounded">
                                                <Copy size={14} className="text-slate-400" />
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold">
                                        {coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value}€`}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {coupon.current_uses} / {coupon.max_uses || '∞'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${coupon.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {coupon.is_active ? 'Activo' : 'Inactivo'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 hover:bg-slate-100 rounded-lg"><Edit2 size={16} /></button>
                                        <button className="p-2 hover:bg-red-50 rounded-lg"><Trash2 size={16} className="text-red-500" /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

