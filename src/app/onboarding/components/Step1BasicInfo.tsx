"use client";

import { Building2, Phone, Mail, Camera, FileText } from "lucide-react";
import { OnboardingFormData } from "../page";

interface Props {
    data: OnboardingFormData;
    onUpdate: (data: Partial<OnboardingFormData>) => void;
}

export function Step1BasicInfo({ data, onUpdate }: Props) {
    return (
        <div className="space-y-6">
            {/* Logo Upload */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-24 h-24 rounded-2xl bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center mb-3 overflow-hidden">
                    {data.logo_url ? (
                        <img src={data.logo_url} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                        <Camera size={32} className="text-slate-300" />
                    )}
                </div>
                <p className="text-xs text-slate-400 font-medium">Logo del negocio (opcional)</p>
            </div>

            {/* Restaurant Name */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                    <Building2 size={12} />
                    Nombre del negocio
                </label>
                <input
                    type="text"
                    value={data.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    placeholder="Ej: La Terraza de María"
                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-bold text-slate-900"
                />
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                    <FileText size={12} />
                    Descripción corta
                </label>
                <textarea
                    value={data.description}
                    onChange={(e) => onUpdate({ description: e.target.value })}
                    placeholder="Describe tu negocio en una línea..."
                    rows={2}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-medium text-slate-900 resize-none"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Phone */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                        <Phone size={12} />
                        Teléfono
                    </label>
                    <input
                        type="tel"
                        value={data.phone}
                        onChange={(e) => onUpdate({ phone: e.target.value })}
                        placeholder="+34 612 345 678"
                        className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-bold text-slate-900"
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 flex items-center gap-2">
                        <Mail size={12} />
                        Email de contacto
                    </label>
                    <input
                        type="email"
                        value={data.email}
                        onChange={(e) => onUpdate({ email: e.target.value })}
                        placeholder="contacto@tunegocio.com"
                        className="w-full h-14 px-5 rounded-2xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-primary transition-all outline-none font-bold text-slate-900"
                    />
                </div>
            </div>
        </div>
    );
}
